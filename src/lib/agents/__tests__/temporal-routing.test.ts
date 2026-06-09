/**
 * temporal-routing.test.ts  — Phase 5: Temporal routing test suite
 *
 * Tests three assertions per case:
 *   (a) correct TemporalIntent type
 *   (b) correct horizon applied (startMonth / endMonth)
 *   (c) no full-year default when not explicitly requested
 *
 * Run:
 *   npx tsx src/lib/agents/__tests__/temporal-routing.test.ts
 */

import { extractTemporalIntent } from "../../ai/temporal-intent";
import { classifyIntent }        from "../../ai/intent-classifier";
import {
  buildAmbiguityResponse,
  TIME_SENSITIVE_INTENTS,
} from "../../ai/conversation-context";
import type { TemporalType } from "../../ai/temporal-intent";
import type { FinanceIntent } from "../../ai/intent-classifier";

// ─── Minimal test harness ─────────────────────────────────────────────────────

let _passed = 0;
let _failed = 0;

function assert(label: string, actual: unknown, expected: unknown): boolean {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected: ${JSON.stringify(expected)}`);
    console.log(`       Actual:   ${JSON.stringify(actual)}`);
  }
  return pass;
}

function assertGte(label: string, actual: number, min: number): boolean {
  const pass = actual >= min;
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected: >= ${min}`);
    console.log(`       Actual:   ${actual}`);
  }
  return pass;
}

