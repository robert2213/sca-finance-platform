/**
 * system-prompt.builder.ts
 *
 * Builds intent-aware system prompts from AgentContext + live FinanceSnapshot.
 *
 * CRITICAL DESIGN PRINCIPLE:
 *   The user's exact question drives what the prompt instructs Claude to do.
 *   Claude's default behavior is to answer the specific question, NOT to
 *   generate a comprehensive monthly summary for every request.
 *
 * Pipeline:
 *   1. classifyIntent(question)      → detect what the user actually wants
 *   2. buildDataBlock(intent)        → include ONLY the relevant data sections
 *   3. buildSystemPrompt(...)        → assemble with question directive at top
 */

import type { FinanceSnapshot } from "@/agents/dataContext";
import { getAgentContext }      from "@/lib/agents/agent.registry";
import { classifyIntent }       from "@/lib/ai/intent-classifier";
import type { ClassifiedIntent, DataSection } from "@/lib/ai/intent-classifier";
import type { AgentId }         from "@/types/finance";
import defaultConfig            from "@/config/client.config";
import { formatCurrency, formatPercent } from "@/lib/formatters";

function fmt(n: number) { return formatCurrency(n); }
function pct(n: number) { return formatPercent(n); }

// ─── Data block builder — scoped to intent ────────────────────────────────────

function buildDataBlock(
  snapshot:  FinanceSnapshot,
  agentId:   AgentId,
  sections:  DataSection[]
): string {
  const s          = snapshot;
  const clientName = defaultConfig.clientName;
  const parts: string[] = [];

  parts.push(`## FINANCIAL DATA — ${clientName} | ${s.periodLabel}`);

  // ── Core financials ──────────────────────────────────────────────────────
  if (sections.includes("core")) {
    parts.push(`### YTD Performance
- YTD IT Spend:       ${fmt(s.ytdActual)}
- YTD Budget:         ${fmt(s.ytdBudget)}
- YTD Variance:       ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — ${s.ytdVariance > 0 ? "UNFAVORABLE" : "FAVORABLE"}
- Full-Year Forecast: ${fmt(s.fullYearForecast)} vs Budget ${fmt(s.fullYearBudget)}
- Current Month:      ${s.currentMonth.month} — Actual ${fmt(s.currentMonth.actual)} vs Budget ${fmt(s.currentMonth.budget)}
- Prior Month:        ${s.priorMonth.month} — Actual ${fmt(s.priorMonth.actual)} vs Budget ${fmt(s.priorMonth.budget)}
- MoM Growth:         ${pct(s.momGrowthPct)}`);
  }

  // ── Business unit breakdown ──────────────────────────────────────────────
  if (sections.includes("business_units")) {
    const buLines = s.byBU.map(bu => {
      const v    = bu.budget > 0 ? ((bu.actual - bu.budget) / bu.budget) : 0;
      const flag = Math.abs(v) > 0.05 ? (v > 0 ? " ⚠ OVER" : " ✓ UNDER") : " — ON TRACK";
      return `- ${bu.bu.padEnd(22)} Actual: ${fmt(bu.actual).padStart(12)}  Budget: ${fmt(bu.budget).padStart(12)}  Variance: ${pct(v)}${flag}`;
    });
    parts.push(`### Business Unit Variance\n${buLines.join("\n")}`);
  }

  // ── Cloud ────────────────────────────────────────────────────────────────
  if (sections.includes("cloud")) {
    parts.push(`### Cloud Spend
- Cloud YTD:        ${fmt(s.cloudYTD)} vs Budget ${fmt(s.cloudBudget)} (${pct(s.cloudVariancePct)})
- MoM Cloud Growth: ${pct(s.cloudMoMGrowth)}
- By Provider:      ${s.cloudByProvider.map(p => `${p.provider}: ${fmt(p.ytdSpend)}`).join(" | ")}`);
  }

  // ── External Labor ───────────────────────────────────────────────────────
  if (sections.includes("external_labor")) {
    const contractorLines = s.overBudgetContractors.length > 0
      ? s.overBudgetContractors.map(c =>
          `  • ${c.name} (${c.businessUnit}): YTD ${fmt(c.ytdSpend)} vs Budget ${fmt(c.budget)}`
        ).join("\n")
      : "  • No over-budget contractors";

    parts.push(`### External Labor (Contractors)
- YTD Contractor Spend:      ${fmt(s.laborYTD)} vs Budget ${fmt(s.laborBudget)}
- Over-Budget Engagements:   ${s.overBudgetContractors.length} (excess: ${fmt(s.totalExcessLabor)})
- Ending Within 60 Days:     ${s.endingSoonContractors.length}
${contractorLines}`);
  }

  // ── Vendors ──────────────────────────────────────────────────────────────
  if (sections.includes("vendors")) {
    const vendorLines = s.expiringVendors90.length > 0
      ? s.expiringVendors90.map(v =>
          `  • ${v.name}: expires ${v.contractEnd} | auto-renew: ${v.autoRenew ? "Yes" : "NO — ACTION REQUIRED"}`
        ).join("\n")
      : "  • No contracts expiring within 90 days";

    const topVendorLines = s.topVendors.length > 0
      ? s.topVendors.map(v =>
          `  • ${v.name}: YTD Spend ${fmt(v.ytdSpend)} | Annual Value ${fmt(v.annualValue)}`
        ).join("\n")
      : "";

    parts.push(`### Vendor Contracts
- Total Annual Commitment:  ${fmt(s.vendorCommitment)}
- YTD Vendor Spend:         ${fmt(s.vendorYTDSpend)}
- Expiring Within 90 Days:  ${s.expiringVendors90.length} contract(s)
- High-Risk Vendors:        ${s.highRiskVendors.length}
${vendorLines}
### Top Vendors by Spend
${topVendorLines}`);
  }

  // ── Headcount ────────────────────────────────────────────────────────────
  if (sections.includes("headcount")) {
    const hcBULines = s.hcByBU.map(bu => `  • ${bu.bu}: ${bu.filled}/${bu.total} filled`).join("\n");

    parts.push(`### Headcount
- Filled / Approved:     ${s.hcSummary.filled} / ${s.hcSummary.total} (${pct(s.fillRate)} fill rate)
- Open Requisitions:     ${s.openReqs.length}
- Annual Salary Budget:  ${fmt(s.salaryBudget)}
- Open Req Budget At Risk: ${fmt(s.openReqSalaryAtRisk)} (remaining months)
${hcBULines}`);
  }

  // ── Risk flags ───────────────────────────────────────────────────────────
  if (sections.includes("risks") && s.risks.length > 0) {
    const riskLines = s.risks.map(r =>
      `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`
    ).join("\n");
    parts.push(`### Active Risk Flags\n${riskLines}`);
  }

  return parts.join("\n\n");
}

