# Ideal Customer Profile (ICP)

**Design Partner Acquisition System — Document 01 of 12**
**Company:** Sin City Analytics
**Product:** Finance Intelligence Platform (codename **Nexora**) — reporting that behaves like a finance analyst, not a report generator.

> This is the targeting layer of the GTM operating system. Every downstream document — buyer personas (`02`), outreach (`04`/`05`), discovery (`06`), qualification (`07`), and the pilot framework (`09`) — inherits its definition of "good" from this file. If a prospect does not map to a tier defined here, we do not spend founder hours on it. The whole point of an ICP at pre-PMF is to make *saying no* cheap and *saying yes* deliberate.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 01 — Ideal Customer Profile |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Classification** | Confidential — Internal GTM |
| **Related (this system)** | `02-buyer-personas.md` · `03-design-partner-program.md` · `04-outreach-strategy.md` · `05-outreach-sequences.md` · `06-discovery-process.md` · `07-qualification-framework.md` · `08-objection-handling.md` · `09-pilot-framework.md` · `10-first-90-days.md` · `11-shortest-path-to-first-customer.md` |
| **Related (delivery)** | `../delivery/01-financial-intelligence-assessment-framework.md` · `../delivery/06-pricing-framework.md` · `../delivery/08-design-partner-program.md` |
| **Certification basis** | `../docs/commercial-readiness/CERTIFICATION.md` — "Ready for Design Partners" (code + build certified; full commercial rating pending live penetration test) |

---

## 0. How to Read and Use This Document

This ICP exists to answer one operational question on any given day: **"Should I spend a founder hour on this account, and if so, with what expectation?"**

- **Section 1** states the wedge thesis — why we win where we win *right now*, given we have no brand.
- **Sections 2–4** define **Tier 1, Tier 2, Tier 3**, each with the eight required attributes (Revenue Range, Employee Count, Finance Team Size, Technology Maturity, Budget Expectations, Decision Makers, Typical Pain Points, Buying Triggers).
- **Section 5** is the **Negative ICP** — the accounts that *look* qualified but burn the runway. Disqualifying these fast is as valuable as finding good ones.
- **Sections 6–9** make the ICP operational: industry/tech-stack targeting, firmographic + technographic + "psychographic trigger" scoring, the one-line perfect-partner profile, and the explicit link into the rest of the system.

**Notation:** Conversion ranges (e.g., "discovery → pilot 25–40%") are early-stage SaaS planning assumptions with caveats, not guarantees. Treat them as the bands we instrument against in the CRM and revise quarterly with real data. Dollar figures for pricing are deliberately absent — commercials live in `../delivery/06-pricing-framework.md`; this document sizes *budget expectation and willingness*, not the rate card.

---

## 1. The Wedge Thesis — Why We Win Now

Sin City Analytics is pre-PMF, founder-led, with no brand recognition. We do not win on category awareness, analyst rankings, or a reference wall — we have none of those yet. We win on three things, and the ICP is engineered to maximize all three simultaneously:

1. **Founder credibility + finance-domain depth.** We sell to finance leaders who can tell in ten minutes whether the person across the table actually understands a 3+9 forecast, a budget-vs-actuals bridge, or why their SOW contractor spend is invisible. Our ICP over-indexes on buyers sophisticated enough to *reward* that depth — not buyers who need to be educated on what FP&A is.
2. **Demonstrable outcomes on the partner's own messy data.** Our entire differentiator is `Question → Intent Detection → Relevant Data Retrieval → AI (Claude) Analysis → Direct Answer` — grounded, cited, guardrailed. That only lands when a partner points a real question at *their* data. So the ICP is gated hard on **data readiness** (can they export clean CSV/Excel that maps to our model) and **a real, painful, recurring question** worth answering.
3. **Speed to stand up.** Nexora is configuration, not custom code (`ClientConfig`, zero code changes per tenant). We can get a partner to first answered question in days, not the 4–9 months an Anaplan or Workday Adaptive rollout takes. The ICP favors orgs whose pain is *urgent enough* that "weeks not quarters" is the headline value.

**The wedge, in one sentence:** mid-market finance teams (200–2,000 FTE) that have outgrown spreadsheets, cannot justify a heavyweight FP&A platform implementation, are drowning in manual variance/forecast narrative work, and have a finance leader personally motivated to fix it. That is Tier 1.

