import type { BudgetEntry, DataSource } from "@/lib/models/finance.types";
import type { MapResult } from "./gl.mapper";

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

export function mapBudget(
  rows: Record<string, string>[],
  clientId: string,
  source: DataSource = "upload"
): MapResult<BudgetEntry> {
  const data: BudgetEntry[] = [];
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    const period       = pick(row, "period_id", "period", "month");
    const costCenterId = pick(row, "cost_center_id", "cost_center", "cc_id");

    if (!period || !costCenterId) {
      warnings.push(`Row ${i + 2}: missing period or cost_center_id — skipped`);
      return;
    }

    data.push({
      clientId,
      period,
      costCenterId,
      costCenterName: pick(row, "cost_center_name", "cost_center"),
      businessUnit:   pick(row, "business_unit", "businessUnit", "bu"),
      accountCode:    pick(row, "account_code", "gl_code", "account"),
      category:       pick(row, "category"),
      subcategory:    pick(row, "subcategory") || undefined,
      amountBudget:   num(pick(row, "amount_budget", "budget", "amount")),
      source,
    });
  });

  return { data, warnings };
}
