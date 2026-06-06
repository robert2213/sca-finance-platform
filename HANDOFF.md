# Nexora AI Finance — Project Handoff Document

**Last updated:** June 2026  
**Repository:** `nexora-ai-finance`  
**Author note:** This document is written for a developer taking over the project cold. Every section reflects the actual codebase as of commit `e2d0bf2`.

---

## 1. What This Is

Nexora AI Finance is an **IT Finance FP&A dashboard** with an embedded AI agent layer. It is designed for IT Finance teams who need to monitor budget vs. actuals, contractor spend, vendor contracts, headcount, and cloud costs — and who want to ask natural-language questions about that data without leaving their finance tool.

The app is currently a **demo/portfolio product** running on static mock data. The architecture is deliberately built so that replacing mock data with a live source (Databricks, Snowflake, REST API) or replacing mock AI responses with a real LLM (Claude, GPT-4) requires changes in exactly two places, with no structural rewrites.

---

## 2. Tech Stack

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Framework | Next.js App Router | 14.2.5 | Server + client components, static pages |
| Language | TypeScript | ^5 | Strict mode, path aliases via `@/` |
| Styling | Tailwind CSS | ^3.4.1 | Custom `nexora-*` color scale in tailwind.config.ts |
| Charts | Recharts | ^2.12.7 | Bar, line, area charts — React-native, no canvas |
| Icons | Lucide React | ^0.395.0 | Sidebar nav icons; tree-shakeable |
| Utilities | clsx | ^2.1.1 | Conditional class concatenation |
| Rendering | Static (SSG) | — | 18 static pages; zero server-side data fetching |
| State | React hooks + localStorage | — | No Redux, no Zustand, no context providers |
| API layer | Next.js Route Handler | — | `/api/agent` POST endpoint (currently unused by UI) |
| Build | Node 24, npm 11 | — | `npm run dev` / `npm run build` / `npm start` |

No database. No authentication. No external services. The app runs entirely in the browser after build.

---

## 3. Folder Structure

```
nexora-ai-finance/
├── src/
│   ├── agents/                   # AI agent system
│   │   ├── agentEngine.ts        # ← Core dispatch: keyword scoring, routing, context
│   │   ├── dataContext.ts        # ← FinanceSnapshot builder (pre-computed, cached)
│   │   ├── mockResponses.ts      # Public dispatcher (delegates to agentEngine)
│   │   ├── registry.ts           # Agent definitions, capabilities, suggested prompts
│   │   ├── types.ts              # AgentDefinition interface
│   │   └── responses/            # Per-agent response libraries
│   │       ├── cfo.ts            # ~8 routes: summary, risks, forecast, board narrative
│   │       ├── fpa.ts            # ~8 routes: variance, trends, cost centers
│   │       ├── procurement.ts    # ~6 routes: contracts, expiry, risk, renewals
│   │       ├── externalLabor.ts  # ~6 routes: burn rate, SOW compliance, ending soon
│   │       ├── headcount.ts      # ~6 routes: fill rate, open reqs, salary cost
│   │       └── cio.ts            # ~6 routes: IT investment story, cloud ROI, briefings
│   │
│   ├── app/                      # Next.js App Router pages
│   │   ├── layout.tsx            # Root layout (metadata only)
│   │   ├── globals.css           # Tailwind + custom CSS classes
│   │   ├── page.tsx              # /  — Executive Dashboard
│   │   ├── agents/
│   │   │   ├── page.tsx          # /agents — Agent Command Center hub
│   │   │   └── [agentId]/
│   │   │       └── page.tsx      # /agents/cfo etc. — Full-height workspace
│   │   ├── api/agent/route.ts    # POST /api/agent — REST endpoint (unused by UI)
│   │   ├── cfo/page.tsx          # /cfo — CFO Summary page
│   │   ├── fpa/page.tsx          # /fpa — FP&A Variance page
│   │   ├── vendors/page.tsx      # /vendors — Vendor Spend page
│   │   ├── external-labor/       # /external-labor — Contractor page
│   │   ├── headcount/page.tsx    # /headcount — Workforce Planning page
│   │   └── cio/page.tsx          # /cio — CIO Briefing page
│   │
│   ├── components/
│   │   ├── agents/
│   │   │   ├── AgentWorkspace.tsx      # Full-height chat — used at /agents/[id]
│   │   │   ├── AgentWorkspaceCTA.tsx   # CTA card on detail pages (links to workspace)
│   │   │   ├── AgentChatPanel.tsx      # Embedded fixed-height panel (legacy, unused)
│   │   │   ├── AgentCard.tsx           # Card on /agents hub page
│   │   │   └── ContextPanel.tsx        # Right sidebar: key points + actions
│   │   ├── charts/
│   │   │   ├── BudgetVsActualChart.tsx # Recharts bar+line for monthly spend
│   │   │   ├── HeadcountChart.tsx      # Recharts pie/donut for HC mix
│   │   │   └── SpendTrendChart.tsx     # Recharts area chart for cloud by provider
│   │   ├── dashboard/
│   │   │   ├── KPICard.tsx             # ← Primary KPI component (client, expand toggle)
│   │   │   ├── VarianceDrivers.tsx     # Top 3 variance drivers panel
│   │   │   ├── VarianceTable.tsx       # Sortable budget vs. actuals table
│   │   │   ├── RiskAlerts.tsx          # Risk flag list with severity badges
│   │   │   ├── RecommendedActions.tsx  # Priority action list
│   │   │   ├── ExecutiveSummaryBox.tsx # Dark CFO narrative panel
│   │   │   └── StatsBanner.tsx         # 5-stat quick-read strip (used on detail pages)
│   │   ├── layout/
│   │   │   ├── ShellClient.tsx         # Standard page shell (sidebar + topbar + scroll)
│   │   │   ├── AgentShell.tsx          # Workspace shell (no padding, no page scroll)
│   │   │   ├── PageWrapper.tsx         # Server wrapper → ShellClient
│   │   │   ├── Sidebar.tsx             # Fixed left nav with Lucide icons
│   │   │   └── TopBar.tsx              # Sticky top header
│   │   └── ui/
│   │       ├── Badge.tsx
│   │       ├── Skeleton.tsx
│   │       └── Spinner.tsx             # TypingDots animation
│   │
│   ├── data/                     # All financial data (TypeScript arrays)
│   │   ├── actuals.ts            # 17 cost centers × 5 months actuals + budget + forecast
│   │   ├── cloudSpend.ts         # AWS/Azure/GCP by service × month (separate dataset)
│   │   ├── externalLabor.ts      # 12 contractor records with SOW budgets
│   │   ├── headcount.ts          # 45 headcount records with status
│   │   ├── vendors.ts            # 12 vendor contracts with value and risk level
│   │   └── index.ts              # Re-exports all data functions
│   │
│   ├── hooks/
│   │   └── useConversation.ts    # localStorage persistence for chat history
│   │
│   ├── lib/
│   │   ├── formatters.ts         # formatCurrency, formatPercent, formatDate, daysUntil
│   │   ├── metrics.ts            # buildDashboardKPIs() — 6 narrative KPI objects
│   │   └── riskEngine.ts         # generateRiskFlags() + generateRecommendedActions()
│   │
│   └── types/
│       └── finance.ts            # All TypeScript interfaces (KPI, Vendor, Contractor, etc.)
│
├── tailwind.config.ts            # nexora-* color scale, font, border-radius config
├── next.config.mjs               # Standard Next.js config
├── package.json
└── .env.example                  # ANTHROPIC_API_KEY placeholder
```

