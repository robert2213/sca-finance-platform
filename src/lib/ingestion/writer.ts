/**
 * Writes cleaned records to Databricks Delta tables (or local SQLite fallback).
 * Also persists quality log entries to data_quality_log.
 */

import { getAdapter } from "@/lib/databricks";
import type { LocalAdapter } from "@/lib/adapters/local-adapter";
import type { FactTransaction, VendorRecord, QualityLogEntry } from "./types";

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
        `'${t.transaction_type}','${esc(t.source_system)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO fact_transactions AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(transaction_id, date, period, cost_center_id, cost_center_name,
               vendor_id, category, subcategory, business_unit,
               amount_actual, amount_budget, amount_forecast,
               transaction_type, source_system)
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
        `'${esc(v.business_unit)}',${v.auto_renew ? 1 : 0},'${v.risk_level}','${esc(v.status)}')`
      )
      .join(",\n");

    const sql = `
      MERGE INTO dim_vendor AS target
      USING (
        SELECT * FROM VALUES ${values}
        AS src(vendor_id, vendor_name, vendor_category, contract_start,
               contract_end, contract_value, ytd_spend, remaining,
               business_unit, auto_renew, risk_level, status)
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/'/g, "''");
}
