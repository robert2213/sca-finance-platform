/**
 * response-mode-router.ts — Step 2: Response Mode Router
 *
 * Maps every incoming question to an explicit ResponseMode AND QuestionType
 * before any agent produces output. No agent may respond without a confirmed
 * response mode. No format decision may be made without a confirmed question type.
 *
 * HARD RULE: MONTHLY_FORECAST mode must never use full-year, Q2, or FY
 * templates. The response mode is binding from the moment it is assigned.
 *
 * HARD RULE: FACTUAL question type must never produce tables, headers, or
 * unsolicited sections (Key Takeaways, Recommended Actions, Monthly Trend, etc.)
 */

import { classifyIntent } from './intent-classifier';
import { extractTemporalIntent } from './temporal-intent';
import type { TemporalIntent } from './temporal-intent';

// ─── Types ─────────────────────────────────────────────────────────────────────

/**
 * Output mode — what format the user actually wants.
 * question_answering is the default; report modes are only activated when
 * the user explicitly requests a report, summary, or board briefing.
 */
export type OutputMode =
  | 'question_answering'  // default — direct conversational answer
  | 'executive_summary'   // user explicitly asked for an executive summary
  | 'monthly_report'      // user explicitly asked for a monthly report
  | 'board_briefing';     // user explicitly asked for board-ready materials

/**
 * Detects the output format the user is requesting.
 * Only switches to a report mode when the user's words are unambiguous.
 */
export function detectOutputMode(question: string): OutputMode {
  const q = question.toLowerCase().trim();

  if (
    /\b(executive summary|exec summary)\b/.test(q) ||
    /\b(create|generate|write|prepare|build)\b.{0,40}\b(executive|exec)\b.{0,20}\b(summary|report)\b/.test(q)
  ) return 'executive_summary';

  if (
    /\b(board (briefing|pack|deck|update|presentation|brief))\b/.test(q) ||
    /\b(prepare|create|generate|build|write)\b.{0,40}\b(board)\b.{0,20}\b(pack|deck|brief|update)\b/.test(q)
  ) return 'board_briefing';

  if (
    /\b(monthly report|month.end report|close report|mec report)\b/.test(q) ||
    /\b(create|generate|write|prepare|build)\b.{0,40}\b(monthly|month.end)\b.{0,20}\b(report|summary)\b/.test(q)
  ) return 'monthly_report';

  return 'question_answering';
}

export type ResponseMode =
  | 'MONTHLY_FORECAST'    // user asked for a specific named month
  | 'QUARTERLY_FORECAST'  // user asked for Q1, Q2, Q3, or Q4
  | 'HALF_YEAR_FORECAST'  // user asked for H1 or H2
  | 'FULL_YEAR_FORECAST'  // user explicitly asked for full year, FY26, annual
  | 'YTD_ANALYSIS'        // user asked for year-to-date
  | 'MONTHLY_VARIANCE'    // user asked about variance for a specific month
  | 'VENDOR_ANALYSIS'     // user asked about vendor spend, contracts, or procurement
  | 'HEADCOUNT_ANALYSIS'  // user asked about headcount, open reqs, or workforce
  | 'EXECUTIVE_SUMMARY'   // user asked for a summary, overview, or performance review
  | 'GENERAL_QA';         // question does not fit a financial analysis mode

/**
 * Question complexity type — determines response format and length.
 *
 * FACTUAL   — "What was X?", "How much was X?", "What is X?"
 *             → 1-3 sentences, no tables, no headers, no unsolicited sections
 *
 * ANALYTICAL — "Why did X happen?", "What drove X?", "Which X had the largest Y?"
 *              → Paragraphs with specific numbers and named drivers
 *              → No mandatory sections — format matches what's needed to answer
 *
 * COMPARATIVE — "Compare X to Y", "How did X do vs Y?"
 *               → Simple comparison format, no report sections
 *
 * SUMMARY   — "Summarize X", "Give me an overview", "How did X perform overall?"
 *             → Structured response appropriate, scoped to requested period
 *
 * REPORT    — "Generate a report", "Create a monthly summary", "Prepare a board update"
 *             → Full structured format appropriate, all sections appropriate
 */
