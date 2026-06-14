# Discovery Process

*The Sales-Discovery Operating Doc — Design Partner Acquisition System, Sin City Analytics*

> This is the **sales-discovery** companion to the delivery-side `../delivery/01-financial-intelligence-assessment-framework.md`. That framework runs **after** a partner is signed, with a delivery team, over 2–3 weeks of working sessions. **This** document runs **before** the deal — across 1–3 founder-led calls — to decide whether a prospect becomes a design partner at all. It is a *qualification and learning instrument*, not an implementation kickoff. Where the two overlap (data assessment, success criteria), this doc captures the *go/no-go signal*; the delivery framework captures the *engineering detail*. We do not re-run discovery from scratch at delivery — the artifacts here hand directly into `09-sales-to-implementation-handoff.md`.

---

## Document Control

| Field | Value |
|---|---|
| Document | go-to-market/06-discovery-process.md |
| Title | Discovery Process |
| Version | 1.0 |
| Owner | Sin City Analytics — GTM |
| Audience | Founder, founding AE/SE, anyone running a discovery call |
| Product | Finance Intelligence Platform (codename **Nexora**) |
| Last Updated | 2026-06-13 |
| Status | Active |
| Related (this system) | `01-ideal-customer-profile.md` · `02-buyer-personas.md` · `03-design-partner-program.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `07-qualification-framework.md` · `08-objection-handling.md` · `09-pilot-framework.md` · `10-first-90-days.md` · `11-shortest-path-to-first-customer.md` |
| Related (delivery) | `../delivery/01-financial-intelligence-assessment-framework.md` · `../delivery/04-solution-design-framework.md` · `../delivery/06-pricing-framework.md` · `../delivery/08-design-partner-program.md` · `../delivery/09-sales-to-implementation-handoff.md` |
| Certification | `../docs/commercial-readiness/CERTIFICATION.md` — "Ready for Design Partners" |

---

## 0. How To Use This Document

This is an operating doc, not a theory paper. Three rules:

1. **Discovery is the product demo.** For a pre-PMF, pre-brand company, the way you ask questions *is* the credibility proof. A founder who asks a CFO sharper questions than their own FP&A lead has already differentiated from Power BI and Anaplan. Run discovery like a finance analyst would — that *is* Nexora's positioning.
2. **You are qualifying for design-partner fit, not closing a sale.** The output of discovery is a **scored Discovery Scorecard** (§9) feeding a **Go / No-Go** decision (§10). Learning and validation outrank revenue right now. A clean "no-go" that saves three months of delivery on an unwinnable account is a *win*.
3. **Honesty Principle is non-negotiable (per `../delivery/08-design-partner-program.md`).** Every capability is labeled **Live today** / **Roadmap** / **Target-state** in front of the prospect. Live today: CSV/Excel ingestion + Databricks SQL (Delta), the 7 AI finance agents under `BASE_GUARDRAILS`, the 8 validators, ClientConfig-driven tenancy, RBAC with 7 roles, Clerk authentication. Roadmap: native connectors (QuickBooks Online, NetSuite, Workday HCM, Beeline/Fieldglass, Coupa, Workday Adaptive Planning). We are CERTIFIED "Ready for Design Partners" — code + build certified; full commercial rating pending a live penetration test. Never blur the line; doing so detonates the trust the whole motion is built on.

### 0.1 The seven discovery pillars (and where each is covered)

| # | Pillar | Section | Primary owner of the answer | Maps to delivery doc |
|---|---|---|---|---|
| 1 | Discovery Call Framework (agenda, flow, timeboxes) | §2 | Founder / AE | `../delivery/01` §3 (meeting structure) |
| 2 | Current State Assessment | §3 | VP Finance / Controller | `../delivery/01` §4 |
| 3 | Pain Point Assessment | §4 | Whole finance team | `../delivery/01` §10 |
| 4 | Data Assessment | §5 | IT/Data Lead, Controller | `../delivery/01` §8–9 |
| 5 | Executive Assessment | §6 | CFO / Exec Sponsor | `../delivery/01` §7 |
| 6 | Future State Assessment | §7 | CFO + FP&A + BU leaders | `../delivery/01` §11 |
| 7 | Success Criteria Framework | §8 | Exec Sponsor + FP&A Lead | `../delivery/01` §12 |

### 0.2 Discovery funnel math (early-stage SaaS, founder-led, realistic bands)

Use these to set expectations and protect cohort quality (hard cap 5–8 partners per `../delivery/08`). These are *ranges with caveats*, not promises — they assume a tightly-targeted ICP list, not spray-and-pray.

| Stage transition | Realistic band | Caveats / what moves it |
|---|---|---|
| Cold outreach → positive reply | **1–5%** | Lower end is generic email; upper end is specific, trigger-based, founder-signed. Personalization to a named trigger (§4.4) is the single biggest lever. |
| Warm intro → meeting booked | **30–50%** | Quality of the referrer's relationship dominates. A peer-CFO intro lands near the top of the band. |
| Reply/intro → discovery call held | **50–70%** | No-shows and reschedules are the leak; confirm + send a 1-line pre-read agenda (§2.6). |
| Discovery call → qualified (scorecard ≥ threshold) | **30–50%** | Half of "interested" finance leaders are not design-partner-ready (no data export, no sponsor mandate). This is *supposed* to filter. |
| Qualified → design-partner pilot signed (MOU) | **40–60%** | Sponsorship + a named buying trigger drive this. See `../delivery/08` §2. |
| Pilot → paid conversion (Day-90 gate) | **40–60%** | Gate per `../delivery/08` §10.1; depends on hitting time-to-first-trusted-answer ≤ 30 days and answer trust rate ≥ 70%. |

> Implication: to land **5–8 signed design partners**, plan for roughly **25–40 qualified discovery calls**, which implies **60–120 calls held**, which implies a **named, trigger-scored target list in the low hundreds**. Discovery is the throat of this funnel — every improvement in discovery quality compounds downstream.

---

## 1. Discovery Stages & Call Structure

Sales discovery for a design partner is **not** the 10-session, 2–3-week delivery assessment. It is a compressed, founder-led sequence of **1 to 3 calls** whose job is to produce a Go/No-Go and, on "go," a signed MOU and a clean handoff into the delivery-side `../delivery/01` assessment.

### 1.1 The call ladder

| Call | Name | Length | Who (their side) | Who (our side) | Exit artifact |
|---|---|---|---|---|---|
| **DC-0** | Pre-call research & hypothesis | 20 min (internal) | — | Founder/AE | Trigger hypothesis; tailored question subset; pre-read sent |
| **DC-1** | Discovery & Qualification call | **45–60 min** | Economic buyer or strong champion (CFO / VP Finance / Head of FP&A) | Founder (+SE optional) | Scored Discovery Scorecard (§9); top-3 finance questions; pain register draft |
| **DC-2** | Technical / Data Deep-Dive (conditional) | **30–45 min** | IT/Data Lead, Controller | Founder + SE | Data Assessment (§5) completed; data path confirmed; DQ grade |
| **DC-3** | Mutual-fit & Design-Partner framing | **30 min** | Exec Sponsor (+ champion) | Founder | Go/No-Go (§10); MOU sent or graceful exit |

> **Compression rule:** With a hands-on CFO at a 200–800-FTE company, DC-1, DC-2, and DC-3 frequently collapse into **a single 60-minute call plus one async data exchange**. Do not pad. The ladder exists so nothing is *skipped*, not so everything is a separate meeting. If you can qualify, deep-dive, and frame in one call, do it.

### 1.2 What each call is *for* (and what it is *not*)

- DC-1 is for **the question**, not the demo. We are listening for the finance questions that take days to answer today (decision latency = the core value). A demo, if any, is a 5-minute "here's that exact question answered with cited data" — not a feature tour.
- DC-2 is for **reality**, not architecture. Can they export a clean trial balance, budget, and headcount roster as CSV? That single fact gates the whole partnership.
- DC-3 is for **the mutual decision**. Design partner = co-author, not discounted customer (per `../delivery/08`). We are deciding *together* whether this is worth both teams' time.

---

## 2. Discovery Call Framework (DC-1) — Agenda, Flow, Timeboxes

The core 45–60 minute call. Built so a founder running it solo never loses the thread.

### 2.1 Agenda & timeboxes (60-minute version)

| Time | Segment | Goal | Trap to avoid |
|---|---|---|---|
| 0:00–0:03 | **Frame & permission** | Set the agenda; ask permission to ask hard questions; state you'll be honest about what's live vs. roadmap | Launching into a pitch |
| 0:03–0:08 | **Their world (open)** | "Walk me through how finance runs today." Let them talk. | Interrupting with feature claims |
| 0:08–0:18 | **Current State** (§3) | Operating model, tooling, data-of-record, decision cadence | Going deep on org chart trivia |
| 0:18–0:33 | **Pain & Decision-Latency** (§4) | Elicit + score the 2–3 pains that cost real time/risk | Accepting "reporting is slow" without a number |
| 0:33–0:41 | **Data reality** (§5, light) | Can they export GL/budget/headcount as CSV? Databricks? | Turning it into an IT interview (defer to DC-2) |
| 0:41–0:48 | **Executive lens** (§6) | The 3 questions the CFO/board asks every cycle | Skipping this if champion isn't the CFO |
| 0:48–0:54 | **Future state + 5-min proof** (§7) | Co-paint the decision-intelligence target; optionally answer ONE of their real questions live | A 20-minute feature tour |
| 0:54–0:58 | **Success criteria seed** (§8) | "How would you know in 90 days this was worth it?" | Letting it stay vague |
| 0:58–1:00 | **Mutual next step** | Name the design-partner path; agree DC-2/DC-3 or async data | Ending without a committed next action |

### 2.2 45-minute compression

Drop the 5-minute live proof and merge Future State into the Success Criteria seed; keep Current State and Pain at full length — they carry the qualification signal.

### 2.3 The opening frame (say it out loud)

> "Thanks for the time. I'd like to spend most of this understanding how finance actually runs at [COMPANY] and where it costs you time — more than pitching you. I'll be straight about what our platform does today versus what's on the roadmap; no vaporware. If at the end this isn't a fit, I'll tell you. Fair?"

This frame does three jobs: earns permission to probe, pre-empts the "is this a sales trap" guard, and plants the Honesty Principle.

### 2.4 Facilitation rules (from `../delivery/01` §3, adapted for sales)

- **Every quantitative claim gets a number or a flag.** "Close takes a while" → "How many business days? When did you last hit that?" If they can't say, log it as a gap, don't guess.
- **Sequence: question → relevant context → their answer → reflect back.** Mirror Nexora's own flow. Reflecting their answer back ("So a variance explanation takes ~3 days and lands on the CFO's desk after the close — did I get that right?") is the single most credibility-building move on the call.
- **Listen for the *trigger*** (§4.4) and the *trusted-answer bar* (§8.4). These two facts decide go/no-go more than anything else.
- **Note source of every claim:** stakeholder name + "stated" vs. "shown a sample." Carries into the handoff.

### 2.5 Discovery flow diagram

```text
Frame ─▶ Their World (open) ─▶ Current State ─▶ Pain / Latency (score it)
   │                                                      │
   │                                          ┌───────────┘
   ▼                                          ▼
