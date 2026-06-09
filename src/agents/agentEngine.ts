/**
 * agentEngine.ts
 *
 * Core dispatch and routing engine for all Nexora AI agents.
 *
 * Features:
 * - Response Mode Router (Step 2/3): intercepts temporal queries BEFORE
 *   keyword scoring so MONTHLY_FORECAST never hits full-year templates
 * - Scored keyword matching (each keyword has a confidence weight)
 * - Conversation history context (follow-up question awareness)
 * - Response variant selection (avoids repetitive outputs)
 * - Cross-agent handoff hints
 * - Data-grounded responses via FinanceSnapshot
 */

import type { AgentId, AgentResponse } from "@/types/finance";
import { getFinanceSnapshot } from "./dataContext";
import { cfoResponses }          from "./responses/cfo";
import { fpaResponses }          from "./responses/fpa";
import { procurementResponses }  from "./responses/procurement";
import { externalLaborResponses } from "./responses/externalLabor";
import { headcountResponses }    from "./responses/headcount";
import { cioResponses }          from "./responses/cio";
import { routeResponseMode }     from "@/lib/ai/response-mode-router";
import type { OutputMode, QuestionType } from "@/lib/ai/response-mode-router";
import { formatCurrency, formatPercent } from "@/lib/formatters";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: "user" | "agent";
  content: string;
  routeKey?: string;   // which route was matched
}

interface RouteDefinition {
  key: string;
  keywords: string[];     // triggers
  negatives?: string[];   // terms that CANCEL this route
  weight: number;         // base confidence (0–10)
  handler: (ctx: ConversationContext) => AgentResponse;
}

export interface ConversationContext {
  question:     string;
  normalized:   string;
  history:      ConversationTurn[];
  priorRoute:   string | null;
  snapshot:     ReturnType<typeof getFinanceSnapshot>;
  agentId:      AgentId;
  outputMode:   OutputMode;   // what format the user wants: question_answering | executive_summary | monthly_report | board_briefing
  questionType: QuestionType; // FACTUAL | ANALYTICAL | COMPARATIVE | SUMMARY | REPORT
}

// ─── Route registry ───────────────────────────────────────────────────────────

// finance-bp and validation use cfo/fpa fallback responses in mock mode.
// When the real Claude path is active these agentIds are handled by the LLM directly.
const routeMap: Partial<Record<AgentId, RouteDefinition[]>> = {
  cfo:             cfoResponses,
  fpa:             fpaResponses,
  procurement:     procurementResponses,
  "external-labor": externalLaborResponses,
  headcount:       headcountResponses,
  cio:             cioResponses,
  "finance-bp":    fpaResponses,   // fallback: FP&A responses cover most BP queries
  validation:      cfoResponses,   // fallback: CFO summary used as validation default
};

// ─── Keyword scorer ───────────────────────────────────────────────────────────

function scoreRoute(normalized: string, route: RouteDefinition): number {
  let score = 0;

  for (const kw of route.keywords) {
    if (normalized.includes(kw.toLowerCase())) {
      // Longer keyword matches = higher confidence
      score += route.weight + kw.split(" ").length;
    }
  }

  // Apply negatives
  for (const neg of route.negatives ?? []) {
    if (normalized.includes(neg.toLowerCase())) {
      score = Math.max(0, score - 5);
    }
  }

  return score;
}

// ─── Follow-up detector ───────────────────────────────────────────────────────

const FOLLOWUP_PHRASES = [
  "tell me more", "more detail", "elaborate", "expand on", "what about",
  "and how", "how so", "can you explain", "go deeper", "drill down",
  "specifically", "give me more", "break that down",
];

function isFollowUp(normalized: string, history: ConversationTurn[]): boolean {
  if (history.length === 0) return false;
  return FOLLOWUP_PHRASES.some(p => normalized.includes(p));
}

// ─── Context enrichment ───────────────────────────────────────────────────────

