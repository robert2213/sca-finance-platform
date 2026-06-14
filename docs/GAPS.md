# Gaps, Deferred Items & Known Tech Debt

## Deferred This Session

| Item | Location | Notes |
|---|---|---|
| PowerPoint rendering | `src/lib/reporting/` | Add `pptxgenjs` — generator produces JSON only right now |
| Route-level role guards | `src/app/layout.tsx` + all pages | `// TODO: Apply route-level role guards — see /lib/auth/roles.ts` |
| Clerk / auth wiring | `src/lib/auth/roles.ts` | Roles and `hasPermission()` defined but no auth provider installed |
| LLM connection (Claude API) | `src/agents/agentEngine.ts` | Add `ANTHROPIC_API_KEY` + replace mock dispatch — see HANDOFF.md §5 |
| Cost-center-scoped access | `finance-bp` agent | BPs should see only their BU's data — requires auth + row-level filtering |
| Connector implementations | `src/lib/ingestion/connectors/index.ts` | All 7 connectors are stubs — implement per integration priority |
| Alignment validator wire-up | `validation.runner.ts` | `alignment.validator.ts` exists but is not called from the runner (requires paired actuals + forecasts) |
| Multi-tenant data isolation | All fact tables | `clientId` field present on all types; DB-level filtering not yet enforced |

## Known Tech Debt (Pre-V2)

| Issue | File | Impact |
|---|---|---|
| "Nexora" narrative in agent responses | `src/agents/responses/cfo.ts`, `cio.ts`, `fpa.ts` | Should use `clientName` from config |
| "Nexora" in architecture page | `src/app/architecture/page.tsx` | Multiple hardcoded strings — low priority for demo |
| "Nexora" in dashboard narrative | `src/app/page.tsx`, `src/app/cio/page.tsx` | Replace with config-driven summary |
| `FinanceSnapshot` module-level cache | `src/agents/dataContext.ts` | Stale data in hot-reload dev; needs per-request scope in production |
| `prior` KPI field fabricated | `src/lib/metrics.ts` | `kpi.prior = budget * 0.94` — not real prior-period data |
| Full-year forecast is linear run-rate | `src/lib/metrics.ts` | `ytdActual / 5 * 12` — no phasing, seasonality, or committed spend |
| Tailwind `nexora-*` color tokens | `tailwind.config.ts` | Can be parameterized per client via CSS variables if needed |
| `AgentChatPanel.tsx` dead component | `src/components/agents/` | Not imported anywhere; safe to delete |

## Future Capabilities (Not Scoped)

- **Delta Live Tables** for risk engine (Databricks DLT expectations → risk table)
- **MLflow forecast models** (ARIMA/Prophet via Databricks Model Serving)
- **Slack/Teams notifications** from risk engine flags
- **PDF export** for executive dashboard (react-pdf)
- **Databricks Genie integration** to replace mock agent responses
- **Workday Adaptive Planning** budget import
- **Audit log** for data uploads and config changes
