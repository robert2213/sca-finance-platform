# Pilot Framework

> **File 09 of the Sin City Analytics Design Partner Acquisition System (the GTM operating system).** This is the operating doc for running a Nexora design-partner pilot from kickoff to a paid, referenceable customer. It is **Forward-Deployed in spirit** (Palantir FDE model): a senior person from Sin City Analytics embeds with the partner, owns the outcome, and does not leave until a finance leader stakes a real decision on a Nexora answer. The pilot is tight, time-boxed, and outcome-anchored — never a feature tour, never an open-ended trial.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 09 — Pilot Framework |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Audience** | Founder/GTM, Solutions Architect (the Forward-Deployed lead), Customer Success, and the design partner's executive sponsor + operational owner |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Classification** | Confidential — Commercial |
| **Product** | Finance Intelligence Platform (codename **Nexora**) — behaves like a finance analyst, not a report generator |
| **Certification basis** | Platform is **"Ready for Design Partners"** per `../docs/commercial-readiness/CERTIFICATION.md` (code + build certified; full commercial rating pending a live penetration test). Pilots run only on capability that is **Live today**. |

---

## Purpose & How to Use This Document

This framework converts a *qualified* design partner (qualified per `07-qualification-framework.md`, recruited per `03-design-partner-program.md`) into a *paying, referenceable* customer through a single disciplined motion: a **6-week embedded pilot** that proves Nexora answers the partner's own finance questions on the partner's own data, then converts on a pre-agreed gate.

It is the GTM-side companion to two delivery-side documents and defers to them on anything authoritative:

- **Pricing**: all dollar values live in `../delivery/06-pricing-framework.md` and the controlled rate card (`06a-rate-card.xlsx`). This document carries **`[PLACEHOLDER]`s only** — never a hard dollar figure (Section 5).
- **Conversion paperwork**: the paid agreement is produced via `../delivery/05-proposal-template.md`; the transfer from pilot-mode to steady-state delivery runs through `../delivery/09-sales-to-implementation-handoff.md` (Section 7).
- **Program charter**: this pilot executes against the obligations, cohort design, and MOU in `../delivery/08-design-partner-program.md`.

> **The single rule that governs everything below:** *A pilot succeeds when the partner trusts a Nexora answer enough to stake a real finance decision on it.* Not when a dashboard renders. Not when data loads. When a CFO, VP Finance, or Head of FP&A asks a real question and acts on the cited answer. Everything in this framework is instrumented toward that one moment — the **first trusted answer**.

| If you are… | Read first |
|---|---|
| Founder/GTM running the pilot | Sections 1, 4, 6, 7 (structure, success criteria, exit, conversion) |
| Solutions Architect (Forward-Deployed lead) | Sections 1, 2, 3 (structure, timeline, deliverables) |
| The partner's sponsor (external) | Sections 1, 4, 7 (what we'll build, how we measure, how it converts) |
| RevOps / Commercial | Sections 5, 6, 7 (pricing concessions, exit, conversion mechanics) |

---

## 1. Pilot Structure

### 1.1 Design principles (why the pilot is shaped this way)

| Principle | What it means operationally | Why |
|---|---|---|
| **Forward-Deployed, not self-serve** | A senior SCA person (Founder/GTM + Solutions Architect) embeds and personally drives data → config → first answer. We do the work *with* them, not hand them a login. | Pre-PMF, the product's edge is finance-domain depth and demonstrable outcomes — not brand. The fastest path to a trusted answer is a human who owns the outcome (Palantir FDE model). |
| **One question, end-to-end, first** | We pick **one** high-stakes decision question from discovery and drive it all the way to a cited answer before broadening. | A narrow, deep win beats a broad, shallow demo. It proves the **Question → Intent → Data → Claude Analysis → Direct Answer** flow on real data. |
| **Live capability only** | The pilot uses only what is **Live today**: CSV/Excel ingestion, Databricks SQL (Delta), the 7 AI finance agents under guardrails, the 8 validators, RBAC, per-tenant `clientId` isolation. Roadmap connectors (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive) are **discussed and prioritized, never promised live**. | The whole program's trust is built on the Honesty Principle (`../delivery/08-`). One over-claimed connector erodes it. |
| **Time-boxed and gated** | 6 weeks core + a 2-week conversion window. Hard stop. No drifting "trials." | A pilot with no end is a free tier. The gate (Section 6) forces a decision. |
| **Outcome-anchored measurement** | Success is measured against the partner's *own* baseline (e.g., "5 days to assemble the variance narrative") and their *own* questions — agreed in week 0, not invented at the end. | You cannot prove value against a metric the partner didn't agree to up front. |
| **Convert, don't extend by default** | The default outcome is *convert to paid*. Extension is an exception with a corrective plan; graceful exit is honest, not a failure to hide. | The program is a funnel to revenue + reference, not a perpetual concession. |

### 1.2 Pilot scope envelope (what is in / out of a pilot)