function buildEnrichedQuery(question: string, history: ConversationTurn[]): string {
  const last = history.filter(h => h.role === "user").slice(-1)[0];
  if (!last) return question;

  const words = question.trim().split(/\s+/);
  if (words.length < 6 && isFollowUp(question.toLowerCase(), history)) {
    return `${last.content} — ${question}`;
  }
  return question;
}

// ─── Factual monthly actuals mock response builder ────────────────────────────
// Used when questionType=FACTUAL and temporal scope is a single month.
// Produces a 2-3 sentence response with no tables, headers, or unsolicited sections.

function buildFactualMonthlyActualsResponse(
  monthName: string,
  ctx: ConversationContext
): AgentResponse {
  const s   = ctx.snapshot;
  const fmt = formatCurrency;
  const pct = formatPercent;

  const monthData = s.monthly.find(
    m => m.month.toLowerCase() === monthName.toLowerCase().slice(0, 3)
  );

  if (!monthData) {
    return {
      answer: `I don't have ${monthName} actuals available — current data runs through ${s.currentMonth.month} 2026. Want me to show a projected run-rate for ${monthName} based on recent months?`,
      keyPoints: [],
      riskFlags: [],
      actions: [],
    };
  }

  const variance = monthData.actual - monthData.budget;
  const varPct   = monthData.budget > 0 ? variance / monthData.budget : 0;
  const dir      = variance > 0 ? 'over budget' : 'under budget';
  const favorable = variance <= 0;

  // Name the primary driver — use YTD BU data as proxy
  const topOver  = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance)[0];
  const context  = favorable
    ? `${monthName} was a clean month — favorable to plan.`
    : topOver
    ? `${topOver.bu} was the primary driver at +${fmt(topOver.variance)} YTD.`
    : '';

  return {
    answer: `${monthName} came in at ${fmt(monthData.actual)} — ${fmt(Math.abs(variance))} ${dir} (${pct(varPct)}). ${context} Want me to break down the cost center detail?`,
    keyPoints: [],
    riskFlags: [],
    actions: [],
  };
}

// ─── Monthly forecast mock response builder ───────────────────────────────────

function buildMonthlyForecastMockResponse(
  monthName: string,
  ctx: ConversationContext
): AgentResponse {
  const s = ctx.snapshot;
  const fmt = formatCurrency;
  const pct = formatPercent;

  // Look for this month in the historical actuals array
  const monthData = s.monthly.find(
    m => m.month.toLowerCase() === monthName.toLowerCase().slice(0, 3)
  );

  if (monthData) {
    const variance = monthData.actual - monthData.budget;
    const varPct   = monthData.budget > 0 ? variance / monthData.budget : 0;
    const isFav    = variance <= 0;
    const dir      = isFav ? 'under budget' : 'over budget';

    return {
      answer: `${monthName} came in at ${fmt(monthData.actual)} — ${fmt(Math.abs(variance))} ${dir} (${isFav ? '' : '+'}${pct(varPct)}). ${isFav ? `${monthName} was favorable to plan.` : `${monthName} was the ${monthData.month === s.currentMonth.month ? 'most recent' : ''} period with unfavorable variance.`} Want me to break down the cost center detail?`,
      keyPoints: [
        `${monthName} actual: ${fmt(monthData.actual)} vs budget ${fmt(monthData.budget)}`,
        `Variance: ${fmt(variance)} (${pct(varPct)}) — ${isFav ? 'FAVORABLE' : 'UNFAVORABLE'}`,
      ],
      riskFlags: [],
      actions: [],
    };
  }

  // Step 4: Missing data response — month not in dataset (future or out of range)
  const monthlyBudget = s.monthly.length > 0 ? s.ytdBudget / s.monthly.length : 0;
  const recentActuals = s.monthly.slice(-3).map(m => m.actual);
  const recentAvg     = recentActuals.length > 0
    ? recentActuals.reduce((a, b) => a + b, 0) / recentActuals.length
    : 0;
  const projected = recentAvg * (1 + s.momGrowthPct);

  return {
    answer: `I don't have a separate ${monthName} forecast value in the current data set. Here's what I can show you for ${monthName}:

- ${monthName} Actuals: not yet available (data through ${s.currentMonth.month} 2026)
- ${monthName} Budget: ~${fmt(monthlyBudget)} (per approved plan)
- Variance vs Budget: not yet determinable

Would you like me to estimate a ${monthName} forecast based on the run rate from prior months, or would the full-year forecast be more useful here?`,
    keyPoints: [
      `${monthName} data not yet available — current data through ${s.currentMonth.month} 2026`,
      `Projected run-rate: ~${fmt(projected)} (3-month average + MoM trend)`,
    ],
    riskFlags: [],
    actions: [],
  };
}

