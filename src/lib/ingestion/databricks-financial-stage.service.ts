// Financial staging service — Databricks-backed Delta load (Sprint 11A.7).
//
// Implements the same FinancialStage interface as InMemoryFinancialStage,
// persisting canonical financial records into `nexora.finance.fact_transactions`
// (the central fact table read by every dashboard, KPI, agent, and risk query)
// via the shared dbQuery() seam. This is the final step of the ingestion
// pipeline: validated upload → transform → STAGE → fact_transactions.
//
// Design (mirrors DatabricksUploadHistory, Sprint 11A.4):
//   • INSERT-ONLY. No MERGE / UPDATE / DELETE / TRUNCATE. Existing seeded/demo
//     rows are never read, overwritten, or removed (they carry upload_id IS NULL;
//     this loader only ever appends rows that carry a non-null upload_id).
//   • Databricks-first with an injected in-memory fallback. On ANY error
//     (warehouse unreachable, fact_transactions / lineage columns missing, query
//     failure), it logs a warning and delegates the SAME batch to the in-memory
//     stage so the upload endpoint never breaks. The fallback is injected (not
//     imported) to avoid a circular dependency on the resolver.
//   • Lineage columns (upload_id, source_file, source_type, ingested_at) are
//     added by migrations/004-fact-transactions-ingest-lineage.sql. Until that
//     migration runs, the INSERT fails and we fall back — same contract as 11A.4.
//
// Column mapping is documented in migration 004's header and in mapValues() below.

import type {
  CanonicalFinancialRecord,
  FinancialStage,
  StageOutcome,
  UploadStageSummary,
} from "./financial-stage.types";
import { dbQuery } from "@/lib/databricks";
import { DEFAULT_CLIENT_ID } from "@/config/client.resolver";

// Qualified table name. Mirrors the adapter's catalog/schema env defaults so the
// reference is independent of the session's initial catalog/schema.
const CATALOG = process.env.DATABRICKS_CATALOG ?? "nexora";
const SCHEMA = process.env.DATABRICKS_SCHEMA ?? "finance";
const TABLE = `${CATALOG}.${SCHEMA}.fact_transactions`;

// Marks every row written through the ingestion-upload pipeline (vs the seeded
// 'static' rows or the legacy gl-export / payroll / quickbooks / stripe sources).
const SOURCE_SYSTEM = "upload";

// Rows per INSERT statement — bounds the parameter count per request.
const CHUNK = 500;

// source_type (canonical DataType) → fact_transactions.transaction_type.
// The dashboard/KPI queries filter `transaction_type IN ('actual','budget')`,
// so each type is stamped with its honest financial nature: actuals/spend land
// as 'actual', plans/budgets/salary as 'budget', forecast as 'forecast'.
const TRANSACTION_TYPE: Record<string, string> = {
  "gl-actuals": "actual",
  budget: "budget",
  forecast: "forecast",
  headcount: "budget",
  vendors: "actual",
  "external-labor": "actual",
};

function transactionType(sourceType: string): string {
  return TRANSACTION_TYPE[sourceType] ?? "actual";
}

// ── Coercion helpers (Databricks returns BIGINT/DOUBLE/TIMESTAMP loosely) ──
function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function str(v: unknown): string {
  return v === null || v === undefined ? "" : String(v);
}

/** A fact_transactions row → CanonicalFinancialRecord (best-effort; account_code
 *  and entity_name are not stored in the fact table, so they come back empty). */
function rowToCanonical(r: Record<string, unknown>): CanonicalFinancialRecord {
  return {
    upload_id: str(r.upload_id),
    source_type: str(r.source_type),
    source_file: str(r.source_file),
    client_id: str(r.client_id),
    period: str(r.period),
    cost_center: str(r.cost_center_id),
    cost_center_name: str(r.cost_center_name),
    business_unit: str(r.business_unit),
    category: str(r.category),
    account_code: "",
    amount_actual: num(r.amount_actual),
    amount_budget: num(r.amount_budget),
    amount_forecast: num(r.amount_forecast),
    entity_id: str(r.vendor_id),
    entity_name: "",
  };
}

export class DatabricksFinancialStage implements FinancialStage {
  constructor(private readonly fallback: FinancialStage) {}

