/**
 * Maps raw parsed rows to the Nexora finance data model.
 *
 * Each source system uses a set of column name aliases to locate the
 * required fields. Matching is case-insensitive and trims whitespace.
 *
 * Priority: first alias that matches a header in the file wins.
 */

import type { RawRow, SourceSystem, FactTransaction, VendorRecord } from "./types";

// ─── Alias tables ─────────────────────────────────────────────────────────────

const DATE_ALIASES = [
  "date", "transaction date", "posting date", "trans date",
  "invoice date", "created", "period", "pay date",
];

const COST_CENTER_ALIASES = [
  "cost center", "cost_center", "cost center id", "cc id",
  "account", "gl account", "account code", "account number",
  "department", "dept", "dept code",
];

const COST_CENTER_NAME_ALIASES = [
  "cost center name", "cost_center_name", "account name",
  "department name", "dept name",
];

const AMOUNT_ALIASES = [
  "amount", "net amount", "total", "actual", "actual amount",
  "debit", "credit", "gross", "transaction amount",
  "amount usd", "amount (usd)", "spend",
];

const BUDGET_ALIASES = [
  "budget", "budget amount", "planned", "plan amount", "approved",
];

const FORECAST_ALIASES = [
  "forecast", "forecast amount", "projected", "estimate",
];

const VENDOR_ALIASES = [
  "vendor", "vendor name", "supplier", "payee", "merchant",
  "vendor id", "vendor_name",
];

const CATEGORY_ALIASES = [
  "category", "expense type", "type", "class", "account type",
  "expense category",
];

const BUSINESS_UNIT_ALIASES = [
  "business unit", "bu", "department group", "org",
  "division", "team", "group",
];

// Vendor-specific aliases
const VENDOR_ID_ALIASES      = ["vendor id", "vendor_id", "vendor #", "supplier id"];
const VENDOR_NAME_ALIASES    = ["vendor name", "vendor_name", "name", "supplier name"];
const VENDOR_CAT_ALIASES     = ["category", "vendor category", "type", "supplier type"];
const CONTRACT_START_ALIASES = ["contract start", "start date", "effective date"];
const CONTRACT_END_ALIASES   = ["contract end", "end date", "expiry date", "expiration date"];
const CONTRACT_VALUE_ALIASES = ["annual value", "contract value", "total value", "amount"];
const YTD_SPEND_ALIASES      = ["ytd spend", "ytd", "spend to date", "spent"];
const RISK_ALIASES           = ["risk", "risk level", "risk rating"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function findColumn(
  row: RawRow,
  aliases: string[]
): string | number | null {
  const rowKeys = Object.keys(row).map((k) => k.toLowerCase().trim());
  for (const alias of aliases) {
    const idx = rowKeys.indexOf(alias.toLowerCase());
    if (idx !== -1) {
      return row[Object.keys(row)[idx]] ?? null;
    }
  }
  return null;
}

function parseAmount(val: string | number | null): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  // Strip currency symbols, commas, parens (negative)
  const cleaned = String(val)
    .replace(/[$,\s]/g, "")
    .replace(/\((.+)\)/, "-$1");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function standardizeDate(raw: string | number | null): string {
  if (!raw) return new Date().toISOString().slice(0, 10);
  const str = String(raw).trim();

  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (mdy) {
    const [, m, d, y] = mdy;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Try native Date parse as fallback
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);

  return new Date().toISOString().slice(0, 10);
}

function dateToPeriod(date: string): string {
  return date.slice(0, 7); // YYYY-MM
}

function generateTxId(
  source: SourceSystem,
  costCenter: string,
  date: string,
  amount: number,
  idx: number
): string {
  return `${source}-${costCenter}-${date}-${Math.abs(amount).toFixed(0)}-${idx}`;
}

// ─── GL / QuickBooks / Generic export mapper ──────────────────────────────────

export function mapToFactTransactions(
  rows: RawRow[],
  source: SourceSystem
): { transactions: FactTransaction[]; unmapped: number[] } {
  const transactions: FactTransaction[] = [];
  const unmapped: number[] = [];

  const txType: FactTransaction["transaction_type"] =
    source === "budget-export" ? "budget" : "actual";

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const rawDate = findColumn(row, DATE_ALIASES);
    const rawCostCenter = findColumn(row, COST_CENTER_ALIASES);
    const rawAmount = findColumn(row, AMOUNT_ALIASES);

    if (!rawDate && !rawAmount && !rawCostCenter) {
      unmapped.push(i);
      continue;
    }

    const date = standardizeDate(rawDate as string | null);
    const period = dateToPeriod(date);
    const costCenterId = String(rawCostCenter ?? "UNKNOWN").trim();
    const costCenterName =
      String(findColumn(row, COST_CENTER_NAME_ALIASES) ?? costCenterId).trim();
    const amountActual = txType === "actual" ? parseAmount(rawAmount) : 0;
    const amountBudget  = txType === "budget"
      ? parseAmount(rawAmount)
      : parseAmount(findColumn(row, BUDGET_ALIASES));
    const amountForecast = parseAmount(findColumn(row, FORECAST_ALIASES));
    const vendor  = String(findColumn(row, VENDOR_ALIASES) ?? "").trim() || null;
    const category = String(findColumn(row, CATEGORY_ALIASES) ?? "Other").trim();
    const bu = String(findColumn(row, BUSINESS_UNIT_ALIASES) ?? "").trim();

    transactions.push({
      transaction_id: generateTxId(source, costCenterId, date, amountActual || amountBudget, i),
      date,
      period,
      cost_center_id: costCenterId,
      cost_center_name: costCenterName,
      vendor_id: vendor,
      category,
      subcategory: null,
      business_unit: bu || "Other",
      amount_actual: amountActual,
      amount_budget: amountBudget,
      amount_forecast: amountForecast,
      transaction_type: txType,
      source_system: source,
    });
  }

  return { transactions, unmapped };
}

// ─── Vendor file mapper ────────────────────────────────────────────────────────

export function mapToVendors(
  rows: RawRow[],
  source: SourceSystem
): { vendors: VendorRecord[]; unmapped: number[] } {
  const vendors: VendorRecord[] = [];
  const unmapped: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawName = findColumn(row, VENDOR_NAME_ALIASES);
    if (!rawName) { unmapped.push(i); continue; }

    const rawId = findColumn(row, VENDOR_ID_ALIASES);
    const vendorId = rawId
      ? String(rawId).trim()
      : `V-${String(i).padStart(3, "0")}`;

    const rawRisk = String(findColumn(row, RISK_ALIASES) ?? "Low").trim();
    const riskLevel: VendorRecord["risk_level"] =
      rawRisk === "High" || rawRisk === "Medium" ? rawRisk : "Low";

    vendors.push({
      vendor_id: vendorId,
      vendor_name: String(rawName).trim(),
      vendor_category: String(findColumn(row, VENDOR_CAT_ALIASES) ?? "Other").trim(),
      contract_start: standardizeDate(findColumn(row, CONTRACT_START_ALIASES) as string | null),
      contract_end: standardizeDate(findColumn(row, CONTRACT_END_ALIASES) as string | null),
      contract_value: parseAmount(findColumn(row, CONTRACT_VALUE_ALIASES)),
      ytd_spend: parseAmount(findColumn(row, YTD_SPEND_ALIASES)),
      remaining: 0,
      business_unit: String(findColumn(row, BUSINESS_UNIT_ALIASES) ?? "Other").trim(),
      auto_renew: false,
      risk_level: riskLevel,
      status: "Active",
    });
  }

  return { vendors, unmapped };
}
