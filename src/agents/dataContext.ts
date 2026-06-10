/**
 * dataContext.ts
 *
 * Builds a rich, pre-computed financial snapshot that every agent response
 * can reference. Calling this once per request prevents repeated re-computation
 * across the response library functions.
 */

import {
  getYTDActual, getYTDBudget, getYTDVariance,
  getMonthlyTotals, getByBusinessUnit,
} from "@/data/actuals";
import {
  contractors, getTotalContractorYTDSpend, getTotalContractorBudget,
  getOverBudgetContractors, getEndingSoonContractors, getContractorsByBU,
} from "@/data/externalLabor";
import {
  getVendorsExpiringSoon, getTotalAnnualCommitment,
  getTotalYTDVendorSpend, getTopVendorsBySpend, getVendorsByRisk,
} from "@/data/vendors";
import {
  headcount, getHeadcountSummary, getOpenReqs,
  getHCByBusinessUnit, getTotalAnnualSalaryBudget,
} from "@/data/headcount";
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

// ─── DB-backed snapshot (Sprint 2 Phase 1) ────────────────────────────────────
// Additive companion to getFinanceSnapshot(). Calls live DB queries and maps
// the results to the same FinanceSnapshot shape so the agent pipeline is
// unchanged. getFinanceSnapshot() / mock path are preserved and untouched.

import {
  getYTDSummary as dbGetYTDSummary,
  getMonthlyTotals as dbGetMonthlyTotals,
  getByBusinessUnit as dbGetByBU,
  YTD_START,
  YTD_CUTOFF,
} from "@/lib/queries/actuals";
import { getVendors as dbGetVendors } from "@/lib/queries/vendors";
import {
  getHeadcount as dbGetHeadcount,
  getHCSummary as dbGetHCSummary,
  getOpenReqs as dbGetOpenReqs,
  getHCByBusinessUnit as dbGetHCByBU,
} from "@/lib/queries/headcount";
import {
  getContractors as dbGetContractors,
  getContractorsByBU as dbGetContractorsByBU,
} from "@/lib/queries/contractors";
import { dbQuery } from "@/lib/databricks";

/**
 * Async DB-backed companion to getFinanceSnapshot().
 *
 * Calls all 5 query modules in parallel (Promise.all), maps DB row types to
 * the FinanceSnapshot shape, and preserves the risk/action engines unchanged.
 *
 * Cloud spend is a proxy from fact_transactions WHERE category = 'Cloud'
 * (provider-level breakdown is deferred until dim_cloud_provider is built).
 *
 * clientId defaults to "demo-client" until Sprint 3 Clerk auth lands and
 * the session provides the real tenant ID.
 */
