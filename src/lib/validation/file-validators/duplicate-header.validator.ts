import type { FileValidationIssue } from "../file-validation.types";
import { normalizeHeader } from "../column-profiles";

/**
 * Error on duplicate column headers (case-insensitive). When rows are parsed
 * into objects, duplicate headers collapse to a single key, silently dropping a
 * column's data. Blank header cells are flagged as a warning.
 */
export function validateDuplicateHeaders(headers: string[]): FileValidationIssue[] {
  const issues: FileValidationIssue[] = [];

  // Blank headers (warning).
  const blankCount = headers.filter((h) => h.trim() === "").length;
  if (blankCount > 0) {
    issues.push({
      validator: "duplicate-header",
      severity: "warning",
      message: `Header row has ${blankCount} blank column name${blankCount > 1 ? "s" : ""}.`,
    });
  }

  // Duplicates (error) — case-insensitive, each reported once.
  const counts = new Map<string, { display: string; n: number }>();
  headers.forEach((h) => {
    const key = normalizeHeader(h);
    if (key === "") return;
    const existing = counts.get(key);
    if (existing) existing.n += 1;
    else counts.set(key, { display: h.trim(), n: 1 });
  });

  counts.forEach(({ display, n }) => {
    if (n > 1) {
      issues.push({
        validator: "duplicate-header",
        severity: "error",
        message: `Duplicate column header "${display}" appears ${n} times. Column names must be unique.`,
        column: display,
      });
    }
  });

  return issues;
}
