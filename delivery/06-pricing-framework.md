# Pricing Framework — Nexora Finance Intelligence Platform

> **Deliverable 6 of 9** in the Sin City Analytics Operational Delivery Framework. This document is the **commercial decision system** for the platform and its services. It defines pricing philosophy, service-line packaging, the drivers and levers that move a deal, and the guardrails that protect margin and value — **but it assigns no final dollar values.** Every monetary figure is a `[PLACEHOLDER]` to be populated from the live rate card and approved by Commercial.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 06 — Pricing Framework |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — Commercial |
| **Audience** | Sales (Account Executives, Sales Engineering) · Delivery Leadership (Delivery Leads, Solution Architects, Engagement Managers) · Finance & RevOps |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Classification** | Confidential — Internal Commercial Material. **Do not distribute externally.** Client-facing commercials are produced via `05-proposal-template.md`. |
| **Upstream Inputs** | `01-financial-intelligence-assessment-framework.md` (Discovery), `04-solution-design-framework.md` (scoped target state) |
| **Downstream Consumers** | `05-proposal-template.md`, `03-client-onboarding-playbook.md`, `08-design-partner-program.md`, `09-sales-to-implementation-handoff.md` |
| **Companion** | `06a-rate-card.xlsx` (controlled live document — holds the actual numbers this framework references as `[PLACEHOLDER]`) |

---

## Purpose

This framework exists to make Sin City Analytics' commercials **repeatable, defensible, and value-anchored** — so that two Account Executives pricing two similar engagements arrive at structurally identical proposals, and so that every dollar a client pays is traceable to a decision the platform helps them make better.

It does four things precisely:

1. **Declares the pricing philosophy** — value-based and outcome-anchored, with a clean separation between the recurring **platform subscription** and discrete **professional services**, structured for **land-and-expand**.
2. **Defines every service line** — Scope, Deliverables, When to use it, and the **drivers and levers** that move its price (never the price itself).
3. **Exposes the cross-cutting machinery** — the pricing dimensions, the subscription tiering matrix, packaging/bundling logic, a decision matrix that routes a deal to the right shape, and the discounting guardrails that protect margin.
4. **Frames value and ROI** so commercials are sold against outcomes, not line items, and hands Sales a reusable worksheet to build a quote.

> **Hard constraint — no dollar values.** This document is a *decision framework*. It carries drivers, levers, ranges-as-`[PLACEHOLDER]`, multipliers, and guardrail thresholds-as-`[PLACEHOLDER]`. The authoritative numbers live in the controlled rate card (`06a-rate-card.xlsx`) and are governed by the change process in Section 13. If you find a hard number in this file, it is a defect — report it.

> **Platform north star.** Nexora behaves like a finance analyst, not a report generator: **Question → Intent Detection → Relevant Data → AI (Claude) Analysis → Direct Answer.** We price the *answer*, not the dashboard. Every commercial conversation should be able to name the decision the client will make better, faster, or with more confidence because the platform is in place.

---

## How to Use This Document

- **Account Executives**: Read Sections 1–2 for philosophy, then jump to the relevant service-line sections (4–10). Use the **Pricing Decision Matrix (Section 12)** to determine deal shape, and the **Pricing Worksheet (Section 16)** to assemble the quote. Run every quote through the **Discounting & Deal Guardrails (Section 13)** before it leaves the building.
- **Delivery Leadership**: Sections 4–10 (service-line scope/deliverables) are the contract between what was sold and what gets built. Validate that scoped designs from `04-solution-design-framework.md` map cleanly onto a service line before commit. Section 13's escalation gates apply to delivery-led change orders too.
- **RevOps / Finance**: Sections 3, 11, 13, and 14 define the levers, the tier matrix structure, the guardrails, and the value metrics that should be instrumented in the CRM/CPQ.

**Notation conventions used throughout:**

| Token | Meaning |
|---|---|
| `[PLACEHOLDER]` | A value sourced from the controlled rate card; never hard-code here |
| `[$ / period]` | A recurring subscription figure (annual unless noted) |
| `[$ fixed]` | A fixed-fee professional-services figure |
| `[$ / day]` or `[$ / hr]` | A time-and-materials rate |
| `[× factor]` | A multiplier applied to a base (e.g., complexity uplift) |
| `[N%]` | A percentage threshold or discount cap |
| ⬩ Driver | An input that *raises or lowers* the price |
| ⬩ Lever | A *choice we control* to shape price/scope/margin |

---

## 1. Pricing Philosophy

Sin City Analytics prices on the principle that **clients buy decisions, not software**. The platform's entire reason for existing is to collapse the distance between a finance question and a trustworthy answer. Our commercials must reflect that — we anchor to the *value of the decision improved*, not the *cost of the bytes stored*.

### 1.1 The Five Commercial Principles

| # | Principle | What it means in practice |
|---|---|---|
| 1 | **Value-based, not cost-plus** | Price is anchored to the economic value of better/faster finance decisions for *this* client (close-cycle days saved, variance caught earlier, spend leakage recovered), not to our internal delivery cost. Cost sets the floor (margin guardrail), never the ceiling. |
| 2 | **Outcome-anchored** | Every commercial proposition names the decisions and outcomes it enables. A subscription tier is justified by the modules and agents it unlocks *and the questions those answer*, traced back to discovered pain points. |
| 3 | **Platform subscription ≠ professional services** | Two distinct revenue motions, priced on different logic and never blended into one opaque number. Subscription is recurring, value/usage-tiered, high-margin. Services are episodic, effort-and-complexity-driven, margin-managed. (See Section 1.3.) |
| 4 | **Land-and-expand** | We optimize for a *correct first land* — the smallest configuration that proves the north-star flow on the client's own data — then grow via modules, agents, business units, and connectors. The first deal is priced to *start the relationship*, not to maximize year-one extraction. |
| 5 | **Configuration, not custom code** | Because onboarding a tenant is a `ClientConfig` exercise with **zero platform code changes**, the marginal cost of an additional standard module/agent is near-zero. This is the economic engine behind expansion pricing and bundle margin — we capture value, not rebuild software. |

