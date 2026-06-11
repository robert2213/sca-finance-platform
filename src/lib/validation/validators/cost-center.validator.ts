import type { ValidationError, ValidationWarning } from "../validation.types";
import type { ClientConfig } from "@/config/client.config";

export function validateCostCenters(
  rows: Record<string, unknown>[],
  costCenterField: string,
  config: ClientConfig
): { errors: ValidationError[]; warnings: ValidationWarning[] } {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validIds = new Set(config.costCenters.map((cc) => cc.id));
  const validNames = new Set(config.costCenters.map((cc) => cc.name.toLowerCase()));

  rows.forEach((row, i) => {
    const val = String(row[costCenterField] ?? "").trim();
    if (!val) return; // required-fields validator handles empty check

    const matchById   = validIds.has(val);
    const matchByName = validNames.has(val.toLowerCase());

    if (!matchById && !matchByName) {
      warnings.push({
        row: i + 2,
        field: costCenterField,
        value: val,
        message: `Cost center "${val}" is not in the client's configured cost centers`,
      });
    }
  });

  return { errors, warnings };
}
