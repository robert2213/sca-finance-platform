/**
 * conversation-context.ts  — Phase 4: Ambiguity handler types + response builder
 *
 * When temporal confidence < 0.6 and the intent is time-sensitive (FORECAST_ANALYSIS,
 * VARIANCE_ANALYSIS, EXECUTIVE_SUMMARY), we ask a clarifying question instead of
 * guessing the time period.
 *
 * The ambiguity response is returned as a valid AgentResponse so the UI renders
 * it as a normal chat message. The `pendingClarification: true` flag signals to
 * the client that the next user message should be interpreted as a scope selector.
 */

import type { FinanceIntent } from "./intent-classifier";
import type { TemporalIntent } from "./temporal-intent";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ConversationContext {
  pendingClarification:  boolean;
  originalQuery:         string;
  detectedIntent:        FinanceIntent;
  awaitingTemporalScope: boolean;
  offeredOptions?:       string[];   // options presented to the user
}

/**
 * Intents for which temporal scope significantly changes the answer.
 * For these, low temporal confidence triggers a clarifying question.
 */
export const TIME_SENSITIVE_INTENTS: FinanceIntent[] = [
  "FORECAST_ANALYSIS",
  "VARIANCE_ANALYSIS",
  "EXECUTIVE_SUMMARY",
];

// ─── Ambiguity response builder ────────────────────────────────────────────────

interface AmbiguityResponse {
  answer:               string;
  keyPoints:            string[];
  riskFlags:            never[];   // required by AgentResponse shape
  actions:              never[];
  confidence:           "Low";
  dataCitations:        never[];
  assumptions:          never[];
  missingData:          string[];
  mode:                 "ambiguity";
  pendingClarification: true;
  awaitingTemporalScope: true;
  originalQuery:        string;
  detectedIntent:       FinanceIntent;
  offeredOptions:       string[];
}

/**
 * Builds a clarifying-question response when temporal intent confidence < 0.6.
 * The response is valid JSON parseable by parseAgentResponse() and renders
 * normally in the chat UI.
 */
export function buildAmbiguityResponse(
  question:     string,
  intent:       FinanceIntent,
  temporal:     TemporalIntent,
  currentMonth = "May"
): AmbiguityResponse {
  const options = buildClarifyingOptions(intent, currentMonth);

  const questionLabel = intent === "FORECAST_ANALYSIS"
    ? "forecast"
    : intent === "VARIANCE_ANALYSIS"
    ? "variance analysis"
    : "financial summary";

  const answer =
    `I want to make sure I give you the right ${questionLabel}. ` +
    `Your question — **"${question}"** — doesn't specify a time period, ` +
    `so I'm not sure whether you're asking about:\n\n` +
    options.map((o, i) => `${i + 1}. ${o}`).join("\n") +
    `\n\nWhich period would you like me to focus on?`;

  return {
    answer,
    keyPoints: [
      `Question detected as: ${formatIntent(intent)}`,
      `Current data through: ${currentMonth} 2026 (YTD)`,
      "Please clarify the time period to get a precise answer.",
    ],
    riskFlags:            [] as never[],
    actions:              [] as never[],
    confidence:           "Low" as const,
    dataCitations:        [] as never[],
    assumptions:          [] as never[],
    missingData:          ["Time period not specified — answer requires temporal scope"],
    mode:                 "ambiguity" as const,
    pendingClarification: true as const,
    awaitingTemporalScope: true as const,
    originalQuery:        question,
    detectedIntent:       intent,
    offeredOptions:       options,
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildClarifyingOptions(intent: FinanceIntent, currentMonth: string): string[] {
  if (intent === "FORECAST_ANALYSIS") {
    return [
      `**Next month (${nextMonthName(currentMonth)})** — projected spend for the upcoming month`,
      `**${currentQuarterLabel(currentMonth)}** — quarter-to-date and remaining outlook`,
      `**H2 FY2026** — second-half full forecast`,
      `**Full-year FY2026** — annual forecast vs. approved budget`,
    ];
  }
  if (intent === "VARIANCE_ANALYSIS") {
    return [
      `**${currentMonth} (most recent month)** — current month's actual vs. budget`,
      `**YTD (Jan–${currentMonth})** — year-to-date cumulative variance`,
      `**${currentQuarterLabel(currentMonth)} quarter** — quarter variance summary`,
      `**Full-year outlook** — projected full-year variance`,
    ];
  }
  // EXECUTIVE_SUMMARY
  return [
    `**${currentMonth} month-end** — current month close summary`,
    `**Q${currentQuarterNum(currentMonth)} summary** — quarter-to-date review`,
    `**YTD summary** — year-to-date performance`,
    `**Full-year outlook** — FY2026 forecast vs. budget`,
  ];
}

function nextMonthName(current: string): string {
  const order = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const idx = order.findIndex(m => current.toLowerCase().startsWith(m.toLowerCase()));
  if (idx === -1 || idx >= 11) return "next month";
  return order[idx + 1];
}

function currentQuarterLabel(month: string): string {
  const monthMap: Record<string, string> = {
    jan: "Q1", feb: "Q1", mar: "Q1",
    apr: "Q2", may: "Q2", jun: "Q2",
    jul: "Q3", aug: "Q3", sep: "Q3",
    oct: "Q4", nov: "Q4", dec: "Q4",
  };
  const key = month.toLowerCase().slice(0, 3);
  return monthMap[key] ?? "current quarter";
}

function currentQuarterNum(month: string): number {
  const key = month.toLowerCase().slice(0, 3);
  const map: Record<string, number> = {
    jan: 1, feb: 1, mar: 1, apr: 2, may: 2, jun: 2,
    jul: 3, aug: 3, sep: 3, oct: 4, nov: 4, dec: 4,
  };
  return map[key] ?? 2;
}

function formatIntent(intent: FinanceIntent): string {
  const labels: Record<FinanceIntent, string> = {
    FORECAST_ANALYSIS:   "Forecast Analysis",
    VARIANCE_ANALYSIS:   "Variance Analysis",
    EXECUTIVE_SUMMARY:   "Executive Summary",
    VENDOR_ANALYSIS:     "Vendor Analysis",
    HEADCOUNT_ANALYSIS:  "Headcount Analysis",
    RISK_ASSESSMENT:     "Risk Assessment",
    COST_CENTER_ANALYSIS:"Cost Center Analysis",
    PROCUREMENT_ANALYSIS:"Procurement Analysis",
    GENERAL_FINANCIAL_QA:"General Financial Q&A",
  };
  return labels[intent] ?? intent;
}