export type QuestionType = 'FACTUAL' | 'ANALYTICAL' | 'COMPARATIVE' | 'SUMMARY' | 'REPORT';

export interface ResponseModeResult {
  mode: ResponseMode;
  questionType: QuestionType;
  outputMode: OutputMode;
  month?: string;    // set when mode is MONTHLY_FORECAST / MONTHLY_VARIANCE / EXECUTIVE_SUMMARY(month-scoped) / GENERAL_QA(month-scoped)
  quarter?: string;  // set when mode is QUARTERLY_FORECAST (e.g. "Q2")
  scope?: string;    // human-readable scope description (e.g. "January", "Q2", "FY2026")
  temporal: TemporalIntent;
}

// ─── Question type detector ────────────────────────────────────────────────────

/**
 * Detects the complexity/format type of the question.
 * Order of checks matters — more specific patterns checked first.
 */
export function detectQuestionType(question: string): QuestionType {
  const q = question.toLowerCase().trim();

  // REPORT — explicit report generation request
  if (
    /\b(generate|create|prepare|build|write)\b.{0,25}\b(report|deck|briefing|document|pack)\b/.test(q) ||
    /\b(monthly report|board report|executive report|board update|board pack|cfo report)\b/.test(q)
  ) {
    return 'REPORT';
  }

  // SUMMARY — explicit summary or overview request
  if (
    /\bsummariz/.test(q) ||
    /\b(give me (a |an )?(summary|overview|rundown)|full summary|complete summary)\b/.test(q) ||
    /\b(overall (summary|performance|view)|performance summary|how did .{0,20} (do|perform) overall)\b/.test(q) ||
    /\b(executive summary|month.end summary|monthly summary)\b/.test(q)
  ) {
    return 'SUMMARY';
  }

  // ANALYTICAL — why/what drove/explain/which-had-the-largest
  if (
    /\b(why|what (drove|caused|is driving|drove|happened to)|explain|reason|root cause)\b/.test(q) ||
    /\b(break (it |that )?(down|apart)|dig into|drill (into|down))\b/.test(q) ||
    /\bwhich\b.{0,30}\b(had|has|is|was)\b.{0,20}\b(largest|biggest|most|highest|lowest|smallest|worst|best)\b/.test(q)
  ) {
    return 'ANALYTICAL';
  }

  // COMPARATIVE — compare two periods or entities (not "vs budget" which is factual/analytical)
  if (
    /\b(compare|how does .{0,25} compare|vs (april|march|january|february|june|july|august|september|october|november|december|q1|q2|q3|q4))\b/.test(q) ||
    /\b(month.over.month|mom comparison|compared to (last|prior|previous) month|how did .{0,15} do (vs|versus|compared to))\b/.test(q)
  ) {
    return 'COMPARATIVE';
  }

  // FACTUAL — simple single-value lookup
  // Must not contain analytical keywords (why, drove, caused, explain, compare)
  if (
    /^(what (was|is|were|are)|how much (was|is|did|were)|show me|tell me|give me)\b/.test(q) &&
    !/\b(why|drove|caused|is driving|explain|compare|vs |versus|break down)\b/.test(q)
  ) {
    return 'FACTUAL';
  }

  // Default — treat as ANALYTICAL (most questions that don't fit a cleaner category)
  return 'ANALYTICAL';
}

// ─── Router ────────────────────────────────────────────────────────────────────

/**
 * Routing examples (canonical):
 *
 * "What was January's forecast?"                   → MONTHLY_FORECAST, month=January
 * "What is June's forecast?"                       → MONTHLY_FORECAST, month=June
 * "What is Q2 forecast?"                           → QUARTERLY_FORECAST, quarter=Q2
 * "What is full-year forecast?"                    → FULL_YEAR_FORECAST
 * "What is FY26 forecast?"                         → FULL_YEAR_FORECAST
 * "Summarize May performance"                      → EXECUTIVE_SUMMARY, month=May
 * "Which vendor had the largest variance in May?"  → VENDOR_ANALYSIS, month=May
 * "What is current headcount?"                     → HEADCOUNT_ANALYSIS
 * "How are we tracking YTD?"                       → YTD_ANALYSIS
 * "What was May's actuals?"                        → GENERAL_QA, month=May, questionType=FACTUAL
 */