---

## 4. Routes and Pages

| Route | Page | Shell | Description |
|---|---|---|---|
| `/` | Dashboard | ShellClient | Executive FP&A command center — 6 KPIs, variance drivers, chart, risk alerts, variance table, recommended actions |
| `/agents` | Agent Hub | ShellClient | Launch pad for all 6 agents — cards link to workspace or data page |
| `/agents/[agentId]` | Workspace | AgentShell | Full-height chat workspace — no page scroll, localStorage persistence, context panel |
| `/cfo` | CFO Summary | ShellClient | 4 KPIs, executive summary box, agent CTA, risk alerts, recommended actions |
| `/fpa` | FP&A Variance | ShellClient | 4 KPIs, monthly chart, BU variance table, cost category table, May detail |
| `/vendors` | Vendor Spend | ShellClient | 4 KPIs, vendor table with risk/expiry, agent CTA, procurement risk flags |
| `/external-labor` | Ext. Labor | ShellClient | 4 KPIs, alert banner, contractor table, agent CTA, BU spend table |
| `/headcount` | Headcount | ShellClient | 4 KPIs, headcount roster table, donut chart, BU fill rate bars, open reqs, agent CTA |
| `/cio` | CIO Briefing | ShellClient | 4 KPIs, executive summary, cloud trend chart, provider table, IT investment breakdown, cloud provider cards |
| `/api/agent` | REST endpoint | — | POST handler that calls dispatchAgent() — not currently used by UI but wired for external integrations |

---

## 5. The AI Agent System

### Architecture

The agent system has three layers:

```
User prompt → agentEngine.ts → dataContext.ts → responses/[agent].ts → rendered response
```

**Layer 1 — `agentEngine.ts` (dispatch)**
- Accepts: `agentId`, `question`, `history[]`
- Builds a `ConversationContext` containing the enriched query, normalized text, prior route, and the full `FinanceSnapshot`
- Scores every route in the agent's route library using weighted keyword matching
- Selects the highest-scoring route; falls back to the first route (default) if no match
- Returns: `AgentResponse + routeKey` (the matched route identifier for conversation continuity)

**Layer 2 — `dataContext.ts` (pre-computed snapshot)**
- `getFinanceSnapshot()` builds one `FinanceSnapshot` object containing all computed metrics, formatted strings, and raw data arrays
- The snapshot is module-level cached (`_cache`) — computed once per server lifecycle
- Every agent response handler receives this snapshot, so individual responses never re-query data
- Provides `fmt`, `pct`, `dt`, `daysUntil` formatting helpers inline

**Layer 3 — `responses/[agent].ts` (response library)**
Each agent has a file containing an array of `RouteDefinition` objects:
```typescript
{
  key:      string;           // unique route identifier
  keywords: string[];         // scored keyword triggers
  negatives?: string[];       // cancel phrases (reduce score if present)
  weight:   number;           // base confidence (0–10)
  handler:  (ctx) => AgentResponse;  // the actual response
}
```

