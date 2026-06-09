/**
 * FP&A Agent — Response Library
 *
 * Handles: Variance drivers, budget vs actuals, forecast methodology,
 * cost center analysis, trend analysis, accruals, and reforecast requests.
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

export const fpaResponses: Route[] = [

  // ── 1. Variance drivers ────────────────────────────────────────────────────
  {
    key: "variance-drivers",
    keywords: [
      "driver", "why", "cause", "reason", "explain the variance", "what is driving",
      "driving the", "variance driver", "behind the variance", "source of",
    ],
    weight: 9,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const topOver = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance);
      const topFav  = s.byBU.filter(b => b.variance < 0).sort((a, b) => a.variance - b.variance);

      if (ctx.outputMode !== 'question_answering') {
        return {
          answer: `**YTD Variance Driver Analysis — ${s.periodLabel}**

Total unfavorable variance: **${fmt(s.ytdVariance)}** (${pct(s.ytdVariancePct)} vs. budget).

**Primary Drivers — Unfavorable**

**1. ${topOver[0]?.bu} (+${fmt(topOver[0]?.variance ?? 0)})**
AWS EC2 compute scaling for the AI inference platform added approximately ${fmt(76_000)} above plan. GCP Vertex AI training runs consumed 34% more compute than the annual plan assumed.

**2. ${topOver[1]?.bu} (+${fmt(topOver[1]?.variance ?? 0)})**
Snowflake query costs exceeded contract minimums due to self-serve analytics adoption growing 22% faster than forecast. BigQuery slot utilization triggering on-demand pricing.

**3. ${topOver[2]?.bu} (+${fmt(topOver[2]?.variance ?? 0)})**
ERP consulting (Deloitte) expanded scope in Q1 without a formal change order. SAP FICO phase 2 deliverables added without budget amendment.

${topFav.length > 0
  ? `**Partial Favorable Offsets**\n\n**4. ${topFav[0].bu} (${fmt(topFav[0].variance)})**\nHardware refresh deferred to Q3. Network equipment savings from vendor renegotiation in January.`
  : `**No Favorable Offsets**\nAll business units tracking over budget through ${s.periodLabel}.`}

**5. Open Headcount Savings (~${fmt(-s.openReqSalaryAtRisk * 0.6)})**
${s.hcSummary.open} open requisitions generating salary savings through H1.

**Net Variance: ${fmt(s.ytdVariance)}**`,
          keyPoints: [
            `#1 driver: ${topOver[0]?.bu ?? "Cloud"} — AI/ML compute scaling (+${fmt(topOver[0]?.variance ?? 0)})`,
            `#2 driver: ${topOver[1]?.bu ?? "Data"} — Snowflake + BigQuery consumption overages`,
            `#3 driver: ${topOver[2]?.bu ?? "Applications"} — ERP consultant scope expansion`,
            "Open headcount salary savings partially offsetting overages",
            "Infrastructure tracking within/under budget",
          ],
          riskFlags: [],
          actions: [
            { id: "FPA-D1", priority: "High", title: "Cloud FinOps review — quantify right-sizing", description: "Separate strategic investment from waste in cloud variance", owner: "Cloud Engineering + FP&A", dueDate: "2026-06-30" },
            { id: "FPA-D2", priority: "High", title: "Deloitte change order — formalize scope", description: "Issue formal PO amendment for ERP phase 2 deliverables", owner: "Applications + Procurement", dueDate: "2026-06-15" },
            { id: "FPA-D3", priority: "Medium", title: "Snowflake slot commitment analysis", description: "Evaluate upgrading to higher slot tier vs. on-demand pricing", owner: "Data Engineering + Finance", dueDate: "2026-07-01" },
          ],
        };
      }

      return {
        answer: `The ${fmt(s.ytdVariance)} YTD variance is driven by three BUs: ${topOver[0]?.bu} (+${fmt(topOver[0]?.variance ?? 0)}, AWS/GCP scaling), ${topOver[1]?.bu} (+${fmt(topOver[1]?.variance ?? 0)}, Snowflake overages), and ${topOver[2]?.bu} (+${fmt(topOver[2]?.variance ?? 0)}, ERP consulting scope creep). ${topFav[0] ? `${topFav[0].bu} is partially offsetting at ${fmt(topFav[0].variance)}.` : ''} Want me to dig into any specific driver?`,
        keyPoints: [
          `#1: ${topOver[0]?.bu ?? "Cloud"} +${fmt(topOver[0]?.variance ?? 0)} — compute scaling`,
          `#2: ${topOver[1]?.bu ?? "Data"} +${fmt(topOver[1]?.variance ?? 0)} — consumption overages`,
          `#3: ${topOver[2]?.bu ?? "Applications"} +${fmt(topOver[2]?.variance ?? 0)} — consulting scope`,
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 2. Budget vs Actuals ───────────────────────────────────────────────────
  {
    key: "bva",
    keywords: [
      "budget vs actual", "budget versus actual", "bva", "actuals", "vs budget",
      "against budget", "to budget", "vs plan", "against plan", "how are we tracking",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const topOver = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance)[0];
      const overCount = s.byBU.filter(b => b.variance > 0).length;
      const dir = s.ytdVariance > 0 ? 'over' : 'under';

      if (ctx.outputMode !== 'question_answering') {
        return {
          answer: `**Budget vs. Actuals — ${s.periodLabel}**

**Summary**
| Metric | Value |
|---|---|
| YTD Actual | **${fmt(s.ytdActual)}** |
| YTD Budget | ${fmt(s.ytdBudget)} |
| Variance ($ ) | **${fmt(s.ytdVariance)}** |
| Variance (%) | **${pct(s.ytdVariancePct)}** |
| Full-Year Budget | ${fmt(s.fullYearBudget)} |
| Full-Year Forecast | ${fmt(s.fullYearForecast)} |

**By Business Unit**
${s.byBU.map(b => {
  const vPct = b.budget > 0 ? b.variance / b.budget : 0;
  const indicator = b.variance > 0 ? "🔴" : b.variance < -10_000 ? "🟢" : "🟡";
  return `${indicator} **${b.bu}**: ${fmt(b.actual)} actual | ${fmt(b.budget)} budget | **${fmt(b.variance)} (${pct(vPct)})**`;
}).join("\n")}

**Monthly Trend — Actual vs. Budget**
${s.monthly.map(m => {
  const v = m.actual - m.budget;
  return `${m.month}: ${fmt(m.actual)} | ${v > 0 ? "▲" : "▼"} ${fmt(Math.abs(v))}`;
}).join("\n")}

**Assessment**
Variance is unfavorable in ${overCount} of ${s.byBU.length} business units. May variance (${fmt(s.currentMonth.actual - s.currentMonth.budget)}) was the largest single-month overage YTD. Full-year run-rate variance risk: ~${fmt(s.ytdVariance / 5 * 12)} if unmitigated.`,
          keyPoints: [
            `${overCount} of ${s.byBU.length} business units tracking over budget`,
            `Largest overage: ${topOver?.bu} at ${topOver ? fmt(topOver.variance) : "N/A"}`,
            `May was highest-variance month YTD — trend is accelerating`,
            `Full-year run-rate variance risk: ~${fmt(s.ytdVariance / 5 * 12)} if unmitigated`,
            `Favorable BUs: ${s.byBU.filter(b => b.variance < 0).map(b => b.bu).join(", ")}`,
          ],
          riskFlags: [],
          actions: [
            { id: "FPA-BVA1", priority: "High", title: "Monthly BU variance review meetings", description: "Schedule June close reviews with all BU owners — focus on Cloud Eng and Data", owner: "FP&A", dueDate: "2026-06-05" },
          ],
        };
      }

      return {
        answer: `YTD IT spend is ${fmt(s.ytdActual)} — ${fmt(Math.abs(s.ytdVariance))} ${dir} the ${fmt(s.ytdBudget)} budget (${pct(s.ytdVariancePct)}). ${topOver ? `${topOver.bu} is the primary driver at +${fmt(topOver.variance)}.` : ''} ${overCount} of ${s.byBU.length} business units are over budget. Want me to break this down by BU or show the monthly trend?`,
        keyPoints: [
          `YTD: ${fmt(s.ytdActual)} vs budget ${fmt(s.ytdBudget)} — ${fmt(s.ytdVariance)} ${s.ytdVariance > 0 ? 'unfavorable' : 'favorable'}`,
          topOver ? `Top driver: ${topOver.bu} at +${fmt(topOver.variance)}` : '',
        ].filter(Boolean),
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 3. Forecast / reforecast (FULL-YEAR ONLY) ─────────────────────────────
  // Monthly/quarterly/half-year queries are intercepted by the response mode
  // router in agentEngine.ts before they reach keyword routing. This handler
  // is reached only for genuine full-year forecast questions.
  {
    key: "forecast",
    keywords: [
      "forecast", "reforecast", "re-forecast", "full year", "year-end",
      "outlook", "what will we spend", "where will we land", "full-year",
    ],
    // Negatives: month and quarter patterns that indicate temporal scope
    // (belt-and-suspenders — the response mode router guards these already)
    negatives: [
      "january", "february", "march", "april", "june", "july",
      "august", "september", "october", "november", "december",
      "jan's", "feb's", "jun's", "jul's", "aug's",
    ],
    weight: 7,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const overrun = s.fullYearForecast - s.fullYearBudget;
      const isOver  = overrun > 0;

      return {
        answer: `Full-year forecast: **${fmt(s.fullYearForecast)}** — ${fmt(Math.abs(overrun))} ${isOver ? 'over' : 'under'} the ${fmt(s.fullYearBudget)} budget (${pct(Math.abs(overrun / s.fullYearBudget))} ${isOver ? 'unfavorable' : 'favorable'}). ${Math.abs(overrun) < 100_000 ? 'Essentially flat to plan.' : isOver ? 'A meaningful overage that needs H2 action.' : 'A favorable position — driven mainly by open headcount.'}

The real question is whether cloud decelerates in H2. Right now cloud is running ${pct(s.cloudMoMGrowth)} MoM — if that rate holds instead of moderating, you're looking at another ${fmt(300_000 + 400_000)} of pressure above the base case.

**Scenario range:**
| | Full-Year | vs Budget |
|---|---|---|
| Base case (97% of run rate) | ${fmt(s.fullYearForecast)} | ${fmt(overrun)} |
| Optimistic (FinOps + AWS EDP deal) | ${fmt(s.fullYearForecast - 350_000)} | ${fmt(overrun - 350_000)} |
| Conservative (cloud holds at current pace) | ${fmt(s.fullYearForecast + 400_000)} | ${fmt(overrun + 400_000)} |

Worth flagging: ${Math.ceil(s.hcSummary.open * 0.6)} of the ${s.hcSummary.open} open reqs are expected to fill in Q3. When they do, you'll see a step-up in salary spend — partially offsetting any cloud savings but also reflecting delivery capacity coming online.`,
        keyPoints: [
          `Full-year forecast: ${fmt(s.fullYearForecast)} — ${fmt(Math.abs(overrun))} ${isOver ? 'over' : 'under'} budget`,
          `Optimistic case: ${fmt(s.fullYearForecast - 350_000)} — requires AWS EDP deal and FinOps execution`,
          `Conservative case: ${fmt(s.fullYearForecast + 400_000)} — if cloud growth does not decelerate`,
          `${s.hcSummary.open} open reqs expected to fill Q3 — step-up in H2 salary spend`,
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-FC1", priority: "High", title: "Submit Q2 reforecast to leadership", description: "Include three scenarios and key assumption documentation", owner: "FP&A + IT Finance", dueDate: "2026-07-10" },
          { id: "FPA-FC2", priority: "Medium", title: "Establish monthly forecast cadence", description: "Lock rolling 3-month forecast by 5th business day of each month", owner: "FP&A", dueDate: "2026-07-05" },
        ],
      };
    },
  },

  // ── 4. Cost center deep dive ───────────────────────────────────────────────
  {
    key: "cost-center",
    keywords: [
      "cost center", "cc-", "aws production", "data platform", "security",
      "infrastructure", "network", "cloud engineering", "itsm", "detail",
      "which cost center", "by cost center",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const mayActuals = s.byBU.map(b => ({
        name: b.bu,
        actual: b.actual,
        budget: b.budget,
        variance: b.variance,
        vPct: b.budget > 0 ? b.variance / b.budget : 0,
      }));
      const topOffenders = mayActuals.filter(r => r.vPct > 0.05).sort((a, b) => b.vPct - a.vPct);

      if (ctx.outputMode !== 'question_answering') {
        return {
          answer: `**Cost Center Analysis — ${s.periodLabel}**

**Highest Variance Cost Centers (>5% unfavorable)**
${topOffenders.length > 0 ? topOffenders.map((r, i) => `${i + 1}. **${r.name}**: ${fmt(r.actual)} actual vs. ${fmt(r.budget)} budget — **${pct(r.vPct)} unfavorable** (${fmt(r.variance)} over)`).join("\n") : "No cost centers are tracking >5% unfavorable at the BU level."}

**CC-501 — AWS Production (Cloud Engineering)**
EC2 Auto Scaling expanded capacity for AI inference tier in March — instance count grew from 48 to 67 without a budget amendment.

**CC-401 — Data Platform (Data & Analytics)**
Snowflake standard tier can't absorb self-serve analytics growth. Enterprise tier upgrade (+${fmt(8_500)}/mo) would eliminate ${fmt(22_000)}/mo in overages.

**CC-701 — EA & Strategy (Enterprise Architecture)**
Accenture tracking ${pct(0.085)} over contract — 3 deliverables added in Q1 without a change order. Amendment expected June 15.

**On-Budget Cost Centers**
${s.byBU.filter(b => Math.abs(b.variance / b.budget) < 0.03).map(b => `✓ ${b.bu} — within 3% of budget`).join("\n")}`,
          keyPoints: [
            `${topOffenders.length} business units tracking >5% unfavorable variance`,
            "CC-501 (AWS Production) = highest — EC2 scaling without budget amendment",
            "CC-401 (Data Platform) = Snowflake tier upgrade pending — ROI positive",
            "CC-701 (EA & Strategy) — Accenture scope creep; change order imminent",
            `${s.byBU.filter(b => Math.abs(b.variance / b.budget) < 0.03).length} BUs within 3% of budget`,
          ],
          riskFlags: [],
          actions: [
            { id: "FPA-CC1", priority: "High", title: "AWS EC2 instance count governance", description: "Implement Service Quota policy: all new instance requests require FP&A approval", owner: "Cloud Engineering + FP&A", dueDate: "2026-06-20" },
            { id: "FPA-CC2", priority: "Medium", title: "Snowflake tier upgrade evaluation", description: "Model Enterprise tier ROI vs. current on-demand overage — present to CIO", owner: "Data Engineering + IT Finance", dueDate: "2026-07-01" },
          ],
        };
      }

      const top = topOffenders[0];
      return {
        answer: `${topOffenders.length} business units are tracking >5% over budget. ${top ? `${top.name} is highest at ${pct(top.vPct)} unfavorable (${fmt(top.variance)} over) — driven by ${top.name.includes('Cloud') ? 'EC2 scaling without a budget amendment' : top.name.includes('Data') ? 'Snowflake consumption overages' : 'consulting scope expansion'}.` : ''} ${s.byBU.filter(b => Math.abs(b.variance / b.budget) < 0.03).length} BUs are within 3% of budget. Want the full breakdown?`,
        keyPoints: topOffenders.slice(0, 3).map(r => `${r.name}: ${pct(r.vPct)} over (${fmt(r.variance)})`),
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 5. Trend analysis ─────────────────────────────────────────────────────
  {
    key: "trend",
    keywords: [
      "trend", "month over month", "mom", "growing", "growth", "increasing",
      "trajectory", "pattern", "over time", "historical", "movement",
    ],
    weight: 7,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const first = s.monthly[0];
      const last  = s.monthly[s.monthly.length - 1];

      if (ctx.outputMode !== 'question_answering') {
        return {
          answer: `**Spend Trend Analysis — ${s.periodLabel}**

**Monthly Progression**
${s.monthly.map((m, i) => {
  const prior = i > 0 ? s.monthly[i - 1] : null;
  const mom = prior ? (m.actual - prior.actual) / prior.actual : 0;
  return `**${m.month}**: ${fmt(m.actual)} | Budget: ${fmt(m.budget)} | Var: ${fmt(m.actual - m.budget)} ${prior ? `| MoM: ${mom > 0 ? "+" : ""}${pct(mom)}` : ""}`;
}).join("\n")}

Cloud spend has grown every month — +35% from January to May (${pct(s.cloudMoMGrowth)} MoM in May). External labor blended rate rising as scope expands. Infrastructure consistently favorable — hardware refresh deferral. Applications trending up on ERP consulting growth. FTE labor stable.

If the current acceleration continues, monthly run rate reaches ${fmt(s.currentMonth.actual * 1.08)} by August.`,
          keyPoints: [
            `Cloud growing every month — +35% Jan–May (${pct(s.cloudMoMGrowth)} MoM in May)`,
            "External labor creep — blended rate up from $17.2K to $18.9K/month",
            "Infrastructure consistently favorable — hardware refresh deferral",
            "Applications accelerating — ERP consulting scope",
            "FTE labor stable",
          ],
          riskFlags: [],
          actions: [
            { id: "FPA-T1", priority: "High", title: "Establish cloud spend growth rate target", description: "Target: bring MoM cloud growth below 2% by August via FinOps", owner: "Cloud Engineering + FP&A", dueDate: "2026-07-01" },
          ],
        };
      }

      return {
        answer: `IT spend has grown from ${fmt(first?.actual ?? 0)} in ${first?.month} to ${fmt(last?.actual ?? 0)} in ${last?.month} — ${pct(s.momGrowthPct)} MoM trend. Cloud is the primary driver, up +35% Jan–May (${pct(s.cloudMoMGrowth)} MoM in May). Infrastructure is the offset, consistently under budget. At this pace, monthly run rate reaches ${fmt(s.currentMonth.actual * 1.08)} by August. Want a month-by-month breakdown?`,
        keyPoints: [
          `Cloud +35% Jan–May — primary acceleration driver`,
          `Infrastructure consistently under budget — hardware refresh deferral`,
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 6. Accruals & month-end ───────────────────────────────────────────────
  {
    key: "accruals",
    keywords: [
      "accrual", "month end", "month-end", "close", "journal", "provision",
      "prepaid", "deferred", "accrued", "what do we need to accrue",
    ],
    weight: 9,
    handler({ snapshot: s }) {
      const { fmt } = s;
      return {
        answer: `June 2026 month-end accruals — based on May actuals and June commitments, the following accruals are recommended for the June close:

**1. Cloud Infrastructure Accruals**
- AWS EC2 (partial month): ${fmt(82_000)} — invoice lags 3–5 days; estimate based on CUR report
- GCP Vertex AI: ${fmt(44_000)} — ML training jobs completed June 28–30 not yet invoiced
- Azure (M365 + VMs): ${fmt(38_500)} — flat monthly billing, accrue at contract rate

**2. External Labor Accruals**
${s.contractors.filter(c => c.status === "Active" || c.status === "Over Budget").slice(0, 4).map(c => `- ${c.name} (${c.role}): ${fmt(c.monthlyRate)} — based on approved monthly rate`).join("\n")}
- Note: ${s.overBudgetContractors.length} contractors are over budget — SOW amendments must be in place before accruing at revised rates

**3. Vendor Accruals**
- Deloitte ERP engagement: ${fmt(135_000)} — progress billing per milestone schedule
- Accenture EA retainer: ${fmt(50_000)} — monthly retainer, accrue at contract rate
- ServiceNow subscription: ${fmt(51_667)} — monthly equivalent of annual contract

**4. Reversals Expected in June**
- Q1 hardware refresh accrual reversal: ${fmt(-90_000)} — purchase order cancelled
- Okta user true-up credit: ${fmt(-8_400)} — confirmed by vendor

**Month-End Close Timeline**
- Day -2: Cloud estimates locked (CUR report pull)
- Day -1: Contractor timesheets approved
- Day 1: All accruals posted by 5pm CT
- Day 3: Actuals review with IT Finance
- Day 5: Variance commentary submitted to CFO`,
        keyPoints: [
          `Total June accrual estimate: ~${fmt(82_000 + 44_000 + 38_500 + (s.contractors.slice(0, 4).reduce((sum, c) => sum + c.monthlyRate, 0)) + 135_000 + 50_000 + 51_667)}`,
          "Cloud accruals require CUR report — AWS invoice lags must be estimated",
          `${s.overBudgetContractors.length} over-budget contractors — SOW amendments must precede accrual at revised rates`,
          "Deloitte milestone billing = largest single accrual item at $135K",
          "Expected reversals of ~$98K reduce net accrual requirement",
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-ACR1", priority: "High", title: "Pull AWS CUR report for June accrual", description: "Request CUR (Cost and Usage Report) by June 29 for accurate cloud estimate", owner: "Cloud Engineering + FP&A", dueDate: "2026-06-29" },
          { id: "FPA-ACR2", priority: "High", title: "Confirm contractor timesheet submissions", description: "All 12 contractors must submit June timesheets by June 30 5pm CT", owner: "IT Finance", dueDate: "2026-06-30" },
        ],
      };
    },
  },

  // ── 7. Business unit risk ─────────────────────────────────────────────────
  {
    key: "bu-risk",
    keywords: [
      "risk", "greatest risk", "highest risk", "at risk", "most at risk",
      "business unit risk", "which business unit", "which bu", "bu risk",
      "riskiest", "biggest risk",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const ranked = s.byBU
        .filter(b => b.variance > 0)
        .sort((a, b) => b.variance - a.variance);

      if (ranked.length === 0) {
        return {
          answer: `All business units are tracking at or under budget through ${s.currentMonth.month} 2026 — no BU is in a risk position.`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      const top    = ranked[0];
      const vPct   = top.budget > 0 ? top.variance / top.budget : 0;
      const second = ranked[1];
      const sVPct  = second && second.budget > 0 ? second.variance / second.budget : 0;

      const driver = top.bu.toLowerCase().includes('cloud')
        ? 'cloud compute scaling above plan'
        : top.bu.toLowerCase().includes('data')
        ? 'Snowflake consumption overages'
        : top.bu.toLowerCase().includes('app') || top.bu.toLowerCase().includes('enterprise')
        ? 'consulting scope expansion'
        : 'a budget overrun without an approved amendment';

      const secondSentence = second
        ? ` ${second.bu} is second at ${fmt(second.variance)} over (${pct(sVPct)} unfavorable).`
        : '';

      return {
        answer: `${top.bu} is the highest-risk business unit. It is ${fmt(top.variance)} over budget YTD — the largest BU variance at ${pct(vPct)} unfavorable — and the risk is tied to ${driver}.${secondSentence}`,
        keyPoints: [],
        riskFlags: [],
        actions: [],
      };
    },
  },

  // ── 8. Default ────────────────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      return {
        answer: `YTD IT spend is ${fmt(s.ytdActual)} — ${fmt(Math.abs(s.ytdVariance))} ${s.ytdVariance > 0 ? 'over' : 'under'} budget (${pct(s.ytdVariancePct)}). Top driver: ${s.topOverBU?.bu ?? "Cloud Engineering"} at +${fmt(s.topOverBU?.variance ?? 0)}. Full-year forecast: ${fmt(s.fullYearForecast)} vs. ${fmt(s.fullYearBudget)} budget. What would you like me to analyze?`,
        keyPoints: [
          `YTD variance: ${fmt(s.ytdVariance)} unfavorable`,
          "Ask me about variance drivers, forecast methodology, or cost center detail",
        ],
        riskFlags: [],
        actions: [],
      };
    },
  },
];
