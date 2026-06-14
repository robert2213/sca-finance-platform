# Shortest Path to First Paying Customer

> **Deliverable 11 of 11 — the capstone of the Design Partner Acquisition System.** Documents 01–10 each solve one part of the motion (who to target, how to reach them, how to qualify, how to run a pilot). This document is the **execution narrative that ties them into a single, week-by-week operating plan** that takes Sin City Analytics from "Ready for Design Partners" (certified, code + build) to **First Paying Customer**. It is the founder's run sheet. Read it, then run it.
>
> **The one-sentence answer.** The shortest path is **not** "more outreach" — it is to **run a deliberately narrow, warm-led founder hustle**: pick a 200–2,000-FTE ICP segment you already have network access to, generate ~25 warm-intro conversations and ~250 cold touches over 12–16 weeks, convert 8–12 discovery calls into 3–5 qualified design-partner pilots with a *paid* commitment baked in from day one, and use a Palantir-style forward-deployed delivery sprint to make one of them trust a Nexora answer enough to convert to paid by Week 14.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 11 — Shortest Path to First Paying Customer |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Audience** | Founder / early GTM team (internal operating doc) |
| **Classification** | Confidential — Internal |
| **Synthesizes** | `01-ideal-customer-profile.md` · `02-buyer-personas.md` · `03-design-partner-program.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `06-discovery-process.md` · `07-qualification-framework.md` · `08-objection-handling.md` · `09-pilot-framework.md` · `10-first-90-days.md` (objection handling has its own deliverable — `08` — and is reinforced by per-persona objections in `02` and competitor-aware rebuttals in `06`) |
| **Defers to** | `../delivery/06-pricing-framework.md` (all dollar values), `../delivery/08-design-partner-program.md` (program charter), `../delivery/01-financial-intelligence-assessment-framework.md` (discovery instrument), `../delivery/09-sales-to-implementation-handoff.md` (conversion handoff) |
| **Certification basis** | `../docs/commercial-readiness/CERTIFICATION.md` — "Ready for Design Partners" (code + build certified; full commercial rating pending live penetration test) |

---

## 0. The Starting Line: What "Ready for Design Partners" Actually Means

Before the plan, an honest read of where we stand on Day 0 — because the plan is shaped by the gaps, not just the strengths.

| Asset we have | Gap we run alongside |
|---|---|
| Certified platform: multi-tenant Next.js + Databricks SQL (Delta), Clerk auth, RBAC (7 roles), per-tenant `clientId` isolation | **Commercial security rating pending a live penetration test.** Until then we sell to design partners on non-production-critical / restricted data and disclose the pen-test status (see §8 risk R4). |
| 8 guardrailed AI finance agents that answer questions with cited data | **Zero brand recognition.** Nobody is searching for "Sin City Analytics." Inbound is ~0. Every conversation is founder-initiated. |
| Live ingestion: CSV/Excel + Databricks (Delta) | **Native connectors (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive) are roadmap, not live.** Every partner starts on file-based ingestion. |
| Founder credibility + finance-domain depth | **No reference logos, no case study, no proof in the wild.** The first customer is the hardest because there is no social proof to borrow. |
| A complete delivery + GTM framework (docs 01–10, delivery 01–09) | **A framework is not traction.** Nothing here matters until a finance leader stakes a real decision on a Nexora answer. |

**Strategic consequence:** with no brand and no references, the shortest path is *not* a volume play. It is a **warm-led, founder-delivered, narrow-segment hustle** modeled on Databricks Early Access (hands-on co-build + roadmap influence), Scale AI Design Partners (deep integration, tight feedback loop, logo + case study), and Palantir Forward-Deployed (the founder embeds and solves the partner's *actual* problem by hand). We are not running a sales process. We are running a co-build.

---

## 1. Priority Order — What to Do First, What to Ignore

The single most common way an early founder wastes the first 90 days is **doing the wrong things in parallel** instead of the right things in sequence. This is the forcing-function order.

### 1.1 Do these first (in this order)

| Rank | Action | Why it is first | Doc |
|---|---|---|---|
| 1 | **Narrow the ICP to ONE beachhead segment** (one industry × one size band × one buying trigger) | A generic "finance teams" target produces generic outreach and 0–1% reply rates. A specific target ("PE-backed SaaS, 200–800 FTE, new CFO in seat <12 months") lets you write a message that lands. | `01` |
| 2 | **Build the warm list before the cold list** | Warm intros convert at 30–50% to a call vs. 1–5% for cold. Your network is the cheapest top-of-funnel you will ever have. Spend it first. | `04` |
| 3 | **Lock the design-partner offer + paid conversion mechanics** | If the pilot has no paid commitment baked in, you get a free pilot that never converts. The conversion gate must exist *before* the first call. | `03`, `09`, `../delivery/06`, `../delivery/08` |
| 4 | **Stand up the discovery instrument + qualification scorecard** | You cannot run a good discovery call improvising. The assessment (`../delivery/01`) + qualification framework (`07`) make every call repeatable. | `06`, `07`, `../delivery/01` |
| 5 | **Prepare the demo on real-shaped data + the objection playbook** | The demo must answer a real finance question on data that looks like the partner's. Memorize the 8 highest-frequency objections cold. | `02` §3.5–§8.5, `06` App. B |
| 6 | **Then, and only then, start outreach** | Outreach before the above is wasted — you burn warm intros on a half-baked offer you can't deliver. | `04`, `05` |

### 1.2 Explicitly ignore (for now)

Per `CLAUDE.md` Prime Directive and the land-and-expand logic in `../delivery/06`, **do not**:

- Build native connectors speculatively. Partners start on CSV/Excel. Let *partner demand* (the connector demand index in `../delivery/08` §7.2) rank the build order. The one exception: §1.3.
- Add dashboards, agents, UI features, or new modules. The platform is certified. Ship the motion, not more product.
- Chase logos outside the beachhead segment because an intro happens to be easy. One off-segment partner costs you a referenceable cluster.
- Run paid ads, build a content engine, or do "brand." You have ~0 brand equity and no time; founder-led warm motion beats brand at this stage.
- Write executive-summary reports or templated decks for prospects. Answer their actual question with cited data — that *is* the product demo.
- Raise the cohort cap to chase volume. 3–5 well-run pilots beat 10 neglected ones (`../delivery/08` §13 cap discipline).

### 1.3 The one product exception

If — and only if — three or more partners in the *same beachhead segment* share the *same* source system (e.g., all run NetSuite), a **first-of-kind connector build co-funded by a design partner** (`../delivery/06` §7 productization lever) can be the thing that converts the first paying customer. Treat it as a paid integration package, flagged as build work with delivery risk — never as a free feature.

---

## 2. The Conversion Funnel — Numbers That Yield 1–2 Paying Customers

This is the math the entire plan is sized against. Early-stage B2B SaaS conversion rates vary widely; these are **realistic ranges with caveats**, and we plan to the **conservative end** so the top-of-funnel is large enough.

### 2.1 Stage definitions and assumed rates

| # | Funnel stage | Conservative → Optimistic rate | Caveat |
|---|---|---|---|
| A | **Cold touch → positive reply** | 1% → 5% | Founder-sent, hyper-personalized, named-trigger outreach; not bulk. Anything above 5% means your list is actually warm. |
| A' | **Warm intro → conversation** | 30% → 50% | A real intro from a trusted mutual contact. The single highest-leverage channel for a no-brand founder. |
| B | **Conversation/positive reply → discovery call held** | 50% → 70% | Some replies are "not now"; some warm intros stall on scheduling. |
| C | **Discovery call → qualified** (passes `07` scorecard ≥16/25) | 30% → 50% | Most disqualifications are data-readiness (can't export CSV) or no executive sponsor. |
| D | **Qualified → pilot started** (MOU signed, `../delivery/08` §9) | 50% → 70% | Friction is legal/MOU review and data-due-date commitment. |
| E | **Pilot → paid conversion** (Day-90 gate, `../delivery/08` §10.1) | 25% → 50% | The make-or-break rate. Driven by whether the partner staked a real decision on a trusted answer. |

> **Sanity check against the program charter.** `../delivery/08` §7.2 targets ≥3 referenceable partners per cohort and a conversion rate target. This funnel is sized to land a 5–8-partner cohort cap with 3–5 *active* pilots, which yields the 1–2 paying customers that define this milestone.

### 2.2 Working the math backward — from 1–2 paid to top-of-funnel

**Target: 1–2 paying customers in 12–16 weeks.**

Using **conservative** rates, to get **2 paying customers**:

| Stage | Conservative rate | Volume needed |
|---|---|---|
| Paying customers (target) | — | **2** |
| Pilots started (E: 25%) | 25% | **8 pilots** → but cohort cap is 5–8, so we plan for **4–5 pilots** at a blended ~35–40% conversion to hit 1–2 paid |
| Qualified (D: 60%) | 60% | **~8 qualified** |
| Discovery calls (C: 40%) | 40% | **~20 discovery calls** |
| Conversations/positive replies (B: 60%) | 60% | **~33 positive responses** |

Top-of-funnel split across two channels (warm prioritized):

| Channel | Rate to conversation | Touches needed for ~33 conversations |
|---|---|---|
| **Warm intros** (target ~70% of conversations = ~23) | 40% (mid of 30–50%) | **~58 warm intros requested** → realistically **25–30 high-quality warm asks** if you also weight cold |
| **Cold outreach** (target ~30% = ~10 conversations) | 3% (mid of 1–5%) | **~330 cold touches** |

### 2.3 The realistic, plannable top-of-funnel

Reconciling the above into numbers a solo/early founder can actually execute in 12–16 weeks:

| Input | 12–16-week target | Cadence |
|---|---|---|
| **Warm intro asks** | **25–30** | ~2–3/week from your network map |
| **Cold personalized touches** | **200–300** | ~15–25/week, founder-sent, trigger-based |
| → **Discovery calls held** | **10–14** | ~1/week ramping to 2/week |
| → **Qualified design-partner candidates** | **6–8** | scorecard ≥16 |
| → **Pilots started (MOU signed)** | **3–5** | staggered, max 2 new/fortnight per `../delivery/08` §2.4 |
| → **Paying customers** | **1–2** | by Week 14 (lead) / Week 16 (buffer) |

> **The honest caveat:** these rates assume a founder who knows the finance domain cold, sends genuinely personalized outreach tied to a real trigger, and delivers pilots hands-on. If outreach is generic or pilots are unattended, every rate drops by half and the plan needs 2× the volume or 2× the time. **The leverage is in quality, not volume.**

### 2.4 Funnel-at-a-glance

```text
WARM INTROS (25-30) ──40%──┐
                            ├──► CONVERSATIONS (~33) ──► DISCOVERY CALLS (10-14)
