# Deliverable 1 — Financial Intelligence Assessment Framework

## Document Control

| Field | Value |
|---|---|
| Document | 01-financial-intelligence-assessment-framework.md |
| Title | Financial Intelligence Assessment Framework |
| Version | 1.0 |
| Owner | Sin City Analytics — Delivery |
| Audience | Delivery Lead, Solution Architect, Engagement Manager, Client Sponsor & Finance Stakeholders |
| Product | Finance Intelligence Platform (codename **Nexora**) |
| Last Updated | 2026-06-13 |
| Status | Active |

---

## Purpose

This document defines the **discovery process executed BEFORE any implementation** of the Finance Intelligence Platform (Nexora). It is the front door of the delivery framework: the structured set of working sessions, questions, scoring instruments, and artifacts that establish whether — and how — a client moves from financial *reporting* to financial *decision intelligence*.

Nexora behaves like a finance analyst, not a report generator. Its default flow is:

```text
User Question → Intent Detection → Relevant Data Retrieval → AI (Claude) Analysis → Direct Answer
```

The assessment exists to ensure that, by Go Live, the platform can answer a client's real finance questions directly and defensibly. That requires us to understand — before writing a single `ClientConfig` — the client's data landscape, reporting and forecasting processes, decision latency, governance posture, and the questions their executives actually ask.

This framework maps to **Phase 1 — Discovery & Assessment** and feeds **Phase 2 — Data Assessment & Architecture** of the shared canonical implementation phases. It is the upstream input to `02-implementation-playbook.md`, `03-client-onboarding-playbook.md`, and `04-solution-design-framework.md`, and consumes the qualified context handed over in `09-sales-to-implementation-handoff.md`.

---

## 1. Assessment Objectives

The assessment is complete when the delivery team can confidently answer five questions. Each objective has an explicit exit test.

| # | Objective | Why it matters for Nexora | Exit test (assessment is done when…) |
|---|---|---|---|
| 1.1 | **Establish the decision-intelligence baseline** | Nexora's value is measured against current decision latency, not just report volume. | We have documented how long it takes the client to answer 5+ representative finance questions today. |
| 1.2 | **Map the data landscape to platform connectors** | Live ingestion today = CSV/Excel upload + Databricks SQL; other connectors are roadmap. We must know what is real vs. staged. | Every source system is mapped to a connector (live, roadmap, or out-of-scope) with owner, access method, and data quality grade. |
| 1.3 | **Define the `ClientConfig` inputs** | Onboarding a client = authoring its `ClientConfig` with zero code changes. The config is only as good as discovery. | We can populate every required `ClientConfig` field: fiscalYearStart, reportingCurrency, reportingPeriods, forecastCycles, businessUnits, costCenters, departments, chartOfAccounts, activeModules, enabled agents. |
| 1.4 | **Select active modules and agents** | The platform offers specific modules and seven AI finance agents; we scope to the client's real needs, not the full catalog. | A signed-off shortlist of `activeModules` and enabled agents tied to documented pain points. |
| 1.5 | **Quantify success criteria** | Decision intelligence must be provable. | Each target metric has a measured baseline, a target, an owner, and a measurement method. |

**Out of objectives (explicitly):** building dashboards, configuring connectors, loading production data, authoring the final `ClientConfig`, or committing to a delivery date. Those belong to later phases. Discovery produces *evidence and recommendations*, not deployed software.

---

## 2. Stakeholder Identification

### 2.1 Stakeholder roster

The assessment engages a defined set of client roles. Each role owns part of the answer; missing a role creates a documented gap and a follow-up (per BASE_GUARDRAILS, we flag missing inputs before concluding).