Each handler returns:
```typescript
{
  answer:     string;          // main response text (markdown supported)
  keyPoints:  string[];        // surfaced in ContextPanel + key takeaways strip
  riskFlags:  RiskFlag[];      // usually [] — risk engine handles this separately
  actions:    ActionItem[];    // surfaced in ContextPanel + actions strip
}
```

### The 6 Agents

| Agent ID | Name | Domain | Route Count |
|---|---|---|---|
| `cfo` | CFO Agent | Executive summary, risk narrative, board prep, forecast | ~8 |
| `fpa` | FP&A Agent | Variance analysis, cost center drill-down, forecast tracking | ~8 |
| `procurement` | Procurement Agent | Contract expiry, vendor risk, renewal strategy, spend concentration | ~6 |
| `external-labor` | External Labor Agent | Contractor burn rate, SOW compliance, over-budget engagements | ~6 |
| `headcount` | Headcount Agent | Fill rate, open reqs, salary budget, workforce cost analysis | ~6 |
| `cio` | CIO Finance Partner | IT investment narrative, cloud ROI, executive talking points | ~6 |

### Conversation Features
- **Keyword scoring** with negative phrase cancellation
- **Follow-up detection**: short queries (< 6 words) with follow-up phrases are enriched with the prior question context
- **Route continuity**: `priorRoute` from history is available to handlers for context-aware follow-ups
- **Variant responses**: handlers produce different outputs based on snapshot data, preventing repetitive answers
- **localStorage persistence**: `useConversation` hook saves per-agent history in `nexora_conv_v1_[agentId]`; survives navigation

### Upgrading to Real LLM

The mock system is structurally API-ready. To wire Claude or GPT-4:

1. Add `ANTHROPIC_API_KEY=sk-ant-...` to `.env.local`
2. In `agentEngine.ts`, replace the `dispatchAgent` mock routing with an API call:
```typescript
// Replace the keyword scoring block with:
const response = await anthropic.messages.create({
  model: "claude-opus-4-5",
  system: buildSystemPrompt(agentId, snapshot),
  messages: history.map(h => ({ role: h.role, content: h.content })),
});
```
3. Parse the response to extract `answer`, `keyPoints`, `actions` using structured output or a parsing wrapper
4. The UI, workspace, and context panel require no changes

The `/api/agent` REST handler (`src/app/api/agent/route.ts`) is already wired and ready for this.

---

## 6. The Financial Data Model

### Data Scope

All data is static TypeScript arrays representing YTD May 2026 for a fictional IT organization with a ~$34M annual IT budget.

| Dataset | File | Records | Key Fields |
|---|---|---|---|
| Actuals | `actuals.ts` | 85 (17 CC × 5 months) | `actual`, `budget`, `forecast`, `variance`, `variancePct` |
| Cloud Spend | `cloudSpend.ts` | ~60 (provider × service × month) | `provider`, `service`, `businessUnit`, `spend`, `budget` |
| External Labor | `externalLabor.ts` | 12 contractors | `ytdSpend`, `budget`, `monthlyRate`, `status`, `endDate` |
| Headcount | `headcount.ts` | 45 positions | `title`, `businessUnit`, `level`, `status`, `annualSalary` |
| Vendors | `vendors.ts` | 12 contracts | `annualValue`, `contractEnd`, `autoRenew`, `riskLevel` |

### Business Units
Infrastructure · Security · Applications · Data & Analytics · Cloud Engineering · IT Operations · Enterprise Architecture

### Key Numbers (May 2026 YTD)

| Metric | Value |
|---|---|
| YTD Total IT Spend (actuals.ts) | ~$14.6M |
| YTD Budget | ~$14.1M |
| YTD Variance | +$458K (+3.2%) |
| Cloud YTD (cloudSpend.ts — separate dataset) | ~$465K |
| External Labor YTD | ~$285K |
| Headcount: Filled / Approved | 78 / 85 |
| Open Requisitions | 7 |
| Vendor Contracts | 12 total, 3 expiring < 90 days |

**Important:** `actuals.ts` and `cloudSpend.ts` are **parallel datasets** — cloud spend is tracked both as cost center line items in `actuals.ts` (CC-501, CC-502, CC-503) AND as a separate provider/service breakdown in `cloudSpend.ts`. This is by design to support both BU-level and provider-level analysis, but it means the totals from `getYTDActual()` and `getTotalCloudYTD()` come from different data sources and should not be summed.

---

## 7. KPI Logic

`src/lib/metrics.ts` → `buildDashboardKPIs()` produces 6 KPI objects for the executive dashboard:

1. **YTD IT Spend** — `getYTDActual()` vs `getYTDBudget()` from actuals.ts
2. **Cloud Infrastructure** — `getTotalCloudYTD()` vs `getTotalCloudBudgetYTD()` from cloudSpend.ts
3. **External Labor** — `getTotalContractorYTDSpend()` vs `getTotalContractorBudget()` from externalLabor.ts
4. **Full-Year Forecast** — `ytdActual / 5 * 12` vs `ytdBudget / 5 * 12` (simple run-rate extrapolation)
5. **Headcount** — `hc.filled` vs `hc.total` with fill rate computed in the `VarianceRow` component
6. **Contract Renewals** — count of `getVendorsExpiringSoon(90)` with `autoRenew === false`

