import type { FileValidationIssue } from "../file-validation.types";
import { getColumnProfile, findHeader } from "../column-profiles";

// Accepted structural period formats: ISO month (2026-06) or ISO date (2026-06-30).
const ISO_MONTH = /^\d{4}-\d{2}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidPeriod(value: string): boolean {
  const v = value.trim();
  return ISO_MONTH.test(v) || ISO_DATE.test(v);
}

/**
 * Structural check on period values — NOT the semantic in-range check, which the
 * semantic period validator owns. Inspects the in-file period column for data
 * types that carry one, plus the optional caller-supplied period. Malformed
 * values are warnings: the mapper is tolerant and the period param can stamp
 * non-transactional types, so this surfaces format drift without blocking.
 */
export function validatePeriodFormat(
  dataType: string,
  rows: Record<string, string>[],
  declaredPeriod?: string
): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];

  if (declaredPeriod && declaredPeriod.trim() !== "" && !isValidPeriod(declaredPeriod)) {
    issues.push({
      validator: "period-format",
      severity: "warning",
      message: `Supplied period "${declaredPeriod}" is not ISO "YYYY-MM" (or "YYYY-MM-DD").`,
    });
  }

  const profile = getColumnProfile(dataType);
  if (!profile || profile.periodColumns.length === 0 || rows.length === 0) {
    return issues;
  }

  const headers = Object.keys(rows[0]);
  const periodHeader = findHeader(headers, profile.periodColumns);
  if (!periodHeader) {
    // A missing period column is reported by the required-columns validator.
    return issues;
  }

  let malformed = 0;
  let firstBad = "";
  rows.forEach((row) => {
    const raw = (row[periodHeader] ?? "").trim();
    if (raw === "") return; // empty values are covered by semantic required-fields
    if (!isValidPeriod(raw)) {
      malformed += 1;
      if (firstBad === "") firstBad = raw;
    }
  });

  if (malformed > 0) {
    issues.push({
      validator: "period-format",
      severity: "warning",
      message: `${malformed} of ${rows.length} row(s) have a "${periodHeader}" value that is not ISO "YYYY-MM" (e.g. "${firstBad}").`,
      column: periodHeader,
    });
  }

  return issues;
}