export async function buildSnapshotFromDB(
  clientId: string = "demo-client"
): Promise<FinanceSnapshot> {
  const [
    ytdSummary,
    monthlyTotals,
    buTotals,
    vendorsData,
    allHeadcount,
    hcSummaryData,
    openReqsData,
    hcByBUData,
    contractorsData,
    contractorsByBUData,
    cloudResult,
  ] = await Promise.all([
    dbGetYTDSummary(clientId),
    dbGetMonthlyTotals(2026, clientId),
    dbGetByBU(YTD_CUTOFF, clientId),
    dbGetVendors(clientId),
    dbGetHeadcount(clientId),
    dbGetHCSummary(clientId),
    dbGetOpenReqs(clientId),
    dbGetHCByBU(clientId),
    dbGetContractors(clientId),
    dbGetContractorsByBU(clientId),
    // Cloud proxy: fact_transactions WHERE category = 'Cloud', scoped to YTD window.
    // dim_cloud_provider / provider breakdown is a deferred sprint item.
    dbQuery<{ actual: number; budget: number }>(
      `SELECT SUM(amount_actual) AS actual, SUM(amount_budget) AS budget
       FROM fact_transactions
       WHERE category = 'Cloud' AND transaction_type IN ('actual', 'budget')
         AND period >= ? AND period <= ? AND client_id = ?`,
      [YTD_START, YTD_CUTOFF, clientId]
    ),
  ]);

  // ── Overall YTD ─────────────────────────────────────────────────────────────
  const ytdActual      = ytdSummary.actual;
  const ytdBudget      = ytdSummary.budget;
  const ytdVariance    = ytdSummary.variance;
  const ytdVariancePct = ytdSummary.variancePct;

  // ── Monthly trend ────────────────────────────────────────────────────────────
  const numMonths    = Math.max(1, monthlyTotals.length);
  const currentMonth = monthlyTotals[monthlyTotals.length - 1]
    ?? { month: "Jan" as const, actual: 0, budget: 0, forecast: 0 };
  const priorMonth   = monthlyTotals[monthlyTotals.length - 2]
    ?? { month: "Jan" as const, actual: 0, budget: 0, forecast: 0 };
  const momGrowthPct = priorMonth.actual > 0
    ? (currentMonth.actual - priorMonth.actual) / priorMonth.actual
    : 0;

  const periodLabel = monthlyTotals.length > 0
    ? `YTD ${currentMonth.month} ${new Date().getFullYear()}`
    : "YTD";

  // ── Full-year projections (run-rate + slight deceleration assumption) ────────
  const fullYearBudget   = ytdBudget * (12 / numMonths);
  const fullYearForecast = ytdActual  * (12 / numMonths) * 0.97;

  // ── By business unit ─────────────────────────────────────────────────────────
  const overBUs   = buTotals.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance);
  const favBUs    = buTotals.filter(b => b.variance < 0).sort((a, b) => a.variance - b.variance);
  const topOverBU = overBUs[0]
    ? { bu: overBUs[0].bu, variance: overBUs[0].variance, variancePct: overBUs[0].variancePct }
    : null;
  const topFavBU  = favBUs[0]
    ? { bu: favBUs[0].bu, variance: favBUs[0].variance, variancePct: favBUs[0].variancePct }
    : null;

  // ── Cloud (proxy from fact_transactions) ─────────────────────────────────────
  const cloudYTD         = Number(cloudResult.rows[0]?.actual) || 0;
  const cloudBudget      = Number(cloudResult.rows[0]?.budget) || 0;
  const cloudVariance    = cloudYTD - cloudBudget;
  const cloudVariancePct = cloudBudget > 0 ? cloudVariance / cloudBudget : 0;
  // Provider breakdown deferred (no dim_cloud_provider table yet).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cloudByProvider  = [] as unknown as FinanceSnapshot["cloudByProvider"];
  const cloudMoMGrowth   = 0; // requires cloud-by-month query — deferred to Phase 2

  // ── External labor ────────────────────────────────────────────────────────────
  const laborYTD    = contractorsData.reduce((s, c) => s + c.ytdSpend, 0);
  const laborBudget = contractorsData.reduce((s, c) => s + c.budget, 0);
  const laborVariance = laborYTD - laborBudget;

  const overBudgetContractors = contractorsData.filter(c => c.ytdSpend > c.budget);
  const totalExcessLabor      = overBudgetContractors.reduce((s, c) => s + Math.max(0, c.ytdSpend - c.budget), 0);

  const now        = new Date();
  const cutoff60   = new Date(now);
  cutoff60.setDate(cutoff60.getDate() + 60);
  const cutoff60Str = cutoff60.toISOString().slice(0, 10);
  const endingSoonContractors = contractorsData.filter(
    c => c.endDate && c.endDate <= cutoff60Str && c.status !== "On Hold"
  );

  // ── Vendors ──────────────────────────────────────────────────────────────────
  const vendorYTDSpend    = vendorsData.reduce((s, v) => s + v.ytdSpend, 0);
  const vendorCommitment  = vendorsData.reduce((s, v) => s + v.annualValue, 0);

  const todayStr   = now.toISOString().slice(0, 10);
  const in90Days   = new Date(now.getTime() + 90  * 86400000).toISOString().slice(0, 10);
  const in180Days  = new Date(now.getTime() + 180 * 86400000).toISOString().slice(0, 10);

  const expiringVendors90  = vendorsData.filter(v => v.contractEnd > todayStr && v.contractEnd <= in90Days);
  const expiringVendors180 = vendorsData.filter(v => v.contractEnd > todayStr && v.contractEnd <= in180Days);
  const highRiskVendors    = vendorsData.filter(v => v.riskLevel === "High");
  const topVendors         = [...vendorsData].sort((a, b) => b.ytdSpend - a.ytdSpend).slice(0, 5);

  // ── Headcount ────────────────────────────────────────────────────────────────
  const fillRate             = hcSummaryData.fillRate;
  const salaryBudget         = hcSummaryData.totalAnnualSalaryBudget;
  const openReqSalaryAtRisk  = openReqsData.reduce((s, h) => s + h.annualSalary / 12 * 7, 0);

  // ── Risk & actions (static engines preserved — Phase 1 scope) ────────────────
  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();

  return {
    ytdActual, ytdBudget, ytdVariance, ytdVariancePct,
    fullYearForecast, fullYearBudget, periodLabel,
    monthly:      monthlyTotals as unknown as FinanceSnapshot["monthly"],
    currentMonth, priorMonth, momGrowthPct,
    byBU:         buTotals as unknown as FinanceSnapshot["byBU"],
    topOverBU, topFavBU,
    cloudYTD, cloudBudget, cloudVariance, cloudVariancePct,
    cloudByProvider, cloudMoMGrowth,
    laborYTD, laborBudget, laborVariance,
    overBudgetContractors: overBudgetContractors as unknown as FinanceSnapshot["overBudgetContractors"],
    endingSoonContractors: endingSoonContractors as unknown as FinanceSnapshot["endingSoonContractors"],
    laborByBU:    contractorsByBUData as unknown as FinanceSnapshot["laborByBU"],
    totalExcessLabor,
    vendorYTDSpend, vendorCommitment,
    expiringVendors90:  expiringVendors90  as unknown as FinanceSnapshot["expiringVendors90"],
    expiringVendors180: expiringVendors180 as unknown as FinanceSnapshot["expiringVendors180"],
    highRiskVendors:    highRiskVendors    as unknown as FinanceSnapshot["highRiskVendors"],
    topVendors:         topVendors         as unknown as FinanceSnapshot["topVendors"],
    hcSummary:    hcSummaryData as unknown as FinanceSnapshot["hcSummary"],
    fillRate, openReqs: openReqsData as unknown as FinanceSnapshot["openReqs"],
    salaryBudget, openReqSalaryAtRisk,
    hcByBU:       hcByBUData as unknown as FinanceSnapshot["hcByBU"],
    headcount:    allHeadcount  as unknown as FinanceSnapshot["headcount"],
    contractors:  contractorsData as unknown as FinanceSnapshot["contractors"],
    risks, actions,
    fmt: formatCurrency, pct: formatPercent, dt: formatDate, daysUntil,
  };
}
