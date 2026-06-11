// Automatic data-type detection (Sprint 11A.5).
//
// Given a file's raw header row, deterministically classify which finance
// dataset it is — gl-actuals | budget | forecast | headcount | vendors |
// external-labor — using weighted, explainable column-signature scoring. NO
// AI/LLM, NO network, NO file I/O.
//
// Independence (Task 8): this module is fully self-contained. It imports nothing
// from Databricks, the upload-history store, the validation engine, or the UI —
// so any future loader can consume detectDataType(headers) on its own. The
// returned `dataType` values are exactly the ingestion DataType union strings
// (note: "vendors", not "vendor").

export type DetectionConfidence = "high" | "medium" | "low";

export interface DataTypeDetection {
  /** Best-matching data type (a DataType value), or null if nothing scored. */
  dataType: string | null;
  confidence: DetectionConfidence;
  /** Winner's match ratio in [0,1] (matched weight / total weight), 2 decimals. */
  score: number;
  /** Logical signal names that matched, for the winning type. */
  matchedColumns: string[];
  /** Logical signal names that did NOT match, for the winning type. */
  missingColumns: string[];
  /** Per-type scores (descending) — full explainability, no hidden state. */
  scores: { dataType: string; score: number; rawScore: number }[];
}

// ── Signal model ──────────────────────────────────────────────────────────────
// Each type is a set of weighted signals. Weights:
//   3 = distinguishing (near-unique to the type — e.g. the specific measure column)
//   2 = strong signature (rarely shared)
//   1 = supporting (shared across related types)
interface Signal {
  name: string;       // logical column name (reported in matched/missing)
  aliases: string[];  // accepted raw headers (snake_case; matched normalized)
  weight: number;
}
interface DetectionProfile {
  dataType: string;
  signals: Signal[];
}

const DISTINGUISHING_WEIGHT = 3;

// Shared supporting aliases.
const PERIOD = ["period_id", "period", "month", "date", "posting_date", "transaction_date", "fiscal_period"];
const COST_CENTER = ["cost_center_id", "cost_center", "cc_id", "cost_centre"];
const BUSINESS_UNIT = ["business_unit", "bu"];
const ACCOUNT = ["account_code", "gl_code", "gl_account", "account"];

// Order is fixed and used as the final deterministic tie-breaker.
const DETECTION_PROFILES: DetectionProfile[] = [
  {
    dataType: "gl-actuals",
    signals: [
      { name: "amount_actual", aliases: ["amount_actual", "actual", "actuals", "actual_amount"], weight: 3 },
      { name: "transaction_id", aliases: ["transaction_id", "txn_id", "transaction"], weight: 2 },
      { name: "account_code", aliases: ACCOUNT, weight: 2 },
      { name: "business_unit", aliases: BUSINESS_UNIT, weight: 1 },
      { name: "cost_center", aliases: COST_CENTER, weight: 1 },
      { name: "category", aliases: ["category"], weight: 1 },
      { name: "period", aliases: PERIOD, weight: 1 },
      { name: "amount", aliases: ["amount"], weight: 1 },
    ],
  },
  {
    dataType: "budget",
    signals: [
      { name: "amount_budget", aliases: ["amount_budget", "budget_amount", "budgeted_amount", "budget"], weight: 3 },
      { name: "cost_center", aliases: COST_CENTER, weight: 1 },
      { name: "category", aliases: ["category"], weight: 1 },
      { name: "period", aliases: PERIOD, weight: 1 },
      { name: "account_code", aliases: ACCOUNT, weight: 1 },
      { name: "amount", aliases: ["amount"], weight: 1 },
    ],
  },
  {
    dataType: "forecast",
    signals: [
      { name: "amount_forecast", aliases: ["amount_forecast", "forecast_amount", "forecasted_amount", "forecast"], weight: 3 },
      { name: "forecast_cycle", aliases: ["forecast_cycle", "cycle", "forecast_version", "scenario"], weight: 2 },
      { name: "forecasted_at", aliases: ["forecasted_at", "as_of_date", "forecast_date"], weight: 1 },
      { name: "cost_center", aliases: COST_CENTER, weight: 1 },
      { name: "category", aliases: ["category"], weight: 1 },
      { name: "period", aliases: PERIOD, weight: 1 },
      { name: "amount", aliases: ["amount"], weight: 1 },
    ],
  },
  {
    dataType: "headcount",
    signals: [
      { name: "position_id", aliases: ["position_id", "employee_id", "req_id", "requisition_id"], weight: 3 },
      { name: "title", aliases: ["title", "job_title", "role"], weight: 2 },
      { name: "annual_salary", aliases: ["annual_salary", "salary", "base_salary", "compensation"], weight: 2 },
      { name: "level", aliases: ["level", "grade", "job_level"], weight: 1 },
      { name: "hire_date", aliases: ["hire_date", "start_date", "fill_date", "open_date"], weight: 1 },
      { name: "business_unit", aliases: BUSINESS_UNIT, weight: 1 },
      { name: "status", aliases: ["status"], weight: 1 },
      { name: "is_backfill", aliases: ["is_backfill", "backfill"], weight: 1 },
    ],
  },
  {
    dataType: "vendors",
    signals: [
      { name: "vendor_id", aliases: ["vendor_id", "supplier_id"], weight: 3 },
      { name: "vendor_name", aliases: ["vendor_name", "supplier_name", "vendor"], weight: 2 },
      { name: "contract_value", aliases: ["contract_value", "annual_value", "contract_amount"], weight: 2 },
      { name: "contract_term", aliases: ["contract_start", "contract_end", "contract_term"], weight: 1 },
      { name: "auto_renew", aliases: ["auto_renew", "auto_renewal"], weight: 1 },
      { name: "risk_level", aliases: ["risk_level", "risk"], weight: 1 },
      { name: "ytd_spend", aliases: ["ytd_spend", "spend"], weight: 1 },
      { name: "vendor_category", aliases: ["vendor_category", "category"], weight: 1 },
    ],
  },
  {
    dataType: "external-labor",
    signals: [
      { name: "contractor_id", aliases: ["contractor_id", "consultant_id"], weight: 3 },
      { name: "monthly_rate", aliases: ["monthly_rate", "rate", "bill_rate", "hourly_rate"], weight: 2 },
      { name: "sow_number", aliases: ["sow_number", "sow"], weight: 2 },
      { name: "contractor_name", aliases: ["contractor_name", "full_name", "name"], weight: 1 },
      { name: "role", aliases: ["role", "title"], weight: 1 },
      { name: "engagement_dates", aliases: ["start_date", "end_date", "contract_start", "contract_end"], weight: 1 },
      { name: "business_unit", aliases: BUSINESS_UNIT, weight: 1 },
      { name: "vendor", aliases: ["vendor", "vendor_id"], weight: 1 },
    ],
  },
];