Data Reality (gate) ─▶ Executive Lens ─▶ Future State (+5-min proof)
                                                      │
                                                      ▼
                                   Success Criteria seed ─▶ Mutual Next Step
                                                      │
                                                      ▼
                              Scorecard (§9) ─▶ Go / No-Go (§10)
```

### 2.6 Pre-read (send with the calendar invite)

```text
Subject: Quick agenda for our [DAY] call

Hi [FIRST_NAME],

So we use the time well, here's the plan for our [30/45/60] minutes:
 1. How finance runs at [COMPANY] today (mostly me listening)
 2. Where it costs you the most time — close, forecast, variance, board prep
 3. A quick reality check on your data (can you export GL/budget/headcount to CSV?)
 4. What "great" would look like in 90 days

Nothing to prepare. If it's easy, having one finance question in mind that's
annoyingly slow to answer today will make this concrete fast.

I'll be candid about what our platform does today vs. what's on the roadmap.
[SENDER_NAME]
```

---

## 3. Current State Assessment

**Purpose:** establish the baseline Nexora's value is measured against — operating model, tooling, data-of-record, and especially *decision latency*. Operationalizes `../delivery/01` §4 for a single call.

### 3.1 Question bank

**Operating model & cadence**
1. Walk me through your finance org — how many on the team, and who owns what? (Listening for finance team of 5–40, the ICP sweet spot.)
2. What's your fiscal year start and reporting currency? How many entities/business units roll up?
3. How many business days does month-end close take today? When did you last hit that target vs. slip?
4. What's your forecast cadence — annual budget only, or rolling re-forecasts?

**Tooling (the real incumbent is usually Excel)**
5. What's your ERP/GL — NetSuite, QuickBooks, Sage Intacct, something else?
6. Do you plan in a tool (Adaptive, Anaplan, Pigment, Vena, Cube, Datarails) or in spreadsheets?
7. Do you have a BI layer — Power BI, Tableau, Looker? What does it actually answer vs. just display?
8. Which tools are "load-bearing" — if one broke Monday, the month wouldn't close?
9. Where does work happen in spreadsheets that *should* be in a system?

**Data-of-record**
10. Who owns the GL of record? Who owns headcount of record? Who owns the vendor master?
11. When two reports disagree on a number, which one wins, and who decides?

**Decision latency (the core)**
12. When an exec asks "why is [DEPT] over budget in [PERIOD]?", what physically happens next — and how long until they trust the answer?
13. What percentage of your team's month is spent *producing* reports vs. *analyzing* them?

### 3.2 Current-state maturity rubric (score 1–5 on the call)

Mirrors `../delivery/01` §14.2 maturity scale.

| Maturity | Definition | Discovery tell |
|---|---|---|
| 1 — Ad hoc | Spreadsheet-bound; no standard process | "It depends who's doing it" |
| 2 — Defined but manual | Documented process, heavy manual effort | "We have a checklist but it's all copy-paste" |
| 3 — Standardized | Repeatable, some automation | "Close is predictable; analysis is still manual" |
| 4 — Largely automated | Tooling does production; people analyze | "BI handles the numbers; we write the story" |
| 5 — Decision-intelligent | Questions answered directly, fast, trusted | (Rare — if true, they may not need us yet) |

### 3.3 Scoring & qualification

| Signal | Qualifying (good fit) | Marginal | Disqualifying |
|---|---|---|---|
| Finance maturity | 2–3 (has budget, monthly close, ≥ annual forecast) | 1 with intent to mature | 1 with no budget / cash-basis only |
| Manual-effort split | ≥ 40% of month spent *producing* not analyzing | 25–40% | < 15% (already efficient; weak value story) |
| Spreadsheet dependence | Forecast/variance lives in brittle workbooks | Some spreadsheet sprawl | Fully tooled + happy with it |
| Decision latency | Days to answer a routine variance question | Hours | Minutes (no latency pain) |

### 3.4 Red flags

- "We just bought [Anaplan/Adaptive] last quarter and we're mid-rollout." (No room; revisit in 12–18 months.)
- No one can name how long close takes or how accurate the last forecast was. (Data culture too immature to be a useful design partner.)
- Finance is 1–2 people with no budget process. (Below the 50-FTE acceptable floor; will not exercise the platform.)
- "Reporting works fine, we're just exploring." (No pain = no urgency = no conversion.)

### 3.5 Go/No-Go indicators

- **Go:** maturity 2–3, real manual-effort drag, spreadsheet-dependent forecasting/variance, days-long decision latency.
- **No-Go:** maturity 1 with no budget; or maturity 4–5 with no latency pain; or mid-rollout of a competing planning tool.

---

## 4. Pain Point Assessment

**Purpose:** elicit and *score* the pains that cost real time or create real risk, with a bias toward **decision-latency** pain — Nexora's core value. Operationalizes `../delivery/01` §10.

### 4.1 Pain taxonomy (same 5 categories as delivery)

| Category | Definition | Nexora answer |
|---|---|---|
| **Process** | Manual steps, handoffs, slow close | `financial_reporting`, `actuals` |
| **Data** | Fragmentation, reconciliation, no source-of-truth | 8 validators, Data Quality Advisor |
| **Tooling** | Brittle spreadsheets, no self-serve | All modules (config, not custom code) |
| **Talent** | Capacity / key-person risk | The 7 agents offload analyst-grade work |
| **Decision-latency** | Question → trusted answer takes too long | The whole question→answer pipeline |

### 4.2 Severity × Frequency scoring (Priority = S × F, 1–25)

| Scale | 1 | 3 | 5 |
|---|---|---|---|
| **Severity** | Minor annoyance | Material drag on the function | Blocks decisions / creates risk |
| **Frequency** | Rare / annual | Monthly | Continuous / every cycle |

| Priority band | Score | What it means for the deal |
|---|---|---|
| Critical | 20–25 | Anchor the design-partner value story here; this is the wedge |
| High | 12–19 | Goes into the initial `activeModules` scope |
| Medium | 6–11 | Roadmap / Phase 10 expansion |
| Low | 1–5 | Log only; do not build the pitch on it |

### 4.3 Pain question bank

1. What is the single most painful recurring task in your finance month?
2. What question do executives ask that you *dread* because the honest answer is "give me a few days"?
3. Where do you lose the most time to reconciliation, reformatting, or chasing numbers across systems?
4. The last time a forecast missed badly — what happened, and how long until you understood *why*?
5. Where is there key-person risk — work only one person on the team can actually do? (Listening for: "only [NAME] can answer variance questions" — a classic Talent + Decision-latency combo.)
6. When the board pushes back on a number, how does that get resolved and how long does it take?
7. If I could delete one report or one process step tomorrow, which one creates the most relief?
8. Map me to one of these: vendor/contract spend visibility, contractor/SOW (external labor) tracking, cloud spend, headcount plan-vs-actual — which is the most painful blind spot?

### 4.4 Buying-trigger detection (this is the highest-value signal on the call)

A scored pain without a *trigger* often won't convert — there's no clock. Probe explicitly for these. A live trigger moves a "marginal" prospect to "qualified."

| Trigger | Why it creates urgency | Discovery probe |
|---|---|---|
| **New CFO in seat < 12 months** | Wants a fast win + their own visibility stack | "How long has [CFO_NAME] been in the seat? What's their first-100-days priority?" |
| **Fundraise (live or < 6 mo out)** | Board/investor reporting bar just jumped | "Any financing event that's raising the reporting bar?" |
| **ERP/HRIS migration** (NetSuite, Workday) | Data is in motion; appetite for new tooling is high | "Any system migrations underway or planned this year?" |
| **Audit / restatement** | Trust in numbers is under scrutiny | "Any audit findings or restatements that changed how you report?" |
| **Board pressure on forecast accuracy** | Direct hit on FP&A credibility | "Is the board satisfied with forecast accuracy, or is that a conversation?" |
| **FP&A hiring freeze / can't hire** | Must do more with the same headcount | "If you can't add an analyst, how do you absorb the workload?" |
| **M&A integration** | Two charts of accounts, two close processes to reconcile | "Any acquisitions you're integrating into reporting?" |

### 4.5 Pain register (fill live on the call)

| ID | Pain | Category | Sev (1–5) | Freq (1–5) | Priority | Trigger present? | Module/Agent |
|---|---|---|---|---|---|---|---|
| P-01 | [PLACEHOLDER] | [Process/Data/Tooling/Talent/Latency] | [n] | [n] | [S×F] | [trigger or none] | [module / agent] |
| P-02 | [PLACEHOLDER] | … | [n] | [n] | [S×F] | … | … |

### 4.6 Scoring & qualification

- **Qualifying:** ≥ 1 pain scored **Critical (20–25)**, ideally a Decision-latency pain, **and** at least one active buying trigger (§4.4).
- **Marginal:** High pains (12–19) but no trigger; or strong trigger but only Medium pains.
- **Disqualifying:** no pain above Medium; or pain owned entirely by someone with no budget authority.

### 4.7 Red flags

- Pain is real but the person on the call **can't fund a fix** and won't name who can.
- Every pain maps to "we need better dashboards." (We don't add dashboards — per the product directive. If the *only* ask is BI, we're the wrong tool; say so.)
- Pain is about **headcount we'd replace**, framed as "automate the analyst away." (Adoption will be sabotaged internally; reframe to augmentation or walk.)

### 4.8 Go/No-Go indicators

- **Go:** Critical decision-latency pain + a live trigger + a named funder.
- **No-Go:** no Critical/High pain, or no trigger and no urgency, or the ask is pure dashboarding.

---

## 5. Data Assessment

**Purpose:** confirm the prospect can feed Nexora's **live data path** — and that's a hard gate. The platform's live ingestion is **CSV/Excel upload + Databricks SQL (Delta)**; native connectors are roadmap. A prospect that cannot get tabular data out of its ERP is **not ready — yet**. Operationalizes `../delivery/01` §8–9 for a sales context. Keep it light on DC-1; go deep on DC-2.

### 5.1 What the platform actually needs

Tie every data question to a real Nexora data-model requirement.

| Domain | Fact / dimension the platform needs | Minimum to start | Module it powers |
|---|---|---|---|
| GL / actuals | `ActualEntry` (account, cost center, period, amount) | A trial balance export, 12+ months | `actuals`, `financial_reporting` |
| Budget | `BudgetEntry` (same grain as actuals) | Current-year budget extract | `budget` |
| Forecast | `ForecastEntry` (cycle-tagged) | Latest re-forecast, if any | `forecast` |
| Headcount | `HeadcountRecord` (position-level, **no PII**) | Headcount roster by cost center | `headcount` |
| Vendor spend | `VendorSpendRecord` | AP / vendor spend extract | `vendors` |
| External labor | `ExternalLaborRecord` (SOW/contingent) | VMS or AP contractor extract | `external_labor` |
| Periods / dimensions | `TimePeriod`, `Account` (COA), `CostCenter`, `Department`, `BusinessUnit` | Chart of accounts + cost-center list | All |

> Every record must reduce to a tenant key (`clientId`), an ISO month `period` (e.g. `2026-01`), a `source` (`upload|seed|connector`), and carry through the **8 validators**. **No PII in the schema by design** — position IDs, not employee names.

### 5.2 Data question bank

1. For each domain — GL, budget, forecast, headcount, vendor, contractor — what system is the source of truth?
2. Can you export a clean trial balance and a budget extract to CSV/Excel today? Have you done it recently?
3. How stable are those export formats month to month — same columns, same codes?
4. How complete are your cost-center and account codes across transactions? Any transactions that post with blanks?
5. Do you have a **Databricks workspace** today? Who admins it, and could we get a read-only token? (If no Databricks — fine; CSV/Excel upload is the default live path.)
6. Who would own producing the recurring monthly extracts, and is that realistic for them?
7. Any known duplicate, restatement, or reconciliation issues we'd hit on day one?
8. Are negative values legitimate (credits) or do they signal errors in your data?
9. Are there confidential/PII fields in these extracts we must strip before they ever reach the platform?

### 5.3 Data-readiness grading (A–D, same scale as `../delivery/01` §9)

| Grade | Definition | Design-partner implication |
|---|---|---|
| **A** | Clean, stable, fully coded; exports on demand | Ready now; fast time-to-first-trusted-answer |
| **B** | Mostly clean; minor mapping gaps; warnings expected | Ready; budget light remediation in week 1–2 |
| **C** | Inconsistent; significant cleansing; quarantine likely | Conditional go; remediation plan required first |
| **D** | Can't export, or data unreliable/unavailable | **No-go on data** until remediated |

### 5.4 Live-path reality check (the gate)

| Check | Pass condition |
|---|---|
| Can produce a clean, repeatable CSV/Excel extract for ≥ GL + budget + headcount | Yes |
| Column names / codes stable across periods | Yes (or B-grade with known mapping) |
| Records carry/derive `clientId`, ISO `period`, `source` | Yes |
| Owner identified for recurring monthly extract | Yes, named |
| If Databricks: read-only token path exists | Yes, or default to CSV/Excel |

### 5.5 Scoring & qualification

- **Qualifying:** data grade **A or B** for at least GL/actuals + budget + one more domain; a named extract owner; PII handling understood.
- **Marginal:** grade **C** with a credible, owned remediation plan and a sponsor willing to fund the cleanup.
- **Disqualifying:** grade **D** — ERP cannot export tabular files at all, or data so unreliable no agent answer could be trusted.

### 5.6 Red flags

- "Our data lives in [system] and we've never gotten a clean export out of it." (Grade D risk.)
- No one will own the monthly extract. (The partnership starves after week 2.)
- Heavy PII baked into every extract with no ability to strip it. (Violates no-PII-in-schema.)
- "Our cost centers? Half the transactions don't have one." (Mapping validators will quarantine; flag remediation.)

### 5.7 Go/No-Go indicators

- **Go:** ≥ B-grade for core domains, named extract owner, clean PII story.
- **No-Go:** D-grade with no remediation path, or no owner for the data, or PII can't be excluded.

---

## 6. Executive Assessment

**Purpose:** understand the *questions executives actually ask* and the *commentary they expect* — the home of the CFO Advisor agent and `executive_reporting` — and confirm there is a real **executive sponsor** (no sponsor, no partnership, per `../delivery/08` §2.3). Operationalizes `../delivery/01` §7.

### 6.1 Question bank

**Sponsorship & mandate**
1. Who is the single accountable owner if this initiative happens — and what does success look like *for them personally*?
2. Does that person have budget authority, or do they need someone else's sign-off? Who?
3. Why now? What changed that put this on the agenda? (Re-confirm the trigger from §4.4.)

**The executive questions (seeds intent detection + CFO Advisor scope)**
4. What are the three finance questions the CFO/board asks every single cycle?
5. Which of those takes longest to answer, and why?
6. Who writes the narrative commentary in the board pack today, and where do the insights actually come from — analysis or institutional memory?
7. When an exec disputes a number, how is it resolved and how long does that take?

**Trust & guardrails (the AI-in-finance gate)**
8. Would your leadership trust an AI-generated answer if *every claim cited its data source* and it *refused to invent a number*?
9. What must **never** be auto-generated and always requires a human sign-off?
10. Has anyone here said "no AI on our financials" — and if so, who, and what would change their mind?

### 6.2 Sponsor strength rubric (score 1–5)

| Score | Sponsor profile |
|---|---|
| 5 | CFO/VP Finance who will personally use the platform AND lend their name to a reference AND controls budget |
| 4 | Head of FP&A with CFO backing and budget influence |
| 3 | Strong champion (e.g. FP&A Manager) without budget; credible path to the economic buyer |
| 2 | Interested individual, no mandate, no clear path up |
| 1 | No sponsor; "just looking" |

### 6.3 Scoring & qualification

| Signal | Qualifying | Marginal | Disqualifying |
|---|---|---|---|
| Sponsor strength | 4–5 | 3 with a named path to the buyer | 1–2 |
| AI-in-finance posture | Open, given guardrails | Cautious but curious | Categorically prohibits AI on financials |
| "Why now" | Clear trigger | Soft urgency | "Someday / exploring" |
| Reference willingness | Open to it if value is proven | Non-committal | Refuses any reference even on success |

### 6.4 Red flags

- The person who's excited has **no line to the budget** and can't name who does.
- "AI on our financials is a non-starter" with no condition that would change it. (Disqualifying per ICP — categorical AI prohibition.)
- The CFO won't take a single call. (For a design partner, the sponsor *is* the deal; a no-show CFO is a no-go.)
- They want a logo/reference *blackout* even on a wildly successful outcome. (Kills program objective O4 — referenceable logos.)

### 6.5 Go/No-Go indicators

- **Go:** sponsor strength ≥ 4 (or 3 with a real path), AI-open given guardrails, clear "why now," reference-willing on success.
- **No-Go:** no sponsor with mandate; categorical AI prohibition; CFO inaccessible; reference categorically refused.

---

## 7. Future State Assessment

**Purpose:** co-design the **decision-intelligence target** — anchored to the 7 agents and the question→answer flow, *not* to new dashboards — and confirm the prospect accepts `BASE_GUARDRAILS` as the operating contract. Operationalizes `../delivery/01` §11. This is also where the optional 5-minute live proof lands.

### 7.1 Question bank

1. Eighteen months out, what can your team do that it can't today?
2. If you could ask the platform any finance question and get a cited answer in seconds — what would you ask *first*? (Capture verbatim; this becomes a Day-90 success question.)
3. Of these agents — CFO Advisor, FP&A Specialist, Procurement Advisor, Workforce Finance, External Labor Advisor, CIO Finance Partner, Finance Business Partner, Data Quality Advisor — which one would create the most value for your team, and why?
4. What does "good enough to trust" mean for an AI-generated finance answer here? What would make you *stake a decision* on it?
5. Where will you still want a human in the loop, by policy — permanently?

### 7.2 Decision-intelligence target by domain (fill the relevant rows)

| Domain | Today (their words) | Future state with Nexora | Module | Agent |
|---|---|---|---|---|
| Variance / actuals | [PLACEHOLDER] | Ask "why off budget?" → cited direct answer | `actuals` | FP&A Specialist |
| Forecasting | [PLACEHOLDER] | Rolling 3+9/6+6/9+3 re-forecast w/ drift flags | `forecast` | FP&A Specialist |
| Executive reporting | [PLACEHOLDER] | Direct exec answers w/ sourced commentary | `executive_reporting` | CFO Advisor |
| Vendor spend | [PLACEHOLDER] | Spend/contract questions answered on demand | `vendors` | Procurement Advisor |
| Workforce | [PLACEHOLDER] | Headcount plan-vs-actual on demand | `headcount` | Workforce Finance |
| External labor | [PLACEHOLDER] | SOW/contingent spend visibility | `external_labor` | External Labor Advisor |
| Cloud spend | [PLACEHOLDER] | Cloud cost questions answered directly | `cloud_spend` | CIO Finance Partner / Procurement Advisor |
| BU partnership | [PLACEHOLDER] | Self-serve BU finance answers | `financial_reporting` | Finance Business Partner |

### 7.3 The 5-minute live proof (optional but powerful)

If data permits (even synthetic or a sanitized sample), answer **one** of their real questions live:

> Prospect's question (verbatim) → Intent Detection → Relevant Data Retrieval → Claude Analysis → **Direct, cited answer** — and explicitly show a guardrail in action ("notice it flagged that two cost centers are missing rather than guessing").

This single moment differentiates from every competitor they'll name: Power BI/Tableau/Looker display, they don't *answer*; Anaplan/Adaptive/Pigment plan, they don't narrate; in-house analysts answer but take days. Don't over-build it — one crisp question beats a feature tour.

### 7.4 Guardrail acceptance (must capture)

Confirm the prospect *accepts* `BASE_GUARDRAILS` as a feature, not a limitation: never fabricate/extrapolate numbers; distinguish fact from interpretation; cite the source/metric for every claim; flag missing/low-confidence data before concluding; escalate to human review. A prospect who wants the AI to "just give me a number even if the data's thin" is a values mismatch — note it.

### 7.5 Scoring & qualification

- **Qualifying:** prospect names a concrete first-question and a real "trusted answer" bar; ≥ 2 domains map cleanly to live modules/agents; accepts guardrails as a feature.
- **Marginal:** vision is real but vague on what "trusted" means; only 1 domain maps.
- **Disqualifying:** wants capabilities only on the roadmap (e.g. "we need the live NetSuite connector or it's pointless"); or wants the AI to fabricate/extrapolate.

### 7.6 Red flags

- "We need the native [Workday/NetSuite/Coupa] connector to be live or this doesn't work for us." (Roadmap, not live — set the expectation or no-go.)
- The future state they describe is just "nicer dashboards." (Not decision intelligence; not us.)
- They love it *because* it'll "make up the forecast for us." (Direct guardrail violation; values mismatch.)

### 7.7 Go/No-Go indicators

- **Go:** concrete first-question, clear trusted-answer bar, ≥ 2 live-module fits, guardrails embraced.
- **No-Go:** hard dependency on roadmap connectors; vision is dashboards-only; wants fabrication.

---

## 8. Success Criteria Framework

**Purpose:** turn the conversation into **measurable** success — each metric with a baseline → target, an owner, and a method — so the design partnership has a real conversion gate (per `../delivery/08` §10.1, e.g. time-to-first-trusted-answer ≤ 30 days, answer trust rate ≥ 70%). Operationalizes `../delivery/01` §12. **No target is accepted without a baseline** — where unknown, log a gap, never estimate.

### 8.1 Standard metric set (seed from the call; finalize in delivery)

| Metric | Definition | Baseline (capture) | Realistic target band | Owner | Method |
|---|---|---|---|---|---|
| **Time-to-answer** | Median time: finance question → trusted answer | [PLACEHOLDER] | Days → minutes/hours | VP Finance | Question log |
| **Time-to-first-trusted-answer** | Days from kickoff to staking a real decision on a Nexora answer | n/a | **≤ 30 days** | Sponsor | Program log |
| **Answer trust rate** | % of agent answers rated decision-ready, no rework | [PLACEHOLDER] | **≥ 70% by Day 90** | FP&A Lead | Answer rating |
| **Variance explained %** | % of material variances with a cited explanation | [PLACEHOLDER %] | 80–95% | FP&A Lead | Variance register |
| **Manual-report hours** | Hours/month removed from report production | [PLACEHOLDER] | 20–50% reduction | FP&A Lead | Effort tracking |
| **Forecast accuracy** | \|Forecast − Actual\| / Actual, by cycle | [±%] | Tighten by [±%] | FP&A Lead | Cycle comparison |
| **Close cycle time** | Business days to close | [PLACEHOLDER] | −1 to −3 days | Controller | Close calendar |
| **Data validation pass rate** | % records passing 8 validators (no quarantine) | [PLACEHOLDER %] | ≥ 90% | IT/Data Lead | Validator logs |
| **Sponsor NPS** | Monthly sponsor satisfaction | n/a | High / improving | Sponsor | Survey |

### 8.2 The two questions that set the conversion gate

1. *"How would **you** know, 90 days in, that this was worth it?"* — captures the partner's own success definition.
2. *"What's the **honest current value** for that today?"* — forces a baseline. If they can't give one, that's the first joint task in delivery (logged as a gap, owned, dated).

### 8.3 Success-criteria question bank

1. What's the number that, if it moved, leadership would actually *notice*?
2. For each metric we just listed — what's the honest baseline today, and where does the data to measure it live?
3. Who owns each metric on your side?
4. What would make you comfortable converting from design partner to paying customer at Day 90?

### 8.4 The "trusted-answer bar" (capture verbatim — it's the heart of the gate)

> Ask: *"When would you trust a Nexora answer enough to put it in front of your board without re-checking it yourself?"* Their answer defines what "answer trust rate ≥ 70%" actually means for **this** partner. Write it down word-for-word.

### 8.5 Scoring & qualification

- **Qualifying:** at least 2 metrics with a *measured* (or quickly measurable) baseline, named owners, and a sponsor-stated trusted-answer bar.
- **Marginal:** metrics agreed but no baselines and no plan to get them.
- **Disqualifying:** sponsor can't articulate any way they'd know it worked. (No conversion gate = unconvertable partner.)

### 8.6 Red flags

- "We'll know it's working when it feels better." (No measurable gate; push for a number or flag the risk.)
- Targets proposed with no baseline and resistance to measuring one. (Violates the baseline rule; conversion will be a fight.)
- Success metrics owned by people not on the partnership. (Orphaned metrics never get measured.)

### 8.7 Go/No-Go indicators

- **Go:** ≥ 2 baseline-able metrics with owners + a verbatim trusted-answer bar.
- **No-Go:** no articulable success definition; refusal to set baselines.

---

## 9. Discovery Scorecard (Roll-Up)

Score each pillar 1–5 after DC-1 (and DC-2 if held). This is the single instrument that drives the §10 Go/No-Go. It deliberately overlaps the design-partner scorecard in `../delivery/08` §2.5 (org fit, data readiness, sponsorship, motivation, reference willingness) so a "go" here pre-fills that.

| # | Pillar | Weight | Score (1–5) | Qualifying floor | Notes / evidence |
|---|---|---|---|---|---|
| 1 | Current State fit (§3) | ×1 | [n] | ≥ 3 | [maturity, manual-effort drag] |
| 2 | Pain & trigger (§4) | ×2 | [n] | ≥ 3 | [Critical pain + live trigger?] |
| 3 | Data readiness (§5) | ×2 | [n] | ≥ 3 (grade ≥ B) | [can export GL/budget/HC to CSV?] |
| 4 | Executive sponsor (§6) | ×2 | [n] | ≥ 3 | [budget authority? AI-open?] |
| 5 | Future-state fit (§7) | ×1 | [n] | ≥ 3 | [≥2 live-module fit; guardrails ok] |
| 6 | Success criteria (§8) | ×1 | [n] | ≥ 3 | [baseline-able metrics + owners] |
| 7 | Reference willingness | ×1 | [n] | ≥ 2 | [open to logo/case study on success] |
| | **Weighted total (max 50)** | | **[/50]** | **≥ 32** | No single weighted pillar below floor |

**Decision bands**

| Weighted total | Band | Action |
|---|---|---|
| **≥ 38** | Strong fit | Fast-track to MOU; this is a priority cohort slot |
| **32–37** | Qualified | Proceed to MOU; address the one or two soft pillars in delivery `../delivery/01` |
| **24–31** | Conditional | One named blocker (usually data or sponsor); fix-or-exit before MOU |
| **< 24** | No-go | Decline gracefully (§10.3); log the learning |

> **Hard gates (any one fails → no-go regardless of total):** data readiness grade **D** (can't export); **no sponsor** with mandate or path to budget; **categorical AI prohibition** on financials; **hard dependency on a roadmap-only connector**.

---

## 10. Go / No-Go Decision & Next Steps

### 10.1 The decision

Run the Scorecard (§9). Apply hard gates first, then the band. Decide within **24 hours** of the last call while it's fresh, and tell the prospect within **48 hours** — speed is a credibility signal for a founder-led motion.

| Decision | Criteria | Immediate action |
|---|---|---|
| **Go** | Total ≥ 32, no hard gate failed, no pillar below floor | Send MOU (`../delivery/08` §9); book kickoff; open the handoff file (§11) |
| **Conditional Go** | Total 24–31 with one fixable blocker | Name the blocker + owner + date; re-decide on fix |
| **No-Go** | Total < 24, or any hard gate failed | Graceful decline (§10.3); nurture if a future trigger is plausible |

### 10.2 "Go" — ready-to-send transition email

```text
Subject: [COMPANY] — let's co-build this