| Role | What we need from them | Nexora touchpoints | Risk if absent |
|---|---|---|---|
| **Executive Sponsor** (often CFO or COO) | Mandate, success definition, decision-latency pain, funding | Success criteria, future-state vision, `executive_reporting` | Scope drifts; no arbiter for trade-offs |
| **CFO** | The questions the platform must answer; risk appetite; commentary expectations | CFO Advisor agent, executive_reporting, forecast | Value story untethered from exec needs |
| **VP Finance / Finance Director** | Operating cadence, close calendar, team capacity | actuals, budget, forecast | Process map incomplete |
| **FP&A Lead** | Forecast cycles, model mechanics, variance workflow | FP&A Specialist agent, forecast (3+9/6+6/9+3), actuals | Forecasting assessment unreliable |
| **Controller / Accounting Manager** | GL structure, chart of accounts, close mechanics, data of record | Account dimension, actuals, validation | Data model & validation rules wrong |
| **Procurement Lead** | Vendor master, PO/spend processes, savings tracking | Procurement Advisor agent, vendors, cloud_spend | vendors module mis-scoped |
| **HR / Workforce Finance Lead** | Headcount data, position management, plan vs. actual | Workforce Finance agent, headcount | headcount module mis-scoped |
| **External Labor / VMS Owner** | SOW/contingent labor tracking, Beeline/Fieldglass usage | External Labor Advisor agent, external_labor | external_labor module mis-scoped |
| **IT / Data Lead** | Source system inventory, access, security, Databricks ownership | All connectors, ingestion, security | Integration & security blocked |
| **Department / BU Leaders** | How they consume finance, what decisions they make | businessUnits, costCenters, departments, Finance Business Partner agent | Adoption risk; future-state lacks user pull |
| **Security / Compliance** (as needed) | Data classification, auth model, tenancy requirements | roles, clientId isolation, Clerk Orgs, secrets | Go-live security gate fails |

### 2.2 Discovery RACI

Scope of this RACI = the **discovery engagement** (not implementation). Legend: **R** Responsible · **A** Accountable · **C** Consulted · **I** Informed.

| Discovery Activity | Delivery Lead (SCA) | Solution Architect (SCA) | Exec Sponsor | CFO | FP&A Lead | Controller | Procurement | HR/Workforce | External Labor | IT/Data | Dept/BU Leaders |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Kickoff & objective alignment | A/R | C | A | C | I | I | I | I | I | I | I |
| Current-state process mapping | A | R | I | C | R | R | C | C | C | C | C |
| Data landscape & connector mapping | A | R | I | I | C | C | C | C | C | R | I |
| Data quality sampling | A | R | I | I | C | R | C | C | C | R | I |
| Pain point scoring | R | C | A | C | R | C | C | C | C | C | C |
| Module & agent shortlist | A | R | A | C | C | C | C | C | C | C | C |
| `ClientConfig` input capture | A | R | I | C | C | R | C | C | C | C | C |
| Success criteria & baselines | R | C | A | R | C | C | C | C | C | I | I |
| Future-state visioning | A | R | A | R | C | C | C | C | C | C | C |
| Discovery deliverable sign-off | R | C | A | C | I | I | I | I | I | I | I |

**Sample stakeholder-identification questions**
- Who is the single accountable owner for this initiative, and what does success look like *for them personally*?
- Which finance questions land on the CFO's desk that take more than a day to answer?
- Who owns the GL of record? Who owns headcount of record? Who owns vendor master?
- Which department leaders consume finance reporting today, and which ignore it?
- Who must approve data access, and what is their security review process?
- Is there an existing Databricks workspace, and who administers it?

**Expected outputs:** named stakeholder roster with contact and availability; completed Discovery RACI; identified gaps where a role is unavailable, each with a follow-up action and owner.

---

## 3. Recommended Meeting Structure

Discovery runs as a sequenced series of working sessions over a **2–3 week** window. Sessions are working sessions (whiteboard + live data peek), not status calls.

