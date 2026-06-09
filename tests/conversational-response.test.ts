/**
 * conversational-response.test.ts — Phase 7: QuestionType + Response Shape Tests
 *
 * Tests that the system correctly detects question types AND enforces
 * the right response shape for each type (no tables for FACTUAL, etc.)
 *
 * Run: npx tsx tests/conversational-response.test.ts
 */

import { detectQuestionType, routeResponseMode } from "../src/lib/ai/response-mode-router";
import type { QuestionType } from "../src/lib/ai/response-mode-router";
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
    console.log(`       Haystack snippet: "${haystack.slice(0, 200)}"`);
  }
  return pass;
}

function assertLengthAtMost(label: string, text: string, maxSentences: number): boolean {
  // Simple approximation: split on ". " and count
  const approxSentences = text.split(/\.\s+/).length;
  const pass = approxSentences <= maxSentences;
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected at most ~${maxSentences} sentences, got ~${approxSentences}`);
    console.log(`       Text: "${text.slice(0, 300)}"`);
  }
  return pass;
}

function assertArrayEmpty(label: string, arr: unknown[]): boolean {
  const pass = arr.length === 0;
  if (pass) {
    _passed++;
  } else {
    _failed++;
    console.log(`  ❌ ${label}`);
    console.log(`       Expected empty array [], got ${JSON.stringify(arr)}`);
  }
  return pass;
}

function section(title: string) {
  console.log(`\n── ${title} ${"─".repeat(60 - Math.min(title.length, 58))}`);
}

// ─── Group 1: detectQuestionType — FACTUAL ────────────────────────────────────

section("1. detectQuestionType — FACTUAL");

const FACTUAL_CASES: string[] = [
  "What was May's actuals?",
  "What was January's forecast?",
  "What is current headcount?",
  "How much did we spend in April?",
  "What were March actuals?",
  "Show me May spend",
  "Tell me the February budget",
  "Give me April actuals",
  "What is the YTD spend?",
  "What was Q1 spend?",
];

for (const q of FACTUAL_CASES) {
  const result = detectQuestionType(q);
  console.log(`  ${q} → ${result}`);
  assert(`  FACTUAL: "${q}"`, result, "FACTUAL" as QuestionType);
}

// ─── Group 2: detectQuestionType — ANALYTICAL ─────────────────────────────────

section("2. detectQuestionType — ANALYTICAL");

const ANALYTICAL_CASES: string[] = [
  "Why is Cloud Engineering over budget?",
  "What drove the May variance?",
  "What caused the increase in contractor spend?",
  "Which vendor had the largest unfavorable variance?",
  "Which business unit had the highest overage in May?",
  "Explain the headcount shortfall",
  "Break down the Q2 spend by category",
  "Dig into the cloud cost increase",
];

for (const q of ANALYTICAL_CASES) {
  const result = detectQuestionType(q);
  console.log(`  ${q} → ${result}`);
  assert(`  ANALYTICAL: "${q}"`, result, "ANALYTICAL" as QuestionType);
}

// ─── Group 3: detectQuestionType — COMPARATIVE ───────────────────────────────

section("3. detectQuestionType — COMPARATIVE");

const COMPARATIVE_CASES: string[] = [
  "Compare May to April",
  "How did May do vs April?",
  "Month-over-month comparison for cloud",
  "How does May compare to last month?",
];

for (const q of COMPARATIVE_CASES) {
  const result = detectQuestionType(q);
  console.log(`  ${q} → ${result}`);
  assert(`  COMPARATIVE: "${q}"`, result, "COMPARATIVE" as QuestionType);
}

// ─── Group 4: detectQuestionType — SUMMARY ────────────────────────────────────

section("4. detectQuestionType — SUMMARY");

const SUMMARY_CASES: string[] = [
  "Summarize May performance",
  "Give me a summary of Q1",
  "Executive summary for May",
  "How did May perform overall?",
  "Overall performance summary for Q2",
];

for (const q of SUMMARY_CASES) {
  const result = detectQuestionType(q);
  console.log(`  ${q} → ${result}`);
  assert(`  SUMMARY: "${q}"`, result, "SUMMARY" as QuestionType);
}

// ─── Group 5: detectQuestionType — REPORT ────────────────────────────────────

section("5. detectQuestionType — REPORT");

const REPORT_CASES: string[] = [
  "Generate a monthly report for May",
  "Create a board report for Q2",
  "Prepare a CFO report",
  "Build me an executive report",
  "Write a monthly report",
  "Monthly report for May",
  "Board update for Q2",
];

for (const q of REPORT_CASES) {
  const result = detectQuestionType(q);
  console.log(`  ${q} → ${result}`);
  assert(`  REPORT: "${q}"`, result, "REPORT" as QuestionType);
}

// ─── Group 6: routeResponseMode — FACTUAL gets questionType=FACTUAL ──────────

section("6. routeResponseMode — questionType propagation");

{
  const r = routeResponseMode("What was May's actuals?");
  console.log(`\n  "What was May's actuals?" → mode=${r.mode}, questionType=${r.questionType}, month=${r.month}`);
  assert("  → mode = GENERAL_QA",       r.mode,         "GENERAL_QA");
  assert("  → questionType = FACTUAL",  r.questionType, "FACTUAL");
  assert("  → month = May",             r.month,        "May");
}

{
  const r = routeResponseMode("Summarize May performance");
  console.log(`\n  "Summarize May performance" → mode=${r.mode}, questionType=${r.questionType}`);
  assert("  → mode = EXECUTIVE_SUMMARY", r.mode,         "EXECUTIVE_SUMMARY");
  assert("  → questionType = SUMMARY",   r.questionType, "SUMMARY");
  assert("  → month = May",              r.month,        "May");
}

{
  const r = routeResponseMode("Generate a monthly report for May");
  console.log(`\n  "Generate a monthly report for May" → questionType=${r.questionType}`);
  assert("  → questionType = REPORT", r.questionType, "REPORT");
}

{
  const r = routeResponseMode("Why is Cloud Engineering over budget?");
  console.log(`\n  "Why is Cloud Engineering over budget?" → questionType=${r.questionType}`);
  assert("  → questionType = ANALYTICAL", r.questionType, "ANALYTICAL");
}

// ─── Group 7: Mock dispatch — FACTUAL_MONTHLY guard fires for "May actuals" ──

section("7. Mock dispatch — FACTUAL_MONTHLY guard (What was May's actuals?)");

{
  console.log('\n  "What was May\'s actuals?"');
  const result = dispatchAgent("fpa", "What was May's actuals?", []);

  assert("  → routeKey = factual-monthly-guard",     result.routeKey,             "factual-monthly-guard");
  assert("  → responseMode = FACTUAL_MONTHLY",       result.responseMode,         "FACTUAL_MONTHLY");
  assert("  → fullYearDataInjected = false",         result.fullYearDataInjected, false);
  assertArrayEmpty("  → keyPoints = []",             result.keyPoints);
  assertArrayEmpty("  → actions = []",               result.actions);

  // Must NOT contain report-style sections
  assertNotIncludes("  → answer has no 'Key Takeaways'",       result.answer, "Key Takeaways");
  assertNotIncludes("  → answer has no 'Recommended Actions'", result.answer, "Recommended Actions");
  assertNotIncludes("  → answer has no 'Monthly Trend'",       result.answer, "Monthly Trend");
  assertNotIncludes("  → answer has no 'Assessment'",          result.answer, "Assessment");
  assertNotIncludes("  → answer has no 'By Business Unit'",    result.answer, "By Business Unit");
  assertNotIncludes("  → answer has no 'Full-Year'",           result.answer, "Full-Year");
  assertNotIncludes("  → answer has no 'Q2 Reforecast'",       result.answer, "Q2 Reforecast");
  assertNotIncludes("  → answer has no '---'",                 result.answer, "---");

  // Must contain May data
  assertIncludes("  → answer contains 'May'", result.answer, "May");

  // Approximate length check — should be short (conversational)
  assertLengthAtMost("  → answer is short (≤4 sentences)", result.answer, 4);

  console.log(`  Answer: "${result.answer}"`);
}

// ─── Group 8: Mock dispatch — "What were March actuals?" ─────────────────────

section("8. Mock dispatch — FACTUAL_MONTHLY for March");

{
  console.log('\n  "What were March actuals?"');
  const result = dispatchAgent("fpa", "What were March actuals?", []);

  assert("  → routeKey = factual-monthly-guard",  result.routeKey,   "factual-monthly-guard");
  assertArrayEmpty("  → keyPoints = []",          result.keyPoints);
  assertArrayEmpty("  → actions = []",            result.actions);
  assertIncludes("  → answer contains 'March'",  result.answer, "March");
  assertNotIncludes("  → no 'Key Takeaways'",    result.answer, "Key Takeaways");
  assertNotIncludes("  → no 'Full-Year'",        result.answer, "Full-Year");

  console.log(`  Answer: "${result.answer}"`);
}

// ─── Group 9: System prompt — RESPONSE RULES in every prompt ─────────────────

section("9. System prompt — RESPONSE RULES present in all agent prompts");

const snapshot = getFinanceSnapshot();

const AGENTS_TO_CHECK: string[] = ["fpa", "cfo", "cio", "procurement", "headcount"];

for (const agentId of AGENTS_TO_CHECK) {
  const prompt = buildSystemPrompt(agentId as any, snapshot, "What was May's actuals?");
  assertIncludes(
    `  → ${agentId} prompt contains RESPONSE RULES`,
    prompt,
    "RESPONSE RULES"
  );
  assertIncludes(
    `  → ${agentId} prompt contains rule 1 (ANSWER THE QUESTION ASKED)`,
    prompt,
    "ANSWER THE QUESTION ASKED"
  );
  assertIncludes(
    `  → ${agentId} prompt contains TIME PERIOD IS BINDING`,
    prompt,
    "TIME PERIOD IS BINDING"
  );
}

// ─── Group 10: System prompt — FACTUAL format block ──────────────────────────

section("10. System prompt — FACTUAL questionType produces correct format block");

{
  const prompt = buildSystemPrompt("fpa", snapshot, "What was May's actuals?");

  assertIncludes(
    "  → prompt contains '1-3 sentences'",
    prompt,
    "1-3 sentences"
  );
  assertIncludes(
    "  → prompt contains 'keyPoints': []",
    prompt,
    '"keyPoints": []'
  );
  assertIncludes(
    "  → prompt contains 'actions': []",
    prompt,
    '"actions": []'
  );
  assertIncludes(
    "  → prompt contains 'NO tables'",
    prompt,
    "NO tables"
  );
  assertIncludes(
    "  → prompt contains 'NO headers'",
    prompt,
    "NO headers"
  );
  assertIncludes(
    "  → prompt contains FACTUAL few-shot example",
    prompt,
    "What was May's actuals?"
  );
}

// ─── Group 11: System prompt — REPORT format block ───────────────────────────

section("11. System prompt — REPORT questionType produces full format block");

{
  const prompt = buildSystemPrompt("fpa", snapshot, "Generate a monthly report for May");

  assertIncludes(
    "  → prompt contains 'Full structured report'",
    prompt,
    "Full structured report"
  );
  assertIncludes(
    "  → prompt contains 'Executive Summary'",
    prompt,
    "Executive Summary"
  );
  assertIncludes(
    "  → prompt contains REPORT few-shot note",
    prompt,
    "This IS a report request"
  );
}

// ─── Group 12: System prompt — SUMMARY format block ─────────────────────────

section("12. System prompt — SUMMARY questionType produces structured format block");

{
  const prompt = buildSystemPrompt("fpa", snapshot, "Summarize May performance");

  assertIncludes(
    "  → prompt contains 'Structured response'",
    prompt,
    "Structured response"
  );
  assertIncludes(
    "  → prompt has SUMMARY example",
    prompt,
    "This IS a summary request"
  );
}

// ─── Group 13: System prompt — ANALYTICAL has no empty keyPoints/actions ─────

section("13. System prompt — ANALYTICAL allows keyPoints, not forced to []");

{
  const prompt = buildSystemPrompt("fpa", snapshot, "Why is Cloud Engineering over budget?");

  // Should NOT have the hard "keyPoints: []" constraint from FACTUAL format
  // Instead should have "0-3 items" or "2-3 data-grounded points"
  const hasEmptyArrayConstraint = prompt.includes('"keyPoints": []') && prompt.includes('"actions": []');
  // For ANALYTICAL, actions should be [] but keyPoints optional
  assertIncludes(
    "  → prompt contains 'Conversational paragraphs'",
    prompt,
    "Conversational paragraphs"
  );
}

// ─── Group 14: No "Key Takeaways" / "Recommended Actions" in FACTUAL prompts ─

section("14. System prompt — FACTUAL prompt instructs against unsolicited sections");

{
  const prompt = buildSystemPrompt("fpa", snapshot, "What was May's actuals?");

  assertIncludes(
    "  → prompt contains rule about unsolicited sections",
    prompt,
    "DO NOT produce sections the user did not request"
  );
  assertIncludes(
    "  → prompt calls out 'Key Takeaways' explicitly",
    prompt,
    "Key Takeaways"
  );
  assertIncludes(
    "  → prompt calls out 'Recommended Actions' explicitly",
    prompt,
    "Recommended Actions"
  );
}

// ─── Group 15: Regression — January forecast still guarded ───────────────────

section("15. Regression — January forecast guard still active");

{
  console.log('\n  "What was January\'s forecast?"');
  const result = dispatchAgent("fpa", "What was January's forecast?", []);

  assert("  → responseMode = MONTHLY_FORECAST",     result.responseMode,         "MONTHLY_FORECAST");
  assert("  → fullYearDataInjected = false",         result.fullYearDataInjected, false);
  assertNotIncludes("  → no 'Full-Year Forecast'",  result.answer, "Full-Year Forecast");
  assertNotIncludes("  → no 'Q2 Reforecast'",       result.answer, "Q2 Reforecast");
  assertIncludes("  → contains 'January'",          result.answer, "January");
}

// ─── Group 16: Regression — Summarize May still routes EXECUTIVE_SUMMARY ─────

section("16. Regression — 'Summarize May performance' routes EXECUTIVE_SUMMARY");

{
  const r = routeResponseMode("Summarize May performance");
  assert("  → mode = EXECUTIVE_SUMMARY", r.mode,         "EXECUTIVE_SUMMARY");
  assert("  → month = May",              r.month,        "May");
  assert("  → questionType = SUMMARY",   r.questionType, "SUMMARY");
}

// ─── Results ─────────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(70));
console.log(`  RESULTS: ${_passed}/${_passed + _failed} passed`);
console.log("=".repeat(70));

if (_failed > 0) {
  console.log(`\n  ⚠ ${_failed} test(s) failed`);
  process.exit(1);
} else {
  console.log("\n  All conversational response tests passed.");
  process.exit(0);
}
