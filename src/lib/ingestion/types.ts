// ─── Ingestion Types ─────────────────────────────────────────────────────────

export type SourceSystem =
  | "gl-export"
  | "budget-export"
  | "payroll"
  | "vendors"
  | "quickbooks"
  | "stripe"
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