| # | Session | Duration | Attendees | Goals | Primary outputs |
|---|---|---|---|---|---|
| S0 | **Internal prep & handoff review** | 60 min | Delivery Lead, Solution Architect, (Sales for handoff) | Ingest `09-sales-to-implementation-handoff.md`; load known context; draft hypotheses | Pre-read; hypothesis list; tailored question bank |
| S1 | **Executive Kickoff & Objectives** | 60 min | Exec Sponsor, CFO, VP Finance, Delivery Lead | Confirm objectives 1.1–1.5; align on decision-intelligence framing; agree schedule | Signed objectives; success metric candidates |
| S2 | **Reporting & Close Process Deep-Dive** | 90 min | Controller, VP Finance, FP&A Lead, Architect | Map close calendar, report inventory, manual effort | Current-state reporting map; close timeline |
| S3 | **Forecasting & Variance Working Session** | 90 min | FP&A Lead, VP Finance, Architect | Map forecast cycles (3+9/6+6/9+3), variance workflow, accuracy history | Forecast process map; accuracy baseline |
| S4 | **Executive Reporting & Commentary** | 60 min | CFO, Exec Sponsor, FP&A Lead | Capture board/exec pack contents, commentary process, cadence | Exec reporting inventory; commentary needs |
| S5 | **Data Landscape & Integration** | 120 min | IT/Data Lead, Controller, Architect | Inventory source systems; map to connectors; assess access & Databricks state | Source-to-connector map; integration constraints |
| S6 | **Specialist Domains** (Procurement / Workforce / External Labor) | 60 min each (run in parallel where possible) | Procurement, HR/Workforce, External Labor owners, Architect | Scope vendors, headcount, external_labor, cloud_spend modules | Module-level requirements & data sources |
| S7 | **Data Quality & Governance Review** | 90 min | Controller, IT/Data Lead, Architect | Sample real extracts; run mental model of the 8 validators; assess governance | Data quality grades; validation risk list |
| S8 | **Pain Point & Decision-Latency Workshop** | 90 min | Cross-functional finance + BU leaders | Elicit and score pain points; capture time-to-answer baselines | Scored pain point register |
| S9 | **Future-State Visioning** | 90 min | Exec Sponsor, CFO, FP&A, BU leaders, Architect | Co-design the decision-intelligence target; agent & module shortlist | Future-state vision; module/agent shortlist |
| S10 | **Findings Readout & Sign-off** | 60 min | Exec Sponsor + all key stakeholders | Present Discovery Summary; confirm success criteria; secure sign-off | Signed Discovery Summary; go/no-go to Phase 2 |

**Facilitation rules:** every session has a named scribe; every quantitative claim is sourced to a stakeholder or a data sample; unknowns are logged as gaps, never guessed. Sessions S2–S9 each close with a 5-minute "what did we just learn vs. what's still open" recap.

---

## 4. Current State Evaluation

### 4.1 Scope

A holistic baseline of how the finance function operates today across people, process, data, and tooling — independent of any single report. This frames the delta that Nexora must close.

### 4.2 Dimensions assessed

| Dimension | What we capture |
|---|---|
| Operating model | Team structure, roles, finance calendar, decision cadence |
| Tooling | ERP/GL, planning tools, BI, spreadsheets, point solutions |
| Data of record | Which system is authoritative for each fact (actuals, budget, forecast, headcount, vendor, external labor) |
| Decision latency | Time from "question asked" to "answer trusted" |
| Manual effort | Hours/month spent assembling, reconciling, and formatting |
| Governance | Who owns data quality, how errors are caught today |

**Sample questions**
- Walk me through your finance org chart and who owns each module's data.
- What is your fiscal year start, reporting currency, and reporting period structure?
- Which tools are "load-bearing" — if they broke Monday, the month wouldn't close?
- Where does work happen in spreadsheets that *should* be in a system?
- When an executive asks "why is X over budget?", what physically happens next, and how long does it take?
- What percentage of the finance team's month is spent producing vs. analyzing?

**Expected outputs:** current-state operating model summary; tooling inventory with "load-bearing" flags; data-of-record matrix; decision-latency baseline; manual-effort estimate (hours/month) by activity.

---

## 5. Reporting Process Assessment

### 5.1 Scope

Inventory and evaluate every recurring finance report: what it is, who produces it, how long it takes, and whether it answers a question or just presents data. This directly targets Nexora's reporting → decision-intelligence shift and the `financial_reporting` and `actuals` (variance) modules.

### 5.2 Report inventory instrument

| Report | Owner | Frequency | Hours to produce | Consumers | Decision it informs | Source data | Automatable in Nexora? |
|---|---|---|---|---|---|---|---|
| [PLACEHOLDER] | [PLACEHOLDER] | [Monthly/Weekly] | [PLACEHOLDER] | [PLACEHOLDER] | [PLACEHOLDER] | [GL/spreadsheet] | [Yes/Partial/No] |

**Sample questions**
- List every recurring report finance produces. Who reads each one?
- Which reports trigger a decision, and which are produced "because we always have"?
- How many hours per cycle go into the management reporting pack?
- How much of report production is copy/paste, reformatting, or reconciliation?
- Where do variance explanations come from today — analysis or anecdote?
- How is your chart of accounts and cost-center structure reflected in reporting?

**Expected outputs:** complete report inventory with effort estimates; classification of each report (decision-driving vs. ceremonial); manual-report-hours baseline; candidate reports for automation; mapping of reporting structures to `chartOfAccounts`, `costCenters`, and `departments`.

---

## 6. Forecasting Process Assessment

### 6.1 Scope

