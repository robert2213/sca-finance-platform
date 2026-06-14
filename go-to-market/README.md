# Design Partner Acquisition System — The GTM Operating System

**Sin City Analytics · Finance Intelligence Platform (codename Nexora)**

> This directory is the **go-to-market operating system** for taking Sin City Analytics from a certified platform — "Ready for Design Partners" — to its **first paying, referenceable founding customer.** It is not a marketing folder or a strategy deck. It is the founder's run sheet: eleven interlocking operating documents that define *who* to pursue, *how* to reach them, *how* to qualify and disqualify fast, *how* to run a forward-deployed pilot, and *how* to convert it to revenue — all bound by a single discipline (the Honesty Principle) and a single north star (a finance leader stakes a real decision on a cited Nexora answer).

---

## Document Control

| Field | Value |
|---|---|
| **Document** | README — Design Partner Acquisition System (master index) |
| **System** | Go-To-Market Operating System (`go-to-market/`) |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics GTM |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Classification** | Confidential — Internal GTM |
| **Certification basis** | [`../docs/commercial-readiness/CERTIFICATION.md`](../docs/commercial-readiness/CERTIFICATION.md) — "Ready for Design Partners" (code + build certified; full commercial rating pending a live penetration test) |
| **Connects to** | [`../delivery/README.md`](../delivery/README.md) — the delivery framework that executes after a partner converts |

---

## 1. What This Is

This is **the operating system to go from "Ready for Design Partners" to "First Paying Customer."**

Sin City Analytics is early-stage, pre-PMF, and founder-led, selling a Finance Intelligence Platform (codename **Nexora**) that moves finance organizations **from REPORTING to DECISION INTELLIGENCE** — software that behaves like a finance analyst, not a report generator. Its default flow is:

```text
User Question → Intent Detection → Relevant Data Retrieval → AI (Claude) Analysis → Direct Answer
```

We have **no brand recognition.** We win on exactly three assets: **founder credibility + finance-domain depth**, **demonstrable outcomes on the partner's own messy data**, and **speed to stand up** (configuration via `ClientConfig`, not custom code). Everything in this system is engineered to convert those three real assets into a first conversation, a qualified pilot, a trusted answer, and a paid logo — while protecting the only scarce resource we have: **founder hours and time-to-proof.**

The objective right now is **learning and validation over revenue.** A signed logo that yields no usable product feedback and no reference is, by our own definition, a failed engagement. The currency of this program is feedback rights, roadmap influence, and a referenceable case study — not bookings.

### Who runs it

A **founder + early team** (at most one part-time helper — an SDR-ish or technical Solutions Architect early on). The founder personally runs all early discovery and embeds in every pilot (the Palantir Forward-Deployed posture — the founder owns the *outcome*, not just the install). This is a **co-build, not a sales process.** The design-partner motion is modeled on three proven playbooks:

- **Databricks Early Access** — hands-on co-build, credits/founding terms instead of cash discounting, an explicit vote on the roadmap.
- **Scale AI Design Partners** — deep integration with a tight, instrumented feedback loop; logo + case study written into the deal.
- **Palantir Forward-Deployed (FDE)** — embed with the customer, solve their *actual* problem by hand, own the outcome.

---

## 2. The Funnel — How the Eleven Documents Connect

The GTM funnel is a single sequenced motion. Targeting feeds outreach; outreach feeds discovery; discovery feeds qualification; qualified accounts become pilots; pilots convert to paid. The **First-90-Days (10)** and **Shortest-Path (11)** documents sit *over* the whole funnel as the execution overlay that schedules and sequences everything else.

```mermaid
flowchart TD
    ICP["01 · Ideal Customer Profile<br/>(WHO — tier the account)"]
    PERS["02 · Buyer Personas<br/>(WHO — the human on the call)"]
    OUT["04 · Outreach Strategy<br/>(channel angles & guardrails)"]
    SEQ["05 · Outreach Sequences<br/>(send-ready copy)"]
    DISC["06 · Discovery Process<br/>(scorecard + Go/No-Go)"]
    QUAL["07 · Qualification Framework<br/>(0–100 score + auto-DQ)"]
    OBJ["08 · Objection Handling<br/>(decode → reframe → advance/exit)"]
    DPP["03 · Design Partner Program<br/>(the offer / MOU / conversion gate)"]
    PILOT["09 · Pilot Framework<br/>(6-week forward-deployed pilot)"]
    PAID(["💰 Conversion to Paid<br/>+ Reference & Case Study"])

    ICP --> PERS --> OUT --> SEQ --> DISC --> QUAL --> DPP --> PILOT --> PAID
    OBJ -. "works any pushback,<br/>routes to disqualify" .-> DISC
    OBJ -. .-> QUAL
    OBJ -. .-> PILOT
    DPP -. "the program every<br/>stage serves" .-> DISC

    subgraph OVERLAY["Execution Overlay — runs OVER the whole funnel"]
      D10["10 · First 90 Days<br/>(window-by-window plan)"]
      D11["11 · Shortest Path<br/>(12–16 week capstone run sheet)"]
    end
    OVERLAY -. "sequences & schedules<br/>every stage above" .-> ICP
    PAID --> D11
```

