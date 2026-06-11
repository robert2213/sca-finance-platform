import type { FileValidationIssue } from "../file-validation.types";
import { getColumnProfile, hasAlias } from "../column-profiles";

/**
 * Validates the header row contains the columns the data type needs. A missing
 * required column → error; a missing recommended (measure) column → warning.
 * Aliases are matched case-insensitively (see column-profiles). Catching a
 * missing/renamed column here prevents a flood of per-row semantic errors later.
 */
export function validateRequiredColumns(dataType: string, headers: string[]): FileValidationIssue[] {
  const profile = getColumnProfile(dataType);
  if (!profile) {
    return [{
      validator: "required-columns",
      severity: "warning",
      message: `No required-column profile defined for data type "${dataType}"; skipping column checks.`,
    }];
  }

  const issues: FileValidationIssue[] = [];

  profile.required.forEach((col) => {
    if (!hasAlias(headers, col.aliases)) {
      issues.push({
        validator: "required-columns",
        severity: "error",
        message: `Missing required column "${col.logicalName}" for ${dataType}. Expected one of: ${col.aliases.join(", ")}.`,
        column: col.logicalName,
      });
    }
  });

  profile.recommended.forEach((col) => {
    if (!hasAlias(headers, col.aliases)) {
      issues.push({
        validator: "required-columns",
        severity: "warning",
        message: `Recommended column "${col.logicalName}" not found for ${dataType}; its values will default to 0. Expected one of: ${col.aliases.join(", ")}.`,
        column: col.logicalName,
      });
    }
  });

  return issues;
}