| In scope (a tight land) | Out of scope (defer to paid expansion) |
|---|---|
| **1 business unit / 1 tenant** (`clientId`) | Multi-entity / multi-BU rollouts |
| **2–3 modules** mapped to the partner's top questions (e.g., variance/actuals + budget + forecasting) | All 10 modules at once |
| **2–4 agents** that answer those questions (e.g., FP&A Specialist + CFO Advisor + Data Quality Advisor) | Full 7-agent enablement |
| **1 primary decision question** driven to a trusted answer, then 2–3 secondary questions | An exhaustive question backlog |
| **CSV/Excel upload** (and Databricks SQL if the partner already has it) as the live ingestion path | Native ERP/HCM/VMS connector builds (roadmap; price as build later via `../delivery/06-` §7) |
| **3–6 months of history** for the modules in scope, refreshed once mid-pilot | Multi-year historical backfills |
| RBAC roles for the pilot user set (CFO / FPA / Controller / Leader / ReadOnly as needed) | Org-wide seat rollout |

> **Scope discipline.** The pilot is the *smallest configuration that proves the north-star flow on the partner's own data* — identical to the "correct first land" posture in `../delivery/06-` §2. Anything bigger slows time-to-first-trusted-answer and dilutes the win.

### 1.3 Roles — who does what (both sides)

| Role | Side | Responsibility in the pilot |
|---|---|---|
| **Founder/GTM** | SCA | Owns the relationship and the conversion; runs the weekly sponsor check-in; makes the convert/extend/exit call at the gate |
| **Solutions Architect (Forward-Deployed lead)** | SCA | Embeds with the partner; authors `ClientConfig`; runs ingestion + validators; drives the first trusted answer; owns the outcome day-to-day |
| **Customer Success** (where staffed; may be the SA early) | SCA | Owns cadence, the success-criteria scoreboard, and the Day-bound rituals |
| **Executive sponsor** (CFO / VP Finance / Head of FP&A) | Partner | Brings the real decision question; personally judges whether an answer is trustworthy; lends the reference if earned |
| **Operational owner** (FP&A manager / analyst / controller) | Partner | Produces the CSV/Excel extracts; attends working sessions; is the primary day-to-day user |
| **IT/Data contact** (as needed) | Partner | Confirms data export, security posture, and (if used) Databricks access |

### 1.4 The five pilot stages (overlaid on the canonical 10 phases)

The pilot compresses the canonical 10-phase delivery method (`../delivery/02-implementation-playbook.md`) into five pilot stages. Each maps to canonical phases so the eventual handoff (Section 7) is clean.

```text
 STAGE 0          STAGE 1            STAGE 2           STAGE 3            STAGE 4
 MOBILIZE   -->   GROUND TRUTH  -->  FIRST ANSWER -->  BROADEN      -->   PROVE & DECIDE
 (Week 0)         (Weeks 1-2)        (Weeks 3-4)       (Week 5)           (Week 6 + window)
 Phases 1,5,7     Phases 2,3,4       Phases 5,6,9      Phase 6,9          Phase 9,10
 kickoff,         data in,           ClientConfig,     more questions,    measure vs criteria,
 config, roles    validators pass    first trusted     exec experience,   conversion review
                  ("Data Trusted")   answer            adoption           -> proposal (05)
```

---

## 2. Pilot Timeline (weeks)

A **6-week core pilot + 2-week conversion window** (8 weeks total). This is deliberately tighter than the 90-day program window in `../delivery/08-`: the design-partner *relationship* may run a quarter, but the *value-proving pilot inside it* is 6 weeks. A pilot that needs more than 6 weeks to produce a first trusted answer is a qualification or data-readiness failure, not a longer pilot.

### 2.1 Week-by-week plan