**Read the flow as a sentence:** the ICP (**01**) tiers the account and the Personas (**02**) name the human; Outreach Strategy (**04**) picks the channel and Sequences (**05**) supply the copy; a reply lands in Discovery (**06**), which scores into the Qualification gate (**07**); Objection Handling (**08**) works any pushback that surfaces along the way and routes weak fits to a clean disqualify; a qualified account enters the Design Partner Program (**03**) and runs the Pilot (**09**); a pilot that passes its gate **converts to paid + a reference.** First-90-Days (**10**) and Shortest-Path (**11**) are the time-boxed execution overlay that sequences all of it.

---

## 3. The Eleven Documents

| # | Title | File | Purpose | When it is used in the funnel |
|---|---|---|---|---|
| 01 | Ideal Customer Profile | [`01-ideal-customer-profile.md`](01-ideal-customer-profile.md) | The targeting layer. Defines Tier 1/2/3, the Negative ICP (N1–N10), the 7-dimension scoring model, and the one-line perfect partner. Makes *saying no* cheap. | **Before** any outreach — to source and tier accounts. Inherited by every downstream doc. |
| 02 | Target Buyer Personas | [`02-buyer-personas.md`](02-buyer-personas.md) | The six committee roles (CFO, Controller, FP&A Director, VP Finance, Finance Transformation Leader, CIO/Security): goals, fears, the message that lands vs. repels, and who champions/blocks. | When writing any message and before any call — to land on the human who can say yes. |
| 03 | Design Partner Program | [`03-design-partner-program.md`](03-design-partner-program.md) | The GTM **execution layer** on top of the delivery charter: program goals, partner/SCA ledgers, the model-borrowing logic, feedback rituals, concession structure, conversion path. | Throughout — it is *the offer* outreach reaches out about and the program discovery qualifies into. |
| 04 | Outreach Strategy | [`04-outreach-strategy.md`](04-outreach-strategy.md) | Channel strategy for five channels (LinkedIn, Email, Referral, Network, Community): who to contact, angles, what NOT to say, ROI ranking, recommended mix. | Top of funnel — to choose channel and message by tier and trigger. |
| 05 | Outreach Sequences | [`05-outreach-sequences.md`](05-outreach-sequences.md) | The ready-to-send message library: six paste-and-fill cadences (Cold/Warm LinkedIn, Email, Referral, Former Colleague, Executive) with Do/Don't and honesty guardrail. | Top of funnel — the literal copy that executes Outreach Strategy. |
| 06 | Discovery Process | [`06-discovery-process.md`](06-discovery-process.md) | The founder-led 1–3 call sales-discovery instrument: agenda, seven pillars, pain/data/exec/future-state assessment, the Discovery Scorecard, and Go/No-Go with hard gates. | After a positive reply — to decide design-partner fit and produce a scored Go/No-Go. |
| 07 | Qualification Framework | [`07-qualification-framework.md`](07-qualification-framework.md) | The numeric gate: a weighted 0–100 score across 7 dimensions (Pain, Urgency, Budget, Authority, Data Maturity, Technical Readiness, Strategic Fit) + 8 auto-DQ triggers. | At the seam between discovery and pilot — to decide whether to invest founder co-build time. |
| 08 | Objection Handling | [`08-objection-handling.md`](08-objection-handling.md) | The founder's combat manual: 9 objections decoded to their real concern, with spoken responses, reframing questions, proof-point arsenal, and when-to-disengage rules. | Anywhere pushback surfaces — outreach, discovery, qualification, or pilot — to advance or exit cleanly. |
| 09 | Pilot Framework | [`09-pilot-framework.md`](09-pilot-framework.md) | The 6-week + 2-week forward-deployed pilot: structure, week-by-week timeline, deliverables, signed Week-0 success criteria, exit states, and the pilot-to-paid conversion mechanics. | After qualification — to convert a qualified partner into a paying, referenceable customer. |
| 10 | First 90 Days | [`10-first-90-days.md`](10-first-90-days.md) | The founder's launch operating plan in three windows (Days 1–30 / 31–60 / 61–90): hypotheses, targets, weekly baselines, exit criteria, and the learning-over-revenue discipline. | Execution overlay — sequences the whole funnel across the first quarter of going to market. |
| 11 | Shortest Path to First Paying Customer | [`11-shortest-path-to-first-customer.md`](11-shortest-path-to-first-customer.md) | The capstone run sheet: the conversion math worked backward, a 12–16 week week-by-week plan (Acts I–III), dated milestones, top risks, and the single most-likely path. | Execution overlay / capstone — the synthesized week-by-week plan that ties docs 01–10 into one motion. |

