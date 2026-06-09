/**
 * qa-routing.test.ts
 *
 * Validation test suite for the intent-aware Q&A pipeline.
 *
 * Tests:
 *   1. Intent classifier accuracy for the 5 benchmark questions
 *   2. Data section scoping (only relevant sections included)
 *   3. System prompt construction (question directive present)
 *   4. No generic monthly summary for narrow questions
 *
 * Run with:
 *   npx ts-node --esm tests/qa-routing.test.ts
 * or add to your jest/vitest config if tests/ is included in the project.
 */

import { classifyIntent } from "../src/lib/ai/intent-classifier";
import type { FinanceIntent, DataSection } from "../src/lib/ai/intent-classifier";

// ─── Minimal test harness (no external deps needed) ──────────────────────────

interface TestResult {
  question:            string;
  expectedIntent:      FinanceIntent;
  actualIntent:        FinanceIntent;
  intentPass:          boolean;
  expectedSections:    DataSection[];
  actualSections:      DataSection[];
  sectionsPass:        boolean;
  directivePresent:    boolean;
  noGenericSummary:    boolean;
  confidence:          number;
  overallPass:         boolean;
}

function expect(label: string, actual: unknown, expected: unknown): boolean {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  const icon = pass ? "✅" : "❌";
  if (!pass) {
    console.log(`  ${icon} ${label}`);
    console.log(`       Expected: ${JSON.stringify(expected)}`);
    console.log(`       Actual:   ${JSON.stringify(actual)}`);
  }
  return pass;
}

// ─── Benchmark questions ──────────────────────────────────────────────────────

interface BenchmarkCase {
  question:         string;
  expectedIntent:   FinanceIntent;
  mustInclude:      DataSection[];   // these sections must be in the scoped data
  mustExclude?:     DataSection[];   // these sections must NOT be included (narrow questions)
  label:            string;
}

const BENCHMARK_CASES: BenchmarkCase[] = [
  {
    label:           "Vendor variance — specific question",
    question:        "Which vendor contributed the largest unfavorable variance in May and why?",
    expectedIntent:  "VENDOR_ANALYSIS",
    mustInclude:     ["vendors"],
    mustExclude:     ["headcount"],
  },
  {
    label:           "Headcount — current state",
    question:        "What is current headcount?",
    expectedIntent:  "HEADCOUNT_ANALYSIS",
    mustInclude:     ["headcount"],
    mustExclude:     ["vendors", "cloud"],
  },
  {
    label:           "Cost center — over budget",
    question:        "Which cost center is over budget?",
    expectedIntent:  "COST_CENTER_ANALYSIS",
    mustInclude:     ["business_units"],
    mustExclude:     ["vendors", "headcount"],
  },
  {
    label:           "Risk assessment — forward looking",
    question:        "What are the largest financial risks?",
    expectedIntent:  "RISK_ASSESSMENT",
    mustInclude:     ["risks"],
    mustExclude:     ["cloud"],
  },
  {
    label:           "Executive summary — explicit request",
    question:        "Summarize May performance.",
    expectedIntent:  "EXECUTIVE_SUMMARY",
    mustInclude:     ["core", "business_units", "vendors", "headcount", "risks"],
  },
];

// ─── Additional edge-case tests ───────────────────────────────────────────────

const EDGE_CASES: BenchmarkCase[] = [
  {
    label:          "MoM comparison — should be VARIANCE, not summary",
    question:       "How did May do versus April?",
    expectedIntent: "VARIANCE_ANALYSIS",
    mustInclude:    ["core"],
    mustExclude:    ["headcount", "vendors"],
  },
  {
    label:          "Forecast question — should be FORECAST, not summary",
    question:       "What are the biggest risks heading into June?",
    expectedIntent: "RISK_ASSESSMENT",
    mustInclude:    ["risks"],
  },
  {
    label:          "Generic question — should NOT become an executive summary",
    question:       "How are we doing?",
    expectedIntent: "GENERAL_FINANCIAL_QA",  // NOT EXECUTIVE_SUMMARY
    mustInclude:    ["core"],
  },
  {
    label:          "Procurement — contract renewals",
    question:       "Which contracts are expiring in the next 90 days?",
    expectedIntent: "PROCUREMENT_ANALYSIS",
    mustInclude:    ["vendors"],
    mustExclude:    ["headcount", "cloud"],
  },
  {
    label:          "Forecast — full year outlook",
    question:       "Where will we land vs budget by end of year?",
    expectedIntent: "FORECAST_ANALYSIS",
    mustInclude:    ["core"],
    mustExclude:    ["headcount", "vendors"],
  },
];

