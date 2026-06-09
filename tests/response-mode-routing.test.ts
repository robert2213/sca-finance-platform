/**
 * response-mode-routing.test.ts — Step 8: Response Mode Router + Behavior Tests
 *
 * Tests:
 *   1. Response mode routing (MONTHLY_FORECAST, QUARTERLY_FORECAST, etc.)
 *   2. fullYearDataInjected guard
 *   3. Mock dispatch behavior (no full-year template for monthly questions)
 *   4. System prompt content assertions for live path
 *
 * Run:
 *   npx tsx tests/response-mode-routing.test.ts
 */

import { routeResponseMode, ResponseMode } from "../src/lib/ai/response-mode-router";
import { dispatchAgent } from "../src/agents/agentEngine";
import { buildSystemPrompt } from "../src/lib/ai/system-prompt.builder";
import { getFinanceSnapshot } from "../src/agents/dataContext";

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

function assertIncludes(label: string, haystack: string, needle: string): boolean {
  const pass = haystack.includes(needle);
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected to contain: "${needle}"`);
    console.log(`       Haystack length: ${haystack.length} chars`);
  }
  return pass;
}

function assertNotIncludes(label: string, haystack: string, needle: string): boolean {
  const pass = !haystack.includes(needle);
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected NOT to contain: "${needle}"`);
  }
  return pass;
}

function section(title: string) {
  console.log(`\n── ${title} ${"─".repeat(60 - title.length)}`);
}

// ─── Group 1: Response Mode Routing ──────────────────────────────────────────

section("1. Response Mode Routing");

interface RoutingCase {
  question:      string;
  expectedMode:  ResponseMode;
  expectedMonth?: string;
  expectedQuarter?: string;
}

const ROUTING_CASES: RoutingCase[] = [
  {
    question:      "What was January's forecast?",
    expectedMode:  "MONTHLY_FORECAST",
    expectedMonth: "January",
  },
  {
    question:      "What is June's forecast?",
    expectedMode:  "MONTHLY_FORECAST",
    expectedMonth: "June",
  },
  {
    question:      "What is Q2 forecast?",
    expectedMode:  "QUARTERLY_FORECAST",
    expectedQuarter: "Q2",
  },
  {
    question:      "What is full-year forecast?",
    expectedMode:  "FULL_YEAR_FORECAST",
  },
  {
    question:      "What is FY26 forecast?",
    expectedMode:  "FULL_YEAR_FORECAST",
  },
  {
    question:      "Summarize May performance",
    expectedMode:  "EXECUTIVE_SUMMARY",
    expectedMonth: "May",
  },
  {
    question:      "Which vendor had largest unfavorable variance in May?",
    expectedMode:  "VENDOR_ANALYSIS",
    expectedMonth: "May",
  },
  {
    question:      "What is current headcount?",
    expectedMode:  "HEADCOUNT_ANALYSIS",
  },
  {
    question:      "How are we tracking YTD?",
    expectedMode:  "YTD_ANALYSIS",
  },
];

for (const tc of ROUTING_CASES) {
  const result = routeResponseMode(tc.question);
  const label  = `"${tc.question}"`;

  console.log(`\n  ${tc.question}`);
  assert(`  → mode = ${tc.expectedMode}`, result.mode, tc.expectedMode);

  if (tc.expectedMonth !== undefined) {
    assert(`  → month = ${tc.expectedMonth}`, result.month, tc.expectedMonth);
  }
  if (tc.expectedQuarter !== undefined) {
    assert(`  → quarter = ${tc.expectedQuarter}`, result.quarter, tc.expectedQuarter);
  }
}

// ─── Group 2: MONTHLY_FORECAST guard — fullYearDataInjected=false ─────────────

section("2. MONTHLY_FORECAST guard (mock path)");

