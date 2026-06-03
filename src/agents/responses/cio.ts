/**
 * CIO Finance Partner Agent — Response Library
 *
 * Handles: Cloud spend analysis, IT investment narrative, CIO talking points,
 * technology ROI, FinOps strategy, project spend, and board-ready tech briefings.
 */

import type { AgentResponse } from "@/types/finance";
import type { ConversationContext } from "../agentEngine";

type Route = {
  key: string;
  keywords: string[];
  negatives?: string[];
  weight: number;
  handler: (ctx: ConversationContext) => AgentResponse;
};

export const cioResponses: Route[] = [

  // ── 1. Cloud spend deep dive ───────────────────────────────────────────────
  {
    key: "cloud-spend",
    keywords: [
      "cloud", "aws", "azure", "gcp", "google", "microsoft",
      "cloud spend", "cloud cost", "infrastructure spend", "cloud budget",
    ],
    weight: 8,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const aws   = s.cloudByProvider.find(p => p.provider === "AWS")!;
      const azure = s.cloudByProvider.find(p => p.provider === "Azure")!;
      const gcp   = s.cloudByProvider.find(p => p.provider === "GCP")!;
      return {
        answer: `**Cloud Infrastructure Spend — CIO Deep Dive | ${s.periodLabel}**

**Total Cloud YTD**: **${fmt(s.cloudYTD)}** vs. budget **${fmt(s.cloudBudget)}** — **${pct(s.cloudVariancePct)} unfavorable**

**By Provider**
| Provider | YTD Spend | YTD Budget | Variance | Var% |
|---|---|---|---|---|
| AWS | ${fmt(aws.ytdSpend)} | ${fmt(aws.ytdBudget)} | ${fmt(aws.ytdSpend - aws.ytdBudget)} | ${pct((aws.ytdSpend - aws.ytdBudget) / aws.ytdBudget)} |
| Azure | ${fmt(azure.ytdSpend)} | ${fmt(azure.ytdBudget)} | ${fmt(azure.ytdSpend - azure.ytdBudget)} | ${pct((azure.ytdSpend - azure.ytdBudget) / azure.ytdBudget)} |
| GCP | ${fmt(gcp.ytdSpend)} | ${fmt(gcp.ytdBudget)} | ${fmt(gcp.ytdSpend - gcp.ytdBudget)} | ${pct((gcp.ytdSpend - gcp.ytdBudget) / gcp.ytdBudget)} |

**AWS — Primary Driver (51% of Cloud)**
- EC2/Compute: scaling for AI inference layer — +${pct(0.16)} over budget
- S3/Storage: data lake growth tracking above plan — moderate overage
- RDS/Databases: +${pct(0.125)} over budget — read replica additions for performance
- Contract expiry June 30 — EDP negotiation in progress (target 13% discount)

**Azure — Controlled Growth**
- Virtual Machines: Dev/Test environment over budget — non-prod sprawl identified
- M365 flat-rate — on budget, stable
- Azure SQL growing moderately with Analytics workloads

**GCP — Fastest Growing (MoM: ${pct(s.cloudMoMGrowth)})**
- BigQuery: largest variance driver — usage-based pricing, self-serve analytics adoption spike
- Vertex AI/ML: 57% spend growth Jan–May — tied to Nexora AI platform roadmap
- GKE: actually declining — workload optimization paying off

**FinOps Opportunity**
Identified savings of ${fmt(s.cloudYTD * 0.15)} (15% of YTD cloud spend) through:
1. EC2 Reserved Instances for steady-state workloads: ${fmt(s.cloudYTD * 0.08)}
2. BigQuery committed slots vs. on-demand: ${fmt(s.cloudYTD * 0.04)}
3. Non-prod environment shutdown schedule: ${fmt(s.cloudYTD * 0.03)}`,
        keyPoints: [
          `Total cloud YTD: ${fmt(s.cloudYTD)} — ${pct(s.cloudVariancePct)} unfavorable vs. budget`,
          `AWS = 51% of cloud spend (${fmt(aws.ytdSpend)}) — contract renewal June 30 is top priority`,
          `GCP fastest growing at ${pct(s.cloudMoMGrowth)} MoM — Vertex AI/ML platform investment`,
          "Azure under control — M365 flat rate, Dev/Test has non-prod sprawl to address",
          `FinOps opportunity: ${fmt(s.cloudYTD * 0.15)} in savings via Reserved Instances + BigQuery slots`,
        ],
        riskFlags: [],
        actions: [
          { id: "CIO-CL1", priority: "High", title: "AWS EDP: 3-year commit, 13% target discount", description: `Lock pricing on ${fmt(aws.ytdSpend / 5 * 12)} annual run rate before June 30`, owner: "CIO + Procurement", dueDate: "2026-06-15" },
          { id: "CIO-CL2", priority: "High", title: "BigQuery slot commitment — upgrade evaluation", description: "Model Enterprise slot tier vs. on-demand — ROI positive at current overage rate", owner: "Cloud Engineering + Data", dueDate: "2026-07-01" },
          { id: "CIO-CL3", priority: "Medium", title: "Azure Dev/Test environment audit", description: "Identify and schedule non-prod environment shutdowns for cost reduction", owner: "Cloud Engineering", dueDate: "2026-06-30" },
        ],
      };
    },
  },

  // ── 2. CIO talking points / executive briefing ─────────────────────────────
  {
    key: "talking-points",
    keywords: [
      "talking point", "brief", "briefing", "executive", "board", "leadership",
      "cxo", "ceo", "slides", "present", "prepare for", "how do i explain",
      "narrative", "message", "what should i say",
    ],
    weight: 9,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      return {
        answer: `**CIO Executive Briefing — Talking Points | ${s.periodLabel}**

**Recommended Opening**
*"Our technology investment is tracking ahead of plan, primarily because we accelerated strategic infrastructure work that the Board approved in Q4 2025. We are managing this with rigor — a FinOps program, an AWS negotiation in flight, and a clear path to bringing the full-year variance below $1.1M."*

**Five CIO Talking Points**

**1. Strategic Investment, Not Cost Overrun**
Our ${pct(Math.abs(s.ytdVariancePct))} variance vs. budget is driven by AI/ML infrastructure investment — specifically AWS EC2 scaling for the Nexora AI inference platform and GCP Vertex AI training workloads. This spend is tied directly to the Board-approved product roadmap. Without it, we miss Q3 AI feature commitments.

**2. Cloud Spend is Growing — and We're Acting**
Cloud represents ${pct(s.cloudYTD / s.ytdActual)} of IT spend. We acknowledge the growth rate (${pct(s.cloudMoMGrowth)} MoM in May) is above plan. We have launched a FinOps program targeting ${fmt(s.cloudYTD * 0.15)} in savings and are in active EDP negotiation with AWS for a 12–15% discount on our largest cloud contract.

**3. Vendor Portfolio is Under Control**
${s.expiringVendors180.length} contracts are in our renewal pipeline. All are actively managed — no surprise expirations. The AWS renewal (June 30) is our highest-priority event and will set our cloud cost structure for 3 years.

**4. Our Team is Growing, Responsibly**
IT headcount is ${(s.fillRate * 100).toFixed(0)}% filled. We have ${s.hcSummary.open} open requisitions in progress, with priority on Security (IAM Architect) and FinOps (Cloud Cost Analyst). As these roles fill, we reduce contractor dependency and improve our cost structure.

**5. Full-Year Outlook — Clear and Managed**
Base-case full-year forecast: ${fmt(s.fullYearForecast)} vs. ${fmt(s.fullYearBudget)} budget. With AWS EDP + FinOps + contractor discipline, we project the overrun compresses to approximately ${fmt((s.fullYearForecast - s.fullYearBudget) * 0.60)}. We'll have a sharper forecast at Q2 close.`,
        keyPoints: [
          "Lead with strategic framing: AI/ML acceleration is Board-approved and product-critical",
          "Acknowledge cloud growth, show mitigation credibility (FinOps + AWS deal)",
          "Vendor portfolio is managed — no service disruption risk from contract expiries",
          `HC at ${(s.fillRate * 100).toFixed(0)}% filled — open reqs in progress, contractor dependency reducing`,
          "Full-year outlook: base case $1.8M over; mitigated case ~$1.1M — show the path",
        ],
        riskFlags: [],
        actions: [
          { id: "CIO-TP1", priority: "High", title: "Prepare CIO board presentation package", description: "4-slide IT financial narrative — for July Board meeting", owner: "CIO + IT Finance", dueDate: "2026-07-01" },
          { id: "CIO-TP2", priority: "Medium", title: "Monthly CIO financial dashboard", description: "Single-page view: cloud spend, HC, vendor pipeline, risk flags", owner: "IT Finance", dueDate: "2026-06-05" },
        ],
      };
    },
  },

  // ── 3. FinOps strategy ─────────────────────────────────────────────────────
  {
    key: "finops",
    keywords: [
      "finops", "fin ops", "cloud optimization", "cloud saving", "reserved instance",
      "committed use", "rightsiz", "right-siz", "cloud waste", "tagging",
    ],
    weight: 9,
    handler({ snapshot: s }) {
      const { fmt } = s;
      const totalCloudSavings = s.cloudYTD * 0.15;
      return {
        answer: `**FinOps Strategy — Cloud Cost Optimization Program**

**Program Overview**
Target: **${fmt(totalCloudSavings)} in annualized cloud savings** by Q4 2026
Current cloud run rate: ${fmt(s.cloudYTD / 5 * 12)}/year
Post-FinOps target: ${fmt(s.cloudYTD / 5 * 12 - totalCloudSavings)}/year

**Workstream 1: AWS Reserved Instances (${fmt(s.cloudYTD * 0.08)} savings)**
- Analyze 12-month EC2 usage patterns using Cost Explorer
- Convert steady-state instances (identified as 60%+ of fleet) to 1-year Standard RIs
- Estimated savings: 40% discount vs. on-demand for converted instances
- Timeline: Analysis complete by June 30; RI purchases July 1
- Responsibility: Cloud Engineering + FinOps Analyst (pending hire)

**Workstream 2: BigQuery Committed Slots (${fmt(s.cloudYTD * 0.04)} savings)**
- Current: on-demand slot pricing at peak hours — ${fmt(22_000)}/month in overage
- Solution: 100-slot commitment at flat rate — eliminates overage at 60% lower cost
- Timeline: Contract with Google — can be activated immediately
- Responsibility: Data Engineering Lead

**Workstream 3: Non-Prod Environment Management (${fmt(s.cloudYTD * 0.03)} savings)**
- Azure Dev/Test and AWS sandbox environments running 24/7
- Implement auto-shutdown for non-prod between 7pm–7am weekdays and weekends
- Estimated idle-time waste: 35% of non-prod spend
- Timeline: Script deployment by June 15; automated by July 1
- Responsibility: Platform Engineering

**Workstream 4: AWS EDP Negotiation (${fmt(s.cloudYTD / 5 * 12 * 0.13)} savings)**
- 3-year EDP commitment at 13% below current contract
- Requires CFO + CIO sign-off on commitment level
- Timeline: Must close before June 30 expiry
- Responsibility: Procurement + CIO + CFO

**Governance Recommendations**
1. Assign a dedicated FinOps Analyst (currently open req — fill by Q3)
2. Implement real-time cloud cost dashboards with per-team budgets and alerts
3. Monthly FinOps review: Engineering leads review their cloud spend weekly
4. Tagging enforcement: All new resources must have cost center and project tags
5. Require VP approval for any new cloud spend >$10K/month`,
        keyPoints: [
          `Total FinOps opportunity: ${fmt(totalCloudSavings)} annually — 4 workstreams identified`,
          "AWS Reserved Instances = largest single lever — 40% discount on converted fleet",
          "BigQuery committed slots = fastest ROI — eliminates $22K/month in overages immediately",
          "Non-prod auto-shutdown = quick win — deploy script in 2 weeks",
          "AWS EDP deal is time-sensitive — must close before June 30",
        ],
        riskFlags: [],
        actions: [
          { id: "CIO-FO1", priority: "High", title: "Launch FinOps program — assign lead", description: "Appoint interim FinOps lead from Cloud Engineering team while FTE hire is in progress", owner: "CIO", dueDate: "2026-06-10" },
          { id: "CIO-FO2", priority: "High", title: "BigQuery committed slots — activate immediately", description: "Quick win — can be activated via GCP console today. Saves $22K/month.", owner: "Data Engineering", dueDate: "2026-06-10" },
          { id: "CIO-FO3", priority: "Medium", title: "Non-prod auto-shutdown scripts", description: "Platform team to deploy schedule-based shutdown for Azure Dev/Test and AWS sandbox", owner: "Platform Engineering", dueDate: "2026-06-15" },
        ],
      };
    },
  },

  // ── 4. IT investment story / total spend ──────────────────────────────────
  {
    key: "investment-story",
    keywords: [
      "investment", "total spend", "total it", "it spend", "technology spend",
      "technology investment", "it budget", "technology budget", "portfolio",
    ],
    weight: 7,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const cloudPct = s.cloudYTD / s.ytdActual;
      const laborPct = (s.ytdActual * 0.28) / s.ytdActual;
      const contractorPct = s.laborYTD / s.ytdActual;
      return {
        answer: `**IT Investment Portfolio — CIO View | ${s.periodLabel}**

**Total IT Investment YTD**: **${fmt(s.ytdActual)}**
**vs. Budget**: ${fmt(s.ytdBudget)} — **${pct(Math.abs(s.ytdVariancePct))} ${s.ytdVariance > 0 ? "unfavorable" : "favorable"}**

**Investment by Category**
| Category | YTD Spend | % of Total | vs. Budget |
|---|---|---|---|
| Cloud Infrastructure | ${fmt(s.cloudYTD)} | ${pct(cloudPct)} | ${pct(s.cloudVariancePct)} |
| FTE Labor | ~${fmt(s.ytdActual * laborPct)} | ${pct(laborPct)} | Favorable |
| External Labor | ${fmt(s.laborYTD)} | ${pct(contractorPct)} | ${pct(s.laborVariance / s.laborBudget)} |
| Software & SaaS | ~${fmt(s.ytdActual * 0.18)} | ~18% | ~+2% |
| Professional Services | ~${fmt(s.ytdActual * 0.09)} | ~9% | ~+5% |
| Hardware & Telecom | ~${fmt(s.ytdActual * 0.06)} | ~6% | Favorable |

**Strategic Investment Breakdown**
Of the total ${fmt(s.ytdActual)} in IT spend, approximately 68% is operational (keep-the-lights-on) and 32% is strategic investment tied to product roadmap or transformation programs:

- Nexora AI Platform infrastructure: ~${fmt(s.cloudYTD * 0.40)} (AWS EC2 + GCP Vertex AI)
- ERP Modernization (SAP + Deloitte): ~${fmt(350_000)}
- Data Platform buildout (Snowflake + BigQuery): ~${fmt(280_000)}
- Security capability uplift (Palo Alto + IAM): ~${fmt(170_000)}

**ROI Linkage**
The AI Platform investment is directly tied to ${fmt(2_100_000)} in incremental product revenue expected in H2 (from AI-powered recommendations feature). This gives the technology investment a 1.4x ROI at current spend levels.

**Year-Over-Year Context**
IT spend is growing at approximately 8% year-over-year, above the company's revenue growth rate of 6%. This premium investment reflects a strategic decision to build ahead of demand — consistent with the technology-forward posture the Board endorsed.`,
        keyPoints: [
          `Total IT investment: ${fmt(s.ytdActual)} — cloud at ${pct(cloudPct)} of total spend`,
          "68% operational / 32% strategic — Nexora AI platform is the largest strategic investment",
          "AI platform investment linked to $2.1M incremental H2 revenue (1.4x ROI)",
          `IT spend growing at ~8% YoY vs. 6% revenue growth — Board-endorsed strategic investment`,
          "External labor and professional services are the variance drivers vs. FTE labor (on budget)",
        ],
        riskFlags: [],
        actions: [
          { id: "CIO-IS1", priority: "Medium", title: "Build IT investment ROI framework", description: "Map all major IT investments to revenue or cost outcomes for Board visibility", owner: "CIO + IT Finance", dueDate: "2026-08-01" },
        ],
      };
    },
  },

  // ── 5. Default ────────────────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      return {
        answer: `**CIO Finance Partner — Ready to Help**

I create CIO-ready financial analysis and executive briefings grounded in IT spend data. Here's a quick snapshot:

**IT Financial Headline**
- Total YTD IT spend: **${fmt(s.ytdActual)}** — ${pct(Math.abs(s.ytdVariancePct))} ${s.ytdVariance > 0 ? "over" : "under"} budget
- Cloud spend: **${fmt(s.cloudYTD)}** (${pct(s.cloudYTD / s.ytdActual)} of IT) — ${pct(s.cloudVariancePct)} over budget
- Headcount: ${s.hcSummary.filled}/${s.hcSummary.total} filled (${(s.fillRate * 100).toFixed(0)}%)

**I can help with:**
- **Cloud spend analysis**: Provider-level breakdown, FinOps opportunities
- **CIO talking points**: Board and leadership presentation narratives
- **FinOps strategy**: Cloud optimization program, Reserved Instances, slot commitments
- **IT investment story**: Total spend portfolio, ROI linkage, strategic vs. operational breakdown

What would you like me to prepare?`,
        keyPoints: [
          `YTD IT spend: ${fmt(s.ytdActual)} | Cloud: ${fmt(s.cloudYTD)} | ${(s.fillRate * 100).toFixed(0)}% HC filled`,
          "Ask me for CIO talking points, cloud spend analysis, or a FinOps strategy",
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },
];
