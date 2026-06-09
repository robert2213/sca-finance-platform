/**
 * CFO Agent — Response Library
 *
 * Handles: Executive summaries, risk commentary, opportunity identification,
 * board narratives, monthly performance, forecast outlooks, spend stories,
 * and comparative benchmarks.
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

export const cfoResponses: Route[] = [

  // ── 1. Executive / overall performance summary ──────────────────────────────
  {
    key: "exec-summary",
    keywords: [
      "executive summary", "summary", "overview", "performance", "how are we doing",
      "financial performance", "overall", "status", "update", "report",
    ],
    weight: 5,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const may = s.currentMonth;
      const apr = s.priorMonth;
      const momVar = may.actual - apr.actual;

      if (ctx.outputMode !== 'question_answering') {
        return {
          answer: `**IT Financial Performance — Executive Summary | ${s.periodLabel}**

**Top-Line Results**
YTD IT spend totals **${fmt(s.ytdActual)}** against an approved budget of **${fmt(s.ytdBudget)}**, producing an unfavorable variance of **${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)})**. This places us ${pct(Math.abs(s.ytdVariancePct))} above plan through five months.

**May 2026 Close**
May closed at ${fmt(may.actual)} — a ${fmt(Math.abs(momVar))} ${momVar > 0 ? "increase" : "decrease"} from April's ${fmt(apr.actual)}. May was the highest-spend month YTD.

**Full-Year Outlook**
Full-year forecast: **${fmt(s.fullYearForecast)}** vs. budget **${fmt(s.fullYearBudget)}** — estimated overrun of **${fmt(s.fullYearForecast - s.fullYearBudget)}**.

**Top Three Issues**
1. Cloud spend is ${pct(s.cloudVariancePct)} over budget YTD — AWS EC2 and GCP Vertex AI are the primary drivers
2. ${s.overBudgetContractors.length} contractors over approved SOW budgets — ${fmt(s.totalExcessLabor)} total excess
3. AWS contract expires June 30 with no auto-renew — highest-urgency procurement event`,
          keyPoints: [
            `YTD: ${fmt(s.ytdActual)} vs ${fmt(s.ytdBudget)} — ${fmt(s.ytdVariance)} unfavorable (${pct(s.ytdVariancePct)})`,
            `May highest-spend month YTD at ${fmt(may.actual)} — MoM +${fmt(Math.abs(momVar))}`,
            `Cloud ${pct(s.cloudVariancePct)} over budget — AI/ML infrastructure acceleration`,
            `${s.overBudgetContractors.length} contractors over budget — ${fmt(s.totalExcessLabor)} excess`,
            `Full-year overrun: ~${fmt(s.fullYearForecast - s.fullYearBudget)}`,
          ],
          riskFlags: [],
          actions: [
            { id: "CFO-A1", priority: "High", title: "Present Q2 forecast revision to CXO team", description: `Revised full-year outlook of ${fmt(s.fullYearForecast)} needs executive visibility`, owner: "CFO + FP&A", dueDate: "2026-07-10" },
            { id: "CFO-A2", priority: "High", title: "Escalate AWS contract renewal", description: "June 30 deadline requires CEO/CFO sponsorship for multi-year EDP commitment", owner: "CFO + CIO", dueDate: "2026-06-10" },
          ],
        };
      }

      return {
        answer: `YTD IT spend is ${fmt(s.ytdActual)} — ${fmt(s.ytdVariance)} over budget (${pct(s.ytdVariancePct)}) through ${s.periodLabel}. Cloud is ${pct(s.cloudVariancePct)} over budget, ${s.overBudgetContractors.length} contractors have exceeded their SOW budgets (${fmt(s.totalExcessLabor)} excess), and AWS contract expires in ${s.daysUntil("2026-06-30")} days. Full-year forecast is ${fmt(s.fullYearForecast)} vs. ${fmt(s.fullYearBudget)} budget. What would you like to dig into?`,
        keyPoints: [
          `YTD: ${fmt(s.ytdActual)} vs ${fmt(s.ytdBudget)} — ${fmt(s.ytdVariance)} unfavorable`,
          `Cloud ${pct(s.cloudVariancePct)} over budget | ${s.overBudgetContractors.length} contractors over SOW | AWS expires in ${s.daysUntil("2026-06-30")}d`,
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 2. Risk identification ──────────────────────────────────────────────────
  {
    key: "risks",
    keywords: [
      "risk", "concern", "flag", "issue", "problem", "worry", "alert",
      "threat", "exposure", "vulnerability", "watch out", "danger",
    ],
    weight: 7,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const critRisks = s.risks.filter(r => r.severity === "critical");
      const warnRisks = s.risks.filter(r => r.severity === "warning");

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `${s.risks.length} risk flags across the IT portfolio — ${critRisks.length} critical, ${warnRisks.length} warnings. Top: AWS contract expires in ${s.daysUntil("2026-06-30")} days (no auto-renew, ${fmt(s.topVendors.find(v => v.name.includes("Amazon"))?.annualValue ?? 4_560_000)}/yr at risk), cloud is running ${pct(s.cloudVariancePct)} over budget, and ${s.overBudgetContractors.length} contractors exceed their SOW budgets. Want the full risk rundown with mitigation paths?`,
          keyPoints: [
            `${critRisks.length} critical risks — AWS expiry and cloud trajectory`,
            `${s.overBudgetContractors.length} contractors over budget — ${fmt(s.totalExcessLabor)} excess`,
          ],
          riskFlags: critRisks,
          actions: [],
        };
      }

      return {
        answer: `**Financial Risk Assessment — ${s.periodLabel}**

I've identified **${s.risks.length} risk flags** across the IT portfolio: ${critRisks.length} critical and ${warnRisks.length} warnings.

**🔴 Critical Risks**

**1. AWS Contract Expiry — June 30, 2026**
Our largest vendor relationship (${fmt(s.topVendors.find(v => v.name.includes("Amazon"))?.annualValue ?? 4_560_000)} annually) expires in ${s.daysUntil("2026-06-30")} days with no auto-renew clause. We are currently in the highest-leverage window for negotiation. Failure to act could result in month-to-month rates 15–25% above contract pricing and service disruption risk.

**2. Cloud Spend Trajectory**
Cloud is running ${pct(s.cloudVariancePct)} over budget YTD. At the current MoM growth rate of ${pct(s.cloudMoMGrowth)}, the full-year cloud overrun is projected at ${fmt((s.cloudVariance / 5) * 7)}. Without FinOps intervention by July, this becomes a Board-level disclosure item.

**🟡 Warning-Level Risks**

**3. External Labor Budget Overruns**
${s.overBudgetContractors.length} contractors (${s.overBudgetContractors.map(c => c.name.split(" ")[0]).join(", ")}) are tracking ${fmt(s.totalExcessLabor)} over their combined approved budgets. Each represents an unapproved commitment that requires PO amendment before Q2 close.

**4. Vendor Concentration**
Top 3 vendors represent 68% of total IT vendor spend. ${s.highRiskVendors.length} vendors are rated High-Risk. Combined annual value of high-risk contracts: ${fmt(s.highRiskVendors.reduce((s, v) => s + v.annualValue, 0))}.

**5. Open Headcount in Critical Functions**
${s.openReqs.filter(h => h.businessUnit === "Security" || h.businessUnit === "Cloud Engineering").length} open requisitions in Security and Cloud Engineering are being covered by contractors at a 35–40% cost premium vs. FTE equivalent.`,
        keyPoints: [
          `${critRisks.length} critical risks — AWS expiry (${s.daysUntil("2026-06-30")}d) and cloud overspend are highest priority`,
          `Cloud overrun trajectory: ${fmt((s.cloudVariance / 5) * 7)} projected full-year — intervention needed in Q3`,
          `${fmt(s.totalExcessLabor)} in unapproved contractor overruns — audit trail and PO amendments required`,
          `${s.highRiskVendors.length} high-risk vendors with ${fmt(s.highRiskVendors.reduce((s, v) => s + v.annualValue, 0))} in annual commitments`,
          "Critical function vacancies create contractor dependency and cost premium",
        ],
        riskFlags: critRisks,
        actions: [
          { id: "CFO-R1", priority: "High", title: "AWS emergency renewal — CFO sponsorship", description: "Engage AWS Enterprise team this week; target 3-year EDP with 15% discount", owner: "CFO + CIO + Procurement", dueDate: "2026-06-10" },
          { id: "CFO-R2", priority: "High", title: "Cloud spend freeze on non-strategic workloads", description: "Implement FinOps gate: all new cloud spend >$10K requires VP approval through July", owner: "CIO + FinOps", dueDate: "2026-06-15" },
          { id: "CFO-R3", priority: "Medium", title: "PO amendments for all over-budget contractors", description: `Formally amend ${s.overBudgetContractors.length} SOWs — required for Q2 financial close`, owner: "IT Finance + Procurement", dueDate: "2026-06-30" },
        ],
      };
    },
  },

  // ── 3. Cost optimization / savings opportunities ────────────────────────────
  {
    key: "opportunities",
    keywords: [
      "opportunit", "sav", "reduc", "optim", "efficien", "cut", "lower",
      "cheaper", "right-siz", "rationali", "where can we", "how do we save",
    ],
    weight: 7,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt } = s;
      const cloudOpportunity = s.cloudYTD * 0.15;
      const laborConvert     = s.laborYTD * 0.25;
      const saasRational     = 285_000;
      const total = cloudOpportunity + laborConvert + saasRational;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `Three savings opportunities totaling ${fmt(total)}: cloud right-sizing (~${fmt(cloudOpportunity)}/yr via Reserved Instances + AWS EDP), contractor-to-FTE conversion for 3 long-tenure roles (~${fmt(laborConvert)}/yr), and SaaS license rationalization (~${fmt(saasRational)}/yr at ServiceNow/Okta renewals). Quick win: BigQuery committed slots saves ~${fmt(18_000)}/month immediately. Want details on any of these?`,
          keyPoints: [
            `Total opportunity: ${fmt(total)}/year across three workstreams`,
            `Cloud right-sizing = largest lever at ${fmt(cloudOpportunity)}/year`,
          ],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Cost Optimization Opportunities — CFO Analysis**

Based on YTD spend patterns and market benchmarks, I've identified **${fmt(total)} in annualized savings opportunities** across three workstreams:

**1. Cloud Infrastructure Right-Sizing — ${fmt(cloudOpportunity)}/year**
Our EC2 fleet is running at an estimated 61% average utilization. By converting steady-state workloads to Reserved Instances (1-year term) and implementing auto-scaling policies for variable compute, we can reduce AWS spend by 18–22%. Additionally, the AWS EDP renewal is an opportunity to lock in 12–15% below current on-demand pricing.

*Action: FinOps team to deliver right-sizing report by June 30. Target: ${fmt(cloudOpportunity)} annually.*

**2. Contractor-to-FTE Conversion — ${fmt(laborConvert)}/year**
Three contractors have been engaged for 10+ months: Priya Nair (Data Engineering), Anita Patel (ML Platform), and Tasha Williams (IAM). Converting these roles to FTE at comparable total compensation would reduce blended cost by 28–32% once benefits amortization is factored in.

*Action: HR + IT Finance to model FTE conversion economics by July 15.*

**3. SaaS License Rationalization — ${fmt(saasRational)}/year**
A license utilization audit across M365, Salesforce, and ServiceNow is projected to reveal 15–20% unused seats. True-down provisions at renewal would yield immediate savings. This opportunity is time-sensitive — ServiceNow and Okta both renew by August.

*Action: IT Operations to complete license audit before August renewal dates.*

**Quick Wins (<30 Days)**
- Suspend idle GCP development environments (est. ${fmt(12_000)}/month)
- Apply BigQuery slot commitment pricing (est. ${fmt(18_000)}/month)
- Cancel 3 unused Salesforce Platform licenses (est. ${fmt(9_000)}/year)`,
        keyPoints: [
          `Total identified savings opportunity: ${fmt(total)} annually`,
          `Cloud right-sizing = largest lever at ${fmt(cloudOpportunity)}/year — FinOps program is the vehicle`,
          `Contractor-to-FTE conversion for 3 long-tenure roles saves ${fmt(laborConvert)}/year`,
          `SaaS rationalization at ServiceNow and Okta renewals = ${fmt(saasRational)}/year`,
          "Quick wins available in <30 days via BigQuery slots and idle GCP environments",
        ],
        riskFlags: [],
        actions: [
          { id: "CFO-S1", priority: "High", title: "Launch formal FinOps program", description: `Assign FinOps lead, set Q3 savings target of ${fmt(cloudOpportunity)}`, owner: "CIO + Cloud Engineering", dueDate: "2026-06-30" },
          { id: "CFO-S2", priority: "Medium", title: "Model FTE conversion economics", description: "HR + IT Finance to build total cost comparison for 3 contractor candidates", owner: "HR + IT Finance", dueDate: "2026-07-15" },
          { id: "CFO-S3", priority: "Medium", title: "SaaS license audit", description: "Complete M365 + Salesforce + ServiceNow utilization review before renewal windows", owner: "IT Operations + Finance", dueDate: "2026-07-15" },
        ],
      };
    },
  },

  // ── 4. Board / executive presentation narrative ─────────────────────────────
  {
    key: "board-narrative",
    keywords: [
      "board", "presentation", "narrative", "story", "talking point",
      "how do i explain", "how do we explain", "executive", "leadership",
      "slides", "deck", "message", "communicate",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;

      if (ctx.outputMode === 'question_answering') {
        const overrun = s.fullYearForecast - s.fullYearBudget;
        return {
          answer: `Board message in four points: (1) variance is strategic — cloud overage funds the Board-approved AI/ML roadmap; (2) mitigation path is clear — AWS EDP + FinOps saves ~${fmt(s.cloudYTD * 0.15 + 350_000)}; (3) vendor pipeline is managed, no disruption risk; (4) HC fill rate at ${(s.fillRate * 100).toFixed(0)}% improves cost mix in Q3. Full-year overrun of ~${fmt(overrun)} compresses to ~${fmt(overrun * 0.6)} post-mitigation. Want the full narrative draft?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Board-Ready Financial Narrative — IT Organization**

**Recommended Opening Statement**
*"Our IT investment for the first five months of 2026 totals ${fmt(s.ytdActual)}, tracking ${pct(Math.abs(s.ytdVariancePct))} above our approved plan. This variance is intentional in part — reflecting accelerated investment in AI/ML infrastructure directly tied to the Board-approved technology platform roadmap. We are actively managing cost discipline through a structured FinOps program and vendor renegotiation."*

**Four-Point Board Message**

**Point 1 — Strategic Investment, Not Overspend**
The majority of our variance (${pct(s.cloudVariancePct)} in cloud) is attributable to pull-forward of AI/ML compute spend. This supports our revenue-generating platform. We should position this as accelerated ROI, not budget failure.

**Point 2 — We Have Line-of-Sight on Mitigation**
AWS EDP renewal (in progress) is expected to reduce cloud costs by 12–15%. A FinOps right-sizing program targeting ${fmt(s.cloudYTD * 0.15)} in savings launches in Q3. These actions bring the full-year overrun from ~${fmt(s.fullYearForecast - s.fullYearBudget)} down to approximately ${fmt((s.fullYearForecast - s.fullYearBudget) * 0.6)}.

**Point 3 — Vendor Portfolio is Under Control**
We have ${s.expiringVendors180.length} contracts in the renewal pipeline. All are being managed proactively. No service disruption risk. The AWS renewal is our highest-leverage event and will set our cloud cost structure for 3 years.

**Point 4 — Workforce Investments are Tracking to Plan**
IT headcount is ${(s.fillRate * 100).toFixed(0)}% filled. Open positions are being actively recruited. We expect to close ${Math.ceil(s.hcSummary.open * 0.6)} of ${s.hcSummary.open} open reqs by Q3, which will shift the labor mix from contractors to FTEs and improve cost structure.`,
        keyPoints: [
          "Lead with strategic intent — AI/ML investment is Board-approved and revenue-linked",
          "Show mitigation credibility — FinOps program + AWS EDP = path to $350K+ in savings",
          "Vendor pipeline is managed — no service disruption risk",
          `HC fill rate at ${(s.fillRate * 100).toFixed(0)}% — on track to improve labor cost mix in Q3`,
          "Full-year overrun estimated at ~$1.8M before mitigations; ~$1.1M after",
        ],
        riskFlags: [],
        actions: [
          { id: "CFO-B1", priority: "High", title: "Prepare CXO deck with 4-point narrative", description: "Target: Board agenda item at July Board meeting", owner: "CFO + CIO + IT Finance", dueDate: "2026-07-01" },
        ],
      };
    },
  },

  // ── 5. Month close / monthly performance ───────────────────────────────────
  {
    key: "monthly-close",
    keywords: [
      "may", "april", "march", "monthly", "this month", "last month",
      "month close", "month-end", "close", "mtd", "monthly variance",
    ],
    weight: 7,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const may = s.currentMonth;
      const apr = s.priorMonth;
      const mayVar = may.actual - may.budget;
      const aprVar = apr.actual - apr.budget;

      if (ctx.outputMode === 'question_answering') {
        const dir = mayVar > 0 ? 'over' : 'under';
        return {
          answer: `May closed at ${fmt(may.actual)} — ${fmt(Math.abs(mayVar))} ${dir} the ${fmt(may.budget)} budget (${pct(mayVar / may.budget)}). That's ${pct(Math.abs(s.momGrowthPct))} ${s.momGrowthPct > 0 ? 'higher than' : 'lower than'} April. Main drivers: AWS EC2 (+${fmt(26_000)}) and Deloitte scope creep (+${fmt(12_000)}), partially offset by deferred hardware refresh (-${fmt(18_000)}). Want the full month-end breakdown?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**May 2026 Month Close — Performance Summary**

**May Headline Numbers**
- Actual Spend: **${fmt(may.actual)}**
- Budget: **${fmt(may.budget)}**
- Variance: **${fmt(mayVar)} (${pct(mayVar / may.budget)})**
- vs. April: **${fmt(may.actual - apr.actual)} ${may.actual > apr.actual ? "higher" : "lower"}** (${pct(Math.abs(s.momGrowthPct))} MoM ${s.momGrowthPct > 0 ? "growth" : "decline"})

**May vs. Prior Month Comparison**
| | April | May | Δ |
|---|---|---|---|
| Actual | ${fmt(apr.actual)} | ${fmt(may.actual)} | ${fmt(may.actual - apr.actual)} |
| Budget | ${fmt(apr.budget)} | ${fmt(may.budget)} | — |
| Variance | ${fmt(aprVar)} | ${fmt(mayVar)} | ${fmt(mayVar - aprVar)} |

**May Variance Drivers**
1. **AWS EC2 (+${fmt(26_000)})**: Production cluster scaling for AI inference layer — approved by VP Engineering
2. **GCP Vertex AI (+${fmt(8_000)})**: ML training run for recommendation engine — Q2 roadmap item
3. **SAP Consulting (+${fmt(12_000)})**: Deloitte ERP scope expansion — change order in process
4. **GCP BigQuery (+${fmt(6_000)})**: Self-serve analytics growth — usage-based pricing model

**Favorable Offsets**
- Infrastructure under-spend: ${fmt(-18_000)} (deferred hardware refresh)
- Help Desk savings: ${fmt(-5_000)} (lower ticket volume in May)

**May Close Status**: All accruals posted. Final actuals locked. Forecast updated for June.`,
        keyPoints: [
          `May closed at ${fmt(may.actual)} — ${fmt(Math.abs(mayVar))} ${mayVar > 0 ? "unfavorable" : "favorable"} vs. budget`,
          `MoM growth of ${pct(s.momGrowthPct)} — May was highest-spend month YTD`,
          "Cloud variance driven by planned AI/ML workload scaling — partially approved",
          "Deloitte scope expansion = largest unplanned accrual requiring PO amendment",
          "Infrastructure favorability partially offsets cloud overages",
        ],
        riskFlags: [],
        actions: [
          { id: "CFO-M1", priority: "High", title: "Issue Deloitte PO amendment", description: "Formalize May scope expansion before June accruals run", owner: "Procurement + Applications", dueDate: "2026-06-10" },
          { id: "CFO-M2", priority: "Medium", title: "Update June forecast for cloud trajectory", description: "Incorporate May AWS/GCP actuals into rolling 3-month forecast", owner: "FP&A", dueDate: "2026-06-07" },
        ],
      };
    },
  },

  // ── 6. Full-year forecast ──────────────────────────────────────────────────
  {
    key: "full-year-forecast",
    keywords: [
      "full year", "annual", "year end", "full-year", "forecast", "projection",
      "outlook", "year forecast", "fy2026", "fy 2026", "full year view",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const overrun    = s.fullYearForecast - s.fullYearBudget;
      const mitigated  = overrun * 0.60;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `Full-year IT forecast is ${fmt(s.fullYearForecast)} vs. the ${fmt(s.fullYearBudget)} budget — ${fmt(overrun)} unfavorable (${pct(overrun / s.fullYearBudget)}). If AWS EDP + FinOps right-sizing execute on schedule, that compresses to ~${fmt(mitigated)}. H2 risk: ML infrastructure expansion (~${fmt(400_000)}) not yet in plan. Want the detailed forecast build or scenario analysis?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Full-Year 2026 IT Forecast — CFO View**

**Current Trajectory (Pre-Mitigation)**
Based on YTD actuals pace through May, the full-year IT forecast is **${fmt(s.fullYearForecast)}** against an approved budget of **${fmt(s.fullYearBudget)}** — an unfavorable variance of **${fmt(overrun)} (${pct(overrun / s.fullYearBudget)})**.

**Forecast Build**
| Category | Budget | Forecast | Variance |
|---|---|---|---|
| Cloud Infrastructure | ${fmt(s.cloudBudget / 5 * 12)} | ${fmt(s.cloudYTD / 5 * 12 * 0.95)} | ${fmt((s.cloudYTD / 5 * 12 * 0.95) - (s.cloudBudget / 5 * 12))} |
| External Labor | ${fmt(s.laborBudget / 5 * 12)} | ${fmt(s.laborYTD / 5 * 12 * 0.98)} | ${fmt((s.laborYTD / 5 * 12 * 0.98) - (s.laborBudget / 5 * 12))} |
| Software & SaaS | ${fmt(1_950_000)} | ${fmt(2_010_000)} | ${fmt(60_000)} |
| Labor (FTE) | ${fmt(s.salaryBudget * 0.92)} | ${fmt(s.salaryBudget * 0.88)} | ${fmt(s.salaryBudget * 0.88 - s.salaryBudget * 0.92)} |
| Other | ${fmt(s.fullYearBudget * 0.10)} | ${fmt(s.fullYearBudget * 0.10)} | — |

**Post-Mitigation Scenario**
If the following actions execute on schedule, the full-year overrun compresses to approximately **${fmt(mitigated)}**:
- AWS EDP multi-year deal: ${fmt(-350_000)} savings
- FinOps right-sizing (Q3): ${fmt(-200_000)} savings
- Contractor SOW rebaseline: ${fmt(-118_000)} in budget normalization
- FTE fills reducing contractor reliance: ${fmt(-80_000)} savings

**Downside Risk**
H2 roadmap includes an expanded ML inference layer not yet in plan — estimated at ${fmt(400_000)} if approved. If realized, the full-year overrun would increase to approximately ${fmt(overrun + 400_000 - (overrun * 0.40))}.`,
        keyPoints: [
          `Pre-mitigation full-year forecast: ${fmt(s.fullYearForecast)} vs. budget ${fmt(s.fullYearBudget)} — ${fmt(overrun)} unfavorable`,
          `Post-mitigation target: ${fmt(mitigated)} overrun — AWS EDP + FinOps are key levers`,
          "FTE labor line is favorable — open reqs generating savings through H1",
          "Cloud is the dominant upside risk — MoM growth rate must decelerate in Q3",
          `H2 ML infrastructure expansion = ${fmt(400_000)} downside risk not yet in plan`,
        ],
        riskFlags: [],
        actions: [
          { id: "CFO-F1", priority: "High", title: "Lock Q2 forecast rebaseline", description: "Submit revised full-year forecast to CFO by July 10", owner: "FP&A + IT Finance", dueDate: "2026-07-10" },
          { id: "CFO-F2", priority: "Medium", title: "H2 ML infrastructure decision", description: "Obtain CTO sign-off on scope and budget before July budget cycle", owner: "CTO + CFO", dueDate: "2026-07-01" },
        ],
      };
    },
  },

  // ── 7. Benchmark / comparison ──────────────────────────────────────────────
  {
    key: "benchmark",
    keywords: [
      "benchmark", "compare", "industry", "peer", "how do we compare",
      "best practice", "standard", "market", "competitive",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const itSpendPct = 0.042;
      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `IT spend is ~${pct(itSpendPct)} of revenue — upper quartile for our sector (industry median 3.2–4.8%). Cloud is ${pct(s.cloudYTD / s.ytdActual)} of IT, above the 35–45% average for cloud-forward firms. External labor at ~${pct(s.laborYTD / s.ytdActual)} is above the <10% best-practice target. Cost per supported user is within the $8K–$15K industry range. Want a full benchmark breakdown?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**IT Spend Benchmarking — Industry Comparison**

**IT Spend as % of Revenue**
Our current IT run rate implies an IT spend of approximately ${pct(itSpendPct)} of total company revenue — aligned with the upper quartile for technology-enabled enterprises of our size. Industry median for companies in our sector is 3.2–4.8%.

**Cloud Spend as % of Total IT**
Our cloud spend represents ${pct(s.cloudYTD / s.ytdActual)} of total IT spend. Industry average for cloud-forward enterprises is 35–45%. We are above average, which reflects our cloud-first architecture posture but also signals an opportunity for cost discipline via FinOps.

**Labor Mix (FTE vs. Contractor)**
Our blended labor mix of ~${pct(s.laborYTD / s.ytdActual)} external labor is slightly above the 12–15% industry norm, primarily due to open headcount being backfilled with contractors. Best-in-class organizations target <10%.

**Vendor Concentration**
Top-5 vendor concentration of 68% of total spend is within normal range (industry: 60–75%), but the lack of auto-renew on AWS — our largest vendor — is a governance gap relative to peers.

**Cost per Endpoint / Per Headcount**
With ${s.hcSummary.filled + 12} active contractors and FTEs supporting an estimated 2,400 end users, our IT cost per supported user is approximately **${fmt(s.ytdActual / 2400 * (12 / 5))}** — within industry range of $8K–$15K annually.`,
        keyPoints: [
          `IT spend at ~${pct(itSpendPct)} of revenue — upper quartile for our sector (industry median: 3.2–4.8%)`,
          `Cloud at ${pct(s.cloudYTD / s.ytdActual)} of IT spend — above average; signals FinOps opportunity`,
          "External labor at ~15% of IT spend — above best-practice target of <10%",
          "Vendor concentration is normal; AWS auto-renew gap is a governance differentiator",
          "Cost per supported user within industry range of $8K–$15K annually",
        ],
        riskFlags: [],
        actions: [
          { id: "CFO-BM1", priority: "Medium", title: "Set FinOps target to bring cloud mix to 38%", description: "Currently at 43% — right-sizing and committed use discounts are the levers", owner: "CIO + FinOps", dueDate: "2026-12-31" },
          { id: "CFO-BM2", priority: "Low", title: "External labor reduction target for FY2027 plan", description: "Model a contractor mix of <12% in FY2027 plan cycle", owner: "IT Finance + HR", dueDate: "2026-10-01" },
        ],
      };
    },
  },

  // ── 8. Default / fallback ──────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `YTD IT spend is ${fmt(s.ytdActual)} — tracking ${pct(Math.abs(s.ytdVariancePct))} unfavorable vs. budget. Cloud and external labor are the primary drivers. AWS contract expires in ${s.daysUntil("2026-06-30")} days. What do you want to look at?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**CFO Agent — Ready to Help**

I can assist with any of the following areas:

- **Executive Summary**: Full YTD financial performance narrative
- **Risk Assessment**: Prioritized risk flags with dollar impact
- **Cost Opportunities**: Savings identification across cloud, labor, and SaaS
- **Board Narratives**: Presentation-ready talking points and framing
- **Month Close**: May 2026 detailed performance review
- **Full-Year Forecast**: Revised outlook with scenario analysis
- **Benchmarking**: Industry comparisons and cost efficiency metrics

**Current Headlines**
YTD IT spend of ${fmt(s.ytdActual)} is tracking ${pct(Math.abs(s.ytdVariancePct))} unfavorable vs. budget. Cloud and external labor are the primary drivers. AWS contract expires in ${s.daysUntil("2026-06-30")} days.

What would you like me to analyze?`,
        keyPoints: [
          `YTD spend: ${fmt(s.ytdActual)} | Variance: ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)})`,
          "Ask me about risks, opportunities, board narrative, or the full-year forecast",
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },
];