// Confidence thresholds (deterministic, tunable, explainable).
const HIGH_RATIO = 0.6;
const MEDIUM_RATIO = 0.35;
const CLEAR_MARGIN = 2; // raw-weight lead over the runner-up to be a "clear" winner

/** Normalize a header: lowercase, collapse spaces/hyphens/underscores to one "_". */
export function normalize(header: string): string {
  return (header ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

interface Scored {
  dataType: string;
  rawScore: number;
  maxScore: number;
  ratio: number;
  matched: string[];
  missing: string[];
  matchedDistinguishing: boolean;
}

function scoreProfile(profile: DetectionProfile, headerSet: Set<string>): Scored {
  let rawScore = 0;
  let maxScore = 0;
  let matchedDistinguishing = false;
  const matched: string[] = [];
  const missing: string[] = [];

  profile.signals.forEach((sig) => {
    maxScore += sig.weight;
    const hit = sig.aliases.some((a) => headerSet.has(normalize(a)));
    if (hit) {
      rawScore += sig.weight;
      matched.push(sig.name);
      if (sig.weight >= DISTINGUISHING_WEIGHT) matchedDistinguishing = true;
    } else {
      missing.push(sig.name);
    }
  });

  const ratio = maxScore > 0 ? rawScore / maxScore : 0;
  return { dataType: profile.dataType, rawScore, maxScore, ratio, matched, missing, matchedDistinguishing };
}

/**
 * Detect the finance data type of a file from its raw header row. Deterministic
 * and explainable. Returns the best match plus confidence, matched/missing
 * signal names, and the full per-type score breakdown.
 */
export function detectDataType(headers: string[]): DataTypeDetection {
  const headerSet = new Set((headers ?? []).map(normalize).filter((h) => h !== ""));

  const scored = DETECTION_PROFILES.map((p) => scoreProfile(p, headerSet));

  // Deterministic winner: highest raw score, then highest ratio, then profile order.
  let winnerIdx = 0;
  for (let i = 1; i < scored.length; i++) {
    const a = scored[i];
    const b = scored[winnerIdx];
    if (a.rawScore > b.rawScore || (a.rawScore === b.rawScore && a.ratio > b.ratio)) {
      winnerIdx = i;
    }
  }
  const winner = scored[winnerIdx];

  // Runner-up raw score (for margin / clarity).
  let runnerUpRaw = 0;
  scored.forEach((s, i) => {
    if (i !== winnerIdx && s.rawScore > runnerUpRaw) runnerUpRaw = s.rawScore;
  });
  const margin = winner.rawScore - runnerUpRaw;

  let confidence: DetectionConfidence;
  if (winner.rawScore === 0) {
    confidence = "low";
  } else if (winner.ratio >= HIGH_RATIO && winner.matchedDistinguishing && margin >= CLEAR_MARGIN) {
    confidence = "high";
  } else if (winner.ratio >= MEDIUM_RATIO && (winner.matchedDistinguishing || margin >= CLEAR_MARGIN)) {
    confidence = "medium";
  } else {
    confidence = "low";
  }

  const scores = scored
    .map((s) => ({ dataType: s.dataType, score: Math.round(s.ratio * 100) / 100, rawScore: s.rawScore }))
    .sort((a, b) => b.rawScore - a.rawScore);

  return {
    dataType: winner.rawScore > 0 ? winner.dataType : null,
    confidence,
    score: Math.round(winner.ratio * 100) / 100,
    matchedColumns: winner.matched,
    missingColumns: winner.missing,
    scores,
  };
}
