import PageWrapper from "@/components/layout/PageWrapper";
import AgentChatPanel from "@/components/agents/AgentChatPanel";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import KPICard from "@/components/dashboard/KPICard";
import StatsBanner from "@/components/dashboard/StatsBanner";
import {
  vendors, getVendorsExpiringSoon,
  getTotalAnnualCommitment, getTotalYTDVendorSpend,
} from "@/data/vendors";
import { generateRiskFlags } from "@/lib/riskEngine";
import { formatCurrency, formatDate, daysUntil, isExpiringSoon } from "@/lib/formatters";
import type { KPI } from "@/types/finance";
import clsx from "clsx";

export default function VendorsPage() {
  const expiring   = getVendorsExpiringSoon(180);
  const procRisks  = generateRiskFlags().filter(r => r.category === "Procurement");
  const totalCommit = getTotalAnnualCommitment();
  const ytdSpend   = getTotalYTDVendorSpend();
  const highRisk   = vendors.filter(v => v.riskLevel === "High").length;

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

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
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

        <AgentChatPanel agentId="procurement" initialQuestion="Which contracts are expiring in the next 6 months?" />
      </div>

      <RiskAlerts flags={procRisks} />
    </PageWrapper>
  );
}
