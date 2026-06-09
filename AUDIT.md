# Codebase Audit — SCA Finance Platform V2 Refactor

**Date:** June 8, 2026  
**Purpose:** Pre-code audit required before any V2 changes. Documents current state of the codebase for white-label B2B SaaS refactor.

---

## 1. Top-Level Directory Structure

```
nexora-ai-finance/
├── .env.example / .env.local       # Env config (Databricks creds, app name)
├── ARCHITECTURE.md / HANDOFF.md    # Documentation
├── AUDIT.md                        # ← This file
├── data/                           # nexora-local.sqlite (SQLite fallback DB)
├── docs/                           # ← To be created (Phase 8)
├── public/                         # Static assets
├── scripts/                        # Utility scripts
├── src/
│   ├── agents/                     # AI agent dispatch + per-agent response libraries
│   ├── app/                        # Next.js App Router (18 routes)
│   ├── components/                 # UI components (layout, dashboard, charts, ui)
│   ├── data/                       # Static mock data (TypeScript arrays)
│   ├── hooks/                      # useConversation (chat history persistence)
│   ├── lib/                        # Core utilities, adapters, queries, ingestion, schema
│   └── types/                      # finance.ts — TypeScript domain types
├── tailwind.config.ts              # Defines "nexora" color palette (50-950 shades)
├── tests/                          # generate-synthetic-data.js, load-synthetic-data.ps1, CSVs
└── package.json                    # No auth dependencies present
```

---

## 2. Hardcoded "Nexora" References in Layout/Nav/Header

### BLOCKING — Must Replace Before White-Label Deploy

| File | Line | Type | Exact Text |
|---|---|---|---|
| `src/components/layout/Sidebar.tsx` | 89 | **Logo text** | `<p>Nexora</p>` |
| `src/app/layout.tsx` | 6 | **Page title** | `default: "Nexora AI Finance"` |
| `src/app/layout.tsx` | 7 | **Page title template** | `template: "%s — Nexora AI Finance"` |

### Non-Blocking — Narrative / Agent Responses

| File | Location | Text |
|---|---|---|
| `src/components/dashboard/ExecutiveSummaryBox.tsx` | Line 70 | "Powered by Nexora AI" footer |
| `src/app/agents/page.tsx` | Line 43 | "Nexora AI Finance Team" heading |
| `src/app/architecture/page.tsx` | Multiple | "Nexora Analytics Platform", "What Nexora delivers" etc. |
| `src/app/page.tsx` | Line 199 | "tied to the Nexora AI platform roadmap" (narrative) |
| `src/app/cio/page.tsx` | Line 94 | "strategically aligned with the Nexora AI platform roadmap" |
| `src/app/data-ingestion/page.tsx` | Line 61 | "Fields mapped to Nexora data model" |
| `src/app/data-ingestion/DataIngestionClient.tsx` | Line 175 | "Nexora maps the columns automatically" |
| `src/agents/responses/cfo.ts` | Multiple | "Nexora platform roadmap" |
| `src/agents/responses/cio.ts` | Multiple | "Nexora AI inference platform" |
| `src/agents/responses/fpa.ts` | Multiple | "Nexora AI inference platform" |
| `src/lib/ingestion/field-mapper.ts` | Header comment | "Maps raw parsed rows to the Nexora finance data model" |
| `src/lib/schema/ddl.ts` | Header comment | "Databricks Delta Lake tables used by Nexora" |
| `src/app/api/db/init/route.ts` | Line 26 | Default catalog: "nexora" |

### Styling (Intentional — Keep for Now)

The `nexora-*` CSS color palette in `tailwind.config.ts` is a design system token, not a brand reference. Color tokens stay as-is; only visible text strings need parameterization.

---

## 3. Components Consuming Mock/Static Data

All data flows through `src/data/index.ts` which re-exports static TypeScript arrays:

| File | Imports From | Purpose |
|---|---|---|
| `src/lib/metrics.ts` | All data files | KPI computation |
| `src/lib/riskEngine.ts` | All data files | Risk flag generation |
| `src/agents/dataContext.ts` | All data files | Builds FinanceSnapshot for agents |
| `src/components/dashboard/StatsBanner.tsx` | All data files | Top stats strip |
| `src/app/page.tsx` | cloudSpend | Dashboard cloud KPIs |

The `getFinanceSnapshot()` in `dataContext.ts` is the central aggregator — it's module-cached and consumed by all 6 agent response libraries. This is the primary integration surface for replacing mock data with live Databricks queries.

---

## 4. Clerk / Auth Configuration

**None found.** No `@clerk/nextjs`, `next-auth`, or any auth library in `package.json`. No `CLERK_*` or `NEXTAUTH_*` env vars. No `middleware.ts`. No route guards.

**Implication:** App is single-tenant, unauthenticated. Auth is required before any multi-client deployment.

---

## 5. Existing lib / config / types / data Folders

### `src/lib/` — Core Utilities (existing)

| Path | Description |
|---|---|
| `databricks.ts` | Connection factory — picks Databricks or SQLite fallback |
| `formatters.ts` | `formatCurrency`, `formatPercent`, `formatDate`, `daysUntil` |
| `metrics.ts` | `buildDashboardKPIs()` — 6 KPI objects |
| `riskEngine.ts` | `generateRiskFlags()` + `generateRecommendedActions()` |
| `adapters/databricks-adapter.ts` | Real Databricks SQL connection |
| `adapters/local-adapter.ts` | sql.js SQLite in-memory fallback |
| `queries/` | Domain query builders (actuals, contractors, headcount, kpi, vendors) |
| `ingestion/` | CSV/Excel import pipeline (csv-parser, excel-parser, field-mapper, cleaner, writer) |
| `schema/ddl.ts` | Databricks Delta Lake DDL for 7 tables |

### `src/types/` — TypeScript Types (existing)

Single file: `finance.ts` — defines `Month`, `BusinessUnit`, `CostCategory`, `ActualRecord`, `Vendor`, `Contractor`, `HeadcountRecord`, `CloudSpendRecord`, `AgentId`, `RiskFlag`, `ActionItem`, `KPI`.

### `src/data/` — Static Mock Data (existing, demo only)

Six files: `actuals.ts`, `cloudSpend.ts`, `externalLabor.ts`, `headcount.ts`, `vendors.ts`, `index.ts`. All are TypeScript arrays representing YTD May 2026 for a fictional IT organization.

### No `/config/` folder exists yet.

---

## 6. Refactor Blockers Summary

| Priority | Issue | Phase That Fixes It |
|---|---|---|
| P0 | "Nexora" in logo text, page titles | Phase 1 |
| P0 | No client configuration layer | Phase 1 |
| P1 | Finance types missing clientId, period, source fields | Phase 2 |
| P1 | Ingestion pipeline lacks mapper/connector abstraction | Phase 3 |
| P1 | No validation layer | Phase 4 |
| P2 | Agent contexts are implicit (no typed schema) | Phase 5 |
| P2 | No executive report schema | Phase 6 |
| P2 | No auth/roles layer | Phase 7 |
| P3 | No onboarding docs | Phase 8 |

---

*Audit complete. Proceeding to Phase 1.*