Evaluate the forecasting discipline against Nexora's rolling-cycle support (**3+9, 6+6, 9+3**) and the FP&A Specialist agent. We assess mechanics, cadence, accuracy history, and the variance/drift workflow that the `alignment` validator (forecast drift) will later police.

### 6.2 Forecast profile instrument

| Attribute | Current state | Target with Nexora |
|---|---|---|
| Forecast cycles used | [3+9 / 6+6 / 9+3 / other] | [PLACEHOLDER] |
| Re-forecast frequency | [Monthly/Quarterly] | [PLACEHOLDER] |
| Driver-based vs. trend | [PLACEHOLDER] | [PLACEHOLDER] |
| Forecast accuracy (last 4 cycles) | [±%] | [target ±%] |
| Time to produce a re-forecast | [PLACEHOLDER days] | [PLACEHOLDER] |
| Variance threshold for review | [PLACEHOLDER %] | [PLACEHOLDER %] |

**Sample questions**
- Which rolling forecast cycles do you run (3+9, 6+6, 9+3), and why those?
- How accurate were your last four forecasts vs. actuals? How do you measure accuracy?
- Is forecasting driver-based or trend-based? What are the key drivers?
- How long does a full re-forecast take, start to finish?
- At what variance threshold does a line item get investigated?
- How do you detect forecast drift today, and who owns the response?

**Expected outputs:** forecast process map; accuracy baseline across recent cycles; confirmed `forecastCycles` for `ClientConfig`; variance threshold and drift-detection rules to seed the `alignment` validator; FP&A agent fit assessment.

---

## 7. Executive Reporting Assessment

### 7.1 Scope

Assess the board/executive reporting and commentary process — the home of the CFO Advisor agent and the `executive_reporting` module. The goal is to understand the *questions executives ask* and the commentary they expect, so Nexora answers directly rather than emitting a templated pack.

### 7.2 Executive pack inventory

| Artifact | Cadence | Author | Commentary source | Top 3 recurring questions | Direct-answer candidate? |
|---|---|---|---|---|---|
| [Board pack] | [Monthly] | [PLACEHOLDER] | [PLACEHOLDER] | [PLACEHOLDER] | [Yes/No] |

**Sample questions**
- What goes into the board/exec pack, and how long does it take to assemble?
- Who writes the narrative commentary, and where do the insights come from?
- What are the three questions executives ask every cycle?
- When an exec disputes a number, how is it resolved and how long does it take?
- Would leadership trust an AI-generated answer if every claim cited its data source?
- What must *never* be auto-generated and always requires human sign-off?

**Expected outputs:** executive reporting inventory; recurring-question bank (seeds intent detection and agent scope); commentary workflow map; explicit human-review boundaries (to honor BASE_GUARDRAILS escalation); CFO Advisor agent fit assessment.

---

## 8. Data Landscape Assessment

### 8.1 Scope

Inventory all finance-relevant source systems and map each to a Nexora connector, distinguishing the **live path** (CSV/Excel upload + Databricks SQL) from **roadmap connectors**. Assess access, ownership, extract reality, and data quality. This is the critical input to Phase 2 (Data Assessment & Architecture) and Phase 3 (Connection Layer & Integration).

### 8.2 Source-to-connector mapping

| Client source system | Domain | Maps to Nexora connector | Connector status | Access method (today) | Owner | DQ grade (A–D) |
|---|---|---|---|---|---|---|
| [General Ledger] | GL/actuals | QuickBooks Online / NetSuite | [Live via CSV / Roadmap] | [CSV export / API] | [PLACEHOLDER] | [PLACEHOLDER] |
| [HRIS] | Headcount | Workday HCM | [Roadmap] | [CSV / API] | [PLACEHOLDER] | [PLACEHOLDER] |
| [VMS] | External labor | Beeline / Fieldglass | [Roadmap] | [CSV / API] | [PLACEHOLDER] | [PLACEHOLDER] |
| [Procurement] | Vendor spend | Coupa | [Roadmap] | [CSV / API] | [PLACEHOLDER] | [PLACEHOLDER] |
| [Planning] | Budget/forecast | Workday Adaptive Planning | [Roadmap] | [CSV / API] | [PLACEHOLDER] | [PLACEHOLDER] |
| [Lakehouse] | Cross-domain | Databricks SQL | [Live] | [SQL / Delta] | [PLACEHOLDER] | [PLACEHOLDER] |
| [Spreadsheets] | Any | File ingestion (CSV/Excel) | [Live] | [Manual upload] | [PLACEHOLDER] | [PLACEHOLDER] |

