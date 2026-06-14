# Architecture

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 14.2.5 (App Router) | Server + client components, SSG |
| Language | TypeScript 5 | Strict mode, `@/` path aliases |
| Styling | Tailwind CSS 3.4 | `nexora-*` color scale |
| Charts | Recharts 2.12 | React-native bar, line, area charts |
| DB (primary) | Databricks SQL | Via `@databricks/sql` |
| DB (fallback) | SQLite (sql.js) | In-memory, disk-persisted at `data/nexora-local.sqlite` |
| Auth | None (planned: Clerk) | See `/docs/SECURITY.md` |
| Deployment | Vercel | Auto-deploys from `main` |

## Folder Structure

```
nexora-ai-finance/
├── data/seed/              ← Generic seed CSVs (demo data only)
├── docs/                   ← All architecture and onboarding docs
├── src/
│   ├── agents/             ← Existing mock agent dispatch + response libraries
│   ├── app/                ← Next.js pages and API routes (18 routes)
│   ├── components/         ← UI components (layout, dashboard, charts, ui)
│   ├── config/             ← ClientConfig — single source of truth for client settings
│   │   └── client.config.ts
│   ├── data/               ← Static mock TypeScript arrays (demo fallback)
│   ├── hooks/              ← useConversation (chat persistence)
│   ├── lib/
│   │   ├── adapters/       ← Databricks + SQLite adapters
│   │   ├── agents/         ← Typed AgentContext objects + registry (Phase 5)
│   │   ├── auth/           ← Role definitions and hasPermission() (Phase 7)
│   │   ├── hooks/          ← useClientConfig React context hook (Phase 1)
│   │   ├── ingestion/      ← Parse → map → orchestrate pipeline (Phase 3)
│   │   │   ├── parsers/
│   │   │   ├── mappers/
│   │   │   └── connectors/
│   │   ├── models/         ← Canonical TypeScript interfaces (Phase 2)
│   │   ├── queries/        ← Databricks SQL query builders
│   │   ├── reporting/      ← Executive report schema + generator (Phase 6)
│   │   ├── schema/         ← Databricks Delta DDL
│   │   └── validation/     ← Validation runner + 8 validators (Phase 4)
│   └── types/              ← Legacy finance.ts types (pre-V2)
└── tests/                  ← Synthetic data CSVs + load scripts
```

## Data Flow

```
External System / CSV Upload
        ↓
  parsers/ (csv.parser.ts, xlsx.parser.ts)
        ↓
  mappers/ (gl.mapper.ts, budget.mapper.ts, ...)
        ↓
  ingest.orchestrator.ts
        ↓
  validation.runner.ts  ←  ClientConfig (valid CC, accounts, periods)
        ↓
  writer.ts / Databricks SQL
        ↓
  queries/ (actuals.ts, vendors.ts, headcount.ts, ...)
        ↓
  agents/dataContext.ts  → FinanceSnapshot
        ↓
  src/agents/responses/*.ts  OR  Claude API
        ↓
  AgentWorkspace UI
```

## Client Configuration Flow

```
src/config/client.config.ts
        ↓
ClientConfigProvider (wraps RootLayout)
        ↓
useClientConfig() hook → any client component
src/app/layout.tsx → metadata (server import)
```

## Multi-Tenant Isolation

Not yet implemented. All records in the current schema include a `clientId` field (defined in `src/lib/models/finance.types.ts`) ready for row-level filtering once auth is wired. See `docs/SECURITY.md`.

## Key Design Decisions

- **Flat types** — all finance interfaces use flat fields, no deep nesting, for easy DB mapping
- **Mapper pattern** — each data type has a dedicated mapper; adding a new type means one new mapper + one new case in the orchestrator
- **Validators receive ClientConfig** — no hardcoded valid-value lists; config drives cross-reference checks
- **Agent contexts are structural, not behavioral** — `src/lib/agents/` defines what agents can do; `src/agents/responses/` implements mock behavior; a real LLM replaces the mock with no structural change
- **Never throw silently** — all parsers, mappers, and validators return `{ data, warnings }` or `ValidationResult`
