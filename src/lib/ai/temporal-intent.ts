/**
 * temporal-intent.ts  — Phase 1: TemporalIntent extractor
 *
 * Extracts the temporal scope from a natural-language financial question.
 *
 * Examples:
 *   "What is June's forecast?"          → { type: 'month', specific: 'June', startMonth: 6, confidence: 0.9 }
 *   "What is the Q2 forecast?"          → { type: 'quarter', specific: 'Q2', startMonth: 4, endMonth: 6, confidence: 0.9 }
 *   "How are we tracking full-year?"    → { type: 'full_year', specific: 'FY2026', confidence: 0.95 }
 *   "Where will we land by EOY?"        → { type: 'full_year', specific: 'FY2026', confidence: 0.95 }
 *   "What happened in June 2026?"       → { type: 'month', specific: 'June', year: 2026, confidence: 1.0 }
 *   "June through August outlook"       → { type: 'range', specific: 'June–August', startMonth: 6, endMonth: 8, confidence: 0.95 }
 *   "What's the YTD variance?"          → { type: 'ytd', specific: 'YTD', confidence: 0.9 }
 *   "How will next month look?"         → { type: 'relative', specific: 'next month', isRelative: true, confidence: 0.7 }
 *   "What is the forecast?"             → { type: 'unknown', confidence: 0.0 }
 *
 * Confidence scale:
 *   1.0 — explicit month + year ("June 2026")
 *   0.95 — full-year signal (FY26, annual, full-year)  or range
 *   0.9  — named month alone, quarter (Q1–Q4), YTD, H1/H2
 *   0.7  — relative expression (next month, this quarter)
 *   0.0  — no temporal signal detected
 */

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TemporalType =
  | 'month'
  | 'quarter'
  | 'half'
  | 'full_year'
  | 'ytd'
  | 'relative'
  | 'range'
  | 'unknown';

export interface TemporalIntent {
  type:       TemporalType;
  specific:   string | null;   // "June", "Q2", "H1", "FY2026", "next month"
  year:       number | null;   // explicit year if present, null otherwise
  startMonth: number | null;   // 1–12 (inclusive start of range)
  endMonth:   number | null;   // 1–12 (inclusive end of range)
  isRelative: boolean;         // true for "next month", "current quarter", etc.
  rawMatch:   string | null;   // the matched text from the query
  confidence: number;          // 0.0–1.0
}

// ─── Internal maps ─────────────────────────────────────────────────────────────

