# First 90 Days — Founder-Led Design Partner Acquisition Plan

**File 10 of the Sin City Analytics Design Partner Acquisition System (the GTM operating system)**
**Product:** Finance Intelligence Platform (codename **Nexora**) — moves finance from REPORTING to DECISION INTELLIGENCE. It behaves like a finance analyst, not a report generator.

> This is the founder's operating doc for the first 90 days of going to market with no brand. It is deliberately biased toward **learning and validation over revenue**. The goal of these 90 days is not to book ARR — it is to prove that real finance leaders, pointing real questions at their own messy data, get a **grounded, cited, trusted answer** and will stake a decision on it. Revenue is a lagging indicator of that. We instrument the leading indicators.
>
> **Default product flow we are selling and testing:** Question → Intent Detection → Relevant Data Retrieval → AI (Claude) Analysis → Direct Answer. Never the report-template flow.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 10 — First 90 Days |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Audience** | Founder + early GTM/Delivery team (internal operating doc) |
| **Classification** | Confidential — Internal |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Related Documents** | `01-ideal-customer-profile.md` · `02-buyer-personas.md` · `03-design-partner-program.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `06-discovery-process.md` · `07-qualification-framework.md` · `08-objection-handling.md` · `09-pilot-framework.md` · `11-shortest-path-to-first-customer.md` · `../delivery/08-design-partner-program.md` (program charter) · `../delivery/06-pricing-framework.md` · `../delivery/01-financial-intelligence-assessment-framework.md` · `../docs/commercial-readiness/CERTIFICATION.md` |

---

## 0. How to Read This Document

This plan covers three windows — **Days 1–30 (Foundation & First Conversations)**, **Days 31–60 (Discovery & Pilot Design)**, and **Days 61–90 (Conversion & Cohort Lock)**. For each window you get:

- The **single hypothesis** the window exists to test (we are a science experiment with a sales motion attached, not a sales motion with a hope attached).
- **Concrete targets** by category: Outreach (by channel), Meetings, Discovery Calls, Proposals/MOUs, Design Partners signed, Revenue, and Learning Objectives.
- The **weekly activity baseline** that produces those targets.
- **Exit criteria** — what must be true to consider the window a success regardless of revenue.

### 0.1 The numbers are early-stage, no-brand, founder-led — and honest about it

Every conversion rate below is a **range with a caveat**, modeled on a pre-PMF B2B SaaS founder selling a finance product into finance buyers (a skeptical, busy, AI-cautious audience) with **zero brand recognition**. We win on three things only: founder credibility, finance-domain depth, and demonstrable outcomes. We do **not** win on inbound, ads, or category awareness — none exist yet.

| Funnel stage | Realistic no-brand rate | Caveat |
|---|---|---|
| Cold email → positive reply | **1–5%** | Finance titles are low-reply; 1–2% is normal cold, 3–5% only with sharp trigger-based personalization. |
| Cold LinkedIn DM → reply (any) | **8–15%** | Higher reply rate, lower quality; many are "not now." |
| Warm intro → meeting booked | **30–50%** | The entire early game. Founder must manufacture warmth. |
| Founder/operator referral → meeting | **40–60%** | Highest-yield channel; finite supply. |
| Meeting → qualified discovery (per `07-`) | **40–60%** | Many meetings are curiosity, not pain. |
| Discovery → pilot/design-partner candidate | **25–40%** | Gated by `07-` qualification + data readiness. |
| Candidate → signed design partner (MOU) | **40–60%** | We are selecting, not just converting (cohort is capped at 5–8 per `../delivery/08-`). |
| Design partner → paid conversion (Day 90+) | **40–60%** | Mostly out of this 90-day window; previewed Day 45, decided Day 90. |

> **Why these are low and that is fine.** A design partner motion modeled on Databricks Early Access, Scale AI Design Partners, and Palantir Forward-Deployed does not need volume. It needs **5–8 deeply-engaged co-builders**. The math below is sized to land those 2–4 inside 90 days and have a full qualified bench for the rest. If we were optimizing for revenue we'd run a different (worse) play.

### 0.2 The four canonical scarcity levers we lean on

We have no brand, so we manufacture credibility and urgency from what is real:

1. **Founder access** — the founder personally runs onboarding (the Palantir FDE move). This is a genuine scarcity.
2. **Capped cohort** — 5–8 partners, hard cap (per `../delivery/08-` §2.4). Real scarcity, honestly stated.
3. **"Ready for Design Partners" certification** — code + build certified per `../docs/commercial-readiness/CERTIFICATION.md` (full commercial rating pending a live pen test — we say so).
4. **Roadmap influence** — design partners set the connector build order (QuickBooks, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive). This is the Scale AI / Databricks move.

---

## 1. Pre-Flight (Day 0 — must be true before Day 1)

These are not 30-day targets; they are the launch checklist. If any is missing, fix it in Week 1, not later.

| # | Pre-flight item | Done? | Source |
|---|---|---|---|
| 1 | ICP locked (target company bands, segments, ERPs) | [ ] | `01-ideal-customer-profile.md` |
| 2 | Buyer personas + titles named | [ ] | `02-buyer-personas.md` |
| 3 | Design partner program charter + MOU outline ready | [ ] | `../delivery/08-design-partner-program.md` |
| 4 | Outreach sequences drafted (cold/warm/referral) | [ ] | `05-outreach-sequences.md` |
| 5 | Discovery script + assessment instrument ready | [ ] | `06-discovery-process.md`, `../delivery/01-` |
| 6 | Qualification scorecard ready | [ ] | `07-qualification-framework.md` |
| 7 | Objection handling cheat-sheet ready | [ ] | `08-objection-handling.md` |
| 8 | Pilot framework + success criteria template ready | [ ] | `09-pilot-framework.md` |
| 9 | Demo environment seeded + a clean CSV→answer demo path rehearsed | [ ] | platform |
| 10 | Calendar link, CRM (even a spreadsheet), email warmed (SPF/DKIM/DMARC) | [ ] | ops |
| 11 | Target list v1: **150–200 named accounts** with named buyers | [ ] | `01-`, `04-` |
| 12 | Honesty-Principle one-pager (Live / Roadmap / Target-state) printed for every call | [ ] | `../delivery/08-` |

> **CRM minimum viable schema:** Account · Buyer name/title · Trigger (see §2.4) · Channel · Status · Last touch · Next action · Qualification score (`07-`) · Data-readiness flag · Notes. A Google Sheet is fine for 90 days. Do not buy a CRM yet.

---

## 2. Target Operating Assumptions (used to size every window)

### 2.1 Who is on the team

For sizing, assume **a founder + at most one part-time helper (SDR-ish or technical SA)**. This is a founder-led motion. If the team is larger, scale outreach counts proportionally but **do not scale discovery calls** — the founder must run all early discovery personally to extract learning.

### 2.2 The ICP shorthand (from `01-`)

- **Company size:** 200–2,000 FTE; finance team of 5–40 (acceptable band 50–5,000 FTE) — per `../delivery/08-` §2.1.
- **Finance maturity:** has a budgeting cycle, monthly close, at least an annual forecast.
- **Data readiness:** can export tabular CSV/Excel (trial balance, budget extract, headcount roster) — this is the gate, because the live ingestion path today is **CSV/Excel upload + Databricks SQL (Delta)**; native connectors are roadmap.
- **Buyers:** CFO, VP Finance, Head of FP&A (economic sponsor); FP&A Manager / Director / Senior FP&A Analyst (operational owner). Adjacent: Controller, VP/Director of Procurement, CIO/VP Eng (cloud spend).

### 2.3 Channels and their role

| Channel | Role in the 90 days | Volume posture |
|---|---|---|
| **Warm intros / founder network** | Primary. Highest conversion. Mine relentlessly. | Quality over quantity; finite. |
| **Operator/investor referrals** | Highest-yield. Ask every call for 1–2 intros. | Compounds weekly. |
| **Cold email (trigger-based)** | Volume top-of-funnel; sharp personalization only. | 15–25/day sustainable solo. |
| **LinkedIn (DM + content)** | Warm-up + reply channel + credibility. | 10–15 connects/day + 2 posts/week. |
| **Communities (CFO/FP&A Slack, Modern Finance, local CFO groups)** | Trust-building, not pitching. | 2–3 high-value contributions/week. |
| **Events / finance meetups** | In-person credibility; rare but high-value. | 1–2 in the quarter if available. |

### 2.4 Buying triggers we hunt for (these multiply reply and conversion rates)

Outreach without a trigger is noise. Every cold touch must name one of these:

| Trigger | Why it opens the door | Where to find it |
|---|---|---|
| **New CFO/VP Finance in seat < 12 months** | New leader wants a fast win + better visibility; budget to make a mark. | LinkedIn job changes, press. |
| **Recent fundraise (Series B–D)** | Board now demands forecast accuracy + reporting rigor. | Crunchbase, PitchBook, news. |
| **ERP/HRIS migration (NetSuite, Workday)** | Data is already in motion; appetite for better analytics. | Job posts, vendor PR, LinkedIn. |
| **Audit finding / restatement** | Acute pain around data trust + governance — our validators story. | Filings, news, network. |
| **Board pressure on forecast accuracy** | Direct hit on FP&A; rolling-forecast (3+9/6+6/9+3) story lands. | Network, earnings calls. |
| **FP&A hiring freeze / can't hire analysts** | "Do more with the team you have" — our analyst-in-software pitch. | Job-post pulls/removals, network. |
| **M&A integration** | Consolidating two finance stacks; messy data; need answers fast. | News, LinkedIn. |
| **New BI tool fatigue (Power BI/Tableau/Looker dashboards nobody trusts)** | "Dashboards, not answers" — our exact wedge. | Discovery, community chatter. |

---

## 3. The 30-Day Plan — Foundation & First Conversations

> **Window theme:** Get the machine running and get into rooms. This is the noisiest, least-converting window by design. We are buying conversations and learning what makes a finance buyer lean in.

### 3.1 Hypotheses under test (Days 1–30)

| # | Hypothesis | How we'll know |
|---|---|---|
| H1 | **There is a nameable, acute pain** our ICP will take a meeting to discuss. | Positive-reply rate hits the bottom of the band (≥1% cold, ≥30% warm). |
| H2 | **Trigger-based messaging beats generic** by a wide margin. | A/B: trigger-named touches reply ≥2× generic. |
| H3 | **The "analyst, not report generator" framing resonates** more than feature lists. | Reply sentiment + first-call energy; which subject lines win. |
| H4 | **Our reachable network is larger than it feels** once systematically mined. | ≥40 warm-path accounts surfaced from contacts. |

> We are explicitly **not** testing pricing or pilot conversion this window. Revenue target is **$0** and that is correct.

### 3.2 Targets — Days 1–30

| Category | Target | Notes / math |
|---|---|---|
| **Target accounts loaded (named buyers)** | **150–200** | Pre-flight #11 carried in. |
| **Cold emails sent** | **300–450** | ~15–20/day × ~22 working days, trigger-personalized. |
| **LinkedIn connection requests** | **200–250** | ~10–12/day; personalized notes. |
| **Warm intros requested** | **25–40** | From founder network + every call. |
| **Community contributions** | **8–12** | 2–3/week; answer real finance questions, no pitching. |
| **LinkedIn posts (founder POV)** | **8** | 2/week; "reporting → decision intelligence" narrative. |
| **Positive replies (all channels)** | **15–30** | Cold ~1–3% of ~500 touches + warm-path replies. |
| **Meetings / intro calls held** | **8–15** | Warm converts at 30–50%; cold trickles in. |
| **Qualified discovery calls** | **3–6** | Meeting→qualified ~40–60%; full discovery may slip to Days 31–60. |
| **Proposals / MOUs sent** | **0–1** | A fast-moving warm lead might get an MOU; not expected. |
| **Design partners signed** | **0–1** | A pre-existing warm relationship could close early. Base case: 0. |
| **Revenue** | **$0** | Intentional. Learning > revenue. |

### 3.3 Weekly activity baseline (Days 1–30)

| Activity | Mon | Tue | Wed | Thu | Fri | Weekly |
|---|---|---|---|---|---|---|
| Cold emails (trigger-personalized) | 18 | 18 | 18 | 18 | 8 | **80** |
| LinkedIn connects + notes | 12 | 12 | 12 | 12 | 6 | **54** |
| Follow-ups on prior touches (per `05-`) | — | 15 | — | 15 | 10 | **40** |
| Warm-intro asks | 2 | — | 2 | — | 2 | **6** |
| Discovery/intro calls | — | hold | hold | hold | — | **2–4** |
| Community + 1 content post | — | — | post | — | engage | **~3** |
| Pipeline review + CRM hygiene (30 min) | ✔ | ✔ | ✔ | ✔ | ✔ | **daily** |
| **Learning log entry (mandatory, end of day)** | ✔ | ✔ | ✔ | ✔ | ✔ | **daily** |

> **The learning log is the most important artifact of Month 1.** One paragraph daily: what was said, what objection surfaced, which message worked, which trigger landed. This becomes the raw material for refining `02-`, `04-`, `05-`, and `08-`.

### 3.4 Week-by-week (Days 1–30)

- **Week 1 — Stand up & first 100 touches.** Finish pre-flight. Send first 70–90 cold touches across two trigger themes (e.g., "new CFO" vs. "post-fundraise forecast pressure"). Launch warm-intro asks to the top 15 network contacts. Publish post #1. Goal: 3–5 replies, 1–3 calls booked.
- **Week 2 — Tune the message.** Read replies. Kill the worse-performing subject line/angle. Double down on the winner. Run first 2–4 calls (mostly warm). Start the objection tally (feeds `08-`). Goal: 5+ replies, 2–4 calls.
- **Week 3 — Volume + first discovery.** Sustain baseline. Convert the best meetings into structured discovery (`06-`). Begin scoring with `07-`. Goal: first 1–2 qualified discoveries.
- **Week 4 — Consolidate & decide.** Pipeline review. Which accounts are real? Which triggers convert? Identify the 5–10 accounts most likely to become design partners. Write the Month-1 learning memo (see §6). Goal: 3–6 qualified discoveries cumulative; bench of named candidates for Month 2.

### 3.5 Exit criteria — Day 30 (success regardless of revenue)

- [ ] ≥ 8 meetings held; ≥ 3 qualified discoveries (per `07-`).
- [ ] A **validated winning message** (subject + angle + trigger) with reply data behind it.
- [ ] ≥ 10 named, scored candidate accounts on the Month-2 bench.
- [ ] H1 confirmed or refuted with evidence (is the pain real and nameable?).
- [ ] Objection tally started; top 3 objections documented (feeds `08-`).

---

## 4. The 60-Day Plan — Discovery, Pilot Design & First MOUs

> **Window theme:** Turn conversations into co-builds. The motion shifts from "who will talk to me" to "whose problem can we actually solve, on their data, and prove it." This is where Palantir-style hands-on engagement starts.

### 4.1 Hypotheses under test (Days 31–60)

| # | Hypothesis | How we'll know |
|---|---|---|
| H5 | **Our discovery (`06-`) reliably surfaces a fundable pain** and a top-questions list. | ≥ 60% of discoveries produce a prioritized decision-question backlog. |
| H6 | **The CSV/Excel→Databricks→cited-answer demo earns belief**, even without native connectors. | Demo-to-next-step rate ≥ 50%; connector objection is "when," not "no." |
| H7 | **Data readiness is the real gate**, not interest. | Track how many qualified buyers can actually export a clean trial balance/budget/headcount file. |
| H8 | **The design-partner exchange (influence + founding pricing for data + feedback + reference) is compelling enough to sign an MOU.** | ≥ 1–2 MOUs signed; objections are about terms, not concept. |
| H9 | **A 30-day "first trusted answer" pilot scope is credible** to a finance buyer. | Buyers accept the pilot success criteria in `09-` without heavy rewriting. |

### 4.2 Targets — Days 31–60

| Category | Target | Notes / math |
|---|---|---|
| **Cold emails sent** | **300–400** | Sustain, but reallocate ~20% effort to nurturing Month-1 pipeline. |
| **LinkedIn connects** | **150–200** | Steady; more content-led now (credibility compounding). |
| **Warm intros requested** | **30–50** | Now also asking *partners-in-discussion* for peer intros. |
| **Meetings / calls held** | **12–20** | Month-1 pipeline maturing + new top-of-funnel. |
| **Qualified discovery calls** | **8–12** | The core work of this window. Founder runs all of them. |
| **Demos delivered** | **6–10** | The CSV→cited-answer demo on near-real or sample data. |
| **Pilot/design-partner candidates identified** | **4–7** | Discovery→candidate ~25–40%. |
| **Proposals / MOUs sent** | **2–4** | Per `../delivery/08-` MOU outline + `09-` pilot scope. |
| **Design partners signed (cumulative)** | **1–3** | First real signatures land here. Base case 1–2. |
| **Pilots kicked off** | **1–2** | 60-min kickoff per `../delivery/08-` §12.2; data plan owned. |
| **Revenue** | **$0 (program fee typically $0; or a nominal/credit-back lever)** | Per `../delivery/06-` design-partner structure; PS fee waived during program. |

### 4.3 Weekly activity baseline (Days 31–60)

| Activity | Weekly target | Note |
|---|---|---|
| Cold emails | **70–90** | Maintained, slightly trimmed for nurture. |
| Follow-up touches (multi-step per `05-`) | **40–60** | Month-1 non-responders + active threads. |
| Warm-intro asks (incl. peer asks from candidates) | **8–12** | Referral engine now spinning. |
| Discovery calls (founder-run) | **2–3** | Deep, scripted (`06-`), scored (`07-`). |
| Demos | **1.5–2.5** | Rehearsed CSV→answer path. |
| Pilot scoping / MOU drafting | **as needed** | 1–2 live at a time. |
| Content posts | **2/week** | Now includes a "what we learned from finance teams" angle. |
| Feedback session (with first signed partner) | **weekly 30 min** | Per `../delivery/08-` §6.1 once a partner is live. |
| Learning log | **daily** | Continue. |

### 4.4 Week-by-week (Days 31–60)

- **Week 5 — Discovery depth.** Run 2–3 structured discoveries; produce top-questions lists. Deliver first 1–2 demos. Identify first 2 design-partner candidates. Start drafting MOU(s).
- **Week 6 — First MOU motion.** Send 1–2 MOUs (`../delivery/08-` §9). Handle terms objections (`08-`). Confirm data readiness (H7) for candidates — request a sample export. Goal: 1 verbal commit.
- **Week 7 — Sign & kick off.** Get first signature. Run the 60-minute kickoff (`../delivery/08-` §12.2): top questions → agents/modules mapping, data plan with due dates, feedback cadence, Day-45/Day-90 reviews booked. Begin data load (CSV/Excel → Databricks).
- **Week 8 — Prove + replicate.** Drive first partner toward first ingested data + first agent answers. Run 2–3 more discoveries to keep the bench full. Mid-program checkpoint prep. Goal: 1–3 partners signed cumulative; ≥1 in active onboarding.

### 4.5 Exit criteria — Day 60 (success regardless of revenue)

- [ ] **1–3 design partners signed** (MOU executed); at least **1 in active onboarding** with data flowing.
- [ ] **≥ 8 qualified discoveries** completed with prioritized decision-question backlogs.
- [ ] Data-readiness reality understood (H7): documented % of qualified buyers who can export clean files.
- [ ] Demo→next-step rate measured; connector objection reframed as "when, not no" (H6).
- [ ] `08-objection-handling.md` updated with real, recurring objections + winning responses.
- [ ] At least one partner reaching toward **time-to-first-trusted-answer ≤ 30 days** (per `../delivery/08-` §7.1).

---

## 5. The 90-Day Plan — First Trusted Answer, Conversion Path & Cohort Lock

> **Window theme:** Prove value on real data and earn the conversion conversation. This is where learning converts into evidence: a logged "trusted answer," a quantified outcome, and a reference. We are not chasing maximum logos; we are proving the model works end-to-end on ≥ 1 partner and building the cohort to its cap.

### 5.1 Hypotheses under test (Days 61–90)

| # | Hypothesis | How we'll know |
|---|---|---|
| H10 | **A real finance team will stake a decision on a Nexora answer** (the whole thesis). | ≥ 1 logged "first trusted answer" event (`../delivery/08-` §7.1). |
| H11 | **The product produces a quantified outcome** a partner will put their name to. | ≥ 1 partner reports cycle-time reduction or caught variance/leakage. |
| H12 | **Design partners will convert to paid** at the Day-90 gate (or clearly signal they will). | ≥ 1 conversion verbal/intent; gate criteria (`../delivery/08-` §10.1) trending green. |
| H13 | **We can name our wedge vs. incumbents** with evidence from real engagements. | Win/loss notes show why we beat Excel / Power BI / Adaptive/Anaplan in the buyer's words. |

### 5.2 Targets — Days 61–90

| Category | Target | Notes / math |
|---|---|---|
| **Cold emails sent** | **250–350** | Begin trimming; more time on delivery + conversion. |
| **LinkedIn connects** | **120–180** | Steady; content now references (anonymized) wins. |
| **Warm intros requested** | **30–50** | Referral engine + first-partner referrals. |
| **Meetings / calls held** | **12–18** | Includes conversion-path conversations. |
| **Qualified discovery calls** | **6–10** | Keep filling the bench toward the cohort cap. |
| **Demos delivered** | **5–8** | Now with a real (anonymized) partner outcome to point to. |
| **Proposals / MOUs sent** | **2–4** | Toward cohort cap of 5–8. |
| **Design partners signed (cumulative)** | **2–4** | Cumulative across 90 days. Stretch: 5. |
| **Pilots active** | **2–4** | Staggered starts (max 2 new/fortnight per `../delivery/08-` §2.4). |
| **First "trusted answer" events logged** | **≥ 1** | The single most important metric of the quarter. |
| **Day-45 checkpoints held** | **per partner** | Conversion preview (`../delivery/08-` §6.1). |
| **Day-90 conversion reviews held** | **≥ 1** | For the earliest-signed partner. |
| **Paid conversions** | **0–1** | Most conversions land Day 90+; an early partner may convert now. |
| **Revenue** | **$0–1 paid land (or first founding-customer commitment)** | Per `../delivery/06-` land pricing; success is the *commitment*, not the cash. |

### 5.3 Weekly activity baseline (Days 61–90)

| Activity | Weekly target | Note |
|---|---|---|
| Cold emails | **60–80** | Trimmed for delivery focus. |
| Follow-ups | **40–50** | Steady. |
| Warm-intro asks | **8–12** | Includes partner referrals. |
| Discovery calls | **1.5–2.5** | Keep bench full to cap. |
| Demos | **1.5–2** | With real outcome reference. |
| **Partner working sessions** | **weekly 30 min / partner** | `../delivery/08-` §6.1 — the delivery heartbeat. |
| **Monthly sponsor reviews** | **45 min / partner** | Outcome check, roadmap voting, NPS. |
| Day-45 / Day-90 reviews | **as scheduled** | Non-optional (`../delivery/08-` §13 notes). |
| Case-study / reference capture | **as outcomes land** | Draft the moment value is proven. |
| Learning log + win/loss notes | **daily / per deal** | Continue. |

### 5.4 Week-by-week (Days 61–90)

- **Week 9 — Drive to first trusted answer.** Intensive on the lead partner: validators tuned, agents answering real top-questions, sponsor running real questions. Hold the Day-45 checkpoint for the earliest partner (conversion preview). Goal: first agent answers the sponsor trusts.
- **Week 10 — Quantify the outcome.** Capture the first measurable win (cycle-time reduction on variance/forecast narrative, or a variance/leakage caught earlier). Start the case-study draft. Sign partner #2/#3 from the bench. Goal: ≥ 1 logged trusted answer; quantified outcome in hand.
- **Week 11 — Conversion conversation.** For the lead partner, run toward the Day-90 conversion review against the gate (`../delivery/08-` §10.1): time-to-first-trusted-answer ≤ 30d, answer trust rate ≥ 70%, modules in active use, sponsor NPS, reference + case study agreed. Preview founding-customer pricing (`../delivery/06-`).
- **Week 12 — Cohort lock & quarter close.** Hold the Day-90 conversion review. Lock cohort progress toward the 5–8 cap. Write the 90-day learning memo (§6) and the refreshed plan for Days 91–180. Goal: 2–4 partners signed; ≥ 1 conversion intent; reference secured.

### 5.5 Exit criteria — Day 90 (the real scoreboard)

- [ ] **2–4 design partners signed** (stretch 5), with **2–4 pilots active**.
- [ ] **≥ 1 logged "first trusted answer"** — a finance leader staked a real decision on a cited Nexora answer (this is the PMF signal we came for).
- [ ] **≥ 1 quantified outcome** a partner will be referenced on (cycle-time saved / variance caught / spend leakage surfaced).
- [ ] **≥ 1 Day-90 conversion review held**; conversion gate criteria trending toward green (`../delivery/08-` §10.1).
- [ ] **≥ 1 reference + case study** committed (per MOU).
- [ ] **Validated wedge narrative** vs. Excel / Power BI-Tableau-Looker / Adaptive-Anaplan-Pigment, in buyers' own words (win/loss).
- [ ] Refreshed connector demand ranking from real partner ERPs (feeds product roadmap).
- [ ] Revenue: **$0–1 paid land** — and we treat the *first founding-customer commitment* as the win, not the invoice.

---

## 6. Learning-Over-Revenue Operating Discipline

The single failure mode of this plan is letting revenue anxiety override learning. Guardrails:

| Discipline | Rule |
|---|---|
| **Hypotheses are the scoreboard** | Each window opens by stating its hypotheses (§3.1, §4.1, §5.1) and closes by confirming/refuting them with evidence. A window where revenue was $0 but H1–H13 were answered is a **successful** window. |
| **The learning log is non-negotiable** | Daily entry. Weekly synthesis. Monthly memo. It is the asset that improves `02-/04-/05-/08-` and de-risks pricing for GA. |
| **Founder runs all discovery** | Early learning cannot be delegated. The founder hears the objections, the language, the pain — raw. |
| **No template reports, ever** | We are validating the *answer* flow, not a report generator. If we catch ourselves hand-building a deck for a partner, we've drifted off-canon (per `../delivery/06-` §8 positioning guardrail). |
| **Honesty Principle on every artifact** | Every external touch passes the Live / Roadmap / Target-state test. One over-claimed connector erodes the trust the whole motion is built to earn. |
| **Cohort cap is sacred** | Do not exceed 5–8 partners to chase logos. An overloaded founder produces bad feedback and bad delivery — which poisons the validation. |

### 6.1 Monthly learning memo template

```text
NEXORA GTM — MONTH [N] LEARNING MEMO ([DATE_RANGE])

