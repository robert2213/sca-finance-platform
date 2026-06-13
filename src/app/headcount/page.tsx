export const dynamic = "force-dynamic";
import PageWrapper from "@/components/layout/PageWrapper";
import AgentWorkspaceCTA from "@/components/agents/AgentWorkspaceCTA";
import KPICard from "@/components/dashboard/KPICard";
import HeadcountChart from "@/components/charts/HeadcountChart";
import StatsBanner from "@/components/dashboard/StatsBanner";
import {
  getHeadcount, getHCSummary, getOpenReqs, getHCByBusinessUnit,
} from "@/lib/queries";
import { getTenantClientId } from "@/lib/tenant/tenant-context";
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

export default async function HeadcountPage() {
  const clientId = await getTenantClientId();
  const [headcount, summary, openReqs, byBU] = await Promise.all([
    getHeadcount(clientId),
    getHCSummary(clientId),
    getOpenReqs(clientId),
    getHCByBusinessUnit(clientId),
  ]);
  const salaryBudget = summary.totalAnnualSalaryBudget;
  const fillRate     = summary.fillRate;

  const kpis: KPI[] = [
    { label: "Filled Positions",     value: summary.filled,  budget: summary.total,       prior: summary.filled - 1,                   format: "headcount", trend: "flat", trendPositive: true  },
    { label: "Open Requisitions",    value: summary.open,    budget: 0,                   prior: summary.open + 2,                     format: "headcount", trend: "down", trendPositive: true  },
    { label: "HC Fill Rate",         value: fillRate,         budget: 0.9,                 prior: (summary.filled - 1) / summary.total, format: "percent",   trend: "up",   trendPositive: true  },
    { label: "Annual Salary Budget", value: salaryBudget,    budget: salaryBudget * 1.05, prior: salaryBudget * 0.97,                  format: "currency",  trend: "up",   trendPositive: false },
  ];

  const statusCfg: Record<string, { bg: string; text: string; dot: string }> = {
    "Filled":        { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    "Open":          { bg: "bg-red-50",     text: "text-red-700",     dot: "bg-red-500"     },
    "Pending Offer": { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"   },
    "On Leave":      { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
  };

  const sorted = [...headcount].sort((a, b) => {
    const order = { "Open": 0, "Pending Offer": 1, "On Leave": 2, "Filled": 3 };
    return order[a.status] - order[b.status];
  });

  return (
    <PageWrapper
      title="Headcount"
      subtitle="Workforce planning · Open reqs · Salary budget · Fill rate"
      badge="Headcount Agent"
    >
      <StatsBanner clientId={clientId} />

      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="Workforce metrics · YTD May 2026" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      <section className="mb-8">
        <SectionHeader label="Headcount Roster & Mix" sub="All positions sorted by status priority" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* HC Roster */}
          <div className="xl:col-span-2 card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="section-title">Headcount Roster</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {summary.total} approved positions · sorted by status priority
                </p>
              </div>
              <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold">
                {(["Open","Pending Offer","On Leave","Filled"] as const).map(s => (
                  <span key={s} className="flex items-center gap-1 text-slate-500">
                    <span className={clsx("w-2 h-2 rounded-full", statusCfg[s].dot)} />
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "460px" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                  <tr>
                    <th className="px-5 py-3 text-left tbl-head">Role</th>
                    <th className="px-4 py-3 text-left tbl-head">BU · Level</th>
                    <th className="px-4 py-3 text-right tbl-head">Salary</th>
                    <th className="px-4 py-3 text-center tbl-head">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sorted.map(h => {
                    const cfg = statusCfg[h.status];
                    return (
                      <tr key={h.id} className={clsx(
                        "tbl-row",
                        h.status === "Open" ? "bg-red-50/20" :
                        h.status === "Pending Offer" ? "bg-amber-50/20" : ""
                      )}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-start gap-2">
                            <div className={clsx("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", cfg.dot)} />
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-tight">{h.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-[10px] text-slate-400">{h.location}</p>
                                {h.isBackfill && (
                                  <span className="text-[9px] font-bold text-nexora-500 bg-nexora-50 border border-nexora-100 px-1.5 py-0.5 rounded-full">
                                    Backfill
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-xs text-slate-600">{h.businessUnit}</p>
                          <span className="text-[10px] font-black bg-nexora-50 text-nexora-700 border border-nexora-100 px-1.5 py-0.5 rounded-md">
                            {h.level}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <p className="font-bold text-slate-800 text-sm">{formatCurrency(h.annualSalary, true)}</p>
                          <p className="text-[10px] text-slate-400">annual</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full",
                            cfg.bg, cfg.text
                          )}>
                            {h.status}
                          </span>
                          {h.status === "Open" && h.openDate && (
                            <p className="text-[9px] text-red-400 mt-0.5">Since {formatDate(h.openDate)}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <div className="card p-5">
              <h2 className="section-title mb-1">Headcount Mix</h2>
              <p className="text-[11px] text-slate-400 mb-3">Fill rate: {(fillRate * 100).toFixed(0)}%</p>
              <HeadcountChart
                filled={summary.filled}
                open={summary.open}
                pendingOffer={summary.pendingOffer}
                onLeave={summary.onLeave}
              />
            </div>

            <div className="card overflow-hidden">
              <div className="card-header">
                <h2 className="section-title">Fill Rate by BU</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {byBU.sort((a, b) => b.total - a.total).map(b => {
                  const rate = b.filled / b.total;
                  return (
                    <div key={b.bu} className="px-5 py-3.5 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 truncate">{b.bu}</p>
                        <p className="text-[10px] text-slate-400">{b.filled}/{b.total} · {b.open} open</p>
                      </div>
                      <div className="w-24 shrink-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-slate-600">{(rate * 100).toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={clsx("h-full rounded-full transition-all", rate < 0.8 ? "bg-red-400" : rate < 0.9 ? "bg-amber-400" : "bg-nexora-500")}
                            style={{ width: `${rate * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader label="Open Requisitions & Agent Analysis" sub="Active positions and workforce planning chat" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card overflow-hidden">
            <div className="card-header flex items-center justify-between">
              <div>
                <h2 className="section-title">Open Requisitions</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{openReqs.length} positions in process</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                {openReqs.filter(h => h.status === "Open").length} Active Open
              </span>
            </div>
            <div className="divide-y divide-slate-50">
              {openReqs.map(h => {
                const cfg = statusCfg[h.status];
                return (
                  <div key={h.id} className="px-5 py-4 flex items-start justify-between gap-4 hover:bg-slate-50/60">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={clsx("w-2 h-2 rounded-full mt-1.5 shrink-0", cfg.dot)} />
                      <div>
                        <p className="text-sm font-semibold text-slate-800 leading-snug">{h.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {h.businessUnit} · {h.level} · {h.location}
                        </p>
                        {h.openDate && (
                          <p className="text-[10px] text-red-500 font-medium mt-0.5">
                            Open since {formatDate(h.openDate)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-slate-700">{formatCurrency(h.annualSalary, true)}</p>
                      <span className={clsx(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block",
                        cfg.bg, cfg.text
                      )}>
                        {h.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <AgentWorkspaceCTA
              agentId="headcount"
              contextNote="Ask the Headcount Agent about open reqs, fill rate trends, salary savings, or contractor cost premium from HC gaps."
              prompts={[
                "How many open requisitions do we have and where?",
                "What is the financial impact of our open headcount?",
                "Which BUs have the largest workforce gaps?",
              ]}
            />
        </div>
      </section>
    </PageWrapper>
  );
}
