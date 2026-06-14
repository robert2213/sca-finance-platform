# Outreach Strategy — Design Partner Acquisition

*How a founder with no brand recognition reaches the right finance leaders, earns a reply, and converts attention into a design-partner conversation.*

| | |
|---|---|
| **Document** | 04 — Outreach Strategy |
| **Part of** | Design Partner Acquisition System (GTM Operating System) |
| **Version** | 1.0 |
| **Owner** | Sin City Analytics GTM |
| **Last Updated** | 2026-06-13 |
| **Status** | Active |

---

## 0. Purpose, Scope, and How to Use This Document

This is the channel strategy for landing Sin City Analytics' **first 3–5 design partners** for the Finance Intelligence Platform (codename **Nexora**). It tells the founder *who to contact, what to say, what NOT to say, what response rates to expect, and how to qualify a reply* — for each of five channels: **LinkedIn, Email, Referral, Network, Community.**

**This document is the strategy layer.** It deliberately does NOT contain full scripts — those live in `05-outreach-sequences.md` (the actual touch-by-touch cadences with copy). This document gives you the *angles, themes, and guardrails* that those scripts execute. Where a one-line example helps anchor a theme, it's marked `Example angle (not a full script — see 05)`.

**Reads alongside:**
- `01-ideal-customer-profile.md` — who qualifies as a target account (the WHO at the company level)
- `02-buyer-personas.md` — the human you're writing to (CFO, VP FP&A, Controller, etc.)
- `03-design-partner-program.md` and `../delivery/08-design-partner-program.md` — the offer you're reaching out *about* (the program charter)
- `05-outreach-sequences.md` — the literal send-ready cadences
- `06-discovery-process.md` / `07-qualification-framework.md` — what happens after a positive reply
- `11-shortest-path-to-first-customer.md` — the sequenced 90-day plan this strategy feeds

**Founder-practical caveat on all numbers:** every response-rate range in this document is an industry-realistic band for an *early-stage, no-brand, founder-led B2B SaaS selling into finance*, not a Sin City Analytics measured result. Finance leaders are among the harder ICPs to reach (high seniority, low tolerance for vendor noise, real regulatory/data-sensitivity caution). Treat the **low end of every range as your planning assumption** until you have 30+ data points of your own. Caveats are stated per channel.

---

## 1. The Strategic Frame: Why Channel Choice Is the Whole Game Pre-Brand

### 1.1 The core constraint

Sin City Analytics has **no brand recognition**. A finance leader has never heard of Nexora, has nothing to Google that reassures them, and gets pitched by FP&A/BI/AI vendors weekly. The product is genuinely differentiated (guardrailed AI finance analyst, cited answers, fast to stand up, just certified "Ready for Design Partners") — but *differentiation is invisible until you earn 90 seconds of attention.*

Therefore the entire job of outreach pre-PMF is to **convert the founder's three real assets into a first conversation:**

1. **Founder credibility** — finance-domain depth, the ability to talk like a finance person, not a software vendor.
2. **A genuinely scarce, valuable offer** — a *design partner* slot, not a "demo." Co-build, roadmap influence, white-glove, founder-direct. (This is the Databricks Early Access / Scale AI Design Partner / Palantir Forward-Deployed motion — see `03`.)
3. **A demonstrable outcome** — the platform answers a real finance question with cited data, fast.

### 1.2 The design-partner offer reframes every channel

You are NOT selling software. You are offering a **limited design-partner collaboration**: a small number of finance teams who help shape the product, get founder-level attention and a heavily favorable commercial arrangement, and become the reference logos. This reframe matters for outreach because:

- It lowers the buyer's risk perception ("I'm not buying, I'm advising").
- It flatters the buyer ("you were selected / your problem is exactly what we're building for").
- It creates legitimate scarcity ("we're taking 3–5 partners this cohort").
- It gives the founder permission to ask for *time and feedback*, not budget — a far easier first ask.

Every channel below should carry this frame, not a "buy our platform" frame.

### 1.3 What "good" looks like at the top of the funnel

| Funnel stage | Definition | Realistic early-stage conversion (no brand) |
|---|---|---|
| **Touch → Positive reply** | A reply expressing interest / curiosity / "tell me more" (not an auto-no) | Cold: 1–5%. Warm intro: 30–50%. Network/known: 40–60%. |
| **Positive reply → Discovery call held** | A scheduled, attended 30–45 min discovery (`06`) | 40–60% of positive replies |
| **Discovery → Pilot / design-partner agreement** | Qualified, agrees to a scoped pilot (`09-pilot-framework.md`) | 20–40% of discoveries (higher for design-partner framing than for a sales pilot) |
| **Pilot → Paid** | Converts to a paying customer post-pilot | 30–50% for well-scoped design-partner pilots with a pre-agreed success definition |

