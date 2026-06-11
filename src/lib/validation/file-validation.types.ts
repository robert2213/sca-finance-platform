// File-structure validation types (Sprint 11A.3).
//
// This layer inspects the RAW uploaded file — its extension, header row, and
// raw cell values — BEFORE the V2 ingestion stack parses/maps it and BEFORE the
// semantic validators (which run on mapped, business-typed records) execute.
//
// It is deliberately independent of the semantic validation layer
// (validators/* + validation.runner.ts): separate types, separate runner,
// separate validator folder (file-validators/*). The pipeline order is:
//
//   file-structure validation → semantic validation → (future) Databricks load
//
// Shared vocabulary only: we reuse ValidationStatus ("pass" | "warn" | "error")
// from the data model so the upload response speaks one status language.

import type { ValidationStatus } from "@/lib/models/finance.types";

/** Severity of a single file-structure finding. */
export type FileValidationSeverity = "error" | "warning";

/**
 * One file-structure finding. An `error` blocks the pipeline (no parse/map,
 * no semantic validation, no stage); a `warning` is advisory and non-blocking.
 */
export interface FileValidationIssue {
  validator: string;                 // producing validator, e.g. "required-columns"
  severity: FileValidationSeverity;
  message: string;                   // human-readable finding
  column?: string;                   // offending/related column, when applicable
  detail?: string;                   // optional extra context
}

/**
 * Aggregate result of running every file-structure validator over one upload.
 * `status` is the worst severity seen: "error" if any error, "warn" if only
 * warnings, otherwise "pass".
 */
export interface FileValidationResult {
  status: ValidationStatus;
  issues: FileValidationIssue[];
  errorCount: number;
  warningCount: number;
}
