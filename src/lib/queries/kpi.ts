import { getYTDSummary, getByBusinessUnit, YTD_CUTOFF } from "./actuals";
import { getHCSummary } from "./headcount";
import { getContractors, getOverBudgetContractors } from "./contractors";
import { getVendors } from "./vendors";
import type { KPI } from "@/types/finance";

export interface KPISummary {
  ytdSpend: number;
  ytdBudget: number;
  ytdVariance: number;
  ytdVariancePct: number;
  contractorYTDSpend: number;
  contractorBudget: number;
  overBudgetContractors: number;
  hcFillRate: number;
  openReqs: number;
  totalAnnualVendorCommitment: number;
  highRiskVendors: number;
}

/** Aggregate KPI summary across all data domains. */
export async function getKPISummary(
  clientId: string = "demo-client",
  period: string = YTD_CUTOFF
): Promise<KPISummary> {
  const [ytd, contractors, overBudget, hcSummary, vendors] = await Promise.all([
    getYTDSummary(clientId, period),
    getContractors(clientId),
    getOverBudgetContractors(clientId),
    getHCSummary(clientId),
    getVendors(clientId),
  ]);

  const contractorYTDSpend = contractors.reduce((s, c) => s + c.ytdSpend, 0);
  const contractorBudget   = contractors.reduce((s, c) => s + c.budget, 0);
  const annualVendorCommitment = vendors.reduce((s, v) => s + v.annualValue, 0);
  const highRiskVendors = vendors.filter((v) => v.riskLevel === "High").length;

  return {
    ytdSpend:                    ytd.actual,
    ytdBudget:                   ytd.budget,
    ytdVariance:                 ytd.variance,
    ytdVariancePct:              ytd.variancePct,
    contractorYTDSpend,
    contractorBudget,
    overBudgetContractors:       overBudget.length,
    hcFillRate:                  hcSummary.fillRate,
    openReqs:                    hcSummary.open + hcSummary.pendingOffer,
    totalAnnualVendorCommitment: annualVendorCommitment,
    highRiskVendors,
  };
}

/** Build typed KPI cards for the main dashboard (mirrors buildDashboardKPIs shape). */
export async function buildDashboardKPIsFromDB(
  clientId: string = "demo-client",
  period: string = YTD_CUTOFF
): Promise<KPI[]> {
  const [summary, buTotals] = await Promise.all([
    getKPISummary(clientId, period),
    getByBusinessUnit(period, clientId),
  ]);

  const cloudActual = buTotals
    .filter((b) => b.bu === "Cloud Engineering" || b.bu === "Data & Analytics")
    .reduce((s, b) => s + b.actual, 0);
  const cloudBudget = buTotals
    .filter((b) => b.bu === "Cloud Engineering" || b.bu === "Data & Analytics")
    .reduce((s, b) => s + b.budget, 0);

  const ytdActual  = summary.ytdSpend;
  const ytdBudget  = summary.ytdBudget;
  const ytdVar     = summary.ytdVariance;

  return [
    {
      label: "YTD IT Spend",
      value: ytdActual,
      budget: ytdBudget,
      prior: 0,
      format: "currency",
      trend: ytdVar > 0 ? "up" : "down",
      trendPositive: ytdVar <= 0,
      status: ytdVar > 0 ? "unfavorable" : "favorable",
      varianceDollar: ytdVar,
    },
    {
      label: "Cloud Infrastructure",
      value: cloudActual,
      budget: cloudBudget,
      prior: 0,
      format: "currency",
      trend: cloudActual > cloudBudget ? "up" : "flat",
      trendPositive: cloudActual <= cloudBudget,
      status: cloudActual > cloudBudget ? "watch" : "favorable",
      varianceDollar: cloudActual - cloudBudget,
    },
    {
      label: "External Labor",
      value: summary.contractorYTDSpend,
      budget: summary.contractorBudget,
      prior: 0,
      format: "currency",
      trend: summary.contractorYTDSpend > summary.contractorBudget ? "up" : "flat",
      trendPositive: summary.contractorYTDSpend <= summary.contractorBudget,
      status: summary.overBudgetContractors > 0 ? "unfavorable" : "favorable",
      varianceDollar: summary.contractorYTDSpend - summary.contractorBudget,
    },
    {
      label: "HC Fill Rate",
      value: summary.hcFillRate,
      budget: 0.9,
      prior: 0,
      format: "percent",
      trend: summary.hcFillRate >= 0.9 ? "up" : "down",
      trendPositive: summary.hcFillRate >= 0.9,
      status: summary.hcFillRate >= 0.85 ? "neutral" : "watch",
    },
    {
      label: "Variance %",
      value: ytdBudget > 0 ? ytdVar / ytdBudget : 0,
      budget: 0,
      prior: 0,
      format: "percent",
      trend: ytdVar > 0 ? "up" : "down",
      trendPositive: ytdVar <= 0,
      status: Math.abs(ytdVar / (ytdBudget || 1)) > 0.05 ? "unfavorable" : "favorable",
    },
  ];
}