**Implication:** to land 3–5 design partners you likely need ~10–15 quality discovery calls, which means ~25–40 positive replies, which — on cold channels alone — would mean ~1,000–3,000 cold touches. **That math is why a no-brand founder cannot win on cold volume alone.** Warm and network channels do the heavy lifting; cold channels backfill and create *future* warmth. This drives the ROI ranking in Section 8.

---

## 2. Channel 1 — LinkedIn

LinkedIn is the founder's single best **scalable-but-personal** channel into finance leaders. It combines identity (they can see who you are and that you're a real finance-credible founder), warm-signal discovery (job changes, posts, mutual connections), and a low-friction first touch.

### 2.1 Who to contact

| Layer | Titles / roles | Why them | Notes |
|---|---|---|---|
| **Economic buyer** | CFO, VP Finance (at companies ~$20M–$500M revenue / ~50–1,500 employees — see `01` for full ICP bands) | Owns the forecast-accuracy and decision-support pain; can authorize a design-partner slot | Hardest to reach directly; best via warm path or after a champion |
| **Champion / day-to-day pain owner** | VP/Director/Head of FP&A, Director of Finance, Finance Manager (FP&A) | Lives the variance-analysis, rolling-forecast, board-deck grind daily; most likely to *reply* and most likely to feel the pain acutely | **Primary LinkedIn target.** Reply rate and pain resonance are highest here. |
| **Technical/security validator** | Controller, VP Accounting, Head of FinOps/Finance Systems | Cares about data isolation, RBAC, source-of-truth, audit; validates the Databricks/Clerk/RBAC posture | Reach later in the deal, or use as a side-door if FP&A is unresponsive |
| **Adjacent decision-influencers** | CIO / VP Data / Head of Analytics (where finance reporting is owned jointly with a BI team) | The "we already have Power BI/Tableau" gatekeeper; CIO Finance Partner agent speaks to them | Useful when the account already has a BI investment you must position against |

**Targeting filters (use Sales Navigator if you can justify ~$99/mo — it pays for itself fast at this stage):**
- Title contains: FP&A, Financial Planning, Finance Director, VP Finance, CFO, Controller
- Company headcount 50–1,500; or revenue band per ICP
- Geography you can support and (ideally) be in-timezone with
- **Buying-trigger signals** (highest-priority list — see Section 7 for the full trigger taxonomy): "Posted a job" filter showing FP&A/finance-systems hiring; recent job change ("changed jobs in last 90 days") flagging a **new CFO/VP FP&A in seat <12 months**; company recently announced a **fundraise**; company recently announced an **ERP/HRIS migration** (NetSuite, Workday, SAP).
- 2nd-degree connections first (a shared connection is a warm-up even if you cold-touch).

### 2.2 What to say — themes and angles (scripts in `05`)

The LinkedIn motion is **two-step: connect (with or without a note) → conversation after accept.** Do not pitch in the connection request.

**Theme A — Peer-to-peer, finance-to-finance (default).** Lead as a finance-credible founder talking to a finance leader about a shared problem, not a vendor. The differentiator is that you understand their world: "close the books, then spend three days rebuilding the board deck and still can't explain the variance."

> *Example angle (not a full script — see 05):* "Building something for FP&A teams drowning in variance explanations and rolling-forecast rebuilds — would value your read on whether it's solving a real problem or a made-up one."

**Theme B — The specific, ownable problem.** Anchor on ONE concrete capability the persona feels viscerally, not the whole platform. For an FP&A leader: budget-vs-actuals variance you can *ask in plain English and get a cited answer*. For a CFO: board-ready commentary that's defensible because every number cites its source. For a Controller: per-tenant isolation + RBAC + "never fabricates numbers" guardrails.

**Theme C — The design-partner invitation (the offer).** You're selecting a few finance teams to co-build with; their input shapes the roadmap; they get founder-direct attention and favorable terms. Scarcity is real ("3–5 partners this cohort").

**Theme D — Outcome / proof.** Where you can, show, don't tell: a 30-second Loom of the platform answering a real finance question with a cited source, or an offer to send one. Demonstrable > descriptive.

**Theme E — Trigger-relevant relevance.** If they just changed jobs / their company just raised / they're hiring FP&A, name it lightly: a new finance leader has a 12-month window to fix the forecasting/reporting stack and a real reason to talk now.

**Engagement-first variant (non-DM):** comment substantively on their posts and on finance/FP&A thought-leaders' posts for 2–4 weeks *before* you DM. This converts cold into warm and is the single highest-leverage LinkedIn habit for a no-brand founder.

### 2.3 What NOT to say