// ─── Monthly variance mock response builder ───────────────────────────────────

function buildMonthlyVarianceMockResponse(
  monthName: string,
  ctx: ConversationContext
): AgentResponse {
  const s = ctx.snapshot;
  const fmt = formatCurrency;
  const pct = formatPercent;

  const monthData = s.monthly.find(
    m => m.month.toLowerCase() === monthName.toLowerCase().slice(0, 3)
  );

  if (monthData) {
    const variance = monthData.actual - monthData.budget;
    const varPct   = monthData.budget > 0 ? variance / monthData.budget : 0;
    const isFav    = variance <= 0;

    // Top BU variance context (YTD level — monthly BU data not available separately)
    const topOver = s.byBU.filter(b => b.variance > 0).sort((a, b) => b.variance - a.variance)[0];

    return {
      answer: `${monthName} came in ${fmt(Math.abs(variance))} ${isFav ? 'under' : 'over'} budget (${isFav ? '' : '+'}${pct(varPct)}). ${topOver ? `Primary driver YTD: ${topOver.bu} at +${fmt(topOver.variance)}.` : ''} ${isFav ? `${monthName} was favorable.` : `Want me to break down the drivers by cost center?`}`,
      keyPoints: [
        `${monthName} actual: ${fmt(monthData.actual)} vs budget ${fmt(monthData.budget)}`,
        `Variance: ${fmt(variance)} (${pct(varPct)}) — ${isFav ? 'FAVORABLE' : 'UNFAVORABLE'}`,
      ],
      riskFlags: [],
      actions: [],
    };
  }

  return {
    answer: `${monthName} variance data is not yet available — current data through ${s.currentMonth.month} 2026.`,
    keyPoints: [`${monthName} has not yet occurred`],
    riskFlags: [],
    actions: [],
  };
}

// ─── Quarterly / half-year mock response builder ──────────────────────────────