**Status thresholds** (applied in `metrics.ts` and fall-through in `KPICard.tsx`):
- `> 5% over budget` → Unfavorable (red pill)
- `1–5% over budget` → Watch (amber pill)
- `within ±1%` → On Track (slate pill)
- `> 1% under budget` → Favorable (green pill)

**KPI type** (`src/types/finance.ts`):
```typescript
interface KPI {
  label, value, budget, prior, format, trend, trendPositive  // required
  status?,         // explicit KPIStatus override
  driver?,         // root-cause sentence (hidden behind "Insight" toggle)
  action?,         // recommended action (shown when insight is expanded)
  varianceDollar?, // explicit $ variance (computed if absent)
  hasBudget?,      // false = suppress budget comparison row
}
```

---

## 8. Risk Engine

`src/lib/riskEngine.ts` → `generateRiskFlags()` produces `RiskFlag[]` dynamically:

| Rule | Severity | Trigger |
|---|---|---|
| Cloud overage | Critical (>$100K) or Warning | `getTotalCloudYTD() > getTotalCloudBudgetYTD()` |
| Contract expiry <90 days | Critical | `getVendorsExpiringSoon(90)` with no auto-renew |
| Contract expiry 90–180 days | Warning | Same, filtered to 90–180d window |
| Over-budget contractors | Warning | `getOverBudgetContractors()` |
| Contractors ending soon | Info | `getEndingSoonContractors()` |
| High-risk vendors | Warning | `getVendorsByRisk("High")` |
| Open reqs in Security/Cloud | Info | `getOpenReqs()` filtered to critical BUs |
| Cost centers >5% variance | Warning | `actuals.filter(r => r.month === "May" && r.variancePct > 0.05)` |

Flags are sorted: Critical → Warning → Info.

---

## 9. Scroll and Layout Architecture

Two shell variants exist:

**`ShellClient`** (standard pages: `/`, `/cfo`, `/fpa`, etc.)
```
div.flex.h-screen.overflow-hidden
  aside.fixed.w-64            ← sidebar
  div.flex-1.flex.flex-col.overflow-hidden
    header.h-16               ← topbar
    main.flex-1.overflow-y-auto  ← PAGE SCROLL IS HERE
      div.p-5.md:p-8          ← content padding
```

**`AgentShell`** (workspace pages: `/agents/[agentId]`)
```
div.flex.h-screen.overflow-hidden
  aside.fixed.w-64
  div.flex-1.flex.flex-col.overflow-hidden
    header.h-16
    main.flex-1.min-h-0.overflow-hidden  ← NO PAGE SCROLL
      AgentWorkspace                     ← controls its own scroll
```

**Critical scroll rule:** `AgentWorkspace` and `AgentChatPanel` use `scrollAreaRef.scrollTop = scrollAreaRef.scrollHeight` (direct DOM manipulation) — never `scrollIntoView()`. Using `scrollIntoView()` would propagate scroll events to all scrollable ancestors, including the page's `overflow-y-auto` main container, causing the page to jump when a message arrives.

---

## 10. Known Limitations and Technical Debt

### Data

| Issue | Impact | Fix |
|---|---|---|
| All data is static TypeScript arrays | No real-time updates; the "Live" badge is cosmetic | Replace data files with API calls or SDK queries |
| `actuals.ts` and `cloudSpend.ts` are parallel datasets with overlapping cloud spend | Totals from the two sources cannot be summed | Consolidate to a single source or document the split explicitly |
| Full-year forecast is a simple `ytdActual / 5 * 12` run-rate | Does not account for seasonal phasing, committed spend, or H2 savings | Build a proper forecast model using actuals + plan + known commitments |
| `FinanceSnapshot` cache (`_cache`) is module-level | In a server context with hot-reload, stale data can persist across requests | Add cache invalidation or use per-request instantiation in production |
| Prior period for KPI trend chips (`kpi.prior`) is computed as `budget * 0.94` | These are fabricated deltas, not real period comparisons | Store actual prior-year or prior-period data alongside current actuals |

### Agent System

| Issue | Impact | Fix |
|---|---|---|
| Keyword matching is case-sensitive on routes but normalized before scoring | Edge cases with proper nouns or acronyms (e.g., "AWS" vs "aws") may miss routes | Normalize route keywords at registration time |
| No intent confidence threshold | A query with a single weak keyword match still triggers a route | Add minimum confidence score (e.g., score ≥ 3) before routing; otherwise return a "I need more context" response |
| `AgentChatPanel.tsx` is a dead component | Still exists in `/components/agents/` but no page imports it | Delete or repurpose as a lightweight embedded variant if needed |
| Agent responses are hardcoded paragraphs | Fine for demo; would feel stale in daily use | Connect to real LLM API |
| No cross-agent handoff | When a CFO question is better answered by FP&A, the CFO agent answers anyway | Add agent routing in `agentEngine.ts` to redirect questions to the appropriate specialist |
| `useConversation` does not handle localStorage quota errors gracefully | In private browsing or with large histories, silent failure loses data | Add `try/catch` with user notification on write failure |

### UI

