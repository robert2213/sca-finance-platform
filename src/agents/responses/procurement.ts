/**
 * Procurement Agent — Response Library
 *
 * Handles: Contract pipeline, vendor risk, spend concentration,
 * renewal strategy, negotiation tactics, and sourcing analysis.
 */

import type { AgentResponse } from "@/types/finance";
import type { ConversationContext } from "../agentEngine";
import { buildDefaultAnswer } from "./buildDefaultAnswer";

type Route = {
  key: string;
  keywords: string[];
  negatives?: string[];
  weight: number;
  handler: (ctx: ConversationContext) => AgentResponse;
};

export const procurementResponses: Route[] = [

  // ── 1. Contract expiry / renewal pipeline ──────────────────────────────────
  {
    key: "contracts-expiry",
    keywords: [
      "expir", "renew", "contract", "pipeline", "upcoming", "due",
      "next 6 months", "next 90 days", "soon", "ending",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, dt, daysUntil } = s;
      const exp90  = s.expiringVendors90;
      const exp180 = s.expiringVendors180;
      const warningOnly = exp180.filter(v => !exp90.find(c => c.id === v.id));

      if (ctx.outputMode === 'question_answering') {
        const noAutoRenew = exp90.filter(v => !v.autoRenew);
        return {
          answer: `${exp90.length} contract${exp90.length === 1 ? '' : 's'} expiring within 90 days — ${noAutoRenew.length > 0 ? noAutoRenew.map(v => v.name).join(', ') + ' have no auto-renew and need manual action' : 'all have auto-renew'}. AWS is most urgent: expires in ${daysUntil('2026-06-30')} days (${fmt(s.topVendors.find(v => v.name.includes('Amazon'))?.annualValue ?? 4_560_000)}/yr) — the EDP negotiation window closes then. Want the full renewal pipeline?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Contract Renewal Pipeline — ${s.periodLabel}**

**${exp90.length} contracts expiring within 90 days (CRITICAL)**
${exp90.map(v => `🔴 **${v.name}**
   - Expires: ${dt(v.contractEnd)} (${daysUntil(v.contractEnd)} days)
   - Annual Value: ${fmt(v.annualValue)}
   - Remaining Commitment: ${fmt(v.remainingCommitment)}
   - Auto-Renew: ${v.autoRenew ? "✓ Yes" : "✗ No — MANUAL ACTION REQUIRED"}
   - Risk Level: ${v.riskLevel}`).join("\n\n")}

**${warningOnly.length} contracts expiring in 90–180 days (WARNING)**
${warningOnly.map(v => `🟡 **${v.name}**
   - Expires: ${dt(v.contractEnd)} (${daysUntil(v.contractEnd)} days)
   - Annual Value: ${fmt(v.annualValue)}
   - Auto-Renew: ${v.autoRenew ? "✓ Yes" : "✗ No"}`).join("\n\n")}

**Renewal Priority Assessment**
The most urgent action is the **AWS renewal** expiring June 30. This is not merely a contract renewal — it is an opportunity to negotiate a 3-year Enterprise Discount Program (EDP) that could reduce AWS spend by 12–18% annually. AWS will not offer EDP pricing post-expiration; this window closes in ${daysUntil("2026-06-30")} days.

Second priority: **Deloitte ERP engagement** ending July 31. Ensure all project deliverables are formally accepted before the final invoice is processed. Uncompleted deliverables = unrecoverable spend.

Third: **ServiceNow + Okta** both expire August 31. Consider bundled negotiation — these vendors have overlapping account management and may offer cross-product discounts.`,
        keyPoints: [
          `${exp90.length} contracts expiring within 90 days — ${exp90.filter(v => !v.autoRenew).length} without auto-renew (manual action required)`,
          `AWS (${daysUntil("2026-06-30")} days) = highest priority — EDP negotiation window closing`,
          "Deloitte ERP ends July 31 — deliverable acceptance must precede final invoice",
          "ServiceNow + Okta both August 31 — bundled negotiation opportunity",
          `Total annual value at risk in next 180 days: ${fmt(exp180.reduce((s, v) => s + v.annualValue, 0))}`,
        ],
        riskFlags: [],
        actions: exp90.filter(v => !v.autoRenew).map((v, i) => ({
          id: `PROC-EXP${i + 1}`,
          priority: "High" as const,
          title: `Initiate renewal: ${v.name}`,
          description: `${daysUntil(v.contractEnd)} days remaining — no auto-renew. Begin negotiation immediately.`,
          owner: "Procurement",
          dueDate: v.contractEnd,
        })),
      };
    },
  },

  // ── 2. Vendor concentration risk ──────────────────────────────────────────
  {
    key: "concentration",
    keywords: [
      "concentration", "dependency", "single vendor", "diversif", "over-reliant",
      "reliance", "too much", "aws reliance", "vendor risk", "spread",
    ],
    weight: 8,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;
      const totalSpend = s.vendorYTDSpend;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `AWS is your biggest concentration risk at ~31% of total vendor spend — above the recommended 25% cap. Combined cloud (AWS + Azure + GCP) is 56% of vendor spend. Accenture + Deloitte combined are ${fmt(2_760_000)} in annual commitments (22%) and both expire within 6 months. Top 5 vendors account for 68% of total. Want the full concentration analysis?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Vendor Spend Concentration Analysis — ${s.periodLabel}**

**Total YTD Vendor Spend**: ${fmt(totalSpend)}
**Annual Vendor Commitment**: ${fmt(s.vendorCommitment)}

**Top 5 Vendors by YTD Spend**
${s.topVendors.map((v, i) => {
  const sharePct = totalSpend > 0 ? v.ytdSpend / totalSpend : 0;
  return `${i + 1}. **${v.name}**: ${fmt(v.ytdSpend)} (${pct(sharePct)} of total) — ${v.riskLevel} risk`;
}).join("\n")}

**Concentration Risk Assessment**

**High Concentration (>25% single vendor)**: AWS represents approximately 31% of total IT vendor spend at ${fmt(s.topVendors.find(v => v.name.includes("Amazon"))?.ytdSpend ?? 1_995_000)} YTD. This is above the recommended threshold of 25% for any single vendor. The risk is amplified by the June 30 contract expiry with no auto-renew.

**Cloud Provider Concentration**: Combined cloud (AWS + Azure + GCP) represents 56% of total vendor spend. While multi-cloud diversification exists, AWS dominates at 51% of cloud spend. Azure and GCP are in use but neither has sufficient scale to serve as primary failover.

**Professional Services Concentration**: Accenture + Deloitte represent ${fmt(2_760_000)} in annual commitments. Combined, they are the 3rd-largest vendor relationship by spend. Both contracts expire within 6 months.

**Mitigation Recommendations**
1. Enforce a 25% single-vendor spend cap as a procurement policy
2. Accelerate GCP/Azure workload migration to reduce AWS dependency to <40%
3. Establish a preferred vendor panel to distribute PS spend across 3–4 firms
4. Require auto-renew or 120-day notice periods for all contracts >$500K`,
        keyPoints: [
          `AWS = 31% of total vendor spend — above recommended 25% concentration threshold`,
          `Cloud providers combined = 56% of vendor spend — multi-cloud helps but AWS still dominates`,
          `Accenture + Deloitte = ${fmt(2_760_000)} combined PS commitment — 6-month renewal window`,
          "Top 5 vendors = 68% of total spend — portfolio is concentrated",
          "Recommend 25% single-vendor cap as a formal procurement policy",
        ],
        riskFlags: [],
        actions: [
          { id: "PROC-C1", priority: "High", title: "Negotiate AWS multi-year EDP", description: "Reduce AWS concentration risk while locking in pricing certainty for 3 years", owner: "Procurement + CIO + CFO", dueDate: "2026-06-15" },
          { id: "PROC-C2", priority: "Medium", title: "Define PS panel — reduce Deloitte/Accenture dependency", description: "Identify 2 alternative PS firms for FY2027 engagements", owner: "Procurement + EA", dueDate: "2026-09-01" },
          { id: "PROC-C3", priority: "Low", title: "Implement 25% single-vendor spend cap policy", description: "Formalize as procurement governance standard for FY2027", owner: "CPO + IT Finance", dueDate: "2026-10-01" },
        ],
      };
    },
  },

  // ── 3. Negotiation strategy ────────────────────────────────────────────────
  {
    key: "negotiation",
    keywords: [
      "negotiat", "discount", "leverage", "edp", "commit", "pricing",
      "how do i negotiate", "negotiation strategy", "terms", "deal",
    ],
    weight: 9,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt } = s;
      const awsAnnualValue = s.topVendors.find(v => v.name.includes("Amazon"))?.annualValue ?? 4_560_000;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `Three key renewals coming up — AWS (${s.daysUntil("2026-06-30")} days), ServiceNow and Okta (both Aug 31). AWS is the most valuable: multi-cloud leverage to push for a 3-year EDP at ~13% discount (~${fmt(awsAnnualValue * 0.13)}/yr savings). ServiceNow: get a competitive quote even if you're not serious — resets their confidence. Okta: push for contractor user tier pricing (50–60% of employee rate). Want the full negotiation playbook?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Vendor Negotiation Strategy — Key Upcoming Renewals**

**1. AWS (Expires June 30) — Enterprise Discount Program (EDP)**

*Our Position*: We spend ${fmt(awsAnnualValue)}/year. We have active GCP and Azure relationships. This gives us credible multi-cloud leverage.

*Target*: 3-year EDP commitment at ${fmt(awsAnnualValue * 0.87)}/year (13% discount).

*Tactics*:
- Bring GCP migration proposal to the table — AWS will defend share aggressively
- Request minimum commitment tier pricing instead of on-demand rate card
- Negotiate Reserved Instance credits as part of EDP package
- Push for committed use flexibility (allow swapping instance types annually)

*Walk-Away Position*: Month-to-month at current rates for 60 days while GCP migration accelerates. AWS knows this is expensive for us; they'll deal.

**2. ServiceNow (Expires August 31)**

*Our Position*: We have 3 years of implementation history. Switching cost is very high. ServiceNow knows this.

*Target*: 2-year renewal with 8% price reduction + additional modules at no incremental cost.

*Tactics*:
- Obtain competitive ITSM quote (Freshservice or Jira Service Mgmt) — even if not serious
- Request customer success manager upgrade to reduce TCO
- Bundle next year's user growth into the renewal commitment at locked pricing

**3. Okta (Expires August 31)**

*Our Position*: IAM Architect vacancy makes it difficult to justify major platform migration. Okta knows retention is likely.

*Target*: Flat renewal with free tier expansion for contractors (currently paying full user price).

*Tactics*:
- Leverage pending IAM Architect hire as reason to defer advanced features
- Request contractor/external user pricing tier (50–60% of employee rate)`,
        keyPoints: [
          "AWS: multi-cloud leverage is your best card — credibly reference GCP migration",
          `Target 13% AWS EDP discount on ${fmt(awsAnnualValue)} commitment = ${fmt(awsAnnualValue * 0.13)} annual savings`,
          "ServiceNow: get competitive quote even if not serious — resets their confidence",
          "Okta: push for contractor user tier pricing — could save $40–60K",
          "All three should be negotiated in parallel — June/July window is optimal",
        ],
        riskFlags: [],
        actions: [
          { id: "PROC-N1", priority: "High", title: "AWS EDP negotiation — executive escalation", description: "Assign Procurement lead + CIO sponsorship; initiate AWS account team meeting", owner: "CPO + CIO", dueDate: "2026-06-10" },
          { id: "PROC-N2", priority: "Medium", title: "ServiceNow competitive quote", description: "Request Freshservice/Jira demo for leverage — 30-day timeline", owner: "Procurement + IT Ops", dueDate: "2026-07-01" },
          { id: "PROC-N3", priority: "Medium", title: "Okta contractor user tier negotiation", description: "Push for external user pricing — target 55% of employee rate", owner: "Procurement + Security", dueDate: "2026-07-15" },
        ],
      };
    },
  },

  // ── 4. Vendor spend overview ───────────────────────────────────────────────
  {
    key: "spend-overview",
    keywords: [
      "vendor spend", "spend overview", "how much are we spending", "vendor portfolio",
      "total spend", "commitment", "portfolio", "contracts overview",
    ],
    weight: 6,
    handler(ctx) {
      const { snapshot: s } = ctx;
      const { fmt, pct } = s;

      if (ctx.outputMode === 'question_answering') {
        return {
          answer: `12 active contracts, ${fmt(s.vendorCommitment)} annual commitment, ${fmt(s.vendorYTDSpend)} spent YTD. ${s.expiringVendors180.length} contracts expiring within 180 days — ${s.expiringVendors180.filter(v => !v.autoRenew).length} without auto-renew. Cloud = 56% of commitment, professional services = 22%. AWS expires in ${s.daysUntil("2026-06-30")} days. Want the full portfolio breakdown or the expiry pipeline?`,
          keyPoints: [],
          riskFlags: [],
          actions: [],
        };
      }

      return {
        answer: `**Vendor Portfolio Overview — ${s.periodLabel}**

**Portfolio Summary**
- Active contracts: **${s.topVendors.length + 7}** (12 total)
- Annual commitment: **${fmt(s.vendorCommitment)}**
- YTD spend: **${fmt(s.vendorYTDSpend)}** (${pct(s.vendorYTDSpend / s.vendorCommitment * 2)} of semi-annual budget)
- Expiring in 180 days: **${s.expiringVendors180.length}** contracts (${s.expiringVendors180.filter(v => !v.autoRenew).length} without auto-renew)
- High-risk vendors: **${s.highRiskVendors.length}**

**By Category**
- Cloud Infrastructure (AWS, Azure, GCP): ~56% of total commitment
- Software & SaaS (SNOW, Salesforce, Workday, Okta): ~22%
- Professional Services (Accenture, Deloitte): ~22%
- Hardware & Telecom (Cisco): ~6%

**Vendors Requiring Immediate Attention**
${s.expiringVendors90.map(v => `⚠️ ${v.name} — expires ${v.contractEnd} (${s.daysUntil(v.contractEnd)}d)`).join("\n")}

**Upcoming Renewals — Estimated Annual Value**
${s.expiringVendors180.slice(0, 5).map(v => `- ${v.name}: ${fmt(v.annualValue)}/year`).join("\n")}`,
        keyPoints: [
          `12 active contracts | ${fmt(s.vendorCommitment)} annual commitment | ${fmt(s.vendorYTDSpend)} YTD`,
          `${s.expiringVendors180.length} contracts expiring within 180 days — ${s.expiringVendors180.filter(v => !v.autoRenew).length} require manual action`,
          "Cloud = 56% of vendor spend — most critical category for cost optimization",
          `${s.highRiskVendors.length} high-risk vendors with ${fmt(s.highRiskVendors.reduce((t, v) => t + v.annualValue, 0))} in commitments`,
          "Professional services = 22% — Accenture + Deloitte both expiring in 6 months",
        ],
        riskFlags: [],
        actions: [
          { id: "PROC-SO1", priority: "High", title: "Build Q3 contract renewal calendar", description: "Assign owners and deadlines for all 6 expiring contracts", owner: "Procurement", dueDate: "2026-06-15" },
        ],
      };
    },
  },

  // ── 5. Default ────────────────────────────────────────────────────────────
  {
    key: "default",
    keywords: [],
    weight: 0,
    handler(ctx) { return buildDefaultAnswer(ctx); },
  },
];
