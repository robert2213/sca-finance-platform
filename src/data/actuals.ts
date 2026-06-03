import type { ActualRecord, Month, BusinessUnit, CostCategory } from "@/types/finance";

// ─── Monthly Actuals — YTD through May 2026 ──────────────────────────────────
// All figures in USD. Budget = approved annual plan / 12. Variance = Actual - Budget.

const months: Month[] = ["Jan", "Feb", "Mar", "Apr", "May"];
const year = 2026;

interface RawRow {
  ccId: string;
  ccName: string;
  bu: BusinessUnit;
  category: CostCategory;
  budgets: number[];   // per month
  actuals: number[];   // per month
  forecasts: number[]; // per month (remaining months extrapolated)
}

const rawRows: RawRow[] = [
  // ── Infrastructure ────────────────────────────────────────────────────────
  { ccId: "CC-101", ccName: "Network & Telecom",      bu: "Infrastructure",        category: "Telecom",            budgets: [210000,210000,210000,210000,210000], actuals: [214500,208000,221000,218000,215000], forecasts: [212000,210000,210000,210000,210000] },
  { ccId: "CC-102", ccName: "Data Center Ops",        bu: "Infrastructure",        category: "Facilities",         budgets: [185000,185000,185000,185000,185000], actuals: [182000,186500,184000,190000,193000], forecasts: [185000,185000,185000,185000,185000] },
  { ccId: "CC-103", ccName: "Compute & Storage",      bu: "Infrastructure",        category: "Hardware",           budgets: [320000,320000,320000,320000,320000], actuals: [310000,325000,318000,340000,348000], forecasts: [325000,320000,320000,320000,320000] },

  // ── Security ──────────────────────────────────────────────────────────────
  { ccId: "CC-201", ccName: "Cybersecurity Ops",      bu: "Security",              category: "Software",           budgets: [145000,145000,145000,145000,145000], actuals: [147000,144000,148000,152000,155000], forecasts: [148000,145000,145000,145000,145000] },
  { ccId: "CC-202", ccName: "Identity & Access Mgmt", bu: "Security",              category: "Software",           budgets: [88000,88000,88000,88000,88000],     actuals: [86000,89000,91000,90000,94000],     forecasts: [89000,88000,88000,88000,88000]   },
  { ccId: "CC-203", ccName: "Security Engineering",   bu: "Security",              category: "Labor",              budgets: [220000,220000,220000,220000,220000], actuals: [218000,222000,225000,224000,228000], forecasts: [221000,220000,220000,220000,220000] },

  // ── Applications ──────────────────────────────────────────────────────────
  { ccId: "CC-301", ccName: "ERP & Finance Systems",  bu: "Applications",          category: "Software",           budgets: [175000,175000,175000,175000,175000], actuals: [174000,176000,178000,181000,183000], forecasts: [177000,175000,175000,175000,175000] },
  { ccId: "CC-302", ccName: "HRIS & Workforce Tools", bu: "Applications",          category: "Software",           budgets: [92000,92000,92000,92000,92000],     actuals: [90000,93000,92000,95000,97000],     forecasts: [93000,92000,92000,92000,92000]   },
  { ccId: "CC-303", ccName: "CRM & Sales Tech",       bu: "Applications",          category: "Software",           budgets: [110000,110000,110000,110000,110000], actuals: [108000,111000,115000,118000,122000], forecasts: [113000,110000,110000,110000,110000] },

  // ── Data & Analytics ──────────────────────────────────────────────────────
  { ccId: "CC-401", ccName: "Data Platform",          bu: "Data & Analytics",      category: "Cloud",              budgets: [260000,260000,260000,260000,260000], actuals: [255000,262000,271000,280000,294000], forecasts: [268000,262000,263000,262000,261000] },
  { ccId: "CC-402", ccName: "BI & Reporting",         bu: "Data & Analytics",      category: "Software",           budgets: [78000,78000,78000,78000,78000],     actuals: [77000,79000,80000,82000,83000],     forecasts: [80000,78000,78000,78000,78000]   },

  // ── Cloud Engineering ─────────────────────────────────────────────────────
  { ccId: "CC-501", ccName: "AWS Production",         bu: "Cloud Engineering",     category: "Cloud",              budgets: [380000,380000,380000,380000,380000], actuals: [372000,385000,398000,412000,428000], forecasts: [390000,385000,382000,380000,380000] },
  { ccId: "CC-502", ccName: "Azure Dev/Test",         bu: "Cloud Engineering",     category: "Cloud",              budgets: [95000,95000,95000,95000,95000],     actuals: [93000,97000,101000,106000,112000],  forecasts: [100000,98000,97000,96000,95000]  },
  { ccId: "CC-503", ccName: "GCP AI/ML Workloads",   bu: "Cloud Engineering",     category: "Cloud",              budgets: [120000,120000,120000,120000,120000], actuals: [118000,123000,129000,136000,144000], forecasts: [128000,124000,122000,121000,120000] },

  // ── IT Operations ─────────────────────────────────────────────────────────
  { ccId: "CC-601", ccName: "Help Desk & Support",    bu: "IT Operations",         category: "Labor",              budgets: [165000,165000,165000,165000,165000], actuals: [163000,166000,165000,167000,168000], forecasts: [166000,165000,165000,165000,165000] },
  { ccId: "CC-602", ccName: "ITSM & Tooling",         bu: "IT Operations",         category: "Software",           budgets: [55000,55000,55000,55000,55000],     actuals: [54000,55000,56000,57000,58000],     forecasts: [56000,55000,55000,55000,55000]   },

  // ── Enterprise Architecture ───────────────────────────────────────────────
  { ccId: "CC-701", ccName: "EA & Strategy",          bu: "Enterprise Architecture", category: "Professional Services", budgets: [130000,130000,130000,130000,130000], actuals: [128000,132000,135000,138000,140000], forecasts: [133000,130000,130000,130000,130000] },
];

