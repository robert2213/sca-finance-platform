/**
 * role-analysis-engine.ts
 *
 * Analyzes the finance snapshot from each agent's professional perspective
 * and generates a direct, natural prose response — not a template.
 *
 * Architecture:
 *   1. Detect material findings for each analysis domain (data-driven)
 *   2. Score findings by materiality + role priority order
 *   3. Promote the question-relevant domain to position 0 (question-first)
 *   4. Frame the top finding in the agent's voice (role-differentiated)
 *   5. Assemble a natural response (2–4 sentences + one follow-up offer)
 *
 * Called only from buildDefaultAnswer — specialized routes are untouched.
 */

import type { FinanceSnapshot } from "@/agents/dataContext";
import type { AgentId, AgentResponse } from "@/types/finance";
import type { ConversationContext } from "@/agents/agentEngine";
import {
  ROLE_PERSPECTIVES,
  type AnalysisDomain,
  type AgentVoice,
} from "@/lib/agents/role-perspectives";
import { classifyIntent, type FinanceIntent } from "@/lib/ai/intent-classifier";

// ─── Question-intent → preferred domain mapping ───────────────────────────────
// The question determines which finding leads the response. The role perspective
// then determines how that finding is framed and what secondary observation follows.
// EXECUTIVE_SUMMARY is omitted intentionally — role priorities should lead for
// explicit summary requests.
const INTENT_TO_DOMAIN: Partial<Record<FinanceIntent, AnalysisDomain>> = {
  GENERAL_FINANCIAL_QA:  "budget_variance",     // "YTD spend", "how are we doing"
  VARIANCE_ANALYSIS:     "budget_variance",      // "why are we over budget"
  FORECAST_ANALYSIS:     "forecast_trajectory",  // "where will we land this year"
  RISK_ASSESSMENT:       "vendor_urgency",       // "what concerns you most right now"
  VENDOR_ANALYSIS:       "vendor_urgency",       // "which vendor concerns you most"
  COST_CENTER_ANALYSIS:  "budget_variance",      // "which cost center is over budget"
  PROCUREMENT_ANALYSIS:  "vendor_urgency",       // "which contracts are expiring"
  HEADCOUNT_ANALYSIS:    "headcount_gaps",       // "what is current headcount"
};

// ─── Internal types ───────────────────────────────────────────────────────────

interface RawFinding {
  domain:      AnalysisDomain;
  materiality: number;          // 0–100: higher = more material
  data:        Record<string, string | number | boolean>;
}

interface Finding {
  domain:      AnalysisDomain;
  materiality: number;
  sentence:    string;           // the finding in prose
  followUp:    string;           // one natural next-step offer
  keyPoint:    string;           // bullet for keyPoints[]
}

// ─── Raw finding detectors ────────────────────────────────────────────────────
// Each returns null if the condition is below the relevant threshold.

function detectVendorUrgency(s: FinanceSnapshot, urgentDays: number): RawFinding | null {
  const noAutoRenew = s.expiringVendors90.filter(v => !v.autoRenew);
  if (noAutoRenew.length === 0) return null;

  const nearest   = noAutoRenew.sort((a, b) => s.daysUntil(a.contractEnd) - s.daysUntil(b.contractEnd))[0];
  const days      = s.daysUntil(nearest.contractEnd);
  if (days > urgentDays) return null;

  const matchedVendor = s.topVendors.find(v =>
    v.name.toLowerCase().includes(nearest.name.split(" ")[0].toLowerCase())
  );
  const annual = matchedVendor?.annualValue ?? nearest.annualValue ?? 0;

  // Urgency score: 100 at day 0, 40 at urgentDays
  const materiality = Math.max(40, Math.min(100, 100 - (days / urgentDays) * 60));

  return {
    domain: "vendor_urgency",
    materiality,
    data: {
      vendorName:     nearest.name,
      days,
      annual,
      otherCount:     noAutoRenew.length - 1,
      contractEnd:    nearest.contractEnd,
    },
  };
}

