// ─── Ingestion Types ─────────────────────────────────────────────────────────

export type SourceSystem =
  | "gl-export"
  | "budget-export"
  | "payroll"
  | "vendors"
  | "quickbooks"
  | "stripe"
  | "headcount"
  | "contractors"
  | "cost-centers"
  | "periods"
  | "other";

export type FileType = "csv" | "xlsx" | "xls";

/** One raw record as parsed from a CSV or Excel row (column → raw string value). */
export type RawRow = Record<string, string | number | null>;

/** A fully mapped, cleaned fact_transactions record ready to write to Delta. */
export interface FactTransaction {
  transaction_id: string;
  date: string;           // YYYY-MM-DD
  period: string;         // YYYY-MM
  cost_center_id: string;
  cost_center_name: string;
  vendor_id: string | null;
  category: string;
  subcategory: string | null;
  business_unit: string;
  amount_actual: number;
  amount_budget: number;
  amount_forecast: number;
  transaction_type: "actual" | "budget" | "forecast";
  source_system: string;
  client_id: string;      // multi-tenant identifier — required for all new writes
}

/** A mapped dim_headcount record. */
export interface HeadcountRecord {
  position_id: string;
  title: string;
  business_unit: string;
  level: string;
  status: string;
  location: string | null;
  open_date: string | null;
  fill_date: string | null;
  annual_salary: number;
  is_backfill: boolean;
  client_id: string;
}

/** A mapped dim_contractor record. */
export interface ContractorRecord {
  contractor_id: string;
  contractor_name: string;
  role: string;
  vendor: string;
  cost_center_id: string;
  cost_center_name: string | null;
  business_unit: string;
  monthly_rate: number;
  ytd_spend: number;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  status: string;
  client_id: string;
}

/** A mapped dim_cost_center record. */
export interface CostCenterRecord {
  cost_center_id: string;
  cost_center_name: string;
  department: string;
  owner: string | null;
  budget_owner: string | null;
  client_id: string;
}

/** A mapped dim_period record. */
export interface PeriodRecord {
  period_id: string;
  year: number;
  month: number;
  month_name: string;
  quarter: number;
  is_closed: boolean;
}

/** A mapped dim_vendor record. */
export interface VendorRecord {
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  contract_start: string | null;
  contract_end: string | null;
  contract_value: number;
  ytd_spend: number;
  remaining: number;
  business_unit: string;
  auto_renew: boolean;
  risk_level: "Low" | "Medium" | "High";
  status: string;
  client_id: string;
}

/** Actions logged to data_quality_log. */
export type QualityAction =
  | "date_standardized"
  | "vendor_normalized"
  | "duplicate_removed"
  | "null_amount_filled"
  | "negative_flagged"
  | "anomaly_flagged"
  | "parse_error"
  | "missing_required_field";

export interface QualityLogEntry {
  action: QualityAction;
  detail: string;
  rowIndex: number;
}

/** Response returned from POST /api/ingest */
export interface IngestionResult {
  success: boolean;
  sourceSystem: SourceSystem;
  fileName: string;
  rowsReceived: number;
  rowsProcessed: number;
  rowsFlagged: number;
  rowsSkipped: number;
  qualityLog: QualityLogEntry[];
  errors: string[];
  durationMs: number;
}