const MONTH_FULL: Record<string, number> = {
  january: 1,  february: 2,  march: 3,     april: 4,
  may: 5,      june: 6,      july: 7,      august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

const MONTH_SHORT: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4,
  // "may" intentionally omitted from short map — it's a common word; handled via MONTH_FULL
  jun: 6, jul: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

export const MONTH_NAMES: Record<number, string> = {
  1: "January",   2: "February",  3: "March",    4: "April",
  5: "May",       6: "June",      7: "July",     8: "August",
  9: "September", 10: "October",  11: "November", 12: "December",
};

// Quarter boundaries: Q1→[1,3], Q2→[4,6], Q3→[7,9], Q4→[10,12]
const QUARTER_BOUNDS: Record<string, [number, number]> = {
  q1: [1, 3], q2: [4, 6], q3: [7, 9], q4: [10, 12],
};

const QUARTER_ORDINALS: Record<string, string> = {
  "first": "Q1",  "second": "Q2", "third": "Q3",  "fourth": "Q4",
  "1st":   "Q1",  "2nd":    "Q2", "3rd":   "Q3",  "4th":    "Q4",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveMonthNum(token: string): number | null {
  const t = token.toLowerCase();
  return MONTH_FULL[t] ?? MONTH_SHORT[t] ?? null;
}

// Comma-joined list of all full month names for use in regex alternation
const FULL_MONTHS_PATTERN =
  "january|february|march|april|may|june|july|august|september|october|november|december";

// 3-letter abbreviations (excluding "may" — already covered by full)
const SHORT_MONTHS_PATTERN =
  "jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec";

const ANY_MONTH_PATTERN = `(?:${FULL_MONTHS_PATTERN}|${SHORT_MONTHS_PATTERN})`;

// ─── Main extractor ────────────────────────────────────────────────────────────

export function extractTemporalIntent(question: string): TemporalIntent {
  const q = question.toLowerCase().trim();

  const UNKNOWN: TemporalIntent = {
    type: "unknown", specific: null, year: null,
    startMonth: null, endMonth: null,
    isRelative: false, rawMatch: null, confidence: 0.0,
  };

  // ── 1. Fiscal year: FY26 / FY2026 / FY 26 ──────────────────────────────────
  const fyRe = /\bfy\s*(\d{2,4})\b/;
  const fyM  = q.match(fyRe);
  if (fyM) {
    const raw = fyM[1];
    const year = raw.length <= 2 ? 2000 + parseInt(raw, 10) : parseInt(raw, 10);
    return {
      type: "full_year", specific: `FY${year}`,
      year, startMonth: 1, endMonth: 12,
      isRelative: false, rawMatch: fyM[0], confidence: 1.0,
    };
  }

  // ── 2. Full-year keywords ───────────────────────────────────────────────────
  const fullYearPhrases = [
    "full-year forecast", "full year forecast", "annual forecast", "annual plan",
    "full-year", "full year", "end of year", "year-end", "eoy", "annual",
  ];
  for (const phrase of fullYearPhrases) {
    if (q.includes(phrase)) {
      return {
        type: "full_year", specific: "FY2026",
        year: 2026, startMonth: 1, endMonth: 12,
        isRelative: false, rawMatch: phrase, confidence: 0.95,
      };
    }
  }

  // ── 3. H1 / H2 / first half / second half ──────────────────────────────────
  const halfRe = /\bh([12])\b/;
  const halfM  = q.match(halfRe);
  if (halfM) {
    const n = parseInt(halfM[1], 10);
    return {
      type: "half", specific: `H${n}`,
      year: null,
      startMonth: n === 1 ? 1 : 7,
      endMonth:   n === 1 ? 6 : 12,
      isRelative: false, rawMatch: halfM[0], confidence: 0.9,
    };
  }
  if (q.includes("first half")) {
    return {
      type: "half", specific: "H1",
      year: null, startMonth: 1, endMonth: 6,
      isRelative: false, rawMatch: "first half", confidence: 0.9,
    };
  }
  if (q.includes("second half")) {
    return {
      type: "half", specific: "H2",
      year: null, startMonth: 7, endMonth: 12,
      isRelative: false, rawMatch: "second half", confidence: 0.9,
    };
  }

  // ── 4. YTD ──────────────────────────────────────────────────────────────────
  if (q.includes("ytd") || q.includes("year to date") || q.includes("year-to-date")) {
    const raw = q.includes("ytd") ? "ytd"
      : q.includes("year to date") ? "year to date"
      : "year-to-date";
    return {
      type: "ytd", specific: "YTD",
      year: null, startMonth: 1, endMonth: null,
      isRelative: false, rawMatch: raw, confidence: 0.9,
    };
  }

  // ── 5. Quarter: Q1/Q2/Q3/Q4 ────────────────────────────────────────────────
  const qRe = /\bq([1-4])\b/;
  const qM  = q.match(qRe);
  if (qM) {
    const key = `q${qM[1]}` as keyof typeof QUARTER_BOUNDS;
    const [sm, em] = QUARTER_BOUNDS[key];
    return {
      type: "quarter", specific: `Q${qM[1]}`,
      year: null, startMonth: sm, endMonth: em,
      isRelative: false, rawMatch: qM[0], confidence: 0.9,
    };
  }

  // Quarter: "first quarter", "second quarter", "3rd quarter"
  for (const [ordinal, qLabel] of Object.entries(QUARTER_ORDINALS)) {
    const phrase = `${ordinal} quarter`;
    if (q.includes(phrase)) {
      const key = qLabel.toLowerCase() as keyof typeof QUARTER_BOUNDS;
      const [sm, em] = QUARTER_BOUNDS[key];
      return {
        type: "quarter", specific: qLabel,
        year: null, startMonth: sm, endMonth: em,
        isRelative: false, rawMatch: phrase, confidence: 0.9,
      };
    }
  }

  // ── 6. Month range: "June through August", "June to August", "June – August" ─
  const rangeRe = new RegExp(
    `\\b(${ANY_MONTH_PATTERN})\\s+(?:through|thru|to|–|-)\\s+(${ANY_MONTH_PATTERN})\\b`,
    "i"
  );
  const rangeM = q.match(rangeRe);
  if (rangeM) {
    const sm = resolveMonthNum(rangeM[1]);
    const em = resolveMonthNum(rangeM[2]);
    if (sm && em) {
      return {
        type: "range",
        specific: `${MONTH_NAMES[sm]}–${MONTH_NAMES[em]}`,
        year: null, startMonth: sm, endMonth: em,
        isRelative: false, rawMatch: rangeM[0], confidence: 0.95,
      };
    }
  }

  // ── 7. Named month with explicit year ("June 2026", "Jun 2026") ─────────────
  const mwyRe = new RegExp(
    `\\b(${ANY_MONTH_PATTERN})(?:'s)?\\s+(\\d{4})\\b`, "i"
  );
  const mwyM = q.match(mwyRe);
  if (mwyM) {
    const mn   = resolveMonthNum(mwyM[1]);
    const year = parseInt(mwyM[2], 10);
    if (mn) {
      return {
        type: "month", specific: MONTH_NAMES[mn],
        year, startMonth: mn, endMonth: mn,
        isRelative: false, rawMatch: mwyM[0], confidence: 1.0,
      };
    }
  }

  // ── 8. Named month without year ("June's", "June", "jun") ─────────────────
  //    Full name first (handles possessive: "june's forecast")
  const fullMonthRe = new RegExp(
    `\\b(${FULL_MONTHS_PATTERN})(?:'s)?\\b`, "i"
  );
  const fmM = q.match(fullMonthRe);
  if (fmM) {
    const mn = resolveMonthNum(fmM[1]);
    if (mn) {
      return {
        type: "month", specific: MONTH_NAMES[mn],
        year: null, startMonth: mn, endMonth: mn,
        isRelative: false, rawMatch: fmM[0], confidence: 0.9,
      };
    }
  }

  // Short month abbreviations (excluding "may" — too common as a modal verb)
  const shortMonthRe = new RegExp(
    `\\b(${SHORT_MONTHS_PATTERN})(?:'s)?\\b`, "i"
  );
  const smM = q.match(shortMonthRe);
  if (smM) {
    const mn = resolveMonthNum(smM[1]);
    if (mn) {
      return {
        type: "month", specific: MONTH_NAMES[mn],
        year: null, startMonth: mn, endMonth: mn,
        isRelative: false, rawMatch: smM[0], confidence: 0.9,
      };
    }
  }

  // ── 9. Relative expressions ─────────────────────────────────────────────────
  const relativePhrases: Array<{ phrase: string; label: string }> = [
    { phrase: "next month",          label: "next month"     },
    { phrase: "last month",          label: "last month"     },
    { phrase: "prior month",         label: "prior month"    },
    { phrase: "this month",          label: "this month"     },
    { phrase: "current month",       label: "current month"  },
    { phrase: "next quarter",        label: "next quarter"   },
    { phrase: "last quarter",        label: "last quarter"   },
    { phrase: "this quarter",        label: "this quarter"   },
    { phrase: "current quarter",     label: "current quarter"},
    { phrase: "heading into",        label: "heading into"   },
    { phrase: "rest of the year",    label: "rest of year"   },
    { phrase: "remainder of",        label: "rest of year"   },
    { phrase: "going forward",       label: "going forward"  },
    { phrase: "run rate",            label: "run rate"       },
  ];
  for (const { phrase, label } of relativePhrases) {
    if (q.includes(phrase)) {
      return {
        type: "relative", specific: label,
        year: null, startMonth: null, endMonth: null,
        isRelative: true, rawMatch: phrase, confidence: 0.7,
      };
    }
  }

  // ── 10. No temporal signal ──────────────────────────────────────────────────
  return UNKNOWN;
}

// ─── Helpers for consumers ─────────────────────────────────────────────────────

/**
 * Returns a human-readable label for the temporal scope.
 * E.g.: "June 2026", "Q2 FY2026", "H1 2026", "YTD May 2026", "full-year FY2026"
 */
export function describeTemporalScope(t: TemporalIntent): string {
  if (t.type === "unknown") return "unspecified period";
  if (t.type === "full_year") return `full-year ${t.specific ?? "FY2026"}`;
  if (t.type === "ytd")       return "YTD (year-to-date)";
  if (t.type === "relative")  return t.specific ?? "recent period";
  if (t.type === "half")      return `${t.specific ?? "H?"} FY2026`;
  if (t.type === "quarter")   return `${t.specific ?? "Q?"} FY2026`;
  if (t.type === "range")     return t.specific ?? "date range";
  if (t.type === "month") {
    return t.year
      ? `${t.specific} ${t.year}`
      : (t.specific ?? "specified month");
  }
  return t.specific ?? "unspecified period";
}

/**
 * Returns true when the temporal intent maps to a period after the YTD boundary
 * (currently May 2026). Used to flag "future month" warnings in data blocks.
 */
export function isFuturePeriod(t: TemporalIntent, currentMonthNum = 5): boolean {
  if (t.type === "month" && t.startMonth !== null) {
    return t.startMonth > currentMonthNum;
  }
  if (t.type === "quarter" && t.startMonth !== null) {
    return t.startMonth > currentMonthNum;
  }
  if (t.type === "range" && t.startMonth !== null) {
    return t.startMonth > currentMonthNum;
  }
  return false;
}

/**
 * Returns the months (1-12) covered by a TemporalIntent.
 * Returns null when the range cannot be determined (unknown, relative).
 */
export function resolveMonthRange(t: TemporalIntent): [number, number] | null {
  if (t.startMonth !== null && t.endMonth !== null) return [t.startMonth, t.endMonth];
  if (t.startMonth !== null && t.type === "month")  return [t.startMonth, t.startMonth];
  return null;
}