- **Don't pitch in the connection request.** A pitch-on-connect tanks accept rates and burns the contact.
- **Don't lead with the tech stack.** "Multi-tenant Next.js + Databricks Delta with Clerk and 7-role RBAC" is a *trust accelerator later*, meaningless as an opener. Lead with the finance problem.
- **Don't say "AI" as the headline.** Finance leaders are AI-fatigued and AI-skeptical about *their numbers*. Lead with the outcome ("answers, cited, fast"); let the guardrails ("never fabricates, always cites the source, flags low-confidence data") do the AI reassurance work.
- **Don't overclaim.** No "trusted by leading CFOs," no fake logos, no "industry-leading." You have no brand; false social proof is instantly detected and fatal.
- **Don't ask for a 30-minute demo as the first CTA.** Too big an ask cold. Ask a *question* or offer a *Loom*.
- **Don't mass-blast identical DMs.** LinkedIn throttles, and finance leaders pattern-match spray-and-pray instantly.
- **Don't claim certifications you don't have.** You are "code + build certified, Ready for Design Partners"; the **full commercial security rating is pending a live penetration test.** Say exactly that if asked — precision builds trust.

### 2.4 Expected response rates (with caveats)

| Action | Realistic range (no brand) | Caveats |
|---|---|---|
| Connection-request accept (cold, no note, relevant 2nd-degree) | 25–40% | Higher with a shared connection; lower if profile looks "salesy" |
| Connection-request accept (with a short, non-pitchy, relevant note) | 30–50% | Personalization + trigger relevance is the lever |
| DM positive reply after accept (cold) | 5–15% | Of those who accepted; engagement-first warm-up can push this higher |
| DM positive reply (after 2–4 weeks of genuine engagement on their content) | 15–30% | This is the no-brand founder's edge — earned familiarity |
| Founder's own organic post → inbound finance-leader reply | Highly variable | Compounds over months; near-zero early, meaningful by month 3+ |

*Caveat:* LinkedIn enforces ~weekly connection-request limits (roughly 100–200/wk depending on account standing) and flags automation. Treat it as a **craft channel, ~15–30 thoughtful touches/day**, not a volume machine.

### 2.5 Qualification criteria (does this reply deserve a discovery call?)

Qualify *fast* against the ICP (`01`) before booking time. Minimum bar to advance:
- Title in the buyer/champion/validator set above (real finance ownership, not a tangential role).
- Company in the ICP size/revenue band; not pre-revenue, not a Fortune-50 with a 9-month procurement cycle you can't survive.
- A plausible **trigger** present or surfaced (new leader, raise, migration, board pressure on forecast accuracy, audit/restatement, FP&A hiring freeze, M&A — see Section 7).
- Expressed *problem* resonance, not just politeness ("yes, variance explanations eat my month" > "sure, send info").
- Reachable cadence: willing to take a 30-min call within ~2 weeks.

If it clears the bar, hand to the discovery process (`06`) and qualification framework (`07`).

---

## 3. Channel 2 — Email

Email is the **highest-control, most-scalable cold channel**, but also the **lowest-conversion per touch** for a no-brand founder into finance leaders. Its real value early is (a) reaching people who ignore LinkedIn, (b) following up rigorously, and (c) carrying the heavier proof assets (a one-pager, a Loom, the design-partner charter).

### 3.1 Who to contact

Same persona set as LinkedIn (Section 2.1), with two tactical adjustments:
- **Prioritize the champion (FP&A leader) for cold email.** CFOs have the most-guarded inboxes and the most gatekeeping; an FP&A director who feels the pain daily is both more reachable and more likely to forward you up.
- **Build the list from trigger events**, not from a generic "all CFOs in a region" pull. A trigger-targeted list of 150 is worth more than a generic list of 3,000. Sources: company funding announcements (raise = trigger), exec-hire news (new CFO/VP FP&A), ERP/HRIS migration mentions, job boards (FP&A/finance-systems reqs), and the founder's own CRM/contacts.

### 3.2 What to say — themes and angles (scripts in `05`)

**Theme A — One problem, one sentence, one ask.** Cold email lives or dies on a *short, specific, relevant* subject + first line. Anchor on a single capability and a single trigger. Subject lines should read like a peer's note, not a campaign.

> *Example angle (not a full script — see 05):* Subject: "variance explanations after a $40M raise" — first line names their raise and the specific pain it creates for FP&A.

**Theme B — Credibility-by-specificity.** Because you have no brand, your credibility is *how precisely you describe their problem.* "After a raise, your board now wants monthly forecast-accuracy and variance commentary your current Excel/BI stack wasn't built to produce on a timeline" earns the read.

**Theme C — Design-partner offer, low-risk ask.** The CTA is *not* "buy" and *not even* "demo" on the first touch — it's "worth a 20-minute conversation?" or "want me to send a 2-minute Loom of it answering a question like yours?" Make saying yes nearly free.

**Theme D — Proof asset on follow-up, not first touch.** Reserve the Loom / one-pager / the certification note ("Ready for Design Partners; full commercial rating pending live pen test") for follow-ups 2–3, so each touch adds new value rather than nagging.

**Theme E — The graceful break-up.** The final touch (the "permission to close the loop") often pulls the highest reply rate of the whole sequence. Theme: "I'll stop here — if forecast accuracy / variance / board reporting becomes a fire drill, I'm one reply away."

