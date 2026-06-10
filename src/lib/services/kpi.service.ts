/**
 * Sprint 2 Phase 3A — Shared KPI Service
 *
 * Single source of truth for all dashboard KPI numbers. All consumers
 * (StatsBanner, dashboard page, future agent surfaces) call getKPIBundle()
 * instead of importing individual query functions or static data files.
 *
 * Data path: DB query layer only (Databricks or local SQLite adapter).
 * Static data files in src/data/ are NOT referenced here.
 *
 * Cloud proxy: reads fact_transactions WHERE category = 'Cloud' via
 * getByCategory(). Returns 0/0 with no error if the category row is absent
 * from the dataset (documented fallback — full dim_cloud_provider table is
 * a deferred sprint item).
 */

import { getYTDSummary, getByCategory } from "@/lib/queries/actuals";
import { getHCSummary } from "@/lib/queries/headcount";
import { getContractors } from "@/lib/queries/contractors";
import { generateRiskFlagsAsync } from "@/lib/riskEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface KPIBundle {
  // YTD spend vs budget
  ytdActual:      number;
  ytdBudget:      number;
  ytdVariance:    number;   // actual - budget (positive = over budget)
  ytdVariancePct: number;   // variance / budget

  // Headcount
  headcountFilled: number;
  headcountTotal:  number;
  openReqs:        number;  // Open + Pending Offer positions

  // External labor
  externalLaborActual: number;
  externalLaborBudget: number;
  contractorCount:     number;  // number of active contractor records

  // Cloud spend (category proxy from fact_transactions WHERE category = 'Cloud')
  // Both fields are 0 when no 'Cloud' category row exists in the dataset.
  cloudActual: number;
  cloudBudget: number;

  // Risk summary
  riskCount:      number;  // critical-severity flags only
  totalRiskCount: number;  // all flags regardless of severity
}

// ─── Service function ─────────────────────────────────────────────────────────

/**
 * Fetches all KPI figures in a single parallel call.
 *
 * Internally calls five query functions via Promise.all:
 *   getYTDSummary     → ytdActual / ytdBudget / ytdVariance / ytdVariancePct
 *   getHCSummary      → headcountFilled / headcountTotal / openReqs
 *   getContractors    → externalLaborActual / externalLaborBudget / contractorCount
 *   getByCategory     → cloudActual / cloudBudget  (category = 'Cloud' row)
 *   generateRiskFlagsAsync → riskCount / totalRiskCount
 *
 * Cloud fallback: if no 'Cloud' category row is returned by getByCategory(),
 * cloudActual and cloudBudget are both 0. No error is thrown; callers should
 * treat 0/0 as "data not available" and render accordingly.
 */
export async function getKPIBundle(
  clientId: string = "demo-client"
): Promise<KPIBundle> {
  const [ytd, hc, contractors, categories, risks] = await Promise.all([
    getYTDSummary(clientId),
    getHCSummary(clientId),
    getContractors(clientId),
    getByCategory(undefined, clientId),
    generateRiskFlagsAsync(clientId),
  ]);

  const cloudRow    = categories.find((c) => c.category === "Cloud");
  const cloudActual = cloudRow?.actual ?? 0;
  const cloudBudget = cloudRow?.budget ?? 0;

  const externalLaborActual = contractors.reduce((s, c) => s + c.ytdSpend, 0);
  const externalLaborBudget = contractors.reduce((s, c) => s + c.budget, 0);

  return {
    ytdActual:      ytd.actual,
    ytdBudget:      ytd.budget,
    ytdVariance:    ytd.variance,
    ytdVariancePct: ytd.variancePct,

    headcountFilled: hc.filled,
    headcountTotal:  hc.total,
    openReqs:        hc.open + hc.pendingOffer,

    externalLaborActual,
    externalLaborBudget,
    contractorCount: contractors.length,

    cloudActual,
    cloudBudget,

    riskCount:      risks.filter((r) => r.severity === "critical").length,
    totalRiskCount: risks.length,
  };
}