We deliberately do **not** lead with "AI for finance" as a category claim. We lead with a specific, recurring, expensive question the buyer already hates answering by hand — and we answer it, cited, faster than their analyst can.

---

## 2. Tier 1 — The Sharp Wedge (Best First Design Partners)

> **Plain-English profile:** A 200–2,000-employee, finance-mature mid-market company — most often **B2B SaaS / software, tech-enabled services, or PE-backed multi-entity businesses** — with a 6–25-person finance team, a recently-arrived or under-pressure CFO/VP Finance, a clean ERP they can export from (NetSuite, QuickBooks Online, Sage Intacct), and a forecast/variance/board-reporting process that currently eats days of analyst time every month. They are technically credible (often already have Databricks or Snowflake), AI-curious, and have a named executive sponsor who will personally use the product and put their name on a reference.

**Why Tier 1 is the wedge:** these accounts maximize all three of our advantages at once — they are sophisticated enough to reward founder depth, data-ready enough to demonstrate outcomes fast, and in enough pain that "weeks not quarters" closes the deal. They are also *small enough that one motivated CFO is the whole buying committee*, which collapses our sales cycle and our risk. This is where we get to first paying, referenceable logos fastest.

### 2.1 Tier 1 Attribute Table

| Attribute | Tier 1 Definition |
|---|---|
| **Revenue Range** | $30M–$300M ARR/revenue. Sweet spot $50M–$150M: large enough to have a real finance function and budget, small enough that procurement is light and the CFO decides. |
| **Employee Count** | 200–2,000 FTE. Below 200, the finance team is too thin to have institutionalized pain; above 2,000, expect a BI team and committee buying that slows the pilot. |
| **Finance Team Size** | 6–25 in finance/FP&A. At least: a CFO/VP Finance, 1–2 FP&A analysts, a controller, an AP/procurement owner. The FP&A function exists but is **capacity-constrained** — often 1–3 analysts doing the work of a team twice the size. |
| **Technology Maturity** | ERP they can export from: **NetSuite, QuickBooks Online, or Sage Intacct**. HRIS such as **Workday HCM, Rippling, or BambooHR**. Often a cloud data stack already (**Databricks or Snowflake**) — a strong credibility match for Nexora's Databricks SQL / Delta posture. Reporting today is **Excel/Google Sheets + sometimes Power BI/Tableau for dashboards**. No incumbent heavyweight FP&A platform, or a failed/abandoned one. |
| **Budget Expectations** | Has discretionary budget at the CFO's signature authority — typically a low-five-figure-to-low-six-figure annual software line they can approve without a board vote. Expects a paid pilot or design-partner commercial (preferential, time-boxed) per `../delivery/06-pricing-framework.md`; explicitly **not** seeking free-forever. Sensitive to *implementation cost and time*, not just license. |
| **Decision Makers** | **Economic buyer & champion (same person at this size):** CFO or VP Finance. **Operational owner:** Head of FP&A / Senior FP&A Manager. **Technical validator:** Head of Data / Analytics Engineering (validates the Databricks/security story). **Influencer:** Controller. Buying committee is 1–3 people; the CFO can say yes. |
| **Typical Pain Points** | (1) Monthly **budget-vs-actuals variance** narrative is assembled by hand in Excel, taking days; (2) **Rolling forecast** (3+9 / 6+6 / 9+3) is brittle, version-sprawled, and late; (3) **Board/exec reporting** commentary is a founder/CFO time sink every cycle; (4) **Headcount/workforce planning** lives in a disconnected sheet; (5) **Vendor spend & SOW/contractor (external labor) spend** is opaque — nobody can answer "what are we spending on contractors this quarter and against what budget?"; (6) the FP&A team is the bottleneck on every executive question. |
| **Buying Triggers** | **New CFO in seat <12 months** (rebuilding the finance stack — the single strongest trigger); **recent fundraise** (Series B/C/growth — board now demands forecast rigor); **ERP or HRIS migration** (e.g., moving to NetSuite/Workday — data is already in motion); **board pressure on forecast accuracy** after a miss; **FP&A hiring freeze or backfill gap** (the team must do more with fewer analysts); **first real budget process** post-scale; **PE ownership** demanding monthly reporting discipline. |