| Issue | Impact | Fix |
|---|---|---|
| `AgentWorkspace` uses `h-full` which requires a properly-sized parent chain | On unusual viewport configurations, the workspace may not fill correctly | Test on target devices; consider fallback `min-h-[calc(100vh-64px)]` |
| No empty state for ContextPanel when an agent responds with no keyPoints | Panel shows placeholder text but offers no guidance | Add domain-specific placeholder prompts per agent |
| `StatsBanner` is still rendered on CFO, FPA, Headcount, Vendors, External Labor, CIO pages | Minor redundancy with KPI cards below it | Audit whether it adds value on each page; remove where redundant |
| KPI cards on detail pages (CFO, FPA, etc.) still use the old `prior` fabrication pattern | Trend chips show deltas vs. made-up prior periods | Update detail page KPIs to use explicit `hasBudget: false` and remove `prior`-based chips |
| No mobile-specific layout for AgentWorkspace context panel | Context panel is `hidden xl:flex` — never visible on mobile | Add a bottom sheet or tab toggle for mobile |
| Table rows have no max height on Headcount and External Labor pages | With large datasets, these could become very long | Add `max-h` + scroll, or paginate |

### Responsiveness

| Issue | Impact |
|---|---|
| VarianceDrivers component impact $ is right-aligned but wraps on sm screens | Minor layout break on phones |
| TopBar subtitle is `truncate` — very long page subtitles are silently clipped | Acceptable, but check that all subtitles fit at 375px width |

---

## 11. Recommended Next Development Steps

### Tier 1 — Foundation (required before any live deployment)

1. **Connect real data source** — Replace `src/data/*.ts` arrays with API calls. The data shape is fully typed in `src/types/finance.ts`; the functions in each data file (`getYTDActual`, `getByBusinessUnit`, etc.) are the integration surface. A database view or Databricks query that returns the same shape requires only replacing these function bodies.

2. **Wire real LLM** — Add `ANTHROPIC_API_KEY` to environment. Update `dispatchAgent()` in `agentEngine.ts` to call the Anthropic SDK. The `FinanceSnapshot` becomes the system prompt context. All UI components remain unchanged.

3. **Add authentication** — The app has no auth. Add NextAuth.js or Clerk. Given the financial data sensitivity, this is prerequisite before any internal deployment.

4. **Clear the snapshot cache** — `FinanceSnapshot` is module-level cached. In a live app, it must be invalidated when underlying data changes, or rebuilt per-request. Change `getFinanceSnapshot()` to be request-scoped (no module cache) and memoize at the component level instead.

### Tier 2 — Product Hardening

5. **Real forecast model** — Replace `ytdActual / 5 * 12` with a proper forecast that incorporates committed spend, expected savings, and phasing. Store a `forecast` value per BU per month in the data model.

6. **Actual prior-period data** — Store YTD prior-year actuals alongside current year. This makes the `kpi.prior` field in the KPI type meaningful and enables real trend arrows.

7. **Export / share** — Add PDF export for the executive dashboard. The `ExecutiveSummaryBox` + KPI grid are natural starting points. Use `react-pdf` or a headless browser capture.

8. **Notification system** — The risk engine already generates flags. Wire them to an email digest (Resend, SendGrid) or Slack notification for daily/weekly summaries.

9. **Pagination and search** — Vendor, contractor, and headcount tables have no search or pagination. With real data at scale, these are essential.

---

## 12. Databricks Integration Opportunities

Nexora is architecturally well-suited for Databricks as its data backend. The following integrations are natural next steps:

### 12a. Replace Static Data with Databricks SQL

Replace each `src/data/*.ts` file with a function that queries Databricks SQL:

```typescript
// src/data/actuals.ts — future version
import { DatabricksClient } from "@databricks/sdk";

export async function getYTDActual(): Promise<number> {
  const result = await db.sql.executeStatement({
    statement: `SELECT SUM(actual) FROM finance.it_actuals WHERE year = 2026 AND month_num <= 5`,
    warehouse_id: process.env.DATABRICKS_WAREHOUSE_ID,
  });
  return result.result.data_array[0][0] as number;
}
```

All downstream code — metrics.ts, riskEngine.ts, agentEngine.ts — remains unchanged because the function signatures stay the same.

### 12b. Power Agents with Unity Catalog Metadata

The `FinanceSnapshot` in `dataContext.ts` could be populated directly from a Databricks Unity Catalog schema using Delta tables. This would allow:
- Real-time budget vs. actuals with daily refresh
- Automatic lineage tracking for audit compliance
- Budget data from Workday/SAP alongside actuals from Databricks

### 12c. Databricks Genie Integration

Replace the mock agent response library with Databricks Genie (the AI data analyst). The `agentEngine.ts` dispatch layer is already designed for this swap:
- Genie connects to your Databricks SQL warehouse
- Questions are answered with live queries, not prewritten responses
- The `FinanceSnapshot` becomes a Genie "context" prompt
- The existing workspace UI, streaming, and context panel all work unchanged

### 12d. MLflow for Forecast Models

The current "forecast" is a linear run-rate. Databricks MLflow enables:
- Trained forecast models (ARIMA, Prophet) registered in MLflow Model Registry
- Served via Databricks Model Serving endpoint
- Called from `getFinanceSnapshot()` to replace the `fullYearForecast` calculation

### 12e. Delta Live Tables for Risk Engine

The `generateRiskFlags()` function currently runs on static data at render time. With Databricks:
- Risk rules become DLT pipeline expectations
- Failed expectations generate alerts written to a risk table
- The UI reads from that table instead of computing rules client-side
- Enables audit history: "This risk was flagged on day X, resolved on day Y"

---

## 13. External Data Source Integration Opportunities