| Week | Stage | Primary objective | Key activities | Owner | Exit condition |
|---|---|---|---|---|---|
| **0** | Mobilize | Lock scope, data plan, and success criteria | Kickoff (60 min); confirm the 1 primary + 2–3 secondary questions; agree the baseline metric per question; author draft `ClientConfig`; assign RBAC roles; agree data extracts + due dates; sign pilot success criteria (Section 4) | Founder/GTM + SA | Signed success criteria; data due-date owned; `ClientConfig` drafted |
| **1** | Ground Truth | Get real data in, mapped to the model | Receive first CSV/Excel extracts; map to data model (Account, CostCenter, Department, BusinessUnit, TimePeriod / ActualEntry, BudgetEntry, ForecastEntry, HeadcountRecord, ExternalLaborRecord, VendorSpendRecord, KPIRecord); run `ingestFile()`; first validator pass | SA + partner ops owner | Data ingested; validator results reviewed jointly |
| **2** | Ground Truth | Reach "Data Trusted" | Tune the 8 validators to the partner's data; clear quarantine (errors block storage); agree warning tolerances (anomaly Z>3, alignment/variance thresholds); Data Quality Advisor pass | SA + partner ops owner | **"Data Trusted" gate** (Phase 4): errors quarantined, warnings reviewed |
| **3** | First Answer | Drive the **primary** question to a cited answer | Configure in-scope modules + agents; run the primary decision question through the flow; verify the answer is grounded, cited, and matches the partner's mental model | SA + partner sponsor | Primary question returns a cited, grounded answer |
| **4** | First Answer | **First trusted answer** (the pivotal moment) | Sponsor reviews the primary answer against reality; refines question phrasing; agent behavior tuned (citations, follow-ups, guardrail thresholds); sponsor confirms they would *act* on it | Founder/GTM + sponsor | **First trusted answer logged** (the core success metric) |
| **5** | Broaden | Prove breadth + the executive experience | Run the 2–3 secondary questions; configure executive reporting/commentary surfaces; second data refresh; light adoption (operational owner runs questions unaided) | SA + partner ops owner | Secondary questions answered; sponsor sees board-grade output |
| **6** | Prove & Decide | Measure against criteria; preview conversion | Roll up the success-criteria scoreboard (Section 4); compute cycle-time reduction vs baseline; **Day-42 conversion preview** with sponsor; surface commercial shape | Founder/GTM + sponsor | Scoreboard complete; conversion previewed; no surprises |
| **+1–2 (window)** | Convert | Decide and paper | Conversion review against the gate (Section 6/7); produce paid proposal via `../delivery/05-`; agree founding-customer rate lock; sign; trigger handoff via `../delivery/09-` | Founder/GTM + Commercial + sponsor | **Convert / Extend / Graceful exit** decision recorded |

### 2.2 Cadence rituals (the heartbeat)

| Ritual | When | Duration | Attendees | Output |
|---|---|---|---|---|
| **Kickoff** | Week 0 | 60 min | Founder/GTM, SA, sponsor, ops owner | Signed success criteria + data plan |
| **Working session** | 2×/week, Weeks 1–5 | 30 min | SA + ops owner | Data/question/agent progress; blockers cleared |
| **Sponsor check-in** | Weekly | 30 min | Founder/GTM + sponsor | Outcome status; trust check; roadmap voting |
| **Data-Trusted review** | End of Week 2 | 45 min | SA + ops owner (+ IT) | Validator sign-off; quarantine cleared |
| **First-trusted-answer review** | Week 4 | 45 min | Founder/GTM + sponsor | The pivotal moment; logged |
| **Day-42 conversion preview** | Week 6 | 45 min | Founder/GTM + sponsor | Conversion previewed (no surprise at the gate) |
| **Conversion review** | Window (Day ~50) | 60 min | Founder/GTM + Commercial + sponsor | Convert/Extend/Exit decision |

### 2.3 Timeline guardrails

- **If "Data Trusted" slips past end of Week 2**, escalate: it is almost always a data-export problem (qualification gap) — fix the extract, do not extend the whole pilot silently.
- **If the first trusted answer slips past Week 4**, the Founder personally diagnoses: wrong question, missing data, or an agent-behavior gap. Re-scope to a question the data *can* answer rather than waiting.
- **No pilot runs past 8 weeks without an executive-committee exception.** A pilot that won't end won't convert.

---

## 3. Pilot Deliverables

Everything the partner receives is produced **through the platform**, on the partner's own data — never a hand-built deck. The deliverables are evidence that the north-star flow works for *them*.

### 3.1 Deliverables to the partner

| # | Deliverable | Produced in | What it proves | Canonical phase |
|---|---|---|---|---|
| D1 | **Authored `ClientConfig`** (branding, fiscalYearStart, reportingCurrency, reportingPeriods, forecastCycles, businessUnits, costCenters, departments, chartOfAccounts, activeModules, enabled agents) | Week 0–3 | Tenancy is configuration, not custom code — fast to stand up | Phase 5 |
| D2 | **Working ingestion pipeline on their data** (File → Parser → Mapper → Validator → Writer), proven on a real CSV/Excel extract | Week 1–2 | Their data flows in and is governed | Phases 2–3 |
| D3 | **"Data Trusted" report** — validator results across all 8 validators, quarantine cleared, agreed warning tolerances | Week 2 | Decisions made on this data are defensible | Phase 4 |
| D4 | **First Trusted Answer artifact** — the primary decision question, the cited answer, and the sponsor's confirmation they'd act on it | Week 4 | The product behaves like a finance analyst on their data | Phase 9 |
| D5 | **Secondary answers + executive experience** — 2–3 more answered questions and configured executive reporting/commentary surfaces | Week 5 | Breadth + board-grade output | Phases 6, 9 |
| D6 | **Pilot Outcome Scoreboard** — success criteria measured vs the Week-0 baseline (Section 4) | Week 6 | Quantified value, in the partner's own terms | Phase 9/10 |
| D7 | **RBAC role map** — the pilot user set mapped to the 7 roles (SystemAdmin, OrganizationAdmin, CFO, FPA, Controller, Leader, ReadOnly) | Week 0–5 | Real access control, per-tenant `clientId` isolation | Phase 7 |
| D8 | **Connector roadmap vote** — the partner's source systems ranked into the GA connector queue (their input, captured) | Ongoing | A benefit of the program: they shape the roadmap | — |