### 1.2 What We Are Willing — and Not Willing — to Do on Price

| We will | We will not |
|---|---|
| Anchor to client-specific value and ROI (Section 15) | Discount to win a logo we cannot deliver value for |
| Offer a low-friction entry land (Discovery, Foundation) | Sell professional services we do not need (services exist to *enable* the platform, not to inflate the deal) |
| Trade price for term, volume, reference rights, or case-study participation | Trade price for nothing — every concession buys something back (Section 13.3) |
| Price roadmap-staged connectors as *custom integration*, clearly flagged as build work | Charge subscription rates for connectors that are staged stubs as if they were live |
| Run a structured **Design Partner** discount with defined obligations (Section 13.5, `08-`) | Let "design partner" become an unstructured permanent discount |

### 1.3 Two Revenue Motions, One Relationship

```text
                    ┌──────────────────────────────────────────────┐
                    │         CLIENT RELATIONSHIP VALUE             │
                    └──────────────────────────────────────────────┘
                                       │
          ┌────────────────────────────┴────────────────────────────┐
          ▼                                                          ▼
┌─────────────────────────────┐                    ┌─────────────────────────────┐
│   PLATFORM SUBSCRIPTION       │                    │   PROFESSIONAL SERVICES       │
│   (recurring, ARR)            │                    │   (episodic / recurring-svc)  │
├─────────────────────────────┤                    ├─────────────────────────────┤
│ • Tiered (Section 11)         │                    │ • Discovery Engagement (§4)   │
│ • Priced on value + usage     │                    │ • Foundation Implementation(§5)│
│   dimensions (Section 3)      │                    │ • Advanced Implementation (§6) │
│ • Modules + agents unlocked   │                    │ • Custom Integration Pkgs (§7) │
│ • High margin; expansion path │                    │ • Managed Intelligence Svcs(§8)│
│                               │                    │ • Ongoing Support (§9)        │
│ EXPANSION = more modules,     │                    │ • Executive Advisory (§10)    │
│ agents, BUs, connectors, seats│                    │ MARGIN-MANAGED; enables ARR   │
└─────────────────────────────┘                    └─────────────────────────────┘
          │                                                          │
          └──────────────────► LAND-AND-EXPAND FLYWHEEL ◄────────────┘
        Services prove value → subscription captures it → expansion compounds it
```

**The flywheel, stated plainly:** Professional services exist to *get the client to value* on the platform. Subscription is where Sin City Analytics earns durably. We therefore never let services margin drive the relationship — services are priced to enable a healthy, expanding subscription, and we are willing to run thinner services margin (within guardrail) when it accelerates a strong ARR land with expansion headroom.

---

## 2. The Land-and-Expand Model

The first contract should be the **smallest configuration that proves the north-star flow on the client's own data**, against a pain point discovered in `01-`. Everything else is expansion.

### 2.1 The Expansion Ladder

| Stage | Typical commercial shape | Subscription dimension that grows | Services attached |
|---|---|---|---|
| **Land** | Discovery → Foundation Implementation | Base tier; 1–2 modules; 1–2 agents; 1 business unit | Discovery (§4) + Foundation (§5) |
| **Adopt** | Add modules/agents already in tier | Module/agent count within tier | Light configuration (Managed Intelligence §8 or change order) |
| **Expand — breadth** | Additional business units / cost centers / departments onto same config | BU count, cost-center count, scope of `canViewAllCostCenters` cohort | Advanced Implementation (§6) if non-trivial |
| **Expand — depth** | Advanced modules (forecasting cycles, executive reporting), more agents | Tier upgrade | Advanced Implementation (§6) |
| **Expand — integration** | Replace CSV/Excel uploads with live connectors | Tier (connector count) + integration build | Custom Integration Package (§7) |
| **Expand — service** | Hand close-cycle analytics to us; recurring advisory | Add-on services ARR | Managed Intelligence (§8), Executive Advisory (§10) |

### 2.2 Pricing the Land vs. the Expand

| Dimension | Land pricing posture | Expand pricing posture |
|---|---|---|
| Subscription | Entry tier; willing to price near floor *if* expansion headroom is documented | At list; expansion is where value is captured |
| Services | Fixed-fee, tightly scoped; the cheapest credible path to first value | Scoped per service line; complexity uplift applies |
| Discount appetite | Higher — buying the relationship and reference rights | Lower — value is proven; protect ARR integrity |
| Required justification | Documented expansion path in the account plan (which modules/agents/BUs/connectors come next) | Realized value from prior stage (Section 15 metrics) |

> **Guardrail:** A below-floor land is only approved when the account plan names *at least two* concrete expansion stages with target timing. A land with no expansion thesis is priced at list. (See Section 13.)

---

## 3. Pricing Dimensions & Drivers (Cross-Cutting)

These are the inputs that move price across **all** service lines and subscription. They are the vocabulary of every quote. The rate card (`06a-`) maps each dimension to a `[PLACEHOLDER]` value or multiplier.

### 3.1 Subscription Value/Usage Dimensions

| Dimension | Why it drives value/price | How it scales | Rate-card token |
|---|---|---|---|
| **Active modules** | Each module (financial reporting, forecasting, variance/actuals, budget, executive_reporting, headcount, vendors, external_labor, cloud_spend, agents) answers a distinct class of question | Count / tier inclusion | `[$ / period / module]` or tier-bundled |
| **Enabled agents** | Each agent (cfo, fpa, procurement, headcount, external-labor, finance-bp, validation) is a packaged analyst persona | Count / tier inclusion | `[$ / period / agent]` or tier-bundled |
| **Business units & cost centers** | Breadth of tenant; drives `ClientConfig` complexity and value surface | Count bands | `[× band multiplier]` |
| **Forecast cycles** | Rolling cycles (3+9, 6+6, 9+3) are advanced-value capability | Enabled cycles | Tier-gated |
| **Data volume / facts** | ActualEntry, BudgetEntry, ForecastEntry, HeadcountRecord, ExternalLaborRecord, VendorSpendRecord, KPIRecord volume; periods retained | Volume bands | `[× band multiplier]` |
| **Live connectors** | Connector count beyond CSV/Excel upload (subscription side of the connector value) | Count | Tier-gated + integration build (§7) |
| **Seats by role** | admin / finance_user / executive / read_only | Seat count per role band | `[$ / period / seat band]` |
| **Store tier** | Databricks SQL (Delta) primary vs. in-memory SQLite fallback | Capability flag | Tier-gated |

