import PageWrapper from "@/components/layout/PageWrapper";
import KPICard from "@/components/dashboard/KPICard";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import ExecutiveSummaryBox from "@/components/dashboard/ExecutiveSummaryBox";
import StatsBanner from "@/components/dashboard/StatsBanner";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";
import VarianceTable from "@/components/dashboard/VarianceTable";
import { buildDashboardKPIs } from "@/lib/metrics";
import { generateRiskFlags, generateRecommendedActions } from "@/lib/riskEngine";
import { getMonthlyTotals, getByBusinessUnit } from "@/data/actuals";
import { formatCurrency, formatPercent } from "@/lib/formatters";

function SectionHeader({ label, sub, accent }: { label: string; sub?: string; accent?: string }) {
  return (
    <div className="section-heading">
      <span className={`section-heading-bar${accent ? ` bg-${accent}` : ""}`} />
      <span className="section-heading-text">
        {label}
        {sub && <span className="section-heading-sub">{sub}</span>}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const kpis    = buildDashboardKPIs();
  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();
  const monthly = getMonthlyTotals();
  const byBU    = getByBusinessUnit();

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
    highlight:   b.variance > 150_000,
  }));

  const ytdActual = byBU.reduce((s, b) => s + b.actual, 0);
  const ytdBudget = byBU.reduce((s, b) => s + b.budget, 0);
  const ytdVar    = ytdActual - ytdBudget;
  const ytdVarPct = ytdBudget > 0 ? ytdVar / ytdBudget : 0;
  const critCount = risks.filter(r => r.severity === "critical").length;

  return (
    <PageWrapper
      title="IT Finance Dashboard"
      subtitle="Nexora AI Finance Department — Executive Overview · YTD May 2026"
      badge="Live"
    >
      {/* Quick-stats strip */}
      <StatsBanner />

      {/* KPI grid */}
      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="YTD May 2026 · vs. approved plan" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => <KPICard key={i} kpi={kpi} />)}
        </div>
      </section>

      {/* AI Executive Summary */}
      <section className="mb-8">
        <SectionHeader label="Executive Summary" sub="CFO Agent · AI-generated narrative" />
        <ExecutiveSummaryBox
          agentName="CFO Agent"
          agentAvatar="🏦"
          summary={`IT organization is tracking ${formatPercent(ytdVarPct)} unfavorable versus the approved annual plan for the YTD period ending May 2026. The primary drivers are cloud infrastructure acceleration tied to the Nexora AI platform roadmap and scope expansion in external labor engagements. Three vendor contracts require immediate procurement attention before Q2 close, and the full-year forecast has been revised to reflect a $1.8M unfavorable variance versus plan.`}
          keyPoints={[
            `YTD spend: ${formatCurrency(ytdActual)} vs. budget ${formatCurrency(ytdBudget)} — variance ${formatCurrency(ytdVar)} (${formatPercent(ytdVarPct)})`,
            "Cloud Engineering and Data & Analytics are primary overage drivers — AI/ML infrastructure scaling in AWS and GCP",
            "4 of 12 active contractors over approved budget — SOW amendments required before June 30 close",
            `${critCount} critical risk${critCount !== 1 ? "s" : ""} flagged — AWS contract expiry (June 30) is highest priority`,
            "Full-year forecast revised to $38.2M (+$1.8M vs. plan) — FinOps program targeting $350K recovery in H2",
          ]}
        />
      </section>

      {/* Chart + Risk Alerts */}
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

      {/* Variance table */}
      <section className="mb-8">
        <SectionHeader label="Variance Analysis" sub="YTD budget vs. actuals by business unit" />
        <VarianceTable
          title="YTD Budget vs. Actuals by Business Unit"
          subtitle="Jan–May 2026 · Rows flagged in red exceed $150K unfavorable"
          rows={buRows}
          showForecast
        />
      </section>

      {/* Actions */}
      <section>
        <SectionHeader label="Recommended Actions" sub="Prioritized tasks for finance and procurement teams" />
        <RecommendedActions actions={actions} />
      </section>
    </PageWrapper>
  );
}
