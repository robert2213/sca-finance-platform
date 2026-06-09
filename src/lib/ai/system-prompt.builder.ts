/**
 * system-prompt.builder.ts
 *
 * Builds intent-aware, temporally-scoped, question-type-aware system prompts.
 *
 * CRITICAL DESIGN PRINCIPLE:
 *   The user's exact question drives what the prompt instructs Claude to do.
 *   Claude's default behavior is to answer the specific question with the
 *   appropriate format and length — NOT to generate a report for every request.
 *
 * Pipeline:
 *   1. detectQuestionType(question)       → FACTUAL / ANALYTICAL / COMPARATIVE / SUMMARY / REPORT
 *   2. classifyIntent(question)           → detect what financial domain the user wants
 *   3. extractTemporalIntent(question)    → extract time scope ("June", "Q2", "FY2026")
 *   4. RESPONSE RULES injected (Section 2) — non-negotiable behavior constraints
 *   5. buildDataBlock(intent, temporal)   → include ONLY the relevant data sections,
 *                                           scoped to the requested time horizon
 *   6. buildResponseFormat(questionType)  → format/length instructions matching question complexity
 *   7. Few-shot examples                  → show Claude exactly what right looks like
 */

import type { FinanceSnapshot } from "@/agents/dataContext";
import { getAgentContext }      from "@/lib/agents/agent.registry";
import { classifyIntent }       from "@/lib/ai/intent-classifier";
import type { ClassifiedIntent, DataSection } from "@/lib/ai/intent-classifier";
import {
  extractTemporalIntent,
  describeTemporalScope,
  isFuturePeriod,
  MONTH_NAMES,
} from "@/lib/ai/temporal-intent";
import type { TemporalIntent } from "@/lib/ai/temporal-intent";
import { detectQuestionType }   from "@/lib/ai/response-mode-router";
import type { QuestionType }    from "@/lib/ai/response-mode-router";
import type { AgentId }         from "@/types/finance";
import defaultConfig            from "@/config/client.config";
import { formatCurrency, formatPercent } from "@/lib/formatters";

function fmt(n: number) { return formatCurrency(n); }
function pct(n: number) { return formatPercent(n); }

// Current YTD boundary: the last month in the dataset (May 2026 = month 5)
const YTD_CURRENT_MONTH_NUM  = 5;
const YTD_CURRENT_MONTH_NAME = "May";

// ─── Section 2: Response Rules — injected verbatim into every system prompt ───

const RESPONSE_RULES = `You are an experienced finance professional.
Answer the user's question directly.
Use the provided data.
Do not generate reports unless explicitly requested.
Do not generate executive summaries unless explicitly requested.
Do not add sections, headings, scorecards, methodology blocks, key takeaways, or recommendations unless requested.
Start with the answer.
Then provide supporting analysis.

Default response structure:
1. Direct Answer
2. Supporting Evidence
3. Analysis
4. Optional Recommendation (only if action is clearly warranted and the user asked for it)

## BEHAVIORAL CONSTRAINTS — NON-NEGOTIABLE

1. ANSWER THE QUESTION ASKED. Nothing else unless it directly serves the answer.

2. DO NOT produce sections the user did not request:
   - No "Key Takeaways" unless the user asked for a summary
   - No "Recommended Actions" unless the user asked for recommendations
   - No "Monthly Trend" unless the user asked about trends
   - No "Assessment" section unless the user asked for an assessment
   - No "Full-Year" data unless the user asked about full-year
   - No "YTD" data unless the user asked about YTD

3. MATCH RESPONSE LENGTH TO QUESTION COMPLEXITY:
   - Simple factual question → 1-3 sentences maximum
   - "What was May's actuals?" → one direct answer with one line of context
   - Analytical question → as long as needed to actually answer it
   - Explicit report or summary request → structured format is appropriate

4. DO NOT USE FORMATTED TABLES for simple factual answers.
   Tables are appropriate when the user asks to compare multiple things.
   A single question about one month does not need a table.

5. DO NOT USE HEADERS (## or bold section titles) in conversational responses.
   Headers are for documents and reports, not answers to direct questions.

6. THE TIME PERIOD IS BINDING.
   If the user asked about May, answer about May.
   Do not include January through April unless they help explain May.
   Do not include June through December.
   Do not include full-year unless explicitly asked.

7. NEVER PAD THE RESPONSE:
   No "Great question", no "As your FP&A agent", no "As your CFO advisor",
   no "It's important to note", no "In conclusion",
   no "Based on the data provided." Start with the answer.

8. IF DATA IS UNAVAILABLE, SAY SO DIRECTLY:
   "I don't have [specific data] available. I can show you [alternative]
   if that would help."
   Do not substitute different data silently.

9. ANTICIPATE ONE NATURAL FOLLOW-UP — MAXIMUM:
   After answering, you may offer one relevant next question.
   Do not offer a menu of options. One natural next step only.
   Example: "Want me to break that down by business unit?"
   Not: "I can also show you Q2 trends, full-year forecast, vendor analysis..."`;

