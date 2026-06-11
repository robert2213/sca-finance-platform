// Row transformation layer (Sprint 11A.6).
//
// Mapped records (the typed output of ingest.orchestrator → mappers/*) →
// CanonicalFinancialRecord[]. Additive: this does NOT touch the mappers, the
// dashboards, the agents, or the UI. Each ingestion type lands its amounts in the
// canonical amount_actual/budget/forecast columns; non-transactional types map
// their primary measure to the most appropriate column:
//
//   gl-actuals      → amount_actual (+ amount_budget carried from the GL row)
//   budget          → amount_budget
//   forecast        → amount_forecast
//   headcount       → amount_budget   = annual_salary  (planned workforce cost)
//   vendors         → amount_actual   = ytd_spend,  amount_budget = annual_value
//   external-labor  → amount_actual   = ytd_spend,  amount_budget = contract_value

import type {
  ActualEntry,
  BudgetEntry,
  ForecastEntry,
  HeadcountRecord,
  VendorSpendRecord,
  ExternalLaborRecord,
} from "@/lib/models/finance.types";
import type { CanonicalFinancialRecord } from "./financial-stage.types";

export interface TransformContext {
  uploadId: string;
  sourceFile: string;
  clientId: string;
}

/** A zeroed canonical record with the shared/identity fields filled in. */
function base(
  ctx: TransformContext,
  sourceType: string,
  period: string,
  costCenter: string
): CanonicalFinancialRecord {
  return {
    upload_id: ctx.uploadId,
    source_type: sourceType,
    source_file: ctx.sourceFile,
    client_id: ctx.clientId,
    period: period ?? "",
    cost_center: costCenter ?? "",
    cost_center_name: "",
    business_unit: "",
    category: "",
    account_code: "",
    amount_actual: 0,
    amount_budget: 0,
    amount_forecast: 0,
    entity_id: "",
    entity_name: "",
  };
}

/**
 * Transform a batch of mapped records of one data type into canonical financial
 * records. Returns [] for an unknown data type (defensive; the route only calls
 * this with a resolved, supported type).
 */
export function toCanonicalRecords(
  dataType: string,
  mapped: unknown[],
  ctx: TransformContext
): CanonicalFinancialRecord[] {
  switch (dataType) {
    case "gl-actuals":
      return (mapped as ActualEntry[]).map((r) => ({
        ...base(ctx, "gl-actuals", r.period, r.costCenterId),
        cost_center_name: r.costCenterName ?? "",
        business_unit: r.businessUnit ?? "",
        category: r.category ?? "",
        account_code: r.accountCode ?? "",
        amount_actual: r.amountActual ?? 0,
        amount_budget: r.amountBudget ?? 0,
        entity_id: r.transactionId ?? "",
        entity_name: r.vendorName ?? "",
      }));

    case "budget":
      return (mapped as BudgetEntry[]).map((r) => ({
        ...base(ctx, "budget", r.period, r.costCenterId),
        cost_center_name: r.costCenterName ?? "",
        business_unit: r.businessUnit ?? "",
        category: r.category ?? "",
        account_code: r.accountCode ?? "",
        amount_budget: r.amountBudget ?? 0,
      }));

    case "forecast":
      return (mapped as ForecastEntry[]).map((r) => ({
        ...base(ctx, "forecast", r.period, r.costCenterId),
        cost_center_name: r.costCenterName ?? "",
        business_unit: r.businessUnit ?? "",
        category: r.category ?? "",
        account_code: r.accountCode ?? "",
        amount_forecast: r.amountForecast ?? 0,
      }));

    case "headcount":
      return (mapped as HeadcountRecord[]).map((r) => ({
        ...base(ctx, "headcount", r.period, r.costCenterId),
        business_unit: r.businessUnit ?? "",
        category: "Headcount",
        amount_budget: r.annualSalary ?? 0,
        entity_id: r.positionId ?? "",
        entity_name: r.title ?? "",
      }));

    case "vendors":
      return (mapped as VendorSpendRecord[]).map((r) => ({
        ...base(ctx, "vendors", r.period, r.costCenterId),
        business_unit: r.businessUnit ?? "",
        category: r.category ?? "",
        amount_actual: r.ytdSpend ?? 0,
        amount_budget: r.annualValue ?? 0,
        entity_id: r.vendorId ?? "",
        entity_name: r.vendorName ?? "",
      }));

    case "external-labor":
      return (mapped as ExternalLaborRecord[]).map((r) => ({
        ...base(ctx, "external-labor", r.period, r.costCenterId),
        business_unit: r.businessUnit ?? "",
        category: "External Labor",
        amount_actual: r.ytdSpend ?? 0,
        amount_budget: r.contractValue ?? 0,
        entity_id: r.contractorId ?? "",
        entity_name: r.name ?? "",
      }));

    default:
      return [];
  }
}
