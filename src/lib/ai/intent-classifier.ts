/**
 * intent-classifier.ts
 *
 * Lightweight keyword-based intent classifier for financial Q&A routing.
 *
 * Used by system-prompt.builder.ts to:
 *   1. Scope the data block to only what is relevant to the question
 *   2. Inject a question-specific directive into the system prompt
 *   3. Replace the static report output format with intent-aware guidance
 *
 * Design: pure function, no async, no side effects.
 * Falls back to GENERAL_FINANCIAL_QA when no specific intent is detected.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type FinanceIntent =
  | "VENDOR_ANALYSIS"
  | "VARIANCE_ANALYSIS"
  | "HEADCOUNT_ANALYSIS"
  | "FORECAST_ANALYSIS"
  | "RISK_ASSESSMENT"
  | "EXECUTIVE_SUMMARY"
  | "COST_CENTER_ANALYSIS"
  | "PROCUREMENT_ANALYSIS"
  | "GENERAL_FINANCIAL_QA";

export type DataSection =
  | "core"
  | "business_units"
  | "cloud"
  | "external_labor"
  | "vendors"
  | "headcount"
  | "risks";

export interface ClassifiedIntent {
  intent:        FinanceIntent;
  confidence:    number;         // 0–1, derived from match score
  dataSections:  DataSection[];  // which data blocks to include in the prompt
  directive:     string;         // injected at the top of the system prompt
  outputGuidance: string;        // replaces agent outputFormat for this question
}

interface IntentDefinition {
  intent:        FinanceIntent;
  weight:        number;
  keywords:      string[];
  dataSections:  DataSection[];
  directive:     string;
  outputGuidance: string;
}

// ─── Intent definitions ───────────────────────────────────────────────────────

const INTENT_DEFINITIONS: IntentDefinition[] = [

  // ── Executive Summary: MUST be explicit — high keyword bar ────────────────
  {
    intent: "EXECUTIVE_SUMMARY",
    weight: 6,
    keywords: [
      "executive summary", "month-end summary", "monthly summary", "month close summary",
      "summarize may", "summarize april", "summarize the month", "summarize performance",
      "monthly report", "month-end report", "full summary", "complete summary",
      "overall summary", "performance summary", "give me a summary of",
    ],
    dataSections: ["core", "business_units", "cloud", "external_labor", "vendors", "headcount", "risks"],
    directive:
      `The user has explicitly requested a comprehensive executive summary. ` +
      `Provide a full structured report covering all major financial domains.`,
    outputGuidance:
      `Provide a structured executive summary: ` +
      `(1) Top-line YTD results with key variances, ` +
      `(2) Top 3 variance drivers with dollar impact, ` +
      `(3) Forecast risk assessment, ` +
      `(4) Recommended actions. Use specific numbers from the data.`,
  },

  // ── Vendor Analysis ───────────────────────────────────────────────────────
  {
    intent: "VENDOR_ANALYSIS",
    weight: 8,
    keywords: [
      "vendor", "supplier", "which vendor", "largest vendor", "top vendor",
      "vendor variance", "vendor spend", "vendor contributed", "vendor risk",
      "vendor analysis", "vendor performance", "vendor concentration",
    ],
    dataSections: ["core", "vendors", "risks"],
    directive:
      `The user's question is specifically about vendors. ` +
      `Answer ONLY the vendor question asked. ` +
      `Do NOT generate a general monthly financial summary.`,
    outputGuidance:
      `Identify the specific vendor(s) relevant to the question. ` +
      `Quantify the dollar and percentage impact. ` +
      `Explain what is driving the result. ` +
      `Do not include unrelated sections (cloud, headcount, etc.).`,
  },

  // ── Variance Analysis ─────────────────────────────────────────────────────
  {
    intent: "VARIANCE_ANALYSIS",
    weight: 7,
    keywords: [
      "variance", "unfavorable variance", "favorable variance",
      "over budget", "under budget", "budget gap", "budget vs actual",
      "actual vs budget", "versus budget", "vs budget", "spending variance",
      "largest variance", "biggest variance", "what caused", "why did",
      "explain the variance", "why are we", "how much over", "how much under",
      "spend vs budget", "vs plan", "against budget",
    ],
    dataSections: ["core", "business_units", "cloud", "external_labor", "risks"],
    directive:
      `The user's question is specifically about a variance or budget performance. ` +
      `Identify and explain the specific variance relevant to the question. ` +
      `Do NOT generate a general monthly report.`,
    outputGuidance:
      `Identify the specific variance(s) asked about. ` +
      `Report in both dollar amount and percentage. ` +
      `Explain the root-cause driver(s). ` +
      `Do not pad the answer with unrelated sections.`,
  },

  // ── Headcount Analysis ────────────────────────────────────────────────────
  {
    intent: "HEADCOUNT_ANALYSIS",
    weight: 9,
    keywords: [
      "headcount", "head count", "current headcount", "open req", "open requisition",
      "filled position", "unfilled position", "fill rate", "open roles",
      "hire", "hiring", "staffing", "staff count", "how many employees",
      "how many people", "how many positions", "employee count",
      "workforce", "fte", "full-time",
    ],
    dataSections: ["headcount", "external_labor"],
    directive:
      `The user's question is specifically about headcount or staffing. ` +
      `Answer ONLY using headcount and external labor data. ` +
      `Do NOT generate a general financial summary.`,
    outputGuidance:
      `Answer the headcount question directly and concisely. ` +
      `State the total filled/approved count, fill rate, open reqs, and BU breakdown if relevant. ` +
      `Do not include budget summaries, vendor data, or other unrelated sections.`,
  },

  // ── Forecast Analysis ─────────────────────────────────────────────────────
  {
    intent: "FORECAST_ANALYSIS",
    weight: 7,
    keywords: [
      "forecast", "outlook", "full-year forecast", "full year", "projection", "projected",
      "end of year", "eoy forecast", "where will we land", "on track",
      "trajectory", "run rate", "annualized", "will we hit budget",
      "heading into q3", "heading into q4", "second half", "h2 forecast",
    ],
    dataSections: ["core", "business_units", "cloud", "risks"],
    directive:
      `The user's question is specifically about the full-year forecast or financial outlook. ` +
      `Focus on forecast projections and risk to plan. ` +
      `Do NOT generate a general monthly close report.`,
    outputGuidance:
      `State the full-year forecast vs. approved budget, the projected overrun or underrun, ` +
      `the confidence level, and the top 2–3 risks to the forecast. ` +
      `Do not generate unrelated commentary about current-period actuals.`,
  },

  // ── Risk Assessment ───────────────────────────────────────────────────────
  {
    intent: "RISK_ASSESSMENT",
    weight: 7,
    keywords: [
      "risk", "risks", "biggest risk", "largest risk", "top risks", "key risks",
      "financial risks", "concern", "concerns", "flag", "issue", "issues",
      "problem", "problems", "exposure", "threat", "threats",
      "heading into june", "heading into q3", "what should i worry about",
      "what do i need to watch", "watch out for", "vulnerability",
    ],
    dataSections: ["core", "vendors", "headcount", "external_labor", "risks"],
    directive:
      `The user's question is specifically about financial risks or concerns. ` +
      `Identify, prioritize, and quantify the specific risks. ` +
      `Do NOT generate a general financial performance summary.`,
    outputGuidance:
      `Provide a prioritized risk list (HIGH / MEDIUM / LOW). ` +
      `For each risk: name it, quantify the dollar exposure, explain the driver, ` +
      `and recommend a mitigation action. ` +
      `Do not produce a general monthly close summary.`,
  },

  // ── Cost Center Analysis ──────────────────────────────────────────────────
  {
    intent: "COST_CENTER_ANALYSIS",
    weight: 8,
    keywords: [
      "cost center", "cost centers", "which department", "which cost center",
      "department over budget", "cost center over budget", "cost center variance",
      "by department", "by cost center", "cc-", "most over budget",
      "highest over budget", "cost center performance",
    ],
    dataSections: ["core", "business_units", "risks"],
    directive:
      `The user's question is specifically about cost center or department performance. ` +
      `Analyze only the cost center data relevant to the question. ` +
      `Do NOT expand into an overall financial summary.`,
    outputGuidance:
      `Identify the specific cost center(s) relevant to the question. ` +
      `State their actuals vs. budget, dollar variance, and percentage variance. ` +
      `Explain the driver. Do not include sections unrelated to cost center performance.`,
  },

  // ── Procurement Analysis ──────────────────────────────────────────────────
  {
    intent: "PROCUREMENT_ANALYSIS",
    weight: 7,
    keywords: [
      "procurement", "expiring contract", "contract expir", "contracts expiring",
      "which contracts", "expiring in", "expiring within",
      "renewal", "renew", "auto-renew", "contract end", "upcoming renewals",
      "negotiate", "negotiation", "sourcing", "purchase order",
      "vendor renewal", "contract management",
    ],
    dataSections: ["vendors", "external_labor"],
    directive:
      `The user's question is specifically about procurement or contract management. ` +
      `Answer using contract and vendor data only. ` +
      `Do NOT generate a general financial report.`,
    outputGuidance:
      `List the relevant contracts with expiry dates, auto-renew status, ` +
      `dollar commitment, and recommended action. ` +
      `Do not include unrelated financial commentary.`,
  },

  // ── Month-over-Month Comparison ───────────────────────────────────────────
  {
    intent: "VARIANCE_ANALYSIS",
    weight: 8,
    keywords: [
      "vs april", "versus april", "vs march", "versus march",
      "month over month", "month-over-month", "mom comparison",
      "compared to last month", "prior month", "previous month",
      "how did may do", "how did april do", "compare may", "compare april",
    ],
    dataSections: ["core", "business_units", "cloud"],
    directive:
      `The user is asking for a month-over-month comparison. ` +
      `Compare the two periods specifically. ` +
      `Do NOT generate an unrelated YTD summary.`,
    outputGuidance:
      `Compare the two months directly: actuals, budget, variance, MoM change in dollars and percentage. ` +
      `Identify what changed and why. Keep the response focused on the comparison asked.`,
  },

  // ── General Financial Q&A — fallback ─────────────────────────────────────
  {
    intent: "GENERAL_FINANCIAL_QA",
    weight: 0,
    keywords: [],  // always-false — this is the fallback only
    dataSections: ["core", "business_units", "cloud", "external_labor", "vendors", "headcount", "risks"],
    directive:
      `The user has asked a financial question. ` +
      `Answer specifically and directly. ` +
      `Do NOT generate a generic monthly summary unless the question explicitly asks for one.`,
    outputGuidance:
      `Answer only what was asked. Be specific and cite relevant numbers. ` +
      `If the question is narrow, the answer should be narrow. ` +
      `Do not produce a comprehensive report for a specific question.`,
  },
];

// ─── Classifier ───────────────────────────────────────────────────────────────

export function classifyIntent(question: string): ClassifiedIntent {
  const normalized = question.toLowerCase().trim();

  let bestScore  = 0;
  let bestDef    = INTENT_DEFINITIONS[INTENT_DEFINITIONS.length - 1]; // GENERAL_FINANCIAL_QA

  for (const def of INTENT_DEFINITIONS) {
    if (def.intent === "GENERAL_FINANCIAL_QA") continue; // handled as fallback

    let score = 0;
    for (const kw of def.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        // Longer keyword phrases score higher
        score += def.weight + kw.split(" ").length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestDef   = def;
    }
  }

  // EXECUTIVE_SUMMARY must be explicit (score >= 8).
  // A score of 8 requires at least one multi-word phrase match (e.g. "summarize may",
  // "monthly summary") — single common words like "performance" alone won't reach 8.
  // "How are we doing?" or "give me an update" will NOT trigger this threshold.
  if (bestDef.intent === "EXECUTIVE_SUMMARY" && bestScore < 8) {
    bestDef   = INTENT_DEFINITIONS[INTENT_DEFINITIONS.length - 1];
    bestScore = 0;
  }

  const confidence = Math.min(1, bestScore / 20);

  return {
    intent:        bestDef.intent,
    confidence,
    dataSections:  bestDef.dataSections,
    directive:     bestDef.directive,
    outputGuidance: bestDef.outputGuidance,
  };
}