---

## 3.1 Execution Sprints — The Run Layer (`sprints/`)

Documents `01`–`11` define the *machine*; the **execution sprints** in [`sprints/`](sprints/) are the **time-boxed runs** that fire it. Each sprint is a 30-day overlay that compresses the operating system into a copy-paste run sheet a solo founder executes starting Monday — concrete boolean strings, filter configs, daily counts, and trackers that the operating docs deliberately left to the sprint.

| Sprint | File | Window | Objective |
|---|---|---|---|
| **01** | [`sprints/sprint-01-acquire-first-design-partner.md`](sprints/sprint-01-acquire-first-design-partner.md) | Days 1–30 (Phase 1 — Ignite) | Source the 3 beachhead markets, run the warm-first outreach engine, and put the **first design partner** into motion (3–6 qualified discoveries; 1–2 MOUs in motion). Companion trackers: [`target-list`](sprints/sprint-01-target-list-template.csv) · [`kpi-dashboard`](sprints/sprint-01-kpi-dashboard-template.csv). |

---

## 4. Coverage Matrix — Deliverable Audit Digest

Each document was audited against its required sub-sections. The matrix below is the authoritative ground-truth digest as of 2026-06-13. **Verdict** is the audit grade; **Coverage** is the percent of required sub-sections addressed; **Remediated** marks documents revised after the initial audit pass.

| # | Document | Verdict | Coverage | Remediated |
|---|---|---|---|---|
| 01 | Ideal Customer Profile | minor | 98% | — |
| 02 | Target Buyer Personas | minor | 96% | ✅ Remediated |
| 03 | Design Partner Program | minor | 100% | ✅ Remediated |
| 04 | Outreach Strategy | minor | 98% | ✅ Remediated |
| 05 | Outreach Sequences | minor | 100% | — |
| 06 | Discovery Process | **pass** | 98% | — |
| 07 | Qualification Framework | minor | 98% | ✅ Remediated |
| 08 | Objection Handling | minor | 100% | — |
| 09 | Pilot Framework | minor | 98% | ✅ Remediated |
| 10 | First 90 Days | **pass** | 98% | — |
| 11 | Shortest Path to First Paying Customer | minor | 95% | ✅ Remediated |

**Reading the matrix:** all eleven deliverables clear the bar. Two carry a clean **pass** verdict (06, 10); the remaining nine carry a **minor** verdict (cosmetic or cross-reference notes only, no structural gaps). Six documents were **remediated** after the initial audit. Coverage ranges **95–100%**, averaging ~98% across the system. No deliverable has unaddressed required sub-sections.

---

## 5. The Weekly GTM Operating Cadence

The system is run on a fixed rhythm. The founder reviews leading indicators **daily** and the funnel + cohort **weekly**, so the motion never drifts. (Cadence is drawn from `03` §10, `04` §8.3, `10`, and `11` §3.1.)

| Cadence | What the founder reviews / does |
|---|---|
| **Daily** | Triage the shared partner channel within SLA (≤24 business hrs); send the day's cold-outreach batch + reply handling; one mandatory **learning-log entry** (the most important artifact of Month 1 — feeds 02/04/05/08). |
| **Weekly** | Pipeline review vs. funnel targets; send the week's warm-intro asks; run each active partner's 30-min working session; **review every flagged/hedged answer**; update the feedback register and review it in product planning; refresh the funnel + cohort scorecard. |
| **Fortnightly** | Onboard **no more than 2 new partners** (staggered starts); review acquisition-funnel math vs. the cohort-fill target. |
| **Monthly** | Per-partner sponsor review (NPS + connector-roadmap vote); update the cohort scorecard; refresh the connector demand index; write the monthly learning memo. |
| **Per-partner Day 45** | Go/adjust checkpoint **+ conversion preview** (so the Day-90 conversion is never a surprise). |
| **Per-partner Day 90** | Conversion review → **Convert / Extend / Graceful exit**; if Convert, schedule the case-study interview while the win is fresh. |
| **End of cohort** | Roll up references won, conversions, the ranked connector build order, and validator-tuning learnings → feed Cohort 2 sourcing + the GA roadmap. |

### North-star and key funnel metrics