### Finance Systems

| Source | Integration | Benefit |
|---|---|---|
| **Workday Adaptive Planning** | REST API → actuals/budget by cost center | Replaces `actuals.ts`; real approved budgets |
| **SAP S/4HANA** | OData API or Databricks connector | GL actuals at transaction level; replaces simulated data |
| **Oracle Financials** | REST API | Same as SAP |
| **Netsuite** | SuiteAnalytics Connect | Cloud-native ERP; easier to query |
| **Coupa** | REST API | Replaces `vendors.ts`; real contract data, PO status |
| **ServiceNow** | REST API / CMDB | Real vendor contracts and renewal dates from ITSM |
| **Workday HCM** | REST API | Replaces `headcount.ts`; real HC with hire/term dates |
| **AWS Cost Explorer** | AWS SDK | Replaces `cloudSpend.ts` for AWS; real service-level cost |
| **Azure Cost Management** | REST API | Replaces Azure rows in `cloudSpend.ts` |
| **GCP Billing Export** | BigQuery → Databricks | Replaces GCP rows; most detailed billing available |
| **Beeline / Field Glass** | REST API | Replaces `externalLabor.ts`; real contractor records |

### Implementation Pattern

The integration surface in Nexora is narrow — all data access goes through functions in `src/data/`. Each function is independently replaceable:

```typescript
// src/data/actuals.ts — today
export function getYTDActual() { return actuals.reduce(...); }

// src/data/actuals.ts — with SAP integration
export async function getYTDActual() {
  const resp = await sapClient.getGLActuals({ period: "2026-01 to 2026-05" });
  return resp.reduce((s, r) => s + r.debitAmount, 0);
}
```

The only structural change needed is making these functions `async` and ensuring all callers `await` them (currently they are synchronous because all data is local).

---

## 14. Executive Reporting Automation Opportunities

### 14a. Scheduled CFO Email Digest

The `ExecutiveSummaryBox` content is already generated dynamically. Wire it to a daily email:
- Trigger: Cron job (Vercel Cron, GitHub Actions, or Databricks Job)
- Content: Call `getFinanceSnapshot()` → pass to a Claude API call for narrative → send via Resend/SendGrid
- Template: Inline the KPI values + risk flags + top 3 drivers into an HTML email

### 14b. Monthly Board Pack Generation

Generate a formatted PDF monthly:
- Use `react-pdf` to render the dashboard KPIs, variance table, and variance drivers
- Include agent-generated CFO narrative as the cover commentary
- Optionally attach the full VarianceTable data as a spreadsheet

### 14c. Slack / Teams Integration

Post risk alerts and action reminders to finance team channels:
- Risk engine flags → Slack webhook message with severity, title, impact
- Due date approaching → DM the action owner in `RecommendedActions`
- Weekly spend summary → Sunday digest with YTD metrics

### 14d. Automated Variance Commentary

When actuals close at month-end:
- Trigger on new data arrival (Databricks Job notification or webhook)
- Call Claude API with the FinanceSnapshot + new month data
- Generate formal variance commentary paragraphs
- Store as a document in SharePoint/Confluence or email to stakeholders

---

## 15. Vision: Nexora as an AI-Powered Finance Operating System

The current app is a **read-only analytics dashboard** with an AI chat layer. The next architectural phase transforms it into a **Finance Operating System** — a platform where AI agents can read, analyze, forecast, and initiate finance workflows.