### 3.2 Professional-Services Effort Drivers

| Driver | Effect on effort/price | Notes |
|---|---|---|
| **Number & messiness of source systems** | ↑ | "Spreadsheets everywhere" raises mapping/validation effort |
| **Connector type** | ↑↑ for staged stubs | Live path today = CSV/Excel upload + Databricks SQL. QuickBooks Online, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive Planning are **staged stubs on the roadmap** — priced as build (§7), not as configuration |
| **Data quality at intake** | ↑ | Drives validator tuning effort across the 8 validators; quarantine remediation loops |
| **Chart-of-accounts / cost-center complexity** | ↑ | Mapping effort; account & cost-center validator config |
| **Number of modules & agents to configure** | ↑ (sublinear) | Configuration not code; marginal cost decreases per added module |
| **Business-unit / multi-entity scope** | ↑ | Multiple `ClientConfig` scopes, finance-bp agent scoping |
| **Stakeholder count & approval layers** | ↑ | Discovery and design effort, sign-off cycles |
| **Security/compliance posture** | ↑ | Until Clerk lands, route guards deferred; bespoke isolation review adds effort |
| **Training & change-management depth** | ↑ | Phase 8 scope (Training & Adoption) |
| **Timeline compression** | `[× rush factor]` | Compressed go-live raises effort and risk |

### 3.3 Risk & Strategic Modifiers (apply to either motion)

| Modifier | Direction | Rationale |
|---|---|---|
| **Reference / case-study rights** | ↓ price | We buy marketing value back |
| **Multi-year term commitment** | ↓ subscription | De-risks churn; rewards commitment |
| **Logo / segment strategic value** | ↓ (capped) | Marquee account, beachhead segment |
| **Design Partner status** | ↓ (structured) | Per `08-design-partner-program.md`; obligations attached |
| **Delivery risk (data, stakeholders, timeline)** | ↑ contingency | Build risk premium into services |
| **Roadmap dependency** | ⚠ flag | If value depends on a staged connector, price the build and flag delivery risk explicitly |

---

## 4. Service Line — Discovery Engagement

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services (fixed-fee) |
| **Maps to phase** | Phase 1 — Discovery & Assessment |
| **Typical commercial form** | Fixed-fee, short-duration |

**Scope.** A structured, time-boxed engagement that runs the Financial Intelligence Assessment (`01-`) against the client's finance function: source-system inventory, pain-point capture, decision-question prioritization, data-readiness scan, and a target-state recommendation summary that seeds the Solution Design (`04-`).

**Deliverables.**
- Completed Financial Intelligence Assessment (scored)
- Prioritized decision-question backlog (the questions the platform must answer)
- Source-system & data-readiness inventory mapped to the data model and connector registry
- Recommended target-state sketch and indicative phasing
- A go/no-go and a *credible* Foundation Implementation scope to be priced in `05-`

**When it should be used.**
- Any new client where target state is not yet defensible
- Whenever a prospect cannot clearly name the decisions they want improved
- As the paid front door of a land motion (it de-risks the implementation quote)
- **Skip / fold-in** when discovery is trivially small and the client commits to Foundation up front — then bundle (Section 12.3)

**Pricing considerations (drivers & levers — no dollar values).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| Number of source systems & stakeholders | Fixed-fee vs. credit-back-on-Foundation (see below) |
| Number of business units / entities in scope | Duration time-box (longer = higher) |
| Data-readiness unknowns (more unknowns = more effort) | On-site vs. remote delivery |
| Approval-layer depth | Depth of target-state design included |
| Strategic value of logo | Reference-rights trade |

> **Credit-back lever (land accelerator).** Offer to credit `[N%]` of the Discovery fee against a Foundation Implementation signed within `[N days]`. This lowers the friction of the paid front door without discounting the platform. Cap and window are `[PLACEHOLDER]`.

---

## 5. Service Line — Foundation Implementation

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services (fixed-fee preferred) |
| **Maps to phases** | Phases 2–9 (Data Assessment → Go Live), standard scope |
| **Typical commercial form** | Fixed-fee, phase-gated |

**Scope.** The standard, repeatable stand-up of a client tenant on the **live path** (CSV/Excel upload + Databricks SQL, or SQLite fallback): author `ClientConfig`, ingest via `ingestFile()`, tune the 8 validators, configure the agreed core modules and agents, set up dashboards and the executive experience, configure roles/permissions, and run go-live. This is the **default land implementation**.

**Deliverables.**
- Authored, reviewed `ClientConfig` (branding, fiscalYearStart, reportingCurrency, reportingPeriods, businessUnits, costCenters, departments, chartOfAccounts, activeModules, enabled agents)
- Working ingestion pipeline (File → Parser → Mapper → Validator → Writer) proven on client data
- 8 validators tuned to client thresholds; quarantine/review rules agreed (Phase 4 "Data Trusted" gate)
- Core modules configured and dashboards live (Recharts) for the executive experience
- Agents enabled and proven against the north-star flow on real data
- Roles & permission map configured (admin/finance_user/executive/read_only)
- Go-live sign-off per `02-` gate criteria

**When it should be used.**
- The **default** for any client whose value is achievable on the live path
- Whenever scope fits standard modules/agents with no novel connector build
- As the land implementation in the expand model

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| # modules & agents configured (sublinear — config not code) | Fixed-fee vs. phased milestone billing |
| Source-system messiness & data-quality remediation loops | Module/agent scope-down to a tighter land |
| Chart-of-accounts / cost-center mapping complexity | Standard vs. accelerated timeline (`[× rush]`) |
| # business units / `ClientConfig` scopes | Training depth (fold to §8/Phase 8 or keep in-scope) |
| Validator-tuning depth (anomaly/alignment thresholds) | Remote vs. on-site go-live support |
| Timeline compression | Bundle with subscription term for blended concession |

