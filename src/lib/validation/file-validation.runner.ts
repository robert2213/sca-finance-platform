// File-structure validation runner (Sprint 11A.3).
//
// Single entrypoint — validateFileStructure() — that runs every file-structure
// validator over one upload and returns an aggregate FileValidationResult. This
// layer runs BEFORE parse/map and BEFORE semantic validation:
//
//   upload → [file-structure validation] → parse → map → semantic validation → stage → history
//
// It is independent of the semantic validation layer (validators/* +
// validation.runner.ts): separate validators (file-validators/*), separate
// types, separate config (column-profiles.ts).

import type { FileValidationIssue, FileValidationResult } from "./file-validation.types";
import { validateUnsupportedFile } from "./file-validators/unsupported-file.validator";
import { validateEmptyFile } from "./file-validators/empty-file.validator";
import { validateDuplicateHeaders } from "./file-validators/duplicate-header.validator";
import { validateRequiredColumns } from "./file-validators/required-columns.validator";
import { validatePeriodFormat } from "./file-validators/period-format.validator";

/** Everything the file-structure validators need about one upload. */
export interface FileValidationInput {
  fileName: string;
  dataType: string;
  headers: string[];                 // raw header row (order + duplicates preserved)
  rows: Record<string, string>[];    // raw data rows (keyed by header)
  declaredPeriod?: string;           // optional caller-supplied period param
}

function summarize(issues: FileValidationIssue[]): FileValidationResult {
  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  const status = errorCount > 0 ? "error" : warningCount > 0 ? "warn" : "pass";
  return { status, issues, errorCount, warningCount };
}

export function validateFileStructure(input: FileValidationInput): FileValidationResult {
  const { fileName, dataType, headers, rows, declaredPeriod } = input;
  const issues: FileValidationIssue[] = [];

  // 1. Unsupported extension — can't parse further, so short-circuit.
  const extIssues = validateUnsupportedFile(fileName);
  issues.push(...extIssues);
  if (extIssues.some((i) => i.severity === "error")) {
    return summarize(issues);
  }

  // 2. Empty file — nothing to check columns/periods against, so short-circuit.
  const emptyIssues = validateEmptyFile(headers, rows.length);
  issues.push(...emptyIssues);
  if (emptyIssues.some((i) => i.severity === "error")) {
    return summarize(issues);
  }

  // 3. Header + content structure — collect all (none short-circuits).
  issues.push(...validateDuplicateHeaders(headers));
  issues.push(...validateRequiredColumns(dataType, headers));
  issues.push(...validatePeriodFormat(dataType, rows, declaredPeriod));

  return summarize(issues);
}