function detectBudgetVariance(s: FinanceSnapshot, threshold: number): RawFinding | null {
  const pct = s.ytdBudget > 0 ? s.ytdVariance / s.ytdBudget : 0;
  if (Math.abs(pct) < threshold) return null;

  const overBUs   = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance);
  const topBUName = overBUs[0]?.bu ?? "Cloud Engineering";
  const topBUVar  = overBUs[0]?.variance ?? 0;
  const secondBU  = overBUs[1];

  const materiality = Math.min(85, Math.abs(pct) / threshold * 50);

  return {
    domain: "budget_variance",
    materiality,
    data: {
      ytdActual:    s.ytdActual,
      ytdBudget:    s.ytdBudget,
      variance:     s.ytdVariance,
      variancePct:  pct,
      topBUName,
      topBUVar,
      secondBUName: secondBU?.bu ?? "",
      secondBUVar:  secondBU?.variance ?? 0,
      period:       s.periodLabel.replace(/^YTD\s+/i, ""),
    },
  };
}

function detectForecastTrajectory(s: FinanceSnapshot, threshold: number): RawFinding | null {
  const overrun    = s.fullYearForecast - s.fullYearBudget;
  const overrunPct = s.fullYearBudget > 0 ? overrun / s.fullYearBudget : 0;
  if (overrunPct < threshold) return null;

  const mitigated  = overrun * 0.60;
  const topBU      = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance)[0];

  const materiality = Math.min(80, overrunPct / threshold * 55);

  return {
    domain: "forecast_trajectory",
    materiality,
    data: {
      fullYearForecast: s.fullYearForecast,
      fullYearBudget:   s.fullYearBudget,
      overrun,
      overrunPct,
      mitigated,
      topDriver:        topBU?.bu ?? "Cloud",
      topDriverVar:     topBU?.variance ?? 0,
    },
  };
}

function detectCloudSpend(s: FinanceSnapshot, threshold: number): RawFinding | null {
  if (s.cloudVariancePct < threshold) return null;

  const providers  = s.cloudByProvider;
  const topProvider = [...providers].sort((a, b) => b.ytdSpend - a.ytdSpend)[0];
  const projYearOverrun = (s.cloudVariance / 5) * 7;

  const materiality = Math.min(80, s.cloudVariancePct / threshold * 55);

  return {
    domain: "cloud_spend",
    materiality,
    data: {
      cloudYTD:         s.cloudYTD,
      cloudBudget:      s.cloudBudget,
      cloudVariancePct: s.cloudVariancePct,
      cloudMoMGrowth:   s.cloudMoMGrowth,
      topProviderName:  topProvider?.provider ?? "AWS",
      topProviderSpend: topProvider?.ytdSpend ?? 0,
      projYearOverrun,
    },
  };
}

function detectContractorCompliance(s: FinanceSnapshot, threshold: number): RawFinding | null {
  if (s.overBudgetContractors.length === 0) return null;

  const overrunPct = s.laborBudget > 0 ? s.totalExcessLabor / s.laborBudget : 0;
  if (overrunPct < threshold) return null;

  const worst = s.overBudgetContractors
    .map(c => ({ ...c, excess: Math.max(0, c.ytdSpend - c.budget) }))
    .sort((a, b) => b.excess - a.excess)[0];

  const materiality = Math.min(70, overrunPct / threshold * 45);

  return {
    domain: "contractor_compliance",
    materiality,
    data: {
      overCount:         s.overBudgetContractors.length,
      totalExcess:       s.totalExcessLabor,
      worstName:         worst.name,
      worstBU:           worst.businessUnit,
      worstExcess:       worst.excess,
      endingSoonCount:   s.endingSoonContractors.length,
    },
  };
}