> **Margin guardrail.** Because configuration introduces **zero platform code changes**, Foundation effort should trend down release-over-release. Re-priced Foundation work that exceeds the rate-card effort band by `[N%]` requires Delivery Lead sign-off — it usually signals mis-scoped data quality or a hidden connector need (route to §7).

---

## 6. Service Line — Advanced Implementation

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services (fixed-fee or T&M for high-uncertainty scope) |
| **Maps to phases** | Phases 5–6 (deep configuration), Phase 10 (Optimization & Expansion) |
| **Typical commercial form** | Fixed-fee when scope is clear; T&M when discovery-light |

**Scope.** Configuration depth beyond the standard land: rolling forecast cycles (3+9, 6+6, 9+3), executive commentary & reporting build-out, multi-business-unit / multi-entity `ClientConfig`, advanced variance/alignment validator tuning, finance-bp agent scoping per cost center, and bespoke dashboard/executive experiences. Used for **depth and breadth expansion**.

**Deliverables.**
- Configured forecasting module with rolling cycles and forecast-drift (alignment validator) thresholds
- Executive commentary & reporting workflows and executive dashboards
- Multi-BU / multi-entity configuration with finance-bp scoping and `canViewAllCostCenters` cohorting
- Advanced validator tuning (anomaly Z-thresholds, budget-vs-actuals variance thresholds)
- Expanded agent enablement against new decision questions

**When it should be used.**
- Expansion stages (depth/breadth) after a successful land
- Clients whose discovered value requires advanced modules from day one (price as Foundation + Advanced)
- Optimization (Phase 10) engagements that extend an existing tenant

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| Forecast-cycle count & complexity | Fixed-fee vs. T&M based on scope certainty |
| # business units / entities / cost-center scopes | Phase 10 optimization retainer vs. project |
| Depth of executive-reporting customization | Reuse of prior-engagement config patterns (↓ effort) |
| Advanced validator-tuning iterations | Scope-stage across multiple expansion contracts |
| Net-new vs. extend-existing tenant | Blend with subscription tier upgrade |

---

## 7. Service Line — Custom Integration Packages (per staged connector)

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services (fixed-fee build) + subscription connector tier |
| **Maps to phase** | Phase 3 — Connection Layer & Integration |
| **Typical commercial form** | Fixed-fee build per connector, with explicit roadmap/risk flagging |

**Scope.** Activation of a **roadmap-staged connector** from the registry into the live ingestion path for a tenant. The live path today is **CSV/Excel upload + Databricks SQL**. The following are **staged stubs on the roadmap** and must be priced as build work, packaged **one connector at a time**:

| Staged connector | Domain it feeds | Notes for pricing |
|---|---|---|
| QuickBooks Online | GL/ERP actuals & budget | SMB ERP; auth & entity mapping effort |
| NetSuite | GL/ERP actuals & budget | Mid-market ERP; saved-search/segment complexity |
| Workday HCM | Headcount records | Workforce data; position-ID (no PII) mapping |
| Beeline / Fieldglass (VMS) | External labor / contractor SOW | External-labor records; SOW structure variance |
| Coupa | Vendor / procurement spend | Vendor-spend records |
| Workday Adaptive Planning | Budget / forecast | Planning data; cycle alignment |
| Databricks SQL | Primary store / data feed | **Live** as store; connector-as-source patterns may still need build |

> ⚠ **Canon guardrail.** Do **not** represent any staged connector as live. The proposal must flag it as a build with delivery risk, and subscription connector tiering only applies once the connector is delivered and accepted.

**Deliverables (per connector).**
- Connector activated through Parser → Mapper → Validator → Writer into the typed data model
- Field mapping to the relevant fact entity, with clientId/period/source/validationStatus stamped
- Validator coverage for the new source; quarantine rules agreed
- Connector acceptance test against the north-star flow
- Runbook for the connector's refresh/sync cadence

**When it should be used.**
- Integration expansion — replacing manual uploads with a live feed
- Any time discovered value depends on automated data from a registry connector
- **Never** to "make a stub look live" in a land deal — set expectations honestly

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| Connector complexity (auth, entity model, refresh) | Per-connector fixed fee with complexity band `[× factor]` |
| Source data quality & mapping variance | Phased: pilot-load then full activation |
| Number of fact entities the connector feeds | Bundle multi-connector builds for blended effort |
| Refresh cadence / volume | Build vs. build+managed-sync (route to §8) |
| First-of-kind vs. repeat connector | **First-of-kind premium** (we are productizing the stub); repeat builds priced down as the pattern hardens |
| Roadmap maturity of the stub | Risk contingency `[× factor]` for least-mature connectors |

> **Productization lever.** The first client to fund a given staged connector effectively co-funds its productization. Price the **first-of-kind** with a build premium *and* consider a Design Partner structure (§13.5, `08-`) — they get reference value and roadmap influence; we get a hardened connector that lowers cost for every subsequent client. Subsequent activations of that connector trend toward configuration cost.

---

## 8. Service Line — Managed Intelligence Services

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services — **recurring** (managed-service ARR-adjacent) |
| **Maps to phase** | Phase 10 — Optimization & Expansion (ongoing) |
| **Typical commercial form** | Monthly/quarterly retainer; tiered by scope |

**Scope.** Sin City Analytics operates parts of the client's finance-intelligence motion on their behalf: ongoing data-load and validation stewardship (running ingestion, clearing quarantine, tuning validators), agent-output curation, recurring analysis cycles (e.g., monthly variance review, forecast refresh), and proactive data-quality monitoring via the validation agent.

**Deliverables.**
- Scheduled data ingestion & validation runs; quarantine triage to "Data Trusted" each cycle
- Recurring analytical deliverables (variance packs, forecast refreshes) produced *through the platform's agents*, not as bespoke reports
- Data Quality Advisor monitoring with flagged-issue remediation
- Periodic configuration tuning as the client's structure evolves
- A named analyst/CSM cadence

