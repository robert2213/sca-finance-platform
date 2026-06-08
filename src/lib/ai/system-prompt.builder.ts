// Builds agent system prompts from AgentContext + live FinanceSnapshot data.
// This is what gets sent to Claude as the system prompt for every agent request.

import type { FinanceSnapshot } from "@/agents/dataContext";
import { getAgentContext } from "@/lib/agents/agent.registry";
import type { AgentId } from "@/types/finance";
import defaultConfig from "@/config/client.config";
import { formatCurrency, formatPercent } from "@/lib/formatters";

function fmt(n: number) { return formatCurrency(n); }
function pct(n: number) { return formatPercent(n); }

function buildDataBlock(snapshot: FinanceSnapshot, agentId: AgentId): string {
  const s = snapshot;
  const clientName = defaultConfig.clientName;

  // Core financials — always included
  const core = `
## FINANCIAL DATA — ${clientName} | ${s.periodLabel}

### YTD Performance
- YTD IT Spend:      ${fmt(s.ytdActual)}
- YTD Budget:        ${fmt(s.ytdBudget)}
- YTD Variance:      ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — ${s.ytdVariance > 0 ? "UNFAVORABLE" : "FAVORABLE"}
- Full-Year Forecast: ${fmt(s.fullYearForecast)} vs Budget ${fmt(s.fullYearBudget)}
- Current Month:     ${s.currentMonth.month} — Actual ${fmt(s.currentMonth.actual)} vs Budget ${fmt(s.currentMonth.budget)}
- Prior Month:       ${s.priorMonth.month} — Actual ${fmt(s.priorMonth.actual)}
- MoM Growth:        ${pct(s.momGrowthPct)}`.trim();

  // Business unit breakdown
  const buBlock = `
### Business Unit Variance
${s.byBU.map(bu => {
  const v = bu.budget > 0 ? ((bu.actual - bu.budget) / bu.budget) : 0;
  const flag = Math.abs(v) > 0.05 ? (v > 0 ? " ⚠ OVER" : " ✓ UNDER") : " — ON TRACK";
  return `- ${bu.bu.padEnd(22)} Actual: ${fmt(bu.actual).padStart(12)}  Budget: ${fmt(bu.budget).padStart(12)}  Variance: ${pct(v)}${flag}`;
}).join("\n")}`.trim();

  // Cloud
  const cloud = `
### Cloud Spend
- Cloud YTD:         ${fmt(s.cloudYTD)} vs Budget ${fmt(s.cloudBudget)} (${pct(s.cloudVariancePct)})
- MoM Cloud Growth:  ${pct(s.cloudMoMGrowth)}
- By Provider:       ${s.cloudByProvider.map(p => `${p.provider}: ${fmt(p.ytdSpend)}`).join(" | ")}`.trim();

  // External labor
  const labor = `
### External Labor (Contractors)
- YTD Contractor Spend: ${fmt(s.laborYTD)} vs Budget ${fmt(s.laborBudget)}
- Over-Budget Engagements: ${s.overBudgetContractors.length} (excess: ${fmt(s.totalExcessLabor)})
- Ending Within 60 Days: ${s.endingSoonContractors.length}
${s.overBudgetContractors.length > 0 ? s.overBudgetContractors.map(c =>
  `  • ${c.name} (${c.businessUnit}): YTD ${fmt(c.ytdSpend)} vs Budget ${fmt(c.budget)}`
).join("\n") : "  • No over-budget contractors"}`.trim();

  // Vendors
  const vendors = `
### Vendor Contracts
- Total Annual Commitment: ${fmt(s.vendorCommitment)}
- YTD Vendor Spend:       ${fmt(s.vendorYTDSpend)}
- Expiring Within 90 Days: ${s.expiringVendors90.length} contract(s)
- High-Risk Vendors:       ${s.highRiskVendors.length}
${s.expiringVendors90.length > 0 ? s.expiringVendors90.map(v =>
  `  • ${v.name}: expires ${v.contractEnd} | auto-renew: ${v.autoRenew ? "Yes" : "NO — ACTION REQUIRED"}`
).join("\n") : "  • No contracts expiring within 90 days"}`.trim();

  // Headcount
  const headcount = `
### Headcount
- Filled / Approved: ${s.hcSummary.filled} / ${s.hcSummary.total} (${pct(s.fillRate)} fill rate)
- Open Requisitions: ${s.openReqs.length}
- Annual Salary Budget: ${fmt(s.salaryBudget)}
- Open Req Budget At Risk: ${fmt(s.openReqSalaryAtRisk)} (remaining months)
${s.hcByBU.map(bu => `  • ${bu.bu}: ${bu.filled}/${bu.total} filled`).join("\n")}`.trim();

  // Risk flags
  const risks = s.risks.length > 0 ? `
### Active Risk Flags
${s.risks.map(r => `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`).join("\n")}`.trim() : "";

  // Compose based on agent domain
  const sections: string[] = [core, buBlock];

  if (["cfo", "fpa", "finance-bp", "validation"].includes(agentId)) {
    sections.push(cloud, labor, vendors, headcount, risks);
  } else if (agentId === "procurement") {
    sections.push(vendors, cloud, labor);
  } else if (agentId === "external-labor") {
    sections.push(labor, headcount);
  } else if (agentId === "headcount") {
    sections.push(headcount, labor);
  } else if (agentId === "cio") {
    sections.push(cloud, vendors, headcount, labor);
  } else {
    sections.push(cloud, labor, vendors, headcount, risks);
  }

  return sections.join("\n\n");
}

export function buildSystemPrompt(agentId: AgentId, snapshot: FinanceSnapshot): string {
  const ctx = getAgentContext(agentId);
  const clientName = defaultConfig.clientName;

  const roleBlock = ctx ? `
# You are the ${ctx.role} for ${clientName}.

## Your Responsibilities
${ctx.responsibilities.map(r => `- ${r}`).join("\n")}

## Rules You Must Follow (Non-Negotiable)
${ctx.rules.map(r => `- ${r}`).join("\n")}

## Escalation — Flag These Explicitly
${ctx.escalationLogic.map(e => `- ${e}`).join("\n")}

## Output Format
${ctx.outputFormat}
`.trim() : `You are a senior AI finance advisor for ${clientName}.`;

  const dataBlock = buildDataBlock(snapshot, agentId);

  const responseFormat = `
## RESPONSE FORMAT (Required)
You MUST respond with valid JSON only. No text before or after the JSON object.

{
  "answer": "Your complete markdown response. Use **bold**, bullet points, numbered lists, and tables where appropriate. Be specific — cite exact numbers from the data above.",
  "keyPoints": [
    "Concise metric or insight (3-5 items maximum)",
    "Each should be a specific, actionable data point"
  ],
  "actions": [
    {
      "id": "ACTION-1",
      "priority": "High",
      "title": "Short action title",
      "description": "What specifically needs to happen and why",
      "owner": "Who should own this action",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}

Constraints:
- "answer" must be substantive (200+ words for financial questions)
- "keyPoints" must reference specific numbers from the data
- "actions" should be concrete and finance-specific (0-4 items)
- Never invent data not present in the Financial Data block above
- If data is missing or incomplete, say so explicitly in the answer
`.trim();

  return [roleBlock, dataBlock, responseFormat].join("\n\n---\n\n");
}