### Target Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     NEXORA FINANCE OS                               │
├─────────────┬───────────────────────┬────────────────┬─────────────┤
│  DATA LAYER │   INTELLIGENCE LAYER  │  ACTION LAYER  │ EXPERIENCE  │
│             │                       │                │             │
│  Databricks │  Agent Orchestrator   │  Workflow      │  Dashboard  │
│  Unity Cat. │  (multi-agent, tools) │  Engine        │  Workspace  │
│  Delta Live │                       │                │             │
│  Tables     │  Claude claude-opus-4 │  Approvals     │  Mobile App │
│             │  with Tool Use        │  Notifications │             │
│  Workday    │                       │  Export/Report │  Slack/Teams│
│  SAP / ERP  │  Memory (per user,    │  SAP writeback │  Integration│
│  AWS/GCP    │  per agent, cross-    │  Coupa PO gen  │             │
│  Billing    │  session context)     │  Workday HC req│             │
└─────────────┴───────────────────────┴────────────────┴─────────────┘
```

### Key Architectural Shifts

**1. Multi-agent orchestration with tool use**

Replace the single-agent pattern with a Claude multi-agent system using the Anthropic SDK's tool use feature:

```typescript
// Agent tools (Claude function calling)
const tools = [
  { name: "query_actuals",        description: "Run a SQL query against the actuals Delta table" },
  { name: "get_forecast",         description: "Retrieve the forecast model prediction for a BU/period" },
  { name: "create_procurement_request", description: "Initiate a Coupa PO amendment" },
  { name: "generate_commentary",  description: "Write formal CFO variance commentary for a period" },
  { name: "alert_stakeholder",    description: "Send an alert email or Slack message to a named owner" },
];
```

Agents go from **read-only analysts** to **action-capable partners** who can query live data, draft documents, and initiate workflows — all from the conversation interface.

**2. Persistent agent memory**

Move beyond `localStorage` session history to a proper memory layer:
- **Session memory**: what was discussed in this conversation (already implemented)
- **User memory**: user preferences, prior decisions, approved thresholds
- **Organizational memory**: past variance explanations, approved narrative frameworks, prior board commentary
- Storage: Databricks Vector Search or a simple Postgres table with pgvector

**3. Finance workflow engine**

Each `RecommendedAction` becomes executable:
- "Initiate AWS Contract Renewal" → opens a Coupa PO amendment draft
- "Review Over-Budget Contractors" → creates a Workday task for each manager
- "Submit Forecast Revision" → posts updated forecast to Adaptive Planning
- Actions are tracked with status (Pending / In Progress / Complete) and surfaced back in the dashboard

**4. Role-based workspaces**

Different users see different views:
- **CFO**: executive dashboard + board pack generation
- **FP&A Analyst**: variance analysis + forecast modeling workspace
- **IT Manager**: their BU spend only + headcount plan
- **Procurement**: vendor dashboard + contract renewal pipeline
- **CIO**: IT investment story + cloud optimization workspace

**5. Proactive intelligence**

Rather than waiting for users to ask, the system monitors and alerts:
- Spend trajectory crossing the 5% threshold → push notification to CFO Agent
- Contract entering 90-day window → automated procurement task creation
- Headcount open req approaching 90 days → escalation to HRBP
- Month-end approaching with outstanding SOW amendments → reminder to IT Finance

### Suggested Phased Roadmap

| Phase | Focus | Timeline |
|---|---|---|
| **Phase 1** (current) | Read-only dashboard, mock AI agents | Complete |
| **Phase 2** | Connect real data (Databricks/ERP), add auth | 4–6 weeks |
| **Phase 3** | Wire Claude API, remove mock responses | 2–3 weeks |
| **Phase 4** | Add tool use, first executable action (Slack alert) | 3–4 weeks |
| **Phase 5** | Memory layer, user preferences, saved queries | 3–4 weeks |
| **Phase 6** | Multi-agent orchestration (CFO delegates to FP&A) | 4–6 weeks |
| **Phase 7** | ERP writeback (Coupa PO, Workday HC req, Adaptive forecast) | 6–8 weeks |
| **Phase 8** | Role-based access, org-wide rollout | 4–6 weeks |

---

## 16. Development Setup

```bash
# Clone and install
git clone https://github.com/robert2213/nexora-ai-finance
cd nexora-ai-finance
npm install

# Run development server
npm run dev
# → http://localhost:3000

# Build for production
npm run build

# Environment (optional — not required for current mock mode)
cp .env.example .env.local
# Add: ANTHROPIC_API_KEY=sk-ant-...
# Add: DATABRICKS_HOST=https://...
# Add: DATABRICKS_TOKEN=dapi...
# Add: DATABRICKS_WAREHOUSE_ID=...
```

**Node version:** 24.x (any LTS ≥ 18 works)  
**No database setup required** — all data is in-repo TypeScript files.

---

## 17. Testing Guidance for a New Developer

There are no automated tests in the current codebase. Before adding features, verify these manually:

| What to verify | Where |
|---|---|
| Dashboard KPI cards collapse correctly (driver text hidden by default) | `http://localhost:3000` |
| Clicking "Insight ▾" expands driver/action text per card | Dashboard — all 6 KPIs |
| Agent CTAs next to each section header link to correct workspace | Dashboard section headers |
| Headcount card shows "78 / 85 filled · 7 open" format | Dashboard KPI card #5 |
| Contract Renewals card shows count with no budget variance row | Dashboard KPI card #6 |
| Workspace page fills full viewport height with no page scroll | `/agents/cfo` |
| Chat scroll stays within the chat container (page does NOT scroll) | Send a message in workspace |
| Long responses wrap within bubbles (no horizontal overflow) | Send "Give me the executive financial summary" |
| Conversation persists after navigating away and back | Navigate to /cfo and back to /agents/cfo |
| Context panel updates after agent responds | Send any message in workspace |
| Agent CTA on FP&A page pre-populates workspace | Click agent CTA on `/fpa` |
| StatsBanner shows correct critical risk count | `/cfo`, `/fpa`, `/headcount` pages |
| Vendors table sorts high-risk contracts to top | `/vendors` page |
| All 18 routes build without error | `npm run build` |

---

## Appendix — Key File Quick Reference

| Task | File |
|---|---|
| Add a new KPI to the dashboard | `src/lib/metrics.ts` → `buildDashboardKPIs()` |
| Change how a KPI card looks | `src/components/dashboard/KPICard.tsx` |
| Add a new agent route/response | `src/agents/responses/[agent].ts` |
| Change how agents score questions | `src/agents/agentEngine.ts` → `scoreRoute()` |
| Add a new data field to agent context | `src/agents/dataContext.ts` → `FinanceSnapshot` |
| Change mock financial data | `src/data/actuals.ts` (or relevant data file) |
| Add a new risk rule | `src/lib/riskEngine.ts` → `generateRiskFlags()` |
| Change sidebar navigation | `src/components/layout/Sidebar.tsx` |
| Change global styles or add CSS class | `src/app/globals.css` |
| Add a new color to the design system | `tailwind.config.ts` → `nexora` scale |
| Change agent suggested prompts | `src/agents/registry.ts` → `suggestedQuestions` |
| Add a new page | `src/app/[route]/page.tsx` + add to sidebar nav |

