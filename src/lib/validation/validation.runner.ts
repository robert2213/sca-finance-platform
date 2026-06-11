import type { ValidationResult, ValidationError, ValidationWarning } from "./validation.types";
import type { ClientConfig } from "@/config/client.config";
import type {
  ActualEntry,
  BudgetEntry,
  ForecastEntry,
  HeadcountRecord,
  ExternalLaborRecord,
  VendorSpendRecord,
} from "@/lib/models/finance.types";

import { validateRequiredFields } from "./validators/required-fields.validator";
import { validatePeriods } from "./validators/period.validator";
import { validateCostCenters } from "./validators/cost-center.validator";
import { validateAccounts } from "./validators/account.validator";
import { validateDuplicates } from "./validators/duplicate.validator";
import { validateAnomalies } from "./validators/anomaly.validator";

type SupportedRecord =
  | ActualEntry
  | BudgetEntry
  | ForecastEntry
  | HeadcountRecord
  | ExternalLaborRecord
  | VendorSpendRecord;

export function runValidation(
  dataType: string,
  period: string,
  data: SupportedRecord[],
  config: ClientConfig
): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const rows = data as unknown as Record<string, unknown>[];

  switch (dataType) {
    case "gl-actuals": {
      errors.push(...validateRequiredFields(rows, ["period", "costCenterId", "businessUnit", "category"]));
      errors.push(...validateDuplicates(rows, ["transactionId"]));
      const p = validatePeriods(rows, "period", config);
      errors.push(...p.errors); warnings.push(...p.warnings);
      const cc = validateCostCenters(rows, "costCenterId", config);
      errors.push(...cc.errors); warnings.push(...cc.warnings);
      warnings.push(...validateAccounts(rows, "accountCode", config));
      warnings.push(...validateAnomalies(rows, ["amountActual", "amountBudget"]));
      break;
    }

    case "budget": {
      errors.push(...validateRequiredFields(rows, ["period", "costCenterId", "category"]));
      errors.push(...validateDuplicates(rows, ["period", "costCenterId", "accountCode"]));
      const p = validatePeriods(rows, "period", config);
      errors.push(...p.errors); warnings.push(...p.warnings);
      const cc = validateCostCenters(rows, "costCenterId", config);
      errors.push(...cc.errors); warnings.push(...cc.warnings);
      warnings.push(...validateAnomalies(rows, ["amountBudget"]));
      break;
    }

    case "forecast": {
      errors.push(...validateRequiredFields(rows, ["period", "costCenterId", "category"]));
      const p = validatePeriods(rows, "period", config);
      errors.push(...p.errors); warnings.push(...p.warnings);
      const cc = validateCostCenters(rows, "costCenterId", config);
      errors.push(...cc.errors); warnings.push(...cc.warnings);
      warnings.push(...validateAnomalies(rows, ["amountForecast"]));
      break;
    }

    case "headcount": {
      errors.push(...validateRequiredFields(rows, ["positionId", "title", "businessUnit"]));
      errors.push(...validateDuplicates(rows, ["positionId"]));
      warnings.push(...validateAnomalies(rows, ["annualSalary"]));
      break;
    }

    case "vendors": {
      errors.push(...validateRequiredFields(rows, ["vendorId", "vendorName"]));
      errors.push(...validateDuplicates(rows, ["vendorId"]));
      warnings.push(...validateAnomalies(rows, ["annualValue", "ytdSpend"]));
      break;
    }

    case "external-labor": {
      errors.push(...validateRequiredFields(rows, ["contractorId", "name", "businessUnit"]));
      errors.push(...validateDuplicates(rows, ["contractorId"]));
      warnings.push(...validateAnomalies(rows, ["monthlyRate", "contractValue", "ytdSpend"]));
      break;
    }

    default:
      warnings.push({ message: `No validation rules defined for data type "${dataType}"` });
  }

  return {
    dataType,
    period,
    rowsProcessed: data.length,
    errors,
    warnings,
    passed: errors.length === 0,
  };
}