### 3.3 What NOT to say

- **No walls of text.** A finance leader scans on a phone. 5–7 sentences max on the first touch.
- **No feature lists.** Do not enumerate all eight agents (CFO Advisor, FP&A Specialist, Procurement Advisor, Workforce Finance, External Labor Advisor, CIO Finance Partner, Finance Business Partner, Data Quality Advisor). Name *one* relevant capability.
- **No "AI-powered revolutionary platform" language.** Buzzwords are a credibility tax with this audience.
- **No fake personalization tokens.** A broken `{{first_name}}` or a wrong company fact is an instant delete and a brand-burn.
- **No misrepresenting security maturity.** Don't imply SOC 2 / completed pen test you don't have. State the real posture.
- **Don't attach a deck on a cold first touch.** Attachments hurt deliverability and trust; link a Loom instead, later in the sequence.
- **Don't send from a domain you'll burn.** Use a subdomain or dedicated sending domain with SPF/DKIM/DMARC configured; warm it up. (Operational note — keeps you out of spam.)

### 3.4 Expected response rates (with caveats)

| Email type | Positive-reply range | Caveats |
|---|---|---|
| Cold, untargeted, generic | <1% | Don't do this; included as a floor |
| Cold, well-targeted + trigger-relevant + personalized | 1–5% positive reply | Finance-leader inboxes are guarded; 2–3% is a *good* outcome for a no-brand founder |
| Cold sequence (4–6 touches over 2–3 weeks vs. single send) | 2–8% cumulative positive | Follow-ups roughly double single-touch yield; the break-up touch often over-indexes |
| Email *after* a LinkedIn touch or engagement (multi-thread) | 5–12% | Multi-channel lift is real; this is the recommended way to use email |
| Email to a referred / warm contact | 30–50% | This is no longer "cold email" — see Referral channel |

*Caveats:* deliverability is a precondition (auth your domain, keep volume low and human, <~30–50 cold sends/day from a warmed domain). Open-rate is no longer reliably measurable post-Apple MPP — **manage to reply rate, not opens.** Reply rates for finance/CFO ICPs run *below* the SaaS-wide average; plan conservatively.

### 3.5 Qualification criteria

Identical bar to LinkedIn (Section 2.5). Two email-specific additions:
- **Treat "send me more info" as a soft signal, not a yes.** Qualify it: respond with a single qualifying question + a Loom, and see if they engage. Info-requests that go dark are not pipeline.
- **A forward to a colleague is a strong buy-signal** ("looping in our FP&A lead") — treat it as a referral and adjust expectations upward.

---

## 4. Channel 3 — Referral

Referrals are the **highest-conversion channel available to a no-brand founder** and the one most under-used by first-time founders because it feels like "asking for favors." It is not — a warm intro is the single most valuable currency in early B2B finance sales.

### 4.1 Who to contact

There are two distinct referral motions; run both.

**A. People who can refer you (the connectors):**

