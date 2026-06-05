import PageWrapper from "@/components/layout/PageWrapper";
import AgentWorkspaceCTA from "@/components/agents/AgentWorkspaceCTA";
import ExecutiveSummaryBox from "@/components/dashboard/ExecutiveSummaryBox";
import RiskAlerts from "@/components/dashboard/RiskAlerts";
import RecommendedActions from "@/components/dashboard/RecommendedActions";
import KPICard from "@/components/dashboard/KPICard";
import StatsBanner from "@/components/dashboard/StatsBanner";
import { generateRiskFlags, generateRecommendedActions } from "@/lib/riskEngine";
import { getYTDSummary } from "@/lib/queries";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import type { KPI } from "@/types/finance";

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

export default async function CFOPage() {
  const risks   = generateRiskFlags();
  const actions = generateRecommendedActions();
  const ytd     = await getYTDSummary();
  const { actual: ytdActual, budget: ytdBudget, variance: ytdVar, variancePct: ytdVarPct } = ytd;

  const kpis: KPI[] = [
    {
      label: "YTD IT Spend",
      value: ytdActual, budget: ytdBudget, prior: ytdBudget * 0.94,
      format: "currency", trend: "up", trendPositive: false,
    },
    {
      label: "Budget Variance",
      value: ytdVarPct, budget: 0, prior: 0.02,
      format: "percent", trend: "up", trendPositive: false,
    },
    {
      label: "Critical Risks",
      value: risks.filter(r => r.severity === "critical").length,
      budget: 0, prior: 1,
      format: "number", trend: "up", trendPositive: false,
    },
    {
      label: "High-Priority Actions",
      value: actions.filter(a => a.priority === "High").length,
      budget: 0, prior: 3,
      format: "number", trend: "flat", trendPositive: false,
    },
  ];

  return (
    <PageWrapper
      title="CFO Summary"
      subtitle="Executive financial performance · AI-generated commentary and risk analysis"
      badge="CFO Agent"
    >
      <StatsBanner />

      {/* KPIs */}
      <section className="mb-8">
        <SectionHeader label="Key Performance Indicators" sub="YTD May 2026 · executive metrics" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => <KPICard key={i} kpi={k} />)}
        </div>
      </section>

      {/* Executive summary + Agent CTA */}
      <section className="mb-8">
        <SectionHeader label="Executive Summary & Agent Analysis" sub="CFO Agent narrative and workspace" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <ExecutiveSummaryBox
            agentName="CFO Agent"
            agentAvatar="🏦"
            summary={`IT organization closed May 2026 with YTD spend of ${formatCurrency(ytdActual)}, tracking ${formatPercent(ytdVarPct)} unfavorable versus the approved annual budget of ${formatCurrency(ytdBudget)}. The variance is primarily attributable to cloud infrastructure acceleration, scope expansion in external labor, and professional services engagements tied to the ERP modernization program. Full-year forecast has been revised to $38.2M, reflecting $1.8M of strategic investment above plan. Three critical procurement events require executive attention before June 30.`}
            keyPoints={[
              `YTD Actual: ${formatCurrency(ytdActual)} | Budget: ${formatCurrency(ytdBudget)} | Var: ${formatCurrency(ytdVar)} (${formatPercent(ytdVarPct)})`,
              "Cloud spend acceleration (+8.4% vs. budget) — driven by AWS EC2 and GCP Vertex AI buildout for AI platform",
              "4 over-budget contractor engagements totaling ~$118K in excess YTD spend",
              "AWS contract (June 30) and Deloitte engagement (July 31) are the two most time-sensitive items",
              "FinOps program projected to recover $350K in cloud savings — Q4 target",
            ]}
          />
          <AgentWorkspaceCTA
            agentId="cfo"
            contextNote="Ask the CFO Agent to explain the variance narrative, prepare board talking points, or identify the top risks from the data above."
            prompts={[
              "Give me the executive financial summary for May 2026",
              "How do we explain the budget variance to the board?",
              "What are the top 3 financial risks requiring action?",
            ]}
          />
        </div>
      </section>

      {/* Risk + Actions */}
      <section>
        <SectionHeader label="Risk Monitoring & Recommended Actions" sub="Active flags and prioritized next steps" />
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <RiskAlerts flags={risks} />
          <RecommendedActions actions={actions} />
        </div>
      </section>
    </PageWrapper>
  );
}