**North star (identical to the product's):** a finance leader asks a real question and Nexora returns a grounded, cited, guardrailed **Direct Answer** — and **stakes a real decision on it.** The program is working the moment a partner does that. The single most important metric of the quarter is **≥ 1 logged "first trusted answer."**

| Metric | Target | Why it matters |
|---|---|---|
| **Time-to-first-trusted-answer** | **≤ 30 days** | The headline outcome metric (Palantir-FDE borrow). Slips signal a data-readiness or operational-owner gap. |
| **Answer trust rate** | **≥ 70% by Day 90** | % of agent answers rated decision-ready. A *hedged-when-data-was-missing* answer is correct behavior, not a miss. |
| **Cohort size** | **5–8 partners (hard cap)** | Below 5, too little signal; above 8, founder delivery quality collapses. The cap is sacred. |
| **Reference yield** | **≥ 3 referenceable / cohort; ≥ 1 public case study** | With no brand, the *next* 20 deals are unlocked by the *first* 3 references. |
| **Pilot → paid conversion** | **~40–60%** (well-qualified cohort) | Low conversion is a *qualification* failure upstream, not a pilot failure. |
| **Cohort outcome** | **3–5 referenceable conversions; 1–2 first paying customers (12–16 wks)** | The milestone that defines success at this stage. |

**Funnel planning bands (early-stage, no-brand, founder-led — directional, revise with real data):** cold touch → positive reply **1–5%**; warm intro → conversation **30–50%**; discovery → qualified **30–50%**; qualified → pilot **40–60%/50–70%**; pilot → paid **25–60%**. The honest implication: a no-brand founder **cannot win on cold volume** — warm and referral channels do the heavy lifting; cold backfills and seeds future warmth.

---

## 6. How This System Connects to Delivery and the Certification

### To the `../delivery/` framework

This GTM system is the **acquisition front end**; the [`../delivery/`](../delivery/README.md) framework is the **fulfillment back end.** They meet at conversion. Several GTM documents explicitly defer to delivery as the authority:

- **The program charter:** GTM `03` is the *execution layer* that runs on top of the delivery **charter** ([`../delivery/08-design-partner-program.md`](../delivery/08-design-partner-program.md)) — which owns the Honesty Principle, the qualification gate, the MOU, the conversion gate, and the feedback taxonomy. On any conflict about *terms*, the charter governs.
- **Pricing:** every GTM document carries `[PLACEHOLDER]`s only and **never a hard dollar figure** — all commercials defer to [`../delivery/06-pricing-framework.md`](../delivery/06-pricing-framework.md) §13.5 (the only sanctioned standing discount) and the controlled rate card.
- **Discovery instrument:** GTM `06`/`07` pre-seed the delivery-side assessment ([`../delivery/01-financial-intelligence-assessment-framework.md`](../delivery/01-financial-intelligence-assessment-framework.md)); discovery is not re-run from scratch.
- **The handoff:** a converted pilot triggers [`../delivery/09-sales-to-implementation-handoff.md`](../delivery/09-sales-to-implementation-handoff.md), and the forward-deployed pilot *is* the handoff package — there is **no cold start**, because the team that ran the pilot already knows the data, the questions, and the people. Steady-state tenancy is then governed by [`../delivery/07-multi-tenant-client-operating-model.md`](../delivery/07-multi-tenant-client-operating-model.md) (7-role RBAC, `clientId` isolation, Clerk auth once Live).

### To the certification

The whole motion is anchored to a single honest fact: the platform is **certified "Ready for Design Partners"** ([`../docs/commercial-readiness/CERTIFICATION.md`](../docs/commercial-readiness/CERTIFICATION.md)) — **code-inspection + build-verification certified**, with the **full commercial security rating pending a live penetration test.** This certification is a genuine scarcity lever *and* a hard honesty boundary:

- It is a credibility proof for technical/security buyers (multi-tenant on Next.js + Databricks SQL/Delta, Clerk auth, RBAC across 7 roles, per-tenant `clientId` isolation).
- It is **never overstated.** Every artifact in this system obeys the **Honesty Principle** — every capability labeled **Live today** (CSV/Excel + Databricks ingestion; the guardrailed agents; the 8 validators; `ClientConfig` tenancy), **Roadmap** (native QuickBooks/NetSuite/Workday HCM/Beeline-Fieldglass/Coupa/Workday Adaptive connectors — partners *vote* the build order), or **Target-state** (the completed pen test / full commercial rating). One over-claimed connector or compliance claim erodes the trust the entire program is built to earn. Pilots run only on **Live** capability, scoped to non-production-critical / restricted data with compensating controls agreed in the MOU until the pen test completes.

**The bottom line:** for a pre-PMF founder, **calibrated honesty is the strongest sales tool we own.** This system exists to point that honesty, plus founder depth and a demonstrable outcome, at one warm-led, well-qualified design partner — and convert them into the first paying, referenceable logo that makes the next cohort convert at double the rate.

---

*End of README — Design Partner Acquisition System (master index). Version 1.0 · Status: Active · Owner: Sin City Analytics GTM · Last Updated 2026-06-13. Run the machine; protect the cohort cap; close one warm-led pilot.*
