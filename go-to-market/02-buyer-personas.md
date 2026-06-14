# Target Buyer Personas

**Design Partner Acquisition System — Document 02 of 11**
**Product:** Finance Intelligence Platform (codename **Nexora**) — moves finance from REPORTING to DECISION INTELLIGENCE. It behaves like a finance analyst, not a report generator.
**Company:** Sin City Analytics — early-stage, pre-PMF, founder-led B2B SaaS.

> Personas exist to make every cold email, discovery call, demo, and pilot conversation land on the specific human who can say "yes." This document is not a marketing artifact. It is the operating reference the founder and early team open before sending an email or walking into a first call. Each persona is written so you can predict what the person will say, what they will fear, and the one sentence that either opens the door or slams it.

---

## Document Control

| Field | Value |
|---|---|
| **Document** | 02 — Target Buyer Personas |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics — GTM |
| **Audience** | Founder, early GTM/sales, delivery, product |
| **Classification** | Confidential — Commercial |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |
| **Related Documents** | `01-ideal-customer-profile.md` · `03-design-partner-program.md` · `05-outreach-sequences.md` · `07-qualification-framework.md` · `09-pilot-framework.md` · `10-first-90-days.md` · `11-shortest-path-to-first-customer.md` · `../delivery/08-design-partner-program.md` · `../delivery/01-financial-intelligence-assessment-framework.md` · `../docs/commercial-readiness/CERTIFICATION.md` · *Forthcoming:* `04-outreach-strategy.md` · `06-discovery-process.md` · `08-objection-handling.md` |

---

## 1. How to Use This Document

### 1.1 The buying committee is the unit, not the persona

In the company segment Sin City Analytics targets as design partners — **$30M–$300M revenue (sweet spot $50M–$150M), 200–2,000 FTE, finance team of 6–25, often PE- or VC-backed** (see `01-ideal-customer-profile.md`) — no single person buys software. A finance-intelligence purchase, even a free design-partner pilot, passes through a committee of **3–6 people**. This document profiles the six roles that committee is built from:

| # | Persona | Typical committee role | Buys / Blocks |
|---|---|---|---|
| 3 | **CFO** | Economic buyer | Funds it, kills it |
| 4 | **Controller** | Blocker / data-truth gatekeeper | Can veto on data integrity |
| 5 | **FP&A Director / Manager** | Champion (most common) | Lives the pain daily, drives the deal |
| 6 | **VP Finance** | Champion or economic buyer (smaller orgs) | Owns the number, sponsors internally |
| 7 | **Finance Transformation Leader** | Champion / internal sponsor | Has budget and mandate to change tooling |
| 8 | **CIO / IT & Security** | Technical evaluator / blocker | Approves on security, data, integration |

### 1.2 The single most important pattern

For a pre-PMF, no-brand vendor, **the deal is won by the FP&A Director or Finance Transformation Leader as champion, sold up to the CFO as economic buyer, and de-risked past the Controller and CIO as blockers.** You almost never win by cold-emailing the CFO first. You win by arming a champion who is already drowning, then helping them sell internally. Every persona below is annotated for which move it supports.

### 1.3 The two AI-adoption psychologies you are selling against

Across all six personas, two fears recur and must be neutralized in every conversation:

1. **"AI will hallucinate a number and I will sign my name under it."** Finance is a profession of personal accountability — a CFO signs the 10-Q, a Controller certifies the close. A made-up number is a career event, not a bug ticket. Nexora's answer: guardrailed agents that **never fabricate or extrapolate numbers, cite the data source for every claim, flag missing/low-confidence data, and escalate to humans.** Lead with the guardrails, not the magic.
2. **"This is another tool that promises to replace my spreadsheet and won't."** Every persona has been burned by Workday Adaptive, Anaplan, or a BI rollout that took 9 months and got abandoned. Nexora's answer: **configuration not custom code, fast to stand up, answers questions against their actual data in a pilot they can see in weeks.**