**When it should be used.**
- Clients with thin finance teams who want the *outcome* without operating the platform
- Post-go-live, to drive adoption and protect the value realized
- As a **stickiness and expansion** motion (high retention, recurring revenue)

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| Cycle frequency (monthly/weekly close support) | Retainer tier (light/standard/deep) |
| # modules & agents under management | Volume of recurring deliverables included |
| Data volume & validation workload | SLA response targets (faster = higher) |
| # business units / cost-center scopes | Named-analyst allocation (fractional vs. dedicated) |
| Required SLA / responsiveness | Annual prepay vs. monthly (term discount lever) |

> **Positioning guardrail.** Managed Intelligence must deliver answers *through* the platform's agents and validators — never as off-platform manual report-writing. If we are producing decks by hand, we have drifted from the north star and the engagement is mis-priced.

---

## 9. Service Line — Ongoing Support

| Attribute | Detail |
|---|---|
| **Revenue motion** | Subscription-attached (support plan) |
| **Maps to phase** | Continuous (post Phase 9) |
| **Typical commercial form** | Annual support plan, tiered; attached to subscription |

**Scope.** Reactive and proactive support of the live tenant: incident response, configuration assistance, `ClientConfig` change support, platform-update enablement, and access to the support channel. Distinct from Managed Intelligence (§8) — support keeps the platform *running*; Managed Intelligence *runs the analysis for them*.

**Deliverables.**
- Support channel access with tiered response/restore SLAs
- Configuration-change assistance (within fair-use bounds)
- Incident management and root-cause for platform issues
- Release-update enablement and advisory
- Periodic health check (tier-dependent)

**When it should be used.**
- Attached to **every** subscription (a baseline plan is mandatory; tier is the choice)
- Upgraded for clients with stringent uptime/response needs

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| SLA tier (response & restore targets) | Support tier (Standard / Premium / Enterprise) |
| Tenant complexity (modules, BUs, connectors) | % of subscription vs. flat `[$ / period]` |
| Channel breadth & hours of coverage | Business-hours vs. extended/24×7 |
| Volume of config-change requests | Fair-use threshold then change-order |
| Named contact vs. pooled | Dedicated TAM (route value to §10) |

> **Structural note.** Ongoing Support is typically priced as a **percentage of subscription** `[N%]` (tier-dependent) so it scales with tenant size, with a floor of `[$ / period]`. Configuration changes beyond fair-use route to a change order or §6.

---

## 10. Service Line — Executive Advisory Services

| Attribute | Detail |
|---|---|
| **Revenue motion** | Professional services — premium advisory (retainer or per-engagement) |
| **Maps to phase** | Continuous / Phase 10 |
| **Typical commercial form** | Senior-advisor retainer or fixed-fee executive engagements |

**Scope.** Senior finance-transformation advisory layered on top of the platform: helping the CFO/VP Finance turn platform intelligence into board-grade narrative and decisions — using the CFO Advisor and executive_reporting module as the analytical engine. Quarterly business reviews framed around realized value (Section 15), maturity roadmap guidance, and decision-support for high-stakes finance questions.

**Deliverables.**
- Executive QBRs anchored on value-realized metrics and the maturity roadmap
- Board-readiness support using executive commentary & reporting + CFO Advisor outputs
- Finance-transformation roadmap (modules/agents/connectors sequenced to outcomes)
- High-stakes decision support sessions (always honoring BASE_GUARDRAILS — fact vs. interpretation, cited sources, escalation to human review)

**When it should be used.**
- Strategic accounts where the economic buyer is the CFO
- To deepen executive sponsorship and protect/expand ARR
- When the client values the *advisory relationship*, not just the tooling

**Pricing considerations (drivers & levers).**

| ⬩ Drivers | ⬩ Levers we control |
|---|---|
| Seniority of advisor (Principal/Partner-level) | Retainer vs. per-engagement |
| Cadence (monthly/quarterly) | Hours/sessions included per period |
| Strategic stakes & breadth | Bundle into top subscription tier as a differentiator |
| Account strategic value | Fold limited hours into Enterprise tier; meter overage |

> **Guardrail.** Advisory must remain platform-anchored and honor BASE_GUARDRAILS: never fabricate or extrapolate numbers, always cite the source/metric, flag low-confidence data, and escalate to human review. Advisory that drifts into ungrounded opinion is off-canon and off-brand.

---

## 11. Platform Subscription Tiering Matrix

The subscription is the durable revenue. Tiers are **capability-and-value gates**, not arbitrary feature walls — each tier unlocks the modules and agents that answer a progressively broader set of finance questions. All price cells are `[PLACEHOLDER]` sourced from the rate card.

### 11.1 Tier Matrix (structure — populate cells from `06a-`)

| Capability dimension | **Essentials** | **Professional** | **Enterprise** |
|---|---|---|---|
| **Target buyer** | Single-team finance proving value | Multi-function finance | Multi-entity / strategic finance org |
| **Annual subscription** | `[$ / period]` | `[$ / period]` | `[$ / period]` (custom) |
| **Modules included** | financial reporting; variance/actuals; budget | + forecasting; vendors; headcount | + external_labor; cloud_spend; executive_reporting (all modules) |
| **Forecast cycles** | — | 1 cycle (e.g., 6+6) | All cycles (3+9, 6+6, 9+3) |
| **Agents included** | fpa; validation | + cfo; procurement; headcount | + external-labor; finance-bp (all agents) |
| **Business units** | `[N]` | `[N]` | `[N+ / custom]` |
| **Cost centers** | `[band]` | `[band]` | `[band / unlimited]` |
| **Seats (by role)** | `[band]` (finance_user, read_only) | `[band]` (+ executive) | `[band]` (all roles incl. admin scale) |
| **Connectors** | CSV/Excel upload only | Upload + `[N]` live connector | Upload + `[N+]` live connectors (build via §7) |
| **Data store** | SQLite fallback or shared | Databricks SQL | Databricks SQL (dedicated posture) |
| **Data volume / retention** | `[band]` | `[band]` | `[band / custom]` |
| **Executive reporting** | — | Basic | Full executive commentary & reporting |
| **Support (§9)** | Standard | Premium | Enterprise (+ named TAM) |
| **Executive Advisory (§10)** | — | Add-on | `[N]` hrs included + overage |
| **Pricing logic** | Entry land; near-floor allowed w/ expansion thesis | List-anchored | Value/custom; ARR-led negotiation |

