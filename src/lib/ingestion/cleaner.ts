/**
 * Phase 5 — Data Cleaning Layer
 *
 * Applied to every record before writing to Delta tables.
 * Rules:
 *  1. Standardize dates to YYYY-MM-DD (handled in field-mapper; re-validated here)
 *  2. Normalize vendor names (trim, consistent casing)
 *  3. Remove duplicate transactions (by transaction_id)
 *  4. Validate amounts (numeric, handle nulls → 0)
 *  5. Flag anomalies (negative actuals, amounts > 3× historical average)
 *     — flagged but NOT rejected
 *  6. Log all actions to qualityLog
 */

import type { FactTransaction, VendorRecord, QualityLogEntry } from "./types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function normalizeVendorName(name: string | null): string | null {
  if (!name) return null;
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

export interface CleanResult<T> {
  cleaned: T[];
  qualityLog: QualityLogEntry[];
}

// ─── Clean fact_transactions ──────────────────────────────────────────────────

export function cleanTransactions(
  rows: FactTransaction[]
): CleanResult<FactTransaction> {
  const qualityLog: QualityLogEntry[] = [];
  const seen = new Set<string>();
  const cleaned: FactTransaction[] = [];

  // Compute historical average for anomaly detection (ignore zeros)
  const amounts = rows
    .map((r) => Math.abs(r.amount_actual))
    .filter((a) => a > 0);
  const avgAmount = amounts.length
    ? amounts.reduce((s, a) => s + a, 0) / amounts.length
    : 0;
  const anomalyThreshold = avgAmount * 3;

  for (let i = 0; i < rows.length; i++) {
    const row = { ...rows[i] };

    // 1. Validate date format
    if (!DATE_RE.test(row.date)) {
      row.date = new Date().toISOString().slice(0, 10);
      qualityLog.push({
        action: "date_standardized",
        detail: `Row ${i}: invalid date replaced with today`,
        rowIndex: i,
      });
    }

    // 2. Normalize vendor name
    if (row.vendor_id) {
      const normalized = normalizeVendorName(row.vendor_id);
      if (normalized !== row.vendor_id) {
        qualityLog.push({
          action: "vendor_normalized",
          detail: `Row ${i}: "${row.vendor_id}" → "${normalized}"`,
          rowIndex: i,
        });
        row.vendor_id = normalized;
      }
    }

    // 3. Deduplicate
    if (seen.has(row.transaction_id)) {
      qualityLog.push({
        action: "duplicate_removed",
        detail: `Row ${i}: duplicate transaction_id "${row.transaction_id}" skipped`,
        rowIndex: i,
      });
      continue;
    }
    seen.add(row.transaction_id);

    // 4. Validate amounts
    if (isNaN(row.amount_actual)) {
      row.amount_actual = 0;
      qualityLog.push({
        action: "null_amount_filled",
        detail: `Row ${i}: non-numeric amount_actual set to 0`,
        rowIndex: i,
      });
    }

    // 5a. Flag negative actuals
    if (row.amount_actual < 0) {
      qualityLog.push({
        action: "negative_flagged",
        detail: `Row ${i}: negative actual $${row.amount_actual} (kept — may be a credit/reversal)`,
        rowIndex: i,
      });
    }

    // 5b. Flag anomalies (> 3× average)
    if (anomalyThreshold > 0 && Math.abs(row.amount_actual) > anomalyThreshold) {
      qualityLog.push({
        action: "anomaly_flagged",
        detail: `Row ${i}: amount $${row.amount_actual.toLocaleString()} exceeds 3× avg ($${anomalyThreshold.toFixed(0)})`,
        rowIndex: i,
      });
    }

    cleaned.push(row);
  }

  return { cleaned, qualityLog };
}

// ─── Clean vendors ────────────────────────────────────────────────────────────

export function cleanVendors(
  rows: VendorRecord[]
): CleanResult<VendorRecord> {
  const qualityLog: QualityLogEntry[] = [];
  const seen = new Set<string>();
  const cleaned: VendorRecord[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = { ...rows[i] };

    // Deduplicate by vendor_id
    if (seen.has(row.vendor_id)) {
      qualityLog.push({
        action: "duplicate_removed",
        detail: `Row ${i}: duplicate vendor_id "${row.vendor_id}" skipped`,
        rowIndex: i,
      });
      continue;
    }
    seen.add(row.vendor_id);

    // Normalize vendor name
    const normalized = normalizeVendorName(row.vendor_name);
    if (normalized && normalized !== row.vendor_name) {
      qualityLog.push({
        action: "vendor_normalized",
        detail: `Row ${i}: "${row.vendor_name}" → "${normalized}"`,
        rowIndex: i,
      });
      row.vendor_name = normalized;
    }

    // Validate contract value
    if (isNaN(row.contract_value)) {
      row.contract_value = 0;
      qualityLog.push({
        action: "null_amount_filled",
        detail: `Row ${i}: non-numeric contract_value set to 0`,
        rowIndex: i,
      });
    }

    cleaned.push(row);
  }

  return { cleaned, qualityLog };
}
