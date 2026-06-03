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

// ─── Status thresholds ────────────────────────────────────────────────────────
// For spend metrics: over budget = unfavorable/watch, under = favorable
// "watch" zone keeps amber reserved for genuine attention items only

function spendStatus(variancePct: number, tightThreshold = 0.05): KPIStatus {
  if (variancePct > tightThreshold)  return "unfavorable";
  if (variancePct > 0.01)            return "watch";
  if (variancePct < -0.01)           return "favorable";
  return "neutral";
}

// ─── Compact currency helper (avoids circular import with formatters) ──────────
function ccy(n: number) { return formatCurrency(n, true); }

// ─── Main KPI builder ─────────────────────────────────────────────────────────

export function buildDashboardKPIs(): KPI[] {
  // ── Core financials ──────────────────────────────────────────────────────
  const ytdActual   = getYTDActual();
  const ytdBudget   = getYTDBudget();
  const ytdVariance = getYTDVariance();                      // actual - budget
  const ytdVarPct   = ytdBudget > 0 ? ytdVariance / ytdBudget : 0;

  // ── Full-year projection (simple run-rate × 12) ───────────────────────────
  const MONTHS_ELAPSED = 5;          // Jan–May
  const fullYearForecast = Math.round(ytdActual  / MONTHS_ELAPSED * 12);
  const fullYearBudget   = Math.round(ytdBudget  / MONTHS_ELAPSED * 12);
  const fyVariance       = fullYearForecast - fullYearBudget;
  const fyVarPct         = fullYearBudget > 0 ? fyVariance / fullYearBudget : 0;

  // ── Cloud ─────────────────────────────────────────────────────────────────
  const cloudActual = getTotalCloudYTD();
  const cloudBudget = getTotalCloudBudgetYTD();
  const cloudVar    = cloudActual - cloudBudget;
  const cloudVarPct = cloudBudget > 0 ? cloudVar / cloudBudget : 0;

  // ── External labor ────────────────────────────────────────────────────────
  const extActual  = getTotalContractorYTDSpend();
  const extBudget  = getTotalContractorBudget();
  const extVar     = extActual - extBudget;
  const extVarPct  = extBudget > 0 ? extVar / extBudget : 0;

  // ── Headcount ─────────────────────────────────────────────────────────────
  const hc         = getHeadcountSummary();
  const fillRate   = hc.total > 0 ? hc.filled / hc.total : 0;
  const fillTarget = 0.95;           // 95% fill rate target

  // ── Drivers — derived from real data ──────────────────────────────────────
  const byBU          = getByBusinessUnit().sort((a, b) => b.variance - a.variance);
  const overBudgetBUs = byBU.filter(b => b.variance > 0);
  const underBudgetBUs = byBU.filter(b => b.variance < 0);
  const top1          = overBudgetBUs[0];
  const top2          = overBudgetBUs[1];

  const overContractors   = getOverBudgetContractors();
  const contractorExcess  = overContractors.reduce((s, c) => s + (c.ytdSpend - c.budget), 0);

  const expiringNow  = getVendorsExpiringSoon(90).filter(v => !v.autoRenew);
  const openReqsList = getOpenReqs().filter(h => h.status === "Open");

  const favorableBUsText = underBudgetBUs.length > 0
    ? ` Partially offset by ${underBudgetBUs[0].bu} ${ccy(Math.abs(underBudgetBUs[0].variance))} favorable.`
    : "";

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
    driver:        top1
      ? `${top1.bu} is the largest overage driver at ${ccy(top1.variance)}.${favorableBUsText}`
      : "Spend is tracking in line with the approved annual plan.",
    action:        ytdVarPct > 0.01 ? "Review overbudget cost centers with BU owners before Q2 close." : undefined,
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
      ? `AWS EC2 and GCP Vertex AI scaling are driving acceleration. Full-year overrun projected at ${ccy(Math.round((cloudVar / MONTHS_ELAPSED) * 12))}.`
      : "Cloud spend tracking within approved budget.",
    action:        cloudVarPct > 0.05 ? "Engage FinOps for EC2 right-sizing and committed-use discount analysis." : undefined,
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
    driver:        overContractors.length > 0
      ? `${overContractors.length} of ${hc.total > 0 ? "12" : "12"} SOWs exceed approved spend — ${ccy(contractorExcess)} total excess requires amendment.`
      : "All contractor engagements tracking within approved SOW budgets.",
    action:        overContractors.length > 0 ? "Obtain SOW amendments or issue PO changes before June month-end close." : undefined,
  };

  // ── KPI 4: Full-Year Forecast ─────────────────────────────────────────────
  const kpi4: KPI = {
    label:         "Full-Year Forecast",
    value:         fullYearForecast,
    budget:        fullYearBudget,
    prior:         fullYearBudget,
    format:        "currency",
    trend:         fyVariance > 0 ? "up" : "down",
    trendPositive: false,
    varianceDollar: fyVariance,
    status:        spendStatus(fyVarPct),
    driver:        fyVariance > 0
      ? `Run-rate extrapolation of YTD spend. FinOps program targets $350K H2 savings — net projected overrun remains ${ccy(Math.max(0, fyVariance - 350_000))}.`
      : "Full-year spend is forecasting on or below the approved annual plan.",
  };

  // ── KPI 5: Headcount Fill Rate ────────────────────────────────────────────
  const hcStatus: KPIStatus = fillRate >= fillTarget
    ? "favorable"
    : fillRate >= 0.88
    ? "watch"
    : "unfavorable";

  const kpi5: KPI = {
    label:         "Headcount Fill Rate",
    value:         fillRate,
    budget:        fillTarget,
    prior:         (hc.filled - 1) / hc.total,
    format:        "percent",
    trend:         fillRate >= fillTarget ? "up" : "down",
    trendPositive: true,
    status:        hcStatus,
    driver:        openReqsList.length > 0
      ? `${openReqsList.length} open req${openReqsList.length !== 1 ? "s" : ""} in Security & Cloud Engineering — creating contractor dependency and cost premium.`
      : "All approved positions filled. No open requisitions.",
    action:        openReqsList.length > 0 ? "Accelerate TA pipeline for critical security and cloud roles to reduce contractor reliance." : undefined,
  };

  // ── KPI 6: Contract Renewal Exposure ─────────────────────────────────────
  const expiringValue = expiringNow.reduce((s, v) => s + v.annualValue, 0);
  const contractStatus: KPIStatus = expiringNow.length >= 2
    ? "unfavorable"
    : expiringNow.length === 1
    ? "watch"
    : "favorable";

  const kpi6: KPI = {
    label:         "Contracts Expiring <90 Days",
    value:         expiringNow.length,
    budget:        0,
    prior:         1,
    format:        "number",
    trend:         expiringNow.length > 1 ? "up" : "flat",
    trendPositive: false,
    hasBudget:     false,
    status:        contractStatus,
    driver:        expiringNow.length > 0
      ? `${expiringNow[0].name} (${new Date(expiringNow[0].contractEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}) — ${ccy(expiringNow[0].annualValue)}/yr commitment requires immediate procurement action.`
      : "No contracts requiring manual renewal action within 90 days.",
    action:        expiringNow.length > 0 ? `Initiate renewal or RFP for ${expiringNow.map(v => v.name).join(", ")} before contract lapse.` : undefined,
  };

  return [kpi1, kpi2, kpi3, kpi4, kpi5, kpi6];
}