### 11.2 Tier Design Principles

| Principle | Implication |
|---|---|
| **Tiers gate value, not bytes** | A tier is justified by the *questions* its modules/agents answer |
| **Agents are tier accelerators** | cfo and finance-bp are premium personas — they pull Professional → Enterprise |
| **Connectors split subscription vs. build** | Tier sets *how many* live connectors are allowed; §7 builds each one |
| **Land in Essentials/Professional, expand upward** | Tier upgrade is a primary expansion lever |
| **Enterprise is value-priced, not list** | Always paired with Section 15 ROI framing |

### 11.3 Subscription Add-Ons (à la carte over base tier)

| Add-on | Dimension metered | Token |
|---|---|---|
| Additional module beyond tier | per module | `[$ / period / module]` |
| Additional agent beyond tier | per agent | `[$ / period / agent]` |
| Additional business unit | per BU band | `[× band]` |
| Additional seats | per role band | `[$ / period / seat band]` |
| Additional live connector | per connector (+ §7 build) | `[$ / period / connector]` |
| Extended data retention/volume | per band | `[× band]` |

---

## 12. Packaging & Bundling Logic

Packaging exists to (a) make the *right* land obvious, (b) attach services that genuinely accelerate value, and (c) protect margin by avoiding one-off, hand-assembled deals.

### 12.1 Standard Packages (named bundles)

| Package | Contents | Best for | Commercial logic |
|---|---|---|---|
| **Launchpad (Land)** | Discovery (§4) + Foundation (§5) + Essentials/Professional subscription (Yr 1) + Standard Support | First-time land, value not yet proven | Lowest-friction entry; Discovery credit-back lever; expansion thesis required for any discount |
| **Scale (Expand)** | Advanced Implementation (§6) + tier upgrade + Premium Support | Proven client expanding depth/breadth | Anchored on realized value (Section 15) |
| **Connected (Integrate)** | Custom Integration Package(s) (§7) + connector tier + Managed-sync option | Moving from uploads to live feeds | First-of-kind connector premium; honest roadmap flagging |
| **Operate (Managed)** | Managed Intelligence (§8) retainer + Premium/Enterprise Support | Thin finance teams wanting outcomes | Recurring services ARR; high stickiness |
| **Executive Partner** | Enterprise subscription + Executive Advisory (§10) + named TAM + all agents | CFO-sponsored strategic accounts | Premium relationship; value-priced |

### 12.2 Bundling Rules

| Rule | Statement |
|---|---|
| **Subscription always present** | Every package includes a subscription tier. Services without a subscription are only sold as standalone Discovery (§4) or one-off Advisory (§10). |
| **Support is mandatory** | Every subscription carries at least Standard Support (§9). |
| **Services enable, don't pad** | A service line is included only if it advances time-to-value or unlocks subscription value. |
| **Bundle discount ≠ stacked discount** | A package may carry a bundle concession; it does **not** stack on top of line-item discounts (Section 13.4). |
| **Connectors stay honest** | A package may *include* connector build (§7) but never implies a stub is live. |

### 12.3 Fold-In / Unbundle Decisions

| Situation | Decision |
|---|---|
| Discovery trivially small + client commits to Foundation | Fold Discovery into Launchpad (credit-back applied) |
| Advanced modules needed at land | Foundation + Advanced sold together, single mobilization |
| Client wants to self-operate | Drop Managed Intelligence (§8); keep Support (§9) |
| Heavy training/change need | Surface Phase 8 scope explicitly (in Foundation or as add-on) |

---

## 13. Pricing Decision Matrix & Deal Guardrails

### 13.1 Pricing Decision Matrix — routing a deal to its shape

Use this to determine **deal shape** before building the quote. Read left-to-right; the rightmost column is the recommended package/posture.

| Client situation (signal) | Data path | Value clarity | Strategic value | → Recommended shape |
|---|---|---|---|---|
| New logo, value unproven, target state unclear | Upload (live) | Low | Standard | **Launchpad**, Discovery-first, near-floor land w/ expansion thesis |
| New logo, value clear from discovery | Upload (live) | High | Standard | **Launchpad** (Discovery folded), Professional tier |
| Existing client, value realized, wants more depth | Upload/connector | High | Standard | **Scale**, tier upgrade, list-anchored |
| Client needs automated feeds | Staged connector | Med/High | Standard | **Connected**, §7 build + connector tier, roadmap flagged |
| Thin team wants outcomes | Any | Med | Standard | **Operate**, Managed Intelligence retainer |
| CFO-sponsored marquee account | Any | High | High | **Executive Partner**, value-priced Enterprise, advisory |
| Strategic but unproven roadmap connector dependency | Staged connector | Med | High | **Connected** + **Design Partner** structure (§13.5) |

### 13.2 Approval Authority Ladder (who can say yes)

Discount measured against rate-card list / standard effort band. Thresholds are `[PLACEHOLDER]`.

| Discount / concession band | Approver | Required justification |
|---|---|---|
| `0%` to `[N1%]` | Account Executive | Standard; note in CRM |
| `[N1%]` to `[N2%]` | Sales Manager | Competitive/term/volume rationale |
| `[N2%]` to `[N3%]` | VP Sales | Documented expansion thesis + margin check |
| `[N3%]` to `[N4%]` | Commercial / Finance | Margin-floor analysis; CFO-of-SCA awareness |
| Above `[N4%]` / below margin floor | Executive committee | Strategic exception memo |
| Any below-floor **services** margin | Delivery Lead + Commercial | Delivery-risk + ARR-headroom sign-off |

### 13.3 Concession Exchange — every discount buys something back

| If we give… | We must get… |
|---|---|
| Subscription discount | Multi-year term and/or auto-renew |
| Services discount | Reference + case-study rights, or expansion commitment |
| Discovery credit-back | Foundation signature within `[N days]` |
| First-of-kind connector concession | Design Partner obligations (§13.5) |
| Below-floor land | ≥2 named expansion stages in the account plan |