### 3.2 Internal deliverables (Sin City Analytics learning)

| # | Internal artifact | Why it matters pre-PMF |
|---|---|---|
| I1 | **Feedback register** (tagged `pipeline`/`agent`/`validator`/`connector`/`module`/`config`/`security`/`ux` per `../delivery/08-` §6.2) | Validates the question-answering pipeline on real, heterogeneous data |
| I2 | **Validator-tuning notes** (false-positive rates on anomaly/alignment) | Hardens governance against real error distributions |
| I3 | **Connector demand signal** | Ranks the GA connector build order with evidence |
| I4 | **Pricing/packaging signal** (which modules/agents the partner valued) | De-risks GA tiering ahead of `../delivery/06-` |
| I5 | **Reference + case-study draft** (if earned) | The marketing asset the program exists to produce |
| I6 | **Pilot retro** (what made the first trusted answer fast/slow) | Improves the next pilot; pre-PMF, the pilot motion itself is the thing being built |

### 3.3 Deliverable acceptance rule

Each partner deliverable is "accepted" only when the **sponsor or operational owner confirms it on the partner's own data** — not when SCA declares it done. D4 (First Trusted Answer) is accepted only by the **sponsor**, in their own words, against their own reality. This mirrors the Go-Live acceptance discipline in `../delivery/09-` §8.

---

## 4. Pilot Success Criteria (measurable)

Success criteria are **agreed and signed in Week 0** against the partner's own baseline. You cannot prove ROI against a number the partner did not commit to up front. Every criterion is binary or quantified — no "they seemed happy."

### 4.1 Primary success criteria (the pilot passes only if these hold)

| # | Criterion | Definition | Target | Source of truth |
|---|---|---|---|---|
| P1 | **First Trusted Answer** | Sponsor stakes (or commits to stake) a real finance decision on a cited Nexora answer to the primary question | Achieved by **≤ Day 30** | Sponsor confirmation, logged (D4) |
| P2 | **Answer trust rate** | % of agent answers the sponsor/owner rate "decision-ready, no rework" across the pilot questions | **≥ 70%** by Week 6 | Per-answer rating log |
| P3 | **Data Trusted** | All 8 validators run; errors quarantined; warning tolerances agreed | Achieved by **end of Week 2** | "Data Trusted" report (D3) |
| P4 | **Cycle-time reduction** | Time to produce the in-scope narrative (e.g., monthly variance commentary) vs the partner's Week-0 baseline | **≥ [TARGET]% reduction** (e.g., 5 days → < 1 day) | Baseline vs measured (D6) |
| P5 | **Question coverage** | Primary question + at least 2 secondary questions answered with cited, grounded output | **≥ 3 questions** answered | Scoreboard (D6) |

### 4.2 Secondary / health criteria (signal, not gate)

| # | Criterion | Target |
|---|---|---|
| S1 | Module adoption — distinct in-scope modules actively used | ≥ [N] of the 2–3 in scope |
| S2 | Operational-owner self-sufficiency — owner runs a question unaided | ≥ 1 unaided question by Week 5 |
| S3 | Sponsor NPS / satisfaction (monthly check-in) | ≥ [NPS] |
| S4 | Cadence attendance (sponsor check-ins + working sessions) | ≥ [X]% |
| S5 | Guardrail trust — sponsor sees the agent *correctly flag* missing/low-confidence data at least once and values it | ≥ 1 observed flag, valued |

> **S5 is subtle and important.** A design partner trusting Nexora *more* because it refused to fabricate a number — and flagged the gap instead — is one of the strongest validation signals there is. Capture it explicitly.

### 4.3 The Week-0 baseline worksheet (fill at kickoff)

```text
PILOT SUCCESS CRITERIA — agreed [DATE], signed by [SPONSOR] and [SCA FOUNDER]

Primary decision question (verbatim):
  "[e.g., Why is [DEPARTMENT] over budget in [PERIOD], and where is the variance concentrated?]"
  Module(s): [variance/actuals + budget]   Agent(s): [FP&A Specialist + CFO Advisor]
  Data needed: [ActualEntry + BudgetEntry, [N] months]   Live path: [CSV/Excel | Databricks]

Baseline today (the cost of the gap, in the partner's own terms):
  - Time to produce this narrative today:        [N] days   (= P4 baseline)
  - Who does it / how many people:               [roles]
  - How often it's late or disputed:             [frequency]

Secondary questions (2-3):
  1. "[verbatim]"   module/agent: [..]
  2. "[verbatim]"   module/agent: [..]

Targets (from §4.1/§4.2):
  P1 first trusted answer by:   Day [<=30]
  P2 answer trust rate:         >= 70%
  P4 cycle-time reduction:      >= [TARGET]%
  P5 questions answered:        >= 3

Signed — Partner sponsor: ____________   SCA: ____________   Date: ______
```

### 4.4 Scoreboard (rolled up at Week 6 → D6)

