// Durable upload history — Databricks-backed store (Sprint 11A.4).
//
// Implements the same UploadHistoryStore interface as InMemoryUploadHistory,
// persisting upload metadata to `nexora.finance.ingest_upload_history`
// (see migrations/003-ingest-upload-history.sql) via the shared dbQuery() seam.
//
// Resilience: every method tries Databricks first and, on ANY error (warehouse
// unreachable, table missing, query failure), logs a warning and delegates to an
// injected in-memory fallback so the upload endpoint never breaks. The fallback
// is injected (not imported) to keep this module free of a circular dependency
// on the resolver. NO financial fact rows are written here.

import type {
  StagedUpload,
  NewUploadInput,
  UploadStatus,
  UploadHistoryStore,
} from "./staging.types";
import { generateUploadId } from "./upload-history.service";
import { dbQuery } from "@/lib/databricks";

// Qualified table name. Mirrors the adapter's catalog/schema env defaults so the
// reference is independent of the session's initial catalog/schema.
const CATALOG = process.env.DATABRICKS_CATALOG ?? "nexora";
const SCHEMA = process.env.DATABRICKS_SCHEMA ?? "finance";
const TABLE = `${CATALOG}.${SCHEMA}.ingest_upload_history`;

// ── Coercion helpers (Databricks may return BIGINT/BOOLEAN/TIMESTAMP loosely) ──
function num(v: unknown): number {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function bool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  const s = String(v ?? "").toLowerCase();
  return s === "true" || s === "1" || s === "t";
}
function toIso(v: unknown): string {
  if (v instanceof Date) return v.toISOString();
  const s = String(v ?? "");
  if (!s) return "";
  const d = new Date(s.includes("T") ? s : s.replace(" ", "T"));
  return isNaN(d.getTime()) ? s : d.toISOString();
}

function rowToStagedUpload(r: Record<string, unknown>): StagedUpload {
  return {
    uploadId: String(r.upload_id ?? ""),
    clientId: String(r.client_id ?? ""),
    fileName: String(r.file_name ?? ""),
    fileType: String(r.file_type ?? "csv") as StagedUpload["fileType"],
    dataType: String(r.data_type ?? "") as StagedUpload["dataType"],
    period: String(r.period ?? ""),
    uploadedAt: toIso(r.uploaded_at),
    rowCount: num(r.row_count),
    columnCount: num(r.column_count),
    validationStatus: String(r.validation_status ?? "pass") as StagedUpload["validationStatus"],
    errorCount: num(r.error_count),
    warningCount: num(r.warning_count),
    readyForStaging: bool(r.ready_for_staging),
    status: String(r.status ?? "uploaded") as UploadStatus,
  };
}

export class DatabricksUploadHistory implements UploadHistoryStore {
  constructor(private readonly fallback: UploadHistoryStore) {}

  private warn(op: string, err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[upload-history] Databricks ${op} failed; falling back to in-memory store: ${msg}`
    );
  }

  async addUpload(input: NewUploadInput): Promise<StagedUpload> {
    const record: StagedUpload = {
      ...input,
      uploadId: generateUploadId(),
      uploadedAt: new Date().toISOString(),
      status: "uploaded",
    };
    try {
      await dbQuery(
        `INSERT INTO ${TABLE}
           (upload_id, client_id, file_name, file_type, data_type, period,
            uploaded_at, row_count, column_count, validation_status,
            error_count, warning_count, ready_for_staging, status,
            created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, current_timestamp(), ?, ?, ?, ?, ?, ?, ?, current_timestamp(), current_timestamp())`,
        [
          record.uploadId, record.clientId, record.fileName, record.fileType,
          record.dataType, record.period, record.rowCount, record.columnCount,
          record.validationStatus, record.errorCount, record.warningCount,
          record.readyForStaging, record.status,
        ]
      );
      return record;
    } catch (err) {
      this.warn("addUpload", err);
      return this.fallback.addUpload(input);
    }
  }

  async getUpload(uploadId: string, clientId: string): Promise<StagedUpload | undefined> {
    try {
      // Tenant-scoped: an upload id from another tenant returns nothing.
      const res = await dbQuery<Record<string, unknown>>(
        `SELECT * FROM ${TABLE} WHERE upload_id = ? AND client_id = ? LIMIT 1`,
        [uploadId, clientId]
      );
      const row = res.rows[0];
      return row ? rowToStagedUpload(row) : undefined;
    } catch (err) {
      this.warn("getUpload", err);
      return this.fallback.getUpload(uploadId, clientId);
    }
  }

  async listUploads(clientId: string): Promise<StagedUpload[]> {
    try {
      const res = await dbQuery<Record<string, unknown>>(
        `SELECT * FROM ${TABLE} WHERE client_id = ? ORDER BY uploaded_at DESC, created_at DESC`,
        [clientId]
      );
      return res.rows.map(rowToStagedUpload);
    } catch (err) {
      this.warn("listUploads", err);
      return this.fallback.listUploads(clientId);
    }
  }

  async updateStatus(uploadId: string, status: UploadStatus): Promise<StagedUpload | undefined> {
    try {
      await dbQuery(
        `UPDATE ${TABLE} SET status = ?, updated_at = current_timestamp() WHERE upload_id = ?`,
        [status, uploadId]
      );
      // Re-fetch by id (status transitions are keyed by upload_id, not tenant).
      const res = await dbQuery<Record<string, unknown>>(
        `SELECT * FROM ${TABLE} WHERE upload_id = ? LIMIT 1`,
        [uploadId]
      );
      const row = res.rows[0];
      return row ? rowToStagedUpload(row) : undefined;
    } catch (err) {
      this.warn("updateStatus", err);
      return this.fallback.updateStatus(uploadId, status);
    }
  }
}
