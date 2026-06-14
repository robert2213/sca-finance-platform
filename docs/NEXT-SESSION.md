# Recommended Next-Session Prompt

Copy and paste the block below to start the next Claude Code session:

---

## Session Start Prompt

```
You are a senior TypeScript/Next.js engineer working on the SCA Finance Platform 
(nexora-ai-finance project on the Desktop).

Read HANDOFF.md and AUDIT.md for context. Read docs/GAPS.md for deferred items.

## Context

The V2 foundation is complete. All 8 phases shipped:
- Phase 1: /config/client.config.ts + ClientConfigProvider + Sidebar "Nexora" replaced
- Phase 2: /lib/models/finance.types.ts (flat typed interfaces with clientId/period/source)
- Phase 3: /lib/ingestion/ (parsers, 6 mappers, 7 connector stubs, orchestrator) + /data/seed/ CSVs
- Phase 4: /lib/validation/ (8 validators + runner returning ValidationResult)
- Phase 5: /lib/agents/ (7 typed AgentContext objects with shared BASE_GUARDRAILS)
- Phase 6: /lib/reporting/ (ExecReportOutput schema + generator + monthly template stub)
- Phase 7: /lib/auth/roles.ts (4 roles, 7 permissions, hasPermission())
- Phase 8: /docs/ complete (ARCHITECTURE, DATA-MODEL, CLIENT-CONFIG, INGESTION, VALIDATION, 
           AGENT-CONTEXTS, SECURITY, GAPS, NEXT-SESSION)

## Priorities for This Session

### Priority 1 — Wire Claude API to Agent Workspace

File to modify: src/agents/agentEngine.ts
- Replace the mock keyword-scoring dispatch with an Anthropic SDK call
- Use the AgentContext from src/lib/agents/agent.registry.ts to build the system prompt
- The FinanceSnapshot from src/agents/dataContext.ts becomes the data context block
- Preserve all existing UI — only agentEngine.ts changes
- Stream responses via the existing /api/agent route handler
- Env: ANTHROPIC_API_KEY must be in .env.local

Reference: HANDOFF.md §5 (Upgrading to Real LLM) — code example is there.
Reference: src/lib/agents/contexts/cfo.agent.ts — system prompt template in AGENT-CONTEXTS.md

### Priority 2 — Route Guards

- Install Clerk: npm install @clerk/nextjs
- Create middleware.ts (template in docs/SECURITY.md)
- Apply hasPermission() checks in API route handlers (/api/ingest, /api/db/*)
- Do NOT add auth to existing page components this session — API layer only

### Priority 3 — Agent Narrative Uses clientName

Files: src/agents/responses/cfo.ts, cio.ts, fpa.ts
- Replace all hardcoded "Nexora" references in agent response strings
- Use defaultConfig.clientName from src/config/client.config.ts
- These are string templates — a simple find/replace + import

### Priority 4 — Load Synthetic Data (if not verified)

Run: tests/load-synthetic-data.ps1 (requires dev server on localhost:3000)
Expected: fact_transactions=1080, dim_headcount=58, dim_vendor=30
Verify: npm run dev → http://localhost:3000 → confirm dashboards show data

## Hard Constraints

- No hardcoded client names in any file ("Nexora", real companies)
- No UI redesign
- No silent failures
- No real credentials in source code

## Files to Read Before Starting

1. src/agents/agentEngine.ts (dispatch logic to replace)
2. src/lib/agents/contexts/cfo.agent.ts (system prompt building block)
3. src/lib/auth/roles.ts (hasPermission for API guards)
4. docs/GAPS.md (full list of deferred items)
```

---

## Quick Reference

| Task | File |
|---|---|
| Change client branding | `src/config/client.config.ts` |
| Wire Claude API | `src/agents/agentEngine.ts` |
| Add a new agent | `src/lib/agents/contexts/[agent].agent.ts` + registry |
| Add a new data type | `src/lib/ingestion/mappers/` + orchestrator + validation runner |
| Add auth | `src/lib/auth/roles.ts` already defined — install Clerk + create middleware.ts |
| Add reporting section | `src/lib/reporting/executive-report.generator.ts` |
