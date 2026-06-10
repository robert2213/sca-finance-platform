/**
 * Phase 6 — Actuals & Variance Query Functions
 *
 * All functions query the active adapter (Databricks or local SQLite).
 * Return shapes match the existing static-data helper contracts so that
 * dashboard pages require minimal changes.
 */

import { dbQuery } from "@/lib/databricks";
import type { Month, BusinessUnit, CostCategory } from "@/types/finance";

// ─── Types (mirror static-data helper return shapes) ──────────────────────────

export interface MonthlyTotal {
  month: Month;
  actual: number;
  budget: number;
  forecast: number;
}

export interface BUTotal {
  bu: BusinessUnit;
  actual: number;
  budget: number;
  forecast: number;
  variance: number;
  variancePct: number;
}

export interface CategoryTotal {
  category: CostCategory;
  actual: number;
  budget: number;
  variance: number;
}

export interface CostCenterDetail {
  costCenterId: string;
  costCenterName: string;
  businessUnit: BusinessUnit;
  category: CostCategory;
  month: Month;
  actual: number;
  budget: number;
  forecast: number;
  variance: number;
  variancePct: number;
}

// ─── SQL helpers ──────────────────────────────────────────────────────────────

const MONTH_NAMES: Record<string, Month> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

function toMonth(period: string): Month {
  return MONTH_NAMES[period.slice(5, 7)] ?? "Jan";
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Monthly budget vs actual vs forecast totals (all periods, or filtered by year). */
export async function getMonthlyTotals(
  year?: number,
  clientId: string = "demo-client"
): Promise<MonthlyTotal[]> {
  // Year filter uses a parameterized binding (not string interpolation) to avoid mixing
  // literal injection with parameterized values in the WHERE clause.
  const yearClause = year ? "AND CAST(substr(period, 1, 4) AS INTEGER) = ?" : "";
  const sql = `
    SELECT
      period,
      SUM(amount_actual)   AS actual,
      SUM(amount_budget)   AS budget,
      SUM(amount_forecast) AS forecast
    FROM fact_transactions
    WHERE transaction_type IN ('actual', 'budget')
    ${yearClause}
    AND client_id = ?
    GROUP BY period
    ORDER BY period
  `;
  const params: unknown[] = year ? [year, clientId] : [clientId];

  const result = await dbQuery<{
    period: string;
    actual: number;
    budget: number;
    forecast: number;
  }>(sql, params);

  return result.rows.map((r) => ({
    month: toMonth(r.period),
    actual: Number(r.actual) || 0,
    budget: Number(r.budget) || 0,
    forecast: Number(r.forecast) || 0,
  }));
}

/** YTD actuals by business unit with variance. */
export async function getByBusinessUnit(
  period?: string,
  clientId: string = "demo-client"
): Promise<BUTotal[]> {
  // Period filter uses a parameterized binding to avoid string injection.
  const periodClause = period ? "AND period <= ?" : "";
  const sql = `
    SELECT
      business_unit,
      SUM(amount_actual)   AS actual,
      SUM(amount_budget)   AS budget,
      SUM(amount_forecast) AS forecast
    FROM fact_transactions
    WHERE transaction_type IN ('actual', 'budget')
    ${periodClause}
    AND client_id = ?
    GROUP BY business_unit
    ORDER BY actual DESC
  `;
  const params: unknown[] = period ? [period, clientId] : [clientId];

  const result = await dbQuery<{
    business_unit: string;
    actual: number;
    budget: number;
    forecast: number;
  }>(sql, params);

  return result.rows.map((r) => {
    const actual = Number(r.actual) || 0;
    const budget = Number(r.budget) || 0;
    const variance = actual - budget;
    return {
      bu: r.business_unit as BusinessUnit,
      actual,
      budget,
      forecast: Number(r.forecast) || 0,
      variance,
      variancePct: budget > 0 ? variance / budget : 0,
    };
  });
}

/** YTD actuals by cost category. */
export async function getByCategory(
  period?: string,
  clientId: string = "demo-client"
): Promise<CategoryTotal[]> {
  const periodClause = period ? "AND period <= ?" : "";
  const sql = `
    SELECT
      category,
      SUM(amount_actual) AS actual,
      SUM(amount_budget) AS budget
    FROM fact_transactions
    WHERE transaction_type IN ('actual', 'budget')
    ${periodClause}
    AND client_id = ?
    GROUP BY category
    ORDER BY actual DESC
  `;
  const params: unknown[] = period ? [period, clientId] : [clientId];

  const result = await dbQuery<{
    category: string;
    actual: number;
    budget: number;
  }>(sql, params);

  return result.rows.map((r) => {
    const actual = Number(r.actual) || 0;
    const budget = Number(r.budget) || 0;
    return {
      category: r.category as CostCategory,
      actual,
      budget,
      variance: actual - budget,
    };
  });
}

/** Cost center detail for a specific period (for the FP&A variance table). */
export async function getActualsByPeriod(
  period: string,
  clientId: string = "demo-client"
): Promise<CostCenterDetail[]> {
  const sql = `
    SELECT
      cost_center_id,
      cost_center_name,
      business_unit,
      category,
      period,
      SUM(amount_actual)   AS actual,
      SUM(amount_budget)   AS budget,
      SUM(amount_forecast) AS forecast
    FROM fact_transactions
    WHERE period = ? AND transaction_type IN ('actual', 'budget') AND client_id = ?
    GROUP BY cost_center_id, cost_center_name, business_unit, category, period
    ORDER BY cost_center_id
  `;

  const result = await dbQuery<{
    cost_center_id: string;
    cost_center_name: string;
    business_unit: string;
    category: string;
    period: string;
    actual: number;
    budget: number;
    forecast: number;
  }>(sql, [period, clientId]);

  return result.rows.map((r) => {
    const actual   = Number(r.actual) || 0;
    const budget   = Number(r.budget) || 0;
    const variance = actual - budget;
    return {
      costCenterId:   r.cost_center_id,
      costCenterName: r.cost_center_name,
      businessUnit:   r.business_unit as BusinessUnit,
      category:       r.category as CostCategory,
      month:          toMonth(r.period),
      actual,
      budget,
      forecast:       Number(r.forecast) || 0,
      variance,
      variancePct:    budget > 0 ? variance / budget : 0,
    };
  });
}

/** Current closed reporting period — all YTD queries default to this cutoff. */
export const YTD_CUTOFF = "2026-05";

/** YTD totals — single aggregates, filtered to periods up to and including `period`. */
export async function getYTDSummary(
  clientId: string = "demo-client",
  period: string = YTD_CUTOFF
): Promise<{
  actual: number;
  budget: number;
  variance: number;
  variancePct: number;
}> {
  const sql = `
    SELECT
      SUM(amount_actual) AS actual,
      SUM(amount_budget) AS budget
    FROM fact_transactions
    WHERE transaction_type IN ('actual', 'budget') AND period <= ? AND client_id = ?
  `;
  const result = await dbQuery<{ actual: number; budget: number }>(sql, [period, clientId]);
  const actual   = Number(result.rows[0]?.actual) || 0;
  const budget   = Number(result.rows[0]?.budget) || 0;
  const variance = actual - budget;
  return { actual, budget, variance, variancePct: budget > 0 ? variance / budget : 0 };
}

/** Budget for a specific period. */
export async function getBudgetByPeriod(period: string, clientId: string = "demo-client") {
  return getActualsByPeriod(period, clientId);
}

/** Variance by category for a period. */
export async function getVarianceByCategory(
  period: string,
  clientId: string = "demo-client"
): Promise<CategoryTotal[]> {
  return getByCategory(period, clientId);
}