Hi [FIRST_NAME],

Thanks for the candid conversation. Based on what you walked me through —
[1-LINE: the Critical pain, e.g. "variance narrative eating ~3 days every close
while the board leans harder on forecast accuracy"] — I think [COMPANY] is a
strong fit for our design-partner cohort, and I'd like to invite you in.

What I heard as your first question for the platform:
  "[VERBATIM FIRST QUESTION FROM §7.1]"

What "worth it in 90 days" looks like for you:
  [VERBATIM TRUSTED-ANSWER BAR FROM §8.4]

Next steps:
 1. I'll send a short, mutual MOU (founding-customer pricing, locked [LOCK_TERM];
    we waive setup; you give us data + honest feedback + a reference if we earn it).
 2. We line up a 30-min data call with [DATA_OWNER] to confirm the CSV/Excel
    extracts (GL, budget, headcount to start).
 3. Kickoff the week of [DATE].

As I said: live today is CSV/Excel + Databricks and the 7 guardrailed agents;
native [ERP] connectors are on the roadmap and design partners set the order.

Worth doing? [SENDER_NAME]
```

### 10.3 "No-Go" — graceful decline (keep the door open)

```text
Subject: Straight answer on fit

Hi [FIRST_NAME],

Appreciate the time and the honesty. Being equally honest back: I don't think
we're the right fit for [COMPANY] right now — [SPECIFIC REASON, e.g. "your data
can't yet export cleanly from [ERP], and our live path needs that" / "you're
mid-rollout on [Adaptive] and there's no room for another tool this year"].

