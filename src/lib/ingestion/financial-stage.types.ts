// Canonical financial staging model + stage abstraction (Sprint 11A.6).
//
// A CanonicalFinancialRecord is the single, denormalized shape that EVERY
// ingestion type (gl-actuals | budget | forecast | headcount | vendors |
// external-labor) transforms into before being staged for a later Delta load.
// Field names are snake_case to line up 1:1 with the eventual
// nexora.finance.fact_transactions columns — so the future load step is a direct
// column mapping. NO financial rows are written to Databricks in this sprint.
//
// FinancialStage mirrors the swap-ready UploadHistoryStore pattern (11A.4): an
// async interface with an in-memory implementation now, and a resolver that can
// later select a DatabricksFinancialStage by editing only the resolver.

export interface CanonicalFinancialRecord {
  upload_id: string;        // originating upload (links back to upload history)
  source_type: string;      // the DataType: gl-actuals | budget | forecast | headcount | vendors | external-labor
  source_file: string;      // original uploaded file name
  client_id: string;        // multi-tenant client id

  period: string;           // ISO month "2026-06"
  cost_center: string;      // cost center id
  cost_center_name: string;
  business_unit: string;
  category: string;
  account_code: string;

  amount_actual: number;
  amount_budget: number;
  amount_forecast: number;

  entity_id: string;        // transaction/position/vendor/contractor id (traceability)
  entity_name: string;      // vendor name / contractor name / headcount title
}

/** Result of staging a batch: how many were accepted vs rejected by the stage. */
export interface StageOutcome {
  staged: number;
  rejected: number;
}

/** Per-upload roll-up of staged rows (for inspection endpoints). */
export interface UploadStageSummary {
  uploadId: string;
  sourceType: string;
  sourceFile: string;
  count: number;
}

/**
 * Storage abstraction for staged financial rows. Async so a Databricks-backed
 * implementation can satisfy the same contract; the in-memory implementation
 * resolves immediately. Routes depend only on this interface.
 */
export interface FinancialStage {
  /** Stage a batch of canonical records; returns accepted/rejected counts. */
  stage(records: CanonicalFinancialRecord[]): Promise<StageOutcome>;
  /** All staged records for one upload. */
  getByUpload(uploadId: string): Promise<CanonicalFinancialRecord[]>;
  /** Total staged record count across all uploads. */
  count(): Promise<number>;
  /** Per-upload roll-up, for inspection. */
  listUploadSummaries(): Promise<UploadStageSummary[]>;
}
