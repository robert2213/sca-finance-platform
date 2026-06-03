/**
 * dataContext.ts
 *
 * Builds a rich, pre-computed financial snapshot that every agent response
 * can reference. Calling this once per request prevents repeated re-computation
 * across the response library functions.
 */

import {
  getYTDActual, getYTDBudget, getYTDVariance,
  getMonthlyTotals, getByBusinessUnit, getByCategory, actuals,
} from "@/data/actuals";
import {
  contractors, getTotalContractorYTDSpend, getTotalContractorBudget,
  getOverBudgetContractors, getEndingSoonContractors, getContractorsByBU,
} from "@/data/externalLabor";
import {
  vendors, getVendorsExpiringSoon, getTotalAnnualCommitment,
  getTotalYTDVendorSpend, getTopVendorsBySpend, getVendorsByRisk,
} from "@/data/vendors";
import {
  headcount, getHeadcountSummary, getOpenReqs,
  getHCByBusinessUnit, getTotalAnnualSalaryBudget,
} from "@/data/headcount";
export { headcount } from "@/data/headcount";
export { contractors } from "@/data/externalLabor";
import {
  getTotalCloudYTD, getTotalCloudBudgetYTD, getCloudByProvider,
  getTotalCloudSpendByMonth,
} from "@/data/cloudSpend";
import { formatCurrency, formatPercent, formatDate, daysUntil } from "@/lib/formatters";
import { generateRiskFlags, generateRecommendedActions } from "@/lib/riskEngine";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FinanceSnapshot {
  // ── Overall ──────────────────────────────────────────────────────────────
  ytdActual:      number;
  ytdBudget:      number;
  ytdVariance:    number;
  ytdVariancePct: number;
  fullYearForecast: number;
  fullYearBudget:   number;
  periodLabel:    string;

  // ── Monthly trend ─────────────────────────────────────────────────────────
  monthly:        ReturnType<typeof getMonthlyTotals>;
  currentMonth:   { month: string; actual: number; budget: number; forecast: number };
  priorMonth:     { month: string; actual: number; budget: number; forecast: number };
  momGrowthPct:   number;  // month-over-month actual growth

  // ── By business unit ──────────────────────────────────────────────────────
  byBU: ReturnType<typeof getByBusinessUnit>;
  topOverBU:  { bu: string; variance: number; variancePct: number } | null;
  topFavBU:   { bu: string; variance: number; variancePct: number } | null;

  // ── Cloud ─────────────────────────────────────────────────────────────────
  cloudYTD:       number;
  cloudBudget:    number;
  cloudVariance:  number;
  cloudVariancePct: number;
  cloudByProvider: ReturnType<typeof getCloudByProvider>;
  cloudMoMGrowth: number;  // May vs April cloud spend growth rate

  // ── External Labor ────────────────────────────────────────────────────────
  laborYTD:       number;
  laborBudget:    number;
  laborVariance:  number;
  overBudgetContractors: ReturnType<typeof getOverBudgetContractors>;
  endingSoonContractors: ReturnType<typeof getEndingSoonContractors>;
  laborByBU:      ReturnType<typeof getContractorsByBU>;
  totalExcessLabor: number;

  // ── Vendors ───────────────────────────────────────────────────────────────
  vendorYTDSpend:    number;
  vendorCommitment:  number;
  expiringVendors90: ReturnType<typeof getVendorsExpiringSoon>;
  expiringVendors180: ReturnType<typeof getVendorsExpiringSoon>;
  highRiskVendors:   ReturnType<typeof getVendorsByRisk>;
  topVendors:        ReturnType<typeof getTopVendorsBySpend>;

  // ── Headcount ─────────────────────────────────────────────────────────────
  hcSummary:      ReturnType<typeof getHeadcountSummary>;
  fillRate:       number;
  openReqs:       ReturnType<typeof getOpenReqs>;
  salaryBudget:   number;
  openReqSalaryAtRisk: number;  // salary budget for open positions
  hcByBU:         ReturnType<typeof getHCByBusinessUnit>;

  // ── Raw arrays (for agent responses that need full detail) ───────────────
  headcount:   typeof headcount;
  contractors: typeof contractors;

  // ── Risk & actions ────────────────────────────────────────────────────────
  risks:     ReturnType<typeof generateRiskFlags>;
  actions:   ReturnType<typeof generateRecommendedActions>;

  // ── Formatting helpers ────────────────────────────────────────────────────
  fmt: typeof formatCurrency;
  pct: typeof formatPercent;
  dt:  typeof formatDate;
  daysUntil: typeof daysUntil;
}

// ─── Builder ──────────────────────────────────────────────────────────────────

let _cache: FinanceSnapshot | null = null;