### 2.2 Tier 1 Sub-Segments (named, ranked by fit)

| Rank | Sub-segment | Why it converts | Watch-out |
|---|---|---|---|
| **1A** | **B2B SaaS / software, $50M–$150M ARR, Series B–C or growth-equity backed** | Finance-literate, data-native (often already on Snowflake/Databricks), board-driven forecast rigor, NetSuite-standard, CFO-led buying. AI-curious culture. | May have hired a strong FP&A analyst who feels threatened — recruit them as the operational champion early. |
| **1B** | **PE-backed multi-entity / roll-up businesses (services, healthcare services, light manufacturing), $80M–$300M** | Acute reporting-discipline mandate from the sponsor; multi-entity consolidation pain; CFO under monthly pressure; clear, urgent buying trigger (the acquisition/integration itself). | Multi-entity consolidation can be a data-readiness trap — confirm clean per-entity exports before committing a pilot. |
| **1C** | **Tech-enabled services / digital agencies / managed services, 300–1,500 FTE** | Heavy **external labor / contractor (SOW)** spend — a capability almost no competitor handles natively; project-based variance pain. | Their data may live in a PSA tool (e.g., Kantata, OpenAir); confirm exportability. |

### 2.3 Why Tier 1 over everyone else (the runway math)

At pre-PMF, the constraint is **founder hours and time-to-proof**, not TAM. Tier 1 wins on every constraint:

- **Shortest buying committee** → fastest pilot start. One CFO, one champion.
- **Highest data readiness** → fastest time-to-first-answered-question (the only proof that matters).
- **Highest founder-credibility leverage** → these buyers reward domain depth instead of demanding brand.
- **Cleanest reference value** → a recognizable Series-B SaaS or PE-backed logo with a quantified outcome ("cut variance-narrative prep from 3 days to 2 hours, cited") is exactly the proof that unlocks Tier 2 later.

Expected funnel behavior for Tier 1 (planning bands, revise with real data):

| Stage | Tier 1 band | Caveat |
|---|---|---|
| Warm intro → discovery call | 30–50% | Requires a genuine warm path (investor, advisor, peer CFO). Cold is far lower. |
| Cold outreach → positive reply | 1–5% | Founder-personalized, trigger-based outreach at the top of the band; generic blasts at the bottom. |
| Discovery → pilot/design-partner agreement | 25–40% | Higher when a hard buying trigger is present. |
| Pilot → paid conversion | 30–50% | Gated on reaching a trusted, cited answer to a real question (per `09-pilot-framework.md`). |

---

## 3. Tier 2 — Strong Fit, Heavier Lift

> **Plain-English profile:** Either (a) a larger mid-market / lower-enterprise company (1,500–5,000 FTE, $300M–$1B) with a real FP&A team and a BI function — more pain and more budget, but committee buying and longer cycles; or (b) a smaller but exceptionally finance-forward company (100–300 FTE) that punches above its weight. Tier 2 is where we go *after* we have 2–3 Tier 1 references in hand.

**Why Tier 2 is second, not first:** more decision-makers, more procurement, often an incumbent BI/FP&A tool to dislodge, and a higher security bar (they will ask for the live penetration test that is still pending per our certification status). The deals are bigger and stickier — but they cost more founder time and more proof than we can afford to spend before PMF. Pursue opportunistically when a *strong trigger + warm intro* coincide; otherwise nurture.

### 3.1 Tier 2 Attribute Table