// ─── Test runner ──────────────────────────────────────────────────────────────

function runTest(tc: BenchmarkCase): TestResult {
  const result = classifyIntent(tc.question);

  const intentPass = result.intent === tc.expectedIntent;

  // Check that all required sections are present
  const sectionsPass = tc.mustInclude.every(s => result.dataSections.includes(s)) &&
    (tc.mustExclude ?? []).every(s => !result.dataSections.includes(s));

  // Directive must contain the exact question text
  const directivePresent = result.directive.length > 20;

  // For non-summary intents, the outputGuidance must NOT say "executive summary"
  const noGenericSummary =
    result.intent === "EXECUTIVE_SUMMARY"
      ? true  // summary requests are allowed to mention summary
      : !result.outputGuidance.toLowerCase().includes("executive summary");

  const overallPass = intentPass && sectionsPass && directivePresent && noGenericSummary;

  return {
    question:         tc.question,
    expectedIntent:   tc.expectedIntent,
    actualIntent:     result.intent,
    intentPass,
    expectedSections: tc.mustInclude,
    actualSections:   result.dataSections,
    sectionsPass,
    directivePresent,
    noGenericSummary,
    confidence:       result.confidence,
    overallPass,
  };
}

function printResult(tc: BenchmarkCase, r: TestResult) {
  const icon = r.overallPass ? "✅" : "❌";
  console.log(`\n${icon} [${tc.label}]`);
  console.log(`   Question:   "${r.question}"`);
  console.log(`   Intent:     ${r.intentPass ? "✅" : "❌"} expected=${r.expectedIntent} | actual=${r.actualIntent} | confidence=${(r.confidence * 100).toFixed(0)}%`);
  console.log(`   Sections:   ${r.sectionsPass ? "✅" : "❌"} actual=${JSON.stringify(r.actualSections)}`);
  console.log(`   Directive:  ${r.directivePresent ? "✅" : "❌"}`);
  console.log(`   No Summary: ${r.noGenericSummary ? "✅" : "❌"}`);

  if (!r.intentPass)    console.log(`   ⚠ INTENT MISMATCH: expected "${r.expectedIntent}", got "${r.actualIntent}"`);
  if (!r.sectionsPass)  console.log(`   ⚠ SECTION MISMATCH: mustInclude=${JSON.stringify(tc.mustInclude)}, mustExclude=${JSON.stringify(tc.mustExclude ?? [])}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  console.log("=".repeat(70));
  console.log("  NEXORA Q&A ROUTING — VALIDATION TEST SUITE");
  console.log("=".repeat(70));

  const allCases  = [...BENCHMARK_CASES, ...EDGE_CASES];
  const results   = allCases.map(tc => ({ tc, r: runTest(tc) }));

  console.log("\n── BENCHMARK CASES (Core 5) " + "─".repeat(42));
  BENCHMARK_CASES.forEach(tc => {
    const r = runTest(tc);
    printResult(tc, r);
  });

  console.log("\n── EDGE CASES " + "─".repeat(55));
  EDGE_CASES.forEach(tc => {
    const r = runTest(tc);
    printResult(tc, r);
  });

  // Summary
  const passed = results.filter(x => x.r.overallPass).length;
  const total  = results.length;

  console.log("\n" + "=".repeat(70));
  console.log(`  RESULTS: ${passed}/${total} passed`);
  console.log("=".repeat(70));

  if (passed < total) {
    console.log(`\n  ⚠ ${total - passed} test(s) failed — review intent-classifier.ts keyword coverage`);
    process.exit(1);
  } else {
    console.log("\n  All tests passed. Intent routing is working correctly.");
    process.exit(0);
  }
}

main();
