import PageWrapper from "@/components/layout/PageWrapper";
import AgentChatPanel from "@/components/agents/AgentChatPanel";
import KPICard from "@/components/dashboard/KPICard";
import VarianceTable from "@/components/dashboard/VarianceTable";
import StatsBanner from "@/components/dashboard/StatsBanner";
import {
  contractors, getTotalContractorYTDSpend, getTotalContractorBudget,
  getOverBudgetContractors, getEndingSoonContractors, getContractorsByBU,
} from "@/data/externalLabor";
import { formatCurrency, formatDate } from "@/lib/formatters";
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

export default function ExternalLaborPage() {
  const ytdSpend   = getTotalContractorYTDSpend();
  const ytdBudget  = getTotalContractorBudget();
  const overBudget = getOverBudgetContractors();
  const endingSoon = getEndingSoonContractors();
  const byBU       = getContractorsByBU();
  const variance   = ytdSpend - ytdBudget;

  const kpis: KPI[] = [
    { label: "YTD Contractor Spend", value: ytdSpend,  budget: ytdBudget, prior: ytdBudget * 0.88, format: "currency", trend: "up", trendPositive: false },
    { label: "Approved Budget",      value: ytdBudget, budget: ytdBudget, prior: ytdBudget,         format: "currency", trend: "flat", trendPositive: true },
    { label: "Over-Budget Engagements", value: overBudget.length, budget: 0, prior: 2, format: "number", trend: "up", trendPositive: false },
    { label: "Ending This Quarter",  value: endingSoon.length, budget: 0, prior: 1, format: "number", trend: "up", trendPositive: false },
  ];

  const buRows = byBU.map(b => ({
    label:       b.bu,
    actual:      b.ytdSpend,
    budget:      b.budget,
    variance:    b.ytdSpend - b.budget,
    variancePct: b.budget > 0 ? (b.ytdSpend - b.budget) / b.budget : 0,
    highlight:   b.ytdSpend > b.budget,
  }));

  const statusCfg: Record<string, { bg: string; text: string; dot: string }> = {
    "Active":      { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    "Over Budget": { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
    "Ending Soon": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
    "On Hold":     { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
  };

  const sorted = [...contractors].sort((a, b) => (b.ytdSpend - b.budget) - (a.ytdSpend - a.budget));

  return (
    <PageWrapper
      title="External Labor"
      subtitle="Contractor spend · Burn rate · SOW compliance · Budget tracking"
      badge="External Labor Agent"
    >
      <StatsBanner />

      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="Contractor spend vs. approved SOW budgets" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      {/* Summary alert banner */}
      {overBudget.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 px-6 py-4 mb-6 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-xl shrink-0">⚠️</div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800">
              {overBudget.length} Contractors Over Approved Budget
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {overBudget.map(c => c.name).join(", ")} — Total excess: {formatCurrency(overBudget.reduce((s, c) => s + (c.ytdSpend - c.budget), 0))}. SOW amendments required before June 30 close.
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs text-red-500 font-medium">Total Excess</p>
            <p className="text-lg font-black text-red-700">
              {formatCurrency(overBudget.reduce((s, c) => s + (c.ytdSpend - c.budget), 0), true)}
            </p>
          </div>
        </div>
      )}

      <section className="mb-8">
        <SectionHeader label="Contractor Roster & Agent Analysis" sub="Active engagements sorted by budget variance" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Contractor table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="section-title">Active Contractor Roster</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {contractors.length} engagements · sorted by budget variance
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Over Budget
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-2" /> Ending Soon
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-left tbl-head">Contractor</th>
                  <th className="px-4 py-3 text-right tbl-head">YTD Spend</th>
                  <th className="px-4 py-3 text-right tbl-head">Budget</th>
                  <th className="px-4 py-3 text-right tbl-head">Variance</th>
                  <th className="px-4 py-3 text-center tbl-head">End Date</th>
                  <th className="px-4 py-3 text-center tbl-head">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map(c => {
                  const v   = c.ytdSpend - c.budget;
                  const cfg = statusCfg[c.status];
                  return (
                    <tr key={c.id} className={clsx(
                      "tbl-row",
                      c.status === "Over Budget" ? "bg-red-50/25" : ""
                    )}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className={clsx("w-2 h-2 rounded-full shrink-0", cfg.dot)} />
                          <div>
                            <p className="font-semibold text-slate-800">{c.name}</p>
                            <p className="text-[10px] text-slate-400">{c.role}</p>
                            <p className="text-[10px] text-slate-400">{c.vendor} · {c.costCenterName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(c.ytdSpend, true)}</p>
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className={clsx("h-full rounded-full", v > 0 ? "bg-red-500" : "bg-nexora-500")}
                            style={{ width: `${Math.min((c.ytdSpend / c.budget) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 font-medium">
                        {formatCurrency(c.budget, true)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={clsx(
                          "text-xs font-bold",
                          v > 0 ? "text-red-600" : "text-emerald-600"
                        )}>
                          {v > 0 ? "+" : ""}{formatCurrency(v, true)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center text-xs text-slate-600 font-medium">
                        {formatDate(c.endDate)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={clsx(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full",
                          cfg.bg, cfg.text
                        )}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AgentChatPanel agentId="external-labor" initialQuestion="Which contractors are over their approved SOW budget?" />
        </div>
      </section>

      <section>
        <SectionHeader label="Spend by Business Unit" sub="YTD contractor spend vs. approved budget" />
        <VarianceTable
        title="Contractor Spend by Business Unit"
        subtitle="Highlighted rows = over approved budget"
        rows={buRows}
        />
      </section>
    </PageWrapper>
  );
}
