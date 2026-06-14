# Qualification Framework — Design Partner Scoring System

**File 07 of the Sin City Analytics Design Partner Acquisition System (GTM Operating System)**
**Product:** Finance Intelligence Platform (codename **Nexora**) — moves finance from *reporting* to *decision intelligence*; behaves like a finance analyst, not a report generator.

> A design partner is selected, not accepted. This document is the **numeric gate** between "interesting conversation" and "we are spending senior founder time co-building with this account." It extends BANT and MEDDICC for one specific, unusual motion: an **early-stage, pre-PMF, finance-AI design-partner** sale where the currency is *learning and validation*, not bookings. It is deliberately opinionated. When in doubt, it disqualifies.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 07 — Qualification Framework |
| **System** | Design Partner Acquisition System (GTM) |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Audience** | Founder, GTM/Sales, Delivery Lead, Solution Architect |
| **Classification** | Confidential — Commercial |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Related Documents** | `01-ideal-customer-profile.md` · `02-buyer-personas.md` · `03-design-partner-program.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `06-discovery-process.md` †(forthcoming) · `08-objection-handling.md` †(forthcoming) · `09-pilot-framework.md` · `10-first-90-days.md` · `11-shortest-path-to-first-customer.md` · `../delivery/01-financial-intelligence-assessment-framework.md` · `../delivery/08-design-partner-program.md` · `../delivery/06-pricing-framework.md` · `../docs/commercial-readiness/CERTIFICATION.md` |
| **Unresolved links** | † `06-discovery-process.md` and `08-objection-handling.md` are **forthcoming siblings not yet authored on disk** (as of 2026-06-13). Because `06` is this framework's upstream evidence source (the scoring gate depends on it — §1.1, §2.1, §2.4, §3.x, §7.1, §7.5), the framework treats discovery's *exit artifacts* — sourced from `../delivery/01-financial-intelligence-assessment-framework.md` (which exists today) — as the operative input until `06` lands. Every `06`/`08` citation below is marked **(forthcoming)** so the document is honest about what currently resolves. `04-outreach-strategy.md` and `09-pilot-framework.md` **exist on disk and resolve.** |

---

## 1. Purpose, Scope, and Why This Is Not Plain BANT

### 1.1 What this framework decides

This is the instrument that answers one question with a number: **Should Sin City Analytics invest founder-led co-build time in this account as a design partner?**

It runs at the seam between `06-discovery-process.md` **(forthcoming — see Document Control; until it lands, discovery exit artifacts come from `../delivery/01-financial-intelligence-assessment-framework.md`)** (where we gather the evidence) and `09-pilot-framework.md` (where a qualified account becomes a scoped pilot). It produces a **0–100 weighted score**, a **fit band** (High / Medium / Low), and a hard **auto-disqualification (auto-DQ) check** that can veto any score.

The output is not "is this a good lead." It is **"is this a good design partner."** Those are different questions, and conflating them is the single most expensive mistake an early-stage founder makes — chasing logos that will never give usable product feedback, or revenue-shaped deals that demand custom work we explicitly do not do (`../delivery/08-design-partner-program.md` §1.3: "Not a custom-software shop").

### 1.2 Why BANT and MEDDICC alone fail this motion

| Framework | What it optimizes for | Why it under-serves the Nexora design-partner motion |
|---|---|---|
| **BANT** (Budget, Authority, Need, Timing) | Transactional, budget-led, mid-funnel qualification | Pre-PMF design partners often have **no allocated budget line** yet (the line is created *after* the pilot proves value). Pure BANT would DQ exactly the partners we want, and would over-weight Budget when the real currency is *feedback rights + reference rights*. |
| **MEDDICC** (Metrics, Economic buyer, Decision criteria, Decision process, Identify pain, Champion, Competition) | Enterprise, multi-stakeholder, six-figure closing rigor | Excellent for the *eventual* paid conversion, but heavyweight and premature for a 5–8 partner cohort. It says nothing about **whether the account's data can even be ingested** or **whether they will actually co-build** — the two things that make or break a design partnership. |

### 1.3 What we added, and why

We keep the discipline of both frameworks and add the three dimensions an early-stage finance-AI co-build lives or dies on:

- **Data Maturity** — Nexora's live ingestion path today is **CSV/Excel upload + Databricks SQL (Delta)**; native connectors (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive) are **roadmap, not live** (`../delivery/08-design-partner-program.md`). If a partner cannot get clean tabular data *out* of their systems, there is no product to validate. This is non-negotiable and is why Data Maturity carries real weight.
- **Technical Readiness** — multi-tenant SaaS on Next.js + Databricks, Clerk auth, RBAC (7 roles), per-tenant `clientId` isolation, **just certified "Ready for Design Partners"** with a full commercial security rating pending a live penetration test. A partner whose security/IT function will block any pre-pen-test SaaS is a stall we should price in *before* we invest.
- **Strategic Fit** — does this partner advance the *roadmap and the reference base*, not just consume the product? The program's job (`../delivery/08-design-partner-program.md` §1.2) is connector-roadmap evidence, validator hardening, and 3–5 referenceable logos. A partner who contributes none of those is a customer we are subsidizing, not a partner.

### 1.4 The seven dimensions

**Pain · Urgency · Budget · Authority · Data Maturity · Technical Readiness · Strategic Fit.**

Pain/Urgency/Budget/Authority carry the BANT/MEDDICC DNA (Pain ≈ Identify Pain + Metrics; Authority ≈ Economic Buyer + Champion). Data Maturity, Technical Readiness, and Strategic Fit are the finance-AI-design-partner additions.

---

## 2. Scoring Mechanics

### 2.1 Per-dimension raw scale

Each dimension is scored **0, 1, 2, or 3** against the concrete descriptors in Section 3:

| Raw | Label | Meaning |
|---|---|---|
| **0** | Absent / Red | Evidence is missing, or actively negative. Often an auto-DQ trigger. |
| **1** | Low | Present but weak; a real risk to the partnership. |
| **2** | Medium | Solid, workable; the realistic norm for a good early partner. |
| **3** | High | Strong, differentiated; the reason to prioritize this account. |

**Evidence rule:** a dimension may only be scored from **observed evidence captured in discovery** (`06-discovery-process.md` **(forthcoming)**; today the evidence is the exit artifacts of `../delivery/01-financial-intelligence-assessment-framework.md`) — a quote, a document, a system export, a named person. "Sounds like a 3" with no artifact is capped at 1. We do not score on vibes; the platform doesn't fabricate numbers (`BASE_GUARDRAILS`) and neither do we.

### 2.2 Weighting

Raw scores are weighted to reflect what actually predicts a successful design partnership. Weights sum to 100.

| # | Dimension | Weight | Rationale (why this weight) |
|---|---|---|---|
| D1 | **Pain** | **20** | No real, expensive, recurring finance pain → no urgency, no reference, no story. Highest single weight. |
| D2 | **Urgency** | **15** | A compelling event compresses the cycle from months to weeks. Pain without urgency stalls indefinitely. |
| D3 | **Budget** | **10** | Deliberately *low* for a design-partner motion — we are buying validation with influence and price protection, not closing on budget. Budget matters for the **conversion**, not the partnership. |
| D4 | **Authority** | **15** | A using, name-lending executive sponsor is the difference between a co-build and a science project. Champion + economic buyer. |
| D5 | **Data Maturity** | **15** | If clean tabular data can't reach the platform, there is nothing to validate. The most common silent killer. |
| D6 | **Technical Readiness** | **10** | Security/IT posture determines whether a pre-pen-test SaaS can even be deployed in the window. |
| D7 | **Strategic Fit** | **15** | Does this partner move the roadmap and the reference base? This is what makes them a *partner*, not a discounted customer. |
| | **Total** | **100** | |

**Weighted dimension score = (raw 0–3) × (weight ÷ 3).** A perfect 3 on Pain = 20 points; a 2 on Pain = 13.3; a 1 = 6.7; a 0 = 0. Total possible = 100.

### 2.3 The math, once

> Weighted score = Σ ( raw_d × weight_d ÷ 3 ), for d in {Pain, Urgency, Budget, Authority, Data Maturity, Technical Readiness, Strategic Fit}.

Round the total to the nearest whole number. Carry one decimal on dimension subtotals only if you need a tie-breaker.

### 2.4 Cadence

- Score **once at the end of discovery** (the gate into pilot).
- **Re-score** if a material fact changes (sponsor leaves, fundraise closes, ERP migration announced, security says no).
- A score older than **45 days** with no contact is stale → re-qualify before acting.

---

## 3. Dimension Definitions and Descriptors

Each subsection gives: what we are measuring, the **0/1/2/3 descriptors**, the **discovery evidence** that earns the score, and the **persona** (`02-buyer-personas.md`) most likely to supply it.

### 3.1 D1 — Pain (weight 20)

**Measuring:** the existence, size, recurrence, and *cost* of a finance-decision pain that Nexora's live capabilities address — slow/manual variance narratives, forecast assembly pain, board-reporting crunch, spend/headcount/contractor blind spots, decision latency.

| Raw | Descriptor |
|---|---|
| **0 (auto-DQ candidate)** | No articulable finance pain. "Reporting is basically fine." Cannot name a question their tools fail to answer. |
| **1 — Low** | Generic dissatisfaction ("Excel is annoying") but no quantified cost, no recurring cycle, no specific failed question. |
| **2 — Medium** | Names a **recurring** pain tied to a cycle (e.g., "the monthly variance deck eats 3–4 analyst-days"; "the board forecast is always late"). Can describe the workflow. |
| **3 — High** | Quantified, recurring, executive-visible pain with a number attached: "We spend ~6 FTE-days/month assembling the board pack and still miss forecast by 8–12%." Arrives with a **list of questions they wish their tools could answer** (the canonical ideal-partner signal). |

**Evidence that earns it:** a documented current-state workflow; a named representative question with current answer-latency (per `../delivery/01-financial-intelligence-assessment-framework.md` exit test 1.1 — "how long it takes to answer 5+ representative finance questions today"); a quote with a number in it.

**Most likely source:** CFO, VP Finance, Head of FP&A (`02-buyer-personas.md`).

### 3.2 D2 — Urgency (weight 15)

**Measuring:** is there a **compelling event** forcing action on a timeline? Pain answers *why change*; Urgency answers *why now*.

| Raw | Descriptor |
|---|---|
| **0** | No trigger. "Someday we'll modernize FP&A." No deadline, no event. |
| **1 — Low** | Soft intent — a planning offsite, a vague "this year" initiative, curiosity about AI in finance. |
| **2 — Medium** | A real but non-fatal trigger: next budget cycle (3+9 / 6+6 / 9+3) approaching, a board ask for better forecast accuracy, an FP&A capacity squeeze. |
| **3 — High** | A hard, dated compelling event (see canonical buying triggers below). |

**Canonical buying triggers (high-urgency):**

| Trigger | Why it creates urgency for Nexora |
|---|---|
| **New CFO in seat <12 months** | New CFOs run a diagnostic and re-tool FP&A in the first two quarters; highest-propensity window. |
| **Recent or imminent fundraise** | Board now expects investor-grade reporting and forecast accuracy on a cadence. |
| **ERP / HRIS migration** (NetSuite, Workday HCM going live) | Data is in motion and clean exports exist — and the BI/reporting layer is in scope and contested. |
| **Audit finding / restatement** | Forces data-quality and traceability discipline → maps directly to our 8 validators + cited-source guardrail. |
| **Board pressure on forecast accuracy** | Direct hit on rolling-forecast + variance + executive-commentary capabilities. |
| **FP&A hiring freeze / can't backfill an analyst** | "Do more with the team we have" → AI-analyst value prop lands hard. |
| **M&A integration** | Two charts of accounts, two headcount rosters, urgent consolidation and contractor/vendor rationalization. |

**Most likely source:** CFO, Controller (audit), Head of FP&A.

### 3.3 D3 — Budget (weight 10)

**Measuring:** ability and willingness to **convert to paid** after the pilot proves value — *not* whether a line item exists today. Deliberately low-weight for the partnership; load-bearing for the conversion (`../delivery/06-pricing-framework.md`).

| Raw | Descriptor |
|---|---|
| **0 (auto-DQ candidate)** | No money, no path to money, and an expectation of free-forever. Cannot fund even a modest paid conversion. |
| **1 — Low** | Interested but no budget authority and no credible path; "we'd have to find money somewhere." |
| **2 — Medium** | Has discretionary spend or a software/tooling budget the sponsor controls; could fund a conversion in the **$15k–$60k/yr** early-design-partner band without a board vote. |
| **3 — High** | Explicit willingness to pay on conversion, a budget owner identified, and comfort with the design-partner economics (price protection in exchange for reference + feedback). Can fund within the cycle. |

**Note:** A pre-PMF design partner scoring 1 on Budget is **not** an auto-DQ on its own — the program trades influence and price protection for validation. But a 0 (no path to *any* money, ever) combined with low Strategic Fit is a charity case, not a partnership.

**Most likely source:** CFO / VP Finance (they usually own the FP&A tooling line).

### 3.4 D4 — Authority (weight 15)

**Measuring:** is there a **using, name-lending executive sponsor** plus an **operational owner** who will do the data work? This fuses MEDDICC's Economic Buyer and Champion.

| Raw | Descriptor |
|---|---|
| **0 (auto-DQ candidate)** | Our only contact is a non-decision analyst or "innovation/AI" tourist with no finance mandate and no exec access. |
| **1 — Low** | Engaged manager who must sell it upward to an unknown, unmet executive. No confirmed sponsor. |
| **2 — Medium** | A confirmed sponsor (CFO / VP Finance / Head of FP&A) who will use it, **plus** an operational owner (FP&A analyst / finance manager) committed to data work and feedback sessions. |
| **3 — High** | Sponsor is personally invested, will join feedback sessions, has pre-committed to **lend their name to a reference / case study**, and can authorize access and (later) spend. Maps to map RBAC roles **CFO / OrganizationAdmin** for the sponsor and **FPA / Controller** for the operational owner. |

**Hard rule:** *No executive sponsor, no partnership* (`../delivery/08-design-partner-program.md` §2.3). A 0 here is an auto-DQ for the **design-partner** motion (it may still be a nurture lead).

**Most likely source:** confirmed in discovery via the sponsor's own words + an introduced operational owner.

### 3.5 D5 — Data Maturity (weight 15)

**Measuring:** can the partner produce **clean tabular data** that maps to the Nexora data model, today, over the live CSV/Excel + Databricks path? This is the silent killer of finance-AI pilots.

| Raw | Descriptor |
|---|---|
| **0 (auto-DQ candidate)** | Data is locked in a system that **cannot export tabular files**; or cash-basis only with no budget/actuals structure. Nothing to ingest → nothing to validate. |
| **1 — Low** | Can export, but data is messy, inconsistent period/account coding, no reliable trial balance; significant cleanup before anything runs. |
| **2 — Medium** | Can export a **clean trial balance, a budget extract, and a headcount roster as CSV/Excel** that reduce to `clientId` + ISO `period` (e.g., `2026-01`) + dimensions (Account, CostCenter, Department, BusinessUnit, TimePeriod). The canonical "ready" bar. |
| **3 — High** | Clean exports **and** runs one or more roadmap connector targets (QuickBooks / NetSuite / Workday HCM / Beeline / Fieldglass / Coupa / Workday Adaptive) — so their data both ingests cleanly today *and* generates connector-roadmap evidence (Strategic Fit synergy), and/or already has data in **Databricks**. |

**Evidence that earns it:** an actual sample export reviewed in discovery; the data-landscape→connector map from `../delivery/01-financial-intelligence-assessment-framework.md` exit test 1.2. Score from the **sample**, not the promise.

**Most likely source:** Controller / Accounting Manager, IT / Data Lead.

### 3.6 D6 — Technical Readiness (weight 10)

**Measuring:** will the partner's security/IT/compliance posture **permit** deploying a multi-tenant SaaS that is *certified "Ready for Design Partners"* but whose full commercial security rating is **pending a live penetration test**?

| Raw | Descriptor |
|---|---|
| **0 (auto-DQ candidate)** | Policy **categorically prohibits AI on financial data**, or mandates a completed third-party pen test + SOC 2 Type II before *any* SaaS touches finance data, with no exception path. We cannot meet the bar in the window. |
| **1 — Low** | Heavy security review required, long vendor-risk queue (8–12+ weeks), unclear sponsor leverage to expedite. Real schedule risk. |
| **2 — Medium** | Standard SaaS security review they can run in weeks; comfortable with our posture (Clerk auth, RBAC 7 roles, per-tenant `clientId` isolation) and with the "design-partner certified, pen-test pending" status disclosed honestly. |
| **3 — High** | Pragmatic, design-partner-friendly IT posture; sponsor can authorize a pilot on non-production-critical or de-identified data quickly; accepts the maturity disclosure (Live vs Roadmap vs Target-state) and signs an MOU. |

**Honesty rule:** we always disclose the certification status up front (`../docs/commercial-readiness/CERTIFICATION.md`). Scoring a 2–3 requires the partner to have heard the real status and still be a go. Selling around it is an auto-DQ on *us*, not them.

**Most likely source:** IT / Data Lead, Security / Compliance.

### 3.7 D7 — Strategic Fit (weight 15)

**Measuring:** does this partner advance the **roadmap and the reference base**, beyond consuming the product? This is what separates a design *partner* from a discounted *customer*.

| Raw | Descriptor |
|---|---|
| **0** | Generic; teaches us nothing new; in a segment we already have covered; unwilling to be referenced; wants bespoke custom features we don't build. |
| **1 — Low** | A fine logo but redundant with the cohort; reference rights uncertain; modest roadmap signal. |
| **2 — Medium** | Adds a distinct **industry** or **ERP** to the cohort, exercises modules/agents we need real-world coverage on, and is open to a reference. |
| **3 — High** | Materially advances the program objectives: a marquee or highly-referenceable logo; a high-priority connector source system (ranks the build order with evidence); stress-tests multiple of the 8 agents / 10 modules; **pre-committed to a public case study**; ideally an introducer to peer CFOs. |

**Cohort lens:** score against the *current cohort*, not in a vacuum. The 5–8 partner cap (`../delivery/08-design-partner-program.md` §2.4) means the marginal partner must add ≥3 distinct industries and ≥2 distinct ERPs collectively. A great account that duplicates existing coverage is a 1–2, not a 3.

**Most likely source:** founder judgment + sponsor's reference willingness + IT's source-system inventory.

---

## 4. Fit Bands and What Each One Triggers

Total weighted score (0–100), **after** the auto-DQ check in Section 5 passes.

| Band | Score | Meaning | Action |
|---|---|---|---|
| **High Fit** | **75–100** | A priority design partner. Strong pain + a trigger + a real sponsor + ingestible data. | Fast-track to `09-pilot-framework.md`. Founder leads. Issue MOU. Target a slot in the active cohort. |
| **Medium Fit** | **55–74** | A real candidate with one or two soft spots (often Data Maturity, Technical Readiness, or Budget). | Proceed **only if** the soft spot has a named owner and a closing plan, **and** a cohort slot is available. Otherwise nurture until the gap closes (e.g., post-ERP-migration). |
| **Low Fit** | **35–54** | Genuine interest, structural gaps. | Do **not** spend founder co-build time now. Nurture per `04-outreach-strategy.md`; re-score on a trigger (new CFO, fundraise, migration). |
| **No Fit / DQ** | **0–34** *or* any auto-DQ | Not a design partner. | Politely close out or route to a future GA waitlist. Free up cohort capacity. |

**Tie-breakers when near a band edge:**
1. **Pain (D1)** raw score — higher wins.
2. **Strategic Fit (D7)** — does it fill a cohort gap (new industry/ERP)?
3. **Urgency (D2)** — a dated trigger beats an undated one.
4. Founder conviction, **documented in one sentence** in the scorecard notes.

**Capacity overlay:** with a hard cohort cap of 5–8 and max 2 new partners per fortnight (`../delivery/08-design-partner-program.md` §2.4), even a High Fit may be **waitlisted**, not rejected. Band = priority order, not an entitlement to a slot.

---

## 5. Auto-Disqualification (Auto-DQ) Criteria

Auto-DQ **overrides any score.** A 90/100 with an auto-DQ trigger is a **No Fit**. These exist because some failures are fatal regardless of how attractive the rest looks.

| # | Auto-DQ Trigger | Dimension | Why it is fatal |
|---|---|---|---|
| DQ-1 | **No executive sponsor** who will use the product and lend their name | D4 | The program's foundational rule. Without a sponsor there is no co-build and no reference — the two things we are buying. |
| DQ-2 | **Data cannot be exported as tabular files** (locked ERP, cash-basis only, no budget/actuals structure) | D5 | The live ingestion path is CSV/Excel + Databricks. No ingestible data = no product to validate. Not fixable in the window. |
| DQ-3 | **Categorically prohibits AI on financial data**, or hard-mandates completed pen test + SOC 2 Type II before any SaaS, no exception | D6 | We are certified *Ready for Design Partners*, pen-test pending. If the policy can't bend, we cannot deliver — full stop. |
| DQ-4 | **Demands bespoke custom software / a private fork** as a condition | D7 | We are not a custom-software shop. Tenancy is `ClientConfig` with zero code changes. This corrupts the partnership model. |
| DQ-5 | **Expects free forever with no path to *any* paid conversion** and contributes no strategic value | D3 + D7 | A subsidized non-reference is a cost center, not a partner. (Budget=0 alone is survivable; Budget=0 **and** Strategic Fit ≤1 is not.) |
| DQ-6 | **Wrong size / no finance function** — pre-revenue startup, no formal finance team, no budgeting cycle or monthly close | D1/D5 | Below the floor of `01-ideal-customer-profile.md`. Nothing for the 8 agents or 10 modules to operate on. |
| DQ-7 | **Asks Nexora to fabricate/extrapolate numbers or bypass guardrails** ("just make the forecast say X") | All | Violates `BASE_GUARDRAILS`. A partner who wants the AI to lie will produce a dangerous reference and a values mismatch. |
| DQ-8 | **No reference rights, ever** — refuses any future logo/case-study use even on success | D7 | A design partner that can never become a reference removes the core strategic return; reconsider as a pure paid prospect later, not a partner. |

**Soft-DQ (proceed-with-eyes-open, not automatic):** single-source dependency on one un-introduced champion; a security queue >12 weeks; a sponsor who is interested but won't commit calendar time. Flag these explicitly in the scorecard; they cap the band at **Medium** until resolved.

---

## 6. The Reusable Scorecard

Copy this block per account. Fill **Raw (0–3)**, the framework auto-computes **Weighted**. Every raw score needs an **Evidence** cell — no evidence, score it down.

### 6.1 Scorecard table

> **Account:** [COMPANY] · **Date scored:** [YYYY-MM-DD] · **Scored by:** [NAME] · **Discovery ref:** [LINK to 06 notes]
> **Sponsor:** [NAME, TITLE] · **Operational owner:** [NAME, TITLE] · **Segment/ERP:** [INDUSTRY / ERP]

| # | Dimension | Weight | Raw (0–3) | Weighted (raw×W÷3) | Evidence (quote / artifact / system) |
|---|---|---|---|---|---|
| D1 | Pain | 20 | [_] | [auto] | [_] |
| D2 | Urgency | 15 | [_] | [auto] | [_] |
| D3 | Budget | 10 | [_] | [auto] | [_] |
| D4 | Authority | 15 | [_] | [auto] | [_] |
| D5 | Data Maturity | 15 | [_] | [auto] | [_] |
| D6 | Technical Readiness | 10 | [_] | [auto] | [_] |
| D7 | Strategic Fit | 15 | [_] | [auto] | [_] |
| | **TOTAL** | **100** | | **[_/100]** | |

**Auto-DQ check (any YES = No Fit, regardless of score):**

| DQ | Triggered? | Note |
|---|---|---|
| DQ-1 No exec sponsor | [Y/N] | [_] |
| DQ-2 No tabular data export | [Y/N] | [_] |
| DQ-3 AI-on-finance prohibited / hard pen-test+SOC2 gate | [Y/N] | [_] |
| DQ-4 Demands custom fork | [Y/N] | [_] |
| DQ-5 Free-forever + no strategic value | [Y/N] | [_] |
| DQ-6 Wrong size / no finance function | [Y/N] | [_] |
| DQ-7 Wants guardrails bypassed | [Y/N] | [_] |
| DQ-8 No reference rights ever | [Y/N] | [_] |

**Verdict:** Band = [High / Medium / Low / No Fit] · Cohort slot = [Assign / Waitlist / Nurture / Close] · **One-line founder rationale:** [_]

**Soft-DQ flags (cap at Medium until resolved):** [_]

**Top gap + owner + close-by date:** [_]

### 6.2 Worked example — "High Fit" (illustrative)

> **Account:** Meridian Logistics (illustrative) · ~900 FTE · NetSuite + Workday HCM · new CFO 5 months in.

| # | Dimension | W | Raw | Weighted | Evidence |
|---|---|---|---|---|---|
| D1 | Pain | 20 | 3 | 20.0 | CFO: "6 analyst-days/month on the board pack; we still miss forecast 10%." Brought a list of 9 questions. |
| D2 | Urgency | 15 | 3 | 15.0 | New CFO <12 mo + Series C closed; board wants forecast accuracy in 2 quarters. |
| D3 | Budget | 10 | 2 | 6.7 | CFO controls FP&A tooling line; comfortable with $40k/yr on conversion. |
| D4 | Authority | 15 | 3 | 15.0 | CFO will use it personally + pre-agreed to a case study; FP&A lead owns data work. |
| D5 | Data Maturity | 15 | 3 | 15.0 | Clean TB + budget + headcount CSVs reviewed; NetSuite + Workday = connector-roadmap evidence. |
| D6 | Technical Readiness | 10 | 2 | 6.7 | Standard 3-week SaaS review; accepts "design-partner certified, pen-test pending." |
| D7 | Strategic Fit | 15 | 3 | 15.0 | New industry (logistics) + 2 priority ERPs + marquee-ish logo + intro to 2 peer CFOs. |
| | **TOTAL** | 100 | | **93.4 → 93** | No auto-DQ triggered. |

**Verdict:** High Fit (93). Assign cohort slot. Founder leads. → `09-pilot-framework.md`.

### 6.3 Worked example — "Auto-DQ overrides a high score" (illustrative)

> **Account:** Atlas BioWorks (illustrative) · strong pain (3), strong urgency (3), great data (3) → raw total would land ~80.
> **But:** Legal mandates a completed SOC 2 Type II **and** third-party pen test before any SaaS touches finance data, **no exception path** (DQ-3 = YES).

**Verdict:** **No Fit (auto-DQ DQ-3)**, despite the ~80 score. Action: park on GA waitlist; revisit after our pen test completes. Document so we don't burn founder time re-litigating it.

---

## 7. How to Run It (Operating Notes)

### 7.1 Inputs and the discovery handshake

Score **only** from `06-discovery-process.md` **(forthcoming)** outputs. Until that sibling is authored, the discovery instrument (`../delivery/01-financial-intelligence-assessment-framework.md`, which exists today) **is** the operative evidence source and supplies the hard evidence: the 5+ representative questions and their current answer-latency (→ D1/D2), the data-landscape→connector map and a reviewed sample export (→ D5), the source-system inventory and security posture (→ D6), and the stakeholder roster (→ D4). If a dimension can't be evidenced, **the gap is the finding** — run a targeted follow-up before scoring, per the cite-and-flag guardrail.

### 7.2 Who scores

The **founder/GTM owner scores**, with the **Solution Architect** co-signing D5/D6 (data + technical) since those are the most over-optimistic dimensions when sold by a non-technical seller. Two-initials rule: D5 and D6 each carry both signers' initials in the Evidence cell.

### 7.3 Calibration discipline (avoid score inflation)

Early founders inflate. Three guardrails:
1. **Default to 2, justify a 3.** A 3 requires a specific artifact named in Evidence.
2. **The 3-is-rare rule.** If more than ~30% of your scored accounts are High Fit, your bar is too low — re-baseline against the cohort, not against hope.
3. **Re-score on event, not on optimism.** Budget and Authority move on real events (fundraise, new sponsor), not on a good call.

### 7.4 What the bands feed downstream

| Band | Next system doc |
|---|---|
| High / qualified Medium | `09-pilot-framework.md` (scope the pilot), then `10-first-90-days.md`, then conversion via `../delivery/06-pricing-framework.md` |
| Medium with a gap | `08-objection-handling.md` **(forthcoming)** (work the specific objection), then re-score |
| Low | `04-outreach-strategy.md` nurture track; re-score on trigger |
| No Fit / auto-DQ | GA waitlist; remove from active pipeline to protect cohort capacity |

### 7.5 Mapping back to BANT / MEDDICC (for buyers/advisors who speak those)

| BANT/MEDDICC element | Lives in our dimension |
|---|---|
| Budget | D3 Budget |
| Authority / Economic Buyer | D4 Authority |
| Need / Identify Pain / Metrics | D1 Pain |
| Timing / Compelling Event | D2 Urgency |
| Champion | D4 Authority (operational owner + name-lending sponsor) |
| Decision Criteria / Process | Captured in `06-discovery-process.md` **(forthcoming)**; surfaces in D4 + D6 |
| Competition (Excel, Power BI/Tableau/Looker, Adaptive/Anaplan/Pigment/Cube/Vena/Datarails, in-house FP&A+BI) | Informs D1 (pain vs. incumbent) and D7 (why us); see `08-objection-handling.md` **(forthcoming)** |
| *(new)* Data ingestibility | D5 Data Maturity |
| *(new)* Security/IT deployability | D6 Technical Readiness |
| *(new)* Roadmap + reference value | D7 Strategic Fit |

---

## 8. Anti-Patterns This Framework Is Built to Catch

| Anti-pattern | The trap | The dimension/DQ that catches it |
|---|---|---|
| **The shiny logo** | A famous name with no pain, no sponsor, no reference rights. | D1 low + D7 ≤1 + DQ-8; bands it to Low/No Fit. |
| **The free-pilot tourist** | Wants the platform free indefinitely, will never pay or reference. | DQ-5. |
| **The science project** | Engaged analyst, no exec, "I'll sell it up." | DQ-1 / D4=1. |
| **The data mirage** | Great call, but data is locked or cash-basis. Discovered in week 3, too late. | D5 + DQ-2 — *score from the sample, not the promise.* |
| **The security wall** | Loves it; Legal kills it on pen-test/SOC 2. | D6 + DQ-3 — surface it in discovery, not after the MOU. |
| **The custom-fork buyer** | "We'll sign if you build X just for us." | DQ-4 — we configure, we don't fork. |
| **The guardrail-breaker** | "Can the AI just make the forecast hit the number?" | DQ-7 — values + product red line. |

---

## 9. Maintenance

- **Owner:** Sin City Analytics — GTM.
- **Review trigger:** re-tune weights and descriptors after **every 5 scored accounts** or each cohort close, whichever first. If the pilot win-rate by band diverges from this model (e.g., Medium Fits converting like High Fits), the weights are wrong — fix them with evidence.
- **Versioning:** bump the Document Control version on any weight or auto-DQ change; note the rationale and the data that drove it.
- **Source of truth for capability maturity:** `../delivery/08-design-partner-program.md` Honesty Principle (Live / Roadmap / Target-state). If a roadmap connector goes live, D5's descriptors must be updated the same day.

---

*End of Document 07 — Qualification Framework.*
