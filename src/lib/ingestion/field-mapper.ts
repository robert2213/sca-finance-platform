/**
 * Maps raw parsed rows to the Nexora finance data model.
 *
 * Each source system uses a set of column name aliases to locate the
 * required fields. Matching is case-insensitive and trims whitespace.
 *
 * Priority: first alias that matches a header in the file wins.
 */

import type {
  RawRow, SourceSystem, FactTransaction, VendorRecord,
  HeadcountRecord, ContractorRecord, CostCenterRecord, PeriodRecord,
} from "./types";

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
  "business unit", "business_unit", "bu", "department group", "org",
  "division", "team", "group",
];

// Vendor-specific aliases
const VENDOR_ID_ALIASES      = ["vendor id", "vendor_id", "vendor #", "supplier id"];
const VENDOR_NAME_ALIASES    = ["vendor name", "vendor_name", "name", "supplier name"];
const VENDOR_CAT_ALIASES     = ["category", "vendor category", "vendor_category", "type", "supplier type"];
const CONTRACT_START_ALIASES = ["contract start", "start date", "effective date"];
const CONTRACT_END_ALIASES   = ["contract end", "end date", "expiry date", "expiration date"];
const CONTRACT_VALUE_ALIASES = ["annual value", "contract value", "contract_value", "total value", "amount"];
const YTD_SPEND_ALIASES      = ["ytd spend", "ytd_spend", "ytd", "spend to date", "spent"];
const RISK_ALIASES           = ["risk", "risk level", "risk_level", "risk rating"];
const AUTO_RENEW_ALIASES     = ["auto renew", "auto_renew", "automatically renews", "auto renewal"];

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
      auto_renew: (() => {
        const raw = String(findColumn(row, AUTO_RENEW_ALIASES) ?? "false").toLowerCase().trim();
        return raw === "true" || raw === "1" || raw === "yes";
      })(),
      risk_level: riskLevel,
      status: String(findColumn(row, ["status","vendor status","engagement status"]) ?? "Active").trim() || "Active",
    });
  }

  return { vendors, unmapped };
}

// ─── Headcount mapper ─────────────────────────────────────────────────────────

const HC_ID_ALIASES       = ["position id","position_id","id","position #"];
const HC_TITLE_ALIASES    = ["title","position title","job title","role"];
const HC_LEVEL_ALIASES    = ["level","job level","grade","band"];
const HC_STATUS_ALIASES   = ["status","position status","fill status"];
const HC_LOCATION_ALIASES = ["location","office","city","site"];
const HC_OPEN_ALIASES     = ["open date","open_date","opening date","req date","posted date"];
const HC_FILL_ALIASES     = ["fill date","fill_date","hired date","start date","filled date"];
const HC_SALARY_ALIASES   = ["annual salary","annual_salary","salary","base salary","comp"];
const HC_BACKFILL_ALIASES = ["is backfill","is_backfill","backfill"];

export function mapToHeadcount(
  rows: RawRow[]
): { headcount: HeadcountRecord[]; unmapped: number[] } {
  const headcount: HeadcountRecord[] = [];
  const unmapped: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawTitle = findColumn(row, HC_TITLE_ALIASES);
    if (!rawTitle) { unmapped.push(i); continue; }

    const rawId = findColumn(row, HC_ID_ALIASES);
    const positionId = rawId
      ? String(rawId).trim()
      : `HC-${String(i + 1).padStart(3, "0")}`;

    const rawSalary = findColumn(row, HC_SALARY_ALIASES);
    const rawBackfill = String(findColumn(row, HC_BACKFILL_ALIASES) ?? "false").toLowerCase();

    headcount.push({
      position_id:   positionId,
      title:         String(rawTitle).trim(),
      business_unit: String(findColumn(row, BUSINESS_UNIT_ALIASES) ?? "Other").trim(),
      level:         String(findColumn(row, HC_LEVEL_ALIASES) ?? "").trim(),
      status:        String(findColumn(row, HC_STATUS_ALIASES) ?? "Filled").trim(),
      location:      String(findColumn(row, HC_LOCATION_ALIASES) ?? "").trim() || null,
      open_date:     standardizeDate(findColumn(row, HC_OPEN_ALIASES) as string | null) || null,
      fill_date:     standardizeDate(findColumn(row, HC_FILL_ALIASES) as string | null) || null,
      annual_salary: parseAmount(rawSalary),
      is_backfill:   rawBackfill === "true" || rawBackfill === "1" || rawBackfill === "yes",
    });
  }

  return { headcount, unmapped };
}

// ─── Contractor mapper ────────────────────────────────────────────────────────

const CTR_ID_ALIASES      = ["contractor id","contractor_id","id","ctr id"];
const CTR_NAME_ALIASES    = ["contractor name","contractor_name","name","worker name"];
const CTR_ROLE_ALIASES    = ["role","job title","position","title"];
const CTR_VENDOR_ALIASES  = ["vendor","staffing agency","agency","supplier"];
const CTR_RATE_ALIASES    = ["monthly rate","monthly_rate","rate","bill rate","mo rate"];
const CTR_YTD_ALIASES     = ["ytd spend","ytd_spend","ytd","spend to date"];
const CTR_BUDGET_ALIASES  = ["budget","annual budget","contract value"];
const CTR_START_ALIASES   = ["start date","start_date","engagement start","from"];
const CTR_END_ALIASES     = ["end date","end_date","engagement end","to","through"];
const CTR_STATUS_ALIASES  = ["status","engagement status"];