---

## Session Update — June 6, 2026

### Added: System Architecture Page

Route: `/architecture`  
Nav: **System Architecture** (sidebar, positioned between CIO Briefing and Data Ingestion)  
Icon: `Network` (Lucide React)

**What was built:**

- **6-stage business-oriented flow diagram** (Financial Data Sources → Data Integration → Financial Intelligence Layer → Nexora Analytics Platform → AI Finance Agents → Executive Outcomes)
- **Animated flow connectors** between each stage — CSS `@keyframes flowSlug` gradient slug moving downward, pulsing label pill with data-in-motion label (e.g. "Raw financial data", "Validated, structured data")
- **Three item rendering modes** — chips (stages 1–4), agent cards with emoji avatars (stage 5), outcome rows with checkmark icon (stage 6)
- **"Powered by Databricks" badge** — Stage 2 only, positioned as trust signal
- **Business Impact section** — 4-card 2×2 grid (Reduce Manual Reporting, Improve Visibility, Accelerate Analysis, Support Better Decisions)
- **Finance Leadership persona section** — 3-column (CFO, FP&A Directors, Finance Business Partners)
- **Scroll reveal** — `IntersectionObserver` adds `.arch-visible` to each `.arch-reveal` element; CSS transition `opacity 0→1 + translateY 14px→0` with staggered `transitionDelay` per stage
- **Fully responsive** — mobile stacks cleanly; agent cards shift from 2-col to 3-col at `sm`; personas shift from 1-col to 3-col at `md`
- **Dark mode classes** throughout — `dark:bg-slate-800`, `dark:text-slate-*`, `dark:border-slate-*`, `dark:nexora-*` variants
- **CSS-only animations** — no external libraries; `arch-flow-slug` and `arch-pulse` in `globals.css`

**Files modified:**

| File | Change |
|---|---|
| `src/app/architecture/page.tsx` | New — full page (client component) |
| `src/components/layout/Sidebar.tsx` | Added `Network` import + `/architecture` nav entry |
| `src/app/globals.css` | Added `@keyframes flowSlug`, `.arch-flow-slug`, `.arch-reveal`, `.arch-reveal.arch-visible` |

**Design decisions:**

- Databricks referenced exactly once (Stage 2) as a trust signal, not a technical detail
- All language is executive/business — no ETL, SQL, endpoint, webhook, or API terminology
- Audience: CFO, CIO, Finance Directors, consulting clients
- Left accent stripe on each stage card maintains nexora indigo brand
- Stage 6 uses emerald outcome styling to visually signal value delivery

**Build result:** `/architecture` builds as a static page (4.31 kB, 103 kB first load JS) — all 25 routes pass.

**Next session:** Pick up at Executive Commentary Agent build

---

## Session Update — June 6, 2026

### Updated: System Architecture Page — Executive Refinement Pass

Route: `/architecture`

**Changes applied:**

- **AI Finance Agents section renamed** to "Finance Decision Support Agents" — positions agents as financial intelligence and decision-support capabilities, not generic chatbots
- **Agent section subtitle updated** to decision-support language: "Specialized finance agents analyze performance, risk, spend, and workforce data to surface decision-ready insights before leaders have to search for them."
- **All 4 Business Impact cards updated** with measurable outcome language — 50–80% reporting reduction, real-time visibility across budget/forecast/spend/headcount/vendors, seconds not weeks for variance identification
- **Value statement added** below page subtitle in muted secondary text: "Nexora connects fragmented financial data to dashboards, AI-assisted analysis, and executive reporting workflows."
- **Example Workflow section added** (7-step flow: QuickBooks/ERP Export → Databricks Processing → Financial Model Standardization → Variance & Risk Detection → Finance Agent Review → Executive Commentary → Monthly Reporting Package)
- **Persona card descriptions sharpened** with role-specific, outcome-oriented language (CFO, FP&A Director, Finance Business Partner)

**Design decisions:**

- Databricks referenced once with subtle nexora accent border + "Powered by Databricks" badge in Example Workflow — positioned as trust signal only
- All language remains executive/business — zero technical terminology
- Step numbers rendered as muted badges (01–07) for visual scannability
- Horizontal flow desktop (`md:flex-row`, `overflow-x-auto`) / vertical stack mobile (`flex-col`) for Example Workflow
- Right arrow (`→`) with gradient line on desktop, down arrow (`↓`) on mobile for workflow connectors

**What was NOT changed:**

- Existing 6-stage architecture flow diagram
- Sidebar navigation structure
- Agent cards (names, layout, emojis)
- Page route or nav label
- Any other page or application functionality

**Files modified:**

| File | Change |
|---|---|
| `src/app/architecture/page.tsx` | Changes 1–5 applied (rename, impact copy, value statement, workflow section, persona copy) |
| `HANDOFF.md` | Session notes appended |

**Next session priorities:**

1. Executive Commentary Agent — wire Claude to live Databricks query layer
2. CFO Summary generation endpoint
3. Commentary panel on FP&A and CFO dashboard pages
4. Automated board deck generation (Phase 3 roadmap)

**Known items for future pass:**

- Example Workflow section could link to live demo of each step when commentary agent is complete
- Persona cards could deep-link to relevant dashboard pages
- Consider adding a "Request Demo" CTA at bottom of architecture page for Sin City Analytics client acquisition