// ─── Temporal-scoped core block ───────────────────────────────────────────────

function buildCoreBlock(snapshot: FinanceSnapshot, temporal: TemporalIntent): string {
  const s = snapshot;

  // ── Full-year scope ──────────────────────────────────────────────────────
  if (temporal.type === "full_year") {
    return `Full-Year Forecast (FY2026)
- Full-Year Forecast:  ${fmt(s.fullYearForecast)} vs Approved Budget ${fmt(s.fullYearBudget)}
- Projected Variance:  ${fmt(s.fullYearForecast - s.fullYearBudget)} (${pct((s.fullYearForecast - s.fullYearBudget) / s.fullYearBudget)}) ${s.fullYearForecast > s.fullYearBudget ? "UNFAVORABLE" : "FAVORABLE"}
- YTD Actuals (basis): ${fmt(s.ytdActual)} through ${YTD_CURRENT_MONTH_NAME} (run-rate extrapolated)
- YTD Variance:        ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — ${s.ytdVariance > 0 ? "UNFAVORABLE" : "FAVORABLE"}
- MoM Growth Trend:    ${pct(s.momGrowthPct)}`;
  }

  // ── YTD scope ────────────────────────────────────────────────────────────
  if (temporal.type === "ytd") {
    return `YTD Performance (Jan–${YTD_CURRENT_MONTH_NAME} 2026)
- YTD IT Spend:   ${fmt(s.ytdActual)}
- YTD Budget:     ${fmt(s.ytdBudget)}
- YTD Variance:   ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — ${s.ytdVariance > 0 ? "UNFAVORABLE" : "FAVORABLE"}
- MoM Growth:     ${pct(s.momGrowthPct)}`;
  }

  // ── Single-month scope ────────────────────────────────────────────────────
  if (temporal.type === "month" && temporal.startMonth !== null) {
    const reqMonth  = temporal.startMonth;
    const monthName = temporal.specific ?? MONTH_NAMES[reqMonth];

    const monthData = s.monthly.find(
      m => m.month.toLowerCase() === monthName.toLowerCase().slice(0, 3)
    );

    if (monthData) {
      const variance = monthData.actual - monthData.budget;
      return `${monthName} 2026
- Actual Spend: ${fmt(monthData.actual)}
- Budget:       ${fmt(monthData.budget)}
- Variance:     ${fmt(variance)} (${pct(variance / monthData.budget)}) — ${variance > 0 ? "UNFAVORABLE" : "FAVORABLE"}`;
    } else {
      const recentActuals  = s.monthly.slice(-3).map(m => m.actual);
      const avgRecent      = recentActuals.reduce((a, b) => a + b, 0) / recentActuals.length;
      const projectedMonthly  = avgRecent * (1 + s.momGrowthPct);
      const currentBudgetMonthly = s.ytdBudget / YTD_CURRENT_MONTH_NUM;

      return `${monthName} 2026 Forecast (FUTURE MONTH)
⚠ ${monthName} 2026 has not yet occurred — current data is through ${YTD_CURRENT_MONTH_NAME} 2026.
- Projected ${monthName} Spend: ~${fmt(projectedMonthly)} (based on recent 3-month average + MoM trend)
- Monthly Budget:              ~${fmt(currentBudgetMonthly)} (per approved plan)
- Projected Variance:          ~${fmt(projectedMonthly - currentBudgetMonthly)}
- Monthly MoM Trend:           ${pct(s.momGrowthPct)} (recent growth rate applied)
Monthly Actuals Through ${YTD_CURRENT_MONTH_NAME} (basis for projection):
${s.monthly.map(m => `  ${m.month}: Actual ${fmt(m.actual)} | Budget ${fmt(m.budget)}`).join("\n")}
YTD Summary (context):
- YTD Actual: ${fmt(s.ytdActual)} | Budget: ${fmt(s.ytdBudget)} | Variance: ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)})`;
    }
  }

  // ── Quarter / half scope ──────────────────────────────────────────────────
  if ((temporal.type === "quarter" || temporal.type === "half") &&
      temporal.startMonth !== null && temporal.endMonth !== null) {
    const label  = temporal.specific ?? "Quarter";
    const startM = temporal.startMonth;
    const endM   = temporal.endMonth;

    const monthOrder = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const inRange = s.monthly.filter(m => {
      const idx = monthOrder.indexOf(m.month) + 1;
      return idx >= startM && idx <= endM;
    });

    const futureMonths: string[] = [];
    for (let mn = YTD_CURRENT_MONTH_NUM + 1; mn <= endM; mn++) {
      futureMonths.push(MONTH_NAMES[mn] ?? monthOrder[mn - 1]);
    }

    const totalActual = inRange.reduce((s, m) => s + m.actual, 0);
    const totalBudget = inRange.reduce((s, m) => s + m.budget, 0);
    const variance    = totalActual - totalBudget;

    const historicalRows = inRange.length > 0
      ? inRange.map(m => `  ${m.month}: Actual ${fmt(m.actual)} | Budget ${fmt(m.budget)} | Var ${fmt(m.actual - m.budget)}`).join("\n")
      : "  No historical data available for this period";

    const futureNote = futureMonths.length > 0
      ? `\n⚠ Future months not yet available: ${futureMonths.join(", ")}\n- Projected monthly run-rate: ~${fmt(s.ytdActual / YTD_CURRENT_MONTH_NUM * (1 + s.momGrowthPct))}`
      : "";

    return `${label} FY2026
${historicalRows}${futureNote}

${inRange.length > 0 ? `${label} Subtotal (${inRange.length} of ${endM - startM + 1} months):
- Actual:   ${fmt(totalActual)}
- Budget:   ${fmt(totalBudget)}
- Variance: ${fmt(variance)} (${pct(totalBudget > 0 ? variance / totalBudget : 0)}) ${variance > 0 ? "UNFAVORABLE" : "FAVORABLE"}` : ""}`;
  }

  // ── Range scope ────────────────────────────────────────────────────────────
  if (temporal.type === "range" && temporal.startMonth !== null && temporal.endMonth !== null) {
    return buildCoreBlock(snapshot, { ...temporal, type: "quarter" });
  }

  // ── Unknown / no temporal scope — show standard YTD + full-year summary ──
  return `YTD Performance (Jan–${YTD_CURRENT_MONTH_NAME} 2026)
- YTD IT Spend:       ${fmt(s.ytdActual)}
- YTD Budget:         ${fmt(s.ytdBudget)}
- YTD Variance:       ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) — ${s.ytdVariance > 0 ? "UNFAVORABLE" : "FAVORABLE"}
- Full-Year Forecast: ${fmt(s.fullYearForecast)} vs Budget ${fmt(s.fullYearBudget)}
- Current Month:      ${s.currentMonth.month} — Actual ${fmt(s.currentMonth.actual)} vs Budget ${fmt(s.currentMonth.budget)}
- Prior Month:        ${s.priorMonth.month} — Actual ${fmt(s.priorMonth.actual)} vs Budget ${fmt(s.priorMonth.budget)}
- MoM Growth:         ${pct(s.momGrowthPct)}`;
}