| Attribute | Tier 2 Definition |
|---|---|
| **Revenue Range** | $300M–$1B (Sub-segment A); or $20M–$50M but unusually finance-forward (Sub-segment B). |
| **Employee Count** | 1,500–5,000 FTE (A); or 100–300 FTE (B). |
| **Finance Team Size** | 25–80 (A) — includes a dedicated FP&A team and often a separate BI/analytics team; or a tight 4–8 elite finance team (B). |
| **Technology Maturity** | (A) Likely on **NetSuite, Sage Intacct, Microsoft Dynamics**, or migrating toward **Workday Financials**; HRIS = **Workday HCM**; an established **Power BI / Tableau / Looker** estate; possibly a **Workday Adaptive / Anaplan / Pigment / Vena / Cube / Datarails** deployment that is under-loved, over-budget, or stalled. Data on **Snowflake or Databricks**. (B) Modern lean stack — QuickBooks/NetSuite + Snowflake + heavy Excel. |
| **Budget Expectations** | Real software budget; expects a formal procurement process, security review, MSA redlines, and a multi-stakeholder business case. Will pay GA pricing, not just design-partner terms — but expects enterprise SLAs and the completed penetration test. |
| **Decision Makers** | **Economic buyer:** CFO. **Champion:** VP FP&A / Director of Finance. **Technical gate:** Head of Data + **IT Security / CISO** (this is the gate Tier 1 usually lacks). **Influencers:** Controller, FP&A managers. **Procurement** is a formal actor. Committee of 4–7. |
| **Typical Pain Points** | Same six Tier 1 pains, **plus**: an existing FP&A/BI tool that produces dashboards but **no narrative / no direct answers**; cross-business-unit consolidation; data quality and reconciliation across more source systems; analyst time lost to "data wrangling" instead of analysis; an executive team that wants *answers*, not another dashboard to interpret. |
| **Buying Triggers** | New CFO or new VP FP&A; **failed/stalled FP&A platform implementation** (Anaplan/Adaptive remorse — a powerful, specific trigger); annual planning cycle pain; **audit, restatement, or controls finding**; M&A integration; cost-takeout mandate (cloud spend, vendor spend, contractor spend under scrutiny); board demand for forecast-accuracy improvement. |

### 3.2 Tier 2 Sub-Segments

| Sub-segment | Why it fits | Heavier-lift factor |
|---|---|---|
| **Larger B2B SaaS / software ($300M–$1B)** | Same finance-native DNA as Tier 1, more budget, bigger logo value | BI team and security review add 1–3 months |
| **Multi-entity PE platform companies (post several add-ons)** | Consolidation + reporting-discipline pain is severe | Data complexity across entities is real work |
| **Healthcare services, specialty distribution, mid-market manufacturing ($300M–$1B)** | Heavy budget-vs-actuals and vendor-spend pain; cost discipline culture | Often older ERPs; export quality varies |
| **Finance-forward sub-300-FTE (Sub-segment B)** | Elite finance team rewards depth; fast to prove | Smaller budget; reference value lower than a recognizable logo |

### 3.3 Tier 2 funnel bands

| Stage | Tier 2 band | Caveat |
|---|---|---|
| Warm intro → discovery | 25–40% | Needs a sponsor senior enough to convene the committee. |
| Discovery → pilot | 15–30% | Security/procurement friction lowers this until the pen test is complete. |
| Pilot → paid | 25–45% | Multi-stakeholder sign-off; longer but stickier. |

---

## 4. Tier 3 — Opportunistic / Long-Term Nurture

