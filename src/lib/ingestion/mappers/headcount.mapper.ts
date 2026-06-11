import type { HeadcountRecord, HeadcountStatus, DataSource } from "@/lib/models/finance.types";
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

const VALID_STATUSES: HeadcountStatus[] = ["Filled", "Open", "On Leave", "Terminated"];

export function mapHeadcount(
  rows: Record<string, string>[],
  clientId: string,
  period: string,
  source: DataSource = "upload"
): MapResult<HeadcountRecord> {
  const data: HeadcountRecord[] = [];
  const warnings: string[] = [];

  rows.forEach((row, i) => {
    const positionId   = pick(row, "position_id", "id", "employee_id");
    const rawStatus    = pick(row, "status");
    const status       = VALID_STATUSES.includes(rawStatus as HeadcountStatus)
      ? (rawStatus as HeadcountStatus)
      : "Open";

    if (!positionId) {
      warnings.push(`Row ${i + 2}: missing position_id — skipped`);
      return;
    }

    if (rawStatus && !VALID_STATUSES.includes(rawStatus as HeadcountStatus)) {
      warnings.push(`Row ${i + 2}: unrecognized status "${rawStatus}", defaulted to "Open"`);
    }

    data.push({
      clientId,
      period,
      positionId,
      title:         pick(row, "title", "job_title", "role"),
      businessUnit:  pick(row, "business_unit", "bu"),
      department:    pick(row, "department", "dept"),
      costCenterId:  pick(row, "cost_center_id", "cost_center"),
      level:         pick(row, "level", "grade") || undefined,
      status,
      annualSalary:  num(pick(row, "annual_salary", "salary", "base_salary")),
      managerId:     pick(row, "manager_id", "manager") || undefined,
      hireDate:      pick(row, "hire_date", "start_date") || undefined,
      termDate:      pick(row, "term_date", "end_date") || undefined,
      source,
    });
  });

  return { data, warnings };
}