---

## 2. Persona-to-Capability Map (read before any call)

Map the person to the capability that solves *their* problem. Do not demo all ten modules to everyone.

| Persona | The capability that lands | The agent ("skill") that proves it |
|---|---|---|
| CFO | Executive commentary & board-ready reporting; forecast accuracy; decision support | **CFO Advisor** |
| Controller | Data Quality validation, source citation, audit traceability | **Data Quality Advisor** |
| FP&A Director | Rolling forecasting (3+9 / 6+6 / 9+3), budget-vs-actuals variance, speed | **FP&A Specialist** |
| VP Finance | Variance narrative + workforce/headcount planning | **FP&A Specialist** + **Workforce Finance** |
| Finance Transformation Leader | Time-to-value, configuration not code, roadmap influence | **Finance Business Partner** |
| CIO / Security | Multi-tenant isolation, RBAC, auth, data residency | (no agent — this is the **tech posture** conversation) |

---

## 3. CFO — The Economic Buyer

### 3.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | CFO, Chief Financial Officer, Chief Finance & Operations Officer |
| **Reports to** | CEO; accountable to the Board and Audit Committee |
| **Owns** | The number. P&L, cash, forecast, board narrative, audit relationship, finance headcount budget |
| **Team size** | 5–40 in finance; 1–4 direct reports (VP Finance, Controller, FP&A Director, Treasury) |
| **Tenure signal** | **New CFO in seat <12 months is the single strongest buying trigger** — they are re-tooling and want a visible win |
| **Tools they live in** | Board deck (PowerPoint), the consolidated model (Excel), the ERP (NetSuite/Sage Intacct/SAP), whatever BI the company bought (Power BI/Tableau) |
| **Committee role** | **Economic buyer.** Funds the pilot, signs the paid contract, can kill the deal in one sentence |

### 3.2 Responsibilities
- Own and defend the forecast to the CEO and Board; explain every material variance.
- Deliver the quarterly board package and lead the audit/close relationship.
- Allocate capital and headcount; decide what gets funded and cut.
- Manage cash runway and, in PE/VC-backed companies, hit the plan the investors underwrote.
- Be the single throat the Board chokes when the number is wrong.

### 3.3 Goals
- **Forecast accuracy** — stop being surprised; reduce forecast-to-actual variance below ~5%.
- **A board narrative that holds up** — defensible commentary, not just charts.
- **Leverage from a finance team they cannot grow** — do more analysis without adding 3 FTEs.
- **Look like the smartest person in the room** in front of the CEO and Board.

### 3.4 Pain Points
- The board deck takes the team 2–3 weeks every quarter and is stale on delivery.
- "Why is OpEx up 8%?" gets a 2-day turnaround because the answer lives in three spreadsheets and one analyst's head.
- Forecast is a black box owned by one FP&A person who is a flight risk.
- BI dashboards show *what* happened, never *why* — no narrative, no decision.
- Cannot hire fast enough; an FP&A hiring freeze just made it worse.

