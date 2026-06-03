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
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const topOver = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance);
      const topFav  = s.byBU.filter(b => b.variance < 0).sort((a, b) => a.variance - b.variance);
      return {
        answer: `**YTD Variance Driver Analysis — ${s.periodLabel}**

Total unfavorable variance: **${fmt(s.ytdVariance)}** (${pct(s.ytdVariancePct)} vs. budget).

**Primary Drivers — Unfavorable**

**1. ${topOver[0]?.bu} (+${fmt(topOver[0]?.variance ?? 0)})**
The #1 variance driver. AWS EC2 compute scaling for the Nexora AI inference platform added approximately ${fmt(76_000)} above plan. GCP Vertex AI training runs consumed 34% more compute than the annual plan assumed. Both are tied to approved Q2 roadmap deliverables but were not granularly budgeted at the service level.

**2. ${topOver[1]?.bu} (+${fmt(topOver[1]?.variance ?? 0)})**
Snowflake query costs exceeded contract minimums due to self-serve analytics adoption growing 22% faster than forecast. BigQuery slot utilization for the data lake is running above committed capacity, triggering on-demand pricing for overflow queries.

**3. ${topOver[2]?.bu} (+${fmt(topOver[2]?.variance ?? 0)})**
ERP consulting (Deloitte) expanded scope in Q1 without a formal change order. SAP FICO phase 2 deliverables were added to the engagement. Salesforce seat additions (6 net-new Marketing Cloud seats) were not included in the original plan.

**Partial Favorable Offsets**

**4. ${topFav[0]?.bu} (${fmt(topFav[0]?.variance ?? 0)})**
Hardware refresh deferred to Q3 (supply chain lead times). Network equipment savings from vendor renegotiation in January.

**5. Open Headcount Savings (~${fmt(-s.openReqSalaryAtRisk * 0.6)})**
${s.hcSummary.open} open requisitions are generating salary savings through H1. This partially offsets cloud and contractor overages.

**Net Variance Reconciliation**
- Cloud Engineering overage:  +${fmt(topOver[0]?.variance ?? 0)}
- Data & Analytics overage:   +${fmt(topOver[1]?.variance ?? 0)}
- Applications overage:       +${fmt(topOver[2]?.variance ?? 0)}
- Infrastructure favorable:   ${fmt(topFav[0]?.variance ?? 0)}
- Open HC salary savings:     ~${fmt(-s.openReqSalaryAtRisk * 0.6)}
- **Net variance:**           **${fmt(s.ytdVariance)}**`,
        keyPoints: [
          `#1 driver: ${topOver[0]?.bu ?? "Cloud"} — AI/ML compute scaling (+${fmt(topOver[0]?.variance ?? 0)})`,
          `#2 driver: ${topOver[1]?.bu ?? "Data"} — Snowflake + BigQuery consumption overages`,
          `#3 driver: ${topOver[2]?.bu ?? "Applications"} — ERP consultant scope expansion`,
          "Open headcount salary savings partially offsetting overages — ~$150K favorable YTD",
          "Infrastructure and IT Ops tracking within/under budget — favorable trend",
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-D1", priority: "High", title: "Cloud FinOps review — quantify right-sizing", description: "Separate strategic investment from waste in cloud variance", owner: "Cloud Engineering + FP&A", dueDate: "2026-06-30" },
          { id: "FPA-D2", priority: "High", title: "Deloitte change order — formalize scope", description: "Issue formal PO amendment for ERP phase 2 deliverables", owner: "Applications + Procurement", dueDate: "2026-06-15" },
          { id: "FPA-D3", priority: "Medium", title: "Snowflake slot commitment analysis", description: "Evaluate upgrading to higher slot tier vs. on-demand pricing", owner: "Data Engineering + Finance", dueDate: "2026-07-01" },
        ],
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
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
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
  const bar = "█".repeat(Math.min(Math.round(m.actual / 200_000), 20));
  return `${m.month}: ${fmt(m.actual)} | ${v > 0 ? "▲" : "▼"} ${fmt(Math.abs(v))}`;
}).join("\n")}

**Assessment**
Variance is unfavorable in ${s.byBU.filter(b => b.variance > 0).length} of ${s.byBU.length} business units. The trend is accelerating — May variance (${fmt(s.currentMonth.actual - s.currentMonth.budget)}) was the largest single-month overage YTD. If the current run rate continues unchanged, the full-year variance will exceed ${fmt(s.ytdVariance / 5 * 12)}.`,
        keyPoints: [
          `${s.byBU.filter(b => b.variance > 0).length} of ${s.byBU.length} business units tracking over budget`,
          `Largest overage: ${s.topOverBU?.bu} at ${s.topOverBU ? fmt(s.topOverBU.variance) : "N/A"}`,
          `May was highest-variance month YTD — trend is accelerating`,
          `Full-year run-rate variance risk: ~${fmt(s.ytdVariance / 5 * 12)} if unmitigated`,
          `Favorable BUs: ${s.byBU.filter(b => b.variance < 0).map(b => b.bu).join(", ")}`,
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-BVA1", priority: "High", title: "Monthly BU variance review meetings", description: "Schedule June close reviews with all BU owners — focus on Cloud Eng and Data", owner: "FP&A", dueDate: "2026-06-05" },
        ],
      };
    },
  },

  // ── 3. Forecast / reforecast ───────────────────────────────────────────────
  {
    key: "forecast",
    keywords: [
      "forecast", "reforecast", "re-forecast", "project", "full year", "year-end",
      "predict", "estimate", "outlook", "what will we spend",
    ],
    weight: 7,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const overrun = s.fullYearForecast - s.fullYearBudget;
      return {
        answer: `**FP&A Full-Year Forecast — Q2 Reforecast**

