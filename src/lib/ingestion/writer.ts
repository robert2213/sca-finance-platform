/**
 * Writes cleaned records to Databricks Delta tables (or local SQLite fallback).
 * Also persists quality log entries to data_quality_log.
 */

import { getAdapter } from "@/lib/databricks";
import type { LocalAdapter } from "@/lib/adapters/local-adapter";
import type {
  FactTransaction, VendorRecord, QualityLogEntry,
  HeadcountRecord, ContractorRecord, CostCenterRecord, PeriodRecord,
} from "./types";

type Adapter = ReturnType<typeof getAdapter>;

function isLocalAdapter(adapter: Adapter): adapter is LocalAdapter {
  return typeof (adapter as LocalAdapter).insertRows === "function";
}

// ─── fact_transactions ────────────────────────────────────────────────────────

export async function writeTransactions(
  transactions: FactTransaction[]
): Promise<{ written: number; errors: string[] }> {
  if (!transactions.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    // Local path: bulk insert via typed insertRows
    await adapter.insertRows(
      "fact_transactions",
      transactions.map((t) => ({
        transaction_id:   t.transaction_id,
        date:             t.date,
        period:           t.period,
        cost_center_id:   t.cost_center_id,
        cost_center_name: t.cost_center_name,
        vendor_id:        t.vendor_id ?? null,
        category:         t.category,
        subcategory:      t.subcategory ?? null,
        business_unit:    t.business_unit,
        amount_actual:    t.amount_actual,
        amount_budget:    t.amount_budget,
        amount_forecast:  t.amount_forecast,
        transaction_type: t.transaction_type,
        source_system:    t.source_system,
        client_id:        t.client_id,
      }))
    );
    return { written: transactions.length, errors };
  }

  // Databricks path: MERGE into fact_transactions (upsert by transaction_id)
  // Batch in chunks of 500 to avoid parameter limits
  const CHUNK = 500;
  let written = 0;

  for (let i = 0; i < transactions.length; i += CHUNK) {
    const chunk = transactions.slice(i, i + CHUNK);
    const values = chunk
      .map((t) =>
        `('${esc(t.transaction_id)}','${t.date}','${t.period}',` +
        `'${esc(t.cost_center_id)}','${esc(t.cost_center_name)}',` +
        `${t.vendor_id ? `'${esc(t.vendor_id)}'` : "NULL"},` +
        `'${esc(t.category)}',` +
        `${t.subcategory ? `'${esc(t.subcategory)}'` : "NULL"},` +
        `'${esc(t.business_unit)}',` +
        `${t.amount_actual},${t.amount_budget},${t.amount_forecast},` +
        `'${t.transaction_type}','${esc(t.source_system)}','${esc(t.client_id)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO fact_transactions AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(transaction_id, date, period, cost_center_id, cost_center_name,
               vendor_id, category, subcategory, business_unit,
               amount_actual, amount_budget, amount_forecast,
               transaction_type, source_system, client_id)
      ) AS source ON target.transaction_id = source.transaction_id
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *
    `;

    try {
      await adapter.query(sql);
      written += chunk.length;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Chunk ${i} failed`);
    }
  }

  return { written, errors };
}

// ─── dim_vendor ───────────────────────────────────────────────────────────────

export async function writeVendors(
  vendors: VendorRecord[]
): Promise<{ written: number; errors: string[] }> {
  if (!vendors.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "dim_vendor",
      vendors.map((v) => ({
        vendor_id:       v.vendor_id,
        vendor_name:     v.vendor_name,
        vendor_category: v.vendor_category,
        contract_start:  v.contract_start ?? null,
        contract_end:    v.contract_end ?? null,
        contract_value:  v.contract_value,
        ytd_spend:       v.ytd_spend,
        remaining:       v.remaining,
        business_unit:   v.business_unit,
        auto_renew:      v.auto_renew ? 1 : 0,
        risk_level:      v.risk_level,
        status:          v.status,
        client_id:       v.client_id,
      }))
    );
    return { written: vendors.length, errors };
  }

  // Databricks: MERGE into dim_vendor
  const CHUNK = 200;
  let written = 0;

  for (let i = 0; i < vendors.length; i += CHUNK) {
    const chunk = vendors.slice(i, i + CHUNK);
    const values = chunk
      .map((v) =>
        `('${esc(v.vendor_id)}','${esc(v.vendor_name)}','${esc(v.vendor_category)}',` +
        `${v.contract_start ? `'${v.contract_start}'` : "NULL"},` +
        `${v.contract_end ? `'${v.contract_end}'` : "NULL"},` +
        `${v.contract_value},${v.ytd_spend},${v.remaining},` +
        `'${esc(v.business_unit)}',${v.auto_renew ? 1 : 0},'${v.risk_level}','${esc(v.status)}','${esc(v.client_id)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO dim_vendor AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(vendor_id, vendor_name, vendor_category, contract_start,
               contract_end, contract_value, ytd_spend, remaining,
               business_unit, auto_renew, risk_level, status, client_id)
      ) AS source ON target.vendor_id = source.vendor_id
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *
    `;

    try {
      await adapter.query(sql);
      written += chunk.length;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Chunk ${i} failed`);
    }
  }

  return { written, errors };
}