// ─── Response format — intent-aware ──────────────────────────────────────────

function buildResponseFormat(intent: ClassifiedIntent): string {
  // For narrow questions (headcount, specific vendor, cost-center), relax the
  // minimum word count so Claude isn't forced to pad with irrelevant material.
  const isNarrow = [
    "HEADCOUNT_ANALYSIS",
    "PROCUREMENT_ANALYSIS",
    "COST_CENTER_ANALYSIS",
  ].includes(intent.intent);

  const answerLength = isNarrow
    ? "Be concise — match the length to the question. A specific factual question may need only 50–100 words."
    : "Be substantive — provide enough detail to be genuinely useful (typically 150–300 words for analytical questions).";

  return `## RESPONSE FORMAT (Required)
You MUST respond with valid JSON only. No text before or after the JSON object.

{
  "answer": "Your complete markdown response. Use **bold**, bullet points, numbered lists, and tables where appropriate. ${answerLength}",
  "keyPoints": [
    "Concise metric or insight (2-5 items maximum)",
    "Each must be a specific, data-grounded point"
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
  ],
  "confidence": "High",
  "dataCitations": [
    "Every specific number cited — include value and data source",
    "E.g.: 'YTD IT Spend: $12.4M (from fact_transactions, transaction_type=actual)'"
  ],
  "assumptions": [
    "Any inference beyond what the data explicitly states (0–3 items)"
  ],
  "missingData": [
    "Data gaps that reduce confidence or limit the analysis (0–3 items, empty [] if complete)"
  ]
}

Constraints:
- "keyPoints" must reference specific numbers from the data (2–5 items)
- "actions" should be concrete and relevant to the question asked (0–4 items)
- "confidence": "High" = all key data present and clear; "Medium" = partial data or ambiguous; "Low" = critical data missing
- "dataCitations": list every number you cite with its source field
- Never invent data not present in the Financial Data block above
- If data is missing or incomplete, state it explicitly in the answer AND in "missingData"`;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function buildSystemPrompt(
  agentId:  AgentId,
  snapshot: FinanceSnapshot,
  question: string = ""
): string {
  const ctx        = getAgentContext(agentId);
  const clientName = defaultConfig.clientName;

  // 1. Classify intent — this drives everything else
  const intent = classifyIntent(question);

  // 2. Build agent role block (keep responsibilities/rules, replace outputFormat)
  const roleBlock = ctx
    ? `# You are the ${ctx.role} for ${clientName}.

## Your Responsibilities
${ctx.responsibilities.map(r => `- ${r}`).join("\n")}

## Rules You Must Follow (Non-Negotiable)
${ctx.rules.map(r => `- ${r}`).join("\n")}

## Escalation — Flag These Explicitly
${ctx.escalationLogic.map(e => `- ${e}`).join("\n")}

## Output Guidance (for this question)
${intent.outputGuidance}`.trim()
    : `You are a senior AI finance advisor for ${clientName}.`;

  // 3. Question directive — injected FIRST so it overrides role defaults
  const questionDirective = question.trim()
    ? `# QUESTION DIRECTIVE — READ THIS FIRST

The user has asked: **"${question.trim()}"**

${intent.directive}

**Detected Intent: ${intent.intent}** (confidence: ${Math.round(intent.confidence * 100)}%)

Your ONLY task is to answer this specific question using the financial data below.
Do NOT generate a generic monthly executive summary unless the question explicitly requests one.
Do NOT add sections that are not relevant to what was asked.
If the question is specific and narrow, the answer should be specific and narrow.`
    : "";

  // 4. Scoped data block — only sections relevant to this question
  const dataBlock = buildDataBlock(snapshot, agentId, intent.dataSections);

  // 5. Response format (intent-aware length guidance)
  const responseFormat = buildResponseFormat(intent);

  // Assemble: directive first → role → data → format
  const parts = [questionDirective, roleBlock, dataBlock, responseFormat]
    .filter(Boolean);

  return parts.join("\n\n---\n\n");
}

// Re-export classifier for consumers (API route logging etc.)
export { classifyIntent };
export type { ClassifiedIntent };
