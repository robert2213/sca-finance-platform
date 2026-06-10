/**
 * role-perspectives.ts
 *
 * Defines each agent's analytical lens — what they look at first, what
 * thresholds trigger concern, and how they communicate their findings.
 *
 * Used by role-analysis-engine.ts to analyze the finance snapshot through
 * the right professional perspective before generating a response.
 */

import type { AgentId } from "@/types/finance";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AnalysisDomain =
  | "vendor_urgency"        // expiring contracts without auto-renew
  | "budget_variance"       // YTD actual vs budget gap
  | "forecast_trajectory"   // full-year run-rate vs approved budget
  | "cloud_spend"           // cloud overage and acceleration rate
  | "contractor_compliance" // over-SOW contractors and engagement endings
  | "headcount_gaps"        // open reqs by business unit
  | "vendor_concentration"  // spend concentration across vendor portfolio
  | "labor_efficiency";     // contractor vs FTE cost mix

export type AgentVoice = "strategic" | "analytical" | "operational_sourcing" | "operational_labor" | "operational_workforce" | "technical";

export interface AgentPerspective {
  // Ordered — first domain is what this agent checks before anything else
  analysisPriorities: AnalysisDomain[];

  // Thresholds below which a finding is not flagged
  thresholds: {
    budgetVariancePct: number;   // e.g. 0.03 = flag if >3% over
    forecastOverrunPct: number;  // e.g. 0.03 = flag if full-year >3% over
    contractDaysUrgent: number;  // e.g. 90 = flag if <90 days
    fillRateGap: number;         // e.g. 0.82 = flag if fill rate <82%
    laborOverrunPct: number;     // e.g. 0.05 = flag if contractor >5% over SOW
    cloudVariancePct: number;    // e.g. 0.08 = flag if cloud >8% over
  };

  voice: AgentVoice;
}

// ─── Perspectives registry ────────────────────────────────────────────────────

export const ROLE_PERSPECTIVES: Record<AgentId, AgentPerspective> = {

  cfo: {
    analysisPriorities: [
      "vendor_urgency",       // contract expiry = enterprise risk
      "forecast_trajectory",  // where does the year end?
      "cloud_spend",          // biggest overrun driver
      "contractor_compliance",// unapproved commitments
      "budget_variance",      // YTD performance
      "headcount_gaps",       // delivery risk + cost mix
    ],
    thresholds: {
      budgetVariancePct:   0.03,
      forecastOverrunPct:  0.03,
      contractDaysUrgent:  90,
      fillRateGap:         0.80,
      laborOverrunPct:     0.05,
      cloudVariancePct:    0.08,
    },
    voice: "strategic",
  },

  fpa: {
    analysisPriorities: [
      "budget_variance",      // variance analysis = core FP&A work
      "forecast_trajectory",  // where does the year land?
      "cloud_spend",          // largest variance driver
      "contractor_compliance",// labor overruns affect run-rate
      "headcount_gaps",       // salary savings context
      "vendor_urgency",       // contract renewals affect budget
    ],
    thresholds: {
      budgetVariancePct:   0.02,
      forecastOverrunPct:  0.02,
      contractDaysUrgent:  90,
      fillRateGap:         0.82,
      laborOverrunPct:     0.04,
      cloudVariancePct:    0.05,
    },
    voice: "analytical",
  },

  procurement: {
    analysisPriorities: [
      "vendor_urgency",       // contract expiry = direct procurement risk
      "vendor_concentration", // spend concentration = sourcing risk
      "contractor_compliance",// managed service compliance
      "budget_variance",      // spend vs commitment
      "cloud_spend",          // cloud vendor management
      "forecast_trajectory",  // full-year commitment exposure
    ],
    thresholds: {
      budgetVariancePct:   0.04,
      forecastOverrunPct:  0.04,
      contractDaysUrgent:  120, // procurement needs more lead time
      fillRateGap:         0.75,
      laborOverrunPct:     0.05,
      cloudVariancePct:    0.10,
    },
    voice: "operational_sourcing",
  },

  "external-labor": {
    analysisPriorities: [
      "contractor_compliance",// over-SOW = core external labor concern
      "labor_efficiency",     // contractor vs FTE cost mix
      "headcount_gaps",       // open FTE reqs = contractor dependency
      "budget_variance",      // labor contribution to total variance
      "forecast_trajectory",  // contractor run-rate projection
      "vendor_urgency",       // managed service contract renewals
    ],
    thresholds: {
      budgetVariancePct:   0.04,
      forecastOverrunPct:  0.04,
      contractDaysUrgent:  60,
      fillRateGap:         0.80,
      laborOverrunPct:     0.03, // tight SOW compliance threshold
      cloudVariancePct:    0.12,
    },
    voice: "operational_labor",
  },

  headcount: {
    analysisPriorities: [
      "headcount_gaps",       // fill rate = primary headcount concern
      "labor_efficiency",     // FTE vs contractor cost premium
      "contractor_compliance",// contractor backfill compliance
      "budget_variance",      // salary budget utilization
      "forecast_trajectory",  // headcount plan vs year-end projection
      "vendor_urgency",       // staffing vendor contract risks
    ],
    thresholds: {
      budgetVariancePct:   0.05,
      forecastOverrunPct:  0.05,
      contractDaysUrgent:  90,
      fillRateGap:         0.78, // flag if fill rate below 78%
      laborOverrunPct:     0.05,
      cloudVariancePct:    0.15,
    },
    voice: "operational_workforce",
  },

  cio: {
    analysisPriorities: [
      "cloud_spend",          // cloud = technology platform health
      "vendor_urgency",       // tier-1 infrastructure dependencies
      "forecast_trajectory",  // technology investment vs plan
      "headcount_gaps",       // technical capacity to deliver
      "contractor_compliance",// delivery risk from non-compliant engagements
      "budget_variance",      // portfolio investment performance
    ],
    thresholds: {
      budgetVariancePct:   0.04,
      forecastOverrunPct:  0.04,
      contractDaysUrgent:  90,
      fillRateGap:         0.78,
      laborOverrunPct:     0.05,
      cloudVariancePct:    0.08,
    },
    voice: "technical",
  },

  "finance-bp": {
    analysisPriorities: [
      "budget_variance",
      "forecast_trajectory",
      "contractor_compliance",
      "headcount_gaps",
      "cloud_spend",
      "vendor_urgency",
    ],
    thresholds: {
      budgetVariancePct:   0.03,
      forecastOverrunPct:  0.03,
      contractDaysUrgent:  90,
      fillRateGap:         0.80,
      laborOverrunPct:     0.05,
      cloudVariancePct:    0.08,
    },
    voice: "analytical",
  },

  validation: {
    analysisPriorities: [
      "budget_variance",
      "forecast_trajectory",
      "cloud_spend",
      "vendor_urgency",
      "contractor_compliance",
      "headcount_gaps",
    ],
    thresholds: {
      budgetVariancePct:   0.02,
      forecastOverrunPct:  0.02,
      contractDaysUrgent:  90,
      fillRateGap:         0.80,
      laborOverrunPct:     0.04,
      cloudVariancePct:    0.06,
    },
    voice: "strategic",
  },
};