// ─── data_quality_log ────────────────────────────────────────────────────────

export async function writeQualityLog(
  entries: QualityLogEntry[],
  sourceFile: string,
  tableName: string
): Promise<void> {
  if (!entries.length) return;

  const adapter = getAdapter();
  const now = new Date().toISOString();

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "data_quality_log",
      entries.map((e) => ({
        logged_at:   now,
        source_file: sourceFile,
        table_name:  tableName,
        action:      e.action,
        detail:      e.detail,
        row_count:   1,
      }))
    );
    return;
  }

  const CHUNK = 500;
  for (let i = 0; i < entries.length; i += CHUNK) {
    const chunk = entries.slice(i, i + CHUNK);
    const values = chunk
      .map((e) =>
        `('${now}','${esc(sourceFile)}','${tableName}','${e.action}','${esc(e.detail)}',1)`
      )
      .join(",\n");

    await adapter.query(
      `INSERT INTO data_quality_log (logged_at, source_file, table_name, action, detail, row_count)
       VALUES ${values}`
    ).catch(() => { /* quality log failures are non-fatal */ });
  }
}

// ─── dim_headcount ────────────────────────────────────────────────────────────

export async function writeHeadcount(
  records: HeadcountRecord[]
): Promise<{ written: number; errors: string[] }> {
  if (!records.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "dim_headcount",
      records.map((h) => ({
        position_id:   h.position_id,
        title:         h.title,
        business_unit: h.business_unit,
        level:         h.level,
        status:        h.status,
        location:      h.location ?? null,
        open_date:     h.open_date ?? null,
        fill_date:     h.fill_date ?? null,
        annual_salary: h.annual_salary,
        is_backfill:   h.is_backfill ? 1 : 0,
        client_id:     h.client_id,
      }))
    );
    return { written: records.length, errors };
  }

  const CHUNK = 200;
  let written = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const values = chunk
      .map((h) =>
        `('${esc(h.position_id)}','${esc(h.title)}','${esc(h.business_unit)}',` +
        `'${esc(h.level)}','${esc(h.status)}',` +
        `${h.location ? `'${esc(h.location)}'` : "NULL"},` +
        `${h.open_date ? `'${h.open_date}'` : "NULL"},` +
        `${h.fill_date ? `'${h.fill_date}'` : "NULL"},` +
        `${h.annual_salary},${h.is_backfill ? "true" : "false"},'${esc(h.client_id)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO dim_headcount AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(position_id, title, business_unit, level, status,
               location, open_date, fill_date, annual_salary, is_backfill, client_id)
      ) AS source ON target.position_id = source.position_id
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *
    `;
    try {
      await adapter.query(sql);
      written += chunk.length;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Chunk ${i} failed`);
    }
  }
  return { written, errors };
}

// ─── dim_contractor ───────────────────────────────────────────────────────────

export async function writeContractors(
  records: ContractorRecord[]
): Promise<{ written: number; errors: string[] }> {
  if (!records.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "dim_contractor",
      records.map((c) => ({
        contractor_id:    c.contractor_id,
        contractor_name:  c.contractor_name,
        role:             c.role,
        vendor:           c.vendor,
        cost_center_id:   c.cost_center_id,
        cost_center_name: c.cost_center_name ?? null,
        business_unit:    c.business_unit,
        monthly_rate:     c.monthly_rate,
        ytd_spend:        c.ytd_spend,
        budget:           c.budget,
        start_date:       c.start_date ?? null,
        end_date:         c.end_date ?? null,
        status:           c.status,
        client_id:        c.client_id,
      }))
    );
    return { written: records.length, errors };
  }

  const CHUNK = 200;
  let written = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const values = chunk
      .map((c) =>
        `('${esc(c.contractor_id)}','${esc(c.contractor_name)}','${esc(c.role)}',` +
        `'${esc(c.vendor)}','${esc(c.cost_center_id)}',` +
        `${c.cost_center_name ? `'${esc(c.cost_center_name)}'` : "NULL"},` +
        `'${esc(c.business_unit)}',${c.monthly_rate},${c.ytd_spend},${c.budget},` +
        `${c.start_date ? `'${c.start_date}'` : "NULL"},` +
        `${c.end_date ? `'${c.end_date}'` : "NULL"},` +
        `'${esc(c.status)}','${esc(c.client_id)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO dim_contractor AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(contractor_id, contractor_name, role, vendor, cost_center_id,
               cost_center_name, business_unit, monthly_rate, ytd_spend, budget,
               start_date, end_date, status, client_id)
      ) AS source ON target.contractor_id = source.contractor_id
      WHEN MATCHED THEN UPDATE SET *
      WHEN NOT MATCHED THEN INSERT *
    `;
    try {
      await adapter.query(sql);
      written += chunk.length;
    } catch (err) {
      errors.push(err instanceof Error ? err.message : `Chunk ${i} failed`);
    }
  }
  return { written, errors };
}

// ─── dim_cost_center ──────────────────────────────────────────────────────────

export async function writeCostCenters(
  records: CostCenterRecord[]
): Promise<{ written: number; errors: string[] }> {
  if (!records.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "dim_cost_center",
      records.map((c) => ({
        cost_center_id:   c.cost_center_id,
        cost_center_name: c.cost_center_name,
        department:       c.department,
        owner:            c.owner ?? null,
        budget_owner:     c.budget_owner ?? null,
        client_id:        c.client_id,
      }))
    );
    return { written: records.length, errors };
  }

  const values = records
    .map((c) =>
      `('${esc(c.cost_center_id)}','${esc(c.cost_center_name)}','${esc(c.department)}',` +
      `${c.owner ? `'${esc(c.owner)}'` : "NULL"},` +
      `${c.budget_owner ? `'${esc(c.budget_owner)}'` : "NULL"},'${esc(c.client_id)}')`
    )
    .join(",\n");

  const sql = `
    MERGE INTO dim_cost_center AS target
    USING (
      SELECT * FROM VALUES ${values}
      AS src(cost_center_id, cost_center_name, department, owner, budget_owner, client_id)
    ) AS source ON target.cost_center_id = source.cost_center_id
    WHEN MATCHED THEN UPDATE SET *
    WHEN NOT MATCHED THEN INSERT *
  `;
  try {
    await adapter.query(sql);
    return { written: records.length, errors };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Write failed");
    return { written: 0, errors };
  }
}

// ─── dim_period ───────────────────────────────────────────────────────────────

export async function writePeriods(
  records: PeriodRecord[]
): Promise<{ written: number; errors: string[] }> {
  if (!records.length) return { written: 0, errors: [] };

  const adapter = getAdapter();
  const errors: string[] = [];

  if (isLocalAdapter(adapter)) {
    await adapter.insertRows(
      "dim_period",
      records.map((p) => ({
        period_id:  p.period_id,
        year:       p.year,
        month:      p.month,
        month_name: p.month_name,
        quarter:    p.quarter,
        is_closed:  p.is_closed ? 1 : 0,
      }))
    );
    return { written: records.length, errors };
  }

  const values = records
    .map((p) =>
      `('${esc(p.period_id)}',${p.year},${p.month},'${esc(p.month_name)}',` +
      `${p.quarter},${p.is_closed ? "true" : "false"})`
    )
    .join(",\n");

  const sql = `
    MERGE INTO dim_period AS target
    USING (
      SELECT * FROM VALUES ${values}
      AS src(period_id, year, month, month_name, quarter, is_closed)
    ) AS source ON target.period_id = source.period_id
    WHEN MATCHED THEN UPDATE SET *
    WHEN NOT MATCHED THEN INSERT *
  `;
  try {
    await adapter.query(sql);
    return { written: records.length, errors };
  } catch (err) {
    errors.push(err instanceof Error ? err.message : "Write failed");
    return { written: 0, errors };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/'/g, "''");
}