function buildRangeForecastMockResponse(
  label: string,
  startMonth: number,
  endMonth: number,
  ctx: ConversationContext
): AgentResponse {
  const s = ctx.snapshot;
  const fmt = formatCurrency;
  const pct = formatPercent;

  const monthOrder = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const inRange = s.monthly.filter(m => {
    const idx = monthOrder.indexOf(m.month) + 1;
    return idx >= startMonth && idx <= endMonth;
  });

  if (inRange.length === 0) {
    return {
      answer: `${label} data is not yet available — current data is through ${s.currentMonth.month} 2026.`,
      keyPoints: [`${label} has not yet occurred or no data available`],
      riskFlags: [],
      actions: [],
    };
  }

  const totalActual = inRange.reduce((sum, m) => sum + m.actual, 0);
  const totalBudget = inRange.reduce((sum, m) => sum + m.budget, 0);
  const variance    = totalActual - totalBudget;
  const varPct      = totalBudget > 0 ? variance / totalBudget : 0;
  const isFav       = variance <= 0;
  const partialNote = endMonth > 5
    ? `\nNote: Only ${inRange.length} of ${endMonth - startMonth + 1} months available — ${label} is partially complete through ${s.currentMonth.month}.`
    : '';

  return {
    answer: `${label} total: **${fmt(totalActual)}** vs budget ${fmt(totalBudget)} — **${fmt(Math.abs(variance))} (${pct(Math.abs(varPct))}) ${isFav ? 'favorable' : 'unfavorable'}**.

**${label} FY2026 Breakdown**
${inRange.map(m => {
  const v = m.actual - m.budget;
  return `${m.month}: ${fmt(m.actual)} actual | ${fmt(m.budget)} budget | ${v >= 0 ? '+' : ''}${fmt(v)}`;
}).join('\n')}${partialNote}

**${label} Subtotal**
| | Value |
|---|---|
| Actual | ${fmt(totalActual)} |
| Budget | ${fmt(totalBudget)} |
| Variance | **${fmt(variance)}** (${pct(varPct)}) |

${isFav
  ? `${label} is tracking favorable overall. If you want the variance broken down by business unit for any of these months, I can pull that.`
  : `${label} has a ${fmt(Math.abs(variance))} unfavorable variance. Want to see which month had the most pressure, or break it down by cost center?`}`,
    keyPoints: [
      `${label} actual: ${fmt(totalActual)} vs budget ${fmt(totalBudget)}`,
      `Variance: ${fmt(variance)} (${pct(varPct)}) — ${isFav ? 'FAVORABLE' : 'UNFAVORABLE'}`,
      `${inRange.length} month(s) of actuals available`,
    ],
    riskFlags: [],
    actions: [],
  };
}

// ─── Main dispatch ────────────────────────────────────────────────────────────