> **Canon reminder:** The live ingestion path today is **File (CSV/Excel) upload + Databricks SQL**. All other connectors (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Adaptive) are **staged on the roadmap**. Discovery must set client expectations accordingly and design the launch around CSV/Excel + Databricks, with roadmap connectors sequenced into Phase 10 (Optimization & Expansion).

### 8.3 Ingestion-path reality check

The platform ingestion flow is: **File → Parser → Mapper → Validator → Writer/Store** (orchestrated by `ingestFile()`). For each in-scope source, confirm:

| Check | Capture |
|---|---|
| Can the source produce a clean, repeatable CSV/Excel extract? | [Yes/No + notes] |
| Are column names/structures stable across periods? | [Yes/No] |
| Does each record carry (or can it derive) `clientId`, `period` (ISO month), `source`? | [Yes/No] |
| Is there an existing Databricks workspace and read-only token path? | [Yes/No + owner] |
| Extract frequency the client can realistically sustain | [Monthly/Weekly/Ad hoc] |

**Sample questions**
- For each finance domain, what system is the source of truth, and can it export CSV/Excel cleanly?
- Do you have a Databricks workspace today? Who administers it, and can we get a read-only token?
- How stable are your extract formats month to month?
- Which of these source systems do you expect to integrate at launch vs. later?
- Who will own producing the recurring extracts, and how much effort is that?
- Are there PII or confidential fields in these extracts we must exclude (no PII in schema)?

**Expected outputs:** completed source-to-connector map with status and DQ grades; confirmed launch data path (CSV/Excel + Databricks); Databricks workspace/token readiness; extract ownership and cadence; data quality findings feeding Section 9; roadmap connector sequence.

---

## 9. Data Quality Assessment

### 9.1 Scope

Sample real client data and evaluate it against the platform's **8 validators**, so we can predict quarantine risk before go-live. Errors block storage (quarantine); warnings allow storage with review.

### 9.2 Validator readiness matrix

| Validator | What it checks | Likely client risk | Evidence sampled | Pre-launch action |
|---|---|---|---|---|
| Required-fields | Mandatory fields present | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Period | Valid ISO month, in range | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Cost-center | Maps to `costCenters` | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Account | Maps to `chartOfAccounts` | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Department | Maps to `departments` | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Duplicate | No duplicate records | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Anomaly | Negatives, Z>3 outliers | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |
| Alignment | Variance threshold, forecast drift | [PLACEHOLDER] | [sample] | [PLACEHOLDER] |

**Data quality grading scale**

| Grade | Definition |
|---|---|
| A | Clean, stable, fully mapped; minimal validator risk |
| B | Mostly clean; minor mapping gaps; warnings expected |
| C | Inconsistent; significant mapping/cleansing required; quarantine likely |
| D | Unreliable or unavailable; blocks the module until remediated |

**Sample questions**
- Can you share 2–3 months of a real extract so we can sample it?
- How complete are your cost-center and account codes across transactions?
- Do you have known duplicate or restatement issues?
- Are negative values legitimate (credits) or error signals in your data?
- Who owns fixing data errors today, and how fast can they turn them around?

**Expected outputs:** validator readiness matrix with DQ grades; quarantine-risk list; data remediation plan with owners; alignment/anomaly thresholds to seed validators; recommendation on whether the Data Quality Advisor agent should be enabled at launch.

---

## 10. Pain Point Framework

### 10.1 Taxonomy

Every pain point is classified into one of five categories. This taxonomy ensures we capture *decision-latency* pain — the core of Nexora's value — not just process annoyances.

| Category | Definition | Example |
|---|---|---|
| **Process** | Workflow inefficiency, manual steps, handoffs | Month-end close takes 12 business days |
| **Data** | Quality, fragmentation, reconciliation, source-of-truth | Headcount in 3 places, none agree |
| **Tooling** | Capability gaps, brittle spreadsheets, no self-serve | Forecast lives in one analyst's workbook |
| **Talent** | Capacity/skill constraints, key-person risk | One person can answer variance questions |
| **Decision-latency** | Time from question → trusted answer is too long | "Why is cloud spend up?" takes 3 days |

### 10.2 Severity × Frequency scoring

Score each pain point on two 1–5 scales; **Priority = Severity × Frequency** (1–25).

| Scale | 1 | 3 | 5 |
|---|---|---|---|
| **Severity** | Minor annoyance | Material drag on the function | Blocks decisions / creates risk |
| **Frequency** | Rare / annual | Monthly | Continuous / every cycle |

