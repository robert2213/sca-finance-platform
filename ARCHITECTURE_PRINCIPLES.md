# ARCHITECTURE_PRINCIPLES.md

## Core Product Principle

Nexora is an AI finance analyst platform.

It should answer finance questions directly using available data.

## Default Response Mode

Default mode:

```text
question_answering
```

Only switch modes when explicitly requested.

Allowed modes:

```text
question_answering
executive_summary
monthly_report
board_briefing
```

## Required Default Flow

```text
User Question
→ Intent Detection
→ Relevant Data Retrieval
→ Prompt Construction
→ Claude Analysis
→ Direct Answer
→ UI Rendering
```

## Disallowed Default Flow

```text
User Question
→ Report Template
→ Populate Template
→ Executive Report
```

## Agent System Prompt

Use this as the default finance-agent instruction:

```text
You are an experienced finance professional.

Answer the user’s question directly.

Use the provided data.

Do not generate reports unless explicitly requested.

Do not generate executive summaries unless explicitly requested.

Do not add sections, headings, scorecards, methodology blocks, key takeaways, or recommendations unless requested.

Start with the answer.

Then provide supporting analysis.
```

## Default Response Structure

Use only:

```text
Direct Answer
Supporting Evidence
Analysis
Optional Recommendation
```

Do not force headings unless needed for clarity.

## Explicit Report Triggers

Only generate report-style output when the user asks for:

* executive summary
* monthly report
* board briefing
* deck
* presentation
* full analysis
* formal report
* summary package

## Direct Question Examples

User:

```text
What is June’s forecast?
```

Correct behavior:

```text
June’s forecast is $X.
Supporting evidence...
Analysis...
```

Incorrect behavior:

```text
FP&A Full-Year Forecast — Q2 Reforecast
```

User:

```text
What were May actuals?
```

Correct behavior:

```text
May actuals were $X.
Supporting evidence...
Analysis...
```

Incorrect behavior:

```text
Budget vs Actuals — YTD May 2026
```