| Criterion | Target | Measured | Pass? |
|---|---|---|---|
| P1 First trusted answer (days) | ≤ 30 | [d] | [Y/N] |
| P2 Answer trust rate | ≥ 70% | [%] | [Y/N] |
| P3 Data Trusted (by Wk 2) | Wk 2 | [date] | [Y/N] |
| P4 Cycle-time reduction | ≥ [TARGET]% | [%] | [Y/N] |
| P5 Questions answered | ≥ 3 | [n] | [Y/N] |
| **Primary criteria met?** | **All P1–P5** | | **[CONVERT-READY / NOT]** |

---

## 5. Pilot Pricing Strategy

> **Hard constraint (inherited from `../delivery/06-pricing-framework.md`):** this document carries **no dollar values**. Every monetary figure is a `[PLACEHOLDER]` sourced from the controlled rate card (`06a-rate-card.xlsx`) and approved by Commercial. If a hard number appears here, it is a defect.

### 5.1 Pricing posture for a design-partner pilot

The pilot sits inside the **Design Partner** structured exception in `../delivery/06-` §13.5 — the *only* sanctioned standing discount, and only in exchange for obligations. The pilot's job is to **start the relationship and prove value**, not to extract year-one revenue (the land-and-expand posture in `../delivery/06-` §2).

| Element | Pilot posture | Reference |
|---|---|---|
| **Program/pilot fee** | `[PROGRAM_FEE or $0]` — design partners typically run the pilot at a waived or nominal fee in exchange for obligations | `../delivery/08-` §9, MOU |
| **Professional services (Foundation-equivalent setup)** | **Waived** during the pilot (the embedded SA work) — a defined design-partner concession | `../delivery/06-` §13.5; `../delivery/08-` §3.2 |
| **Subscription during pilot** | `[$0 / nominal]` for the pilot window; the partner is not yet a paying subscriber | `../delivery/06-` §11 |
| **Post-conversion rate** | Design-partner / founding-customer rate `[RATE]`, **locked for `[LOCK_TERM]`** (e.g., 24 months) | `../delivery/06-` §13.5; `../delivery/08-` §10.4 |
| **Expansion during locked term** | New modules/agents/seats activated via `ClientConfig` at the **locked per-unit price** `[PER_UNIT]` | `../delivery/08-` §10.4 |

### 5.2 Design-partner concessions and what each one buys back

Per the Concession Exchange in `../delivery/06-` §13.3 — **every concession buys something back**. A pilot is not a giveaway; it is a trade.

| Concession we give (pilot) | What we get back (obligation) |
|---|---|
| Waived setup / professional-services fee | Reference + case-study rights on a successful outcome; honest feedback cadence |
| Waived/nominal pilot subscription | Real data, refreshed monthly; ≥ `[Q]` real questions/month; ≥ `[X]%` cadence attendance |
| Founding-customer rate lock `[LOCK_TERM]` | Multi-year term commitment and/or auto-renew at conversion |
| First-of-kind connector concession (if a roadmap connector is co-built later) | Design Partner obligations (`../delivery/06-` §13.5) — roadmap influence funds a connector that lowers cost for every future client |
| Below-floor land at conversion (if approved) | ≥ 2 named expansion stages in the account plan (`../delivery/06-` §2.1 ladder) |

### 5.3 Pricing guardrails (do not break)

| Guardrail | Statement |
|---|---|
| **No hard dollars in this doc** | All figures `[PLACEHOLDER]`; the rate card governs (`../delivery/06-` §17). |
| **Concessions are obligation-bearing and time-boxed** | "Design partner" is not "cheap forever." The discount reverts at the next renewal gate if obligations lapse (`../delivery/06-` §13.5 anti-drift). |
| **Connectors stay honest** | Never price or imply a staged-stub connector as live during the pilot (`../delivery/06-` §7 canon guardrail). |
| **Margin floor still applies** | Even a strategic design-partner conversion must clear the margin floor unless an executive-committee exception is documented (`../delivery/06-` §13.4). |
| **Concession exchange is logged** | Every pilot concession is recorded against what it bought back (Section 5.2), per `../delivery/06-` §13.3. |

### 5.4 Pilot pricing worksheet (copy per pilot; fill from rate card)

```text
DESIGN-PARTNER PILOT PRICING — [PARTNER NAME]
Pilot fee:                 [PROGRAM_FEE or $0]
PS / setup during pilot:   [WAIVED]   (design-partner concession)
Subscription during pilot: [$0 / nominal]
Post-conversion rate:      [RATE], locked [LOCK_TERM]
Expansion unit price:      [PER_UNIT] (modules/agents/seats via ClientConfig)
Concessions -> buy-backs:  [see §5.2 — log each]
Margin-floor check:        [PASS/FAIL — floor [N%]]
Connector honesty check:   [no stub priced/implied as live — PASS/FAIL]
Approver (per 06 §13.2):   [AE/Mgr/VP/Commercial/ExecCom]
```

---

## 6. Pilot Exit Criteria