### 13.4 Discounting Rules

| Rule | Statement |
|---|---|
| **No stacking** | Bundle concession and line-item discount do not stack; apply the greater, not both. |
| **Margin floor is absolute** | No deal below the services margin floor `[N%]` or subscription margin floor `[N%]` without executive-committee exception. |
| **Discount the land, protect the expand** | Higher discount appetite at land; expansion is list/value-anchored. |
| **Term over price** | Prefer trading price for multi-year term; protects ARR quality. |
| **Connectors not discounted as "live"** | Never discount a build to make a stub feel free/live. |
| **Time-box promotional pricing** | Any promo carries an explicit expiry; no perpetual discounts (except structured Design Partner). |

### 13.5 Design Partner Pricing (structured exception)

Per `08-design-partner-program.md`. Design Partner pricing is the **only sanctioned standing discount**, and only in exchange for obligations.

| Element | Framework (values in `08-` / rate card) |
|---|---|
| **Eligibility** | Strategic logo/segment; willing to co-build a roadmap-staged connector or advanced module |
| **Discount form** | Subscription discount `[N%]` for a fixed term, and/or first-of-kind connector build at `[reduced × factor]` |
| **Obligations (what we get)** | Roadmap influence input; bi-weekly feedback cadence; reference + case study; logo rights; willingness to run on pre-GA capability |
| **Time-box** | Discount applies for `[N]` term, then converts to standard at renewal |
| **Guardrails** | Capped count of concurrent design partners per connector; obligations tracked or discount lapses; must still clear margin floor unless executive-approved strategic |

> **Anti-drift guardrail.** "Design partner" is not a synonym for "cheap forever." It is a time-boxed, obligation-bearing structure. If the obligations stop being met, the pricing reverts at the next renewal gate.

---

## 14. Value Metrics & ROI Framing

We sell the *answer*. ROI framing translates platform capability into the economic value of decisions improved — and is the justification behind every Professional/Enterprise tier and every expansion.

### 14.1 The Value Equation (qualitative — no figures)

```text
CLIENT VALUE  =   (Decisions made faster)        ← close-cycle days saved, in-meeting answers
              +   (Decisions made better)         ← variance caught earlier, forecast drift flagged
              +   (Leakage recovered)             ← vendor/cloud/external-labor spend insight
              +   (Effort removed)                ← manual report assembly eliminated
              −   (Total cost: subscription + services)
```

### 14.2 Value Metrics by Module/Agent

| Module / Agent | Value metric the client feels | How the platform proves it |
|---|---|---|
| variance/actuals + fpa | Faster, earlier variance detection | Budget-vs-actuals with alignment validator thresholds |
| forecasting | Reduced forecast error / earlier drift flagging | Rolling cycles + forecast-drift validator |
| executive_reporting + cfo | Board-ready answers in-meeting | Executive commentary; Question→Answer flow |
| vendors + procurement | Vendor-spend leakage identified | Vendor-spend analysis |
| external_labor + external-labor | Contractor/SOW overspend control | External-labor tracking |
| cloud_spend | Cloud cost anomalies caught | Anomaly validator (Z>3) on cloud spend |
| headcount + headcount agent | Workforce-cost planning accuracy | Headcount planning |
| validation | Trustworthy data (decisions defensible) | 8 validators; quarantine; "Data Trusted" gate |
| finance-bp | BU-level decision support | Cost-center-scoped analysis |

### 14.3 ROI Framing for the Proposal (`05-`)

| Step | Action |
|---|---|
| 1 | Pull the prioritized decision questions and pain points from Discovery (`01-`) |
| 2 | For each, name the value metric (14.2) and the client's *current* cost of the gap |
| 3 | Express value as a **range** the client validates — never a fabricated point estimate (honors BASE_GUARDRAILS) |
| 4 | Set total cost (subscription + services) against the conservative end of that range |
| 5 | Carry the metrics into QBRs (§10) as **realized-value** tracking for expansion |

> **Honesty guardrail.** ROI framing uses client-validated ranges and clearly separates *fact* (platform-measured) from *projection* (client-estimated). We never fabricate or extrapolate a savings number — same discipline the agents enforce.

---

## 15. Quote-Construction Process (step-by-step)

```text
 ┌───────────────────────────────────────────────────────────────────────────┐
 │ 1. INPUTS        Discovery (01) + Solution Design (04) scoped target state  │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 2. DEAL SHAPE    Run Pricing Decision Matrix (13.1) → package               │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 3. SUBSCRIPTION  Pick tier (§11) → add-ons (11.3) → apply dimensions (§3.1) │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 4. SERVICES      Select lines (§4–10) → apply effort drivers (§3.2) +       │
 │                  complexity/rush multipliers                                │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 5. CONNECTORS    Any staged connector? → §7 build + connector tier; FLAG    │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 6. BUNDLE        Apply package logic (§12); compute bundle concession        │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 7. GUARDRAILS    Check margin floor + approval ladder (§13); log concession │
 │                  exchange (13.3)                                            │
 ├───────────────────────────────────────────────────────────────────────────┤
 │ 8. VALUE         Attach ROI framing (§14) → output to proposal (05)         │
 └───────────────────────────────────────────────────────────────────────────┘
```

---

## 16. Reusable Pricing Worksheet Template

> Copy per opportunity. Fill `[PLACEHOLDER]` cells from the rate card (`06a-`). Do not commit real figures into this framework file.

### 16.1 Opportunity Header

```text
Client:                 [CLIENT NAME]
Opportunity ID:         [CRM ID]
Account Executive:      [NAME]
Deal stage / shape:     [Launchpad | Scale | Connected | Operate | Executive Partner]
Discovery completed?:   [Y/N — link to 01 output]
Solution Design ref:    [link to 04 output]
Strategic value:        [Standard | High | Marquee]
Design Partner?:        [Y/N — link to 08 obligations]
```

### 16.2 Subscription Build

