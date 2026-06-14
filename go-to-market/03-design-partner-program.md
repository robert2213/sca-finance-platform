# Design Partner Program — Execution Layer

> **File 03 of the Sin City Analytics Design Partner Acquisition System (the GTM operating system).** This is the **execution layer** that runs *on top of* the program charter in `../delivery/08-design-partner-program.md`. The charter defines *what the program is* (the contract, the MOU, the conversion gate). This document defines *how the founding team actually runs it day-to-day* — who you invite, what you say, what you promise, what you measure, and exactly how a design partner becomes a paying, referenceable founding customer.
>
> **North star (identical to the product's):** a finance leader asks a real question and Nexora returns **Question → Intent Detection → Relevant Data Retrieval → AI (Claude) Analysis → Direct Answer** — grounded, cited, guardrailed. The program is *working* the moment a partner stakes a real decision on a Nexora answer.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 03 — Design Partner Program (GTM execution layer) |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics GTM |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Audience** | Founder/GTM (owner of record), Solutions Architect, any early CS/Delivery hire |
| **Sits on top of** | `../delivery/08-design-partner-program.md` (the program charter / MOU this layer executes) |
| **Pricing authority** | `../delivery/06-pricing-framework.md` §13.5 Design Partner Pricing (no hard dollars here — concessions only) |
| **Sibling GTM docs** | `01-ideal-customer-profile.md` · `02-buyer-personas.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `06-discovery-process.md` · `07-qualification-framework.md` · `08-objection-handling.md` *(forthcoming)* · `09-pilot-framework.md` · `10-first-90-days.md` · `11-shortest-path-to-first-customer.md` |
| **Certification** | `../docs/commercial-readiness/CERTIFICATION.md` — "Ready for Design Partners" (code + build certified; full commercial rating pending live penetration test) |

---

## 0. How This Document Relates to the Charter (read first)

There are two design-partner documents and they are **not duplicates**:

| | `../delivery/08-design-partner-program.md` | This file (`go-to-market/03-`) |
|---|---|---|
| **Layer** | Charter — the *agreement* | Execution — the *operating motion* |
| **Owns** | Honesty Principle, qualification gate, MOU, conversion gate (Day-90 criteria), feedback taxonomy | Who to target by name, outreach math, the founder's weekly operating rhythm, the model-borrowing logic, the conversion *playbook* |
| **Changes when** | The deal terms change | The go-to-market motion changes |
| **Conflict rule** | On any conflict about *terms*, the charter (`08-`) governs. On any conflict about *pricing*, `../delivery/06-pricing-framework.md` governs. This file never invents a term the charter doesn't authorize. |

Everything below assumes the charter's **Honesty Principle**: every capability is labeled **Live today**, **Roadmap (staged stub)**, or **Target-state**, and we never blur them in front of a partner. The single fastest way to kill this program is to let one over-claimed connector erode the trust the whole motion is built to earn.

---

## 1. Program Goals

The design partner program exists to buy **validation and learning with influence and economics — not with cash discounting alone.** At Sin City Analytics' current stage (pre-PMF, founder-led, no brand recognition, just certified "Ready for Design Partners"), **learning and reference proof outrank revenue.** A signed logo that produces no usable product feedback and no reference is, by our own definition, a failed engagement.

### 1.1 The five goals, ranked

| # | Goal | Why it is ranked here | Primary success signal (see §7) |
|---|---|---|---|
| G1 | **Validate the question-answering pipeline on real, messy finance data** | This is the entire PMF bet: that finance teams will trust a guardrailed AI answer enough to stake a decision on it. It cannot be validated on synthetic seeds. | Time-to-first-trusted-answer ≤ 30 days; answer trust rate ≥ 70% by Day 90 |
| G2 | **Produce 3–5 referenceable logos + quantified outcomes** | With no brand, the *next* 20 deals are unlocked by the *first* 3 references. A case study with a named CFO and a real number is the most valuable asset we can manufacture right now. | ≥ 3 of cohort referenceable; ≥ 1 public case study |
| G3 | **Convert design partners into paying founding customers** | Validates willingness-to-pay and starts durable ARR. Conversion is *earned*, previewed at Day 45, decided at Day 90. | ≥ [CONV_TARGET, e.g. 50]% of qualified partners convert to paid |
| G4 | **Rank the connector roadmap with evidence** | We must not guess which of QuickBooks/NetSuite/Workday/Beeline-Fieldglass/Coupa/Adaptive to build first. Partner source systems vote with their real data. | A ranked, demand-weighted GA connector build order |
| G5 | **Harden validators, guardrails, and the multi-tenant operating model under real load** | The 8 validators and `BASE_GUARDRAILS` thresholds are currently tuned to assumptions. Real error distributions tune them. Concurrent tenants prove `clientId` isolation. | Validator false-positive rate trending down; clean concurrent multi-tenant operation |

### 1.2 Explicit non-goals (what this program is NOT)

- **Not maximizing year-one revenue.** Per `../delivery/06-pricing-framework.md` §1.1, the first land is priced to *start the relationship*, not to extract.
- **Not an open beta.** Cohort is hard-capped (§2.3 / charter §2.4) at 5–8 partners to protect delivery quality.
- **Not a free-forever tier.** Time-boxed (90 days + 30-day conversion window) with a defined gate.
- **Not a custom-software shop.** Partners influence the roadmap; tenancy is delivered via **ClientConfig with zero code changes**, never bespoke forks.
- **Not a license to bypass guardrails.** Agents enforce `BASE_GUARDRAILS` for every partner — no fabricated numbers, ever.

---

## 2. Program Duration

### 2.1 The clock: 90 days core + 30-day conversion window

This mirrors the charter (`08-` §1.4/§9 Term) exactly: **[90]-day core program + [30]-day conversion window.** The 90 days is not arbitrary — it is the shortest window in which a finance team completes at least one full **monthly close cycle** (the natural unit of finance value) two-to-three times, which is what produces a *repeated*, trusted answer rather than a one-off demo.

| Window | Days | What must be true by the end |
|---|---|---|
| **Pre-program** | Pre-Day 0 | Qualified (charter §2.5 scorecard ≥ 16), MOU executed, sponsor + operational owner named, top-10 questions captured |
| **Onboarding sprint** | Day 0 → Day 14 | First CSV/Excel upload live in Databricks; first agent answer returned on the partner's own data; data plan + cadence on calendars |
| **Value build** | Day 14 → Day 45 | First *trusted* answer logged; ≥ [N] modules in active use; weekly working sessions running |
| **Day-45 checkpoint** | Day 45 | Go/adjust decision; **conversion conversation previewed (never a surprise)**; corrective plan if at risk |
| **Proof + repetition** | Day 45 → Day 90 | Answer trust rate trending to ≥ 70%; two close cycles run through the platform; reference/case-study willingness confirmed |
| **Day-90 conversion review** | Day 90 | Conversion gate evaluated (charter §10.1) → Convert / Extend / Graceful exit |
| **Conversion window** | Day 90 → Day 120 | Paper the founding-customer agreement; rate lock per `../delivery/06-` §13.5; handoff to steady-state per `../delivery/09-` |

### 2.2 Staggered starts (founder-capacity discipline)

Because one founder + one Solutions Architect run delivery personally, **start no more than 2 new partners per fortnight.** A 6-partner cohort therefore onboards over ~6 weeks and the cohort's Day-90 reviews land over a ~6-week span — never all at once. Overloading the team produces *bad feedback*, which defeats G1.

### 2.3 Cohort sizing

| Parameter | Target | Rationale |
|---|---|---|
| Cohort size | **5–8 partners (hard cap)** | Below 5, too little connector/segment signal; above 8, founder delivery quality collapses |
| Segment mix | ≥ 3 distinct industries; ≥ 2 distinct ERPs | Spreads connector-demand evidence (G4) and reference diversity (G2) |
| Coverage | Collectively exercise all 10 modules and all **7 Live agents** (CFO Advisor, FP&A Specialist, Procurement Advisor, Workforce Finance, External Labor Advisor, Finance Business Partner, Data Quality Advisor; **CIO Finance Partner is Roadmap**, not counted in coverage until Live) | Ensures the whole live product surface gets real-data validation (G1) |

---

## 3. Partner Expectations (what we require)

A design partner is a **co-author of the product**, not a discounted customer. The exchange must be explicit and fair, or it fails for both sides. These obligations are written into the MOU (charter §9) and tracked weekly.

### 3.1 The partner's ledger

| # | Obligation | Concrete commitment | Cadence | Why it matters to us |
|---|---|---|---|---|
| P1 | **Real data** | Deliver agreed CSV/Excel extracts mapped to the data model (Account, CostCenter, Department, BusinessUnit, TimePeriod / Actual, Budget, Forecast, Headcount, ExternalLabor, VendorSpend, KPI) by **[DATA_DUE_DATE]** | Refreshed monthly for the program | No real data, no real validation (G1) |
| P2 | **Executive sponsor time** | A CFO / VP Finance / Head of FP&A who *personally uses* the platform and lends their name | ≥ [N, e.g. 3] sponsor reviews (monthly, 45 min) | No sponsor, no reference and no decision authority |
| P3 | **Operational owner time** | A finance manager/analyst who does the data work and attends working sessions | ≥ [HOURS/WEEK, e.g. 2–3 hrs] | This person is where the feedback actually comes from |
| P4 | **Question volume** | Run ≥ **[Q, e.g. 15–20]** real finance questions/month against the 7 Live agents | Monthly minimum | Low usage = no signal and no value realization |
| P5 | **Structured feedback** | Attend the feedback rituals (§6) at ≥ **[X, e.g. 80]%** attendance, tagged via the charter §6.2 taxonomy | Weekly working session + monthly sponsor review | Feedback is the *product* of this program |
| P6 | **Reference — if we earn it** | At least [1] reference call + [1] case study **only upon a successful outcome** | At/after Day 90 | This is G2; it is conditional, never assumed |
| P7 | **Confidentiality + good faith** | Mutual NDA; no public disparagement of pre-GA gaps that were *disclosed up front* under the Honesty Principle | Whole term | We disclose gaps honestly; in return they don't weaponize them |

### 3.2 What we do NOT ask of a partner

- We do **not** ask them to pretend a roadmap connector is live — we tell *them* which state everything is in.
- We do **not** ask for PII. The schema is position-ID-based by design; partners extract accordingly.
- We do **not** ask for a multi-year commitment to *enter* the program. The commitment conversation is the conversion conversation (Day 90).

---

## 4. Sin City Analytics Commitments (what we provide)

Our side of the ledger, stated as plainly as the partner's. This is what makes a founder-led program with no brand worth a finance leader's time and data.

### 4.1 The SCA ledger

| # | Commitment | Concrete delivery | Bound to |
|---|---|---|---|
| S1 | **Product influence — the headline** | Partner source system moves up the connector build queue; partner sees the ranked queue and votes; partner shapes agent phrasing, follow-ups, and `BASE_GUARDRAILS` thresholds (e.g., anomaly Z>3, alignment variance threshold) for their data | Charter §3.1 |
| S2 | **Senior, hands-on delivery** | Founder/GTM + Solutions Architect run the engagement personally on an accelerated `../delivery/03-client-onboarding-playbook.md` cadence | Charter §3.3, §5.3 |
| S3 | **Waived professional-services fee** | Implementation (Foundation, per `../delivery/06-` §5) delivered at **no PS charge** during the program | `../delivery/06-` §13.3 (services concession) |
| S4 | **Founding-customer pricing + rate lock** | Design-partner subscription concession + a founding-customer rate locked for **[LOCK_TERM, e.g. 24 months]** post-conversion; modules/agents added during the term inherit the locked per-unit price | `../delivery/06-` §13.5 — *structure only, no dollars* |
| S5 | **Direct line to product** | Shared channel with the founder/product; issues triaged within **[SLA_HOURS, e.g. 24 business hours]** | Charter §3.3 |
| S6 | **Radical honesty on state** | Every capability labeled Live / Roadmap / Target-state; the **auth posture disclosed up front, verbatim**: Clerk authentication is **Target-state — NOT installed** (`CERTIFICATION.md` §"Honest limitation" confirms Clerk is not configured in this environment), `src/middleware.ts` is a **stub**, and **`/api/agent` is currently public**. Compensating controls for the program window (restricted user list, non-production-critical data set) are stated and agreed in the MOU per `../delivery/08-` §5.3/§5.4/§9.1 | Honesty Principle |
| S7 | **Data ownership + portability** | Partner data is theirs, carries `clientId` isolation, exportable on exit, deleted on request within **[DELETE_DAYS, e.g. 30]** | Charter §9.11 |
| S8 | **Reputational upside** | Co-authored case study; optional conference/webinar co-presentation positioning the sponsor as a finance-innovation leader | Charter §3.4 |

### 4.2 The security/honesty commitment, specifically

Because partner data is confidential financial data and we are pre-full-commercial-rating (penetration test pending), we commit to the charter §5.4 non-negotiables and we **lead the security conversation rather than wait to be asked**:

- Multi-tenant isolation via `clientId` on every record (Live — the isolation model is server-side and enforced in code); no cross-tenant reads. RBAC with 7 roles (SystemAdmin, OrganizationAdmin, CFO, FPA, Controller, Leader, ReadOnly) is implemented in `rbac.ts`.
- **Authentication state, stated without softening (per `../delivery/08-` §5.3/§5.4 and `CERTIFICATION.md` §"Honest limitation"):** Clerk authentication is **Target-state — designed, NOT installed**; `src/middleware.ts` is a **stub**; **`/api/agent` is currently public**. Row-level enforcement therefore depends on the forthcoming auth layer. We disclose this up front and agree compensating controls (restricted user list, non-production-critical data set) in the MOU for the program window. Secrets in env only; Databricks tokens read-only where possible.
- Agents enforce `BASE_GUARDRAILS` on every answer.
- Certification status disclosed honestly: **code + build certified "Ready for Design Partners" (`CERTIFICATION.md`); full commercial rating pending a live Clerk-configured penetration test.** This certification is code-inspection + build-verification based, not a runtime pen-test.

---

## 5. Model-Borrowing: Databricks Early Access, Scale AI Design Partners, Palantir Forward-Deployed

This program deliberately composes three proven motions. Each contributes one defining element; the table makes the borrowing explicit so the team knows *why* each rule exists.

| Source model | What it does well | The element we borrow | How it shows up concretely in *this* program |
|---|---|---|---|
| **Databricks Early Access** | Hands-on co-build with early customers; credits instead of cash discounting; explicit roadmap influence and a voting voice | **The economics + roadmap-influence exchange.** We pay in *credits, founding-customer terms, and a literal vote on the connector queue*, not cash discounting alone. | S1 (ranked connector queue + partner vote), S3 (waived PS fee), S4 (founding-customer rate lock per `../delivery/06-` §13.5). The partner co-funds the productization of *their* connector and gets reference value + roadmap priority in return (`../delivery/06-` §7 first-of-kind lever). |
| **Scale AI Design Partners** | Deep technical integration with a *tight, instrumented* feedback loop; the relationship is engineered to extract usable product signal; logo + case study are part of the deal | **The instrumented feedback loop + reference rights as a written obligation.** Feedback is structured, tagged, logged, and routed — never collected ad hoc — and the reference/case study is in the MOU (conditional on a real outcome). | The §6 feedback rituals + charter §6.2 taxonomy (`pipeline`/`agent`/`validator`/`connector`/`module`/`config`/`security`/`ux`); the feedback register (charter §6.4); P6 reference obligation; G2 reference yield as a tracked metric. |
| **Palantir Forward-Deployed (FDE)** | Embed *with* the customer, solve their *actual* problem hands-on, and the deployed engineer owns the *outcome*, not just the software | **Founder-as-FDE: we own the partner's outcome, not just the install.** The Solutions Architect embeds in the partner's real finance questions and owns "time-to-first-trusted-answer." Success is the partner staking a decision — not "the tenant is provisioned." | S2 (founder + SA run it personally); §7 success metric **time-to-first-trusted-answer ≤ 30 days** is an *outcome* metric, not an activity metric; the §8 conversion gate is value-proven, not usage-counted. |

> **Synthesis, stated plainly:** *Databricks gives us the deal shape, Scale gives us the feedback machine, Palantir gives us the ownership posture.* A Nexora design partnership is a founder-owned, outcome-accountable engagement, paid for in roadmap influence and founding terms, instrumented to extract product signal and a reference.

---

## 6. Feedback Requirements

Feedback is the deliverable of this program (G1, G5). It is structured, logged, and routed — borrowed wholesale from the Scale AI motion. The taxonomy and register live in the charter (§6.2, §6.4); this section is the **operating rhythm** the founder actually runs.

### 6.1 The feedback rituals (cadence)

| Ritual | Frequency | Who | Output | Tagged into |
|---|---|---|---|---|
| **Onboarding retro** | Once, end of Week 2 | SA + partner operational owner | Data-readiness & setup friction log | `config`, `connector` |
| **Weekly working session** | Weekly, 30 min | SA + partner operational owner | Question→answer review; agent behavior notes; *every flagged/hedged answer reviewed* | `pipeline`, `agent`, `validator` |
| **Monthly sponsor review** | Monthly, 45 min | Founder + partner sponsor | Outcome check, **connector roadmap vote**, sponsor NPS | `connector`, `module` |
| **Day-45 checkpoint** | Once | Full both-side teams | Go/adjust; conversion preview | all tags |
| **Day-90 conversion review** | Once | Founder/GTM + sponsor | Conversion decision | all tags |

### 6.2 The non-negotiable feedback rules

1. **Every flagged or hedged answer gets reviewed in the weekly session.** When an agent says "I can't answer that confidently because [data] is missing/low-confidence," that is *signal*, not failure. We want the partner's reaction: was the hedge correct? This directly tunes `BASE_GUARDRAILS` and the validators (G5).
2. **Every item is tagged and logged** in the feedback register (charter §6.4) with a severity (1–4) and a disposition. Untagged feedback is lost feedback.
3. **Connector demand is a weighted vote**, not a wishlist. The monthly sponsor review captures it; it rolls up into the connector demand index (charter §7.2) which is the *single ranked input* to GA connector sequencing.
4. **Status flows back to the partner** as Live / Roadmap / Target — so influence feels real and the Honesty Principle holds.
5. **The register is reviewed in product planning weekly.** Feedback that doesn't reach the roadmap is a broken promise.

### 6.3 Minimum feedback bar for a "valid" partnership

A partnership is only counted as delivering on G1/G5 if, by Day 90, it has produced: **≥ [Q × 3, e.g. 45] logged real questions**, **≥ [10] tagged feedback items**, and **≥ [3] connector/validator/agent items that changed the roadmap or thresholds.** Below this bar, the partnership was a courtesy, not a co-build — log it as a learning (it usually means weak P3 operational-owner engagement) and fix sourcing next cohort.

---

## 7. Pricing Approach

> **Authority:** All commercial terms defer to `../delivery/06-pricing-framework.md` — specifically **§13.5 Design Partner Pricing**, the *only sanctioned standing discount* at Sin City Analytics. This section defines the **structure** of the design-partner concessions. **No hard dollar values appear here by design** (per `06-` §0 hard constraint). Every figure is a `[PLACEHOLDER]` sourced from the controlled rate card (`06a-rate-card.xlsx`).

### 7.1 The design-partner concession structure

We do not "discount to win a logo." We run a **structured, obligation-bearing concession** modeled on Databricks Early Access (credits + terms, not cash). Three concession instruments, each buying something back (`06-` §13.3 concession exchange):

| Concession instrument | Form (structure only) | What it buys back for SCA | Source |
|---|---|---|---|
| **Waived implementation / PS fee** | Foundation Implementation (`06-` §5) delivered at **[$0 / waived]** during the program | Speed to first value; removes the #1 friction of a founder-led no-brand sale | `06-` §13.3 (services discount → reference rights / expansion) |
| **Founding-customer subscription concession** | Subscription discount of **[N%]** off the converted tier, **time-boxed** and locked for **[LOCK_TERM, e.g. 24 months]** | Multi-year-equivalent commitment + reference + case study (P6) | `06-` §13.5 (discount form) |
| **First-of-kind connector co-funding** | If the partner funds a roadmap-staged connector build, it is priced at **[reduced × factor]** vs. standard first-of-kind | A hardened, productized connector that lowers cost for every subsequent client | `06-` §7 productization lever + §13.5 |
| **Credits, not cash** | Where applicable, value is delivered as **platform credits / module-agent expansion at the locked unit price**, not as a cash rebate | Keeps the partner inside the product (land-and-expand flywheel) | `06-` §2 expansion ladder |

### 7.2 The anti-drift guardrails (verbatim discipline from `06-` §13.5)

- **"Design partner" is not "cheap forever."** It is a **time-boxed, obligation-bearing structure.** If the obligations (§3) stop being met, the pricing reverts at the next renewal gate.
- **The concession survives GA list-price increases** for the lock term; renewal is at then-current founding-customer terms (charter §10.4).
- **Connectors are never discounted as "live."** A staged stub priced as a build is flagged as a build with delivery risk; subscription connector tiering only applies once the connector is *delivered and accepted* (`06-` §7 canon guardrail).
- **Margin floor still applies** unless executive-approved as strategic (`06-` §13.2 approval ladder).
- **Every concession is logged** in the concession-exchange register (what we gave → what we got).

### 7.3 What we tell the partner about price (talk track)

> "You won't pay a setup fee, and you'll lock founding-customer pricing for [LOCK_TERM] — that's our thank-you for co-building with us before GA. In exchange we ask for your data, your honest feedback, and a reference *if we earn it*. We price the answer, not the dashboard, and I'll never charge you for a connector as if it were live when it's still on the roadmap."

The exact numbers come from the rate card at the proposal stage (`05-proposal-template.md`); the founder never quotes a dollar figure from memory.

---

## 8. Success Metrics

Metrics serve the goal ranking in §1.1: **value/learning first, references second, conversion third, roadmap signal fourth.** Reviewed at every monthly sponsor review; finalized at Day 90. These mirror charter §7 and add early-stage GTM funnel realism.

### 8.1 Partner-outcome metrics (does the partner get value?)

| Metric | Definition | Target | Caveat (early-stage realism) |
|---|---|---|---|
| **Time-to-first-trusted-answer** | Days from kickoff to the partner staking a real decision on a Nexora answer | **≤ 30 days** | The headline outcome metric (Palantir FDE borrow). If this slips past 30 days, the partnership is at risk — investigate data readiness (P1) or operational-owner engagement (P3). |
| **Answer trust rate** | % of agent answers the partner rates decision-ready (no rework) | **≥ 70% by Day 90** | A *hedged-when-data-was-missing* answer is **correct**, not a miss — score it as trusted behavior. |
| **Question volume** | Real questions/month against the 7 Live agents | **≥ [Q, e.g. 15–20]/month** | Below ~10/month means the platform isn't in the workflow — coach the operational owner. |
| **Cycle-time reduction** | Reduction in time to produce variance/forecast narrative vs. baseline | **≥ [TARGET, e.g. 50]%** | Must be a *client-validated range*, never a fabricated point estimate (`06-` §14 honesty guardrail). |
| **Module adoption** | # of the 10 modules actively used | **≥ [N, e.g. 3]** | |
| **Sponsor NPS** | Monthly sponsor satisfaction | **≥ [NPS, e.g. 30]** | The sponsor is the future reference and economic buyer. |

### 8.2 Program-learning metrics (does SCA learn?)

| Metric | Definition | Target |
|---|---|---|
| **Validator signal quality** | Quarantine / warning / clean rates across the 8 validators; false-positive rate on anomaly & alignment | Trend to < [X, e.g. 10]% false positives |
| **Connector demand index** | Weighted partner votes per roadmap connector | A ranked GA build order (G4) |
| **Pipeline defect rate** | Answers flagged by partners as ungrounded, or hedged when data was actually present | ↓ each month |
| **Reference yield** | # referenceable partners / cohort | **≥ 3 of cohort** (G2) |
| **Conversion rate** | Partners converting to paid / qualified partners | **≥ [CONV_TARGET, e.g. 50]%** (G3) |

### 8.3 Acquisition-funnel metrics (the GTM math to *fill* the cohort)

Realistic early-stage, no-brand, founder-led benchmarks. These are ranges with caveats — treat them as planning assumptions to be replaced by your own data after Cohort 1.

| Funnel stage | Realistic rate (early-stage SaaS, no brand) | Implication for a 5–8 partner cohort |
|---|---|---|
| **Cold outreach → positive reply** | **1–5%** (founder-sent, hyper-targeted, named-reason copy lands at the top of this range) | To get ~20 qualified conversations from cold, plan **~400–1,500 well-researched cold touches** |
| **Warm intro → meeting** | **30–50%** (investor / advisor / mutual-connection intros) | A handful of strong warm intros can outperform hundreds of cold emails — prioritize them |
| **Intro call → qualified (scorecard ≥ 16)** | **~30–50%** | Expect to disqualify half — that is the gate working (charter §2.5) |
| **Qualified → MOU signed (enters program)** | **~40–60%** | The honest pre-GA disclosure costs some here, and that is *correct* — it filters out partners who'd churn at the first hedge |
| **Design partner → paid conversion** | **~40–60%** at this stage (well above blended SaaS pilot→paid of ~20–30% because partners are pre-qualified and co-invested) | A 6-partner cohort should yield **~3–4 paying founding customers + ≥ 3 references** |

> **Caveat:** these are *planning* numbers. With zero brand and a founder doing the sending, the cold positive-reply rate can sit at the low end (1–2%) until the first reference logo exists — which is exactly why G2 (references) is ranked above G3 (revenue). The first case study compounds every subsequent funnel rate.

### 8.4 Cohort scorecard (rolled up at Day 90)

| Partner | Industry / ERP | Trusted-answer (days) | Trust rate | Modules used | Sponsor NPS | Feedback items | Reference? | Convert? |
|---|---|---|---|---|---|---|---|---|
| [PARTNER A] | [IND] / [ERP] | [d] | [%] | [n/10] | [nps] | [#] | [Y/N] | [Y/N] |
| [PARTNER B] | [IND] / [ERP] | [d] | [%] | [n/10] | [nps] | [#] | [Y/N] | [Y/N] |
| [PARTNER C] | [IND] / [ERP] | [d] | [%] | [n/10] | [nps] | [#] | [Y/N] | [Y/N] |

---

## 9. Conversion Path

The design partnership is explicitly a **funnel to a paying, referenceable founding customer.** Conversion is *earned through demonstrated value, never assumed*, and it is *never a surprise* — it is previewed at Day 45 and decided at Day 90.

### 9.1 The path (charter §8, executed)

```text
Qualified (charter §2.5 scorecard ≥ 16)
  → MOU signed (charter §9)
  → Onboarded (accelerated 10-phase, Day 0–14)
  → First trusted answer (≤ Day 30)
  → Value proven (§8.1 targets trending)
  → DAY-45 CHECKPOINT  (go/adjust + conversion PREVIEW)
  → Proof + repetition (two close cycles run)
  → DAY-90 CONVERSION REVIEW  (gate evaluated)
  → Paid founding customer (rate locked, `../delivery/06-` §13.5)
  → Reference + case study (G2)
  → Expansion (modules / agents / seats / connectors via ClientConfig)
```

### 9.2 The conversion gate (charter §10.1 — all must hold)

A partner converts when **all** of the following are true at Day 90, evaluated against §8.1:

- Time-to-first-trusted-answer achieved (≤ 30 days), **AND**
- Answer trust rate ≥ 70%, **AND**
- ≥ [N] modules in active use, **AND**
- Sponsor NPS ≥ [NPS], **AND**
- Reference + case study agreed.

### 9.3 The three outcomes (charter §10.2)

| Outcome | Trigger | Action | Owner |
|---|---|---|---|
| **Convert** | Gate met | Move to paid at locked founding-customer rate (`../delivery/06-` §13.5); paper via `05-proposal-template.md`; hand off to steady-state per `../delivery/09-sales-to-implementation-handoff.md` and `../delivery/07-multi-tenant-client-operating-model.md` | Founder/GTM |
| **Extend** | Close, value not yet proven | One-time **[30]-day** extension with a written corrective plan naming the specific gap (usually data readiness or operational-owner time) | Founder + SA |
| **Graceful exit** | Gate not met / poor fit | Data export + deletion within [DELETE_DAYS]; capture lessons into the next-cohort sourcing filter; **no reference obligation** | Founder |

### 9.4 The Day-45 conversion preview (the move that makes conversion non-awkward)

At Day 45 the founder runs a **15-minute commercial preview** inside the checkpoint. The talk track:

> "We're at the halfway mark. Here's what's landed: [trusted answers / cycle-time win]. At Day 90 we'll look at converting you to a founding customer — and I want to show you now what that looks like so it's never a surprise. Founding pricing locked for [LOCK_TERM], no setup fee, and you keep the roadmap-influence seat. Between now and then, the things that get us to 'yes' are [X, Y]. Anything in the way?"

This surfaces objections (budget cycle, procurement, security sign-off, a new-CFO transition) **45 days before** they can derail the deal, and it ties conversion to the value already demonstrated rather than to a sales push. Conversion mechanics live in `09-pilot-framework.md`. Structured objection responses will live in `08-objection-handling.md` (**forthcoming — not yet authored**; until it ships, handle objections against the charter `../delivery/08-` §5.4 disclosures and the §7.3 / §9.4 talk tracks here).

### 9.5 Buying triggers that accelerate conversion (watch for these per partner)

Conversion lands faster when a concrete trigger is live. The founder should know which trigger each partner is riding and time the Day-90 close to it:

- **New CFO in seat < 12 months** — wants a visible early win; the strongest single trigger.
- **Active fundraise / board pressure on forecast accuracy** — forecasting + executive_reporting become urgent.
- **ERP/HRIS migration** (e.g., to NetSuite or Workday) — disrupts existing reporting; opens a replacement window.
- **Audit / restatement** — elevates demand for cited, defensible, guardrailed numbers (our differentiator).
- **FP&A hiring freeze / lean finance team** — "do more with the team you have" maps directly to the AI-analyst value prop and Managed Intelligence (`06-` §8).
- **M&A integration** — multi-entity consolidation pain maps to multi-BU ClientConfig + finance-bp agent.

### 9.6 Post-conversion: from design partner to expanding founding customer

On conversion, the engagement leaves program-mode:

1. **Rate lock papered** for [LOCK_TERM]; modules/agents/seats added later inherit the locked unit price (charter §10.4, `06-` §11.3 add-ons).
2. **Reference + case study produced** (G2) — schedule the case-study interview within [N, e.g. 30] days of conversion while the win is fresh and quantified.
3. **Steady-state handoff** per `../delivery/09-sales-to-implementation-handoff.md`; tenancy governed by `../delivery/07-multi-tenant-client-operating-model.md` (7-role RBAC, `clientId` isolation, and Clerk auth **once it is Live** — Target-state today, per charter §10.5).
4. **Expansion thesis activated** — the land was deliberately the smallest configuration that proved the north-star flow (`06-` §2); now grow along the expansion ladder (more modules/agents/BUs, then live connectors via `06-` §7).

---

## 10. The Founder's Operating Rhythm (one-page run sheet)

The execution discipline that keeps a founder-run program from drifting. Pin this up.

| Cadence | Action | Tied to |
|---|---|---|
| **Daily** | Triage the shared partner channel within [SLA_HOURS] | S5 |
| **Weekly** | Run each partner's 30-min working session; review every hedged answer; update the feedback register; review register in product planning | §6.1, §6.2 |
| **Fortnightly** | Onboard no more than 2 new partners; review acquisition funnel math (§8.3) vs. cohort fill target | §2.2 |
| **Monthly** | Sponsor review per partner (NPS + connector vote); update cohort scorecard (§8.4); refresh connector demand index | §6.1, §8 |
| **Day 45 (per partner)** | Go/adjust checkpoint + conversion preview | §9.4 |
| **Day 90 (per partner)** | Conversion review → Convert / Extend / Graceful exit; if Convert, schedule case-study interview | §9.2–9.3 |
| **End of cohort** | Roll up: references won, conversions, ranked connector build order, validator tuning learnings → feed Cohort 2 sourcing + the GA roadmap | §1.1 goals |

---

## Appendix A — Cross-Document Map

| This document relies on | For |
|---|---|
| `../delivery/08-design-partner-program.md` | The charter: Honesty Principle, qualification scorecard, MOU, conversion gate, feedback taxonomy & register |
| `../delivery/06-pricing-framework.md` (esp. §13.5, §7, §2, §11) | All pricing structure; the only sanctioned standing discount; no dollars here |
| `../delivery/01-financial-intelligence-assessment-framework.md` | Discovery instrument at Phase 1 |
| `../delivery/09-sales-to-implementation-handoff.md` | Handoff at conversion to steady-state |
| `../delivery/07-multi-tenant-client-operating-model.md` | Tenancy, 7-role RBAC, `clientId` isolation, Clerk |
| `../docs/commercial-readiness/CERTIFICATION.md` | The honest certification status disclosed to partners |
| `01-ideal-customer-profile.md`, `02-buyer-personas.md` | Who to source as partners (the §8.3 funnel feeds from here) |
| `04-outreach-strategy.md`, `05-outreach-sequences.md` | How to fill the cohort (the acquisition funnel) |
| `06-discovery-process.md`, `07-qualification-framework.md` | Qualifying a prospect into a partner |
| `09-pilot-framework.md` | Conversion-conversation support / pilot-to-paid mechanics |
| `08-objection-handling.md` *(forthcoming — not yet authored)* | Objection responses; until it ships, use charter `../delivery/08-` §5.4 + the §7.3/§9.4 talk tracks here |
| `10-first-90-days.md`, `11-shortest-path-to-first-customer.md` | The broader acquisition system this program plugs into |

## Appendix B — Glossary (execution-layer)

| Term | Meaning |
|---|---|
| **Trusted answer** | An agent answer the partner stakes a real decision on — the program's core success unit |
| **Founder-as-FDE** | The Palantir-borrowed posture: the founder/SA owns the partner's *outcome*, not just the install |
| **Conversion preview** | The Day-45 move that makes the Day-90 conversion non-awkward and surfaces objections early |
| **Connector demand index** | Weighted partner votes ranking the roadmap connector build order (the single ranked input to GA sequencing) |
| **Concession exchange** | The `06-` §13.3 rule that every discount must buy something back (reference, term, expansion) |
| **Honesty Principle** | Every capability labeled Live / Roadmap / Target-state; never blurred in front of a partner |

---

*End of File 03 — Design Partner Program (GTM execution layer). This document carries no final dollar values; all commercial terms defer to `../delivery/06-pricing-framework.md` and the controlled rate card. On any conflict about program terms, `../delivery/08-design-partner-program.md` governs.*