// ─── Data block builder — scoped to intent + temporal horizon ─────────────────

function buildDataBlock(
  snapshot:  FinanceSnapshot,
  agentId:   AgentId,
  sections:  DataSection[],
  temporal:  TemporalIntent
): string {
  const s          = snapshot;
  const clientName = defaultConfig.clientName;
  const parts: string[] = [];

  parts.push(`FINANCIAL DATA | ${clientName} | ${s.periodLabel}`);

  if (sections.includes("core")) {
    parts.push(buildCoreBlock(snapshot, temporal));
  }

  if (sections.includes("business_units")) {
    const buLines = s.byBU.map(bu => {
      const v    = bu.budget > 0 ? ((bu.actual - bu.budget) / bu.budget) : 0;
      const flag = Math.abs(v) > 0.05 ? (v > 0 ? " ⚠ OVER" : " ✓ UNDER") : " — ON TRACK";
      return `- ${bu.bu.padEnd(22)} Actual: ${fmt(bu.actual).padStart(12)}  Budget: ${fmt(bu.budget).padStart(12)}  Variance: ${pct(v)}${flag}`;
    });
    parts.push(`Business Unit Variance\n${buLines.join("\n")}`);
  }

  if (sections.includes("cloud")) {
    parts.push(`Cloud Spend
- Cloud YTD:        ${fmt(s.cloudYTD)} vs Budget ${fmt(s.cloudBudget)} (${pct(s.cloudVariancePct)})
- MoM Cloud Growth: ${pct(s.cloudMoMGrowth)}
- By Provider:      ${s.cloudByProvider.map(p => `${p.provider}: ${fmt(p.ytdSpend)}`).join(" | ")}`);
  }

  if (sections.includes("external_labor")) {
    const contractorLines = s.overBudgetContractors.length > 0
      ? s.overBudgetContractors.map(c =>
          `  • ${c.name} (${c.businessUnit}): YTD ${fmt(c.ytdSpend)} vs Budget ${fmt(c.budget)}`
        ).join("\n")
      : "  • No over-budget contractors";

    parts.push(`External Labor (Contractors)
- YTD Contractor Spend:      ${fmt(s.laborYTD)} vs Budget ${fmt(s.laborBudget)}
- Over-Budget Engagements:   ${s.overBudgetContractors.length} (excess: ${fmt(s.totalExcessLabor)})
- Ending Within 60 Days:     ${s.endingSoonContractors.length}
${contractorLines}`);
  }

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

    parts.push(`Vendor Contracts
- Total Annual Commitment:  ${fmt(s.vendorCommitment)}
- YTD Vendor Spend:         ${fmt(s.vendorYTDSpend)}
- Expiring Within 90 Days:  ${s.expiringVendors90.length} contract(s)
- High-Risk Vendors:        ${s.highRiskVendors.length}
${vendorLines}
Top Vendors by Spend
${topVendorLines}`);
  }

  if (sections.includes("headcount")) {
    const hcBULines = s.hcByBU.map(bu => `  • ${bu.bu}: ${bu.filled}/${bu.total} filled`).join("\n");

    parts.push(`Headcount
- Filled / Approved:       ${s.hcSummary.filled} / ${s.hcSummary.total} (${pct(s.fillRate)} fill rate)
- Open Requisitions:       ${s.openReqs.length}
- Annual Salary Budget:    ${fmt(s.salaryBudget)}
- Open Req Budget At Risk: ${fmt(s.openReqSalaryAtRisk)} (remaining months)
${hcBULines}`);
  }

  if (sections.includes("risks") && s.risks.length > 0) {
    const riskLines = s.risks.map(r =>
      `- [${r.severity.toUpperCase()}] ${r.title}: ${r.description}`
    ).join("\n");
    parts.push(`Active Risk Flags\n${riskLines}`);
  }

  return parts.join("\n\n");
}

