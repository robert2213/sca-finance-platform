import type { ValidationError } from "../validation.types";

// Flags rows where the combination of key fields appears more than once.
export function validateDuplicates(
  rows: Record<string, unknown>[],
  keyFields: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seen = new Map<string, number>();

  rows.forEach((row, i) => {
    const key = keyFields.map((f) => String(row[f] ?? "")).join("|");
    if (seen.has(key)) {
      errors.push({
        row: i + 2,
        message: `Duplicate record: key [${key}] already appeared at row ${seen.get(key)! + 2}`,
      });
    } else {
      seen.set(key, i);
    }
  });

  return errors;
}