COLD TOUCHES (200-300) ─3%──┘                                      │
                                                                   │ 30-50% qualify
                                                                   ▼
                                                      QUALIFIED (6-8, scorecard >=16)
                                                                   │ 50-70% start
                                                                   ▼
                                                      PILOTS STARTED (3-5, MOU signed)
                                                                   │ 25-50% convert
                                                                   ▼
                                                      PAYING CUSTOMERS (1-2)  <-- MILESTONE
```

---

## 3. The 12–16 Week Execution Plan (Week-by-Week)

The plan runs in three acts: **Acts I–III map to a single quarter plus a 4-week buffer.** Weeks 1–2 are setup (do not skip — they set every downstream rate). Weeks 3–7 are pipeline generation + discovery. Weeks 5–14 overlap into pilot delivery (staggered starts). Weeks 12–16 are conversion.

### Act I — Foundation (Weeks 1–2): build the machine before you fire it

**Goal: a runnable motion. No outreach yet.**

| Week | Do | Output / gate | Source doc |
|---|---|---|---|
| **1** | Lock the **beachhead ICP**: one industry × one size band (200–2,000 FTE) × one primary buying trigger. Build the **named target account list (40–60 accounts)** with the trigger evidence for each. | A spreadsheet of 40–60 named accounts, each tagged with a trigger (new CFO <12 mo, fundraise, ERP/HRIS migration, audit/restatement, board pressure on forecast accuracy, FP&A hiring freeze, M&A integration). | `01`, `02` |
| **1** | Map your **warm network** against the list. Who can intro you to whom? | 25–30 warm-intro paths identified. | `04` |
| **1** | Finalize the **design-partner offer**: scope (live capabilities only), MOU (`../delivery/08` §9), paid conversion gate (`../delivery/08` §10.1), founding-customer rate lock (`../delivery/06` §13.5). | One-page offer + MOU draft ready for legal. | `03`, `../delivery/08`, `../delivery/06` |
| **2** | Stand up the **discovery script** (`06`) + **qualification scorecard** (`07`, threshold ≥16/25) + the **assessment instrument** (`../delivery/01`). | Repeatable 30-min discovery call kit. | `06`, `07`, `../delivery/01` |
| **2** | Build the **demo on real-shaped synthetic data** (the repo already has synthetic fact/dim CSVs under `tests/synthetic-data/`). Rehearse the north-star flow: *Question → Intent → Data → Claude Analysis → Direct Answer* on a real variance/forecast question. | A 10-minute demo that answers a CFO's actual question with cited data and *flags* a low-confidence gap (the guardrail is the demo). | `06` App. B, platform canon |
| **2** | Memorize the **objection playbook** (`02` §3.5–§8.5 per-persona objections + `06` Appendix B competitor-aware rebuttals) — especially: "you have no references," "the connectors aren't live," "is our financial data safe (pen-test pending)," "we already have Power BI / Adaptive / Excel." | 8 objections answered in <30 seconds each, cold. | `02`, `06` App. B |
| **2** | Write + load the **outreach sequences** (`05`): warm-intro request, cold email, follow-up nudge — all with `[PLACEHOLDER]` personalization fields. | Sequences ready in your sending tool. | `04`, `05` |

**Act I exit gate:** offer locked, demo rehearsed, list built, sequences loaded, objections memorized. **If any of these is missing, do not start Week 3.**

### Act II — Pipeline + Discovery (Weeks 3–7): fill the funnel, hold the calls

**Goal: 10–14 discovery calls held, 6–8 qualified, first 2–3 pilots signed.**

| Week | Do | Target metric | Source doc |
|---|---|---|---|
| **3** | **Fire warm intros first** (send 8–10 intro requests). Begin cold outreach at ~15/week. Book any inbound calls immediately. | 8–10 warm asks sent; ~15 cold touches; 1–2 calls booked. | `04`, `05` |
| **4** | Continue warm asks (8–10 more). Cold outreach ~20/week. Run **first 2–3 discovery calls** using `06`. Score each on `07`. | ~3 discovery calls held; 1–2 qualified. | `05`, `06`, `07` |
| **5** | Cold outreach ~25/week. Run 2–3 more discovery calls. **Send first MOU(s)** to qualified candidates. Begin **Pilot #1 onboarding** (data plan, ClientConfig) the moment an MOU is signed. | ~6 calls held cumulative; 2–3 qualified; **Pilot #1 starting**. | `06`, `07`, `09`, `../delivery/08` |
| **6** | Warm follow-ups + cold nudges. Run 2–3 discovery calls. **Pilot #2 starts** (stagger: max 2 new partners/fortnight). | ~9 calls cumulative; 3–4 qualified; **2 pilots running**. | `05`, `09` |
| **7** | Last heavy outreach week. Run remaining discovery calls. **Pilot #3 starts.** Hold the cohort cap — stop adding once you have 4–5 strong pilots in flight. | ~12–14 calls cumulative; **3 pilots running**; cohort effectively set. | `06`, `09`, `../delivery/08` §2.4 |

**Act II exit gate (≈Week 7):** 3–5 pilots signed and onboarding, at least 1 pilot has uploaded real data and run its first question. Pipeline is now full; outreach throttles down so delivery can ramp.

### Act III — Pilot Delivery + Conversion (Weeks 5–16): make them trust an answer, then charge for it

**Goal: drive ≥1 pilot to a trusted answer → Day-90 gate → first paid conversion.** Pilots run on a compressed version of the 90-day program (`../delivery/08` §5.1) because they started staggered from Week 5–7; the conversion gate is evaluated per-pilot at *their* Day 90, which for the lead pilot lands ~Week 14.

| Week | Do (per active pilot) | Gate / milestone | Source doc |
|---|---|---|---|
| **5–6** | **Forward-deployed onboarding** (Palantir-style): founder + SA personally author ClientConfig, ingest partner CSVs, tune the 8 validators on *their* data. | First data ingested + "Data Trusted" (quarantine cleared). | `09`, `../delivery/08` §5, `../delivery/01` |
| **6–8** | Run the partner's **top finance questions** through the agents. Capture trusted vs. hedged answers. | **Time-to-first-trusted-answer ≤ 30 days** (the leading indicator of conversion). | `09`, `../delivery/08` §7.1 |
| **8–10** | Weekly working sessions; tune agent behavior + validator thresholds; log feedback (`../delivery/08` §6). Drive question volume up. | Answer trust rate trending to ≥70%. | `../delivery/08` §6–7 |
| **10–11** | **Day-45 checkpoint** (per pilot): go/adjust decision; **preview the conversion conversation** so it is never a surprise. | Mid-program go/adjust; conversion previewed. | `../delivery/08` §6.1, §10 |
| **11–13** | Deepen value: get the sponsor to stake a *real decision* (a board number, a forecast call, a vendor cut) on a Nexora answer. This is the conversion event, not the demo. | Sponsor stakes a decision; module adoption ≥ target. | `09`, `../delivery/08` §7.1 |
| **13–14** | **Day-90 conversion review** for the lead pilot: evaluate the gate (trusted-answer ≤30d, trust rate ≥70%, ≥N modules, sponsor NPS, reference agreed). Present paid terms at the locked founding rate (`../delivery/06`). | **PAID CONVERSION #1** — milestone hit. Reference + case study agreed. | `../delivery/08` §10, `../delivery/09`, `../delivery/06` |
| **15–16** | Run the **second pilot's conversion review** (it started ~2 weeks later). Buffer for any pilot that needs a 30-day extension (`../delivery/08` §10.2). Execute sales→delivery handoff for the converted customer. | **PAID CONVERSION #2** (or extension with corrective plan). | `../delivery/09`, `../delivery/08` §10 |

> **Why the overlap matters:** outreach (Act II) and delivery (Act III) run concurrently from Week 5. A founder cannot wait for all pilots to sign before starting delivery — the first pilot must be in delivery by Week 5–6 so its Day-90 gate lands inside the 16-week window. **The plan only works if the first pilot starts early.**

### 3.1 Weekly operating rhythm (the founder's standing calendar)

| Day | Block | Activity |
|---|---|---|
| Mon | AM | Pipeline review: funnel numbers vs. §2 targets; send week's warm asks. |
| Mon–Thu | AM | Cold outreach batch (personalized, trigger-based) + reply handling. |
| Tue–Thu | PM | Discovery calls + pilot working sessions. |
| Wed | PM | Feedback triage + ClientConfig/validator tuning for active pilots. |
| Fri | AM | Sponsor reviews / Day-45 / Day-90 gates as scheduled. |
| Fri | PM | Metrics log + next-week plan; update the funnel + cohort scorecard (`../delivery/08` §7.3). |

---

## 4. Milestones (Realistic, Dated, Measurable)

| Milestone | Target week | Definition of done | Leading risk if missed |
|---|---|---|---|
| **M0 — Machine built** | End Wk 2 | Offer + MOU + demo + scripts + list + sequences ready | Slips everything; do not start outreach without it |
| **M1 — Funnel live** | Wk 3 | First warm asks + cold touches sent; first call booked | No pipeline = no pilots |
| **M2 — First discovery call** | Wk 4 | One real finance leader on a call, scored on `07` | Message/segment isn't landing |
| **M3 — First MOU signed** | Wk 5 | First design partner committed; paid gate in writing | Offer or conversion terms unclear |
| **M4 — First data ingested** | Wk 6 | Partner CSVs through validators; "Data Trusted" | Data-readiness was overstated in discovery |
| **M5 — First trusted answer** | Wk 8 (≤30d from M3) | Sponsor calls one answer decision-ready | Agents hedging / data thin / wrong questions |
| **M6 — 3 pilots running** | Wk 7 | Cohort effectively set; outreach throttles | Under-filled funnel; over-filled = delivery debt |
| **M7 — Day-45 checkpoint clean** | Wk 10–11 | Lead pilot on track; conversion previewed | Surprise at Day 90 = lost conversion |
| **M8 — FIRST PAYING CUSTOMER** | **Wk 14** | Day-90 gate met; paid at locked rate; reference agreed | **The milestone.** See §6 most-likely path. |
| **M9 — Second paid / reference asset** | Wk 16 | 2nd conversion or 1 case study + referenceable logo | Proof for the *next* cohort |

---

## 5. Biggest Risks and Mitigations

| # | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| **R1** | **Funnel starves** — not enough top-of-funnel, so <3 pilots start. | High | High | Front-load warm intros (highest-converting channel); track funnel weekly vs. §2; if Week 4 discovery calls < 2, double cold volume and widen warm asks the *same week*, not later. | Founder |
| **R2** | **Free-pilot trap** — pilots run, nobody pays. | High | Critical | Bake the **paid conversion gate into the MOU on day one** (`../delivery/08` §10.1). Preview the conversion conversation at Day-45 (`../delivery/08` §6.1). No open-ended free pilots. | Founder/GTM |
| **R3** | **Data-readiness lie** — partner said they could export clean CSVs; they can't, and the pilot stalls in data hell. | High | High | Gate qualification on a *demonstrated* CSV export (`07` + `../delivery/08` §2.2), not a verbal claim. Ask for one sample extract *before* MOU. | SA + partner owner |
| **R4** | **Security objection blocks the deal** — financial data + pen-test pending kills it. | Medium | High | Disclose pen-test status up front (`CERTIFICATION.md`); scope pilots to **non-production-critical / restricted data**; agree compensating controls in MOU (`../delivery/08` §5.4); offer to time the paid conversion to the pen-test completion. | Founder |
| **R5** | **Connector expectation gap** — partner assumes NetSuite/Workday is live, feels misled. | Medium | High | Honesty Principle on every artifact (`../delivery/08` §0): label Live / Roadmap / Target-state. Connectors are roadmap; partners *vote* the order. Never demo a stub as live. | Founder/SA |
| **R6** | **Agent trust collapse** — an agent hedges (or worse, looks wrong) on the partner's data and the sponsor loses faith. | Medium | Critical | Frame guardrails as the feature ("it flags missing data instead of inventing a number"). Pre-run the partner's top questions yourself before the working session; fix data/config first. Time-to-first-*trusted*-answer is the metric, not first-answer. | SA |
| **R7** | **Founder bandwidth** — running outreach + discovery + delivery solo, delivery slips, pilots neglected. | High | High | Cohort cap at 3–5 active pilots (`../delivery/08` §2.4); stagger starts (max 2/fortnight); throttle outreach once 3 pilots run. Protect delivery time on the calendar (§3.1). | Founder |
| **R8** | **Wrong sponsor** — champion is an analyst, not an economic buyer; no authority to convert. | Medium | High | Qualify the **economic buyer (CFO/VP Finance/Head of FP&A)** in discovery (`02`, `07`); "no sponsor, no partnership" (`../delivery/08` §2.3). | Founder |
| **R9** | **Long enterprise procurement** — even a willing partner can't sign by Week 14. | Medium | Medium | Bias the beachhead toward **founder-led / PE-backed mid-market (200–800 FTE)** where the CFO can sign fast; keep first contract small (land, not expand, per `../delivery/06` §2). | Founder |
| **R10** | **Scope creep into product-building** — founder starts building features/connectors instead of selling. | Medium | High | Enforce `CLAUDE.md` Do-Not list + §1.2 here. Only build the §1.3 exception (a co-funded connector that *converts a paying customer*). | Founder |

---

## 6. The Single Most-Likely Path to Success

If you do nothing else, do this. Across every early-stage, no-brand B2B founder motion, the highest-probability path to a first paying customer is **not** the cold-outreach machine — it is **one warm, well-qualified design partner, forward-deployed and converted**.

**The narrative:**

1. **A warm intro** (from your network map, Week 1) connects you to a **CFO or Head of FP&A in your beachhead segment who is in an active buying trigger** — most often a **new CFO in seat <12 months** (they are re-tooling and have political cover to try something new) or **board pressure on forecast accuracy**.
2. That intro converts to a discovery call at ~40% (vs. 3% cold). On the call you run `06`/`07`, and they pass the scorecard because the warm-intro filter already pre-selected for fit.
3. They have **clean, exportable CSV/Excel** (you verified a sample before MOU — R3) and a **real, painful question** their current stack (Excel, Power BI, or a heavy Adaptive/Anaplan deployment) answers slowly or not at all.
4. You sign the MOU **with the paid conversion gate in it** (R2), and you **personally embed** (Palantir-style) to ingest their data, tune validators, and get them to a **trusted answer in under 30 days**.
5. The sponsor **stakes a real decision** on that answer — a board forecast, a vendor cut, a headcount call. That moment, not the demo, is the sale.
6. At their **Day-90 gate (~Week 14)** the conversion is a formality you previewed at Day-45: they convert at the **founding-customer locked rate** (`../delivery/06`), and they agree to be a **reference + case study**.

**That is the whole game: one warm intro → one well-fit CFO in a trigger → one trusted answer → one staked decision → one paid conversion + one reference.** The reference is the asset that makes cohort #2 convert at double the rate, because the next prospect's first objection ("you have no references") is now answered.

Everything else in this document — the cold outreach, the funnel math, the 3–5 pilots — exists to **increase the number of shots** at exactly this path. You only need one to land.

---

## 7. How Docs 01–10 Feed This Plan (Synthesis Map)

| Doc | What it provides | Where it is used here |
|---|---|---|
| `01-ideal-customer-profile.md` | The beachhead ICP definition + buying triggers | §1.1 rank 1, Act I Wk 1, §6 |
| `02-buyer-personas.md` | CFO / VP Finance / Head of FP&A personas + economic buyer | §5 R8, §6, discovery targeting |
| `03-design-partner-program.md` | The GTM-side program offer | §1.1 rank 3, Act I Wk 1, M3 |
| `04-outreach-strategy.md` | Channel strategy (warm-first), network mapping | §1.1 rank 2, Act II Wk 3, §2.3 |
| `05-outreach-sequences.md` | Ready-to-send warm/cold/nudge copy | Act I Wk 2, Act II Wk 3–7 |
| `06-discovery-process.md` | The discovery call structure | §1.1 rank 4, Act II, M2 |
| `07-qualification-framework.md` | Scorecard (≥16/25), data-readiness gate | §1.1 rank 4, §2.1 stage C, R3, R8 |
| `02` §3.5–§8.5 + `06` App. B | Objection handling: per-persona objections (`02`) + competitor-aware rebuttals for Power BI/Tableau/Looker, Anaplan/Adaptive/Pigment, Excel, in-house BI/FP&A, Databricks/Snowflake (`06` Appendix B) — there is no standalone `08-objection-handling.md` | §1.1 rank 5, Act I Wk 2 |
| `09-pilot-framework.md` | The pilot/forward-deployed delivery model | Act III, M4–M8 |
| `10-first-90-days.md` | The 90-day partner journey | Act III cadence, Day-45/Day-90 gates |
| `../delivery/08-design-partner-program.md` | The program **charter** (MOU, gates, metrics, cap) | §2, §3 Act III, §5 R2/R5/R7 |
| `../delivery/06-pricing-framework.md` | Founding-customer rate lock, land-and-expand | M3, M8, §6, R9 |
| `../delivery/01-...assessment-framework.md` | The discovery instrument | Act I Wk 2, Act III onboarding |
| `../delivery/09-...handoff.md` | Sales→delivery handoff at conversion | M8, M9, Act III Wk 15–16 |

---

## 8. One-Page Run Sheet (print this)

```text
SIN CITY ANALYTICS — SHORTEST PATH TO FIRST PAYING CUSTOMER
============================================================
GOAL: 1-2 paying design-partner customers in 12-16 weeks.