| Priority band | Score | Action |
|---|---|---|
| Critical | 20–25 | Must be addressed at launch; anchors success criteria |
| High | 12–19 | Target in initial `activeModules` scope |
| Medium | 6–11 | Roadmap / Phase 10 |
| Low | 1–5 | Log only |

### 10.3 Pain point register (instrument)

| ID | Pain point | Category | Severity (1–5) | Frequency (1–5) | Priority | Module/Agent that addresses it | Owner |
|---|---|---|---|---|---|---|---|
| P-01 | [PLACEHOLDER] | [Process/Data/Tooling/Talent/Decision-latency] | [n] | [n] | [S×F] | [module / agent] | [PLACEHOLDER] |

**Sample questions**
- What is the single most painful recurring task in your finance month?
- Where do you lose the most time to reconciliation or reformatting?
- What question do executives ask that you dread because the answer is slow?
- Where is there key-person risk — work only one person can do?
- If we could eliminate one report or one process step, which would create the most relief?

**Expected outputs:** scored pain point register; ranked Critical/High list; explicit mapping of each high-priority pain point to a module and/or agent; inputs to success criteria (Section 12).

---

## 11. Future State Visioning

### 11.1 Scope

Co-design the target operating state, framed explicitly as the move to **decision intelligence**. The vision is anchored to the AI finance agents and the question-answering flow — not to new dashboards.

### 11.2 Decision-intelligence target by domain

| Finance domain | Today (current state) | Future state with Nexora | Enabling module(s) | Enabling agent |
|---|---|---|---|---|
| Variance / actuals | [PLACEHOLDER] | Ask "why off budget?" → cited direct answer | actuals | FP&A Specialist |
| Forecasting | [PLACEHOLDER] | Rolling cycle re-forecast w/ drift flags | forecast | FP&A Specialist |
| Executive reporting | [PLACEHOLDER] | Direct exec answers w/ sourced commentary | executive_reporting | CFO Advisor |
| Vendor spend | [PLACEHOLDER] | Spend questions answered on demand | vendors | Procurement Advisor |
| Workforce | [PLACEHOLDER] | Headcount plan-vs-actual on demand | headcount | Workforce Finance |
| External labor | [PLACEHOLDER] | SOW/contingent spend visibility | external_labor | External Labor Advisor |
| Cloud spend | [PLACEHOLDER] | Cloud cost questions answered directly | cloud_spend | Procurement Advisor |
| BU partnership | [PLACEHOLDER] | Self-serve BU finance answers | financial_reporting | Finance Business Partner |
| Data trust | [PLACEHOLDER] | Validated data with quality flags | (all) | Data Quality Advisor |

### 11.3 Agent guardrail alignment

Future-state design must respect **BASE_GUARDRAILS** for every enabled agent: never fabricate/extrapolate numbers; distinguish fact vs. interpretation; cite the data source/metric for every claim; flag missing/low-confidence data before concluding; recommend follow-ups on gaps; escalate to human review. Visioning confirms the client *accepts* these guardrails as the operating contract.

**Sample questions**
- Eighteen months out, what can your team do that it can't today?
- If you could ask the platform any finance question and get a cited answer in seconds, what would you ask first?
- Which of the seven agents would create the most value for your team?
- What does "good enough to trust" mean for an AI-generated finance answer here?
- Where will you still want a human in the loop, by policy?

**Expected outputs:** future-state vision statement; per-domain target table; signed-off `activeModules` shortlist; signed-off enabled-agents shortlist; documented acceptance of agent guardrails and human-review boundaries.

---

## 12. Success Criteria Framework

### 12.1 Scope

Translate objectives and pain points into measurable success metrics, each with a **baseline → target**, owner, and measurement method. These metrics become the contract that Go Live (Phase 9) is judged against.

### 12.2 Standard metric set

