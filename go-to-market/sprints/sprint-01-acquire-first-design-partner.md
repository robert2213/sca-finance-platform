# Sprint 01 — Acquire the First Design Partner (Days 1–30)

**The first execution sprint of the Design Partner Acquisition System.**
**Company:** Sin City Analytics · **Product:** Finance Intelligence Platform (codename **Nexora**) — behaves like a finance analyst, not a report generator.

> This is not a new strategy. It is the **execution overlay** that fires the GTM operating system (`../README.md`, docs `01`–`11`) for 30 days, pointed at one outcome: **put the first design partner into motion.** Everything below is sourced from the existing operating docs and compressed into a run sheet a solo founder can execute starting Monday. Where this sprint sets a number, it inherits it from the operating system; where it makes a tactical choice (boolean strings, filter configs, daily counts), it is the executable detail the operating docs deliberately left to the sprint.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | Sprint 01 — Acquire the First Design Partner |
| **Type** | Execution sprint (rides over the funnel; see `../10-first-90-days.md` §3 and `../11-shortest-path-to-first-customer.md`) |
| **Version** | 1.0 |
| **Owner** | Founder (solo-led; at most one part-time helper) |
| **Window** | Days 1–30 (Phase 1 — "Ignite" per `../04-outreach-strategy.md` §8.2) |
| **Prepared** | 2026-06-13 |
| **Status** | Active — ready to execute |
| **Certification basis** | `../../docs/commercial-readiness/CERTIFICATION.md` — "Ready for Design Partners" (code + build certified; full commercial security rating pending a live penetration test) |
| **Companion files** | [`sprint-01-target-list-template.csv`](sprint-01-target-list-template.csv) · [`sprint-01-kpi-dashboard-template.csv`](sprint-01-kpi-dashboard-template.csv) |

---

## 0. How to Read This Sprint

### 0.1 The objective, in one sentence

**Source against the three beachhead markets, run a warm-first multi-threaded outreach engine, and convert founder-led discovery into the first design-partner MOU — optimizing for learning, not revenue.**

### 0.2 What 30 days honestly produces (read this before you judge the sprint)

The campaign goal is "first design partner." The **honest 30-day output is the funnel that lands that partner** — most signatures land in Days 31–60 (`../10-first-90-days.md` §4). A Day-30 that ends with **0–1 signed and 1–2 MOUs in motion** is a *winning* sprint. We instrument the leading indicators, not the lagging one.

