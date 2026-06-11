import type { ValidationError, ValidationWarning } from "../validation.types";
import type { ClientConfig } from "@/config/client.config";

const ISO_MONTH = /^\d{4}-\d{2}$/;

export function validatePeriods(
  rows: Record<string, unknown>[],
  periodField: string,
  config: ClientConfig
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validPeriods = new Set(config.reportingPeriods);

  rows.forEach((row, i) => {
    const val = String(row[periodField] ?? "").trim();

    if (!ISO_MONTH.test(val)) {
      errors.push({
        row: i + 2,
        field: periodField,
        value: val,
        message: `Period "${val}" is not ISO month format (YYYY-MM)`,
      });
      return;
    }

    if (!validPeriods.has(val)) {
      warnings.push({
        row: i + 2,
        field: periodField,
        value: val,
        message: `Period "${val}" is not in the client's configured reporting periods`,
      });
    }
  });

  return { errors, warnings };
}