**Revised Full-Year Outlook**
Full-year forecast: **${fmt(s.fullYearForecast)}**
Approved budget: **${fmt(s.fullYearBudget)}**
Projected variance: **${fmt(overrun)} (${pct(overrun / s.fullYearBudget)})**

**Forecast Methodology**
The Q2 reforecast uses a three-driver model:
1. **Actuals Extrapolation**: YTD actuals (${fmt(s.ytdActual)}) run-rated at 97% (slight deceleration assumed in H2)
2. **Known Commitments**: Vendor contracts, headcount plan, and approved project spend
3. **Management Adjustments**: FinOps savings target (${fmt(-350_000)}), HC fills expected in Q3

**Key Forecast Assumptions**
- Cloud spend growth rate decelerates from ${pct(s.cloudMoMGrowth)} MoM to ~2% MoM in Q3–Q4
- AWS EDP discount of 12% applies from July 1 (pending negotiation)
- ${Math.ceil(s.hcSummary.open * 0.6)} open reqs filled by September — shifts labor mix to FTE
- No new unplanned projects in H2 (conservative base case)
- Accrual reversal for deferred Q3 hardware refresh: ~${fmt(-90_000)}

**Scenario Analysis**
| Scenario | Full-Year Spend | Variance |
|---|---|---|
| Base Case (current trajectory) | ${fmt(s.fullYearForecast)} | ${fmt(overrun)} |
| Optimistic (FinOps + AWS EDP) | ${fmt(s.fullYearForecast - 350_000)} | ${fmt(overrun - 350_000)} |
| Conservative (cloud continues accelerating) | ${fmt(s.fullYearForecast + 400_000)} | ${fmt(overrun + 400_000)} |

**Forecast Accuracy Note**
Q1 forecast was within 1.8% of actuals. Q2 was 3.1% off due to unanticipated cloud acceleration. Forecast reliability improves with FinOps visibility — a key reason to accelerate that program.`,
        keyPoints: [
          `Base case full-year forecast: ${fmt(s.fullYearForecast)} — ${fmt(overrun)} over budget`,
          `Optimistic case: ${fmt(s.fullYearForecast - 350_000)} — requires AWS EDP deal and FinOps execution`,
          `Conservative case: ${fmt(s.fullYearForecast + 400_000)} — if cloud growth does not decelerate`,
          "Forecast methodology: actuals extrapolation + known commitments + management adjustments",
          "Recommend locking Q2 reforecast by July 10 — needed for Q3 budget allocation",
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
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      const mayActuals = s.monthly.length > 0
        ? (() => {
            // Build from raw actuals data — use byBU as proxy
            return s.byBU.map(b => ({
              name: b.bu,
              actual: b.actual,
              budget: b.budget,
              variance: b.variance,
              vPct: b.budget > 0 ? b.variance / b.budget : 0,
            }));
          })()
        : [];

      const topOffenders = mayActuals.filter(r => r.vPct > 0.05).sort((a, b) => b.vPct - a.vPct);
      return {
        answer: `**Cost Center Analysis — ${s.periodLabel}**

**Highest Variance Cost Centers (>5% unfavorable)**
${topOffenders.length > 0 ? topOffenders.map((r, i) => `${i + 1}. **${r.name}**: ${fmt(r.actual)} actual vs. ${fmt(r.budget)} budget — **${pct(r.vPct)} unfavorable** (${fmt(r.variance)} over)`).join("\n") : "No cost centers are tracking >5% unfavorable at the BU level."}

**Detailed Cost Center Observations**

**CC-501 — AWS Production (Cloud Engineering)**
YTD actual ${fmt(s.cloudYTD * 0.51)} vs. budget. Primary driver: EC2 Auto Scaling Groups expanded capacity for AI inference tier in March. Instance count grew from 48 to 67 without a corresponding budget amendment. Recommend implementing instance count governance via AWS Service Quotas.

**CC-401 — Data Platform (Data & Analytics)**
Snowflake consumption is the variance driver — the standard business tier cannot accommodate the self-serve analytics growth without exceeding compute credit allocation. A tier upgrade to Enterprise would add ${fmt(8_500)}/month but eliminate ${fmt(22_000)}/month in overage charges.

**CC-701 — EA & Strategy (Enterprise Architecture)**
Accenture engagement is tracking ${pct(0.085)} over contract. Weekly status reviews show 3 deliverables were added to scope in Q1 without a formal change order. Contract manager has been notified — amendment expected by June 15.

