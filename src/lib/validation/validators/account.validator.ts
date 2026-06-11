import type { ValidationWarning } from "../validation.types";
import type { ClientConfig } from "@/config/client.config";

export function validateAccounts(
  rows: Record<string, unknown>[],
  accountField: string,
  config: ClientConfig
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];
  const validCodes = new Set(config.chartOfAccounts.map((a) => a.code));
  const validNames = new Set(config.chartOfAccounts.map((a) => a.name.toLowerCase()));

  rows.forEach((row, i) => {
    const val = String(row[accountField] ?? "").trim();
    if (!val) return;

    if (!validCodes.has(val) && !validNames.has(val.toLowerCase())) {
      warnings.push({
        row: i + 2,
        field: accountField,
        value: val,
        message: `Account "${val}" is not in the client's chart of accounts`,
      });
    }
  });

  return warnings;
}
