import PageWrapper from "@/components/layout/PageWrapper";
import KPICard from "@/components/dashboard/KPICard";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import ExecutiveSummaryBox from "@/components/dashboard/ExecutiveSummaryBox";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";
import VarianceTable from "@/components/dashboard/VarianceTable";
import VarianceDrivers from "@/components/dashboard/VarianceDrivers";
import type { VarianceDriver } from "@/components/dashboard/VarianceDrivers";
import { buildDashboardKPIs } from "@/lib/metrics";
import { generateRiskFlags, generateRecommendedActions } from "@/lib/riskEngine";
import { getMonthlyTotals, getByBusinessUnit } from "@/data/actuals";
import { getOverBudgetContractors } from "@/data/externalLabor";
import { getOpenReqs } from "@/data/headcount";
import { getTotalCloudYTD, getTotalCloudBudgetYTD } from "@/data/cloudSpend";
import { formatCurrency, formatPercent } from "@/lib/formatters";

// ─── Section header component ─────────────────────────────────────────────────

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="section-heading">
      <span className="section-heading-bar" />
      <span className="section-heading-text">
        {label}
        {sub && <span className="section-heading-sub">{sub}</span>}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const kpis    = buildDashboardKPIs();
  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();
  const monthly = getMonthlyTotals();
  const byBU    = getByBusinessUnit();

  // ── Top 3 variance drivers — computed from real data ──────────────────────
  const sortedBUs          = [...byBU].sort((a, b) => b.variance - a.variance);
  const overBudgetBUs      = sortedBUs.filter(b => b.variance > 0);
  const overContractors    = getOverBudgetContractors();
  const contractorExcess   = overContractors.reduce((s, c) => s + (c.ytdSpend - c.budget), 0);
  const cloudActual        = getTotalCloudYTD();
  const cloudBudget        = getTotalCloudBudgetYTD();
  const cloudVar           = cloudActual - cloudBudget;
  const openReqs           = getOpenReqs().filter(h => h.status === "Open");

  // ── Build 3 drivers ───────────────────────────────────────────────────────
  const topBU = overBudgetBUs[0];
  const topBUBudget = topBU?.budget ?? 1;

  const drivers: VarianceDriver[] = [
    {
      rank:        1,
      category:    "Cloud",
      title:       "Cloud Infrastructure Over Budget",
      variance:    cloudVar,
      budget:      cloudBudget,
      context:     `AWS EC2 (production scaling) and GCP Vertex AI (new AI/ML workloads) are the primary cost drivers. Monthly cloud spend has increased every month from January through May 2026. Full-year overrun is tracking at ${formatCurrency(Math.round(cloudVar / 5 * 12), true)} if current run rate continues.`,
      action:      "Engage FinOps team immediately for EC2 right-sizing analysis and GCP committed-use discount review. Target: $180K annualized savings by Q3.",
      actionOwner: "Cloud Engineering + FinOps",
      actionDue:   "Jul 15, 2026",
      status:      cloudVar > cloudBudget * 0.05 ? "unfavorable" : "watch",
    },
    {
      rank:        2,
      category:    topBU ? topBU.bu : "FP&A",
      title:       topBU ? `${topBU.bu} Spend Over Plan` : "Multi-BU Overage",
      variance:    topBU?.variance ?? (byBU.reduce((s, b) => s + b.variance, 0)),
      budget:      topBUBudget,
      context:     topBU
        ? `${topBU.bu} is the largest over-budget business unit at ${formatCurrency(topBU.variance, true)} YTD (${formatPercent(topBU.variance / topBU.budget)} vs. plan). ${overBudgetBUs.length > 1 ? `${overBudgetBUs.length - 1} additional BU${overBudgetBUs.length > 2 ? "s" : ""} are also tracking over budget.` : "Review with cost center owners to identify controllable vs. strategic spend."}`
        : "Multiple business units are tracking above their approved budgets.",
      action:      "Schedule budget review with top over-budget BU owners before Q2 close. Identify controllable vs. strategic spend and submit forecast revision.",
      actionOwner: "FP&A",
      actionDue:   "Jun 30, 2026",
      status:      topBU && topBU.variance / topBU.budget > 0.05 ? "unfavorable" : "watch",
    },
    {
      rank:        3,
      category:    "External Labor",
      title:       overContractors.length > 0 ? `${overContractors.length} Contractor SOWs Over Approved Budget` : "Open Headcount Creating Contractor Dependency",
      variance:    overContractors.length > 0 ? contractorExcess : openReqs.reduce((s, h) => s + h.annualSalary / 12 * 3, 0),
      budget:      overContractors.length > 0 ? overContractors.reduce((s, c) => s + c.budget, 0) : 1,
      context:     overContractors.length > 0
        ? `${overContractors.map(c => c.name).join(", ")} ${overContractors.length === 1 ? "is" : "are"} tracking over approved SOW budgets by a combined ${formatCurrency(contractorExcess, true)}. SOW scope creep or rate changes require procurement review and formal amendment.`
        : `${openReqs.length} open positions in Security and Cloud Engineering are forcing reliance on higher-cost contractors, creating an estimated cost premium of ${formatCurrency(openReqs.reduce((s, h) => s + h.annualSalary * 0.3, 0), true)}/yr vs. FTE.`,
      action:      overContractors.length > 0
        ? "Issue PO amendments or obtain signed SOW amendments for all over-budget engagements. Escalate to procurement before June 30 month-end close."
        : "Accelerate TA pipeline for open security and cloud engineering roles to reduce dependency on premium-rate contractors.",
      actionOwner: overContractors.length > 0 ? "IT Finance / Procurement" : "HR + IT Finance",
      actionDue:   "Jun 30, 2026",
      status:      (overContractors.length > 0 && contractorExcess > 0) ? "watch" : "watch",
    },
  ];

  // ── Chart data ────────────────────────────────────────────────────────────
  const chartData = monthly.map(m => ({
    month: m.month, actual: m.actual, budget: m.budget, forecast: m.forecast,
  }));

  // ── Variance table rows ───────────────────────────────────────────────────
  const buRows = byBU.map(b => ({
    label:       b.bu,
    actual:      b.actual,
    budget:      b.budget,
    forecast:    b.forecast,
    variance:    b.variance,
    variancePct: b.budget > 0 ? b.variance / b.budget : 0,
    highlight:   b.variance > 100_000,
  }));

  // ── Executive summary metrics ─────────────────────────────────────────────
  const ytdActual = byBU.reduce((s, b) => s + b.actual, 0);
  const ytdBudget = byBU.reduce((s, b) => s + b.budget, 0);
  const ytdVar    = ytdActual - ytdBudget;
  const ytdVarPct = ytdBudget > 0 ? ytdVar / ytdBudget : 0;
  const critCount = risks.filter(r => r.severity === "critical").length;

  // ── High-priority actions only ────────────────────────────────────────────
  const highActions = actions.filter(a => a.priority === "High");
  const allActions  = actions;

  return (
    <PageWrapper
      title="IT Finance Dashboard"
      subtitle="Executive FP&A Command Center — YTD May 2026"
      badge="Live"
    >

      {/* ── Section 1: Key Metrics ────────────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Key Performance Indicators"
          sub="6 metrics answering what, vs. budget, favorable/unfavorable, why, and what action is needed"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
        </div>
      </section>

      {/* ── Section 2: Variance Drivers ──────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Top Variance Drivers"
          sub="Root causes of budget variance with recommended actions"
        />
        <VarianceDrivers drivers={drivers} period="YTD May 2026" />
      </section>

      {/* ── Section 3: Executive Summary ─────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader label="Executive Summary" sub="CFO Agent · AI-generated narrative" />
        <ExecutiveSummaryBox
          agentName="CFO Agent"
          agentAvatar="🏦"
          summary={`IT organization is tracking ${formatPercent(ytdVarPct)} unfavorable versus the approved annual plan through May 2026. The primary drivers are cloud infrastructure acceleration tied to the Nexora AI platform roadmap and scope expansion in external labor engagements. Three vendor contracts require immediate procurement attention before Q2 close, and the full-year forecast has been revised to reflect an unfavorable variance versus plan.`}
          keyPoints={[
            `YTD: ${formatCurrency(ytdActual, true)} actual vs. ${formatCurrency(ytdBudget, true)} budget — ${formatCurrency(ytdVar, true)} (${formatPercent(ytdVarPct)}) unfavorable`,
            "Cloud Engineering and Data & Analytics are primary overage drivers — AI/ML infrastructure scaling in AWS and GCP",
            `${overContractors.length} of 12 active contractors over approved SOW budget — ${formatCurrency(contractorExcess, true)} total excess requires amendment`,
            `${critCount} critical risk${critCount !== 1 ? "s" : ""} flagged — AWS contract expiry (June 30) is highest priority item`,
            "FinOps program projected to recover $350K in cloud savings in H2 — monitoring required",
          ]}
        />
      </section>

      {/* ── Section 4: Financial Performance ─────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader label="Financial Performance" sub="Monthly spend trend and active risk flags" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="section-title">Monthly Spend — Budget vs. Actual vs. Forecast</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Jan–May 2026 · All IT cost centers combined</p>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-slate-300 inline-block" /> Budget</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-nexora-500 inline-block" /> Actual</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-nexora-300 inline-block" /> Forecast</span>
              </div>
            </div>
            <div className="p-6 pt-4">
              <BudgetVsActualChart data={chartData} height={300} />
            </div>
          </div>
          <div className="lg:col-span-2">
            <RiskAlerts flags={risks} limit={4} />
          </div>
        </div>
      </section>

      {/* ── Section 5: Variance Analysis ─────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader label="Variance Analysis" sub="YTD budget vs. actuals by business unit · rows >$100K flagged" />
        <VarianceTable
          title="YTD Budget vs. Actuals by Business Unit"
          subtitle="Jan–May 2026 · Favorable variance shown in green, unfavorable in red"
          rows={buRows}
          showForecast
        />
      </section>

      {/* ── Section 6: Recommended Actions ───────────────────────────────── */}
      <section>
        <SectionHeader label="Recommended Actions" sub={`${highActions.length} high-priority items requiring action before Q2 close`} />
        <RecommendedActions actions={allActions} />
      </section>

    </PageWrapper>
  );
}
