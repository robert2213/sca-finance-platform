export const dynamic = "force-dynamic";
import PageWrapper from "@/components/layout/PageWrapper";
import AgentWorkspaceCTA from "@/components/agents/AgentWorkspaceCTA";
import KPICard from "@/components/dashboard/KPICard";
import SpendTrendChart from "@/components/charts/SpendTrendChart";
import VarianceTable from "@/components/dashboard/VarianceTable";
import ExecutiveSummaryBox from "@/components/dashboard/ExecutiveSummaryBox";
import StatsBanner from "@/components/dashboard/StatsBanner";
// Cloud-by-provider chart still uses static data — provider breakdown
// is not captured in fact_transactions without a separate cloud spend table.
import {
  getTotalCloudSpendByMonth, getCloudByProvider,
} from "@/data/cloudSpend";
import { getYTDSummary, getHCSummary, getContractors } from "@/lib/queries";
import { resolveClientId } from "@/config/client.resolver";
import { formatCurrency, formatPercent } from "@/lib/formatters";
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

export default async function CIOPage() {
  const cloudByMonth   = getTotalCloudSpendByMonth();
  const cloudProviders = getCloudByProvider();
  const clientId = resolveClientId();
  const [ytd, hc, allContractors] = await Promise.all([
    getYTDSummary(clientId),
    getHCSummary(clientId),
    getContractors(clientId),
  ]);
  const totalIT    = ytd.actual;
  const itBudget   = ytd.budget;
  const totalCloud = cloudProviders.reduce((s, p) => s + p.ytdSpend, 0);
  const cloudBudget = cloudProviders.reduce((s, p) => s + p.ytdBudget, 0);
  const cloudPct   = totalIT > 0 ? totalCloud / totalIT : 0;
  const contractorYTD = allContractors.reduce((s, c) => s + c.ytdSpend, 0);

  const kpis: KPI[] = [
    { label: "Total IT Spend YTD",  value: totalIT,    budget: itBudget,    prior: itBudget * 0.94,   format: "currency", trend: "up",   trendPositive: false },
    { label: "Cloud Spend YTD",     value: totalCloud, budget: cloudBudget, prior: cloudBudget * 0.9, format: "currency", trend: "up",   trendPositive: false },
    { label: "Cloud % of IT Spend", value: cloudPct,   budget: 0.40,        prior: 0.38,              format: "percent",  trend: "up",   trendPositive: false },
    { label: "HC Fill Rate",        value: hc.fillRate, budget: 0.90, prior: hc.total > 0 ? (hc.filled - 1) / hc.total : 0, format: "percent", trend: "up", trendPositive: true },
  ];

  const cloudTrendData = cloudByMonth.map(m => ({
    month: m.month, AWS: m.aws, Azure: m.azure, GCP: m.gcp,
  }));

  const providerRows = cloudProviders.map(p => ({
    label:       p.provider,
    actual:      p.ytdSpend,
    budget:      p.ytdBudget,
    variance:    p.ytdSpend - p.ytdBudget,
    variancePct: p.ytdBudget > 0 ? (p.ytdSpend - p.ytdBudget) / p.ytdBudget : 0,
    highlight:   p.ytdSpend > p.ytdBudget,
  }));

  const investmentBreakdown = [
    { label: "Cloud Infrastructure", value: totalCloud,    pct: cloudPct,                                             color: "bg-indigo-500" },
    { label: "Labor (FTE)",          value: totalIT * 0.28, pct: 0.28,                                                  color: "bg-emerald-500" },
    { label: "External Labor",       value: contractorYTD,  pct: totalIT > 0 ? contractorYTD / totalIT : 0,            color: "bg-amber-500" },
    { label: "Software & SaaS",      value: totalIT * 0.18, pct: 0.18,                                                  color: "bg-blue-500"   },
    { label: "Professional Services",value: totalIT * 0.09, pct: 0.09,                                                  color: "bg-purple-500" },
    { label: "Hardware & Facilities",value: totalIT * 0.06, pct: 0.06,                                                  color: "bg-slate-400"  },
  ];

  return (
    <PageWrapper
      title="CIO Briefing"
      subtitle="IT investment summary · Cloud trends · Executive talking points"
      badge="CIO Finance Partner"
    >
      <StatsBanner clientId={clientId} />

      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="IT investment metrics · YTD May 2026" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      <section className="mb-8">
        <SectionHeader label="Executive Summary" sub="CIO Finance Partner · IT investment narrative" />
        <ExecutiveSummaryBox
          agentName="CIO Finance Partner Agent"
          agentAvatar="💡"
          summary={`Total IT investment YTD is ${formatCurrency(totalIT)}, tracking ${formatPercent((totalIT - itBudget) / itBudget)} unfavorable vs. plan. Cloud spend of ${formatCurrency(totalCloud)} represents ${(cloudPct * 100).toFixed(0)}% of total IT spend and is the primary driver of the budget variance. This acceleration is strategically aligned with the digital platform roadmap approved by the Board in Q4 2025. A structured FinOps optimization program targeting $350K in cloud savings is underway, with results expected in Q4 2026.`}
          keyPoints={[
            `Cloud YTD: ${formatCurrency(totalCloud)} — ${formatPercent((totalCloud - cloudBudget) / cloudBudget)} vs. budget | Primary driver: AWS EC2 + GCP Vertex AI`,
            "AWS is the largest single provider at 51% of cloud spend — EDP renewal due June 30 is #1 procurement priority",
            "GCP Vertex AI/ML spend growing fastest month-over-month (+57% Jan–May) — tied to AI platform buildout",
            `HC fill rate: ${((hc.filled / hc.total) * 100).toFixed(0)}% — ${hc.open} open reqs generating contractor dependency and cost premium`,
            "FinOps program = $350K savings target by Q4 through right-sizing and committed use discounts",
          ]}
        />
      </section>

      <section className="mb-8">
        <SectionHeader label="Cloud Spend Trend & Agent Analysis" sub="Provider breakdown and CIO briefing chat" />
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 card overflow-hidden">
          <div className="card-header flex items-center justify-between">
            <div>
              <h2 className="section-title">Cloud Spend by Provider — Monthly Trend</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">AWS · Azure · GCP · Jan–May 2026</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/>AWS</span>
              <span className="flex items-center gap-1 text-nexora-600"><span className="w-2 h-2 rounded-full bg-nexora-500 inline-block"/>Azure</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"/>GCP</span>
            </div>
          </div>
          <div className="p-6 pt-4">
            <SpendTrendChart
              data={cloudTrendData}
              lines={[
                { key: "AWS",   color: "#f59e0b", label: "AWS"   },
                { key: "Azure", color: "#6366f1", label: "Azure" },
                { key: "GCP",   color: "#10b981", label: "GCP"   },
              ]}
              height={300}
              area
            />
          </div>
        </div>

        <AgentWorkspaceCTA
          agentId="cio"
          contextNote="Ask the CIO Finance Partner to prepare executive talking points, explain cloud ROI, or draft board-ready commentary."
          prompts={[
            "Prepare a 5-point IT financial briefing for the executive team",
            "Give me CIO-ready talking points on cloud spend and ROI",
            "How do I explain the IT budget variance to the CEO?",
          ]}
        />
        </div>
      </section>

      <section className="mb-8">
        <SectionHeader label="Cloud Provider Detail & IT Investment Mix" sub="Provider variance and spend category breakdown" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <VarianceTable
          title="Cloud Spend by Provider — YTD"
          subtitle="All three providers trending over budget"
          rows={providerRows}
        />

        {/* IT Investment breakdown */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="section-title">IT Investment Breakdown</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">YTD May 2026 · By spend category</p>
          </div>
          <div className="divide-y divide-slate-50">
            {investmentBreakdown.map(item => (
              <div key={item.label} className="px-6 py-3.5 flex items-center gap-4">
                <div className={clsx("w-3 h-3 rounded-sm shrink-0", item.color)} />
                <p className="text-sm font-medium text-slate-700 flex-1 min-w-0 truncate">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-slate-800 w-20 text-right shrink-0">
                  {formatCurrency(item.value, true)}
                </p>
                <div className="w-32 shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx("h-full rounded-full transition-all duration-700", item.color)}
                        style={{ width: `${item.pct * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold w-8 text-right">
                      {(item.pct * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/60">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-600">Total YTD</span>
              <span className="font-black text-slate-900">{formatCurrency(totalIT, true)}</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section>
        <SectionHeader label="Cloud Provider Cards" sub="YTD spend and budget variance per provider" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cloudProviders.map(p => {
          const v   = p.ytdSpend - p.ytdBudget;
          const pct = p.ytdBudget > 0 ? v / p.ytdBudget : 0;
          const providerColor: Record<string, string> = {
            AWS: "from-amber-50 to-amber-100 border-amber-200",
            Azure: "from-indigo-50 to-indigo-100 border-indigo-200",
            GCP: "from-emerald-50 to-emerald-100 border-emerald-200",
          };
          const textColor: Record<string, string> = {
            AWS: "text-amber-800", Azure: "text-indigo-800", GCP: "text-emerald-800",
          };
          return (
            <div key={p.provider} className={clsx("rounded-2xl bg-gradient-to-br border p-5", providerColor[p.provider])}>
              <div className="flex items-center justify-between mb-3">
                <p className={clsx("font-black text-base", textColor[p.provider])}>{p.provider}</p>
                <span className={clsx(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                  v > 0 ? "bg-red-100 text-red-700 border-red-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"
                )}>
                  {v > 0 ? "▲" : "▼"} {formatPercent(Math.abs(pct))}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 mb-1">{formatCurrency(p.ytdSpend, true)}</p>
              <p className="text-[11px] text-slate-500 font-medium">Budget: {formatCurrency(p.ytdBudget, true)}</p>
              <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                <div
                  className={clsx("h-full rounded-full", v > 0 ? "bg-red-400" : "bg-emerald-500")}
                  style={{ width: `${Math.min((p.ytdSpend / p.ytdBudget) * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
        </div>
      </section>
    </PageWrapper>
  );
}