Every pilot ends in exactly one of three states. The decision is made at the **conversion review** (Section 7) against the Section 4 scoreboard. The criteria below are the *gate*; Section 7 is the *mechanics*.

### 6.1 The three exit states

| Exit state | Trigger (against Section 4) | What happens next |
|---|---|---|
| **CONVERT** | **All primary criteria P1–P5 met** AND reference + case study agreed | Move to paid at the locked design-partner rate; produce proposal via `../delivery/05-`; trigger handoff via `../delivery/09-` (Section 7) |
| **EXTEND** | Close — most criteria met, first trusted answer achieved, but a specific gap remains (e.g., P4 cycle-time not yet measurable, or a second data refresh pending) | **One-time 2-week extension** with a written corrective plan naming the single gap and its owner. No open-ended extensions. |
| **GRACEFUL EXIT** | Primary criteria not met / poor fit / data could not be made trusted / sponsor disengaged | Honest close: data exported and deleted on request (`[DELETE_DAYS]`); lessons captured in the retro; **no reference obligation**; relationship left warm |

### 6.2 Exit gate checklist (run at the conversion review)

```text
PILOT EXIT GATE — [PARTNER NAME] — review date [DATE]

[ ] P1 First trusted answer achieved (<= Day 30)?                 [Y/N]
[ ] P2 Answer trust rate >= 70%?                                  [Y/N]
[ ] P3 Data Trusted achieved (by Week 2)?                         [Y/N]
[ ] P4 Cycle-time reduction >= [TARGET]%?                         [Y/N]
[ ] P5 >= 3 questions answered (1 primary + 2 secondary)?         [Y/N]
[ ] Reference + case study agreed?                                [Y/N]
[ ] Sponsor confirms intent to proceed to paid?                   [Y/N]
[ ] Commercial shape clears margin floor (06 §13.4)?              [Y/N]

DECISION:  [ ] CONVERT   [ ] EXTEND (2 wk + corrective plan)   [ ] GRACEFUL EXIT
Single gap (if EXTEND): __________________  Owner: ______  Due: ______
Founder sign-off: ____________   Sponsor sign-off: ____________
```

### 6.3 Honest-exit discipline

A graceful exit is **not a hidden failure** — it is a correctly-qualified "no." Per `../delivery/08-` §4, a partnership that yields no usable feedback *and* no reference is logged internally as a learning, not buried. We still gain validator-tuning data and a connector-demand signal even from a non-converting pilot. We never strand the partner's data; we never disparage them. We leave the door open for a later land when their data readiness improves.

---

## 7. Pilot-to-Customer Conversion Process

This is the moment the design-partner motion exists for: converting a proven pilot into a paying, referenceable customer. It is **previewed at Day 42, decided in the conversion window, and papered through the existing delivery framework** — never a surprise, never an ad-hoc negotiation.

### 7.1 The conversion arc (no surprises)

```text
Week 6                    Conversion window (Weeks +1 to +2)
Day-42 PREVIEW   -->   CONVERSION REVIEW   -->   PROPOSAL   -->   SIGN   -->   HANDOFF
(sponsor sees the      (exit gate §6.2;          (via            (founding   (via 09-;
 scoreboard +          convert/extend/exit)       05-template)     rate lock)  pilot -> steady-state)
 commercial shape)
```

> **Why the Day-42 preview is non-negotiable.** The conversion conversation must never be the first time the sponsor hears a number or a commercial shape. At Day 42 the Founder walks the sponsor through the in-progress scoreboard and the *shape* of the paid relationship (tier, rate-lock, expansion path) so the formal conversion review is a confirmation, not a negotiation. This mirrors the Day-45 checkpoint in `../delivery/08-` §6.1.

### 7.2 Conversion mechanics — step by step

| Step | Action | Doc / artifact | Owner |
|---|---|---|---|
| 1 | **Day-42 preview** — walk the sponsor through the scoreboard-to-date and the commercial shape (no surprises) | Section 4 scoreboard | Founder/GTM |
| 2 | **Conversion review** — run the exit gate (Section 6.2); record Convert / Extend / Exit | Section 6.2 checklist | Founder/GTM + Commercial + sponsor |
| 3 | **Build the proposal** — convert the proven pilot scope into a paid proposal: in-scope modules/agents become the contracted scope; the pilot's answered questions become the success metrics / Go-Live acceptance test | `../delivery/05-proposal-template.md` (esp. §6 Recommended Solution, §10 Deliverables, §11 Investment) | Founder/GTM (acts as AE) |
| 4 | **Apply design-partner commercials** — founding-customer rate `[RATE]` locked `[LOCK_TERM]`; expansion at locked `[PER_UNIT]`; log concession exchange | `../delivery/06-` §13.5; `../delivery/08-` §10.4 | Commercial |
| 5 | **Agree the expansion thesis** — name ≥ 2 expansion stages (more BUs, more modules/agents, or a roadmap connector co-build) so the land has documented headroom | `../delivery/06-` §2.1 ladder | Founder/GTM + sponsor |
| 6 | **Sign** — order form / SOW executed; founding-customer terms recorded; billing set up | `../delivery/05-` §0/§14 | Commercial / Founder |
| 7 | **Confirm reference + case study** — logo rights and case-study commitment per MOU activate on conversion | `../delivery/08-` §9, §10 | Founder/GTM |
| 8 | **Trigger the handoff** — mark Closed-Won; assemble the handoff package; run the H0 handoff meeting; transition pilot-mode to steady-state delivery | `../delivery/09-sales-to-implementation-handoff.md` (§10 package, §11 meeting, H0 gate) | Founder/GTM + Delivery |

