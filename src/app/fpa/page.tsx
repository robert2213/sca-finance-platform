export const dynamic = "force-dynamic";
import PageWrapper from "@/components/layout/PageWrapper";
import AgentWorkspaceCTA from "@/components/agents/AgentWorkspaceCTA";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";
import VarianceTable from "@/components/dashboard/VarianceTable";
import StatsBanner from "@/components/dashboard/StatsBanner";
import KPICard from "@/components/dashboard/KPICard";
import { getMonthlyTotals, getByBusinessUnit, getByCategory, getActualsByPeriod } from "@/lib/queries";
import { formatCurrency } from "@/lib/formatters";
import type { KPI } from "@/types/finance";
import clsx from "clsx";

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

export default async function FPAPage() {
  const [monthly, byBU, byCat, mayActuals] = await Promise.all([
    getMonthlyTotals(),
    getByBusinessUnit(),
    getByCategory(),
    getActualsByPeriod("2026-05"),
  ]);

  const ytdActual = byBU.reduce((s, b) => s + b.actual, 0);
  const ytdBudget = byBU.reduce((s, b) => s + b.budget, 0);
  const ytdVar    = ytdActual - ytdBudget;
  const ytdVarPct = ytdBudget > 0 ? ytdVar / ytdBudget : 0;
  const may       = monthly[monthly.length - 1] ?? { actual: 0, budget: 0 };
  const prevMonth = monthly[monthly.length - 2] ?? { actual: 0, budget: 0 };
  const mayVar    = may.actual - may.budget;

  const kpis: KPI[] = [
    { label: "YTD Actual Spend",  value: ytdActual, budget: ytdBudget, prior: ytdBudget * 0.94, format: "currency", trend: "up", trendPositive: false },
    { label: "YTD Variance",      value: ytdVar,    budget: 0, prior: ytdVar * 0.8, format: "currency", trend: "up", trendPositive: false },
    { label: "May 2026 Variance", value: mayVar,    budget: 0, prior: prevMonth.actual - prevMonth.budget, format: "currency", trend: "up", trendPositive: false },
    { label: "Variance %",        value: ytdVarPct, budget: 0, prior: 0.03, format: "percent", trend: "up", trendPositive: false },
  ];

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
    highlight:   b.variance > 200_000,
  }));

  const catRows = byCat.map(c => ({
    label:       c.category,
    actual:      c.actual,
    budget:      c.budget,
    variance:    c.actual - c.budget,
    variancePct: c.budget > 0 ? (c.actual - c.budget) / c.budget : 0,
    highlight:   false,
  })).sort((a, b) => b.variance - a.variance);

  const sortedMay = [...mayActuals].sort((a, b) => b.variance - a.variance);

  return (
    <PageWrapper
      title="FP&A Variance Review"
      subtitle="Budget vs. Actuals · Variance Drivers · Full-Year Forecast"
      badge="FP&A Agent"
    >
      <StatsBanner />

      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="YTD May 2026 · variance metrics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      {/* Chart + Chat */}
      <section className="mb-8">
        <SectionHeader label="Spend Trend & Agent Analysis" sub="Monthly budget vs. actuals and FP&A chat" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="section-title">Monthly Budget vs. Actual vs. Forecast</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">All cost centers combined · Jan–May 2026</p>
              </div>
              <div className="hidden md:flex items-center gap-1 text-[10px] text-slate-500">
                {monthly.map((m, i) => {
                  const v = m.actual - m.budget;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <span className={clsx("font-bold", v > 0 ? "text-red-500" : "text-emerald-600")}>
                        {v > 0 ? "↑" : "↓"}
                      </span>
                      <span className="text-slate-300">{m.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 pt-4">
              <BudgetVsActualChart data={chartData} height={300} />
            </div>
          </div>
          <AgentWorkspaceCTA
            agentId="fpa"
            contextNote="Ask the FP&A Agent to explain variance drivers, walk through forecast changes, or drill into any cost center."
            prompts={[
              "What are the main drivers of our YTD budget variance?",
              "How is our full-year forecast tracking vs. the approved plan?",
              "Walk me through the month-over-month spend trend",
            ]}
          />
        </div>
      </section>

      {/* BU table */}
      <section className="mb-8">
        <SectionHeader label="Variance by Business Unit" sub="YTD actuals vs. approved plan" />
        <VarianceTable
          title="YTD Variance by Business Unit"
          subtitle="Rows flagged in red exceed $200K unfavorable"
          rows={buRows}
          showForecast
        />
      </section>

      {/* Category + May detail */}
      <section>
        <SectionHeader label="Cost Category & Monthly Detail" sub="Breakdown by spend type and May cost center drill-down" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <VarianceTable
            title="YTD Variance by Cost Category"
            subtitle="Sorted by largest unfavorable variance"
            rows={catRows}
          />

          <div className="card overflow-hidden">
            <div className="card-header">
              <h2 className="section-title">May 2026 — Cost Center Detail</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Highlighted rows = &gt;5% unfavorable variance
              </p>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr>
                    <th className="px-4 py-2.5 text-left tbl-head">Cost Center</th>
                    <th className="px-3 py-2.5 text-right tbl-head">Actual</th>
                    <th className="px-3 py-2.5 text-right tbl-head">Budget</th>
                    <th className="px-3 py-2.5 text-right tbl-head">Var %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sortedMay.map((r, i) => (
                    <tr key={i} className={clsx(
                      "tbl-row",
                      r.variancePct > 0.05 ? "bg-red-50/30" : ""
                    )}>
                      <td className="px-4 py-2.5">
                        <p className="font-semibold text-slate-800">{r.costCenterName}</p>
                        <p className="text-slate-400 text-[10px]">{r.businessUnit}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                        {formatCurrency(r.actual, true)}
                      </td>
                      <td className="px-3 py-2.5 text-right text-slate-500">
                        {formatCurrency(r.budget, true)}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={clsx(
                          "font-bold text-xs",
                          r.variance > 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                          {r.variance > 0 ? "+" : ""}{(r.variancePct * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}
