import type { ActualEntry, DataSource } from "@/lib/models/finance.types";

export interface MapResult<T> {
  data: T[];
  warnings: string[];
}

function num(v: string | undefined): number {
  if (!v) return 0;
  const n = parseFloat(v.replace(/[$,\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const val = row[k] ?? row[k.toLowerCase()] ?? row[k.toUpperCase()];
    if (val !== undefined && val !== "") return val;
  }
  return "";
}

export function mapGlActuals(
  rows: Record<string, string>[],
  clientId: string,
  source: DataSource = "upload"
): MapResult<ActualEntry> {
  const data: ActualEntry[] = [];
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    const period      = pick(row, "period_id", "period", "month");
    const costCenterId = pick(row, "cost_center_id", "cost_center", "cc_id");
    const businessUnit = pick(row, "business_unit", "businessUnit", "bu");
    const category    = pick(row, "category");
    const amountActual = num(pick(row, "amount_actual", "actual", "amount"));
    const amountBudget = num(pick(row, "amount_budget", "budget"));

    if (!period || !costCenterId) {
      warnings.push(`Row ${i + 2}: missing period or cost_center_id — skipped`);
      return;
    }

    const variance    = amountActual - amountBudget;
    const variancePct = amountBudget !== 0 ? variance / amountBudget : 0;

    data.push({
      clientId,
      period,
      transactionId:   pick(row, "transaction_id", "id") || `${costCenterId}-${period}-${i}`,
      transactionType: "actual",
      costCenterId,
      costCenterName:  pick(row, "cost_center_name", "cost_center"),
      businessUnit,
      accountCode:     pick(row, "account_code", "gl_code", "account"),
      category,
      subcategory:     pick(row, "subcategory") || undefined,
      vendorId:        pick(row, "vendor_id") || undefined,
      vendorName:      pick(row, "vendor_name", "vendor") || undefined,
      description:     pick(row, "description", "desc") || undefined,
      amountActual,
      amountBudget,
      variance,
      variancePct,
      source,
    });
  });

  return { data, warnings };
}