function assertLt(label: string, actual: number, max: number): boolean {
  const pass = actual < max;
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected: < ${max}`);
    console.log(`       Actual:   ${actual}`);
  }
  return pass;
}

function describe(suiteName: string, fn: () => void) {
  console.log(`\n── ${suiteName} ${"─".repeat(Math.max(0, 60 - suiteName.length))}`);
  fn();
}

function it(testName: string, fn: () => void) {
  const beforeFailed = _failed;
  fn();
  const nowFailed = _failed;
  const icon = nowFailed === beforeFailed ? "✅" : "❌";
  console.log(`  ${icon} ${testName}`);
}

// ─── Test interface ────────────────────────────────────────────────────────────

interface TemporalCase {
  question:       string;
  expectedType:   TemporalType;
  expectedStart:  number | null;
  expectedEnd:    number | null;
  minConfidence:  number;
  noFullYearDefault: boolean;  // (c) full-year should NOT be substituted for this query
}

// ─── Group 1: Single-month cases ─────────────────────────────────────────────

const MONTH_CASES: TemporalCase[] = [
  {
    question: "What is June's forecast?",
    expectedType: "month", expectedStart: 6, expectedEnd: 6,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "How did May perform?",
    expectedType: "month", expectedStart: 5, expectedEnd: 5,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "What happened in April?",
    expectedType: "month", expectedStart: 4, expectedEnd: 4,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "Show me the JANUARY 2026 variance",
    expectedType: "month", expectedStart: 1, expectedEnd: 1,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "What does Jun look like?",
    expectedType: "month", expectedStart: 6, expectedEnd: 6,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "What is March 2026 spend?",
    expectedType: "month", expectedStart: 3, expectedEnd: 3,
    minConfidence: 1.0, noFullYearDefault: true,  // month + year → 1.0
  },
];

// ─── Group 2: Quarter cases ───────────────────────────────────────────────────

const QUARTER_CASES: TemporalCase[] = [
  {
    question: "What is the Q2 forecast?",
    expectedType: "quarter", expectedStart: 4, expectedEnd: 6,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "How did Q1 perform vs budget?",
    expectedType: "quarter", expectedStart: 1, expectedEnd: 3,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "What are the risks heading into Q3?",
    expectedType: "quarter", expectedStart: 7, expectedEnd: 9,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "Give me the first quarter variance summary",
    expectedType: "quarter", expectedStart: 1, expectedEnd: 3,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "What's the Q4 outlook?",
    expectedType: "quarter", expectedStart: 10, expectedEnd: 12,
    minConfidence: 0.9, noFullYearDefault: true,
  },
];

// ─── Group 3: Full-year cases — full-year IS correct here ────────────────────

const FULL_YEAR_CASES: TemporalCase[] = [
  {
    question: "Where will we land vs budget by end of year?",
    expectedType: "full_year", expectedStart: 1, expectedEnd: 12,
    minConfidence: 0.95, noFullYearDefault: false,  // full-year IS appropriate
  },
  {
    question: "What is the FY2026 forecast?",
    expectedType: "full_year", expectedStart: 1, expectedEnd: 12,
    minConfidence: 1.0, noFullYearDefault: false,
  },
  {
    question: "What is the annual forecast vs approved budget?",
    expectedType: "full_year", expectedStart: 1, expectedEnd: 12,
    minConfidence: 0.95, noFullYearDefault: false,
  },
  {
    question: "What is the full-year forecast?",
    expectedType: "full_year", expectedStart: 1, expectedEnd: 12,
    minConfidence: 0.95, noFullYearDefault: false,
  },
  {
    question: "How are we tracking against the full year plan?",
    expectedType: "full_year", expectedStart: 1, expectedEnd: 12,
    minConfidence: 0.95, noFullYearDefault: false,
  },
];

// ─── Group 4: Half-year cases ─────────────────────────────────────────────────

const HALF_YEAR_CASES: TemporalCase[] = [
  {
    question: "What is the H1 forecast?",
    expectedType: "half", expectedStart: 1, expectedEnd: 6,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "Show me H2 variance analysis",
    expectedType: "half", expectedStart: 7, expectedEnd: 12,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "How are we doing in the second half?",
    expectedType: "half", expectedStart: 7, expectedEnd: 12,
    minConfidence: 0.9, noFullYearDefault: true,
  },
];

// ─── Group 5: Range cases ─────────────────────────────────────────────────────

const RANGE_CASES: TemporalCase[] = [
  {
    question: "What is the spend forecast for June through August?",
    expectedType: "range", expectedStart: 6, expectedEnd: 8,
    minConfidence: 0.95, noFullYearDefault: true,
  },
  {
    question: "Show me variance from March to May",
    expectedType: "range", expectedStart: 3, expectedEnd: 5,
    minConfidence: 0.95, noFullYearDefault: true,
  },
];

// ─── Group 6: YTD cases ───────────────────────────────────────────────────────

const YTD_CASES: TemporalCase[] = [
  {
    question: "What is the YTD variance?",
    expectedType: "ytd", expectedStart: 1, expectedEnd: null,
    minConfidence: 0.9, noFullYearDefault: true,
  },
  {
    question: "How are we doing year to date?",
    expectedType: "ytd", expectedStart: 1, expectedEnd: null,
    minConfidence: 0.9, noFullYearDefault: true,
  },
];

// ─── Group 7: Unknown cases — no temporal signal ──────────────────────────────

const UNKNOWN_CASES: TemporalCase[] = [
  {
    question: "What is the forecast?",
    expectedType: "unknown", expectedStart: null, expectedEnd: null,
    minConfidence: 0.0, noFullYearDefault: false,  // ambiguous — will trigger clarifying question
  },
  {
    question: "How are we doing?",
    expectedType: "unknown", expectedStart: null, expectedEnd: null,
    minConfidence: 0.0, noFullYearDefault: false,
  },
];

// ─── Group 8: Relative cases ──────────────────────────────────────────────────

const RELATIVE_CASES: TemporalCase[] = [
  {
    question: "What will next month look like?",
    expectedType: "relative", expectedStart: null, expectedEnd: null,
    minConfidence: 0.7, noFullYearDefault: true,
  },
  {
    question: "How did last month compare to budget?",
    expectedType: "relative", expectedStart: null, expectedEnd: null,
    minConfidence: 0.7, noFullYearDefault: true,
  },
];

// ─── Test runner ──────────────────────────────────────────────────────────────

function runTemporalCase(tc: TemporalCase) {
  const result = extractTemporalIntent(tc.question);

  // (a) Correct TemporalIntent type
  assert(
    `type — "${tc.question}"`,
    result.type,
    tc.expectedType
  );

  // (b) Correct horizon applied (start/end months)
  assert(
    `startMonth — "${tc.question}"`,
    result.startMonth,
    tc.expectedStart
  );
  assert(
    `endMonth — "${tc.question}"`,
    result.endMonth,
    tc.expectedEnd
  );

  // Confidence meets minimum threshold
  assertGte(
    `confidence >= ${tc.minConfidence} — "${tc.question}"`,
    result.confidence,
    tc.minConfidence
  );

  // (c) Full-year default check
  if (tc.noFullYearDefault) {
    const isFullYear = result.type === "full_year" || (result.startMonth === 1 && result.endMonth === 12);
    assert(
      `no full-year default — "${tc.question}"`,
      isFullYear,
      false
    );
  }
}

// ─── Ambiguity handler tests ──────────────────────────────────────────────────

function runAmbiguityTests() {
  it("FORECAST_ANALYSIS with no temporal scope → ambiguity triggered", () => {
    const q = "What is the forecast?";
    const intent   = classifyIntent(q);
    const temporal = extractTemporalIntent(q);
    const isTimeSensitive = TIME_SENSITIVE_INTENTS.includes(intent.intent);
    const shouldTrigger   = isTimeSensitive && temporal.confidence < 0.6;

    assert("intent is FORECAST_ANALYSIS", intent.intent, "FORECAST_ANALYSIS");
    assert("temporal is unknown",         temporal.type, "unknown");
    assert("temporal confidence < 0.6",   temporal.confidence < 0.6, true);
    assert("should trigger ambiguity",    shouldTrigger, true);
  });

  it("FORECAST_ANALYSIS with June scope → NO ambiguity", () => {
    const q = "What is June's forecast?";
    const intent   = classifyIntent(q);
    const temporal = extractTemporalIntent(q);
    const isTimeSensitive = TIME_SENSITIVE_INTENTS.includes(intent.intent);
    const shouldTrigger   = isTimeSensitive && temporal.confidence < 0.6;

    assert("intent is FORECAST_ANALYSIS", intent.intent, "FORECAST_ANALYSIS");
    assert("temporal is month",           temporal.type, "month");
    assertGte("temporal confidence >= 0.9", temporal.confidence, 0.9);
    assert("should NOT trigger ambiguity", shouldTrigger, false);
  });

  it("ambiguity response contains clarifying options", () => {
    const q = "What is the forecast?";
    const intent   = classifyIntent(q);
    const temporal = extractTemporalIntent(q);
    const response = buildAmbiguityResponse(q, intent.intent, temporal);

    assert("mode = ambiguity",              response.mode, "ambiguity");
    assert("pendingClarification = true",   response.pendingClarification, true);
    assert("awaitingTemporalScope = true",  response.awaitingTemporalScope, true);
    assert("confidence = Low",              response.confidence, "Low");
    assert("answer is non-empty",           response.answer.length > 20, true);
    assert("offeredOptions has 4 items",    response.offeredOptions.length, 4);
    assert("originalQuery preserved",      response.originalQuery, q);
    assert("detectedIntent preserved",     response.detectedIntent, intent.intent);
  });

  it("HEADCOUNT_ANALYSIS (not time-sensitive) → NO ambiguity even without temporal scope", () => {
    const q = "What is current headcount?";
    const intent   = classifyIntent(q);
    const temporal = extractTemporalIntent(q);
    const isTimeSensitive = TIME_SENSITIVE_INTENTS.includes(intent.intent);

    assert("intent is HEADCOUNT_ANALYSIS",  intent.intent, "HEADCOUNT_ANALYSIS");
    assert("not time-sensitive",            isTimeSensitive, false);
    // Should NOT trigger ambiguity even if temporal is unknown
  });

  it("VARIANCE_ANALYSIS with no temporal scope → ambiguity triggered", () => {
    const q = "What is the variance?";
    const intent   = classifyIntent(q);
    const temporal = extractTemporalIntent(q);
    const isTimeSensitive = TIME_SENSITIVE_INTENTS.includes(intent.intent);
    const shouldTrigger   = isTimeSensitive && temporal.confidence < 0.6;

    assert("temporal is unknown",        temporal.type, "unknown");
    assert("should trigger ambiguity",   shouldTrigger, true);
  });
}

// ─── Intent routing integration tests ────────────────────────────────────────

function runIntentIntegrationTests() {
  const integrationCases: Array<{
    question: string;
    expectedIntent: FinanceIntent;
    expectedTemporalType: TemporalType;
  }> = [
    {
      question: "What is June's forecast?",
      expectedIntent: "FORECAST_ANALYSIS",
      expectedTemporalType: "month",
    },
    {
      question: "What is the full-year forecast?",
      expectedIntent: "FORECAST_ANALYSIS",
      expectedTemporalType: "full_year",
    },
    {
      // "versus budget" scores as VARIANCE_ANALYSIS — correct behaviour
      question: "How did Q1 do versus budget?",
      expectedIntent: "VARIANCE_ANALYSIS",
      expectedTemporalType: "quarter",
    },
    {
      question: "What is the YTD variance?",
      expectedIntent: "VARIANCE_ANALYSIS",
      expectedTemporalType: "ytd",
    },
    {
      question: "Where will we land vs budget by end of year?",
      expectedIntent: "FORECAST_ANALYSIS",
      expectedTemporalType: "full_year",
    },
    {
      question: "Summarize May performance.",
      expectedIntent: "EXECUTIVE_SUMMARY",
      expectedTemporalType: "month",
    },
  ];

  for (const tc of integrationCases) {
    it(`"${tc.question}"`, () => {
      const intent   = classifyIntent(tc.question);
      const temporal = extractTemporalIntent(tc.question);
      assert(`intent = ${tc.expectedIntent}`,          intent.intent, tc.expectedIntent);
      assert(`temporal = ${tc.expectedTemporalType}`,  temporal.type, tc.expectedTemporalType);
    });
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("=".repeat(70));
  console.log("  TEMPORAL ROUTING — TEST SUITE");
  console.log("=".repeat(70));

  describe("Group 1: Single-month queries", () => {
    for (const tc of MONTH_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 2: Quarter queries", () => {
    for (const tc of QUARTER_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 3: Full-year queries (full_year IS correct)", () => {
    for (const tc of FULL_YEAR_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 4: Half-year queries", () => {
    for (const tc of HALF_YEAR_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 5: Month-range queries", () => {
    for (const tc of RANGE_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 6: YTD queries", () => {
    for (const tc of YTD_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 7: Unknown / no temporal signal", () => {
    for (const tc of UNKNOWN_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 8: Relative temporal expressions", () => {
    for (const tc of RELATIVE_CASES) it(`"${tc.question}"`, () => runTemporalCase(tc));
  });

  describe("Group 9: Ambiguity handler", () => {
    runAmbiguityTests();
  });

  describe("Group 10: Intent + temporal integration", () => {
    runIntentIntegrationTests();
  });

  // ── Results ─────────────────────────────────────────────────────────────────
  const total = _passed + _failed;
  console.log("\n" + "=".repeat(70));
  console.log(`  RESULTS: ${_passed}/${total} assertions passed`);
  if (_failed > 0) {
    console.log(`  ⚠ ${_failed} assertion(s) failed — review output above`);
  } else {
    console.log("  All assertions passed. Temporal routing is working correctly.");
  }
  console.log("=".repeat(70));
  process.exit(_failed > 0 ? 1 : 0);
}

main();