export function dispatchAgent(
  agentId: AgentId,
  question: string,
  history: ConversationTurn[] = []
): AgentResponse & {
  routeKey: string;
  responseMode: string;
  fullYearDataInjected: boolean;
  fallbackUsed: boolean;
  templateUsed: string | null;
} {
  const snapshot   = getFinanceSnapshot();
  const enriched   = buildEnrichedQuery(question, history);
  const normalized = enriched.toLowerCase().trim();
  const priorRoute = history.filter(h => h.routeKey).slice(-1)[0]?.routeKey ?? null;

  const routes = routeMap[agentId] ?? [];

  // ── Step 2/3: Response Mode Router — runs BEFORE keyword scoring ──────────
  const modeResult = routeResponseMode(question);
  const { mode, month, quarter, temporal } = modeResult;

  const ctx: ConversationContext = {
    question:     enriched,
    normalized,
    history,
    priorRoute,
    snapshot,
    agentId,
    outputMode:   modeResult.outputMode,
    questionType: modeResult.questionType,
  };

  // MONTHLY_FORECAST: hard guard — never use full-year template
  if (mode === 'MONTHLY_FORECAST' && month) {
    const response = buildMonthlyForecastMockResponse(month, ctx);
    console.log('[MOCK ROUTER]', {
      rawQuestion:          question,
      detectedIntent:       'FORECAST_ANALYSIS',
      temporalIntent:       temporal,
      responseMode:         mode,
      templateUsed:         null,
      fallbackUsed:         false,
      dataSectionsInjected: ['monthly-actuals'],
      fullYearDataInjected: false,
      agentVoice:           agentId,
      timestamp:            new Date().toISOString(),
    });
    return {
      ...response,
      routeKey:             'monthly-forecast-guard',
      responseMode:         mode,
      fullYearDataInjected: false,
      fallbackUsed:         false,
      templateUsed:         null,
    };
  }

  // QUARTERLY_FORECAST: guard — prevent full-year substitution
  if (mode === 'QUARTERLY_FORECAST' && quarter && temporal.startMonth && temporal.endMonth) {
    const response = buildRangeForecastMockResponse(quarter, temporal.startMonth, temporal.endMonth, ctx);
    console.log('[MOCK ROUTER]', {
      rawQuestion:          question,
      responseMode:         mode,
      templateUsed:         null,
      fullYearDataInjected: false,
      agentVoice:           agentId,
      timestamp:            new Date().toISOString(),
    });
    return {
      ...response,
      routeKey:             'quarterly-forecast-guard',
      responseMode:         mode,
      fullYearDataInjected: false,
      fallbackUsed:         false,
      templateUsed:         null,
    };
  }

  // HALF_YEAR_FORECAST: guard
  if (mode === 'HALF_YEAR_FORECAST' && temporal.startMonth && temporal.endMonth) {
    const label    = temporal.specific ?? 'Half-Year';
    const response = buildRangeForecastMockResponse(label, temporal.startMonth, temporal.endMonth, ctx);
    return {
      ...response,
      routeKey:             'half-year-forecast-guard',
      responseMode:         mode,
      fullYearDataInjected: false,
      fallbackUsed:         false,
      templateUsed:         null,
    };
  }

  // MONTHLY_VARIANCE: guard — prevent full-year data leaking into month-scoped variance questions
  if (mode === 'MONTHLY_VARIANCE' && month) {
    const response = buildMonthlyVarianceMockResponse(month, ctx);
    return {
      ...response,
      routeKey:             'monthly-variance-guard',
      responseMode:         mode,
      fullYearDataInjected: false,
      fallbackUsed:         false,
      templateUsed:         null,
    };
  }

  // FACTUAL + MONTHLY: simple scoped response — "What was May's actuals?"
  // Guard fires for GENERAL_QA mode when the question is a simple factual lookup
  // about a specific month. Prevents keyword scoring from routing to report templates
  // like the bva handler which produces a 30-line formatted report.
  const factualMonth = modeResult.month ?? (temporal.type === 'month' ? temporal.specific ?? null : null);
  if (
    modeResult.questionType === 'FACTUAL' &&
    temporal.type === 'month' &&
    factualMonth &&
    mode === 'GENERAL_QA'
  ) {
    const response = buildFactualMonthlyActualsResponse(factualMonth, ctx);
    console.log('[MOCK ROUTER]', {
      rawQuestion:          question,
      responseMode:         'FACTUAL_MONTHLY',
      questionType:         'FACTUAL',
      templateUsed:         null,
      fallbackUsed:         false,
      fullYearDataInjected: false,
      agentVoice:           agentId,
      timestamp:            new Date().toISOString(),
    });
    return {
      ...response,
      routeKey:             'factual-monthly-guard',
      responseMode:         'FACTUAL_MONTHLY' as string,
      fullYearDataInjected: false,
      fallbackUsed:         false,
      templateUsed:         null,
    };
  }

  // ── Standard keyword routing ──────────────────────────────────────────────
  const scored = routes
    .map(route => ({ route, score: scoreRoute(normalized, route) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  const winner             = scored[0]?.route ?? routes[0];
  const fallbackUsed       = !scored[0];
  const fullYearDataInjected = winner.key === 'forecast';
  const response           = winner.handler(ctx);

  // WARNING: this combination should never occur after the guard above
  if (mode === 'MONTHLY_FORECAST' && fullYearDataInjected) {
    console.warn('[MOCK ROUTER] WARNING: fullYearDataInjected=true with responseMode=MONTHLY_FORECAST', {
      responseMode: mode,
      routeKey:     winner.key,
      agentId,
      question,
    });
  }

  console.log('[MOCK ROUTER]', {
    rawQuestion:          question,
    question,
    agentId,
    detectedIntent:       mode,
    temporalIntent:       temporal,
    responseMode:         mode,
    promptType:           modeResult.questionType,
    outputMode:           modeResult.outputMode,
    templateUsed:         winner.key,
    fallbackUsed,
    dataSectionsInjected: ['keyword-route'],
    fullYearDataInjected,
    agentVoice:           agentId,
    timestamp:            new Date().toISOString(),
  });

  return {
    ...response,
    routeKey:             winner.key,
    responseMode:         mode,
    fullYearDataInjected,
    fallbackUsed,
    templateUsed:         winner.key,
  };
}

// ConversationContext is already exported via the interface declaration above.