I'd rather tell you that than waste your team's quarter. If [TRIGGER, e.g. "that
ERP migration lands" / "the connector you need goes live"], I'll reach back out —
and I'm happy to be a resource on finance-analytics questions in the meantime.

[SENDER_NAME]
```

### 10.4 "Conditional Go" — the fix-or-exit note

```text
Subject: One thing to nail down before we commit

Hi [FIRST_NAME],

I'm keen on this — there's one open item I want us both honest about before we
sign anything: [BLOCKER, e.g. "whether your team can produce a clean monthly
trial-balance export, and who owns it"].

Proposal: [OWNER] pulls a sample 2–3 month extract by [DATE]; we sample it
together on a 30-min call. If it's clean enough, we proceed to MOU. If it isn't,
we'll know exactly what to fix first — no wasted motion either way.

Work for you? [SENDER_NAME]
```

---

## 11. Handoff Into Delivery

A "Go" produces the inputs to `../delivery/09-sales-to-implementation-handoff.md` and pre-seeds the delivery-side assessment (`../delivery/01`). Do **not** make the delivery team re-discover what was already learned.

### 11.1 Discovery → Delivery handoff packet (assemble on every "Go")

| Artifact (from this doc) | Feeds (delivery) |
|---|---|
| Scored Discovery Scorecard (§9) | `../delivery/08` §2.5 partner scorecard (pre-filled) |
| Pain register with triggers (§4.5) | `../delivery/01` §10 pain register (D6) |
| Data readiness grades + extract owner (§5) | `../delivery/01` §8–9 (D4, D5); DC-2 detail |
| Executive sponsor + mandate + AI posture (§6) | `../delivery/01` §2 stakeholder roster (D9) |
| Future-state domain map + first-question (§7.2) | `../delivery/01` §11 future state (D3) |
| Success metrics + verbatim trusted-answer bar (§8.4) | `../delivery/01` §12 success criteria (D7); `../delivery/08` §10.1 conversion gate |
| Live/Roadmap expectations set (§0.1) | `../delivery/08` Honesty Principle disclosures in MOU |

### 11.2 Handoff one-liner template

```text
DISCOVERY HANDOFF — [COMPANY] → Delivery
Sponsor: [NAME, TITLE] (budget: Y/N) · Trigger: [TRIGGER]
Scorecard: [TOTAL/50] · Data grade: [A–D] · Extract owner: [NAME]
First question to answer: "[VERBATIM]"
Trusted-answer bar: "[VERBATIM]"
Launch modules: [list] · Agents: [list] · Roadmap expectations set: Y/N
Open blockers / gaps: [list with owner + date]
Recommendation: Proceed to ../delivery/01 assessment.  — [SENDER_NAME], [DATE]
```

---

## Appendix A — One-Page Discovery Cheat Sheet (print this)

```text
NEXORA DISCOVERY — DC-1 (60 min)            Sin City Analytics
─────────────────────────────────────────────────────────────
FRAME (3m):  "Mostly listening. Honest about live vs roadmap. I'll
              tell you if it's not a fit."
CURRENT (10m): close days? manual%? load-bearing tools? data-of-record?
PAIN (15m):  worst recurring task? the question you dread? key-person risk?
   SCORE Severity×Frequency (1–25). Critical = 20–25.
   TRIGGER? new CFO<12mo / raise / ERP+HRIS migration / audit /
            board forecast pressure / FP&A freeze / M&A
DATA (8m):   export GL+budget+headcount to CSV? Databricks? PII? owner?
   GRADE A–D. D = no-go on data.
EXEC (7m):   sponsor + budget? 3 questions board asks? AI ok w/ guardrails?
FUTURE (6m): first question you'd ask? what's "trusted"? [5-min live proof]
SUCCESS (4m):"how would YOU know in 90 days?" → BASELINE or it's a gap.
NEXT (2m):   name the design-partner path; book DC-2/DC-3 or async data.
─────────────────────────────────────────────────────────────
HARD GATES (any fail = NO-GO):  data=D · no sponsor w/ budget ·
   categorical AI ban · needs roadmap-only connector to work
SCORE ≥32/50 → MOU.  24–31 → fix-or-exit.  <24 → graceful decline.
NEVER: fabricate a number · overstate a connector · pitch dashboards
```

## Appendix B — Competitor-Aware Rebuttals (when a tool comes up in discovery)

Cross-reference `08-objection-handling.md` for full treatment.

| They say | One-line discovery response |
|---|---|
| "We already have Power BI / Tableau / Looker." | "Those *display* the numbers beautifully — they don't *answer* 'why is [DEPT] over budget?' with cited data. We sit on top of, or beside, that." |
| "We're looking at Anaplan / Adaptive / Pigment." | "Those are planning engines — heavy to stand up. We're config-not-code, and we narrate the answer, not just model the plan. Many partners run us alongside." |
| "We just use Excel." | "Excel is the real incumbent and it's fine — until the answer lives across six tabs and only one person knows where. That's the exact gap we close." |
| "We have a BI team / FP&A analysts." | "Great — we make them faster, not redundant. They stop *producing* and start *deciding*. The agents do analyst-grade first drafts; humans sign off." |
| "Why not just use Databricks/Snowflake directly?" | "Those are the data platform — we run *on* Databricks. We're the finance-native app that turns that data into cited answers, with guardrails." |

## Appendix C — Cross-Document Map

| This document references | For |
|---|---|
| `../delivery/01-financial-intelligence-assessment-framework.md` | The full delivery-side assessment this sales discovery pre-seeds |
| `../delivery/08-design-partner-program.md` | Program charter, scorecard, MOU, conversion gate |
| `../delivery/06-pricing-framework.md` | Authoritative design-partner pricing & rate lock |
| `../delivery/09-sales-to-implementation-handoff.md` | The handoff this discovery feeds |
| `01-ideal-customer-profile.md` · `02-buyer-personas.md` | Who to target; who's on the call |
| `04-outreach-strategy.md` · `05-outreach-sequences.md` | How the call got booked (funnel inputs to §0.2) |
| `07-qualification-framework.md` | Formal qualification this scorecard supports |
| `08-objection-handling.md` | Full rebuttals (Appendix B is the discovery-moment subset) |
| `09-pilot-framework.md` · `10-first-90-days.md` | What happens after "Go" |
| `11-shortest-path-to-first-customer.md` | The end-to-end motion this is one step of |
