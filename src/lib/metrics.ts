import {
  getYTDActual, getYTDBudget, getYTDVariance,
  getTotalContractorYTDSpend, getTotalContractorBudget,
  getHeadcountSummary,
  getTotalCloudYTD, getTotalCloudBudgetYTD,
  getByBusinessUnit,
} from "@/data/index";
import { getOverBudgetContractors } from "@/data/externalLabor";
import { getVendorsExpiringSoon }    from "@/data/vendors";
import { getOpenReqs }              from "@/data/headcount";
import { formatCurrency }           from "@/lib/formatters";
import type { KPI, KPIStatus }      from "@/types/finance";

// ─── Status helpers ────────────────────────────────────────────────────────────

function spendStatus(variancePct: number, tight = 0.05): KPIStatus {
  if (variancePct > tight)  return "unfavorable";
  if (variancePct > 0.01)   return "watch";
  if (variancePct < -0.01)  return "favorable";
  return "neutral";
}

function ccy(n: number) { return formatCurrency(n, true); }

// ─── Dashboard KPIs ────────────────────────────────────────────────────────────

export function buildDashboardKPIs(): KPI[] {
  const MONTHS = 5;

  // Core financials
  const ytdActual   = getYTDActual();
  const ytdBudget   = getYTDBudget();
  const ytdVariance = getYTDVariance();
  const ytdVarPct   = ytdBudget > 0 ? ytdVariance / ytdBudget : 0;

  // Full-year projection
  const fyForecast = Math.round(ytdActual / MONTHS * 12);
  const fyBudget   = Math.round(ytdBudget / MONTHS * 12);
  const fyVar      = fyForecast - fyBudget;
  const fyVarPct   = fyBudget > 0 ? fyVar / fyBudget : 0;

  // Cloud
  const cloudActual  = getTotalCloudYTD();
  const cloudBudget  = getTotalCloudBudgetYTD();
  const cloudVar     = cloudActual - cloudBudget;
  const cloudVarPct  = cloudBudget > 0 ? cloudVar / cloudBudget : 0;

  // External labor
  const extActual = getTotalContractorYTDSpend();
  const extBudget = getTotalContractorBudget();
  const extVar    = extActual - extBudget;
  const extVarPct = extBudget > 0 ? extVar / extBudget : 0;

  // Headcount
  const hc        = getHeadcountSummary();
  const fillRate  = hc.total > 0 ? hc.filled / hc.total : 0;

  // Driver data from live data functions
  const byBU        = getByBusinessUnit().sort((a, b) => b.variance - a.variance);
  const topBU       = byBU.filter(b => b.variance > 0)[0];
  const secondBU    = byBU.filter(b => b.variance > 0)[1];
  const overConts   = getOverBudgetContractors();
  const contExcess  = overConts.reduce((s, c) => s + (c.ytdSpend - c.budget), 0);
  const expiringNow = getVendorsExpiringSoon(90).filter(v => !v.autoRenew);
  const openReqs    = getOpenReqs().filter(h => h.status === "Open");

  // ── KPI 1: YTD IT Spend ───────────────────────────────────────────────────
  const kpi1: KPI = {
    label:         "YTD IT Spend",
    value:         ytdActual,
    budget:        ytdBudget,
    prior:         ytdBudget * 0.94,
    format:        "currency",
    trend:         ytdVariance > 0 ? "up" : "down",
    trendPositive: false,
    varianceDollar: ytdVariance,
    status:        spendStatus(ytdVarPct),
    driver:        topBU
      ? `${topBU.bu} +${ccy(topBU.variance)} is the top overage driver${secondBU ? `; ${secondBU.bu} +${ccy(secondBU.variance)}` : ""}.`
      : "Spend tracking in line with the approved plan.",
    action: ytdVarPct > 0.01 ? "Review over-budget cost centers before Q2 close." : undefined,
  };

  // ── KPI 2: Cloud Infrastructure ───────────────────────────────────────────
  const kpi2: KPI = {
    label:         "Cloud Infrastructure",
    value:         cloudActual,
    budget:        cloudBudget,
    prior:         cloudBudget * 0.91,
    format:        "currency",
    trend:         cloudVar > 0 ? "up" : "down",
    trendPositive: false,
    varianceDollar: cloudVar,
    status:        spendStatus(cloudVarPct),
    driver:        cloudVar > 0
      ? `AWS EC2 and GCP Vertex AI scaling driving overage. Full-year run-rate: ${ccy(Math.round((cloudVar / MONTHS) * 12))} over plan.`
      : "Cloud spend tracking within approved budget.",
    action: cloudVarPct > 0.05 ? "Engage FinOps for EC2 right-sizing and committed-use review." : undefined,
  };

  // ── KPI 3: External Labor ─────────────────────────────────────────────────
  const kpi3: KPI = {
    label:         "External Labor",
    value:         extActual,
    budget:        extBudget,
    prior:         extBudget * 0.88,
    format:        "currency",
    trend:         extVar > 0 ? "up" : "down",
    trendPositive: false,
    varianceDollar: extVar,
    status:        spendStatus(extVarPct),
    driver:        overConts.length > 0
      ? `${overConts.length} contractor SOWs over budget — ${ccy(contExcess)} total excess. SOW amendments required.`
      : "All contractor engagements within approved budgets.",
    action: overConts.length > 0 ? "Obtain SOW amendments before June month-end close." : undefined,
  };

  // ── KPI 4: Full-Year Forecast ─────────────────────────────────────────────
  const kpi4: KPI = {
    label:         "Full-Year Forecast",
    value:         fyForecast,
    budget:        fyBudget,
    prior:         fyBudget,
    format:        "currency",
    trend:         fyVar > 0 ? "up" : "down",
    trendPositive: false,
    varianceDollar: fyVar,
    status:        spendStatus(fyVarPct),
    driver:        fyVar > 0
      ? `YTD run-rate extrapolated. FinOps targeting $350K H2 savings — net overrun still projected at ${ccy(Math.max(0, fyVar - 350_000))}.`
      : "Full-year spend forecasting on or below plan.",
  };

  // ── KPI 5: Headcount ──────────────────────────────────────────────────────
  // Use filled/total (headcount format) so the card reads "78 / 85 filled · 7 open"
  // rather than "91.8% vs 95.0% target" which feels clinical.
  const hcStatusVal: KPIStatus = fillRate >= 0.95
    ? "favorable"
    : fillRate >= 0.88
    ? "watch"
    : "unfavorable";

  const kpi5: KPI = {
    label:         "Headcount",
    value:         hc.filled,
    budget:        hc.total,
    prior:         hc.filled - 1,
    format:        "headcount",
    trend:         fillRate >= 0.95 ? "up" : "down",
    trendPositive: true,
    hasBudget:     true,
    status:        hcStatusVal,
    driver:        openReqs.length > 0
      ? `${openReqs.length} open reqs in Security & Cloud Eng. — driving contractor dependency and cost premium.`
      : "All approved positions filled to plan.",
    action: openReqs.length > 0 ? "Accelerate TA pipeline for critical security and cloud roles." : undefined,
  };

  // ── KPI 6: Contract Renewals ──────────────────────────────────────────────
  const expiryValue    = expiringNow.reduce((s, v) => s + v.annualValue, 0);
  const contractStatus: KPIStatus = expiringNow.length >= 2
    ? "unfavorable"
    : expiringNow.length === 1
    ? "watch"
    : "favorable";

  const kpi6: KPI = {
    label:         "Contract Renewals",
    value:         expiringNow.length,
    budget:        0,
    prior:         1,
    format:        "number",
    trend:         expiringNow.length > 0 ? "up" : "flat",
    trendPositive: false,
    hasBudget:     false,
    status:        contractStatus,
    driver:        expiringNow.length > 0
      ? `${expiringNow[0].name} expires ${new Date(expiringNow[0].contractEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — ${ccy(expiringNow[0].annualValue)}/yr requires immediate action.`
      : "No contracts requiring manual renewal in the next 90 days.",
    action: expiringNow.length > 0
      ? `Initiate renewal or RFP for ${expiringNow.map(v => v.name).join(", ")}.`
      : undefined,
  };

  return [kpi1, kpi2, kpi3, kpi4, kpi5, kpi6];
}
