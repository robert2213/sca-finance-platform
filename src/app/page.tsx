export const dynamic = "force-dynamic";
import Link from "next/link";
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
import {
  getMonthlyTotals, getByBusinessUnit,
  getOverBudgetContractors, getOpenReqs,
} from "@/lib/queries";
import { getTotalCloudYTD, getTotalCloudBudgetYTD } from "@/data/cloudSpend";
import { formatCurrency, formatPercent } from "@/lib/formatters";

// ─── Section header with optional right-side agent CTA ────────────────────────

function SectionHeader({
  label, sub, agentId, agentAvatar, agentLabel, agentPrompt,
}: {
  label:        string;
  sub?:         string;
  agentId?:     string;
  agentAvatar?: string;
  agentLabel?:  string;
  agentPrompt?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <div className="section-heading !mb-0">
        <span className="section-heading-bar" />
        <span className="section-heading-text">
          {label}
          {sub && <span className="section-heading-sub">{sub}</span>}
        </span>
      </div>

      {agentId && agentLabel && agentPrompt && (
        <Link
          href={`/agents/${agentId}?q=${encodeURIComponent(agentPrompt)}`}
          className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-nexora-600 hover:text-nexora-700 transition-colors group"
        >
          {agentAvatar && <span className="text-base leading-none">{agentAvatar}</span>}
          <span className="hidden sm:inline">{agentLabel}</span>
          <span className="group-hover:translate-x-0.5 transition-transform inline-block text-nexora-400">↗</span>
        </Link>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const [monthly, byBU, overConts, allOpenReqs] = await Promise.all([
    getMonthlyTotals(),
    getByBusinessUnit(),
    getOverBudgetContractors(),
    getOpenReqs(),
  ]);
  const kpis    = buildDashboardKPIs();
  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();

  // Risk counts for section label
  const critCount = risks.filter(r => r.severity === "critical").length;
  const warnCount = risks.filter(r => r.severity === "warning").length;
  const infoCount = risks.filter(r => r.severity === "info").length;

  // Variance driver data
  const sortedBUs       = [...byBU].sort((a, b) => b.variance - a.variance);
  const overBudgetBUs   = sortedBUs.filter(b => b.variance > 0);
  const contExcess      = overConts.reduce((s, c) => s + (c.ytdSpend - c.budget), 0);
  const cloudActual     = getTotalCloudYTD();
  const cloudBudget     = getTotalCloudBudgetYTD();
  const cloudVar        = cloudActual - cloudBudget;
  const openReqs        = allOpenReqs.filter(h => h.status === "Open");
  const topBU           = overBudgetBUs[0];

  const drivers: VarianceDriver[] = [
    {
      rank:        1,
      category:    "Cloud",
      title:       "Cloud Infrastructure Over Budget",
      variance:    cloudVar,
      budget:      cloudBudget,
      context:     `AWS EC2 (production scaling) and GCP Vertex AI (AI/ML workloads) are driving acceleration. Monthly cloud spend has increased each month Jan–May. Full-year overrun projected at ${formatCurrency(Math.round(cloudVar / 5 * 12), true)} at current run rate.`,
      action:      "Engage FinOps for EC2 right-sizing and GCP committed-use discount review. Target: $180K annualized savings by Q3.",
      actionOwner: "Cloud Engineering + FinOps",
      actionDue:   "Jul 15, 2026",
      status:      cloudVar > cloudBudget * 0.05 ? "unfavorable" : "watch",
    },
    {
      rank:        2,
      category:    topBU ? topBU.bu : "FP&A",
      title:       topBU ? `${topBU.bu} Spend Over Plan` : "Multi-BU Overage",
      variance:    topBU?.variance ?? 0,
      budget:      topBU?.budget   ?? 1,
      context:     topBU
        ? `${topBU.bu} is the largest over-budget BU at ${formatCurrency(topBU.variance, true)} YTD (${formatPercent(topBU.variance / topBU.budget)} vs. plan). ${overBudgetBUs.length > 1 ? `${overBudgetBUs.length - 1} other BU${overBudgetBUs.length > 2 ? "s" : ""} also tracking over budget.` : ""}`
        : "Multiple BUs tracking over approved budget.",
      action:      "Schedule budget review with over-budget BU owners before Q2 close. Submit forecast revision.",
      actionOwner: "FP&A",
      actionDue:   "Jun 30, 2026",
      status:      topBU && topBU.variance / topBU.budget > 0.05 ? "unfavorable" : "watch",
    },
    {
      rank:        3,
      category:    "External Labor",
      title:       overConts.length > 0
        ? `${overConts.length} Contractor SOWs Over Budget`
        : "Open HC Creating Contractor Dependency",
      variance:    overConts.length > 0 ? contExcess : openReqs.reduce((s, h) => s + h.annualSalary / 12 * 3, 0),
      budget:      overConts.length > 0 ? overConts.reduce((s, c) => s + c.budget, 0) : 1,
      context:     overConts.length > 0
        ? `${overConts.map(c => c.name).join(", ")} are over approved SOW budgets by a combined ${formatCurrency(contExcess, true)}. Scope creep or rate changes require procurement review.`
        : `${openReqs.length} open positions forcing reliance on premium-rate contractors.`,
      action:      overConts.length > 0
        ? "Obtain signed SOW amendments for all over-budget engagements before June 30."
        : "Accelerate TA pipeline for open security and cloud roles.",
      actionOwner: overConts.length > 0 ? "IT Finance / Procurement" : "HR + IT Finance",
      actionDue:   "Jun 30, 2026",
      status:      "watch",
    },
  ];

  // Chart + table data
  const chartData = monthly.map(m => ({
    month: m.month, actual: m.actual, budget: m.budget, forecast: m.forecast,
  }));
  const buRows = byBU.map(b => ({
    label:       b.bu,
    actual:      b.actual,
    budget:      b.budget,
    forecast:    b.forecast,
    variance:    b.variance,
    variancePct: b.budget > 0 ? b.variance / b.budget : 0,
    highlight:   b.variance > 100_000,
  }));

  // Executive summary numbers
  const ytdActual = byBU.reduce((s, b) => s + b.actual, 0);
  const ytdBudget = byBU.reduce((s, b) => s + b.budget, 0);
  const ytdVar    = ytdActual - ytdBudget;
  const ytdVarPct = ytdBudget > 0 ? ytdVar / ytdBudget : 0;

  return (
    <PageWrapper
      title="IT Finance Dashboard"
      subtitle="Executive FP&A Command Center — YTD May 2026"
      badge="Live"
    >

      {/* ── Section 1: Key Performance Indicators ────────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Key Performance Indicators"
          sub="YTD May 2026 — click any card's Insight toggle for root cause"
          agentId="fpa"
          agentAvatar="📊"
          agentLabel="Ask FP&A Agent"
          agentPrompt="What are the main drivers of our YTD budget variance?"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
        </div>
      </section>

      {/* ── Section 2: Variance Drivers ──────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Top Variance Drivers"
          sub="Root causes with recommended actions"
          agentId="cfo"
          agentAvatar="🏦"
          agentLabel="Ask CFO Agent"
          agentPrompt="What are the top financial risks I need to act on this month?"
        />
        <VarianceDrivers drivers={drivers} period="YTD May 2026" />
      </section>

      {/* ── Section 3: Executive Summary ─────────────────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Executive Summary"
          sub="CFO Agent · AI-generated narrative"
          agentId="cfo"
          agentAvatar="🏦"
          agentLabel="Open CFO Agent"
          agentPrompt="Give me the executive financial summary for May 2026"
        />
        <ExecutiveSummaryBox
          agentName="CFO Agent"
          agentAvatar="🏦"
          summary={`IT organization is tracking ${formatPercent(ytdVarPct)} unfavorable versus the approved annual plan through May 2026. Primary drivers are cloud infrastructure acceleration tied to the approved digital platform roadmap and scope expansion in external labor. Three vendor contracts require immediate procurement attention before Q2 close.`}
          keyPoints={[
            `YTD: ${formatCurrency(ytdActual, true)} actual vs. ${formatCurrency(ytdBudget, true)} budget — ${formatCurrency(ytdVar, true)} (${formatPercent(ytdVarPct)}) unfavorable`,
            "Cloud Engineering and Data & Analytics are primary overage drivers",
            `${overConts.length} of 12 active contractors over approved SOW budget — ${formatCurrency(contExcess, true)} total excess`,
            `${critCount} critical risk${critCount !== 1 ? "s" : ""} flagged — AWS contract expiry (June 30) is highest priority`,
            "FinOps program projected to recover $350K in cloud savings in H2",
          ]}
        />
      </section>

      {/* ── Section 4: Monthly Chart + Risk Alerts ───────────────────────── */}
      <section className="mb-8">
        <SectionHeader
          label="Financial Performance"
          sub={`Monthly spend trend · ${critCount > 0 ? `🔴 ${critCount} critical` : ""}${warnCount > 0 ? `  🟡 ${warnCount} watch` : ""}${infoCount > 0 ? `  🔵 ${infoCount} info` : ""}`.trim()}
          agentId="cio"
          agentAvatar="💡"
          agentLabel="Ask CIO Agent"
          agentPrompt="Prepare a 5-point IT financial briefing for the executive team"
        />
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
        <SectionHeader
          label="Variance Analysis"
          sub="YTD budget vs. actuals by business unit"
          agentId="fpa"
          agentAvatar="📊"
          agentLabel="Ask FP&A Agent"
          agentPrompt="Walk me through the variance by business unit for May 2026"
        />
        <VarianceTable
          title="YTD Budget vs. Actuals by Business Unit"
          subtitle="Jan–May 2026 · Rows flagged in red exceed $100K unfavorable"
          rows={buRows}
          showForecast
        />
      </section>

      {/* ── Section 6: Recommended Actions ───────────────────────────────── */}
      <section>
        <SectionHeader
          label="Recommended Actions"
          sub={`${actions.filter(a => a.priority === "High").length} high priority · ${actions.filter(a => a.priority === "Medium").length} medium`}
          agentId="cfo"
          agentAvatar="🏦"
          agentLabel="Ask CFO Agent"
          agentPrompt="What actions should the finance team take before Q2 close?"
        />
        <RecommendedActions actions={actions} />
      </section>

    </PageWrapper>
  );
}