| Day-30 metric | Target | Type | Source |
|---|---|---|---|
| Named, scored target accounts loaded | **100** (this sprint's list) | Leading | `../10-` §1 (#11), `../06-` §0.2 |
| Positive replies (all channels) | **15–30** | Leading | `../10-` §3.2 |
| Meetings / intro calls held | **8–15** | Leading | `../10-` §3.2 |
| **Qualified discovery calls (scorecard ≥ 32)** | **3–6** | **Leading (the one that matters)** | `../10-` §3.2, `../06-` §9 |
| Design-partner candidates on the bench | **≥ 5 scored** | Leading | `../07-` §4 |
| MOUs in motion | **1–2** | Bridge | `../10-` §3.2 |
| **Design partners signed** | **0–1** (base case 0) | Lagging | `../10-` §3.2 |
| **Revenue** | **$0 — intentional** | — | `../10-` §3.1 |

> **The single most important number this sprint is `3–6 qualified discovery calls`** — because qualified discoveries are what convert to MOUs in Days 31–60. If this sprint produces them, it succeeded even at $0 and zero signatures.

### 0.3 The constraints are features, not limits

| Constraint | How this sprint honors it |
|---|---|
| **Founder-led sales** | Founder runs *all* discovery personally (learning can't be delegated — `../10-` §6). A part-time helper may only build lists / schedule. |
| **No paid advertising** | Zero spend on ads. The engine is Referral + Network + LinkedIn + light Email + Community (`../04-` §8). |
| **No SDRs** | No outsourced prospecting. Touches are founder-personalized; volume is capped at what one human can do with quality. |
| **No marketing team** | No campaigns, no nurture automation beyond a calendar + a spreadsheet CRM. Content = the founder's own POV posts. |
| **Learning over revenue** | Hypotheses are the scoreboard (`../10-` §6); the daily learning log is mandatory; $0 is the correct revenue target. |

### 0.4 The honesty boundary (non-negotiable, every touch)

Three-state discipline from `../05-` §0.4 and the program charter. **Live today:** CSV/Excel ingestion + Databricks SQL (Delta); the guardrailed finance agents (CFO Advisor, FP&A Specialist, Procurement Advisor, Workforce Finance, External Labor Advisor, CIO Finance Partner, Finance Business Partner, Data Quality Advisor); the 8 validators; `ClientConfig` tenancy; RBAC (7 roles); Clerk auth. **Roadmap (influenceable):** native QuickBooks / NetSuite / Workday HCM / Beeline-Fieldglass / Coupa / Workday Adaptive connectors — partners *vote* the build order. **Target-state (never present-tense):** completed pen test / full commercial rating. One over-claimed connector detonates the trust the whole motion is built to earn.

---

## 1. Top 3 Recommended Beachhead Markets

Drawn from the three Tier-1 sub-segments in `../01-ideal-customer-profile.md` §2.2, ranked here by **beachhead logic** for a no-brand founder chasing the *first* partner: (a) reachability via the founder's warm network, (b) differentiation that wins *without* brand, (c) data-readiness for fast proof, and (d) reference/flywheel value of the first logo.

| # | Beachhead | ICP ref | Profile | Why it wins as a *first* beachhead | The wedge it maximizes | Watch-out (confirm in discovery) |
|---|---|---|---|---|---|---|
| **1** | **B2B SaaS / software** | 1A | $50M–$150M ARR, 300–1,000 FTE, Series B–C / growth-equity backed, NetSuite + Snowflake/Databricks, 6–15-person analyst-bottlenecked FP&A | The canonical Tier 1: finance-literate, data-native, board-driven forecast rigor, AI-curious, **CFO is the whole buying committee**. Highest data-readiness → fastest time-to-first-trusted-answer. The cleanest reference logo. | **Founder credibility + speed-to-proof** — these buyers reward domain depth and convert on a fast, cited answer. | A strong FP&A analyst may feel threatened — recruit them as the operational champion early (`../02-` §5.7). |
| **2** | **PE-backed multi-entity / roll-ups** | 1B | $80M–$300M, services / healthcare services / light manufacturing, multi-entity consolidation, CFO under monthly sponsor pressure | **The urgency + flywheel beachhead.** The buying trigger (sponsor reporting mandate / the acquisition itself) is the most *dated* and acute. Land one and the **PE sponsor introduces you to the rest of the portfolio** — the referral multiplier the system prizes (`../04-` §4.1). | **Urgency + referral flywheel** — a compelling event compresses the cycle; one sponsor unlocks many warm intros. | Multi-entity consolidation is a data-readiness trap — confirm clean *per-entity* exports before committing a pilot (`../06-` §5). |
| **3** | **Tech-enabled / professional services, agencies, MSPs** | 1C | 300–1,500 FTE, heavy external labor / SOW contractor spend, project-based variance pain | **The differentiation beachhead.** Heavy contractor/SOW spend is a capability **almost no FP&A competitor handles natively** (External Labor Advisor). Strongest product moat → easiest to win without brand. | **Product differentiation** — "what are we spending on contractors this quarter, against what budget?" is a question no incumbent answers. | Their data may live in a PSA tool (Kantata, OpenAir) — confirm exportability to CSV early (`../01-` §2.2, 1C). |

**Beachhead operating rule:** run all three in parallel but **weight sourcing 45 / 30 / 25** (SaaS / PE-backed / services) — see §3. A single hard buying trigger (new CFO <12 mo, post-fundraise board mandate, active ERP/HRIS migration) promotes any account to the top of the queue regardless of beachhead (`../01-` §7 override rule).

**Explicitly out of scope this sprint** (route to nurture, do not spend founder hours): enterprise >$1B / 5,000+ FTE; pre-revenue / <$25M with no finance function; happy fully-bought-in Anaplan/Adaptive shops (N9); anti-AI-on-financials policies (N1); security-absolutists demanding completed SOC 2 + pen test now (N5). Full negative ICP: `../01-` §5.

---

## 2. Exact Prospect Criteria

The 5-minute qualify-or-skip filter. An account must clear **all account-level must-haves** and have a **named buyer** and **at least one trigger** to earn a slot on the 100-list. Inherited from `../01-` §2.1 / §7 and `../07-` (the formal 0–100 gate).

### 2.1 Account-level — MUST have (all required)

| Criterion | Bar | Why |
|---|---|---|
| **Revenue** | $30M–$300M (sweet spot $50M–$150M) | Real finance function + CFO-signature budget, light procurement |
| **Employees** | 200–2,000 FTE | Below 200 = pain not institutionalized; above 2,000 = committee buying slows the pilot |
| **Finance team** | 6–25, **analyst-bottlenecked** FP&A (1–3 analysts serving the whole exec team) | The highest-converting org shape — we relieve a named, painful constraint |
| **ERP they can export from** | NetSuite, QuickBooks Online, or Sage Intacct | Clean export path to the data model (the live ingestion gate) |
| **Data readiness** | Can export a trial balance + budget extract + headcount roster as CSV/Excel | **The hard gate.** No tabular export = no demonstrable outcome = auto-DQ (`../07-` DQ-2) |
| **Named executive sponsor reachable** | A CFO / VP Finance / Head of FP&A (not only an IC) | No sponsor, no partnership (`../07-` DQ-1) |

### 2.2 Account-level — STRONG positives (prioritize)

- Data platform = **Databricks or Snowflake** (credibility match, eases the technical-validator conversation)
- HRIS = Workday HCM / Rippling / BambooHR (feeds workforce/headcount module)
- Reporting today = **Excel/Sheets + ad-hoc Power BI/Tableau** (the real incumbent we replace, not a fortified competitor)
- A **stalled or remorseful** Anaplan/Adaptive/Pigment/Vena deployment (Tier-2 trigger; positive *only with remorse*)
- VMS = Beeline/Fieldglass or Procurement = Coupa (for the beachhead-3 external-labor wedge)

### 2.3 Buyer-level — who goes on the list (default entry point)

| Layer | Titles | Role on the list |
|---|---|---|
| **Primary target (champion)** | VP/Director/Head of FP&A, FP&A Manager, Senior FP&A | **Default LinkedIn/email target** — highest reply + pain resonance (`../02-` §1.2, `../04-` §2.1) |
| **Economic buyer** | CFO, VP Finance, Head of Finance (no-CFO orgs) | Reach warm-first; champion sells up to them |
| **Technical validator** | Controller, Head of Data/Analytics Eng | Side-door if FP&A is unresponsive; security/data conversation later |

### 2.4 Trigger overlay — every account needs ≥ 1 (the highest-yield signal)

From `../05-` §0.5 / `../04-` §7. **No trigger named → not on the list, move to nurture.**

`New CFO/VP Finance/Head of FP&A in seat <12 months` (highest yield) · `Fundraise (Series B+ / growth)` · `ERP/HRIS migration (NetSuite, Workday)` · `Audit / restatement / material weakness` · `Board pressure on forecast accuracy` · `FP&A hiring freeze / pulled req` · `M&A integration` · `Public "AI in finance" commitment` · `Contractor/SOW or cloud spend scrutiny` (beachhead 3)

### 2.5 Instant auto-DQ (any one = off the list, regardless of fit) — `../07-` §5

`No tabular data export` · `No executive sponsor with mandate/path to budget` · `Categorically prohibits AI on financial data` · `Hard-mandates completed SOC 2 + pen test before any SaaS, no exception` · `Demands a custom fork / bespoke build` · `Free-forever with no path to paid + no strategic value` · `Wrong size / no finance function` · `Refuses any reference, ever`

### 2.6 The one-line perfect partner (top of the call list) — `../01-` §8

> *A $50M–$150M-revenue, 300–1,000-FTE B2B SaaS company, 6–15-person analyst-bottlenecked FP&A on NetSuite + Snowflake/Databricks, CFO arrived <12 months ago (post-Series-B/C) under board pressure to fix forecast accuracy, burns ~3 days/month hand-building the variance-and-board narrative in Excel, AI-curious, can export clean CSV tomorrow, will personally use Nexora and put their name on a reference.*

---

## 3. 100-Company Target List — Generation Strategy

**Goal:** by end of **Week 1**, a CRM (the companion CSV / a Google Sheet) of **100 named accounts**, each with a named buyer, ≥1 trigger, a tagged beachhead, a channel plan, and a warm-path flag. This is the fuel for all 30 days. Use [`sprint-01-target-list-template.csv`](sprint-01-target-list-template.csv).

### 3.1 Allocation

| Beachhead | Count | Of which warm-reachable (target) |
|---|---|---|
| 1 — B2B SaaS | **45** | ≥ 15 |
| 2 — PE-backed multi-entity | **30** | ≥ 12 (via PE-firm intros) |
| 3 — Tech-enabled services | **25** | ≥ 8 |
| **Total** | **100** | **≥ 35 warm-reachable** |

> **Why a warm overlay matters:** cold → positive reply is 1–5%; warm intro → meeting is 30–50% (`../04-` §1.3). The list is built so the founder *exhausts the warm path into each account before any cold touch* (`../04-` §8.2 principle 1).

### 3.2 Source playbook (no paid tools beyond LinkedIn Sales Navigator ~$99/mo, which pays for itself)

| Source | What it yields | Beachhead | How |
|---|---|---|---|
| **Founder's own network (first-degree)** | Warm accounts + buyers | All | Export LinkedIn connections; tag every finance-ICP contact. **Do this first — Day 1.** |
| **LinkedIn Sales Navigator** (§5) | The bulk of cold + 2nd-degree | All | Saved searches per beachhead + trigger alerts |
| **Free LinkedIn boolean** (§4) | Buyers + warm 2nd-degree paths | All | When Sales Nav quota is tight; engagement-first targets |
| **Crunchbase / PitchBook / funding news** | Fundraise + new-CFO triggers | 1, 2 | Filter Series B–C, last 12 mo, in revenue band |
| **PE firm portfolio pages** | Multi-entity roll-ups + the *sponsor* as connector | 2 | Pick 4–6 mid-market PE firms; list portfolio cos in band; find the operating-partner / portfolio-CFO connector |
| **NetSuite / Sage Intacct customer & partner directories** | ERP-confirmed (export-ready) accounts | All | Confirms the data-readiness gate up front |
| **Job boards (FP&A / finance-systems reqs)** | "Hiring FP&A" + "migration" triggers | All | A live FP&A req = capacity pain; a pulled req = freeze trigger |
| **PSA tool communities / agency networks** | External-labor-heavy services | 3 | Confirm SOW/contractor spend pain |
| **Finance/FP&A communities** (`../04-` §6) | Trigger-rich, peer-trusted buyers | All | Contribute first; harvest names, never pitch in-thread |

### 3.3 Build sequence (Week 1)

1. **Day 1 — Warm core first.** Mine first-degree network → every finance-ICP contact and dormant relationship. Tag beachhead + trigger. (This seeds the highest-conversion channel.)
2. **Day 1–2 — PE connectors.** Pick the PE firms; map portfolio cos + the operating-partner intro path (one intro → many accounts).
3. **Day 2–3 — Sales Navigator saved searches** (§5) per beachhead; pull to the band + trigger filters; dedupe against warm core.
4. **Day 3–4 — Trigger enrichment.** For each account, confirm/append a real trigger from funding news, job changes, migration signals. **Drop any account with no trigger.**
5. **Day 4–5 — Buyer + channel plan.** For each: name the champion + economic buyer; set the channel (warm → referral → LinkedIn → email); flag data-readiness hypothesis.
6. **Ongoing — replenish.** Every discovery call ends with "who are 1–2 peers I should talk to?" (`../04-` §8.2 principle 4). Keep the list ≥ 100 as accounts convert or drop.

### 3.4 CRM minimum schema (one row per account) — `../10-` §1

`Account · Beachhead · Buyer name/title · Economic buyer · Trigger · Trigger date · Channel · Warm path (who) · Status · Last touch · Next action · Next action date · ICP score (/21) · Data-readiness flag · Discovery score (/50) · Notes`

---

## 4. LinkedIn Search Queries

Two modes: **free-search boolean** (keyword box, works on the regular LinkedIn People search) and **Sales Navigator** (§5). Boolean operators: `AND` `OR` `NOT`, quotes for phrases, parentheses to group. Keep title-ORs grouped.

### 4.1 Buyer-title boolean (paste into the People-search keyword box, then apply filters)

**Champion (primary target — run this most):**
```
("VP FP&A" OR "VP of FP&A" OR "Head of FP&A" OR "Director of FP&A" OR "FP&A Director" OR "FP&A Manager" OR "Senior FP&A" OR "Financial Planning and Analysis")
```

**Economic buyer:**
```
("Chief Financial Officer" OR CFO OR "VP Finance" OR "VP of Finance" OR "Head of Finance" OR "Vice President Finance")
```

**Technical validator / data-truth gatekeeper (side-door):**
```
(Controller OR "Corporate Controller" OR "VP Accounting" OR "Head of Data" OR "Director of Analytics" OR "Finance Systems")
```

**Apply these filters alongside the boolean (free search):** Connections = **2nd** (warm-up paths first), then 3rd+ · Locations = your supportable timezones · keep an eye on *Current company* size via the company page (free search can't filter headcount precisely — that's why Sales Nav is worth it).

### 4.2 Trigger-flavored boolean (free search, run weekly)

**New-CFO trigger (highest yield):**
```
("CFO" OR "Chief Financial Officer" OR "VP Finance") AND ("recently joined" OR "excited to announce" OR "new role" OR "joined as")
```
*(Then sort People by "recently posted" and check the "started a new position" badge.)*

**Post-fundraise / board-pressure flavor (combine with a Crunchbase list of recent raisers):**
```
("FP&A" OR "VP Finance" OR "CFO") AND ("Series B" OR "Series C" OR "forecast accuracy" OR "board reporting")
```

**ERP/HRIS migration flavor:**
```
("FP&A" OR "Controller" OR "Finance Systems" OR "VP Finance") AND ("NetSuite implementation" OR "Workday implementation" OR "ERP migration" OR "system migration")
```

**Beachhead-3 external-labor flavor:**
```
("VP Finance" OR "FP&A" OR "Director of Finance") AND ("professional services" OR "managed services" OR "agency" OR "SOW" OR "contingent workforce" OR "contractor spend")
```

### 4.3 The engagement-first protocol (the no-brand founder's edge) — `../04-` §2.2

Before DMing a cold champion, spend **2–4 weeks** commenting substantively on their posts and on FP&A thought-leaders' posts. This converts cold → warm and lifts DM positive-reply from ~5–15% to ~15–30%. **Start this in Week 1 on the top-20 cold targets** so the warm-up is paying off by Weeks 3–4. Do **not** pitch in a comment or in the connection request.

---

## 5. Sales Navigator Filters

Build **one saved search per beachhead** (so trigger alerts fire automatically), plus an account-level search for the PE/migration motion. Sales Nav is the only paid tool sanctioned here (≈$99/mo; not "advertising").

### 5.1 Shared Lead-filter base (apply to all three)

| Filter | Setting |
|---|---|
| **Function** | Finance |
| **Seniority level** | Director, VP, CXO, Owner |
| **Job title** | (include) `FP&A`, `Financial Planning`, `VP Finance`, `Head of Finance`, `CFO`, `Controller` |
| **Geography** | Your supportable / in-timezone regions |
| **Company headcount** | **201–500, 501–1,000, 1,001–5,000** (brackets covering 200–2,000) |
| **Changed jobs in past 90 days** | ✅ ON (surfaces the new-CFO/new-FP&A trigger) |
| **Posted on LinkedIn in past 30 days** | ✅ ON (warm engagement-first target + AI-in-finance signal) |

### 5.2 Per-beachhead overlays

**Beachhead 1 — B2B SaaS:**
- Industry = `Software Development`, `IT Services and IT Consulting`, `Technology, Information and Internet`
- Account overlay (Account search): Headcount growth ↑, recent funding events; Company headcount 200–2,000
- Tip: cross-reference a Crunchbase Series B–C list for the fundraise trigger

**Beachhead 2 — PE-backed multi-entity:**
- Industry = `Hospital & Health Care`, `Manufacturing`, `Consumer Services`, `Professional Services`
- Use **Account search → filter by "Connections of" / your PE-firm connectors**, or list the PE firm's portfolio as accounts and run leads within them
- Keyword: `multi-entity`, `consolidation`, `roll-up`, `portfolio company`

**Beachhead 3 — Tech-enabled services / agencies / MSPs:**
- Industry = `Professional Services`, `IT Services and IT Consulting`, `Advertising Services`, `Staffing and Recruiting`, `Business Consulting and Services`
- Keyword (title/company): `agency`, `managed services`, `MSP`, `professional services`, `SOW`, `contingent`

### 5.3 Operating discipline

- **Save each search** → Sales Nav emails you new matches (free trigger detection).
- **Use Account-level alerts** for "senior leadership changes," "funding," and "news mentions" on your 100-list accounts.
- **Stay under platform limits:** ~15–25 connection requests/day; treat it as a craft channel, not a volume machine (`../04-` §2.4). Spread requests across the day; personalize every note.

---

## 6. Outreach Workflow

The engine is **warm-first, multi-threaded, trigger-timed** (`../04-` §8). Sequences are the literal copy in `../05-` (Sequences A–F). The outreach job is done the moment a conversation is booked — **never sell the platform in the thread** (`../05-` §8.2).

### 6.1 Channel priority (Ignite-phase mix — `../04-` §8.2)

| Priority | Channel | Sprint-1 effort | Sequence (`../05-`) |
|---|---|---|---|
| 1 | **Referral** (double opt-in intros) | 30% | D — Referral Introduction |
| 2 | **Network** (direct + dormant + content) | 35% | E — Former Colleague; B — Warm LinkedIn |
| 3 | **LinkedIn** (engagement-first → connect → DM) | 20% | A — Cold LinkedIn |
| 4 | **Community** (contribute, don't pitch) | 10% | — (DM after rapport) |
| 5 | **Email** (warmed domain, trigger-only) | 5% | C — Email; F — Executive |

> **Email is light in Sprint 1 by design.** Weeks 1–2 are domain warm-up (SPF/DKIM/DMARC, low human volume); heavy cold-email sequences are a Phase-2 (Days 31–60) lever (`../04-` §3.4, §8.2). Don't blast a cold domain in week 1 — deliverability will sink you.

### 6.2 The per-account workflow (multi-thread the trigger)

```text
Account enters list (trigger tagged)
        │
        ▼
Is there a WARM path?  ──yes──▶  Referral (Seq D) or Network/Former-colleague (Seq B/E)
        │ no                              │
        ▼                                 │
Engagement-first on LinkedIn (2–4 wks)    │
        │                                 │
        ▼                                 ▼
Connect + note (Seq A, M1) ───────▶  POSITIVE REPLY  ◀─── (warm intro lands a reply faster)
        │                                 │
        ▼                                 ▼
DM after accept (Seq A, M2/M3)     Qualify vs §2 in the thread (title? band? trigger? pain?)
        │                                 │
   (no reply → nurture,                   ▼
    re-approach next trigger)     Book founder discovery call (DC-1)  ──▶  §9 scorecard
```

**Multi-thread rule:** a trigger-tagged ICP account gets hit on **2–3 channels in coordination** (a LinkedIn touch + an email + a referral path), not one (`../04-` §8.2 principle 2). Always run the warm path *before* the cold one into the same account.

### 6.3 The reply → discovery decision (qualify fast before booking — `../04-` §2.5)

Book the call only if: title is a real finance owner · company in the ICP band · a plausible trigger present · expressed *problem* resonance (not just politeness) · willing to take 30 min within ~2 weeks. "Send me info" is a **soft** signal — answer with one qualifying question + a 2-min Loom and see if they engage (`../04-` §3.5).

### 6.4 Cadence hygiene (`../05-` §8.1)

One trigger, one prospect, one message. Stop cleanly after Message 3 — no "just bumping this." Shift non-responders to social engagement; re-approach only on a fresh, material trigger (≥ ~60 days). Sign as the founder, by name. Keep cold messages < ~75 words, email < ~120.

---

## 7. Daily Activity Targets

The solo-founder daily minimum that produces 2–4 discovery calls/week (`../04-` §8.3, `../10-` §3.3), tuned warm-first for the Ignite phase. **Time-box outreach to ~2–3 focused hours/day**; protect the rest for discovery + delivery prep + the learning log.

### 7.1 Daily scorecard (Mon–Fri)

| Activity | Daily target | Notes |
|---|---|---|
| **Warm-intro / network asks** | **2–3** | Front-loaded Weeks 1–2 (finite, highest-yield); specific, named, double-opt-in |
| **LinkedIn connection requests** (+ note) | **15–20** | Trigger-personalized; 2nd-degree first |
| **LinkedIn substantive comments** (engagement-first) | **10–15** | On target buyers' + FP&A thought-leaders' posts; **no pitching** |
| **LinkedIn DMs** (to accepted / warmed) | **5–10** | Seq A M2/M3, Seq B |
| **Cold emails** (trigger-targeted) | **0** wks 1–2 → **10–20** wks 3–4 | Only after domain warm-up; trigger-only |
| **Follow-ups on prior touches** | **10–15** | Per the `../05-` cadences |
| **Community contribution** | **≈1** | Answer a real finance question with substance |
| **Discovery / intro calls** | **hold 2–3 slots/day** | Founder-run; fill as booked |
| **CRM hygiene** (15–30 min) | **✔ daily** | Status, next action, next-action date |
| **Learning-log entry** (end of day) | **✔ daily — mandatory** | The most important artifact of Month 1 (`../10-` §3.3) |

### 7.2 Weekly rollup (the math that yields the funnel) — `../04-` §8.3

| Activity | Weekly target |
|---|---|
| Referral asks | 5–10 |
| Network touches (direct + reactivation) | 5–10 (front-loaded) |
| LinkedIn connection requests | 15–25 |
| LinkedIn comments / engagement | 10–20 |
| LinkedIn DMs | 10–20 |
| Cold emails (Weeks 3–4) | 0 → 50–100 cumulative |
| Community contributions | 3–5 |
| Owned content posts (founder POV) | **2** |
| **→ Resulting discovery calls** | **2–4 / week** |

### 7.3 Two-line daily standup (with yourself)

> *Yesterday: [calls held / replies / what a buyer actually said]. Today: [the 3 highest-leverage touches + any discovery]. Blocker: [one thing]. Learning-log written: Y.*

---

## 8. Weekly KPI Dashboard

Run a **30-minute weekly review** (Friday). Manage to **discovery-calls-booked**, not touches-sent (`../04-` §9). Track in [`sprint-01-kpi-dashboard-template.csv`](sprint-01-kpi-dashboard-template.csv).

### 8.1 The dashboard (one row per week)

| Metric | Type | Wk1 | Wk2 | Wk3 | Wk4 | 30-day target |
|---|---|---|---|---|---|---|
| Accounts loaded (cumulative) | Activity | | | | | 100 |
| Warm-intro asks | Activity | | | | | 25–40 |
| LinkedIn connects | Activity | | | | | 200–250 |
| LinkedIn comments | Activity | | | | | 40–80 |
| Cold emails (Wk3–4) | Activity | | | | | 50–100 |
| Content posts | Activity | | | | | 8 |
| **Positive replies (all channels)** | **Leading** | | | | | **15–30** |
| **Meetings / intro calls held** | **Leading** | | | | | **8–15** |
| **Qualified discoveries (scorecard ≥ 32)** | **★ Leading** | | | | | **3–6** |
| Candidates scored (`../07-`) on bench | Leading | | | | | ≥ 5 |
| MOUs in motion | Bridge | | | | | 1–2 |
| Design partners signed | Lagging | | | | | 0–1 |
| Revenue | Lagging | | | | | $0 |

### 8.2 Channel-health table (the early truth-teller — `../04-` §9.1)

Per channel, track: **touches · positive-reply % · discoveries booked · source-of-opportunity tag · trigger present (Y/N)**. If a channel's positive-reply rate sits **below the low end of its band after ~30 touches**, fix the *message/targeting* before abandoning the channel — most early failures are relevance failures, not channel failures.

| Channel | Positive-reply band (`../04-`/`../05-`) |
|---|---|
| Referral (double opt-in) | 30–50% |
| Former colleague | 30–60% |
| Warm LinkedIn | 15–30% |
| Executive (founder→CFO) | 5–12% |
| Cold LinkedIn | 1–5% |
| Cold email | 1–5% |

### 8.3 Hypotheses scoreboard (the real Month-1 scoreboard — `../10-` §3.1)

A window where revenue was $0 but these were answered with evidence is a **successful** window.

| # | Hypothesis | Status by Day 30 | Evidence |
|---|---|---|---|
| H1 | There is a nameable, acute pain our ICP will take a meeting to discuss | | |
| H2 | Trigger-based messaging beats generic (≥2× reply) | | |
| H3 | "Analyst, not report generator" framing resonates more than feature lists | | |
| H4 | Our reachable network is larger than it feels (≥40 warm-path accounts surfaced) | | |

### 8.4 Red-flag thresholds (act, don't wait)

- **< 2 discoveries booked by end of Week 2** → you're over-indexing on cold. Pour the next week into warm/referral; sharpen triggers.
- **Positive-reply < 1% cold after 40 sends** → targeting/trigger problem, not copy. Fix upstream (`../01-`/`../04-`).
- **Discoveries happening but none qualify (≥32)** → list quality or data-readiness gate is the issue; re-tighten §2 criteria.
- **No learning-log entries for 2+ days** → the single discipline most likely to slip; this is the canary.

---

## 9. Discovery Call Scorecard

The instrument the founder fills **on (or within 24h of)** the founder-led discovery call (DC-1, 45–60 min). It is the consolidated `../06-` §9 roll-up; the formal 0–100 numeric gate is `../07-` (score it within 24h while fresh). **Run discovery like a finance analyst — the way you ask questions *is* the demo** (`../06-` §0).

### 9.1 The scorecard (score each pillar 1–5)

> **Account:** ________ · **Date:** ______ · **Sponsor:** ________ (budget Y/N) · **Trigger:** ________ · **Beachhead:** ___

| # | Pillar (`../06-` ref) | Weight | Score (1–5) | Qualifying floor | Evidence (quote / artifact) |
|---|---|---|---|---|---|
| 1 | Current-state fit (§3) — maturity, manual-effort drag | ×1 | [_] | ≥ 3 | |
| 2 | **Pain & trigger (§4)** — Critical pain (S×F 20–25) + live trigger | ×2 | [_] | ≥ 3 | |
| 3 | **Data readiness (§5)** — can export GL+budget+headcount to CSV (grade ≥ B) | ×2 | [_] | ≥ 3 | |
| 4 | **Executive sponsor (§6)** — budget authority, AI-open given guardrails | ×2 | [_] | ≥ 3 | |
| 5 | Future-state fit (§7) — ≥2 live-module fit; guardrails embraced | ×1 | [_] | ≥ 3 | |
| 6 | Success criteria (§8) — ≥2 baseline-able metrics + owners | ×1 | [_] | ≥ 3 | |
| 7 | Reference willingness | ×1 | [_] | ≥ 2 | |
| | **Weighted total (max 50)** | | **[_/50]** | **≥ 32** | No weighted pillar below floor |

### 9.2 Hard gates (any one fails → NO-GO regardless of total)

`Data readiness = grade D (can't export)` · `No sponsor with mandate or path to budget` · `Categorical AI prohibition on financials` · `Hard dependency on a roadmap-only connector to work at all`

### 9.3 Decision bands & speed rule (`../06-` §9–10)

| Weighted total | Band | Action |
|---|---|---|
| **≥ 38** | Strong fit | Fast-track to MOU; priority cohort slot |
| **32–37** | Qualified | Proceed to MOU; address 1–2 soft pillars in delivery |
| **24–31** | Conditional | One named blocker (usually data or sponsor); fix-or-exit before MOU |
| **< 24** | No-go | Graceful decline (`../06-` §10.3); nurture if a future trigger is plausible |

**Decide within 24h of the last call; tell the prospect within 48h** — speed is a credibility signal for a founder-led motion. Transition emails (Go / Conditional / No-Go) are ready-to-send in `../06-` §10.2–10.4.

### 9.4 Two questions that carry the call (capture verbatim)

1. **First question:** *"If you could ask the platform any finance question and get a cited answer in seconds — what would you ask first?"* → becomes the pilot's primary question.
2. **Trusted-answer bar:** *"When would you trust a Nexora answer enough to put it in front of your board without re-checking it yourself?"* → defines what "answer trust rate ≥70%" means for this partner, and seeds the conversion gate.

### 9.5 One-page in-call cheat sheet (print it) — `../06-` Appendix A

```text
FRAME (3m): "Mostly listening. Honest about live vs roadmap. I'll tell you if it's not a fit."
CURRENT (10m): close days? manual %? load-bearing tools? data-of-record?
PAIN (15m): worst recurring task? the question you dread? key-person risk?
   SCORE Severity×Frequency (1-25). Critical = 20-25.  TRIGGER? (new CFO / raise / migration / audit / board / freeze / M&A)
DATA (8m): export GL+budget+headcount to CSV? Databricks? PII? owner?   GRADE A-D. D = no-go.
EXEC (7m): sponsor + budget? 3 questions the board asks? AI ok w/ guardrails?
FUTURE (6m): first question you'd ask? what's "trusted"? [optional 5-min live proof]
SUCCESS (4m): "how would YOU know in 90 days?" → BASELINE or it's a gap.
NEXT (2m): name the design-partner path; book DC-2/DC-3 or async data.
HARD GATES (any = NO-GO): data=D · no sponsor w/ budget · categorical AI ban · needs roadmap-only connector
SCORE ≥32/50 → MOU.  24-31 → fix-or-exit.  <24 → graceful decline.
NEVER: fabricate a number · overstate a connector · pitch dashboards
```

---

## 10. Design Partner Conversion Process

The full arc from a qualified discovery to a paying, referenceable customer (`../09-` + `../03-` + the program charter). **What lands inside this 30-day sprint is marked ◆; what follows in Days 31–90 is marked ○** — so you run the early steps now without faking the later ones.

### 10.1 The conversion arc

```text
◆ Qualified discovery (≥32, §9)
        ▼
◆ Send MOU  ── founding-customer rate locked; setup waived; partner gives data + feedback + a reference if earned
        ▼
◆ Sign MOU + 60-min Kickoff (Week 0) ── lock 1 primary + 2-3 secondary questions; sign success criteria; agree data extracts + due dates; author draft ClientConfig; assign RBAC roles
        ▼
○ 6-week embedded (Forward-Deployed) pilot:
     Wk1-2 GROUND TRUTH  → "Data Trusted" (8 validators pass)
     Wk3-4 FIRST ANSWER  → ★ FIRST TRUSTED ANSWER logged (≤ Day 30 of pilot) — the moment the whole program exists for
     Wk5   BROADEN       → 2-3 secondary questions + executive experience
     Wk6   PROVE & DECIDE→ scoreboard vs Week-0 baseline + ◆/○ Day-42 conversion preview (no surprises)
        ▼
○ Conversion window (+1-2 wks): exit gate → CONVERT / EXTEND / GRACEFUL EXIT
        ▼
○ CONVERT → proposal (delivery/05) → founding rate locked → sign → reference + case study → handoff (delivery/09)
```

### 10.2 What the MOU trades (the design-partner exchange) — `../09-` §5.2, charter

| We give | They give back |
|---|---|
| Waived setup / professional-services fee during pilot | Reference + case-study rights on a successful outcome |
| Waived/nominal pilot subscription | Real data, refreshed monthly; ≥ N real questions/month; cadence attendance |
| Founding-customer rate **locked** (e.g., 24 mo) at conversion | Multi-year term / auto-renew commitment |
| Roadmap influence (vote the connector build order) | Honest, candid feedback cadence |

> **Commercials carry `[PLACEHOLDER]`s only.** No hard dollars in GTM artifacts; the rate card governs (`../../delivery/06-pricing-framework.md` §13.5 — the only sanctioned standing discount). The early-design-partner conversion band is planning-referenced at $15k–$60k/yr in `../07-` D3; defer the actual number to delivery/06.

### 10.3 The conversion gate (Day-90 / pilot exit) — `../09-` §6, charter §10.1

CONVERT requires **all** primary criteria: **first trusted answer ≤ 30 days · answer trust rate ≥ 70% · "Data Trusted" by Week 2 · cycle-time reduction ≥ target · ≥ 3 questions answered**, **plus** reference + case study agreed and the commercial shape clearing the margin floor. Low conversion is a **qualification** failure upstream (`../07-`), not a pilot failure.

### 10.4 No surprises: the Day-42 preview rule

The conversion conversation must never be the first time the sponsor hears a number. At **Day 42** walk the sponsor through the in-progress scoreboard and the *shape* of the paid relationship (tier, rate-lock, expansion path), so the formal review is a confirmation, not a negotiation (`../09-` §7.1).

### 10.5 The conversion advantage

Because the pilot is Forward-Deployed on the partner's real data, the converted pilot **is** the implementation handoff package — there is no cold start (`../09-` §7.3). The team that ran the pilot already knows the data, the questions, and the people. This is the structural reason an embedded pilot converts faster and cleaner than a self-serve trial.

### 10.6 What "conversion process" means *this sprint*

In Days 1–30 you will, realistically: send **1–2 MOUs** (◆), and — if a pre-existing warm relationship moves fast — sign **0–1** and run a **Week-0 kickoff** (◆). The pilot, first-trusted-answer, Day-42 preview, and paid conversion (○) land in Days 31–90. **Do not compress the pilot to chase a signature** — a graceful "not yet" beats a forced pilot that won't convert.

---

## 11. The 30-Day Run Sheet (week by week) — `../10-` §3.4

| Week | Theme | Do | Goal |
|---|---|---|---|
| **1** | **Stand up & warm core** | Finish pre-flight (§12). Mine first-degree network → warm accounts. Build the 100-list (§3). Launch warm-intro asks to top 15. Start engagement-first on top-20 cold targets. Begin domain warm-up. Publish post #1. | 100-list drafted; 3–5 replies; 1–3 calls booked |
| **2** | **Tune the message** | Read replies; kill the worse subject line/angle, double down on the winner (A/B one variable). Run first 2–4 calls (mostly warm). Start the objection tally (`../08-`). | ≥5 replies; 2–4 calls; a winning message emerging |
| **3** | **Volume + first discovery** | Sustain the daily scorecard. Turn on light, trigger-only cold email (domain warmed). Convert best meetings into structured DC-1; score with §9 / `../07-`. | First 1–2 qualified discoveries |
| **4** | **Consolidate & decide** | Pipeline review: which accounts are real? Identify the 5–10 most likely partners. Send 1–2 MOUs if a fit is ready. Write the Month-1 learning memo (`../10-` §6.1). | 3–6 qualified discoveries cumulative; ≥5 scored bench; 1–2 MOUs in motion |

---

## 12. Pre-Flight Checklist (must be true before Day 1) — `../10-` §1

| # | Item | Done? |
|---|---|---|
| 1 | CRM (Google Sheet / the companion CSV) created with the §3.4 schema | ☐ |
| 2 | Calendar link live; discovery slots blocked 2–3/day | ☐ |
| 3 | Email domain warm-up started (SPF/DKIM/DMARC configured) | ☐ |
| 4 | LinkedIn Sales Navigator active; 3 beachhead saved searches built (§5) | ☐ |
| 5 | Sequences A–F (`../05-`) loaded as fill-in templates | ☐ |
| 6 | Discovery cheat sheet (§9.5) + scorecard printed | ☐ |
| 7 | Qualification scorecard (`../07-` §6) ready | ☐ |
| 8 | Objection cheat-sheet (`../08-`) at hand | ☐ |
| 9 | Demo environment seeded; a clean CSV→cited-answer path rehearsed | ☐ |
| 10 | Honesty-Principle one-pager (Live / Roadmap / Target-state) printed | ☐ |
| 11 | MOU outline + pilot success-criteria template ready (`../09-`, charter) | ☐ |
| 12 | Learning-log file created (daily entries start Day 1) | ☐ |

---

## 13. Risks & The Single Failure Mode

| Risk | Mitigation |
|---|---|
| Cold reply rates at the floor (1%) | Lean on warm/referral (30–60%); the plan already assumes low cold yield |
| Data-readiness blocks qualified buyers | Qualify on export-ability early (§2.1 gate); offer a hands-on extract working session (FDE move) |
| "We need the NetSuite connector live" objection | Honesty Principle + roadmap-influence framing; the CSV path proves value now; partner sets build order |
| Founder time crushed by delivery once a partner signs | Cohort cap is sacred; stagger starts; trim outreach as delivery ramps (Days 31–90) |
| AI-on-finance-data fear | Lead with guardrails (never fabricate, cite every claim, flag low-confidence); disclose pen-test-pending honestly |

> **The single failure mode (re-read before every send):** a "design partner" invite that reads like a discounted-software pitch. A design partner *co-builds*. If your copy ever implies "buy our product at a discount," you've broken the promise (`../05-` §8.3). And per the product directive: **never default to a report template** — we validate the *answer* flow (Question → Data → Analysis → Direct Answer), not a report generator.

---

## 14. Definition of Done — Day 30 (success regardless of revenue)

- ☐ **100 named, scored accounts** loaded with triggers + warm-path flags
- ☐ **≥ 8 meetings held; 3–6 qualified discoveries** (scorecard ≥ 32)
- ☐ **≥ 5 scored design-partner candidates** on the Month-2 bench
- ☐ A **validated winning message** (subject + angle + trigger) with reply data behind it
- ☐ **1–2 MOUs in motion** (base case 0–1 signed)
- ☐ H1–H4 **confirmed or refuted with evidence**; top-3 objections documented (→ `../08-`)
- ☐ **Month-1 learning memo** written (→ refines `../02-/04-/05-/08-`)
- ☐ Revenue **$0** — and that is correct

> A sprint that ends with **3–6 qualified discoveries, a bench of scored candidates, a validated message, and 1–2 MOUs in motion** has done its only job: it has made the first design partner *inevitable* in Days 31–60. Run the machine; protect founder hours; close one warm-led pilot.

---

*End of Sprint 01. Living doc — refresh targets at the Day-30 exit review and roll into Sprint 02 (Days 31–60: Discovery, Pilot Design & First MOUs, per `../10-` §4). Companion trackers: [`sprint-01-target-list-template.csv`](sprint-01-target-list-template.csv), [`sprint-01-kpi-dashboard-template.csv`](sprint-01-kpi-dashboard-template.csv).*