export function getFinanceSnapshot(): FinanceSnapshot {
  if (_cache) return _cache;

  const ytdActual      = getYTDActual();
  const ytdBudget      = getYTDBudget();
  const ytdVariance    = getYTDVariance();
  const ytdVariancePct = ytdBudget > 0 ? ytdVariance / ytdBudget : 0;

  const monthly = getMonthlyTotals();
  const currentMonth = monthly[monthly.length - 1];
  const priorMonth   = monthly[monthly.length - 2];
  const momGrowthPct = priorMonth.actual > 0
    ? (currentMonth.actual - priorMonth.actual) / priorMonth.actual
    : 0;

  const byBU       = getByBusinessUnit();
  const overBUs    = byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance);
  const favBUs     = byBU.filter(b => b.variance < 0).sort((a, b) => a.variance - b.variance);
  const topOverBU  = overBUs[0]
    ? { bu: overBUs[0].bu, variance: overBUs[0].variance, variancePct: overBUs[0].budget > 0 ? overBUs[0].variance / overBUs[0].budget : 0 }
    : null;
  const topFavBU   = favBUs[0]
    ? { bu: favBUs[0].bu, variance: favBUs[0].variance, variancePct: favBUs[0].budget > 0 ? favBUs[0].variance / favBUs[0].budget : 0 }
    : null;

  const cloudYTD          = getTotalCloudYTD();
  const cloudBudget       = getTotalCloudBudgetYTD();
  const cloudVariance     = cloudYTD - cloudBudget;
  const cloudVariancePct  = cloudBudget > 0 ? cloudVariance / cloudBudget : 0;
  const cloudByMonth      = getTotalCloudSpendByMonth();
  const cloudMay          = cloudByMonth[cloudByMonth.length - 1]?.total ?? 0;
  const cloudApr          = cloudByMonth[cloudByMonth.length - 2]?.total ?? 0;
  const cloudMoMGrowth    = cloudApr > 0 ? (cloudMay - cloudApr) / cloudApr : 0;
  const cloudByProvider   = getCloudByProvider();

  const laborYTD               = getTotalContractorYTDSpend();
  const laborBudget            = getTotalContractorBudget();
  const laborVariance          = laborYTD - laborBudget;
  const overBudgetContractors  = getOverBudgetContractors();
  const endingSoonContractors  = getEndingSoonContractors();
  const laborByBU              = getContractorsByBU();
  const totalExcessLabor       = overBudgetContractors.reduce((s, c) => s + Math.max(0, c.ytdSpend - c.budget), 0);

  const vendorYTDSpend      = getTotalYTDVendorSpend();
  const vendorCommitment    = getTotalAnnualCommitment();
  const expiringVendors90   = getVendorsExpiringSoon(90);
  const expiringVendors180  = getVendorsExpiringSoon(180);
  const highRiskVendors     = getVendorsByRisk("High");
  const topVendors          = getTopVendorsBySpend(5);

  const hcSummary          = getHeadcountSummary();
  const fillRate           = hcSummary.total > 0 ? hcSummary.filled / hcSummary.total : 0;
  const openReqs           = getOpenReqs();
  const salaryBudget       = getTotalAnnualSalaryBudget();
  const hcByBU             = getHCByBusinessUnit();
  const openReqSalaryAtRisk = openReqs.reduce((s, h) => s + h.annualSalary / 12 * 7, 0); // remaining months

  // Full-year projections (actuals pace + known commitments)
  const fullYearBudget   = ytdBudget * (12 / 5);
  const fullYearForecast = ytdActual * (12 / 5) * 0.97; // slight deceleration assumption

  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();

  _cache = {
    headcount,
    contractors,
    ytdActual, ytdBudget, ytdVariance, ytdVariancePct,
    fullYearForecast, fullYearBudget, periodLabel: "YTD May 2026",
    monthly, currentMonth, priorMonth, momGrowthPct,
    byBU, topOverBU, topFavBU,
    cloudYTD, cloudBudget, cloudVariance, cloudVariancePct,
    cloudByProvider, cloudMoMGrowth,
    laborYTD, laborBudget, laborVariance, overBudgetContractors,
    endingSoonContractors, laborByBU, totalExcessLabor,
    vendorYTDSpend, vendorCommitment, expiringVendors90,
    expiringVendors180, highRiskVendors, topVendors,
    hcSummary, fillRate, openReqs, salaryBudget, openReqSalaryAtRisk, hcByBU,
    risks, actions,
    fmt: formatCurrency, pct: formatPercent, dt: formatDate, daysUntil,
  };

  return _cache;
}

// Clear cache (useful for testing or when data changes)
export function clearSnapshotCache(): void { _cache = null; }