function detectHeadcountGap(s: FinanceSnapshot, fillRateFloor: number): RawFinding | null {
  if (s.fillRate >= fillRateFloor) return null;

  const openBUs    = s.hcByBU
    .filter(b => b.total > 0)
    .map(b => ({ ...b, openCount: b.total - b.filled, rate: b.filled / b.total }))
    .sort((a, b) => a.rate - b.rate);
  const worstBU    = openBUs[0];

  const criticalBUs = openBUs.filter(b => b.rate < 0.70);

  const materiality = Math.min(75, (1 - s.fillRate) / (1 - fillRateFloor) * 50);

  return {
    domain: "headcount_gaps",
    materiality,
    data: {
      filled:            s.hcSummary.filled,
      total:             s.hcSummary.total,
      open:              s.hcSummary.open,
      fillRate:          s.fillRate,
      worstBUName:       worstBU?.bu ?? "Security",
      worstBUFilled:     worstBU?.filled ?? 0,
      worstBUTotal:      worstBU?.total ?? 0,
      criticalBUCount:   criticalBUs.length,
      salaryAtRisk:      s.openReqSalaryAtRisk,
    },
  };
}

function detectVendorConcentration(s: FinanceSnapshot): RawFinding | null {
  const total      = s.vendorCommitment;
  if (total === 0) return null;

  const top3spend  = s.topVendors.slice(0, 3).reduce((sum, v) => sum + v.annualValue, 0);
  const conPct     = top3spend / total;
  if (conPct < 0.55) return null;

  return {
    domain: "vendor_concentration",
    materiality: Math.min(50, conPct * 60),
    data: {
      top3spend,
      total,
      conPct,
      highRiskCount:  s.highRiskVendors.length,
      highRiskValue:  s.highRiskVendors.reduce((s, v) => s + v.annualValue, 0),
    },
  };
}

function detectLaborEfficiency(s: FinanceSnapshot): RawFinding | null {
  const contractorPct = s.ytdActual > 0 ? s.laborYTD / s.ytdActual : 0;
  if (contractorPct < 0.12) return null;

  const premium = (contractorPct - 0.10) / 0.10;
  return {
    domain: "labor_efficiency",
    materiality: Math.min(45, contractorPct * 200),
    data: {
      laborYTD:       s.laborYTD,
      contractorPct,
      premium,
      openFTEReqs:    s.hcSummary.open,
    },
  };
}

// ─── Agent-voice framing ──────────────────────────────────────────────────────
// Each voice frames the same raw finding differently — same numbers, different
// professional perspective and follow-up offer.

