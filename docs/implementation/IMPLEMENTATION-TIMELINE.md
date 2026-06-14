# Implementation Timeline

**Owner:** Sin City Analytics — Implementation Lead
**Purpose:** Recommended schedules for taking a client from signed agreement to go-live, mapped to the 8 phases in the [Implementation Playbook](IMPLEMENTATION-PLAYBOOK.md).

Pick a track using the complexity tier from the [Client Readiness Assessment](CLIENT-READINESS-ASSESSMENT.md):

| Readiness result | Track | Duration |
|---|---|---|
| Low Complexity | **Fast-track** | 2 weeks |
| Medium Complexity | **Standard** | 4 weeks |
| High Complexity | **Enterprise** | 8 weeks |

All three tracks run the **same 8 phases**. The difference is calendar time, the number of data types and business units, and how much mapping/validation iteration the data demands — not skipped steps.

---

## Fast-Track Implementation — 2 weeks

For clients with clean, accessible data, few cost centers, and one or two data types (typically `gl-actuals` + `budget`). Low Complexity score.

| Week | Phases | Focus |
|---|---|---|
| **Week 1** | Phase 1 Discovery → Phase 2 Data Inventory → Phase 3 Mapping | Discovery session day 1–2; samples by day 3; mapping signed off by end of week. |
| **Week 2** | Phase 4 Load → Phase 5 Validation → Phase 6 Dashboards → Phase 7 Agents → Phase 8 Go-Live | Load + validate early week; dashboard/agent review mid-week; go-live by Friday. |

**Fast-track assumptions:** ≤ 2 data types, ≤ ~10 cost centers, data exports already available, Databricks (or clean CSV) ready, one decision-maker. If any assumption breaks, move to Standard.

---

## Standard Implementation — 4 weeks

The default for most clients: 3–4 data types, a real org hierarchy, a normal monthly close. Medium Complexity score.

| Week | Phases | Focus |
|---|---|---|
| **Week 1** | Phase 1 Discovery + Phase 2 Data Inventory | Discovery session, stakeholder map, config draft, export access requests, sample collection. |
| **Week 2** | Phase 3 Mapping + Phase 5 Validation prep | Map all data types, finalize client config reference sets, dry-run uploads, resolve errors. |
| **Week 3** | Phase 4 Initial Load + Phase 6 Dashboard Review | Durable load to `fact_transactions`, reconcile totals, walk dashboards on real data. |
| **Week 4** | Phase 7 Agent Review + Phase 8 Go-Live | Test the question set per agent, tune guardrails, train users, go-live + 30-day check-in booked. |

**Standard assumptions:** ≤ 4 data types, single chart of accounts, monthly file-based refresh, 2–3 stakeholders, modest mapping iteration.

---

## Enterprise Implementation — 8 weeks

For complex clients: 5–6 data types, multiple business units, messy or multi-source data, several stakeholders, stricter governance. High Complexity score.

| Week | Phases | Focus |
|---|---|---|
| **Week 1** | Phase 0 Kickoff + Phase 1 Discovery | Kickoff, governance, stakeholder alignment, full discovery, access provisioning kicked off early. |
| **Week 2** | Phase 1 Discovery (deep) + Phase 2 Data Inventory | Multi-system inventory, org-map reconciliation, volume sizing, readiness scoring finalized. |
| **Week 3** | Phase 3 Data Mapping (all types) | Map every data type; resolve grain/sign/crosswalk decisions across systems. |
| **Week 4** | Phase 3 Mapping iteration + dry runs | Iterate on warnings/errors; align config reference sets; sign off mapping. |
| **Week 5** | Phase 4 Initial Load | Staged loads per data type; reconcile each against source; confirm `databricks` backend. |
| **Week 6** | Phase 5 Validation | Full validation report, total reconciliation vs. client close, data-quality sign-off. |
| **Week 7** | Phase 6 Dashboards + Phase 7 Agents | Module-by-module dashboard review; agent question-set testing across all enabled agents. |
| **Week 8** | Phase 8 Go-Live + Hypercare | Production cutover, monthly runbook, training, first live refresh with the client, hypercare window. |

**Enterprise assumptions:** 5–6 data types, multiple BUs/charts, possible warehouse-connector scoping (separate workstream), formal sign-offs, data-governance review.

---

## Phase-to-week reference (all tracks)

| Phase | Fast-track | Standard | Enterprise |
|---|---|---|---|
| 0 Kickoff | Day 0 | Day 0 | Week 1 |
| 1 Discovery | Week 1 | Week 1 | Weeks 1–2 |
| 2 Data Inventory | Week 1 | Week 1 | Week 2 |
| 3 Mapping | Week 1 | Week 2 | Weeks 3–4 |
| 4 Initial Load | Week 2 | Week 3 | Week 5 |
| 5 Validation | Week 2 | Weeks 2–3 | Week 6 |
| 6 Dashboard Review | Week 2 | Week 3 | Week 7 |
| 7 Agent Review | Week 2 | Week 4 | Week 7 |
| 8 Go-Live | Week 2 | Week 4 | Week 8 |

---

## Scheduling guidance

- **Start access provisioning on day 0.** Export access to the GL/HRIS is the single most common cause of slippage — request it before discovery finishes.
- **Mapping iteration is the variable cost.** Clean data finishes mapping in days; messy multi-source data is where Enterprise weeks 3–4 go.
- **Never compress validation (Phase 5).** Showing dashboards on un-reconciled numbers destroys trust and is the fastest way to lose a pilot.
- **One data type can move a track.** Adding `forecast`, `vendors`, or `external-labor` mid-stream usually bumps Fast-track → Standard. Re-score rather than absorb silently.
- **Go-live includes one real refresh.** A track isn't done until the client has run the monthly export → upload → validate loop once, with you watching.

---

## What does *not* change by track

Regardless of track, onboarding is **configuration + data only**: a new `client.config.ts`, mapped client data loaded to Databricks, and validated dashboards/agents. No new dashboards, agents, connectors, or features are built during an implementation. Feature gaps discovered during onboarding are logged as product requests and handled outside the engagement.