### 7.3 The pilot *is* the handoff package (the conversion advantage)

A converted pilot arrives at the `../delivery/09-` H0 handoff gate with most of the package **already built and verified on real data** — which is precisely why the embedded pilot model converts cleanly. Map of pilot artifacts → required H0 items:

| `../delivery/09-` §10.1 required item | Already produced by the pilot |
|---|---|
| Locked scope (modules, agents, BUs/cost centers) | Pilot scope envelope (Section 1.2) + D1 `ClientConfig` |
| Decision questions (verbatim) + traceability matrix → acceptance test | Section 4 primary/secondary questions; D4/D5 answers |
| Data source inventory; ingestion path confirmed **live** | D2 working pipeline (CSV/Excel or Databricks) |
| Target-store recommendation | The pilot store (Databricks SQL or SQLite fallback) |
| Org-dimension mapping | Done in Week 1 (Section 2.1) |
| Fiscal/config parameters; draft `ClientConfig` | D1 (authored, not just sketched) |
| Role/permission expectations | D7 RBAC role map (7 roles) |
| Security/legal commitments; no-PII confirmation | MOU disclosures (`../delivery/08-` §5.4); position-ID-only schema |
| Agreed success metrics | Section 4 scoreboard = the Go-Live acceptance test |
| Commercial summary (incl. design-partner terms) | Section 5 / 7.2 step 4 |
| Risk register; expansion signals | Feedback register (I1) + the §7.2 step-5 expansion thesis |

> **The conversion advantage, stated plainly.** Because the pilot was Forward-Deployed on the partner's real data, the H0 handoff is nearly a no-op — there is **no cold start** (the failure mode `../delivery/09-` exists to prevent). The team that ran the pilot already knows the data, the questions, and the people. This is the structural reason an embedded pilot converts faster and cleaner than a self-serve trial.

### 7.4 Conversion benchmarks (realistic early-stage SaaS, with caveats)

These are planning ranges for a **founder-led, pre-PMF** motion — not guarantees. Use them to set expectations and to instrument the funnel, and replace with your own cohort data as it accrues.

| Funnel step | Realistic early-stage range | Caveat |
|---|---|---|
| Cold outreach → positive reply | **1–5%** | Founder credibility + a specific, named trigger pushes toward the top of the range |
| Warm intro → intro call | **30–50%** | The dominant channel pre-PMF; protect and feed it |
| Intro call → qualified design-partner candidate | **20–40%** | Gated by `07-qualification-framework.md` (data readiness is the usual disqualifier) |
| Qualified candidate → pilot start (MOU signed) | **40–60%** | Friction is data export + executive sponsor commitment |
| **Pilot start → paid conversion** | **50–70%** target for a *well-qualified* cohort | A pilot is a *late-stage* commitment; if qualification was honest, conversion should be high. Low conversion = a qualification failure upstream, not a pilot failure |
| Converted partner → reference/case study | **≥ 60% of conversions** | Reference is an MOU obligation; it should track conversion closely |

> **The honest caveat.** With a cohort of 5–8 partners (`../delivery/08-` §2.4), these are *small-n* ranges — one partner moves the percentage by 12–20 points. Pre-PMF, the goal is **3–5 referenceable conversions**, not a statistically tidy rate. Treat the pilot-to-paid number as a *qualification quality* signal: if you qualified honestly (sponsor present, data exportable, real pain), the pilot should convert; if it doesn't, fix qualification (`07-`), not the pilot.

### 7.5 Buying triggers that make conversion land (time the close)

A pilot converts fastest when it rides an active buying trigger. Surface these in discovery and time the conversion review against them:

| Trigger | Why it accelerates a paid decision |
|---|---|
| **New CFO in seat < 12 months** | Wants a fast, visible finance-intelligence win; budget latitude is highest early |
| **Fundraise (recent or imminent)** | Board pressure on forecast accuracy and board-ready reporting; cash to invest |
| **ERP/HRIS migration (e.g., to NetSuite/Workday)** | Data is in motion; appetite to modernize the analytics layer is high |
| **Audit / restatement** | Acute need for defensible, cited numbers and data-quality governance (the 8 validators + guardrails) |
| **Board pressure on forecast accuracy** | Directly maps to rolling forecasting (3+9/6+6/9+3) + variance/drift detection |
| **FP&A hiring freeze** | Must do more analysis with fewer analysts — the AI-analyst value proposition |
| **M&A integration** | Multi-entity consolidation pain; expansion headroom for the locked rate |