export function mapToContractors(
  rows: RawRow[]
): { contractors: ContractorRecord[]; unmapped: number[] } {
  const contractors: ContractorRecord[] = [];
  const unmapped: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawName = findColumn(row, CTR_NAME_ALIASES);
    if (!rawName) { unmapped.push(i); continue; }

    const rawId = findColumn(row, CTR_ID_ALIASES);
    const contractorId = rawId
      ? String(rawId).trim()
      : `CTR-${String(i + 1).padStart(3, "0")}`;

    contractors.push({
      contractor_id:    contractorId,
      contractor_name:  String(rawName).trim(),
      role:             String(findColumn(row, CTR_ROLE_ALIASES) ?? "Contractor").trim(),
      vendor:           String(findColumn(row, CTR_VENDOR_ALIASES) ?? "").trim(),
      cost_center_id:   String(findColumn(row, COST_CENTER_ALIASES) ?? "").trim(),
      cost_center_name: String(findColumn(row, COST_CENTER_NAME_ALIASES) ?? "").trim() || null,
      business_unit:    String(findColumn(row, BUSINESS_UNIT_ALIASES) ?? "Other").trim(),
      monthly_rate:     parseAmount(findColumn(row, CTR_RATE_ALIASES)),
      ytd_spend:        parseAmount(findColumn(row, CTR_YTD_ALIASES)),
      budget:           parseAmount(findColumn(row, CTR_BUDGET_ALIASES)),
      start_date:       standardizeDate(findColumn(row, CTR_START_ALIASES) as string | null) || null,
      end_date:         standardizeDate(findColumn(row, CTR_END_ALIASES) as string | null) || null,
      status:           String(findColumn(row, CTR_STATUS_ALIASES) ?? "Active").trim(),
    });
  }

  return { contractors, unmapped };
}

// ─── Cost center mapper ───────────────────────────────────────────────────────

const CC_ID_ALIASES     = ["cost center id","cost_center_id","cc id","id","account code"];
const CC_NAME_ALIASES2  = ["cost center name","cost_center_name","name","account name"];
const CC_DEPT_ALIASES   = ["department","dept","division","org"];
const CC_OWNER_ALIASES  = ["owner","cc owner","manager","lead"];
const CC_BUDGET_OWNER_ALIASES = ["budget owner","budget_owner","financial owner","approver"];

export function mapToCostCenters(
  rows: RawRow[]
): { costCenters: CostCenterRecord[]; unmapped: number[] } {
  const costCenters: CostCenterRecord[] = [];
  const unmapped: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawId = findColumn(row, CC_ID_ALIASES);
    if (!rawId) { unmapped.push(i); continue; }

    costCenters.push({
      cost_center_id:   String(rawId).trim(),
      cost_center_name: String(findColumn(row, CC_NAME_ALIASES2) ?? rawId).trim(),
      department:       String(findColumn(row, CC_DEPT_ALIASES) ?? "").trim(),
      owner:            String(findColumn(row, CC_OWNER_ALIASES) ?? "").trim() || null,
      budget_owner:     String(findColumn(row, CC_BUDGET_OWNER_ALIASES) ?? "").trim() || null,
    });
  }

  return { costCenters, unmapped };
}

// ─── Period mapper ────────────────────────────────────────────────────────────

const PD_ID_ALIASES      = ["period id","period_id","period","fiscal period"];
const PD_YEAR_ALIASES    = ["year","fiscal year"];
const PD_MONTH_ALIASES   = ["month","month number","mo"];
const PD_MNAME_ALIASES   = ["month name","month_name","month abbr"];
const PD_QTR_ALIASES     = ["quarter","qtr","fiscal quarter"];
const PD_CLOSED_ALIASES  = ["is closed","is_closed","closed","period closed"];

export function mapToPeriods(
  rows: RawRow[]
): { periods: PeriodRecord[]; unmapped: number[] } {
  const periods: PeriodRecord[] = [];
  const unmapped: number[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rawId = findColumn(row, PD_ID_ALIASES);
    if (!rawId) { unmapped.push(i); continue; }

    const rawClosed = String(findColumn(row, PD_CLOSED_ALIASES) ?? "false").toLowerCase();

    periods.push({
      period_id:  String(rawId).trim(),
      year:       parseInt(String(findColumn(row, PD_YEAR_ALIASES) ?? "2026"), 10),
      month:      parseInt(String(findColumn(row, PD_MONTH_ALIASES) ?? "1"), 10),
      month_name: String(findColumn(row, PD_MNAME_ALIASES) ?? "").trim(),
      quarter:    parseInt(String(findColumn(row, PD_QTR_ALIASES) ?? "1"), 10),
      is_closed:  rawClosed === "true" || rawClosed === "1" || rawClosed === "yes",
    });
  }

  return { periods, unmapped };
}
