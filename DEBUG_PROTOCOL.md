# DEBUG_PROTOCOL.md

## Purpose

Use this file before changing agent behavior.

## Investigation Steps

Trace the full response pipeline:

```text
Question
→ Intent
→ Data Retrieval
→ Prompt Construction
→ Claude Request
→ Response Parser
→ UI Rendering
```

## Find

Search for:

```text
template
report
executive
summary
scorecard
briefing
monthly
title
sections
responseMode
promptType
format
wrapper
```

## Identify

Document any:

1. Hardcoded titles
2. Report templates
3. Forced output formats
4. Executive summary generators
5. Response wrappers
6. Agent context forcing report layouts
7. UI components that rename direct answers as reports

## Logging Requirements

Add or verify logging for:

```text
templateUsed
responseMode
promptType
agentId
question
intent
retrievedDataKeys
```

## Test Cases

After changes, verify:

### Test 1

Input:

```text
What is June's forecast?
```

Expected:

```text
Direct June forecast answer.
No report title.
No executive summary.
No full-year report unless relevant.
```

### Test 2

Input:

```text
What were May actuals?
```

Expected:

```text
Direct May actuals answer.
No YTD report unless asked.
No canned report title.
```

### Test 3

Input:

```text
Create an executive summary.
```

Expected:

```text
Report-style response allowed.
Executive summary mode activated.
```

## Completion Criteria

The fix is complete only when:

* Default `responseMode` is `question_answering`
* No report template is used for direct questions
* Claude receives only relevant data
* UI displays the answer without forcing report formatting
* Logs confirm `templateUsed = false` for direct questions
