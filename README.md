<div align="center">

# Nexora AI Finance Department

**A full-stack AI-powered FP&A platform** — six specialized finance agents that analyze budget variances, vendor contracts, contractor spend, headcount, and cloud costs in natural language.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Recharts](https://img.shields.io/badge/Recharts-2-22C55E?style=flat-square)](https://recharts.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[Live Demo](#) · [Case Study](CASE_STUDY.md) · [Architecture](ARCHITECTURE.md) · [LinkedIn Description](LINKEDIN.md)

</div>

---

## What Is This?

Nexora AI Finance Department is a portfolio project that simulates a complete IT Finance team using six domain-specialized AI agents. Each agent handles a distinct area of FP&A and IT Finance — from writing CFO executive summaries to flagging contract expiration risks to calculating contractor burn rates.

Built by an IT Finance / FP&A professional to demonstrate that deep domain expertise and modern software engineering are not mutually exclusive skills.

```
You ask:    "What is driving our budget variance this month?"
FP&A Agent: "The $847K unfavorable variance is concentrated in three areas:
             Cloud Engineering (+$397K, +8.4% over budget) driven by AWS EC2
             scaling for the AI platform; Data & Analytics (+$284K) from
             Snowflake overage above contract minimums; and Applications
             (+$166K) from Deloitte ERP scope expansion without a change order..."
```

No generic AI. No hallucinated numbers. Every figure comes from real financial data structures.

---

## Screenshots

> **Run `npm run dev` and visit `localhost:3000` to see the live application.**

| Page | Description |
|------|-------------|
| [Dashboard](#home-dashboard) | KPI cards · Budget vs. Actual chart · Risk alerts · Executive summary |
| [Agent Command](#agent-command-center) | 6 AI agent cards with capabilities and entry points |
| [CFO Summary](#cfo-summary) | AI-generated executive commentary · Full risk register |
| [FP&A Variance](#fpa-variance-review) | Variance drivers · Trend charts · Cost center detail |
| [Vendor Spend](#vendor-spend) | Contract pipeline · Concentration risk · Renewal calendar |
| [External Labor](#external-labor) | Contractor roster · Burn rate · SOW compliance |
| [Headcount](#headcount) | Open reqs · Fill rate by BU · Salary budget |
| [CIO Briefing](#cio-briefing) | Cloud spend by provider · FinOps opportunities · Talking points |

### Home Dashboard

The dashboard opens with a five-metric status strip, eight KPI cards with sparklines and budget progress bars, an AI-generated executive summary from the CFO Agent, a monthly budget vs. actual vs. forecast bar chart, a live risk alert panel, and a prioritized action list.

### Agent Command Center

Six agent cards, each color-coded by domain, showing capabilities, a sample question preview, and a direct link to that agent's dedicated workspace. An architecture panel explains how mock responses upgrade to real Claude API responses with a single environment variable.

### CFO Summary

Split-panel layout: executive summary box with dark gradient design and numbered key points on the left; interactive CFO Agent chat on the right with character-by-character streaming responses. Below: full risk register with severity indicators and the recommended actions list.

### FP&A Variance Review

Budget vs. actual trend chart with month-over-month variance indicators. Full variance table by business unit with inline utilisation bars. Category breakdown. May cost center detail with highlight rows for >5% variance. FP&A Agent chat for ad-hoc variance questions.

### Vendor Spend

Vendor portfolio table sorted by risk priority, with mini spend-to-contract progress bars, expiry countdown in days, auto-renew flags, and color-coded risk badges. Procurement Agent pre-loaded with contract expiry query. Risk alert panel filtered to procurement flags only.

### External Labor

Over-budget alert banner when contractors exceed SOW. Contractor roster sorted by budget variance with inline progress bars. External Labor Agent chat. Summary table by business unit with variance highlighting.

### Headcount

HC roster sorted by status (open first), with level badges and backfill indicators. Donut chart (filled / open / pending / on leave). Fill-rate progress bars by business unit. Open reqs panel with salary data. Headcount Agent chat.

### CIO Briefing

Area chart of AWS / Azure / GCP monthly spend with provider legend. Cloud provider variance table. IT investment breakdown with horizontal bars. Three provider cards with gradient backgrounds. CIO Finance Partner Agent chat pre-loaded with talking points query.

---

## The Six AI Agents

| Agent | Domain | Sample Questions |
|-------|--------|-----------------|
| 🏦 **CFO Agent** | Executive performance, board narratives, risk commentary | "What are our top 3 financial risks?" · "Prepare board talking points" |
| 📊 **FP&A Agent** | Variance analysis, forecast, cost center deep dives, accruals | "What's driving the variance?" · "Give me the Q2 reforecast" |
| 📋 **Procurement Agent** | Contract pipeline, vendor risk, negotiation strategy | "Which contracts expire this quarter?" · "How do I negotiate with AWS?" |
| 👷 **External Labor Agent** | Contractor burn rate, SOW compliance, conversion economics | "Who is over budget?" · "Model the contractor-to-FTE conversion" |
| 👥 **Headcount Agent** | Open reqs, fill rate, salary budget, backfill analysis | "How many open positions do we have?" · "What is our fill rate?" |
| 💡 **CIO Finance Partner** | Cloud spend, FinOps strategy, IT investment narrative | "Give me cloud spend talking points" · "Build the FinOps savings roadmap" |

Each agent:
- Routes queries using **scored keyword matching** (35+ distinct query types across 6 agents)
- Pulls **live computed figures** from the financial data layer — no hardcoded numbers
- Maintains **conversation history** so follow-up questions are context-aware
- Streams responses **character-by-character** with realistic variable-speed typing
- Surfaces **recommended actions** inline, with owners and due dates

---

## Mock Financial Dataset

Realistic IT Finance data for a mid-size technology organization (FY2026):

| Dataset | Scope | Key Metrics |
|---------|-------|-------------|
| **Monthly Actuals** | 17 cost centers × 5 months = 85 rows | Actual, budget, forecast, variance |
| **Vendors** | 12 contracts | Annual value $12.5M · 4 high-risk · 6 expiring in 180d |
| **Contractors** | 12 active engagements | 4 over budget · 2 ending soon · $118K total excess |
| **Headcount** | 26 approved positions | 22 filled · 8 open · 85% fill rate |
| **Cloud Spend** | AWS/Azure/GCP × 5 services × 5 months | $1.8M YTD · 8.4% over budget |

**Total YTD IT Spend**: ~$18.2M | **Budget Variance**: +$847K (+4.9%)

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | **Next.js 14** (App Router) | Server components keep data computation off the client; file-based routing matches FP&A domain structure |
| Language | **TypeScript 5** | Strict typing on all financial interfaces catches errors at compile time; self-documenting data structures |
| Styling | **Tailwind CSS 3** | Utility-first with custom design tokens for the Nexora brand; consistent spacing without CSS file sprawl |
| Charts | **Recharts 2** | Composable, TypeScript-native; custom tooltips and area fills match the design system |
| AI (Phase 1–3) | **Mock engine** | 35+ keyword-routed response handlers with scored matching; no API cost, demo-ready instantly |
| AI (Phase 4+) | **Anthropic Claude** | Drop-in upgrade via `ANTHROPIC_API_KEY`; API route already wired, system prompt ready |
| Deployment | **Vercel** | Zero-config Next.js deployment; environment variable support for API key upgrade |

---

## Project Structure

```
nexora-ai-finance/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Home Dashboard
│   │   ├── agents/page.tsx           # Agent Command Center
│   │   ├── cfo/page.tsx              # CFO Summary
│   │   ├── fpa/page.tsx              # FP&A Variance Review
│   │   ├── vendors/page.tsx          # Vendor Spend
│   │   ├── external-labor/page.tsx   # External Labor
│   │   ├── headcount/page.tsx        # Headcount
│   │   ├── cio/page.tsx              # CIO Briefing
│   │   └── api/agent/route.ts        # Agent API (mock → Claude)
│   │
│   ├── agents/                       # AI Agent Engine
│   │   ├── agentEngine.ts            # Scored keyword router + conversation context
│   │   ├── dataContext.ts            # Pre-computed financial snapshot
│   │   ├── mockResponses.ts          # Public dispatcher (backward-compatible)
│   │   ├── registry.ts               # Agent definitions + capabilities
│   │   └── responses/                # Per-agent response libraries
│   │       ├── cfo.ts                # 8 query routes
│   │       ├── fpa.ts                # 7 query routes
│   │       ├── procurement.ts        # 5 query routes
│   │       ├── externalLabor.ts      # 5 query routes
│   │       ├── headcount.ts          # 5 query routes
│   │       └── cio.ts                # 5 query routes
│   │
│   ├── components/
│   │   ├── layout/                   # Sidebar · TopBar · ShellClient (mobile)
│   │   ├── dashboard/                # KPICard · VarianceTable · RiskAlerts · etc.
│   │   ├── charts/                   # BudgetVsActual · SpendTrend · Headcount
│   │   ├── agents/                   # AgentChatPanel · AgentCard
│   │   └── ui/                       # Badge · Spinner · Skeleton
│   │
│   ├── data/                         # Mock financial datasets (TypeScript)
│   │   ├── actuals.ts                # 85 rows: 17 CCs × 5 months
│   │   ├── vendors.ts                # 12 contracts with risk metadata
│   │   ├── externalLabor.ts          # 12 contractors with status tracking
│   │   ├── headcount.ts              # 26 positions with levels + salary
│   │   ├── cloudSpend.ts             # 45 rows: 3 providers × 5 services × 5 months
│   │   └── index.ts                  # Re-exports + aggregation helpers
│   │
│   ├── lib/
│   │   ├── formatters.ts             # Currency · percent · date helpers
│   │   ├── metrics.ts                # Dashboard KPI calculations
│   │   └── riskEngine.ts             # Rule-based risk flag generation
│   │
│   └── types/
│       └── finance.ts                # 15 shared TypeScript interfaces
│
├── ARCHITECTURE.md                   # Deep technical architecture guide
├── CASE_STUDY.md                     # Business problem → solution → outcomes
├── LINKEDIN.md                       # LinkedIn post + profile project description
└── README.md                         # This file
```

---

## Quick Start

### Prerequisites

- Node.js 18+ → [nodejs.org](https://nodejs.org)
- npm 9+

### Install & Run (30 seconds)

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/nexora-ai-finance.git
cd nexora-ai-finance

# Install
npm install

# Run
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — no API key, no database, no configuration needed.

### Enable Real AI Responses (Optional)

```bash
# Copy the environment template
cp .env.example .env.local

# Add your Anthropic API key
echo "ANTHROPIC_API_KEY=your_key_here" >> .env.local
```

Then update `/src/app/api/agent/route.ts` — the upgrade path is documented inline with commented code.

---

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add API key (optional, for live Claude)
vercel env add ANTHROPIC_API_KEY
```

Or click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/nexora-ai-finance)

---

## Design Decisions

### Why mock responses instead of real AI?

Three reasons: **zero API cost** (the demo runs instantly without a credit card), **deterministic output** (portfolio demos don't fail due to API rate limits or response variability), and **domain correctness** (mock responses embody deep FP&A expertise that generic LLM prompts would require extensive prompt engineering to replicate).

The architecture is designed so that replacing the mock engine with Claude is a single-file change — the data context, routing, conversation history, and UI all remain identical.

### Why TypeScript data over CSV/JSON?

Typed data files mean the compiler catches data shape mismatches before runtime. IDE autocomplete works on financial records. Aggregation helpers (e.g., `getByBusinessUnit()`, `getOverBudgetContractors()`) live next to the data they operate on. The result is a self-documenting dataset that reads like a financial model.

### Why server components for data?

Next.js Server Components compute all financial aggregations on the server. The client receives pre-rendered HTML — no financial data is serialized into the JavaScript bundle. This is both faster (no hydration cost for data-heavy pages) and more appropriate from a data governance perspective.

### Why a custom risk engine over AI risk detection?

The rule-based risk engine (`riskEngine.ts`) provides **100% reproducible, auditable** risk flags with explicit dollar impact calculations. In a real FP&A context, rule-based alerts for things like "contract expiring in <90 days" are more reliable than probabilistic AI detection and are easier to explain to auditors.

---

## Future Enhancements

- [ ] **Real Claude API**: Wire `ANTHROPIC_API_KEY` to `/api/agent/route.ts` — instructions already in the file
- [ ] **CSV/XLSX import**: Upload your own actuals export from SAP, NetSuite, or Workday Adaptive
- [ ] **Multi-turn memory**: Persist conversation history in `localStorage` so agents remember context between sessions
- [ ] **PDF export**: Generate CFO report packages and CIO briefing decks as downloadable PDFs
- [ ] **Forecast modeling**: Interactive budget vs. forecast scenario builder with sensitivity analysis
- [ ] **Email digests**: Scheduled AI-generated weekly finance summaries via Resend or SendGrid
- [ ] **Role-based views**: CFO view vs. FP&A analyst view vs. CIO view — same data, different depth
- [ ] **ERP connector**: Direct integration with NetSuite, Workday, or QuickBooks Online APIs
- [ ] **Dark mode**: Full dark theme using Tailwind's `dark:` variant
- [ ] **Mobile app**: React Native companion for executives who want KPIs on the go

---

## About This Project

Built by an IT Finance / FP&A professional with hands-on experience in:

- Budget management and variance analysis (actuals vs. plan vs. forecast)
- External labor and contractor spend management (SOWs, burn rates, compliance)
- Cloud cost optimization and FinOps (AWS, Azure, GCP cost governance)
- Headcount planning and workforce cost modeling
- Vendor contract management and procurement strategy
- Executive and Board-level financial reporting

This project exists because finance expertise and software engineering are both learnable — and combining them creates tools that neither discipline builds alone.

---

## License

MIT — use freely for your own portfolio, learning, or adaptation.

---

<div align="center">
  <sub>Built with Next.js · TypeScript · Tailwind CSS · Recharts</sub><br>
  <sub>AI layer designed for drop-in Anthropic Claude integration</sub>
</div>