1. HYPOTHESES STATUS
   - [H#]: CONFIRMED / REFUTED / INCONCLUSIVE — evidence: [____]

2. FUNNEL ACTUALS vs PLAN
   - Touches: [actual]/[plan]  Replies: [__]  Meetings: [__]
   - Discoveries: [__]  Candidates: [__]  Signed: [__]  Trusted answers: [__]

3. WHAT WORKED (messages, triggers, angles)            → fold into 04/05
4. WHAT DIDN'T (dead channels, weak angles)            → cut
5. TOP OBJECTIONS (ranked) + best responses            → fold into 08
6. ICP REALITY CHECK (who actually engaged/qualified)  → adjust 01/02
7. PRODUCT/DELIVERY FEEDBACK (connectors, agents, validators) → product roadmap
8. DATA-READINESS REALITY (who could export clean files)
9. NEXT MONTH: targets, focus shifts, 3 priorities
```

---

## 7. 90-Day Scoreboard (single-page roll-up)

| Metric | Day 30 | Day 60 | Day 90 | Cumulative goal |
|---|---|---|---|---|
| Cold emails | 300–450 | 600–850 | 850–1,200 | ~1k touches |
| LinkedIn connects | 200–250 | 350–450 | 470–630 | ~500 |
| Warm intros requested | 25–40 | 55–90 | 85–140 | ~100 |
| Meetings held | 8–15 | 20–35 | 32–53 | ~35–50 |
| Qualified discoveries | 3–6 | 11–18 | 17–28 | ~20 |
| Demos | 0–2 | 6–12 | 11–20 | ~15 |
| Proposals / MOUs sent | 0–1 | 2–5 | 4–9 | ~5–8 |
| **Design partners signed** | **0–1** | **1–3** | **2–4 (stretch 5)** | **cohort toward cap** |
| Pilots active | 0–1 | 1–2 | 2–4 | — |
| **First trusted answers logged** | 0 | 0–1 | **≥ 1** | **≥ 1 (the PMF signal)** |
| Paid conversions | 0 | 0 | 0–1 | first land |
| **Revenue** | **$0** | **$0** | **$0–1 land** | learning > revenue |

> **Read this table correctly.** The bolded rows are the ones that matter. Everything above them is *activity that buys* the bolded *learning*. A quarter that ends with **2–4 committed co-builders and one finance leader who trusts a cited answer enough to act on it** is a winning quarter — even at $0 booked. That is the entire point of a design-partner motion modeled on Databricks, Scale AI, and Palantir.

---

## 8. Risks & Mitigations (first 90 days)

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Cold reply rates at the floor (1%)** | High | Lean harder on warm/referral (30–60%); sharpen triggers; the plan already assumes low cold yield. |
| **Data-readiness blocks qualified buyers** | High | Qualify on export-ability early (§4.1 H7); offer a hands-on extract working session (Palantir FDE move). |
| **Connector objection ("we need NetSuite live")** | High | Honesty Principle + roadmap-influence framing; CSV path proves value now; partner sets build order (`08-`). |
| **Founder time crushed by delivery once partners sign** | Medium-High | Cohort cap + staggered starts (max 2/fortnight); trim outreach in Days 61–90 as delivery ramps. |
| **AI-on-finance-data fear** | Medium | Guardrails story (never fabricate, cite every claim, flag low-confidence); pen-test pending disclosed honestly. |
| **No trusted-answer event by Day 90** | Medium | Concentrate effort on the single best partner in Weeks 9–11; better one deep win than three shallow pilots. |
| **Chasing logos past the cap** | Medium | Cap is sacred (§6); over-signing poisons feedback quality. |

---

## 9. Cross-Document Map

| For… | See |
|---|---|
| Who we target (bands, segments, ERPs) | `01-ideal-customer-profile.md` |
| Buyer titles + messaging angles | `02-buyer-personas.md` |
| What a design partner is + the exchange | `03-design-partner-program.md` / `../delivery/08-design-partner-program.md` |
| Channel strategy + targeting | `04-outreach-strategy.md` |
| Ready-to-send sequences | `05-outreach-sequences.md` |
| Discovery script + assessment | `06-discovery-process.md` / `../delivery/01-financial-intelligence-assessment-framework.md` |
| Qualification scorecard | `07-qualification-framework.md` |
| Objection responses | `08-objection-handling.md` |
| Pilot scope + success criteria | `09-pilot-framework.md` |
| Founding-customer pricing + design-partner structure | `../delivery/06-pricing-framework.md` §13.5 |
| Shortest path to first paying customer | `11-shortest-path-to-first-customer.md` |
| "Ready for Design Partners" certification | `../docs/commercial-readiness/CERTIFICATION.md` |

---

*End of File 10 — First 90 Days. This is a living operating doc; refresh the targets and hypotheses at each window's exit review (§3.5, §4.5, §5.5) and roll forward into the Days 91–180 plan.*