{
  console.log('\n  "What was January\'s forecast?"');
  const result = dispatchAgent("fpa", "What was January's forecast?", []);

  assert("  → responseMode = MONTHLY_FORECAST", result.responseMode, "MONTHLY_FORECAST");
  assert("  → fullYearDataInjected = false",     result.fullYearDataInjected, false);
  assert("  → templateUsed = null",              result.templateUsed, null);
  assert("  → routeKey = monthly-forecast-guard", result.routeKey, "monthly-forecast-guard");
  assertNotIncludes("  → answer does NOT contain 'Full-Year Forecast'", result.answer, "Full-Year Forecast");
  assertNotIncludes("  → answer does NOT contain 'Q2 Reforecast'",      result.answer, "Q2 Reforecast");
  assertNotIncludes("  → answer does NOT contain 'Revised Full-Year'",  result.answer, "Revised Full-Year");
  assertNotIncludes("  → answer does NOT contain 'Forecast Methodology'", result.answer, "Forecast Methodology");
  assertNotIncludes("  → answer does NOT contain 'Base Case'",           result.answer, "Base Case");
  assertNotIncludes("  → answer does NOT contain 'Optimistic'",          result.answer, "Optimistic");
  assertNotIncludes("  → answer does NOT contain 'Conservative'",        result.answer, "Conservative");
  assertIncludes(   "  → answer contains 'January'",                     result.answer, "January");
}

{
  console.log('\n  "What is June\'s forecast?"');
  const result = dispatchAgent("fpa", "What is June's forecast?", []);

  assert("  → responseMode = MONTHLY_FORECAST", result.responseMode, "MONTHLY_FORECAST");
  assert("  → fullYearDataInjected = false",     result.fullYearDataInjected, false);
  assertNotIncludes("  → answer does NOT contain 'Full-Year Forecast'", result.answer, "Full-Year Forecast");
  assertNotIncludes("  → answer does NOT contain 'Q2 Reforecast'",      result.answer, "Q2 Reforecast");
  assertIncludes(   "  → answer contains 'June'",                       result.answer, "June");
}

// ─── Group 3: QUARTERLY_FORECAST guard ────────────────────────────────────────

section("3. QUARTERLY_FORECAST guard (mock path)");

{
  console.log('\n  "What is Q2 forecast?"');
  const result = dispatchAgent("fpa", "What is Q2 forecast?", []);

  assert("  → responseMode = QUARTERLY_FORECAST", result.responseMode, "QUARTERLY_FORECAST");
  assert("  → fullYearDataInjected = false",      result.fullYearDataInjected, false);
  assertNotIncludes("  → answer does NOT contain 'Full-Year Forecast'", result.answer, "Full-Year Forecast");
}

// ─── Group 4: FULL_YEAR_FORECAST — full-year data is correct here ─────────────

section("4. FULL_YEAR_FORECAST — full-year data expected");

{
  console.log('\n  "What is the full-year forecast?"');
  const result = dispatchAgent("fpa", "What is the full-year forecast?", []);

  assert("  → responseMode = FULL_YEAR_FORECAST",  result.responseMode, "FULL_YEAR_FORECAST");
  assert("  → fullYearDataInjected = true",         result.fullYearDataInjected, true);
  assertNotIncludes("  → answer does NOT start with 'FP&A Full-Year Forecast — Q2 Reforecast'",
    result.answer, "FP&A Full-Year Forecast — Q2 Reforecast");
}

// ─── Group 5: EXECUTIVE_SUMMARY scoped to May ─────────────────────────────────

section("5. EXECUTIVE_SUMMARY scoped to month");

{
  console.log('\n  "Summarize May performance"');
  const result = routeResponseMode("Summarize May performance");
  assert("  → mode = EXECUTIVE_SUMMARY", result.mode, "EXECUTIVE_SUMMARY");
  assert("  → month = May",              result.month, "May");
}

// ─── Group 6: VENDOR_ANALYSIS with month scope ───────────────────────────────

section("6. VENDOR_ANALYSIS with month scope");