**On-Budget Cost Centers**
${s.byBU.filter(b => Math.abs(b.variance / b.budget) < 0.03).map(b => `✓ ${b.bu} — within 3% of budget`).join("\n")}`,
        keyPoints: [
          `${topOffenders.length} business units tracking >5% unfavorable variance`,
          "CC-501 (AWS Production) = highest-variance cost center — EC2 scaling without budget amendment",
          "CC-401 (Data Platform) = Snowflake tier upgrade decision pending — ROI positive at current overage rate",
          "CC-701 (EA & Strategy) — Accenture scope creep; change order imminent",
          `${s.byBU.filter(b => Math.abs(b.variance / b.budget) < 0.03).length} BUs tracking within 3% of budget`,
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-CC1", priority: "High", title: "AWS EC2 instance count governance", description: "Implement Service Quota policy: all new instance requests require FP&A approval", owner: "Cloud Engineering + FP&A", dueDate: "2026-06-20" },
          { id: "FPA-CC2", priority: "Medium", title: "Snowflake tier upgrade evaluation", description: "Model Enterprise tier ROI vs. current on-demand overage — present to CIO", owner: "Data Engineering + IT Finance", dueDate: "2026-07-01" },
        ],
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
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      return {
        answer: `**Spend Trend Analysis — ${s.periodLabel}**

**Monthly Progression**
${s.monthly.map((m, i) => {
  const prior = i > 0 ? s.monthly[i - 1] : null;
  const mom = prior ? (m.actual - prior.actual) / prior.actual : 0;
  return `**${m.month}**: ${fmt(m.actual)} | Budget: ${fmt(m.budget)} | Var: ${fmt(m.actual - m.budget)} ${prior ? `| MoM: ${mom > 0 ? "+" : ""}${pct(mom)}` : ""}`;
}).join("\n")}

**Trend Observations**

1. **Accelerating Cloud Spend**: Cloud infrastructure spend has grown every single month in 2026. May cloud spend of ~${fmt(s.cloudYTD / 5 * 1.08)} is 35% higher than January levels. The MoM growth rate in May was ${pct(s.cloudMoMGrowth)}.

2. **Stable Labor Costs**: FTE labor (included in BU totals) has been the most stable cost category — consistent with budget. No anomalies detected.

3. **External Labor Creep**: Contractor spend has increased month-over-month as scope expansions accumulate. Average monthly rate per contractor has risen from ${fmt(17_200)} in January to ${fmt(18_900)} in May.

4. **Consistent Infrastructure Underspend**: Infrastructure BU has been favorable every month — consistently running 2–4% under budget. Hardware refresh deferral is the primary driver.

5. **Applications Acceleration**: Applications spend is trending upward as ERP consulting scope expands. May was the highest applications month YTD at +${pct(0.076)} vs. budget.

**Forecast Implication**
If the current acceleration trend in cloud and external labor continues without intervention, the monthly run rate will reach ${fmt(s.currentMonth.actual * 1.08)} by August — implying a full-year spend of ${fmt(s.currentMonth.actual * 1.08 * 12 * 0.55 + s.ytdActual)}.`,
        keyPoints: [
          `Cloud spend growing every month — +35% from January to May (${pct(s.cloudMoMGrowth)} MoM in May)`,
          "External labor blended rate increasing — scope creep adding to monthly run rate",
          "Infrastructure consistently favorable — hardware refresh deferral driving savings",
          "Applications accelerating in Q2 — ERP consulting scope expansion",
          "FTE labor stable — most predictable cost category YTD",
        ],
        riskFlags: [],
        actions: [
          { id: "FPA-T1", priority: "High", title: "Establish cloud spend growth rate target", description: "Target: bring MoM cloud growth below 2% by August via FinOps", owner: "Cloud Engineering + FP&A", dueDate: "2026-07-01" },
        ],
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
        answer: `**June 2026 Month-End Accrual Checklist — FP&A**

Based on May actuals and June commitments, the following accruals are recommended for the June close:

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

  // ── 7. Default ────────────────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler({ snapshot: s }) {
      const { fmt, pct } = s;
      return {
        answer: `**FP&A Agent — Ready to Analyze**

I specialize in financial planning and variance analysis. Here's what I can help with:

- **Variance Drivers**: What is causing the ${fmt(s.ytdVariance)} unfavorable variance?
- **Budget vs. Actuals**: Full BU-level budget vs. actuals breakdown
- **Forecast**: Q2 reforecast methodology and scenario analysis
- **Cost Centers**: Deep-dive into specific cost center performance
- **Trends**: Month-over-month spend trajectory and acceleration analysis
- **Accruals**: Month-end accrual checklist and close support

**Quick Headlines**
- YTD variance: ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — cloud and external labor are the drivers
- Highest-variance BU: ${s.topOverBU?.bu ?? "Cloud Engineering"} at +${fmt(s.topOverBU?.variance ?? 0)}
- Full-year forecast: ${fmt(s.fullYearForecast)} vs. budget ${fmt(s.fullYearBudget)}

What would you like me to dig into?`,
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