| Metric | Definition | Baseline (measured) | Target | Owner | Measurement method |
|---|---|---|---|---|---|
| **Close cycle time** | Business days to close the month | [PLACEHOLDER] | [PLACEHOLDER] | Controller | Close calendar logs |
| **Forecast accuracy** | \|Forecast − Actual\| / Actual, by cycle | [±%] | [±%] | FP&A Lead | Cycle-over-cycle comparison |
| **Time-to-answer** | Median time from finance question → trusted answer | [PLACEHOLDER] | [PLACEHOLDER] | VP Finance | Question log / sampling |
| **Manual-report hours eliminated** | Hours/month removed from report production | [PLACEHOLDER] | [PLACEHOLDER] | FP&A Lead | Effort tracking |
| **Variance explained %** | % of material variances with a cited explanation | [PLACEHOLDER %] | [PLACEHOLDER %] | FP&A Lead | Variance register |
| **Data validation pass rate** | % of records passing validators (no quarantine) | [PLACEHOLDER %] | [PLACEHOLDER %] | IT/Data Lead | Validator logs |
| **Self-serve answer rate** | % of BU finance questions answered without analyst | [PLACEHOLDER %] | [PLACEHOLDER %] | Finance BP | Usage analytics |
| **Executive answer confidence** | Exec-rated trust in platform answers (1–5) | [PLACEHOLDER] | [≥4] | Exec Sponsor | Periodic survey |

### 12.3 Baseline rule

No target is accepted without a measured baseline. Where a baseline cannot be measured during discovery, it is logged as a gap with an owner and a date — never estimated and presented as fact (BASE_GUARDRAILS).

**Sample questions**
- How would *you* know, six months in, that this was worth it?
- What is the number that, if it moved, leadership would notice?
- What's the honest current value for each of these metrics today?
- Who owns each metric, and where does the data to measure it live?

**Expected outputs:** completed success criteria table with baselines, targets, owners, and methods; gap list for any unmeasurable baselines; agreement that these metrics define Go Live success.

---

## 13. Discovery Deliverables

The assessment produces a fixed set of artifacts. These are the formal outputs handed to Phase 2 and consumed by `02-implementation-playbook.md` and `04-solution-design-framework.md`.

| # | Artifact | Description | Primary consumer |
|---|---|---|---|
| D1 | **Discovery Summary** | Executive synthesis: findings, recommendation, scope, go/no-go (template §14.1) | Exec Sponsor, Delivery |
| D2 | **Current State Assessment** | Documented baseline across process/data/tooling (template §14.2) | Solution Architect |
| D3 | **Future State Assessment** | Target decision-intelligence state, module & agent shortlist (template §14.3) | Solution Architect, Sponsor |
| D4 | **Source-to-Connector Map** | Section 8 instrument, completed | Phase 3 Integration |
| D5 | **Data Quality / Validator Readiness Matrix** | Section 9 instrument, completed | Phase 4 Governance |
| D6 | **Scored Pain Point Register** | Section 10 instrument, completed | Phase 5 Configuration |
| D7 | **Success Criteria Baseline Sheet** | Section 12 table, with measured baselines | Phase 9 Go Live |
| D8 | **`ClientConfig` Input Pack** | Captured raw inputs for every required config field | Phase 5 Configuration |
| D9 | **Discovery RACI & Stakeholder Roster** | Section 2 outputs | Delivery |
| D10 | **Gap & Risk Log** | All flagged unknowns, missing data, and risks with owners | Delivery, Sponsor |

---

## 14. Reusable Templates

> Copy a template into a client-specific working file. Replace every `[PLACEHOLDER]`. Do not delete scoring scales — they standardize cross-client comparison.

### 14.1 Discovery Summary Template

```text
DISCOVERY SUMMARY — [CLIENT NAME]
Prepared by: [SCA Delivery Lead]        Date: [YYYY-MM-DD]
Engagement: Nexora Financial Intelligence Assessment
Sessions held: [S1–S10]                 Stakeholders engaged: [count / roles]

1. EXECUTIVE SUMMARY
   [3–5 sentences: who the client is, the core decision-intelligence opportunity,
    and the headline recommendation.]

2. TOP FINDINGS (ranked)
   F1: [finding]                          Evidence/source: [PLACEHOLDER]
   F2: [finding]                          Evidence/source: [PLACEHOLDER]
   F3: [finding]                          Evidence/source: [PLACEHOLDER]

3. RECOMMENDED SCOPE
   Active modules:   [financial_reporting / actuals / budget / forecast /
                      executive_reporting / headcount / vendors /
                      external_labor / cloud_spend]
   Enabled agents:   [cfo / fpa / procurement / headcount / external-labor /
                      finance-bp / validation]
   Launch data path: [CSV/Excel upload + Databricks SQL]
   Roadmap connectors (Phase 10): [list]

4. SUCCESS CRITERIA (baseline → target)
   [Metric]: [baseline] → [target]   Owner: [PLACEHOLDER]
   [Metric]: [baseline] → [target]   Owner: [PLACEHOLDER]

5. KEY RISKS & GAPS
   R1: [risk/gap]   Severity: [H/M/L]   Owner: [PLACEHOLDER]   Mitigation: [PLACEHOLDER]

6. RECOMMENDATION
   [ ] Proceed to Phase 2 (Data Assessment & Architecture)
   [ ] Proceed with conditions: [PLACEHOLDER]
   [ ] Do not proceed — reason: [PLACEHOLDER]

Sign-off:  Exec Sponsor [____]   SCA Delivery Lead [____]   Date [____]
```