export const actuals: ActualRecord[] = rawRows.flatMap((row) =>
  months.map((month, i) => {
    const actual   = row.actuals[i];
    const budget   = row.budgets[i];
    const forecast = row.forecasts[i];
    const variance = actual - budget;
    return {
      costCenterId:   row.ccId,
      costCenterName: row.ccName,
      businessUnit:   row.bu,
      category:       row.category,
      month,
      year,
      actual,
      budget,
      forecast,
      variance,
      variancePct: budget > 0 ? variance / budget : 0,
    };
  })
);

// ─── Convenience aggregates ───────────────────────────────────────────────────

export function getYTDActual(): number {
  return actuals.reduce((s, r) => s + r.actual, 0);
}

export function getYTDBudget(): number {
  return actuals.reduce((s, r) => s + r.budget, 0);
}

export function getYTDVariance(): number {
  return getYTDActual() - getYTDBudget();
}

export function getMonthlyTotals() {
  return months.map((month) => {
    const rows = actuals.filter((r) => r.month === month);
    return {
      month,
      actual:   rows.reduce((s, r) => s + r.actual, 0),
      budget:   rows.reduce((s, r) => s + r.budget, 0),
      forecast: rows.reduce((s, r) => s + r.forecast, 0),
    };
  });
}

export function getByBusinessUnit() {
  const buMap = new Map<BusinessUnit, { actual: number; budget: number; forecast: number }>();
  for (const r of actuals) {
    const existing = buMap.get(r.businessUnit) ?? { actual: 0, budget: 0, forecast: 0 };
    buMap.set(r.businessUnit, {
      actual:   existing.actual   + r.actual,
      budget:   existing.budget   + r.budget,
      forecast: existing.forecast + r.forecast,
    });
  }
  return Array.from(buMap.entries()).map(([bu, vals]) => ({ bu, ...vals, variance: vals.actual - vals.budget }));
}

export function getByCategory() {
  const catMap = new Map<CostCategory, { actual: number; budget: number }>();
  for (const r of actuals) {
    const existing = catMap.get(r.category) ?? { actual: 0, budget: 0 };
    catMap.set(r.category, { actual: existing.actual + r.actual, budget: existing.budget + r.budget });
  }
  return Array.from(catMap.entries()).map(([category, vals]) => ({ category, ...vals }));
}
