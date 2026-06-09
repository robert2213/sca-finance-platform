/**
 * External Labor Agent — Response Library
 *
 * Handles: Contractor burn rates, over-budget analysis, SOW compliance,
 * extension decisions, contractor-to-FTE conversion, and staffing risk.
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

export const externalLaborResponses: Route[] = [

  // ── 1. Over-budget contractors ─────────────────────────────────────────────
  {
    key: "over-budget",
    keywords: [
      "over budget", "over their budget", "overage", "excess", "exceeded",
      "over approved", "gone over", "over-budget", "above budget",
    ],
    weight: 9,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct, dt } = s;
      const ob = s.overBudgetContractors;

      if (ctx.outputMode === 'question_answering') {
        const largest = ob.reduce((max, c) => (c.ytdSpend - c.budget) > (max.ytdSpend - max.budget) ? c : max, ob[0]);
        return {
          answer: `${ob.length} contractor${ob.length === 1 ? '' : 's'} over their approved SOW budgets — ${fmt(s.totalExcessLabor)} total excess. ${largest?.name ?? 'Top contractor'} has the largest overage (${fmt(largest ? largest.ytdSpend - largest.budget : 0)}). Root cause: informal scope expansion without PO amendments — an internal controls gap. All ${ob.length} need formal PO amendments before the June 30 close. Want the full breakdown?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Over-Budget Contractor Analysis — ${s.periodLabel}**

**${ob.length} contractors are tracking above their approved SOW budgets:**

${ob.map(c => {
  const excess    = c.ytdSpend - c.budget;
  const excessPct = c.budget > 0 ? excess / c.budget : 0;
  return `**${c.name}** (${c.role})
   Vendor: ${c.vendor} | Cost Center: ${c.costCenterName}
   YTD Spend: ${fmt(c.ytdSpend)} vs. Budget: ${fmt(c.budget)}
   **Excess: ${fmt(excess)} (${pct(excessPct)} over)**
   Monthly rate: ${fmt(c.monthlyRate)} | Contract ends: ${dt(c.endDate)}
   Root cause: Scope expansion beyond original SOW deliverables`;
}).join("\n\n")}

**Total Excess Spend: ${fmt(s.totalExcessLabor)}**

**Root Cause Analysis**
All four overruns share a common pattern: scope was expanded informally (via email or verbal agreement) without a formal PO amendment or SOW change order. This is an internal controls gap that exposes the company to audit findings.

**Control Failure Points**
1. No automated budget alert triggered at 80% utilization
2. Cost center owners approved additional work without finance visibility
3. Vendor invoices were processed without PO matching validation
4. Monthly burn rate reviews were not conducted for these engagements

**Immediate Required Actions**
Before June 30 close, all four engagements need either:
(a) Formal PO amendment authorizing the additional spend, or
(b) Recovery plan — reducing remaining deliverables to stay within original SOW

Without formal amendments, these charges cannot be recognized in the period and create an audit exposure.`,
        keyPoints: [
          `${ob.length} contractors over budget — total excess: ${fmt(s.totalExcessLabor)}`,
          `${ob[0]?.name} = largest overage (${fmt(Math.max(...ob.map(c => c.ytdSpend - c.budget)))}) — Enterprise Architecture scope creep`,
          "Root cause: informal scope expansion without PO amendment — internal controls gap",
          "All 4 need formal PO amendments or reduced deliverables before June 30 close",
          "No automated budget alerts were triggered — monitoring gap identified",
        ],
        riskFlags: [],
        actions: [
          { id: "EL-OB1", priority: "High", title: "Issue PO amendments for all 4 contractors", description: "Legal + Procurement must draft and execute amendments before June 30", owner: "Procurement + Legal", dueDate: "2026-06-25" },
          { id: "EL-OB2", priority: "High", title: "Implement 80% budget utilization alerts", description: "Configure automated alerts in AP system for all SOW commitments", owner: "IT Finance + AP Team", dueDate: "2026-07-01" },
          { id: "EL-OB3", priority: "Medium", title: "Monthly contractor burn rate review", description: "Schedule recurring review: 1st week of each month — all active contractors", owner: "IT Finance", dueDate: "2026-07-07" },
        ],
      };
    },
  },

  // ── 2. Contractor-to-FTE conversion ───────────────────────────────────────
  {
    key: "conversion",
    keywords: [
      "conver", "fte", "full time", "employee", "hire", "permanent",
      "instead of contractor", "bring in house", "insource", "convert to",
    ],
    weight: 9,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt } = s;
      const activeLong = s.contractors.filter(c => c.status === "Active").slice(0, 3);
      const totalSavings = activeLong.reduce((total, c) => {
        const annualContractorCost = c.monthlyRate * 12;
        const estimatedFTECost     = annualContractorCost * 0.72 * 1.25;
        return total + (annualContractorCost - estimatedFTECost);
      }, 0);

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `3 long-tenure contractors are good FTE conversion candidates — ~${fmt(totalSavings)}/year in savings (28–32% lower total comp). Priya Nair, Anita Patel, and Tasha Williams all at 10+ months. Non-compete review needed for the Apex Consulting placements. 8–10 week conversion timeline. Want the economics on any specific candidate?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Contractor-to-FTE Conversion Analysis**

Three contractors are strong candidates for FTE conversion based on engagement duration (>10 months), role criticality, and cost differential:

${activeLong.map((c, i) => {
  const annualContractorCost = c.monthlyRate * 12;
  const estimatedFTESalary   = c.monthlyRate * 12 * 0.72;
  const benefitsCost         = estimatedFTESalary * 0.25;
  const totalFTECost         = estimatedFTESalary + benefitsCost;
  const savings              = annualContractorCost - totalFTECost;
  return `**${i + 1}. ${c.name} — ${c.role}**
   Current contractor cost: ${fmt(annualContractorCost)}/year (${fmt(c.monthlyRate)}/month)
   Estimated FTE total cost: ${fmt(totalFTECost)}/year (salary ${fmt(estimatedFTESalary)} + benefits ${fmt(benefitsCost)})
   **Annual savings on conversion: ${fmt(savings)}**
   Risk: Knowledge loss during transition if hire takes >60 days`;
}).join("\n\n")}

**Total Conversion Savings: ${fmt(totalSavings)}/year**

**Conversion Process Timeline**
- Week 1–2: Compensation benchmarking (Radford/Mercer)
- Week 3–4: Offer letter + HR approval
- Week 5–8: Background check + onboarding
- Week 9+: Knowledge transfer from contractor to FTE

**Caveats**
- H-1B or visa status must be verified for international contractors before offer
- Non-compete review required for Apex Consulting engagements (Priya, Anita)
- Budget amendment needed to shift spend from OpEx (contractor) to partially CapEx (FTE salary can be partially capitalized if software development)`,
        keyPoints: [
          `3 contractors identified for FTE conversion — ~${fmt(totalSavings)}/year in savings`,
          "Blended contractor-to-FTE cost reduction: ~28% on total compensation",
          "Non-compete review required for Apex Consulting placements",
          "FTE conversion timeline: 8–10 weeks — plan for parallel contractor overlap period",
          "Budget reclassification: OpEx to salary + benefits — department head approval required",
        ],
        riskFlags: [],
        actions: [
          { id: "EL-C1", priority: "Medium", title: "Initiate FTE conversion assessments for 3 candidates", description: "HR + hiring managers to complete compensation benchmarking by July 15", owner: "HR + IT Finance", dueDate: "2026-07-15" },
          { id: "EL-C2", priority: "Medium", title: "Non-compete review with Legal", description: "Review Apex Consulting MSA for FTE conversion restrictions", owner: "Legal + HR", dueDate: "2026-07-01" },
        ],
      };
    },
  },

  // ── 3. Burn rate analysis ─────────────────────────────────────────────────
  {
    key: "burn-rate",
    keywords: [
      "burn rate", "burning", "pace", "run rate", "how fast", "spending rate",
      "at this rate", "rate of spend", "monthly spend",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const avgMonthlyBurn = s.laborYTD / 5;
      const remainingBudget = s.laborBudget - s.laborYTD;
      const remainingMonths = 7;
      const budgetMonthlyAllowance = remainingBudget / remainingMonths;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `Monthly contractor burn is ${fmt(avgMonthlyBurn)} — ${fmt(avgMonthlyBurn - budgetMonthlyAllowance)} above the sustainable rate needed to land in budget. At this pace, full-year contractor spend is ${fmt(avgMonthlyBurn * 12)} vs. ${fmt(s.laborBudget)} budget. Need to reduce by ~${Math.ceil((avgMonthlyBurn - budgetMonthlyAllowance) / 15_000)} engagements or get a formal budget amendment. Want the individual burn rates?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Contractor Burn Rate Analysis — ${s.periodLabel}**

**Portfolio-Level Burn Rate**
- Average monthly contractor spend: **${fmt(avgMonthlyBurn)}**
- YTD total spend: **${fmt(s.laborYTD)}** of ${fmt(s.laborBudget)} annual budget
- Remaining annual budget: **${fmt(remainingBudget)}** for ${remainingMonths} months
- Allowable monthly rate (to stay in budget): **${fmt(budgetMonthlyAllowance)}**
- Current rate vs. allowable: **${fmt(avgMonthlyBurn - budgetMonthlyAllowance)} over** per month

**At Current Burn Rate, Full-Year Contractor Spend**: ${fmt(avgMonthlyBurn * 12)}
**Budget**: ${fmt(s.laborBudget)}
**Projected Overrun**: ${fmt(avgMonthlyBurn * 12 - s.laborBudget)} (${pct((avgMonthlyBurn * 12 - s.laborBudget) / s.laborBudget)})

**Individual Burn Rates — Top 5**
${s.contractors.slice(0, 5).map(c => {
  const monthlyBurn = c.ytdSpend / 5;
  const remainBudget = c.budget - c.ytdSpend;
  const monthsLeft = remainBudget > 0 ? remainBudget / monthlyBurn : 0;
  return `- **${c.name}**: ${fmt(monthlyBurn)}/mo | Budget runway: ${monthsLeft > 0 ? `${monthsLeft.toFixed(1)} months` : "**EXHAUSTED**"}`;
}).join("\n")}

**Burn Rate Risk Flags**
${s.overBudgetContractors.map(c => `⚠️ ${c.name}: Budget exhausted — running ${fmt(c.monthlyRate)}/month without authorization`).join("\n")}

**To Land Within Annual Budget**
The remaining ${remainingMonths} months must average ${fmt(budgetMonthlyAllowance)}/month. This requires either:
1. Reducing the contractor roster by ${Math.ceil((avgMonthlyBurn - budgetMonthlyAllowance) / 15000)} engagements, or
2. Securing formal budget amendments for the ${fmt(avgMonthlyBurn * 12 - s.laborBudget)} projected overrun`,
        keyPoints: [
          `Average monthly burn: ${fmt(avgMonthlyBurn)} — ${fmt(avgMonthlyBurn - budgetMonthlyAllowance)} above sustainable rate`,
          `Full-year projected contractor spend: ${fmt(avgMonthlyBurn * 12)} — ${fmt(avgMonthlyBurn * 12 - s.laborBudget)} over budget`,
          `Remaining budget for ${remainingMonths} months: ${fmt(remainingBudget)} (${fmt(budgetMonthlyAllowance)}/month allowance)`,
          `${s.overBudgetContractors.length} contractors have exhausted their budgets — running unauthorized`,
          "Budget amendment or roster reduction required to close the gap",
        ],
        riskFlags: [],
        actions: [
          { id: "EL-BR1", priority: "High", title: "Rebaseline contractor budget in Q2 forecast", description: `Include ${fmt(s.laborYTD / 5 * 12 - s.laborBudget)} overrun in revised full-year forecast`, owner: "IT Finance + FP&A", dueDate: "2026-07-01" },
          { id: "EL-BR2", priority: "High", title: "Evaluate 2 contractor non-renewals", description: "Identify which ending-soon contractors should not be extended to reduce burn rate", owner: "IT Managers + Finance", dueDate: "2026-06-15" },
        ],
      };
    },
  },

  // ── 4. Ending engagements / extensions ────────────────────────────────────
  {
    key: "endings",
    keywords: [
      "ending", "expiring", "ends soon", "extension", "extend", "renew contract",
      "contractor ending", "when does", "how long",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, dt } = s;
      const ending = s.endingSoonContractors;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `${ending.length} contractor${ending.length === 1 ? '' : 's'} ending within 90 days — extension decisions needed by mid-June (2-week vendor lead time). Marcus Webb (Cybersecurity): recommend extension, IAM Architect still open and creating a security coverage gap. Ryan Kowalski (ServiceNow): evaluate based on ITSM platform renewal decision. Want the full extension analysis?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Contractor Engagements Ending This Quarter**

**${ending.length} contractors have engagements ending within 90 days:**

${ending.map(c => `**${c.name}** — ${c.role}
   End Date: ${dt(c.endDate)}
   Vendor: ${c.vendor} | Cost Center: ${c.costCenterName}
   Monthly Rate: ${fmt(c.monthlyRate)}
   YTD Spend: ${fmt(c.ytdSpend)} vs. Budget: ${fmt(c.budget)}
   **Extension Decision Required**`).join("\n\n")}

**Extension Decision Framework**
For each ending engagement, the business owner must answer:
1. Is the work still required? (Has the project delivered its objectives?)
2. Is an FTE hire in progress? (If yes, should the contractor bridge to hire date?)
3. What is the knowledge transfer risk? (Is documentation up to date?)
4. Is the budget available for extension? (Where will the funds come from?)

**Recommended Decisions (based on available data)**
- **Marcus Webb (Cybersecurity)**: Extension recommended — IAM Architect role is still open. Critical security coverage until hire is complete. Estimated extension cost: ${fmt(ending.find(c => c.name === "Marcus Webb")?.monthlyRate ?? 16_000 * 3)}.
- **Ryan Kowalski (ServiceNow)**: Evaluate carefully — ServiceNow contract renewal under review. If platform is replaced, this extension may not be warranted.

**Knowledge Transfer Requirements**
Both contractors should complete a knowledge transfer package (system documentation, process guides, access inventory) before their final day — regardless of extension decision.`,
        keyPoints: [
          `${ending.length} contractor engagements ending within 90 days — extension decisions needed by mid-June`,
          "Marcus Webb (Cybersecurity): extension recommended — open IAM Architect role creates coverage gap",
          "Ryan Kowalski (ServiceNow): evaluate based on ITSM platform renewal decision",
          "Knowledge transfer packages required from both regardless of extension decision",
          "Extension budget must be identified before decisions are communicated to vendors",
        ],
        riskFlags: [],
        actions: [
          { id: "EL-EN1", priority: "High", title: "Extension decisions for 2 ending contractors", description: "Business owner decisions needed by June 15 — vendor lead time is 2 weeks", owner: "IT Managers + HR", dueDate: "2026-06-15" },
          { id: "EL-EN2", priority: "Medium", title: "Knowledge transfer packages", description: "Both contractors to complete KT documentation by last week of engagement", owner: "IT Managers", dueDate: "2026-06-25" },
        ],
      };
    },
  },

  // ── 5. Default ────────────────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `${s.contractors.filter(c => c.status !== "On Hold").length} active contractors, ${fmt(s.laborYTD)} spent YTD vs. ${fmt(s.laborBudget)} budget. ${s.overBudgetContractors.length} over budget (${fmt(s.totalExcessLabor)} excess), ${s.endingSoonContractors.length} engagements ending this quarter. What do you want to dig into?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**External Labor Agent — Ready to Help**

I track contractor spend, SOW compliance, and workforce cost management. Current status:

- **Active contractors**: ${s.contractors.filter(c => c.status !== "On Hold").length} engagements
- **YTD spend**: ${fmt(s.laborYTD)} vs. budget ${fmt(s.laborBudget)} — ${pct(s.laborVariance / s.laborBudget)} variance
- **Over budget**: ${s.overBudgetContractors.length} contractors — ${fmt(s.totalExcessLabor)} total excess
- **Ending this quarter**: ${s.endingSoonContractors.length} engagements require extension decisions

**Areas I can help with:**
- Over-budget analysis and SOW compliance
- Burn rate and full-year projection
- Contractor-to-FTE conversion economics
- Ending engagement decisions and knowledge transfer

What would you like to analyze?`,
        keyPoints: [
          `YTD contractor spend: ${fmt(s.laborYTD)} — ${fmt(s.laborVariance)} over budget`,
          "Ask me about over-budget contractors, burn rate, conversion economics, or ending engagements",
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },
];