// ─── Response format — questionType-aware ─────────────────────────────────────

/**
 * Produces the response format instruction block, tuned to the question type.
 *
 * FACTUAL   → 1-3 sentences, no tables, no headers, empty keyPoints and actions
 * ANALYTICAL → paragraphs with data, no mandatory sections, tables only if comparing multiple things
 * COMPARATIVE → simple comparison, no report sections
 * SUMMARY   → structured response appropriate, all sections appropriate, scoped to period
 * REPORT    → full structured format, all sections, all fields
 */
function buildResponseFormat(questionType: QuestionType): string {
  const baseFormat = `You MUST respond with valid JSON only. No text before or after the JSON object.`;

  if (questionType === 'FACTUAL') {
    return `## RESPONSE FORMAT (Required)
${baseFormat}

{
  "answer": "1-3 sentences. Start with the direct answer — the number or fact asked for. One sentence of context only if it changes the meaning. One natural follow-up offer maximum. NO tables. NO headers (## or bold section titles). NO bullet lists. NO YTD data unless asked. NO full-year data unless asked.",
  "keyPoints": [],
  "riskFlags": [],
  "actions": [],
  "confidence": "High",
  "dataCitations": ["every number you cite, with source field"],
  "assumptions": [],
  "missingData": []
}

Constraints:
- keyPoints MUST be an empty array [] for factual questions
- actions MUST be an empty array [] for factual questions
- answer MUST be 1-3 sentences
- NO markdown tables in the answer
- NO bold section headers in the answer
- Never invent data not in the Financial Data block`;
  }

  if (questionType === 'ANALYTICAL') {
    return `## RESPONSE FORMAT (Required)
${baseFormat}

{
  "answer": "Conversational paragraphs. Name the specific drivers with dollar amounts. No headers or section titles. Tables only if you are comparing multiple items the user asked to compare. Length: as long as needed to genuinely answer — not longer. No unsolicited sections.",
  "keyPoints": ["2-3 data-grounded points that directly answer the question. Use [] if the answer is self-contained."],
  "riskFlags": [],
  "actions": [],
  "confidence": "High",
  "dataCitations": ["every number cited with source"],
  "assumptions": ["inferences beyond what the data explicitly states (0-2 items, empty [] if none)"],
  "missingData": ["data gaps that limit analysis (empty [] if none)"]
}

Constraints:
- actions MUST be [] unless the user explicitly asked for actions or recommendations
- keyPoints should be 0-3 items — skip if the answer is self-contained
- No bold section headers like "Assessment" or "Key Takeaways" or "Recommended Actions"
- Never invent data not in the Financial Data block`;
  }

  if (questionType === 'COMPARATIVE') {
    return `## RESPONSE FORMAT (Required)
${baseFormat}

{
  "answer": "Direct comparison of the two things asked about. Specific numbers for both sides. One or two sentences on what changed and why. A simple inline comparison is appropriate — a full report is not.",
  "keyPoints": ["1-3 comparison points with specific numbers"],
  "riskFlags": [],
  "actions": [],
  "confidence": "High",
  "dataCitations": ["every number cited with source"],
  "assumptions": [],
  "missingData": []
}

Constraints:
- actions MUST be []
- No unsolicited sections
- Never invent data not in the Financial Data block`;
  }

  if (questionType === 'SUMMARY') {
    return `## RESPONSE FORMAT (Required)
${baseFormat}

{
  "answer": "Structured response covering the period requested. Scoped tightly — do not add full-year data if a specific month was requested. Format: 2-3 short paragraphs covering (1) top-line result, (2) top 2-3 drivers, (3) one forward-looking observation. Headers are appropriate here since a summary was explicitly requested.",
  "keyPoints": ["3-5 specific, data-grounded insights from the requested period"],
  "riskFlags": [],
  "actions": ["0-2 concrete next steps directly relevant to the summary scope"],
  "confidence": "High",
  "dataCitations": ["every number cited with source"],
  "assumptions": ["inferences beyond explicit data (0-2 items)"],
  "missingData": []
}

Constraints:
- Scope tightly to the period requested — if user asked about May, do not include full-year unless it contextualizes May
- Never invent data not in the Financial Data block`;
  }

  // REPORT — full structured format appropriate
  return `## RESPONSE FORMAT (Required)
${baseFormat}

{
  "answer": "Full structured report for the requested period and scope. Use headers, tables, and organized sections. Cover: (1) Executive Summary (2-3 sentences), (2) Top variance drivers with dollar impact, (3) Period performance by category or BU, (4) Forecast risk or implications, (5) Recommended actions. Be substantive — this is a report request.",
  "keyPoints": ["4-5 specific, data-grounded headline metrics"],
  "riskFlags": [],
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
  "dataCitations": ["every number cited with source"],
  "assumptions": ["inferences beyond explicit data (0-3 items)"],
  "missingData": ["data gaps that reduce confidence (empty [] if complete)"]
}

Constraints:
- Scope all data to the period requested
- Never invent data not in the Financial Data block
- confidence: "High" = all key data present; "Medium" = partial data; "Low" = critical data missing`;
}