  private warn(op: string, err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[financial-stage] Databricks ${op} failed; falling back to in-memory stage: ${msg}`
    );
    return msg;
  }

  /**
   * Stage a batch into fact_transactions. Rows missing period or cost_center are
   * rejected up-front (same rule as the in-memory stage). On Databricks failure,
   * the FULL batch is handed to the in-memory fallback (which re-applies the same
   * rule), and the outcome is annotated with backend "in-memory" + a warning.
   */
  async stage(records: CanonicalFinancialRecord[]): Promise<StageOutcome> {
    const valid = records.filter((r) => r.period && r.cost_center);
    const rejected = records.length - valid.length;

    if (valid.length === 0) {
      return { staged: 0, rejected, backend: "databricks" };
    }

    try {
      for (let i = 0; i < valid.length; i += CHUNK) {
        await this.insertChunk(valid.slice(i, i + CHUNK));
      }
      return { staged: valid.length, rejected, backend: "databricks" };
    } catch (err) {
      const msg = this.warn("stage", err);
      const fb = await this.fallback.stage(records);
      return {
        ...fb,
        backend: "in-memory",
        warnings: [
          ...(fb.warnings ?? []),
          `Databricks fact_transactions load failed; used in-memory fallback: ${msg}`,
        ],
      };
    }
  }

  /** INSERT one chunk of canonical records into fact_transactions (append-only). */
  private async insertChunk(rows: CanonicalFinancialRecord[]): Promise<void> {
    // 18 bound params per row; ingested_at uses current_timestamp() (no param).
    const rowSql =
      "(?, CAST(? AS DATE), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, current_timestamp())";
    const valuesSql = rows.map(() => rowSql).join(",\n");
    const params: unknown[] = [];
    rows.forEach((r, i) => params.push(...this.mapValues(r, i)));

    await dbQuery(
      `INSERT INTO ${TABLE}
         (transaction_id, date, period, cost_center_id, cost_center_name,
          vendor_id, category, subcategory, business_unit,
          amount_actual, amount_budget, amount_forecast,
          transaction_type, source_system, client_id,
          upload_id, source_file, source_type, ingested_at)
       VALUES\n${valuesSql}`,
      params
    );
  }

  /** Canonical record → the ordered param list for one VALUES row. */
  private mapValues(r: CanonicalFinancialRecord, idx: number): unknown[] {
    const transactionId = `${r.upload_id}-${String(idx).padStart(6, "0")}`;
    const date = `${r.period}-01`; // first of the fiscal month; CAST AS DATE in SQL
    // vendor_id is a nullable FK; only the vendors type carries a real vendor id.
    const vendorId = r.source_type === "vendors" ? r.entity_id : "";
    return [
      transactionId,
      date,
      r.period,
      r.cost_center,
      r.cost_center_name,
      vendorId,
      r.category,
      "", // subcategory — not modeled in the canonical record
      r.business_unit,
      r.amount_actual,
      r.amount_budget,
      r.amount_forecast,
      transactionType(r.source_type),
      SOURCE_SYSTEM,
      r.client_id,
      r.upload_id,
      r.source_file,
      r.source_type,
    ];
  }

  async getByUpload(uploadId: string): Promise<CanonicalFinancialRecord[]> {
    try {
      const res = await dbQuery<Record<string, unknown>>(
        `SELECT period, cost_center_id, cost_center_name, business_unit, category,
                amount_actual, amount_budget, amount_forecast,
                vendor_id, upload_id, source_file, source_type, client_id
         FROM ${TABLE}
         WHERE upload_id = ? AND client_id = ?`,
        [uploadId, DEFAULT_CLIENT_ID]
      );
      return res.rows.map(rowToCanonical);
    } catch (err) {
      this.warn("getByUpload", err);
      return this.fallback.getByUpload(uploadId);
    }
  }

  async count(): Promise<number> {
    try {
      const res = await dbQuery<{ n: unknown }>(
        `SELECT COUNT(*) AS n FROM ${TABLE}
         WHERE upload_id IS NOT NULL AND client_id = ?`,
        [DEFAULT_CLIENT_ID]
      );
      return num(res.rows[0]?.n);
    } catch (err) {
      this.warn("count", err);
      return this.fallback.count();
    }
  }

  async listUploadSummaries(): Promise<UploadStageSummary[]> {
    try {
      const res = await dbQuery<Record<string, unknown>>(
        `SELECT upload_id, source_type, source_file, COUNT(*) AS n
         FROM ${TABLE}
         WHERE upload_id IS NOT NULL AND client_id = ?
         GROUP BY upload_id, source_type, source_file`,
        [DEFAULT_CLIENT_ID]
      );
      return res.rows.map((r) => ({
        uploadId: str(r.upload_id),
        sourceType: str(r.source_type),
        sourceFile: str(r.source_file),
        count: num(r.n),
      }));
    } catch (err) {
      this.warn("listUploadSummaries", err);
      return this.fallback.listUploadSummaries();
    }
  }
}