### 3.5 Objections
- *"We already have Power BI / Adaptive / Anaplan."* (We're BI-fatigued and tool-saturated.)
- *"I can't put an AI in front of board numbers — what if it's wrong?"*
- *"You're a startup. What happens to my data and my pilot if you fold?"*
- *"My team is underwater; they don't have time for an implementation."*

### 3.6 What motivates them
- Being **decision-ready** — answering the CEO/Board instantly with a number they trust.
- Visible wins early in tenure that signal competence to the Board.
- Strategic stature: being seen as a forward-looking operator, not a bookkeeper.

### 3.7 What scares them
- **Signing their name under a fabricated number.** This is the existential fear. Address it first, every time.
- A failed, visible software rollout that the CEO remembers.
- Being blindsided in a board meeting by a variance they didn't see coming.
- Data leaving their control (especially pre-IPO or in an M&A process).

### 3.8 Why they would buy
- A new CFO wants a fast, visible modernization win and roadmap influence as a design partner.
- The board package and variance-narrative burden is acute and recurring.
- The guardrails (cited sources, no fabrication, human escalation) make AI *safe enough* to put near the number.
- Design-partner economics: price protection and influence, low cash risk (see `03-design-partner-program.md`).

### 3.9 Why they would NOT buy
- No active trigger — last board deck went fine, forecast was close, no new mandate.
- Pre-IPO/audit-sensitive period where they will not introduce any new data system.
- They delegate fully to the Controller/CIO who then blocks on data or security.
- Burned recently by an AI or BI tool and now reflexively skeptical.

### 3.10 The one message that LANDS
> **"Nexora answers your board's hardest finance question in seconds, with the source cited under every number — and it will never make a number up. It's a finance analyst that doesn't sleep, not another dashboard."**

### 3.11 The one message that REPELS
> *"Our AI automatically generates your executive summary and board commentary for you."* — This triggers the fabrication fear and the "you don't understand accountability" reflex. Never lead with automation of the narrative; lead with *cited, grounded answers the CFO authors.*

---

## 4. Controller — The Data-Truth Gatekeeper (Blocker)

### 4.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | Controller, Corporate Controller, VP Controller, Chief Accounting Officer |
| **Reports to** | CFO |
| **Owns** | The close, the books, the GL, audit support, internal controls, data accuracy |
| **Team size** | Accounting team of 3–20 (AP, AR, GL, payroll) |
| **Tools they live in** | The ERP (NetSuite, Sage Intacct, SAP, QuickBooks at the low end), reconciliation spreadsheets, the audit binder |
| **Committee role** | **Blocker / technical-on-data evaluator.** Rarely the champion. Can veto on "this doesn't tie to the GL" |

### 4.2 Responsibilities
- Close the books accurately and on time (the monthly/quarterly close).
- Maintain the source of truth — the GL and sub-ledgers must reconcile.
- Own internal controls, SOX-adjacent processes, and audit readiness.
- Certify that reported numbers are correct.

### 4.3 Goals
- A **clean, fast close** with no surprises and no restatements.
- A defensible audit trail — every number traceable to a source.
- Fewer manual reconciliations and less spreadsheet risk.

### 4.4 Pain Points
- FP&A and the CFO pull "their own" numbers that don't tie to the GL, creating reconciliation fights.
- Manual, error-prone exports and copy-paste between the ERP and Excel.
- Audit prep is a fire drill of tracing numbers back to source.
- "Shadow" spreadsheets nobody can validate.

### 4.5 Objections
- *"If your AI pulls a number, can you show me exactly where it came from? Because if it can't tie to the GL, it's noise."*
- *"This is just going to create another version of the truth I have to reconcile."*
- *"Who can see what? I'm not exposing the GL to the whole company."*
- *"What's your data validation? Garbage in, garbage out."*

### 4.6 What motivates them
- **Accuracy and traceability above all.** A Controller's professional identity is being right.
- Reducing manual risk and reconciliation toil.
- Being the trusted certifier whose numbers never get questioned.

### 4.7 What scares them
- A tool that surfaces an unvalidated or fabricated number to the CFO/Board with *their* data behind it.
- Loss of source-of-truth control — multiple conflicting versions.
- A data breach or improper access to the GL.
- Being blamed for a number a tool got wrong.

### 4.8 Why they would buy
- Nexora **cites the data source for every claim** and the **Data Quality Advisor** agent plus the validators flag missing/low-confidence data — this speaks their language exactly.
- It can *reduce* version-of-truth chaos by pulling from one governed source (Databricks Delta / their uploaded actuals) rather than scattered spreadsheets.
- RBAC with 7 roles (incl. **Controller** role) and per-tenant `clientId` isolation answers the access fear.

### 4.9 Why they would NOT buy
- Cannot see clean source-to-answer traceability in the demo.
- Perceives it as yet another version of the truth to reconcile.
- Security/access model not credible (this is where the CIO and Controller fears compound).
- Mid-close or mid-audit — zero appetite for anything new.

### 4.10 The one message that LANDS
> **"Every number Nexora returns shows its source. It never fabricates, it flags low-confidence data, and the Data Quality Advisor tells you where your data is incomplete — so what reaches the CFO already ties out."**

### 4.11 The one message that REPELS
> *"Nexora uses AI to automatically generate the numbers."* — The word "generate" near "numbers" is disqualifying for a Controller. Say "retrieves, cites, and validates" — never "generates."

---

## 5. FP&A Director / Manager — The Champion (most common)

### 5.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | FP&A Director, Director of FP&A, FP&A Manager, Senior FP&A Manager, Head of FP&A |
| **Reports to** | VP Finance or CFO |
| **Owns** | The forecast model, budget-vs-actuals, variance analysis, the board-deck data prep |
| **Team size** | 1–8 analysts (often understaffed, often 1–2 people doing everything) |
| **Tools they live in** | **Excel/Google Sheets is their entire life**; maybe Adaptive/Anaplan/Cube/Vena/Datarails they half-use; the ERP for the export |
| **Committee role** | **Champion — the most common and most important.** They feel the pain hourly and will drive the deal if you arm them |

### 5.2 Responsibilities
- Build and maintain the rolling forecast (3+9, 6+6, 9+3 cycles).
- Run budget-vs-actuals variance analysis every period.
- Prepare the data and charts behind the board deck.
- Answer ad-hoc "why is this number what it is?" questions from the CFO/VP Finance — on demand, under pressure.

### 5.3 Goals
- **Stop being a spreadsheet jockey** and do actual analysis.
- Close the variance-explanation loop in minutes, not days.
- Survive the forecast cycle without working three straight weekends.
- Get promoted by looking strategic, not by formatting cells.

### 5.4 Pain Points
- **The model is fragile** — one broken link or wrong cell reference and the forecast is wrong.
- Variance analysis is manual archaeology across exports.
- Every CFO ad-hoc question is a half-day fire drill.
- Headcount/workforce planning lives in yet another spreadsheet that never reconciles to the budget.
- They are a single point of failure and they know it.

### 5.5 Objections
- *"I don't have time to implement a tool during forecast season."*
- *"Will this actually work on my messy data, or just a clean demo?"*
- *"Is this going to replace my job?"* (real, often unspoken)
- *"I've tried Adaptive/Anaplan — it took forever and I went back to Excel."*

### 5.6 What motivates them
- **Getting their nights and weekends back.**
- Looking brilliant in front of the CFO with instant, correct answers.
- Doing the strategic work they were hired to do, career advancement.

### 5.7 What scares them
- Being made redundant by AI (handle directly: position as their **leverage**, not their replacement).
- Championing a tool that fails publicly and burns their credibility.
- A long implementation that eats the time they don't have.

### 5.8 Why they would buy
- Nexora answers variance and forecast questions **directly against their data** with the **FP&A Specialist** agent — the exact toil they hate.
- Rolling-forecast support (3+9 / 6+6 / 9+3) matches their actual cycle vocabulary.
- Fast to stand up (configuration, not custom code) — fits inside a real calendar.
- As a design partner they get roadmap influence — they help build the tool they wish existed.

### 5.9 Why they would NOT buy
- Mid-forecast-cycle with zero slack (time the outreach to *after* a close/board cycle).
- Fears job replacement and quietly sabotages instead of championing.
- Can't get a CFO/VP Finance sponsor, so the deal stalls with no economic buyer.
- Tried-and-burned BI/FP&A-tool scar tissue not addressed.

### 5.10 The one message that LANDS
> **"Nexora is the analyst that does your variance archaeology and ad-hoc CFO questions for you — cited and grounded — so you do the analysis, not the spreadsheet plumbing. You stop being the single point of failure."**

### 5.11 The one message that REPELS
> *"Nexora replaces your FP&A function."* — Triggers the job-loss fear and turns your best champion into a silent blocker. Always frame as augmentation: *"makes you the person who answers in seconds."*

---

## 6. VP Finance — Champion or Economic Buyer (segment-dependent)

### 6.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | VP Finance, VP of Finance & Operations, Head of Finance (in companies with no CFO yet) |
| **Reports to** | CFO (when one exists); CEO (in ~$50–150M companies with no CFO) |
| **Owns** | The forecast and the close *jointly* — the operational bridge between FP&A and accounting |
| **Team size** | The whole finance org of 5–25, often as the senior-most finance hire |
| **Committee role** | **Champion in larger orgs; the economic buyer in companies with no CFO.** Owns the number day-to-day |

### 6.2 Responsibilities
- Run finance operationally — own both the forecast and the close in mid-market companies.
- Be the CEO's finance partner when there is no CFO.
- Manage the FP&A and accounting teams and the monthly operating rhythm.
- Build the board materials in companies where the CFO is part-time/fractional or absent.

### 6.3 Goals
- Run a tight monthly operating cadence with no fire drills.
- Give the CEO/Board confident, fast answers.
- Build finance leverage without over-hiring — do more with the team they have.
- Earn the CFO title (often the unspoken career goal).

### 6.4 Pain Points
- Wearing both the FP&A and Controller hats; stretched across forecast *and* close.
- The CEO asks operational finance questions that require pulling three reports.
- Headcount is the biggest cost line and it lives in a spreadsheet disconnected from the budget.
- No senior analyst bandwidth to delegate to.

### 6.5 Objections
- *"I'm the only senior finance person — I can't run an implementation."*
- *"Show me this works on our data, not a canned demo."*
- *"How is this different from the BI tool we already pay for?"*
- *"Is the security real, or is this a startup that hasn't thought about it?"*

### 6.6 What motivates them
- Operational control and a calm close-and-report rhythm.
- Being the CEO's trusted, fast finance partner.
- Career advancement toward CFO.

### 6.7 What scares them
- A visible failure in front of the CEO with no CFO to absorb it.
- Spreading themselves thinner on a tool that doesn't pay off fast.
- Wrong numbers reaching the CEO/Board with their name on them.

### 6.8 Why they would buy
- They feel **both** the FP&A pain and the Controller pain — Nexora's variance + workforce + data-quality story hits all of it.
- In no-CFO companies they *are* the economic buyer — shorter committee, faster decision.
- **Workforce Finance** + **FP&A Specialist** agents address their two biggest lines (headcount + forecast).

### 6.9 Why they would NOT buy
- Genuinely has no bandwidth and no analyst to delegate the pilot to.
- Defers to a fractional/incoming CFO who hasn't engaged yet.
- No trigger; the current rhythm, while painful, is survivable.

### 6.10 The one message that LANDS
> **"You're carrying both the forecast and the close with a team that's too small. Nexora gives you a finance analyst on tap — cited, grounded answers on variance and headcount — so the CEO gets a fast answer and you don't add a hire."**

### 6.11 The one message that REPELS
> *"This requires a dedicated project team and a multi-month rollout."* — A VP Finance who *is* the team hears "you don't have time for me" and disengages. Lead with *fast, configured, runs alongside you.*

---

## 7. Finance Transformation Leader — The Internal Sponsor

### 7.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | Director/VP of Finance Transformation, Head of Finance Systems, Finance Operations Director, FP&A Transformation Lead, Finance Process Excellence |
| **Reports to** | CFO or VP Finance |
| **Owns** | The mandate and budget to change how finance works — tools, process, data |
| **Where they exist** | Larger end of the ICP (~$300M+), PE-backed value-creation plans, post-merger orgs |
| **Committee role** | **Champion / internal sponsor with budget.** The closest thing to a dream buyer — change is literally their job |

### 7.2 Responsibilities
- Run the finance modernization roadmap — ERP/HRIS migrations, FP&A tooling, automation.
- Evaluate, select, and roll out finance technology.
- Deliver measurable efficiency/cycle-time outcomes the CFO and PE sponsor underwrote.
- Manage change across a skeptical finance team.

### 7.3 Goals
- Demonstrate **measurable transformation** — faster close, faster forecast, less manual effort.
- Land a flagship modern-AI win that proves the roadmap is working.
- Hit the value-creation milestones (especially in PE-backed companies).
- Build a reputation as the person who modernized finance.

### 7.4 Pain Points
- Big-platform rollouts (Anaplan, Workday Adaptive) are slow, expensive, and stall.
- Hard to *show* transformation value quickly; everything is an 18-month program.
- Finance team resists change; adoption is the real battle.
- Pressure from the CFO/PE sponsor for visible wins this year.

### 7.5 Objections
- *"You're early-stage. Can you survive long enough to be part of my roadmap?"*
- *"How does this fit my existing stack — ERP, HRIS, BI?"*
- *"Prove the time-to-value. I'm tired of 18-month programs."*
- *"What's the security and architecture story I can take to my CIO?"*

### 7.6 What motivates them
- **Speed to demonstrable value** — a win they can show this quarter.
- Being on the front of the AI-in-finance curve.
- Roadmap influence — co-building is exactly their mandate.

### 7.7 What scares them
- Betting their reputation on a vendor that disappears.
- Another stalled, expensive program that makes them look bad.
- Low adoption — the team goes back to Excel.

### 7.8 Why they would buy
- **They have budget and mandate to change tooling** — the rarest and most valuable trait in the committee.
- "Configuration not custom code, fast to stand up" is the exact antidote to their Anaplan scar tissue.
- The design-partner model (roadmap influence, co-build) *is* their job — model it on Databricks Early Access / Scale AI / Palantir Forward-Deployed (`03-design-partner-program.md`).
- The **Finance Business Partner** agent + "Ready for Design Partners" certification give them a credible story to take upward.

### 7.9 Why they would NOT buy
- Vendor-viability fear wins — won't anchor a roadmap on a pre-PMF startup without the certification + a co-build commitment.
- Already mid-flight on a competing platform with sunk cost.
- Can't get CIO security sign-off, so the program stalls.

### 7.10 The one message that LANDS
> **"You can show your CFO a working AI finance analyst on your real data in weeks, not an 18-month Anaplan program — and as a design partner you steer the roadmap. We're certified Ready for Design Partners."**

### 7.11 The one message that REPELS
> *"This is a multi-quarter enterprise platform implementation."* — That is precisely the pain they're escaping. Also avoid over-promising native connectors as live — be honest that QuickBooks/NetSuite/Workday/Coupa/Adaptive connectors are roadmap, not live (CSV/Excel + Databricks are live today). Transformation leaders punish vendors who blur roadmap and reality.

---

## 8. CIO / IT & Security — The Technical Evaluator (Blocker)

### 8.1 Snapshot

| Attribute | Detail |
|---|---|
| **Titles** | CIO, VP IT, Head of Information Security, CISO, IT Director, Head of Data |
| **Reports to** | CEO or COO; CISO sometimes to CIO |
| **Owns** | Security, data governance, integration, vendor risk, the architecture standard |
| **When they appear** | Pulled in by Controller/CFO for security review before a pilot touches real data, and again before a paid contract |
| **Committee role** | **Technical evaluator and hard blocker.** Cannot say "yes" to the deal, can absolutely say "no" |

### 8.2 Responsibilities
- Approve or reject vendors on security, data residency, and architecture.
- Own integration with the ERP/HRIS/data warehouse.
- Run vendor risk and (for larger orgs) procurement security review.
- Protect the company from data breaches and shadow IT.

### 8.3 Goals
- No breaches, no audit findings, no shadow IT.
- Clean, standards-compliant integrations.
- A defensible vendor-risk posture they can show the board/auditors.

### 8.4 Pain Points
- Finance buying SaaS without looping in IT (shadow IT) — happens constantly.
- Early-stage vendors with weak or unproven security.
- Data sprawl and uncontrolled access to sensitive financial data.
- Pressure to approve fast while doing real diligence.

### 8.5 Objections
- *"Multi-tenant — how is my data isolated from other customers?"*
- *"Where does the data live? Who can access it? What's your auth model?"*
- *"Has this been pen-tested? Do you have SOC 2?"*
- *"What's your access control granularity?"*

### 8.6 What motivates them
- Verifiable, standards-based security they can defend.
- Clean architecture and minimal integration risk.
- Not being the person who approved the vendor that caused a breach.

### 8.7 What scares them
- Approving an immature vendor that leaks financial data.
- An unauthenticated endpoint or weak tenant isolation.
- Being bypassed by finance and inheriting the risk anyway.

### 8.8 Why they would buy (approve)
- **Multi-tenant SaaS on Next.js + Databricks SQL (Delta)**, **Clerk authentication**, **RBAC with 7 roles** (SystemAdmin, OrganizationAdmin, CFO, FPA, Controller, Leader, ReadOnly), **per-tenant `clientId` data isolation** — a concrete, credible architecture story.
- **Certified "Ready for Design Partners"** (code + build certified) gives them documentation to file (`../docs/commercial-readiness/CERTIFICATION.md`).
- Ingests CSV/Excel + Databricks today, so the pilot can run on a controlled data extract without deep integration.

### 8.9 Why they would NOT buy (block)
- **Full commercial security rating is pending a live penetration test** — for a security-conservative org, the absence of a completed pen test / SOC 2 can be a hard stop until done. Be transparent and scope the pilot to non-production / de-identified or sample data accordingly.
- No SOC 2 and no compensating controls acceptable to them.
- Perceives vendor as too immature to trust with financial data at all.

### 8.10 The one message that LANDS
> **"Multi-tenant isolation by clientId, Clerk auth, RBAC across 7 finance roles, on Databricks Delta. We're certified Ready for Design Partners; the full commercial rating is pending a scheduled live pen test — and we'll scope the pilot data accordingly so you approve with eyes open."**

### 8.11 The one message that REPELS
> *"Don't worry about security, finance is already on board."* — Implying IT can be bypassed makes the CIO a permanent enemy. Equally fatal: overstating the security posture (claiming SOC 2 or a completed pen test you don't have). A CIO who catches one inflated claim disbelieves all of them. Lead with exactly what is certified and exactly what is pending.

---

## 9. Buying-Committee Playbook (cross-persona)

### 9.1 Who plays which role, by company size

Size bands below map to the ICP's tiers (`01-ideal-customer-profile.md`): the first two rows are Tier 1 ($30M–$300M, 200–2,000 FTE — the design-partner sweet spot), the third is the Tier 2 edge ($300M+, where committee buying and a CISO gate appear).

| Company size | Economic buyer | Champion | Blocker(s) | Technical evaluator |
|---|---|---|---|---|
| $30–150M (no CFO; sweet spot) | VP Finance / Head of Finance | VP Finance or FP&A Mgr | Controller | Fractional IT / Head of Data |
| $150–300M (CFO-led) | CFO | FP&A Director | Controller, CIO | CIO / Head of Data |
| $300M+ (Tier 2 edge) | CFO | Finance Transformation Leader or FP&A Director | Controller, CISO | CISO / CIO |

### 9.2 The entry-point decision

| Trigger present | Best first contact | Why |
|---|---|---|
| New CFO <12 months | CFO direct (warm intro strongly preferred) | They are re-tooling and want a win; warm intro converts ~30–50% vs ~1–5% cold |
| Forecast accuracy / board pressure | FP&A Director | They live the pain; cheapest to reach; will champion up |
| ERP/HRIS migration, PE value-creation | Finance Transformation Leader | Has budget + mandate; change is their job |
| Audit / restatement / data chaos | Controller (carefully) | Pain is acute but they're a blocker — frame as data integrity, not AI |

> **Default play for a no-brand vendor:** enter through the **FP&A Director or Finance Transformation Leader** as champion (highest reply + conversion — see the outreach sequences in `05-outreach-sequences.md`; `04-outreach-strategy.md` *forthcoming*), validate pain in discovery (`06-discovery-process.md` *forthcoming*; use the discovery instrument in `../delivery/01-financial-intelligence-assessment-framework.md` until it lands), then get sponsored *up* to the CFO and *past* the Controller + CIO. Cold-CFO-first works only with a strong warm intro and an active trigger.

### 9.3 Buying triggers that activate any persona
New CFO in seat <12 months · fundraise (new capital, new board scrutiny) · ERP/HRIS migration (NetSuite/SAP/Workday) · audit finding or restatement · board pressure on forecast accuracy · FP&A hiring freeze (do more with fewer) · M&A integration (two finance orgs to merge) · PE value-creation plan with finance-efficiency milestones.

### 9.4 Realistic conversion math (early-stage, no brand — caveat: small-N, directional)

| Stage | Rate (range) | Note |
|---|---|---|
| Cold outreach → positive reply | 1–5% | Lower for cold CFO; higher with a specific trigger + named pain |
| Warm intro → meeting | 30–50% | Worth disproportionate effort; this is the real channel pre-brand |
| Discovery → pilot/design-partner | 25–40% | Higher when a champion + active trigger are both present |
| Pilot → paid conversion | 30–60% | Design-partner motion targets the top of this band via co-build + value proof |

### 9.5 The committee message matrix (laminate this)

| Persona | Say this | Never say this |
|---|---|---|
| CFO | "Cited answers to your board's hardest question; never fabricates a number." | "Auto-generates your board commentary." |
| Controller | "Every number cites its source; flags low-confidence data." | "AI generates the numbers." |
| FP&A Director | "Does your variance archaeology so you do the analysis." | "Replaces your FP&A function." |
| VP Finance | "A finance analyst on tap — no new hire." | "Needs a dedicated project team." |
| Transformation Leader | "Working AI on your data in weeks; you steer the roadmap." | "Multi-quarter platform implementation." |
| CIO / Security | "Tenant isolation, Clerk auth, RBAC-7; certified for design partners, pen test scheduled." | "Don't worry about security." / overstated/false compliance claims |

---

## 10. Anti-Personas (do not pursue as design partners)

| Anti-persona | Why disqualify |
|---|---|
| Pre-revenue startup / <$25M, finance = 1 bookkeeper | No real FP&A pain, no data, no budget, no committee — wastes the founder's scarce time |
| Enterprise >$1.5B with mature Anaplan + 30-person FP&A | Long procurement, heavy security bar, incumbent sunk cost — wrong stage for a design partner |
| Org mid-ERP-cutover with no clean data anywhere | Nexora needs ingestible actuals (CSV/Excel/Databricks); no data = no value, bad first reference |
| "Just give me dashboards" buyer | Wants BI (Power BI/Tableau), not decision intelligence — will churn and misrepresent the category |
| Security-absolutist that requires completed SOC 2 + pen test before any pilot | Cannot transact until the full commercial rating lands; revisit post-pen-test, don't burn cycles now |

---

## 11. Persona Validation & Maintenance

- **Test every persona against the next 10 discovery calls.** Where the real human diverges from this profile (titles, pain language, fears), update the persona — this is a living operating doc, not a fixed asset.
- **Capture the actual words** prospects use for pain and objections; rewrite the "message that lands/repels" lines in *their* language.
- **Recheck capability claims** against current product state every release (live vs. roadmap vs. target-state per `../delivery/08-design-partner-program.md`); never let this doc overstate what ships today.
- **Owner:** Sin City Analytics GTM. **Review cadence:** every 10 closed/lost discovery cycles or each product release, whichever first.

---

*End of Document 02 — Target Buyer Personas.*