> **Plain-English profile:** Accounts that are a real fit *eventually* but are wrong *now* — true enterprise (5,000+ FTE), or very small/early companies whose finance pain is not yet institutionalized, or fit-but-not-ready companies blocked on a single hard gate (e.g., a security mandate we can't yet clear, or an ERP migration mid-flight). Tier 3 is a **CRM nurture list with a re-qualification date**, not an active outreach target for the founder.

**Why Tier 3 is not a focus now:** each one either consumes disproportionate runway (enterprise procurement, custom security) or cannot yet demonstrate the outcome (no institutionalized finance process, no clean data). We keep them warm, watch for a trigger, and re-tier them when the blocker clears.

### 4.1 Tier 3 Attribute Table

| Attribute | Tier 3 Definition |
|---|---|
| **Revenue Range** | $1B+ enterprise; or sub-$20M early-stage. |
| **Employee Count** | 5,000+ FTE; or <100 FTE. |
| **Finance Team Size** | 80+ with a mature FP&A center of excellence and entrenched tooling; or 1–3 generalists with no FP&A discipline. |
| **Technology Maturity** | (Enterprise) Entrenched **Anaplan / OneStream / Workday Adaptive / SAP** + a large BI org + a formal data platform team + strict vendor security governance. (Early) Cash-basis or QuickBooks-only, minimal exportable structure, Excel-everything. |
| **Budget Expectations** | (Enterprise) Large budgets but long procurement, RFPs, SOC 2 / pen-test mandates, multi-quarter cycles. (Early) Little-to-no software budget; price-sensitive; wants free. |
| **Decision Makers** | (Enterprise) Large committee: CFO, VP FP&A, Enterprise Architecture, CISO, Procurement, Legal — none of whom can say yes alone. (Early) The founder/CEO is also the "CFO"; no dedicated finance buyer. |
| **Typical Pain Points** | (Enterprise) Real and severe, but already partially served by incumbents; the bar to displace is high. (Early) Pain is not yet acute or repeatable; "answer my finance question" is not yet a daily job. |
| **Buying Triggers** | (Enterprise) Major transformation program, ERP re-platform, post-merger integration at scale, a strategic AI-in-finance mandate from the board — large, slow, and rare. (Early) Crossing into a real budget cycle, first finance hire, first institutional fundraise — at which point they become Tier 1 candidates. |

### 4.2 Tier 3 handling rule

- **Enterprise Tier 3:** do not pursue head-on pre-PMF. Engage only via a warm executive intro for a *single, bounded use case* (e.g., one division's contractor-spend problem) that can run like a Tier 1 pilot inside a big company. Re-tier to Tier 2 once the live pen test and full commercial rating are complete.
- **Early-stage Tier 3:** capture, tag the likely trigger (next fundraise / first finance hire), set a re-qualification date, and let the trigger pull them into Tier 1.

---

## 5. Negative ICP — Who We Deliberately Avoid (and Why)

Disqualifying fast protects the only scarce resource we have: founder time and time-to-proof. The following are **hard avoids** at this stage. Some look attractive on paper — that is exactly why they are dangerous.

| # | Negative-ICP profile | Why it burns us | Tell-tale signal in discovery |
|---|---|---|---|
| N1 | **Categorically anti-AI on financial data** | Our entire differentiator is guardrailed AI analysis. If AI on finance data is forbidden, there is no product here — no amount of demo overcomes a policy. | "We have a board/audit policy against AI touching financial numbers." |
| N2 | **No data they can export** (locked in a system with no tabular export; cash-basis only; everything in a single accountant's head) | Live ingestion today is CSV/Excel + Databricks. No clean export = no demonstrable outcome = a pilot that fails on day one. | Cannot produce a trial balance, budget extract, and headcount roster as CSV. |
| N3 | **No finance pain / no recurring expensive question** | We sell time-and-trust on a *recurring* question. No pain = no urgency = no conversion. | "Our reporting is fine." "We're not really looking." |
| N4 | **No executive sponsor** — only a curious analyst with no signing authority and no exec air-cover | Without a CFO/VP-Finance sponsor, the pilot has no path to paid and no reference. Per `../delivery/08-design-partner-program.md`: no sponsor, no partnership. | The most senior person who will join calls is an individual contributor. |
| N5 | **Enterprise demanding completed SOC 2 + passed live pen test now** | Our certification is "Ready for Design Partners" (code+build certified); full commercial rating awaits a live pen test. We cannot truthfully clear an enterprise security gate today, and faking readiness destroys credibility. | Day-one security questionnaire requiring current SOC 2 Type II + pen-test report. |
| N6 | **Wants a custom private fork / bespoke build** | We deliver via `ClientConfig`, zero code changes per tenant. A customer who demands a private fork breaks the economic model and the roadmap. | "We need you to build our proprietary model into a dedicated instance." |
| N7 | **Free-forever / "kick the tires" with no intent to pay** | The design-partner program is time-boxed with a conversion gate, not a free tier. | Refuses any commercial framing or conversion timeline. |
| N8 | **Pure BI/dashboard shopper** comparing us to Power BI/Tableau on chart-building | We are decision intelligence (narrative, cited answers), not a dashboard builder. If they want prettier charts, we lose on the wrong axis and the relationship sours. | "How does your visualization compare to Tableau?" as the lead question. |
| N9 | **Happy, fully-bought-in Anaplan/Adaptive/OneStream shop with no remorse** | Displacing a healthy heavyweight implementation is a multi-quarter enterprise knife-fight we cannot win pre-PMF. (Note: a *stalled or remorseful* one is a Tier 2 trigger — the distinction is the remorse.) | "We just finished our Anaplan rollout and it's going great." |
| N10 | **Regulated edge cases requiring controls we don't yet hold** (e.g., specific data-residency, FedRAMP, HIPAA-BAA-gated finance data) | Compliance gaps we cannot honestly close today; pursuing them is a credibility and legal risk. | Mandatory BAA / data-residency / FedRAMP as a precondition. |

**Disqualification is a feature.** Every account we correctly route to the Negative ICP frees a founder hour for a Tier 1 conversation that can actually close. Discovery (`06`) and qualification (`07`) exist to surface N1–N10 in the first 20 minutes.

---

## 6. Industry, Tech-Stack & Org-Shape Targeting (No Generic Firmographics)

The ICP is not just size bands — it is *specific* industries, stacks, and org shapes that convert. Targeting and outreach (`04`/`05`) should source lists against these named attributes.

### 6.1 Industries, ranked by fit

| Priority | Industry | Why it fits Nexora specifically |
|---|---|---|
| 1 | **B2B SaaS / software** | Finance-native, board-driven forecast rigor, NetSuite-standard, data on Snowflake/Databricks, AI-curious culture. The canonical Tier 1. |
| 2 | **Tech-enabled & professional services / agencies / MSPs** | Heavy **external labor / SOW contractor spend** — a capability almost no FP&A competitor handles. Project variance pain. |
| 3 | **PE-backed multi-entity platforms (services, healthcare services, light manufacturing)** | Sponsor-mandated reporting discipline; acute, time-boxed buying trigger; multi-entity consolidation pain. |
| 4 | **Healthcare services & specialty distribution ($300M–$1B)** | Severe budget-vs-actuals and vendor-spend pain; cost-discipline culture. Tier 2. |
| 5 | **Mid-market manufacturing / industrials** | Strong variance and vendor/cloud-spend pain; caution: older ERPs, export quality varies. |

**De-prioritize now:** highly regulated finance (banks/insurers with strict model-governance), government/public sector (procurement + FedRAMP), and very-early startups (no institutionalized finance).

### 6.2 Tech-stack signals (technographic targeting)

| Signal | Read |
|---|---|
| **ERP = NetSuite, QuickBooks Online, or Sage Intacct** | Strong positive — clean export path to our data model. |
| **Data platform = Databricks or Snowflake** | Strong positive — credibility match (Databricks SQL/Delta), eases the technical-validator conversation. |
| **HRIS = Workday HCM, Rippling, BambooHR** | Positive — feeds workforce/headcount planning module. |
| **VMS = Beeline / Fieldglass; Procurement = Coupa** | Positive for external-labor and vendor-spend use cases (roadmap connectors; CSV today). |
| **Planning = stalled/under-loved Anaplan / Adaptive / Pigment / Vena / Cube / Datarails** | Positive *only with remorse* (Tier 2 trigger); negative if healthy (N9). |
| **Reporting = Excel/Sheets + ad-hoc Power BI/Tableau** | Positive — the real incumbent we replace, not a fortified competitor. |
| **ERP = SAP / Oracle EBS at enterprise scale, large entrenched BI org** | Caution — Tier 3 enterprise lift. |

### 6.3 Org-shape signals

- **Finance org is "analyst-bottlenecked":** 1–3 FP&A analysts serving the whole exec team's questions. *Highest-converting org shape* — we relieve a named, painful constraint.
- **CFO is hands-on and recently arrived:** decisions are fast and the mandate to modernize is fresh.
- **No dedicated BI/analytics team between finance and the data** (Tier 1) → we are not fighting an internal incumbent. A large BI team (Tier 2) means a longer "why not just build it in Power BI" conversation (see `08-objection-handling.md`).

---

## 7. ICP Scoring Model (Operational Qualification Aid)

Use this to tier an inbound or sourced account in under five minutes. Score each dimension, sum, and route. This feeds directly into `07-qualification-framework.md`.

| Dimension | 3 pts | 2 pts | 1 pt | 0 / Disqualify |
|---|---|---|---|---|
| **Size fit** | 200–2,000 FTE, $30M–$300M | 1,500–5,000 FTE | 100–300 FTE | <100 or >5,000 (route to Tier 3) |
| **Finance team shape** | 6–25, analyst-bottlenecked FP&A | 25–80 with BI team | 4–8 elite small team | No finance function (N3) |
| **Data readiness** | Clean CSV from NetSuite/QBO/Intacct + Snowflake/Databricks | Exportable but messy | Single ERP, manual export | No export (N2) |
| **Sponsor** | CFO/VP Finance will personally use + reference | Director of Finance champion | Manager-level champion | IC only, no air-cover (N4) |
| **Pain / recurring question** | Days lost monthly on variance/forecast/board narrative | Slow but tolerable | Curious, mild pain | "Reporting is fine" (N3) |
| **Buying trigger** | New CFO <12mo / fundraise / ERP-HRIS migration / board forecast pressure | Stalled FP&A tool / hiring freeze | General modernization interest | None |
| **AI posture** | AI-curious, wants analyst-grade answers | Cautious but open | Needs convincing | Anti-AI policy (N1) |

**Routing:** **18–21 → Tier 1 (pursue now).** **12–17 → Tier 2 (pursue with warm intro + strong trigger).** **6–11 → Tier 3 (nurture, set re-qual date).** **Any Disqualify flag (N1–N10) → Negative ICP regardless of score.**

> **Override rule:** A *single hard buying trigger* (new CFO <12 months, active ERP/HRIS migration, post-fundraise board mandate) can promote a borderline Tier 2 to active pursuit — triggers beat firmographics at pre-PMF, because timing is the scarcest thing in a sale.

---

## 8. The One-Line Perfect Design Partner

> **A $50M–$150M-revenue, 300–1,000-FTE B2B SaaS company with a 6–15-person analyst-bottlenecked FP&A team on NetSuite + Snowflake/Databricks, a CFO who arrived in the last 12 months (post-Series-B/C) under board pressure to fix forecast accuracy, who today burns three days a month hand-building the variance-and-board narrative in Excel, is AI-curious, can export clean CSV tomorrow, and will personally use Nexora and put their name on a reference.**

If a sourced account matches that sentence, it goes to the top of the founder's call list today.

---

## 9. How This ICP Drives the Rest of the GTM System

| Downstream document | What it inherits from this ICP |
|---|---|
| `02-buyer-personas.md` | The Tier 1 decision-makers (CFO/VP Finance economic buyer, Head of FP&A operational owner, Head of Data technical validator) become the personas. |
| `04-outreach-strategy.md` / `05-outreach-sequences.md` | Channel and message are chosen by tier and trigger; cold positive-reply 1–5%, warm-intro 30–50% bands set the math; trigger events (new CFO, fundraise, migration) are the outreach hooks. |
| `06-discovery-process.md` | Discovery questions are built to confirm tier and surface N1–N10 fast; data-readiness and recurring-question tests are front-loaded. |
| `07-qualification-framework.md` | The Section 7 scoring model and routing thresholds are the qualification spine. |
| `08-objection-handling.md` | Negative-ICP signals (BI-shopper N8, anti-AI N1, security-gate N5, Anaplan-happy N9) map to specific objection plays. |
| `09-pilot-framework.md` | Pilot success = the Tier 1 partner reaching a trusted, cited answer to their named recurring question; data-readiness gate comes straight from the ICP. |
| `11-shortest-path-to-first-customer.md` | The path is: source against Section 8, route via Section 7, pursue Tier 1 only, convert via the pilot — referenced logos then unlock Tier 2. |
| `../delivery/06-pricing-framework.md` | Budget-expectation bands here inform which commercial shape (design-partner terms vs. GA) each tier expects. |
| `../delivery/08-design-partner-program.md` | This ICP is the targeting layer that feeds the program's participant-selection gate. |

---

## 10. Maintenance

This is a living document. Re-tier accounts and revise conversion bands **quarterly**, or immediately when: (a) the live penetration test completes and full commercial rating lands (unlocks Tier 2 enterprise-adjacent security gates and re-tiers several N5 accounts); (b) the first connectors (QuickBooks/NetSuite/Workday/Coupa) move from roadmap to live (loosens the N2 data-readiness constraint); or (c) we land the first 3 referenceable Tier 1 logos (shifts active focus toward Tier 2). Owner: Sin City Analytics GTM.

---

*End of Document 01 — Ideal Customer Profile.*
