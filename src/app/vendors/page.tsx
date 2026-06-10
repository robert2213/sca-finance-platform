export const dynamic = "force-dynamic";
import PageWrapper from "@/components/layout/PageWrapper";
import AgentWorkspaceCTA from "@/components/agents/AgentWorkspaceCTA";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import KPICard from "@/components/dashboard/KPICard";
import StatsBanner from "@/components/dashboard/StatsBanner";
import { getVendors } from "@/lib/queries";
import { generateRiskFlags } from "@/lib/riskEngine";
import { formatCurrency, formatDate, daysUntil, isExpiringSoon } from "@/lib/formatters";
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

export default async function VendorsPage() {
  const vendors    = await getVendors();
  const today      = new Date().toISOString().slice(0, 10);
  const in180      = new Date();
  in180.setDate(in180.getDate() + 180);
  const in180Str   = in180.toISOString().slice(0, 10);
  const expiring   = vendors.filter(v => v.contractEnd && v.contractEnd <= in180Str && v.contractEnd >= today);
  const procRisks  = generateRiskFlags().filter(r => r.category === "Procurement");
  const totalCommit = vendors.reduce((s, v) => s + v.annualValue, 0);
  const ytdSpend    = vendors.reduce((s, v) => s + v.ytdSpend, 0);
  const highRisk    = vendors.filter(v => v.riskLevel === "High").length;

  const kpis: KPI[] = [
    { label: "Annual Commitment",    value: totalCommit,       budget: totalCommit,       prior: totalCommit * 0.95, format: "currency", trend: "up",   trendPositive: false },
    { label: "YTD Vendor Spend",     value: ytdSpend,          budget: totalCommit / 2,   prior: (totalCommit / 2) * 0.95, format: "currency", trend: "up", trendPositive: false },
    { label: "Expiring ≤180 Days",  value: expiring.length,   budget: 0,                 prior: 2,  format: "number", trend: "up",   trendPositive: false },
    { label: "High-Risk Vendors",    value: highRisk,          budget: 0,                 prior: 2,  format: "number", trend: "flat", trendPositive: false },
  ];

  // Sort: high risk + expiring first
  const sorted = [...vendors].sort((a, b) => {
    const aScore = (a.riskLevel === "High" ? 2 : a.riskLevel === "Medium" ? 1 : 0) + (isExpiringSoon(a.contractEnd, 180) ? 3 : 0);
    const bScore = (b.riskLevel === "High" ? 2 : b.riskLevel === "Medium" ? 1 : 0) + (isExpiringSoon(b.contractEnd, 180) ? 3 : 0);
    return bScore - aScore;
  });

  return (
    <PageWrapper
      title="Vendor Spend"
      subtitle="Contract management · Spend analysis · Renewal pipeline"
      badge="Procurement Agent"
    >
      <StatsBanner />

      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="Vendor portfolio health" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      <section className="mb-8">
        <SectionHeader label="Vendor Portfolio & Agent Analysis" sub="Contract status, risk levels, expiry timeline" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Vendor table */}
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="section-title">Vendor Portfolio</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {vendors.length} active contracts · sorted by risk priority
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/>High</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>Medium</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>Low</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-3 text-left tbl-head">Vendor</th>
                  <th className="px-4 py-3 text-right tbl-head">YTD Spend</th>
                  <th className="px-4 py-3 text-right tbl-head">Annual</th>
                  <th className="px-4 py-3 text-center tbl-head">Expires</th>
                  <th className="px-4 py-3 text-center tbl-head">Renew</th>
                  <th className="px-4 py-3 text-center tbl-head">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sorted.map(v => {
                  const days      = daysUntil(v.contractEnd);
                  const critical  = isExpiringSoon(v.contractEnd, 90) && !v.autoRenew;
                  const warning   = isExpiringSoon(v.contractEnd, 180) && !v.autoRenew && !critical;
                  const riskColor = v.riskLevel === "High" ? "bg-red-500" : v.riskLevel === "Medium" ? "bg-amber-400" : "bg-emerald-500";

                  return (
                    <tr key={v.id} className={clsx(
                      "tbl-row",
                      critical ? "bg-red-50/40"  : warning ? "bg-amber-50/30" : ""
                    )}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={clsx("w-2 h-2 rounded-full shrink-0", riskColor)} />
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{v.name}</p>
                            <p className="text-[10px] text-slate-400">{v.businessUnit} · {v.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(v.ytdSpend, true)}</p>
                        {/* Mini spend bar */}
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                          <div
                            className="h-full bg-nexora-400 rounded-full"
                            style={{ width: `${Math.min((v.ytdSpend / v.annualValue) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-500 font-medium text-sm">
                        {formatCurrency(v.annualValue, true)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <p className={clsx(
                          "text-xs font-semibold",
                          critical ? "text-red-600" : warning ? "text-amber-600" : "text-slate-600"
                        )}>
                          {formatDate(v.contractEnd)}
                        </p>
                        <p className={clsx(
                          "text-[10px] font-bold",
                          days < 90 ? "text-red-500" : days < 180 ? "text-amber-500" : "text-slate-400"
                        )}>
                          {days}d
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={clsx(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          v.autoRenew
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          {v.autoRenew ? "Yes" : "No ⚠"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={clsx(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                          v.riskLevel === "High"   ? "bg-red-100 text-red-700 border-red-200"     :
                          v.riskLevel === "Medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                                     "bg-emerald-100 text-emerald-700 border-emerald-200"
                        )}>
                          {v.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <AgentWorkspaceCTA
            agentId="procurement"
            contextNote="Ask the Procurement Agent about contracts expiring above, renewal priorities, or vendor concentration risk."
            prompts={[
              "Which contracts are expiring in the next 90 days?",
              "Where do we have vendor concentration risk?",
              "Which vendors should we prioritize for renewal?",
            ]}
          />
        </div>
      </section>

      <section>
        <SectionHeader label="Procurement Risk Alerts" sub="Active flags requiring action" />
        <RiskAlerts flags={procRisks} />
      </section>
    </PageWrapper>
  );
}