{
  console.log('\n  "Which vendor had largest unfavorable variance in May?"');
  const result = routeResponseMode("Which vendor had largest unfavorable variance in May?");
  assert("  → mode = VENDOR_ANALYSIS", result.mode, "VENDOR_ANALYSIS");
  assert("  → month = May",            result.month, "May");
}

// ─── Group 7: HEADCOUNT_ANALYSIS ─────────────────────────────────────────────

section("7. HEADCOUNT_ANALYSIS");

{
  console.log('\n  "What is current headcount?"');
  const result = dispatchAgent("headcount", "What is current headcount?", []);
  assert("  → responseMode = HEADCOUNT_ANALYSIS", result.responseMode, "HEADCOUNT_ANALYSIS");
}

// ─── Group 8: System prompt content assertions (live path) ────────────────────

section("8. System prompt content assertions (live path)");

{
  const snapshot = getFinanceSnapshot();

  {
    console.log('\n  MONTHLY_FORECAST system prompt — January');
    const prompt = buildSystemPrompt("fpa", snapshot, "What was January's forecast?");

    // Scope checks to before the ## EXAMPLES block — few-shot examples intentionally show
    // "Q2 Reforecast" as a WRONG example, so the full-prompt check would be a false positive.
    const janDataSection = prompt.split("## EXAMPLES")[0];
    assertIncludes(   "  → contains 'BINDING TIME PERIOD'",          prompt, "BINDING TIME PERIOD");
    assertIncludes(   "  → contains 'January'",                      prompt, "January");
    assertNotIncludes("  → does NOT contain 'Full-Year Forecast' in directive",
      janDataSection.slice(0, 500), "Full-Year Forecast");
    assertNotIncludes("  → does NOT contain 'Q2 Reforecast' in data section", janDataSection, "Q2 Reforecast");
    assertNotIncludes("  → does NOT contain 'Revised Full-Year Outlook'", prompt, "Revised Full-Year Outlook");
  }

  {
    console.log('\n  MONTHLY_FORECAST system prompt — June (future)');
    const prompt = buildSystemPrompt("fpa", snapshot, "What is June's forecast?");
    const juneDataSection = prompt.split("## EXAMPLES")[0];

    assertIncludes(   "  → contains 'BINDING TIME PERIOD'",          prompt, "BINDING TIME PERIOD");
    assertIncludes(   "  → contains 'June'",                         prompt, "June");
    assertNotIncludes("  → does NOT contain 'Q2 Reforecast' in data section", juneDataSection, "Q2 Reforecast");
  }

  {
    console.log('\n  FULL_YEAR_FORECAST system prompt — no BINDING instruction');
    const prompt = buildSystemPrompt("fpa", snapshot, "What is the full-year forecast?");

    assertNotIncludes("  → BINDING TIME PERIOD NOT present (full-year is correct)",
      prompt, "BINDING TIME PERIOD");
  }
}

// ─── Group 9: Mock path — May cloud spend vs budget ───────────────────────────

section("9. Mock path — May cloud spend vs budget");

{
  console.log('\n  "What was May\'s cloud spend vs budget?"');
  const result = dispatchAgent("fpa", "What was May's cloud spend vs budget?", []);

  // May is a variance question with month scope — should NOT return full-year template
  assertNotIncludes("  → answer does NOT contain 'Full-Year Forecast'", result.answer, "Full-Year Forecast");
  assertNotIncludes("  → answer does NOT contain 'Q2 Reforecast'",      result.answer, "Q2 Reforecast");
}

// ─── Results ─────────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(70));
console.log(`  RESULTS: ${_passed}/${_passed + _failed} passed`);
console.log("=".repeat(70));

if (_failed > 0) {
  console.log(`\n  ⚠ ${_failed} test(s) failed`);
  process.exit(1);
} else {
  console.log("\n  All response mode routing tests passed.");
  process.exit(0);
}