### 14.2 Current State Assessment Template

| Area | Current state description | Maturity (1–5) | Pain (1–5) | Source of evidence |
|---|---|---|---|---|
| Operating model & cadence | [PLACEHOLDER] | [n] | [n] | [stakeholder/sample] |
| Reporting process | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Forecasting process | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Executive reporting | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Variance / actuals | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Budget process | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Vendor spend | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Workforce / headcount | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| External labor | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Cloud spend | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Data landscape & integration | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Data quality & governance | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |
| Security & access model | [PLACEHOLDER] | [n] | [n] | [PLACEHOLDER] |

**Maturity scale:** 1 Ad hoc / spreadsheet-bound · 2 Defined but manual · 3 Standardized · 4 Largely automated · 5 Decision-intelligent
**Pain scale:** 1 None · 2 Minor · 3 Material · 4 Severe · 5 Blocking

```text
CURRENT STATE — DATA-OF-RECORD MATRIX
Fact type            | System of record | Owner        | Extract method | DQ grade
---------------------|------------------|--------------|----------------|---------
ActualEntry          | [PLACEHOLDER]    | [PLACEHOLDER]| [CSV/SQL/API]  | [A–D]
BudgetEntry          | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
ForecastEntry        | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
HeadcountRecord      | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
ExternalLaborRecord  | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
VendorSpendRecord    | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
KPIRecord            | [PLACEHOLDER]    | [PLACEHOLDER]| [PLACEHOLDER]  | [A–D]
```

### 14.3 Future State Assessment Template

| Domain | Future-state capability (decision intelligence) | Module | Agent | Priority (from §10) | Dependencies |
|---|---|---|---|---|---|
| [PLACEHOLDER] | [PLACEHOLDER] | [module key] | [agent key] | [Critical/High/Med/Low] | [data/connector] |

```text
FUTURE STATE — CONFIG & SCOPE TARGET
ClientConfig inputs captured:
  clientId:            [PLACEHOLDER]
  branding:            [PLACEHOLDER]
  fiscalYearStart:     [PLACEHOLDER]
  reportingCurrency:   [PLACEHOLDER]
  reportingPeriods:    [PLACEHOLDER]
  forecastCycles:      [3+9 / 6+6 / 9+3]
  businessUnits:       [PLACEHOLDER]
  costCenters:         [PLACEHOLDER]
  departments:         [PLACEHOLDER]
  chartOfAccounts:     [PLACEHOLDER]
  activeModules:       [PLACEHOLDER]
  enabledAgents:       [PLACEHOLDER]

Decision-intelligence acceptance:
  [ ] Client accepts BASE_GUARDRAILS as the agent operating contract
  [ ] Human-review boundaries documented: [PLACEHOLDER]
  [ ] "Trusted answer" definition agreed: [PLACEHOLDER]

Launch scope confirmed:
  Launch data path:    [CSV/Excel + Databricks SQL]
  Phase 10 roadmap:    [connectors / modules to add later]

Top 3 questions Nexora must answer at Go Live:
  Q1: [PLACEHOLDER]
  Q2: [PLACEHOLDER]
  Q3: [PLACEHOLDER]

Sign-off:  Exec Sponsor [____]   FP&A Lead [____]   SCA Architect [____]   Date [____]
```

---

## 15. Transition to Implementation

On sign-off of the Discovery Summary (D1) with a "Proceed" recommendation, the engagement transitions to **Phase 2 — Data Assessment & Architecture**, carrying forward deliverables D2–D10. The `ClientConfig` Input Pack (D8) becomes the authoring source for Phase 5 — Finance Intelligence Configuration, where onboarding the client = authoring its `ClientConfig` with zero code changes. Open items in the Gap & Risk Log (D10) are owned through to closure. Refer to `02-implementation-playbook.md` for the downstream execution model and `04-solution-design-framework.md` for the architecture translation of these findings.