function frameFinding(
  raw:     RawFinding,
  agentId: AgentId,
  voice:   AgentVoice,
  s:       FinanceSnapshot,
): Finding {
  const fmt = s.fmt;
  const pct = s.pct;
  const d   = raw.data;

  // ── vendor_urgency ──────────────────────────────────────────────────────────
  if (raw.domain === "vendor_urgency") {
    const vn    = d.vendorName as string;
    const days  = d.days as number;
    const ann   = d.annual as number;
    const other = d.otherCount as number;
    const tail  = other > 0 ? ` ${other} other contract${other > 1 ? "s" : ""} also expire within 90 days.` : "";

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${vn} is the most time-critical item — ${fmt(ann)} annual relationship expires in ${days} days with no auto-renew, which also means the EDP negotiation window closes on the same date.${tail}`,
        followUp: `Want the renewal scenario — EDP savings vs. month-to-month exposure?`,
        keyPoint: `${vn} contract: ${days} days, ${fmt(ann)}/yr, no auto-renew — highest-urgency item`,
      };
    }
    if (voice === "analytical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${vn} contract expiry is the largest near-term budget risk — ${fmt(ann)} annual at current terms, ${days} days to deadline, no auto-renew. Without a signed EDP, list pricing runs 15–25% above contract rates, which translates to ${fmt(ann * 0.18)}–${fmt(ann * 0.22)} in additional annual spend.${tail}`,
        followUp: `Want the budget impact model under different renewal scenarios?`,
        keyPoint: `${vn} expiry in ${days} days — unrenewed = ${fmt(ann * 0.18)}–${fmt(ann * 0.22)} cost increase`,
      };
    }
    if (voice === "operational_sourcing") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${vn} needs a decision now — ${fmt(ann)} annual relationship, ${days}-day deadline, no auto-renew, and the EDP negotiation window closes with it. Let it lapse and we're on month-to-month at list pricing.${tail}`,
        followUp: `Want the negotiation brief or the full renewal pipeline?`,
        keyPoint: `${vn}: ${days} days to expiry, EDP window closing — immediate action required`,
      };
    }
    if (voice === "operational_labor") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${vn} contract expires in ${days} days with no auto-renew. Any resource augmentation or staffing through ${vn.split(" ")[0]} Professional Services would need to be renegotiated under new terms after expiry.${tail}`,
        followUp: `Want to see which contractors are tied to this vendor relationship?`,
        keyPoint: `${vn} expiry in ${days} days — contractor resource planning may be affected`,
      };
    }
    if (voice === "operational_workforce") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${vn} contract expires in ${days} days, and that matters for headcount: ${vn.split(" ")[0]} provides staffing augmentation for several open engineering reqs. Pricing uncertainty after expiry affects the contractor backfill cost model.${tail}`,
        followUp: `Want to map the open reqs that depend on this vendor relationship?`,
        keyPoint: `${vn} expiry in ${days} days — staffing augmentation costs affected`,
      };
    }
    // technical (CIO)
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `${vn} is a tier-1 infrastructure dependency — ${fmt(ann)} annually — and the contract expires in ${days} days with no auto-renew. H2 cloud roadmap execution depends on continuity at current pricing; without an EDP, cloud workload economics change materially.${tail}`,
      followUp: `Want the cloud spend projection under different pricing scenarios?`,
      keyPoint: `${vn}: ${days} days to expiry — H2 roadmap depends on EDP renewal`,
    };
  }

  // ── budget_variance ─────────────────────────────────────────────────────────
  if (raw.domain === "budget_variance") {
    const ytdA   = d.ytdActual as number;
    const ytdB   = d.ytdBudget as number;
    const varAmt = d.variance as number;
    const varPct = d.variancePct as number;
    const top    = d.topBUName as string;
    const topVar = d.topBUVar as number;
    const sec    = d.secondBUName as string;
    const secVar = d.secondBUVar as number;
    const period = d.period as string;
    const dir    = varAmt > 0 ? "over" : "under";

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `IT is tracking ${pct(Math.abs(varPct))} ${dir} budget through ${period} — ${fmt(ytdA)} actual against ${fmt(ytdB)} plan, a ${fmt(Math.abs(varAmt))} gap. ${top} is driving ${pct(topVar / ytdB)} of the total variance.`,
        followUp: `Want the BU-level breakdown or the full-year trajectory?`,
        keyPoint: `YTD: ${fmt(ytdA)} vs ${fmt(ytdB)} — ${fmt(varAmt)} ${dir} (${pct(Math.abs(varPct))})`,
      };
    }
    if (voice === "analytical") {
      const secNote = sec ? ` ${sec} is the second driver at ${fmt(secVar)} over.` : "";
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `YTD through ${period}: ${fmt(ytdA)} against ${fmt(ytdB)} budget — ${fmt(Math.abs(varAmt))} ${dir} (${pct(Math.abs(varPct))}). ${top} is the primary driver at ${fmt(topVar)} over YTD.${secNote}`,
        followUp: `Want the full BU variance breakdown or the run-rate projection?`,
        keyPoint: `YTD: ${fmt(ytdA)} vs ${fmt(ytdB)} — ${pct(Math.abs(varPct))} ${dir} | top driver: ${top} (+${fmt(topVar)})`,
      };
    }
    // operational voices
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `Spend through ${period} is ${fmt(ytdA)} — ${fmt(Math.abs(varAmt))} ${dir} the ${fmt(ytdB)} budget (${pct(Math.abs(varPct))}). ${top} accounts for most of the gap at ${fmt(topVar)} over.`,
      followUp: `Want to see the breakdown by cost center or business unit?`,
      keyPoint: `YTD: ${fmt(ytdA)} vs ${fmt(ytdB)} — ${fmt(varAmt)} ${dir}`,
    };
  }

  // ── forecast_trajectory ─────────────────────────────────────────────────────
  if (raw.domain === "forecast_trajectory") {
    const fy    = d.fullYearForecast as number;
    const fyB   = d.fullYearBudget as number;
    const over  = d.overrun as number;
    const oPct  = d.overrunPct as number;
    const mit   = d.mitigated as number;
    const top   = d.topDriver as string;

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Full-year IT is tracking ${fmt(fy)} — ${fmt(over)} over the ${fmt(fyB)} budget (${pct(oPct)}). If AWS EDP and FinOps execute on schedule, the overrun compresses to ~${fmt(mit)}. ${top} is the primary driver on both the problem and the mitigation.`,
        followUp: `Want the pre- and post-mitigation scenario model?`,
        keyPoint: `FY2026 forecast: ${fmt(fy)} vs ${fmt(fyB)} budget — ${fmt(over)} over (${pct(oPct)})`,
      };
    }
    if (voice === "analytical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Run-rate puts full-year IT at ${fmt(fy)} against a ${fmt(fyB)} budget — ${fmt(over)} unfavorable (${pct(oPct)}). ${top} is the primary driver. At the current MoM trajectory, the gap doesn't close without an active intervention in Q3.`,
        followUp: `Want the scenario model or the BU-level forecast build?`,
        keyPoint: `FY2026 run-rate: ${fmt(fy)} vs ${fmt(fyB)} — ${fmt(over)} over | top driver: ${top}`,
      };
    }
    if (voice === "technical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Technology spend is on track for a ${fmt(over)} overrun at year-end — ${fmt(fy)} against a ${fmt(fyB)} plan. The cloud acceleration in H2 (ML inference layer) isn't yet in that number, which means the gap could widen. The AWS EDP renewal is the single biggest lever to close it.`,
        followUp: `Want the cloud trajectory model with and without the H2 ML workload?`,
        keyPoint: `FY2026: ${fmt(fy)} vs ${fmt(fyB)} — ${fmt(over)} over; H2 ML spend not yet in plan`,
      };
    }
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `At current pace, spend lands at ${fmt(fy)} for the year against a ${fmt(fyB)} budget — ${fmt(over)} over (${pct(oPct)}). ${top} is driving most of that gap.`,
      followUp: `Want the monthly run-rate model or a breakdown by category?`,
      keyPoint: `FY2026 projection: ${fmt(fy)} vs ${fmt(fyB)} — ${fmt(over)} over`,
    };
  }

  // ── cloud_spend ─────────────────────────────────────────────────────────────
  if (raw.domain === "cloud_spend") {
    const cYTD   = d.cloudYTD as number;
    const cBudg  = d.cloudBudget as number;
    const cVPct  = d.cloudVariancePct as number;
    const cMoM   = d.cloudMoMGrowth as number;
    const prov   = d.topProviderName as string;
    const projOR = d.projYearOverrun as number;

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Cloud is the primary financial risk — ${pct(cVPct)} over budget YTD at ${fmt(cYTD)}, with a ${pct(cMoM)} MoM growth rate that isn't decelerating. At this trajectory the full-year cloud overrun reaches ${fmt(projOR)} — a Board-level disclosure item if it carries into Q3 without FinOps intervention.`,
        followUp: `Want the FinOps intervention scenarios and their budget impact?`,
        keyPoint: `Cloud: ${fmt(cYTD)} YTD — ${pct(cVPct)} over budget, ${pct(cMoM)} MoM growth`,
      };
    }
    if (voice === "analytical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Cloud is ${pct(cVPct)} over budget through ${s.periodLabel} — ${fmt(cYTD)} vs ${fmt(cBudg)} plan. ${prov} is the largest contributor. At ${pct(cMoM)} month-over-month growth, the full-year cloud gap projects to ${fmt(projOR)} without a spend control.`,
        followUp: `Want the cloud variance broken down by provider or workload?`,
        keyPoint: `Cloud: ${pct(cVPct)} over budget | ${pct(cMoM)} MoM growth | projected FY overrun: ${fmt(projOR)}`,
      };
    }
    if (voice === "technical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Cloud spend is ${pct(cVPct)} over budget and still accelerating — ${pct(cMoM)} MoM growth. ${prov} is the primary driver, mostly EC2 and the Vertex AI training runs. The AWS EDP renewal is the most direct lever; without it, the cost trajectory compounds into H2 when the ML inference workload scales.`,
        followUp: `Want the cloud cost breakdown by workload or the FinOps optimization scenarios?`,
        keyPoint: `Cloud: ${fmt(cYTD)} YTD, ${pct(cVPct)} over budget — ${prov} primary driver, MoM accelerating`,
      };
    }
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `Cloud spend is ${pct(cVPct)} over budget YTD — ${fmt(cYTD)} against a ${fmt(cBudg)} plan, with ${pct(cMoM)} month-over-month growth. ${prov} is the largest contributor.`,
      followUp: `Want the cloud breakdown by provider or workload type?`,
      keyPoint: `Cloud YTD: ${fmt(cYTD)} — ${pct(cVPct)} over budget`,
    };
  }

  // ── contractor_compliance ───────────────────────────────────────────────────
  if (raw.domain === "contractor_compliance") {
    const cnt    = d.overCount as number;
    const excess = d.totalExcess as number;
    const worst  = d.worstName as string;
    const wBU    = d.worstBU as string;
    const wEx    = d.worstExcess as number;
    const ending = d.endingSoonCount as number;

    const endNote = ending > 0 ? ` ${ending} engagement${ending > 1 ? "s" : ""} also end within 60 days — extension decisions pending.` : "";

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${cnt} contractor${cnt > 1 ? "s are" : " is"} tracking ${fmt(excess)} above approved SOW budgets — each representing an unapproved financial commitment that needs a PO amendment before Q2 close.${endNote}`,
        followUp: `Want the SOW compliance report with amendment prioritization?`,
        keyPoint: `${cnt} contractors over SOW — ${fmt(excess)} in unapproved excess spend`,
      };
    }
    if (voice === "analytical") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${cnt} contractor${cnt > 1 ? "s are" : " is"} over approved SOW budgets — combined excess of ${fmt(excess)}. ${worst} (${wBU}) has the largest overrun at ${fmt(wEx)} over budget.${endNote}`,
        followUp: `Want the full SOW compliance breakdown with run-rate projections?`,
        keyPoint: `${cnt} contractors over SOW: ${fmt(excess)} excess | largest: ${worst} (+${fmt(wEx)})`,
      };
    }
    if (voice === "operational_labor") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `${cnt} active engagement${cnt > 1 ? "s have" : " has"} exceeded the approved SOW — ${fmt(excess)} in unapproved spend. ${worst} in ${wBU} is the largest at ${fmt(wEx)} over, and the engagement runs through Q3.${endNote}`,
        followUp: `Want the SOW amendment queue or the burn-rate projections?`,
        keyPoint: `${cnt} over-SOW contractors — ${fmt(excess)} excess | ${worst} +${fmt(wEx)}`,
      };
    }
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `${cnt} contractor${cnt > 1 ? "s are" : " is"} over approved SOW budgets by a combined ${fmt(excess)}. ${worst} (${wBU}) has the largest overrun.${endNote}`,
      followUp: `Want to see the over-budget details or extension decision timeline?`,
      keyPoint: `${cnt} over-SOW: ${fmt(excess)} excess | action required before Q2 close`,
    };
  }

  // ── headcount_gaps ──────────────────────────────────────────────────────────
  if (raw.domain === "headcount_gaps") {
    const filled  = d.filled as number;
    const total   = d.total as number;
    const open    = d.open as number;
    const rate    = d.fillRate as number;
    const wBU     = d.worstBUName as string;
    const wFilled = d.worstBUFilled as number;
    const wTotal  = d.worstBUTotal as number;
    const atRisk  = d.salaryAtRisk as number;

    if (voice === "strategic") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `IT headcount is ${(rate * 100).toFixed(0)}% filled — ${filled} of ${total} approved positions active, ${open} open reqs. ${wBU} has the lowest fill rate at ${wFilled}/${wTotal}. The ${open} open reqs represent ${fmt(atRisk)} in unused salary budget that is currently being backfilled by contractors at a 35–40% cost premium.`,
        followUp: `Want the open req prioritization or headcount plan vs. contractor cost analysis?`,
        keyPoint: `Fill rate: ${(rate * 100).toFixed(0)}% — ${open} open reqs | ${wBU} most critical gap`,
      };
    }
    if (voice === "operational_workforce") {
      return {
        domain: raw.domain, materiality: raw.materiality,
        sentence: `Fill rate is ${(rate * 100).toFixed(0)}% — ${filled} filled out of ${total} approved positions, ${open} open reqs in process. ${wBU} has the worst gap at ${wFilled} of ${wTotal} filled. The ${open} open reqs carry ${fmt(atRisk)} of salary budget exposure, and most are being bridged by contractors.`,
        followUp: `Want the open req breakdown by BU or the hiring timeline?`,
        keyPoint: `Fill rate: ${(rate * 100).toFixed(0)}% | ${open} open reqs | ${wBU}: ${wFilled}/${wTotal}`,
      };
    }
    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `Headcount is ${(rate * 100).toFixed(0)}% filled — ${open} open requisitions, ${fmt(atRisk)} in salary budget at risk. ${wBU} has the widest gap at ${wFilled} of ${wTotal}.`,
      followUp: `Want the open req detail by business unit?`,
      keyPoint: `Fill rate: ${(rate * 100).toFixed(0)}% — ${open} open reqs | ${wBU} most critical`,
    };
  }

  // ── vendor_concentration ────────────────────────────────────────────────────
  if (raw.domain === "vendor_concentration") {
    const top3  = d.top3spend as number;
    const total = d.total as number;
    const cPct  = d.conPct as number;
    const hrCnt = d.highRiskCount as number;
    const hrVal = d.highRiskValue as number;

    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `Top 3 vendors represent ${pct(cPct)} of the ${fmt(total)} total IT vendor commitment — ${hrCnt} vendor${hrCnt !== 1 ? "s are" : " is"} rated high-risk with ${fmt(hrVal)} in combined annual value.`,
      followUp: `Want the full vendor concentration analysis or risk-scoring breakdown?`,
      keyPoint: `Vendor concentration: ${pct(cPct)} in top 3 | ${hrCnt} high-risk vendors (${fmt(hrVal)})`,
    };
  }

  // ── labor_efficiency ────────────────────────────────────────────────────────
  if (raw.domain === "labor_efficiency") {
    const laborYTD = d.laborYTD as number;
    const cPct     = d.contractorPct as number;
    const openFTE  = d.openFTEReqs as number;

    return {
      domain: raw.domain, materiality: raw.materiality,
      sentence: `External labor is ${pct(cPct)} of total IT spend — above the <10% best-practice target. ${openFTE} open FTE reqs are being bridged by contractors at a 35–40% cost premium. Converting even 3 of those to FTE would take ${fmt(laborYTD * 0.08)} off the annual run rate.`,
      followUp: `Want the FTE conversion economics for the longest-running contractor engagements?`,
      keyPoint: `Contractor mix: ${pct(cPct)} of IT spend — ${openFTE} open FTE reqs driving dependency`,
    };
  }

  // Fallback (should never reach here)
  return {
    domain:      raw.domain,
    materiality: raw.materiality,
    sentence:    "I don't have enough data to generate a specific insight for this area right now.",
    followUp:    "Want me to run a full financial summary instead?",
    keyPoint:    "Insufficient data for this domain",
  };
}