---

## 8. Anti-Patterns (explicitly prohibited)

| Anti-pattern | Why it's banned | Enforcement |
|---|---|---|
| **Feature-tour pilot** (demo all 10 modules, no decision question) | No trusted answer = no proof = no conversion | Section 1.2 scope envelope; one primary question first |
| **Open-ended trial** (no end date) | Becomes a free tier; never converts | 6 + 2 week hard stop (Section 2.3) |
| **Inventing the metric at the end** | Cannot prove ROI against an un-agreed baseline | Success criteria signed in Week 0 (Section 4.3) |
| **Over-claiming a staged connector** | Breaks the Honesty Principle; erodes the program's trust | Live-only scope (Section 1.1); `../delivery/06-` §7 canon guardrail |
| **Hand-built deck instead of platform output** | Drifts from the north star; not reproducible by the partner | All deliverables produced *through* the platform (Section 3) |
| **Surprise commercial at the conversion review** | Kills trust at the worst moment | Mandatory Day-42 preview (Section 7.1) |
| **"Design partner" as a permanent discount** | Erodes ARR integrity; no obligations captured | Obligation-bearing, time-boxed concessions (Section 5.2/5.3) |
| **Converting a pilot that didn't pass the gate** | Sells a customer who won't renew or reference | Exit gate P1–P5 must pass to CONVERT (Section 6) |

---

## Appendix A — Pilot One-Page Operating Checklist (printable)

```text
WEEK 0  MOBILIZE
[ ] Kickoff held (60 min); sponsor + ops owner named
[ ] Primary question (verbatim) + 2-3 secondary questions agreed
[ ] Week-0 baseline captured (cycle-time today = P4 baseline)
[ ] Success criteria signed (P1-P5); scoreboard created
[ ] Draft ClientConfig authored; RBAC roles assigned
[ ] Data extracts + due dates owned; live path confirmed (CSV/Excel | Databricks)

WEEKS 1-2  GROUND TRUTH
[ ] First CSV/Excel ingested; mapped to data model
[ ] 8 validators run; quarantine cleared; warning tolerances agreed
[ ] "DATA TRUSTED" gate passed (by end of Week 2)

WEEKS 3-4  FIRST ANSWER
[ ] In-scope modules + agents configured
[ ] Primary question returns cited, grounded answer
[ ] FIRST TRUSTED ANSWER logged (sponsor confirms they'd act) <= Day 30  *** the moment ***

WEEK 5  BROADEN
[ ] 2-3 secondary questions answered; executive experience configured
[ ] Second data refresh; operational owner runs >=1 question unaided

WEEK 6  PROVE & DECIDE
[ ] Scoreboard rolled up (P1-P5 measured vs Week-0 baseline)
[ ] Cycle-time reduction computed vs baseline
[ ] DAY-42 conversion preview held (no surprises)

WINDOW (+1-2 wks)  CONVERT
[ ] Conversion review; exit gate run -> CONVERT / EXTEND / GRACEFUL EXIT
[ ] Proposal built (05-); founding rate locked (06- /08-); >=2 expansion stages named
[ ] Signed; reference + case study confirmed
[ ] Closed-Won -> handoff triggered (09-)
```

## Appendix B — Cross-Document References

| For… | See |
|---|---|
| Who to recruit (ICP) and how to qualify them | `01-ideal-customer-profile.md`, `07-qualification-framework.md` |
| The buyers and what they care about | `02-buyer-personas.md` |
| The program this pilot executes against (GTM side) | `03-design-partner-program.md` |
| Getting the meeting that precedes the pilot | `04-outreach-strategy.md`, `05-outreach-sequences.md` |
| The discovery that feeds the Week-0 success criteria | `06-discovery-process.md`, `../delivery/01-financial-intelligence-assessment-framework.md` |
| Objections that surface during a pilot | `08-objection-handling.md` |
| The fastest route from pilot to first paying logo | `11-shortest-path-to-first-customer.md` |
| **Authoritative pricing & design-partner rate lock (no dollars here)** | `../delivery/06-pricing-framework.md` (esp. §2, §13.5) |
| The program charter, MOU, and conversion gate | `../delivery/08-design-partner-program.md` |
| The paid proposal produced at conversion | `../delivery/05-proposal-template.md` |
| The handoff from pilot-mode to steady-state delivery | `../delivery/09-sales-to-implementation-handoff.md` |
| Platform certification ("Ready for Design Partners") | `../docs/commercial-readiness/CERTIFICATION.md` |

---

*End of File 09 — Pilot Framework. Version 1.0 · Status: Active · Owner: Sin City Analytics GTM · Last Updated 2026-06-13. This document contains no final dollar values by design — all commercial figures are governed by `../delivery/06-pricing-framework.md` and the controlled rate card. The pilot is tight, outcome-anchored, and Forward-Deployed: it ends when a finance leader stakes a real decision on a Nexora answer, and converts on a pre-agreed gate.*
