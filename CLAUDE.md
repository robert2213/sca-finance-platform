# CLAUDE.md

Read this before acting.

## Prime Directive

Do not code immediately.

First:

1. Read `HANDOFF_PIPELINE.docx`
2. Read `HANDOFF.md`
3. Read `ARCHITECTURE_PRINCIPLES.md`
4. Read `DEBUG_PROTOCOL.md`

## Default Behavior

Analyze first. Code second.

Before making changes:

* Identify the issue
* Trace the impacted files
* Explain the root cause
* Propose the smallest safe fix
* Then modify code

## Product Goal

Nexora must behave like a finance analyst, not a report generator.

Default flow:

```text
Question → Relevant Data → Claude Analysis → Direct Answer
```

Do not default to:

```text
Question → Template → Populate Template → Report
```

## Current Priority

Fix agent behavior.

Agents must answer the user’s question directly using available data.

Do not add features until the question-answering pipeline works reliably.

## Do Not

* Add new dashboards
* Add new agents
* Add new UI features
* Rewrite large files unnecessarily
* Use report templates for direct questions
* Generate executive summaries unless requested
* Change unrelated files

## Required Output Before Coding

Return:

```text
Issue:
Root Cause:
Files Involved:
Fix Plan:
Risk:
```

Then wait only if the task is unclear. Otherwise proceed.