// ─── Few-shot examples — questionType-specific ────────────────────────────────

function buildFewShotExamples(questionType: QuestionType): string {
  if (questionType === 'FACTUAL') {
    return `## EXAMPLES — CORRECT vs WRONG

User: "What was May's actuals?"
WRONG: "📊 Budget vs. Actuals — YTD May 2026\\n[30-line table with YTD, full-year, BU breakdown, trends, recommendations]"
CORRECT: "May came in at $3,062,000 — $234,000 over budget (+8.3%). Cloud Engineering was the primary driver at +$179K YTD. Want me to break down the cost center detail?"

User: "What was January's forecast?"
WRONG: "FP&A Full-Year Forecast — Q2 Reforecast [full-year scenario table]"
CORRECT: "January forecast was $2,827,500. Actuals came in at $2,789,500 — $38K favorable to forecast. Anything specific you want to dig into from January?"`;
  }

  if (questionType === 'ANALYTICAL') {
    return `## EXAMPLES — CORRECT vs WRONG

User: "Which vendor had the largest variance in May?"
WRONG: "[YTD report with all vendors, trends, and recommended actions]"
CORRECT: "Snowflake was the largest unfavorable variance in May at $67,000 over — consumption spiked about 34% above the contract baseline. AWS was second at $48,000 over. Do you want to see the full vendor breakdown for May or just those two?"

User: "Why is Cloud Engineering over budget?"
WRONG: "[Full monthly executive summary with all cost centers and full-year forecast]"
CORRECT: "Cloud Engineering is +$179K over budget YTD — almost entirely AWS EC2. Instance count grew from 48 to 67 in Q1 to support the AI inference platform, without a corresponding budget amendment. The FinOps review on July 15 is the right lever."`;
  }

  if (questionType === 'SUMMARY') {
    return `## EXAMPLES — SUMMARY FORMAT

User: "Summarize May performance"
This IS a summary request — structured format is appropriate.

CORRECT:
"May closed at $3,062,000 — $234,000 over budget and the highest-variance month YTD. The trend has been accelerating since February.

Cloud Engineering was the primary driver at $179K over, almost entirely AWS compute. Data & Analytics was second at $73K over, tied to contractor backfill for two open FTEs.

All 7 business units came in over budget. At this run rate, we're looking at roughly $1.1M of full-year variance if nothing changes. The FinOps review on July 15 is the right lever."

Note: headers, structured paragraphs, and key points are all appropriate because the user asked for a summary.`;
  }

  return `## EXAMPLES — REPORT FORMAT

User: "Generate a monthly report for May"
This IS a report request — full structured format is appropriate.
All sections (headers, tables, key takeaways, recommended actions) are appropriate here.
Scope to May — do not include future months or speculation beyond what the data supports.`;
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function buildSystemPrompt(
  agentId:  AgentId,
  snapshot: FinanceSnapshot,
  question: string = ""
): string {
  const ctx        = getAgentContext(agentId);
  const clientName = defaultConfig.clientName;

  // 1. Detect question type — drives format and length
  const questionType = detectQuestionType(question);

  // 2. Classify intent — drives section selection
  const intent = classifyIntent(question);

  // 3. Extract temporal scope — drives data block horizon
  const temporal = extractTemporalIntent(question);

  // 4. Build agent identity block (Section 1 — 2-3 sentences max)
  const identityBlock = ctx
    ? `# AGENT IDENTITY
You are an experienced finance professional. Your focus is ${ctx.responsibilities.slice(0, 2).join(" and ").toLowerCase()} for ${clientName}. Answer the specific question asked — not a report about the topic.`
    : `# AGENT IDENTITY
You are an experienced finance professional at ${clientName}. Answer the specific question asked — not a report about the topic.`;

  // 5. Build role guardrails (from agent context rules — added to Section 2)
  const rulesFromContext = ctx
    ? `\n## AGENT-SPECIFIC RULES\n${ctx.rules.map(r => `- ${r}`).join("\n")}\n\n## ESCALATION — FLAG THESE EXPLICITLY\n${ctx.escalationLogic.map(e => `- ${e}`).join("\n")}`
    : "";

  // 6. Question directive — what the user asked and temporal binding
  const temporalLabel   = describeTemporalScope(temporal);
  const isFuture        = isFuturePeriod(temporal, YTD_CURRENT_MONTH_NUM);
  const isMonthScope    = temporal.type === "month" && temporal.specific !== null;

  const bindingInstruction = isMonthScope
    ? `BINDING TIME PERIOD: The user has requested ${temporal.specific} ${temporal.year ?? 2026} specifically. ` +
      `You must answer for ${temporal.specific} only. Do not substitute a different time horizon. ` +
      `Do not return full-year, quarterly, or annual forecast data unless explicitly requested. ` +
      `If monthly forecast data is unavailable, say so directly.`
    : null;

  const temporalDirective = temporal.type !== "unknown"
    ? `**Temporal Scope Detected: ${temporalLabel}** (confidence: ${Math.round(temporal.confidence * 100)}%)
${isFuture
  ? `⚠ This period has not yet occurred. Use the projected run-rate data in the Financial Data block below, NOT the full-year aggregate.`
  : temporal.type === "full_year"
  ? `Use the Full-Year Forecast data block. Do NOT narrow scope to a single month or quarter.`
  : `Answer ONLY for the ${temporalLabel} period. Do NOT substitute full-year numbers.`
}`
    : "";

  const questionDirective = question.trim()
    ? `# THE QUESTION
${bindingInstruction ? `\n${bindingInstruction}\n` : ""}
The user has asked: **"${question.trim()}"**

Question type detected: **${questionType}**
${questionType === 'FACTUAL'
  ? `This is a simple factual lookup. Answer in 1-3 sentences. No tables. No headers. No unsolicited sections.`
  : questionType === 'ANALYTICAL'
  ? `This is an analytical question. Answer with specific data and named drivers. No mandatory sections.`
  : questionType === 'COMPARATIVE'
  ? `This is a comparison question. Answer with both sides compared directly.`
  : questionType === 'SUMMARY'
  ? `This is a summary request. Structured format is appropriate. Scope to the requested period.`
  : `This is a report request. Full structured format is appropriate.`
}

${intent.directive}

${temporalDirective}

**Detected Intent: ${intent.intent}** (confidence: ${Math.round(intent.confidence * 100)}%)
${temporal.type !== "unknown" && temporal.type !== "full_year"
  ? `Do NOT use the Full-Year Forecast number to answer a question scoped to ${temporalLabel}.`
  : ""
}`.trim()
    : "";

  // 7. Temporally-scoped data block
  const dataBlock = buildDataBlock(snapshot, agentId, intent.dataSections, temporal);

  // 8. Response format (questionType-aware)
  const responseFormat = buildResponseFormat(questionType);

  // 9. Few-shot examples
  const examples = buildFewShotExamples(questionType);

  // Assemble: question → response rules + agent rules → identity → data → format → examples
  const parts = [
    questionDirective,
    RESPONSE_RULES + rulesFromContext,
    identityBlock,
    dataBlock,
    responseFormat,
    examples,
  ].filter(Boolean);

  return parts.join("\n\n---\n\n");
}

// Re-export classifier and temporal extractor for consumers
export { classifyIntent, extractTemporalIntent };
export type { ClassifiedIntent, TemporalIntent, QuestionType };