| Connector type | Why they refer | What to ask for |
|---|---|---|
| **Your existing network** who *know finance leaders* — ex-colleagues, former managers, investors, advisors | They vouch for *you*, which is exactly the credibility a no-brand founder lacks | A named, specific intro to a CFO/VP FP&A, double-opt-in |
| **Accountants, fractional CFOs, FP&A consultants** | They sit on top of dozens of finance orgs and see the pain firsthand; a great recurring source | An intro to a client wrestling with forecasting/board-reporting/variance |
| **Investors / angels / VC platform teams** (if you've raised or are raising) | Portfolio CFOs are a captive, warm, trigger-rich audience (post-raise companies) | Intros into their portfolio finance leaders |
| **Adjacent vendors / system integrators** (NetSuite/Workday implementers, ERP consultants) | They cause your trigger (migrations) and want value-adds for clients | Co-referrals at migration time |
| **Design partners themselves (once you have one)** | A happy partner's peer intro is your best lead — finance leaders trust other finance leaders | A named intro to 1–2 peers in their network |

**B. The targets they refer you *to*** — same ICP/persona set as Sections 2–3, but now reachable warm.

### 4.2 What to say — themes and angles (scripts in `05`)

**Theme A — Make the intro easy to give (the forwardable blurb).** The #1 referral mistake is asking "do you know anyone?" Instead, hand the connector a 3-sentence, copy-pasteable blurb naming exactly what you do, who it's for, and what you're asking (a 20-min design-partner conversation), so all they do is forward it.

**Theme B — Be specific about who you want.** "Introduce me to a VP of FP&A at a 200–800 person company that recently raised or migrated ERP" >> "anyone in finance." Specific asks get fulfilled; vague asks get "let me think about it" (= no).

**Theme C — Double-opt-in, always.** Ask the connector to check with the target first. It protects the relationship, raises show-rate, and signals you're a professional.

**Theme D — Give before you ask (especially with consultants/connectors).** Offer them something — early access, a referral fee structure, co-marketing, a useful intro back. Reciprocity makes the next ask easy.

**Theme E — Close the loop, every time.** Report back to the connector what happened. This is both courteous and the mechanism that keeps referrals *flowing*.

### 4.3 What NOT to say

- **Don't make the connector do work.** No "can you think of who might be a fit?" — you've already named names (from your LinkedIn/email targeting) and you ask for *those* specific intros.
- **Don't put the connector on the spot publicly** or CC the target before the connector has agreed (no surprise intros).
- **Don't oversell to the connector.** They're vouching for you; let your specificity and the offer carry it. Hype makes them hesitant to attach their name.
- **Don't forget to make them look good.** The connector's reputation rides on the intro; show up prepared, be brief with the target, and thank the connector.
- **Don't burn a referral with a hard pitch.** A warm intro buys you a *conversation*, not a license to demo aggressively. Honor the design-partner / discovery frame.

### 4.4 Expected response rates (with caveats)

| Referral type | Positive-reply / meeting-conversion | Caveats |
|---|---|---|
| Warm, double-opt-in intro from a trusted connector | 30–50% convert to a meeting | The gold standard; the trust transfers |
| "Cold-ish" name-drop ("Jane suggested I reach out") without a real intro | 10–20% | Better than pure cold, worse than a real intro |
| Design-partner peer referral (existing happy partner → peer) | 40–60% | Highest-trust path once you have your first partner — engineer for it deliberately |
| Consultant/fractional-CFO channel intro | 25–45% | Depends on how warm the consultant's relationship is |

*Caveat:* referral volume is **capped by your network size and your willingness to ask.** It cannot be your *only* channel because it doesn't scale linearly — but per-touch it is by far the best, so you should *exhaust* it first and continuously replenish it (every discovery call should end with "who else should I talk to?").

### 4.5 Qualification criteria

- Same ICP/trigger bar as Section 2.5 — *a warm intro is not a reason to skip qualification.* A friendly CFO at a non-ICP company is still not a design partner.
- **Connector quality matters:** weight intros by how well the connector knows the target and how credible the connector is to them. A glowing intro from a peer the target respects is worth 5 lukewarm ones.
- Confirm the target has **real pain + a trigger + authority/influence** over a design-partner decision before investing discovery time.

---

## 5. Channel 4 — Network (Founder's Direct Network & Earned Audience)

Distinct from *referral* (where someone else introduces you), **Network** is the founder reaching their *own* direct relationships and building an owned audience that generates inbound over time. For a no-brand founder, this is the fastest path to the *first* 1–2 conversations and the slow-compounding path to durable inbound.

### 5.1 Who to contact

| Network layer | Who | Priority |
|---|---|---|
| **Direct first-degree finance contacts** | Former colleagues, bosses, peers who are now CFOs/VPs of Finance/FP&A leaders; anyone you've worked with in finance/FP&A | **Highest** — start here, week 1 |
| **Dormant-but-real relationships** | People you know but haven't spoken to in 1–3 years who fit the ICP | High — reactivation outreach |
| **Founder communities & peer founders** | Other founders who'll intro you to their CFO or their investors' portfolio CFOs (bridges to Referral) | Medium |
| **Earned audience (owned media)** | LinkedIn followers / newsletter subscribers you build by publishing finance-intelligence content | Compounds — invest from day 1, harvest from month 2–3 |

### 5.2 What to say — themes and angles (scripts in `05`)

**Theme A — The honest founder ask (direct network).** With people who know you, drop the polish. "I left X to build a finance-intelligence platform; I'm taking on a few design partners; can I get 20 minutes of your honest reaction — even if it's that this is a bad idea?" Authenticity + a low-ego ask converts your existing trust.

**Theme B — Reactivation with a reason.** For dormant contacts, lead with a genuine re-connect, then the build. Don't fake warmth; acknowledge the gap ("been too long — here's what I'm up to and why I thought of you").

**Theme C — Build-in-public / thought leadership (earned audience).** Publish, consistently, the *finance-analyst* point of view: the shift from reporting to decision intelligence; why guardrails (cite-every-number, never-fabricate, flag-low-confidence) are the unlock for AI in finance; teardowns of real FP&A problems (variance you can't explain, rolling-forecast pain, board-deck rebuilds). This *is* your brand-building and it makes every other channel warmer.

**Theme D — Founder-as-domain-expert, not founder-as-salesperson.** In every network interaction, demonstrate that you think like a finance leader. That credibility *is* the product pre-PMF.

### 5.3 What NOT to say

- **Don't waste a warm relationship on a soft pitch.** When you have someone's genuine attention, be specific about the design-partner ask — don't "just catch up" and never make the ask.
- **Don't transactionalize a friendship clumsily.** Lead human, then ask; don't make the first contact in years a pure pitch.
- **Don't broadcast-spam your whole network** with an identical "I started a company!" blast and expect pipeline. Segment: finance-ICP contacts get a tailored ask.
- **Don't publish generic AI/finance hot-takes** with no domain substance — it erodes the exact credibility you're trying to build. Every post should teach a finance person something true.
- **Don't oversell certification/maturity** to people who know you — they'll remember if you overstated.

### 5.4 Expected response rates (with caveats)

| Network action | Response / meeting-conversion | Caveats |
|---|---|---|
| Direct outreach to a known first-degree finance contact | 40–60% reply; 30–50% take a call | Your warmest, fastest path to the first conversations |
| Dormant-contact reactivation | 20–40% | Depends on relationship depth and how genuine the re-connect is |
| Owned-content inbound (early, month 0–2) | Near-zero | Compounds; don't judge it on early numbers |
| Owned-content inbound (month 3+, consistent posting) | Small but rising, high-intent | Inbound is the highest-quality lead when it arrives; slow to start |

*Caveat:* your direct network is **finite and front-loaded** — you'll exhaust the high-quality first-degree finance contacts in the first few weeks. Its job is to *start* the engine (first conversations, first proof, first referrals) and to *seed* the earned-audience flywheel — not to sustain volume.

### 5.5 Qualification criteria

- Same ICP/trigger bar (Section 2.5). **Resist the temptation to count friendly chats as pipeline** — a known contact who's enthusiastic but at a non-ICP company, or with no trigger and no authority, is *feedback*, not a design-partner candidate. (Still valuable: ask them for referrals and product feedback.)
- For inbound from content: qualify *harder*, not softer — inbound includes tire-kickers and non-ICP curiosity. Run the same `07` qualification.

---

## 6. Channel 5 — Community

Communities are where finance leaders already gather, learn, and trust peers. For a no-brand founder, the play is **be genuinely useful in the room for weeks before you ever pitch** — community goodwill is slow to earn and instantly destroyed by self-promotion.

### 6.1 Who to contact / where to be

| Community type | Examples (founder to validate current activity) | Who you'll meet |
|---|---|---|
| **Finance/FP&A professional communities** | FP&A-focused Slack/Discord groups; FP&A-practitioner forums; CFO peer networks and councils | FP&A leaders, controllers, finance directors — your champions |
| **CFO peer groups / executive networks** | CFO roundtables, finance-leadership communities, fractional-CFO networks | Economic buyers, fractional CFOs (also referral connectors) |
| **Modern-finance / FP&A content ecosystems** | FP&A newsletters, podcasts, LinkedIn finance-creator audiences, "office of the CFO" communities | Engaged, trigger-rich, peer-trusting finance audience |
| **Vertical / stage-specific founder & operator communities** | Startup CFO groups, post-Series-A operator communities, accelerator alumni networks | Trigger-rich (recently-raised) CFOs + connectors |
| **Local / regional finance & tech events** | CFO dinners, finance meetups, regional tech/finance events | High-trust in-person relationships; great for a founder |

### 6.2 What to say — themes and angles (scripts in `05`)

**Theme A — Contribute, don't pitch.** Answer real questions (variance analysis, rolling-forecast cadences, board-deck commentary, headcount planning, vendor/SOW spend) with substance and zero product mention. You're building reputation as *the finance-AI person who actually knows finance.*

**Theme B — Earn the right to a sidebar.** After consistent helpfulness, DMs and "what are you building?" questions come *to you*. Then — and only then — introduce the design-partner offer, in private, to clearly-ICP members.

**Theme C — Teach the thesis.** Share the reporting → decision-intelligence point of view and the guardrail philosophy as *education*, not advertisement. Let people connect the dots to your product.

**Theme D — Host, don't just attend.** A small founder-run CFO/FP&A roundtable or virtual session (problem-focused, not a demo) positions you as a convener and produces warm relationships at scale. High effort, high payoff.

### 6.3 What NOT to say

- **Don't pitch in public threads.** One promotional post in a no-self-promo community gets you muted, banned, and reputation-damaged among exactly your ICP. This is the cardinal sin.
- **Don't drop links.** Lead with the answer; share an asset only if someone asks or in DM.
- **Don't fake being a practitioner.** This audience detects posers instantly; be a credible founder/domain expert, not a pretend-FP&A-analyst.
- **Don't ignore community rules** on vendor participation — many finance communities explicitly restrict vendors. Respect them or you torch the channel.
- **Don't expect fast pipeline.** Treating community as a lead-gen spigot guarantees you'll behave in ways that get you ejected.

### 6.4 Expected response rates (with caveats)

| Community action | Outcome | Caveats |
|---|---|---|
| Helpful contribution → inbound DM / curiosity | Slow, compounding; high-quality when it lands | Weeks of contribution before meaningful flow |
| DM to an ICP member after established rapport | 20–40% positive | Far better than cold because rapport pre-exists |
| Founder-hosted roundtable → follow-up design-partner conversations | High per-attendee conversion (30–50% of right-fit attendees) | High effort to organize; small audiences; excellent quality |
| Public pitch (anti-pattern) | Negative ROI | Reputation damage; do not do this |

*Caveat:* community is a **brand-and-trust channel, not a volume channel**, with a multi-week lag. Its compounding value (you become a known name in finance circles) is large but unbankable in week 1. Budget it as a parallel investment, not a near-term pipeline source.

### 6.5 Qualification criteria

- Same ICP/trigger bar (Section 2.5).
- **Source-tag the rapport:** the strength of the prior relationship predicts conversion — a member you've genuinely helped converts far better than a name you just met.
- Be doubly disciplined about authority/trigger here: community produces lots of *interested* finance people; only some are at ICP accounts with a real reason to act now.

---

## 7. Buying Triggers — The Targeting Overlay Across All Channels

Triggers are the single biggest multiplier on every channel's response rate. A perfectly-targeted message with no trigger underperforms a decent message timed to a real trigger. Build your lists and time your touches around these.

| Trigger | Why it creates urgency | Most relevant capability / agent to lead with | Detection signal |
|---|---|---|---|
| **New CFO / VP FP&A in seat <12 months** | New leaders have a mandate + window to fix the forecasting/reporting stack and want quick wins | Decision support, rolling forecast, board-ready commentary (CFO Advisor / FP&A Specialist) | LinkedIn job-change filter; exec-hire press |
| **Recent fundraise (Seed→Series C)** | New board expects rigorous forecast accuracy, variance commentary, and reporting their old stack can't produce | Rolling forecasting (3+9/6+6/9+3), budget-vs-actuals variance, board reporting | Funding-announcement databases / news |
| **ERP / HRIS migration** (NetSuite, Workday, SAP, Workday Adaptive) | Data is in motion; appetite for new finance tooling is unusually high; native-connector roadmap is relevant | Data Quality Advisor, financial reporting, workforce planning (Workday HCM connector on roadmap) | Migration announcements; SI/consultant signals; job posts |
| **Audit / restatement / material weakness** | Cited-source, never-fabricate guardrails + data-isolation/RBAC directly address the pain | Guardrailed analysis, Data Quality Advisor, Controller-facing posture | News; controller/audit hiring |
| **Board pressure on forecast accuracy** | The exact problem the platform solves; high emotional urgency for FP&A/CFO | Rolling forecast, variance analysis, executive commentary | Discovery surfacing; board-deck pain in posts/conversations |
| **FP&A hiring freeze / can't hire analysts** | "Do more with the team you have" — platform as analyst capacity, not headcount | FP&A Specialist, Finance Business Partner (analyst-augmentation framing) | Hiring-freeze news; pulled FP&A reqs |
| **M&A / integration** | Consolidating financials, headcount, vendor/contract spend across entities | Vendor spend & contract analysis, workforce finance, reporting consolidation | M&A news |
| **Cloud / vendor / contractor (SOW) spend scrutiny** | CFO mandate to cut/justify spend; procurement + external-labor analysis is directly relevant | Procurement Advisor, External Labor Advisor, CIO Finance Partner (cloud spend) | Cost-cutting news; FinOps hiring |

**Operating rule:** maintain a rolling, trigger-tagged target list. When a trigger fires on an ICP account, it jumps to the top of the queue across LinkedIn + Email + (if available) a referral path — multi-threaded, within days.

---

## 8. Channel ROI Ranking & Recommended Mix

### 8.1 ROI ranking for a founder with no brand

Ranked by **expected return per unit of founder effort** at the pre-PMF, no-brand stage. (ROI = conversion quality × reachability ÷ effort, judged for *this* stage — not absolute volume.)

| Rank | Channel | Why it ranks here | Primary limitation |
|---|---|---|---|
| **1** | **Referral** | Highest conversion (30–60%), trust transfers, directly compensates for no brand | Capped by network size; doesn't scale linearly |
| **2** | **Network** (direct + earned audience) | Fastest path to first conversations; warmest; seeds referrals and content flywheel | First-degree finance contacts are finite/front-loaded |
| **3** | **LinkedIn** | Best *scalable-yet-personal* channel; identity + trigger discovery; engagement-first warms cold | Craft channel, rate-limited; cold DM reply only 5–15% |
| **4** | **Community** | Builds durable trust/brand among exact ICP; great roundtable conversion | Multi-week lag; not a volume channel; easy to get ejected |
| **5** | **Email** | Highest control & scale; reaches non-LinkedIn people; rigorous follow-up | Lowest per-touch conversion (1–5%); deliverability overhead |

**Key insight:** the ranking is *roughly inverse to scalability.* The warmest channels convert best but cap out; the coldest scale but barely convert. The winning early strategy is therefore **sequenced and multi-threaded:** exhaust warm (Referral, Network) for the first wins, run LinkedIn as the always-on personal engine, layer Email for reach and follow-up, and invest in Community for compounding trust — and **multi-thread** the same trigger-targeted account across channels (a LinkedIn touch + an email + a referral path beats any single channel alone).

### 8.2 Recommended channel mix — first 90 days

Allocation of the founder's *outreach* time (separate from build/discovery/delivery time). Aligns with `11-shortest-path-to-first-customer.md`.

| Phase | Days | Referral | Network | LinkedIn | Email | Community | Goal |
|---|---|---|---|---|---|---|---|
| **Phase 1 — Ignite** | 1–30 | 30% | 35% | 20% | 5% | 10% | Mine warm network + referrals for the **first 3–5 discovery calls**; stand up the LinkedIn engine; start publishing; join 2–3 communities. Target: **5–10 discoveries, 1–2 design-partner conversations.** |
| **Phase 2 — Systematize** | 31–60 | 25% | 20% | 30% | 15% | 10% | LinkedIn becomes the steady engine; first cold email sequences live on a warmed domain; harvest referrals from every discovery; convert first community rapport. Target: **first 1–2 design-partner agreements (`09`).** |
| **Phase 3 — Compound** | 61–90 | 25% | 15% | 25% | 20% | 15% | Email scales with proven messaging; **partner-peer referrals** kick in from the first partner; content inbound begins; host a roundtable. Target: **3–5 design partners signed; first pilot(s) underway.** |

**Mix principles:**
1. **Warm-first, always.** Never start a cold channel before you've exhausted the warm path into the same account.
2. **Multi-thread the priority accounts.** Trigger-tagged ICP accounts get hit on 2–3 channels in coordination, not one.
3. **Protect the compounding investments.** Content (Network) and Community pay off in month 3+; don't cut them when month-1 cold numbers look thin.
4. **Let referrals beget referrals.** Every discovery call — won or lost — ends with "who are 1–2 peers I should talk to?" This is the flywheel that makes the mix self-sustaining.
5. **Manage to discovery-calls-booked, not touches-sent.** The leading indicator that matters is qualified conversations, not volume.

### 8.3 Weekly cadence target (founder, solo)

A realistic solo-founder weekly outreach cadence that produces the funnel math in Section 1.3 without burning out or tripping platform limits:

| Activity | Weekly target |
|---|---|
| Referral asks (specific, named, double-opt-in) | 5–10 |
| Network touches (direct + reactivation) | 5–10 (front-loaded in Phase 1) |
| LinkedIn: connection requests | 15–25 |
| LinkedIn: substantive comments/engagement (warm-up) | 10–20 |
| LinkedIn: DMs to accepted/warmed contacts | 10–20 |
| Cold emails (warmed domain, trigger-targeted) | 30–50 (Phase 2–3 only) |
| Community contributions | 3–5 |
| Owned content published | 2–3 posts |
| **→ Resulting discovery calls** | **2–4/week target** |

---

## 9. Measurement, Iteration, and Handoffs

### 9.1 Metrics to track (lightweight — a spreadsheet or simple CRM)

| Metric | Per channel | Why |
|---|---|---|
| Touches sent | Yes | Effort baseline |
| Positive-reply rate | Yes | Channel/message health (the early truth-teller) |
| Discovery calls booked | Yes | The leading indicator that matters |
| Discovery → design-partner conversion | Yes | Qualification + offer health |
| Source of every opportunity | Yes | Tells you where to double down — **tag every lead's origin channel** |
| Trigger present (Y/N) | Yes | Validates the trigger overlay's lift |

### 9.2 Iteration loop

- Review weekly. If a channel's positive-reply rate sits **below the low end of its Section range after ~30 touches**, fix the *message/targeting* before abandoning the channel — most early failures are relevance failures, not channel failures.
- A/B one variable at a time (subject line, opening angle, CTA size). Don't change three things and learn nothing.
- **Double down on the channel actually producing booked discoveries** — for most no-brand finance founders that will be Referral + Network + LinkedIn first, with Email and Community compounding behind.

### 9.3 Handoffs (where this document ends)

- **Positive reply → discovery:** hand to `06-discovery-process.md`; qualify with `07-qualification-framework.md`.
- **Objections during outreach/discovery:** `08-objection-handling.md`.
- **Qualified → design-partner pilot:** `09-pilot-framework.md` and the program charter (`03-design-partner-program.md` / `../delivery/08-design-partner-program.md`).
- **The literal cadences these themes execute:** `05-outreach-sequences.md`.
- **Security/credibility questions raised in outreach:** anchor to the real posture (multi-tenant on Next.js + Databricks SQL Delta, Clerk auth, 7-role RBAC, per-tenant clientId isolation; "Ready for Design Partners" certified — code + build; full commercial rating pending a live penetration test) and `../docs/commercial-readiness/CERTIFICATION.md`.

---

*End of document. Strategy only — for send-ready copy, scripts, subject lines, and touch-by-touch cadences, see `05-outreach-sequences.md`.*
