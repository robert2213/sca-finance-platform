import PageWrapper from "@/components/layout/PageWrapper";
import AgentChatPanel from "@/components/agents/AgentChatPanel";
import BudgetVsActualChart from "@/components/charts/BudgetVsActualChart";
import VarianceTable from "@/components/dashboard/VarianceTable";
import StatsBanner from "@/components/dashboard/StatsBanner";
import KPICard from "@/components/dashboard/KPICard";
import { getMonthlyTotals, getByBusinessUnit, getByCategory, actuals } from "@/data/actuals";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { KPI } from "@/types/finance";
import clsx from "clsx";

export default function FPAPage() {
  const monthly   = getMonthlyTotals();
  const byBU      = getByBusinessUnit();
  const byCat     = getByCategory();
  const ytdActual = byBU.reduce((s, b) => s + b.actual, 0);
  const ytdBudget = byBU.reduce((s, b) => s + b.budget, 0);
  const ytdVar    = ytdActual - ytdBudget;
  const ytdVarPct = ytdBudget > 0 ? ytdVar / ytdBudget : 0;
  const may       = monthly[monthly.length - 1];
  const mayVar    = may.actual - may.budget;

  const kpis: KPI[] = [
    { label: "YTD Actual Spend",  value: ytdActual, budget: ytdBudget, prior: ytdBudget * 0.94, format: "currency", trend: "up", trendPositive: false },
    { label: "YTD Variance",      value: ytdVar,    budget: 0, prior: ytdVar * 0.8, format: "currency", trend: "up", trendPositive: false },
    { label: "May 2026 Variance", value: mayVar,    budget: 0, prior: monthly[3].actual - monthly[3].budget, format: "currency", trend: "up", trendPositive: false },
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

  const mayActuals = actuals.filter(r => r.month === "May").sort((a, b) => b.variance - a.variance);

  return (
    <PageWrapper
      title="FP&A Variance Review"
      subtitle="Budget vs. Actuals · Variance Drivers · Full-Year Forecast"
      badge="FP&A Agent"
    >
      <StatsBanner />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
      </div>

      {/* Chart + Chat */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="section-title">Monthly Budget vs. Actual vs. Forecast</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">All cost centers combined · Jan–May 2026</p>
            </div>
            {/* Month-over-month variance trend */}
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
        <AgentChatPanel agentId="fpa" initialQuestion="What are the main drivers of our budget variance?" />
      </div>

      {/* BU table */}
      <div className="mb-8">
        <VarianceTable
          title="YTD Variance by Business Unit"
          subtitle="Rows highlighted in red = >$200K unfavorable"
          rows={buRows}
          showForecast
        />
      </div>

      {/* Category + May detail */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VarianceTable
          title="YTD Variance by Cost Category"
          subtitle="Sorted by largest unfavorable variance"
          rows={catRows}
        />

        {/* May cost center detail */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="section-title">May 2026 — Cost Center Detail</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-nexora-400 mr-1" />
              Highlighted = &gt;5% unfavorable variance
            </p>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                <tr>
                  <th className="px-4 py-2.5 text-left tbl-head">Cost Center</th>
                  <th className="px-3 py-2.5 text-right tbl-head">Actual</th>
                  <th className="px-3 py-2.5 text-right tbl-head">Budget</th>
                  <th className="px-3 py-2.5 text-right tbl-head">Var%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mayActuals.map((r, i) => (
                  <tr key={i} className={clsx(
                    "tbl-row",
                    r.variancePct > 0.05 ? "bg-nexora-50/50" : ""
                  )}>
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-800">{r.costCenterName}</p>
                      <p className="text-slate-400 text-[10px]">{r.businessUnit}</p>
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold text-slate-800">
                      ${(r.actual / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2.5 text-right text-slate-500">
                      ${(r.budget / 1000).toFixed(0)}K
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={clsx(
                        "font-bold",
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
    </PageWrapper>
  );
}