export function routeResponseMode(question: string): ResponseModeResult {
  const intent      = classifyIntent(question);
  const temporal    = extractTemporalIntent(question);
  const normalized  = question.toLowerCase();
  const questionType = detectQuestionType(question);
  const outputMode  = detectOutputMode(question);

  // ── HEADCOUNT_ANALYSIS — not temporally gated ──────────────────────────────
  if (intent.intent === 'HEADCOUNT_ANALYSIS') {
    return { mode: 'HEADCOUNT_ANALYSIS', questionType, outputMode, scope: 'current', temporal };
  }

  // ── VENDOR_ANALYSIS / PROCUREMENT_ANALYSIS ─────────────────────────────────
  // Direct keyword check overrides intent classification — "variance" in a
  // vendor question scores VARIANCE_ANALYSIS but the routing must still be VENDOR.
  const hasVendorKeyword = [
    'vendor', 'supplier', 'contract', 'procurement', 'which vendor',
    'largest vendor', 'top vendor', 'vendor spend', 'vendor risk',
  ].some(kw => normalized.includes(kw));

  if (intent.intent === 'VENDOR_ANALYSIS' || intent.intent === 'PROCUREMENT_ANALYSIS' || hasVendorKeyword) {
    const month = temporal.type === 'month' && temporal.specific ? temporal.specific : undefined;
    return { mode: 'VENDOR_ANALYSIS', questionType, outputMode, month, scope: month ?? 'YTD', temporal };
  }

  // ── YTD from temporal signal (any intent) ──────────────────────────────────
  if (temporal.type === 'ytd') {
    return { mode: 'YTD_ANALYSIS', questionType, outputMode, scope: 'YTD', temporal };
  }

  // ── EXECUTIVE_SUMMARY ─────────────────────────────────────────────────────
  if (intent.intent === 'EXECUTIVE_SUMMARY') {
    const month = temporal.type === 'month' && temporal.specific ? temporal.specific : undefined;
    // Preserve REPORT questionType when the user explicitly requested a report document
    const summaryQType: QuestionType = questionType === 'REPORT' ? 'REPORT' : 'SUMMARY';
    // outputMode is set by detectOutputMode — only 'executive_summary' if the user was explicit
    const summaryOutputMode: OutputMode = outputMode;
    return { mode: 'EXECUTIVE_SUMMARY', questionType: summaryQType, outputMode: summaryOutputMode, month, scope: month ?? 'current period', temporal };
  }

  // ── FORECAST_ANALYSIS — temporal determines sub-mode ─────────────────────
  if (intent.intent === 'FORECAST_ANALYSIS') {
    if (temporal.type === 'month' && temporal.specific) {
      return {
        mode: 'MONTHLY_FORECAST',
        questionType,
        outputMode,
        month: temporal.specific,
        scope: temporal.specific,
        temporal,
      };
    }
    if (temporal.type === 'quarter' && temporal.specific) {
      return {
        mode: 'QUARTERLY_FORECAST',
        questionType,
        outputMode,
        quarter: temporal.specific,
        scope: temporal.specific,
        temporal,
      };
    }
    if (temporal.type === 'half') {
      return {
        mode: 'HALF_YEAR_FORECAST',
        questionType,
        outputMode,
        scope: temporal.specific ?? 'half-year',
        temporal,
      };
    }
    // full_year or unknown → FULL_YEAR_FORECAST
    return { mode: 'FULL_YEAR_FORECAST', questionType, outputMode, scope: 'FY2026', temporal };
  }

  // ── VARIANCE_ANALYSIS — monthly scoped becomes MONTHLY_VARIANCE ───────────
  if (intent.intent === 'VARIANCE_ANALYSIS') {
    if (temporal.type === 'month' && temporal.specific) {
      return {
        mode: 'MONTHLY_VARIANCE',
        questionType,
        outputMode,
        month: temporal.specific,
        scope: temporal.specific,
        temporal,
      };
    }
  }

  // ── Default — preserve month from temporal for downstream guards ──────────
  const month = temporal.type === 'month' && temporal.specific ? temporal.specific : undefined;
  return { mode: 'GENERAL_QA', questionType, outputMode, month, scope: 'general', temporal };
}