// ─── Response assembler ───────────────────────────────────────────────────────

function noSignificantFindings(s: FinanceSnapshot): AgentResponse {
  const fmt = s.fmt;
  return {
    answer: `All key metrics are within acceptable ranges through ${s.periodLabel}. YTD spend is ${fmt(s.ytdActual)} — ${fmt(Math.abs(s.ytdVariance))} ${s.ytdVariance >= 0 ? "over" : "under"} the ${fmt(s.ytdBudget)} budget (${s.pct(Math.abs(s.ytdVariancePct))}), which is within normal tracking bands. No contracts expiring within the critical window and no SOW compliance issues flagged.`,
    keyPoints: [`YTD: ${fmt(s.ytdActual)} vs ${fmt(s.ytdBudget)} — within acceptable range`],
    riskFlags: [],
    actions: [],
  };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function buildRoleAnalysisResponse(ctx: ConversationContext): AgentResponse {
  const { agentId, snapshot: s } = ctx;
  const perspective = ROLE_PERSPECTIVES[agentId] ?? ROLE_PERSPECTIVES["cfo"];
  const voice       = perspective.voice;
  const t           = perspective.thresholds;

  // Run all detectors
  const allRaw: (RawFinding | null)[] = [
    detectVendorUrgency(s, t.contractDaysUrgent),
    detectBudgetVariance(s, t.budgetVariancePct),
    detectForecastTrajectory(s, t.forecastOverrunPct),
    detectCloudSpend(s, t.cloudVariancePct),
    detectContractorCompliance(s, t.laborOverrunPct),
    detectHeadcountGap(s, t.fillRateGap),
    detectVendorConcentration(s),
    detectLaborEfficiency(s),
  ];

  // Score and sort by agent's priority order
  const priorityScore = (domain: AnalysisDomain) => {
    const idx = perspective.analysisPriorities.indexOf(domain);
    return idx === -1 ? 0 : (perspective.analysisPriorities.length - idx) * 10;
  };

  const ranked = allRaw
    .filter((r): r is RawFinding => r !== null)
    .map(r => ({
      raw:   r,
      score: r.materiality + priorityScore(r.domain),
    }))
    .sort((a, b) => b.score - a.score);

  // Promote question-relevant domain to position 0.
  // The question determines what gets answered first; the role determines how.
  const { intent } = classifyIntent(ctx.question);
  const preferredDomain = INTENT_TO_DOMAIN[intent];
  if (preferredDomain) {
    const preferredIdx = ranked.findIndex(r => r.raw.domain === preferredDomain);
    if (preferredIdx > 0) {
      const [preferred] = ranked.splice(preferredIdx, 1);
      ranked.unshift(preferred);
    }
  }

  if (ranked.length === 0) {
    return noSignificantFindings(s);
  }

  const primary   = frameFinding(ranked[0].raw, agentId, voice, s);
  const secondary = ranked[1] ? frameFinding(ranked[1].raw, agentId, voice, s) : null;

  const answerParts: string[] = [primary.sentence];

  // Add a secondary observation only if it's a different domain and reasonably material
  if (secondary && secondary.domain !== primary.domain && ranked[1].raw.materiality >= 30) {
    // Trim the secondary sentence to just its core claim (remove follow-up from secondary)
    const secondaryCore = secondary.sentence.replace(/ Want .*\?$/, "");
    answerParts.push(secondaryCore);
  }

  answerParts.push(primary.followUp);

  const keyPoints = [primary.keyPoint];
  if (secondary && secondary.domain !== primary.domain) {
    keyPoints.push(secondary.keyPoint);
  }

  return {
    answer:     answerParts.join(" "),
    keyPoints,
    riskFlags:  [],
    actions:    [],
  };
}
