import { dbQuery } from "@/lib/databricks";
import type { BusinessUnit, HCStatus } from "@/types/finance";

export interface HeadcountRow {
  id: string;
  title: string;
  businessUnit: BusinessUnit;
  level: string;
  status: HCStatus;
  location: string;
  openDate?: string;
  fillDate?: string;
  annualSalary: number;
  isBackfill: boolean;
}

export interface HCSummary {
  total: number;
  filled: number;
  open: number;
  pendingOffer: number;
  onLeave: number;
  fillRate: number;
  totalAnnualSalaryBudget: number;
}

export interface HCByBU {
  bu: BusinessUnit;
  total: number;
  filled: number;
  open: number;
  fillRate: number;
  salaryBudget: number;
}

export async function getHeadcount(clientId: string = "demo-client"): Promise<HeadcountRow[]> {
  const sql = `
    SELECT
      position_id, title, business_unit, level, status,
      location, open_date, fill_date, annual_salary, is_backfill
    FROM dim_headcount
    WHERE client_id = ?
    ORDER BY business_unit, status, title
  `;
  const result = await dbQuery<{
    position_id: string;
    title: string;
    business_unit: string;
    level: string;
    status: string;
    location: string | null;
    open_date: string | null;
    fill_date: string | null;
    annual_salary: number;
    is_backfill: number | boolean;
  }>(sql, [clientId]);

  return result.rows.map((r) => ({
    id:           r.position_id,
    title:        r.title,
    businessUnit: r.business_unit as BusinessUnit,
    level:        r.level,
    status:       r.status as HCStatus,
    location:     r.location ?? "",
    openDate:     r.open_date ?? undefined,
    fillDate:     r.fill_date ?? undefined,
    annualSalary: Number(r.annual_salary) || 0,
    isBackfill:   Boolean(r.is_backfill),
  }));
}

export async function getHCSummary(clientId: string = "demo-client"): Promise<HCSummary> {
  const sql = `
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Filled'        THEN 1 ELSE 0 END) AS filled,
      SUM(CASE WHEN status = 'Open'           THEN 1 ELSE 0 END) AS open,
      SUM(CASE WHEN status = 'Pending Offer'  THEN 1 ELSE 0 END) AS pending_offer,
      SUM(CASE WHEN status = 'On Leave'       THEN 1 ELSE 0 END) AS on_leave,
      SUM(annual_salary) AS total_salary
    FROM dim_headcount
    WHERE client_id = ?
  `;
  const result = await dbQuery<{
    total: number;
    filled: number;
    open: number;
    pending_offer: number;
    on_leave: number;
    total_salary: number;
  }>(sql, [clientId]);

  const r = result.rows[0] ?? { total: 0, filled: 0, open: 0, pending_offer: 0, on_leave: 0, total_salary: 0 };
  const total = Number(r.total) || 0;
  const filled = Number(r.filled) || 0;
  return {
    total,
    filled,
    open:         Number(r.open) || 0,
    pendingOffer: Number(r.pending_offer) || 0,
    onLeave:      Number(r.on_leave) || 0,
    fillRate:     total > 0 ? filled / total : 0,
    totalAnnualSalaryBudget: Number(r.total_salary) || 0,
  };
}

export async function getOpenReqs(clientId: string = "demo-client"): Promise<HeadcountRow[]> {
  const sql = `
    SELECT
      position_id, title, business_unit, level, status,
      location, open_date, fill_date, annual_salary, is_backfill
    FROM dim_headcount
    WHERE status IN ('Open', 'Pending Offer') AND client_id = ?
    ORDER BY business_unit, title
  `;
  const result = await dbQuery<{
    position_id: string;
    title: string;
    business_unit: string;
    level: string;
    status: string;
    location: string | null;
    open_date: string | null;
    fill_date: string | null;
    annual_salary: number;
    is_backfill: number | boolean;
  }>(sql, [clientId]);

  return result.rows.map((r) => ({
    id:           r.position_id,
    title:        r.title,
    businessUnit: r.business_unit as BusinessUnit,
    level:        r.level,
    status:       r.status as HCStatus,
    location:     r.location ?? "",
    openDate:     r.open_date ?? undefined,
    fillDate:     r.fill_date ?? undefined,
    annualSalary: Number(r.annual_salary) || 0,
    isBackfill:   Boolean(r.is_backfill),
  }));
}

export async function getHCByBusinessUnit(clientId: string = "demo-client"): Promise<HCByBU[]> {
  const sql = `
    SELECT
      business_unit,
      COUNT(*) AS total,
      SUM(CASE WHEN status = 'Filled' THEN 1 ELSE 0 END) AS filled,
      SUM(CASE WHEN status = 'Open'   THEN 1 ELSE 0 END) AS open,
      SUM(annual_salary) AS total_salary
    FROM dim_headcount
    WHERE client_id = ?
    GROUP BY business_unit
    ORDER BY business_unit
  `;
  const result = await dbQuery<{
    business_unit: string;
    total: number;
    filled: number;
    open: number;
    total_salary: number;
  }>(sql, [clientId]);

  return result.rows.map((r) => {
    const total  = Number(r.total) || 0;
    const filled = Number(r.filled) || 0;
    return {
      bu:           r.business_unit as BusinessUnit,
      total,
      filled,
      open:         Number(r.open) || 0,
      fillRate:     total > 0 ? filled / total : 0,
      salaryBudget: Number(r.total_salary) || 0,
    };
  });
}

export async function getHeadcountCosts(period: string, clientId: string = "demo-client") {
  const sql = `
    SELECT
      business_unit,
      SUM(amount_actual) AS labor_actual,
      SUM(amount_budget) AS labor_budget
    FROM fact_transactions
    WHERE category = 'Labor' AND period <= ? AND client_id = ?
    GROUP BY business_unit
    ORDER BY labor_actual DESC
  `;
  const result = await dbQuery<{
    business_unit: string;
    labor_actual: number;
    labor_budget: number;
  }>(sql, [period, clientId]);

  return result.rows.map((r) => ({
    businessUnit: r.business_unit as BusinessUnit,
    laborActual:  Number(r.labor_actual) || 0,
    laborBudget:  Number(r.labor_budget) || 0,
  }));
}