FUNNEL (conservative, plan to these):
  25-30 warm asks  +  200-300 cold touches
    -> 10-14 discovery calls
    -> 6-8 qualified (scorecard >=16/25)
    -> 3-5 pilots (MOU w/ PAID GATE)
    -> 1-2 PAYING CUSTOMERS

PRIORITY ORDER:
  1. Narrow ICP to ONE beachhead segment + trigger
  2. Warm list BEFORE cold list
  3. Lock offer + PAID conversion gate
  4. Discovery script + qualification scorecard
  5. Demo on real-shaped data + objection playbook
  6. THEN outreach
IGNORE: speculative connectors, new features, off-segment logos,
        ads/brand, templated reports, raising the cohort cap.

WEEKS:
  1-2   FOUNDATION: build the machine. No outreach yet.
  3-7   PIPELINE+DISCOVERY: warm-first, 10-14 calls, sign 3-5 pilots.
  5-14  DELIVERY: forward-deploy, trusted answer <=30d, Day-45 preview.
  13-16 CONVERSION: Day-90 gate -> PAID + reference. Buffer/extension.

MILESTONES: M5 first trusted answer (Wk8) -> M8 FIRST PAID (Wk14).

TOP RISKS: free-pilot trap (paid gate in MOU); funnel starve
  (warm-first, weekly tracking); data-readiness lie (verify sample
  CSV pre-MOU); founder bandwidth (cap at 3-5 pilots).

MOST-LIKELY PATH: one warm intro -> one CFO in a buying trigger
  -> one trusted answer -> one staked decision -> one paid customer
  + one reference. Everything else buys more shots at this.
```

---

*End of Deliverable 11 — Shortest Path to First Paying Customer. This is the capstone execution narrative of the Design Partner Acquisition System. All dollar values defer to `../delivery/06-pricing-framework.md`; all program terms defer to `../delivery/08-design-partner-program.md`. Run the machine; protect the cohort cap; close one warm-led pilot.*