| Line | Selection | Driver value | Rate-card token | Extended |
|---|---|---|---|---|
| Base tier | `[Essentials/Professional/Enterprise]` | — | `[$ / period]` | `[PLACEHOLDER]` |
| Modules beyond tier | `[list]` | `[count]` | `[$ / period / module]` | `[PLACEHOLDER]` |
| Agents beyond tier | `[list]` | `[count]` | `[$ / period / agent]` | `[PLACEHOLDER]` |
| Business units | `[count]` | `[band]` | `[× band]` | `[PLACEHOLDER]` |
| Seats by role | `[role: count]` | `[band]` | `[$ / period / seat band]` | `[PLACEHOLDER]` |
| Live connectors (tier) | `[count]` | `[band]` | `[$ / period / connector]` | `[PLACEHOLDER]` |
| Data volume/retention | `[band]` | `[band]` | `[× band]` | `[PLACEHOLDER]` |
| Support (§9) | `[Standard/Premium/Enterprise]` | — | `[N% of subscription]` | `[PLACEHOLDER]` |
| **Subscription subtotal (annual)** | | | | **`[PLACEHOLDER]`** |

### 16.3 Professional Services Build

| Service line | In scope? | Effort drivers | Multipliers | Token | Extended |
|---|---|---|---|---|---|
| Discovery (§4) | `[Y/N]` | `[systems/stakeholders/BUs]` | — | `[$ fixed]` | `[PLACEHOLDER]` |
| Foundation (§5) | `[Y/N]` | `[modules/agents/data quality]` | `[× rush]` | `[$ fixed]` | `[PLACEHOLDER]` |
| Advanced (§6) | `[Y/N]` | `[cycles/BUs/exec reporting]` | `[× complexity]` | `[$ fixed / day]` | `[PLACEHOLDER]` |
| Integration (§7) | `[Y/N]` | `[connector: name; complexity]` | `[× first-of-kind][× risk]` | `[$ fixed / connector]` | `[PLACEHOLDER]` |
| Managed Intelligence (§8) | `[Y/N]` | `[cycle freq/scope/SLA]` | — | `[$ / period]` | `[PLACEHOLDER]` |
| Executive Advisory (§10) | `[Y/N]` | `[seniority/cadence]` | — | `[$ / period or fixed]` | `[PLACEHOLDER]` |
| **Services subtotal** | | | | | **`[PLACEHOLDER]`** |

### 16.4 Guardrail & Approval Check

```text
List / standard-band reference:     [PLACEHOLDER]
Proposed total:                     [PLACEHOLDER]
Effective discount %:               [N%]
Subscription margin vs floor:       [PASS / FAIL — floor N%]
Services margin vs floor:           [PASS / FAIL — floor N%]
Approval band (13.2):               [AE / Mgr / VP / Commercial / ExecCom]
Approver:                           [NAME]
Concession exchange logged (13.3):  [what we gave → what we got]
Connector honesty check (§7):       [no stub represented as live — PASS/FAIL]
```

### 16.5 Value / ROI Attachment

| Decision question (from 01) | Value metric (14.2) | Client-validated range | Source = fact or projection |
|---|---|---|---|
| `[question]` | `[metric]` | `[range]` | `[fact/projection]` |
| `[question]` | `[metric]` | `[range]` | `[fact/projection]` |

```text
Conservative value vs. total cost:  [framing statement, ranges only — no fabricated point estimate]
Expansion thesis (≥2 stages):       [stage 1 → timing; stage 2 → timing]
```

---

## 17. Governance & Change Control

| Element | Rule |
|---|---|
| **Numbers live elsewhere** | All dollar values reside in `06a-rate-card.xlsx`. This framework holds only structure, drivers, levers, and `[PLACEHOLDER]` thresholds. |
| **Rate-card change cadence** | Reviewed at least `[N]`/year by Commercial; out-of-cycle changes require Commercial sign-off. |
| **Framework change control** | Structural changes to this document (new service line, new tier, new guardrail) require Commercial owner approval and a version bump. |
| **CRM/CPQ alignment** | Dimensions (§3), tiers (§11), and guardrails (§13) must be mirrored in the configure-price-quote tooling. |
| **Audit** | Every deal below `[N2%]` discount is sampled quarterly for guardrail compliance. |
| **Source of truth conflicts** | On any conflict between this framework and a deal, this framework + rate card govern; exceptions require documented executive approval. |

---

## Appendix A — Service Line ↔ Phase ↔ Motion Map

| Service line | Revenue motion | Canonical phase(s) | Primary expansion role |
|---|---|---|---|
| Discovery Engagement (§4) | Services (fixed) | Phase 1 | Land front door |
| Foundation Implementation (§5) | Services (fixed) | Phases 2–9 | Land |
| Advanced Implementation (§6) | Services (fixed/T&M) | Phases 5–6, 10 | Expand (depth/breadth) |
| Custom Integration Packages (§7) | Services (build) + subscription | Phase 3 | Expand (integration) |
| Managed Intelligence (§8) | Services (recurring) | Phase 10 | Expand (service) + retention |
| Ongoing Support (§9) | Subscription-attached | Continuous | Retention |
| Executive Advisory (§10) | Services (premium) | Continuous / 10 | Expand (strategic) + retention |
| Platform Subscription (§11) | Subscription (ARR) | All | Durable revenue engine |

## Appendix B — Cross-Document References

| For… | See |
|---|---|
| The decision questions & pain points that justify value | `01-financial-intelligence-assessment-framework.md` |
| The canonical 10-phase delivery model & gate criteria | `02-implementation-playbook.md` |
| Tenant stand-up / onboarding process | `03-client-onboarding-playbook.md` |
| The scoped target-state design that feeds the quote | `04-solution-design-framework.md` |
| The client-facing commercial output | `05-proposal-template.md` |
| Multi-tenant operating model & cost-to-serve context | `07-multi-tenant-client-operating-model.md` |
| Design Partner program obligations & structure | `08-design-partner-program.md` |
| Handoff of sold scope to delivery | `09-sales-to-implementation-handoff.md` |

---

*End of Deliverable 06 — Pricing Framework. This document contains no final dollar values by design. All monetary figures are governed by the controlled rate card (`06a-rate-card.xlsx`) and the change process in Section 17.*
