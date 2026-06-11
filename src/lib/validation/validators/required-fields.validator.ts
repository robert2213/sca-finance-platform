import type { ValidationError } from "../validation.types";

// Validates that required fields are present and non-empty on every row.
export function validateRequiredFields(
  rows: Record<string, unknown>[],
  requiredKeys: string[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  rows.forEach((row, i) => {
    for (const key of requiredKeys) {
      const val = row[key];
      if (val === undefined || val === null || String(val).trim() === "") {
        errors.push({
          row: i + 2,
          field: key,
          message: `Required field "${key}" is missing or empty`,
        });
      }
    }
  });

  return errors;
}
