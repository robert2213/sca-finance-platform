# Architecture Guide — Nexora AI Finance Department

A deep technical reference for contributors, interviewers, and anyone curious how the system works.

---

## System Overview

Nexora is a **server-rendered Next.js application** with a client-side AI chat layer. Financial data lives in TypeScript modules on the server. Agent responses are computed by a custom routing engine — no external AI dependency required, but the architecture is purpose-built for a Claude API upgrade.

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                     │
│                                                         │
│  ┌──────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │ Sidebar  │  │  Page Content │  │  AgentChatPanel │  │
│  │ (nav)    │  │  (server HTML)│  │  (client state) │  │
│  └──────────┘  └───────────────┘  └────────┬────────┘  │
│                                            │            │
└────────────────────────────────────────────┼────────────┘
                                             │ fetch POST
┌────────────────────────────────────────────┼────────────┐
│                 Next.js Server             │            │
│                                            ▼            │
│  ┌──────────────────────────────────────────────────┐  │
│  │              /api/agent (Route Handler)           │  │
│  │                                                   │  │
│  │   agentEngine.dispatchAgent(agentId, q, history) │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │              agentEngine.ts                       │  │
│  │                                                   │  │
│  │  1. buildEnrichedQuery()  ← context injection     │  │
│  │  2. scoreRoute()          ← weighted keyword match│  │
│  │  3. winner.handler(ctx)   ← response generation  │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │          dataContext.getFinanceSnapshot()          │  │
│  │                                                   │  │
│  │  ytdActual · cloudVariancePct · openReqs ·        │  │
│  │  expiringVendors90 · overBudgetContractors ·...   │  │
│  └──────────────────────┬───────────────────────────┘  │
│                         │                               │
│  ┌──────────────────────▼───────────────────────────┐  │
│  │                  data/ layer                      │  │
│  │                                                   │  │
│  │  actuals.ts  vendors.ts  externalLabor.ts         │  │
│  │  headcount.ts  cloudSpend.ts                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Data Layer

### Structure

All financial data lives in `src/data/` as TypeScript modules. Each file exports:
1. **The raw data array** (e.g., `export const actuals: ActualRecord[]`)
2. **Aggregation helper functions** (e.g., `getByBusinessUnit()`, `getOverBudgetContractors()`)

```typescript
// src/data/externalLabor.ts — pattern used across all data files

export const contractors: Contractor[] = [
  {
    id: "EL-001",
    name: "Jordan Alvarez",
    role: "Cloud Infrastructure Engineer",
    monthlyRate: 18_500,
    ytdSpend: 92_500,
    budget: 90_000,
    status: "Over Budget",
    // ...
  },
  // 11 more...
];

// Aggregation helpers — computed at call time, not stored
export function getOverBudgetContractors(): Contractor[] {
  return contractors.filter(c => c.status === "Over Budget");
}

export function getTotalContractorYTDSpend(): number {
  return contractors.reduce((s, c) => s + c.ytdSpend, 0);
}
```

### Why TypeScript, not JSON or CSV?

| Concern | JSON/CSV | TypeScript data files |
|---------|----------|----------------------|
| Type safety | ❌ Runtime errors | ✅ Compile-time errors |
| Aggregation | External utility needed | ✅ Co-located with data |
| IDE support | ❌ No autocomplete | ✅ Full IntelliSense |
| Refactoring | ❌ Search-and-replace | ✅ Compiler-guided |
| Comments | ❌ JSON doesn't support them | ✅ Inline documentation |

### Data Relationships

```
actuals (85 rows)
  └── costCenterId → CostCenter (embedded in row)
  └── businessUnit → BusinessUnit (enum)

vendors (12 rows)
  └── businessUnit → BusinessUnit (enum)
  └── riskLevel    → "Low" | "Medium" | "High"

contractors (12 rows)
  └── costCenterId → references actuals.costCenterId
  └── businessUnit → BusinessUnit (enum)
  └── status       → "Active" | "Over Budget" | "Ending Soon" | "On Hold"

headcount (26 rows)
  └── businessUnit → BusinessUnit (enum)
  └── level        → "IC3" | "IC4" | "IC5" | "M1" | "M2" | "M3" | "Dir" | "VP"
  └── status       → "Filled" | "Open" | "Pending Offer" | "On Leave"

cloudSpend (45 rows)
  └── provider     → "AWS" | "Azure" | "GCP"
  └── businessUnit → BusinessUnit (enum)
```

---

## Agent Engine

### Core Components

```
src/agents/
├── agentEngine.ts      ← Routing engine: scoring, context, dispatch
├── dataContext.ts      ← FinanceSnapshot builder and cache
├── mockResponses.ts    ← Public API: delegates to agentEngine
├── registry.ts         ← Agent metadata: name, avatar, capabilities, questions
├── types.ts            ← RouteDefinition, ConversationContext interfaces
└── responses/
    ├── cfo.ts          ← 8 routes: exec summary, risks, opportunities, board,
    │                              monthly close, forecast, benchmark, default
    ├── fpa.ts          ← 7 routes: drivers, BvA, forecast, cost center, trend,
    │                              accruals, default
    ├── procurement.ts  ← 5 routes: expiry pipeline, concentration, negotiation,
    │                              spend overview, default
    ├── externalLabor.ts ← 5 routes: over-budget, conversion, burn rate,
    │                               endings, default
    ├── headcount.ts    ← 5 routes: open reqs, fill rate, salary budget,
    │                              backfill, default
    └── cio.ts          ← 5 routes: cloud spend, talking points, finops,
                                    investment story, default
```

### Route Definition Schema

```typescript
interface RouteDefinition {
  key:      string;          // Unique identifier — shown in UI debug tag
  keywords: string[];        // Trigger terms (any substring match)
  negatives?: string[];      // Cancel-if-present terms
  weight:   number;          // Base confidence (0–10); longer keyword = +bonus
  handler:  (ctx: ConversationContext) => AgentResponse;
}

interface ConversationContext {
  question:   string;        // Original (or enriched follow-up) question
  normalized: string;        // Lowercase, trimmed
  history:    ConversationTurn[];
  priorRoute: string | null; // Route key of previous agent response
  snapshot:   FinanceSnapshot;
  agentId:    AgentId;
}
```

### Routing Algorithm

```typescript
function scoreRoute(normalized: string, route: RouteDefinition): number {
  let score = 0;

  for (const kw of route.keywords) {
    if (normalized.includes(kw.toLowerCase())) {
      // Multi-word keywords score higher (more specific = more confident)
      score += route.weight + kw.split(" ").length;
    }
  }

  // Negatives reduce score (but never below 0)
  for (const neg of route.negatives ?? []) {
    if (normalized.includes(neg.toLowerCase())) {
      score = Math.max(0, score - 5);
    }
  }

  return score;
}

// All routes scored; winner selected by highest score
// Ties broken by array order (first-defined route wins)
// Score of 0 for all routes → fallback to routes[0] (default)
```

### Follow-Up Context Enrichment

```typescript
function buildEnrichedQuery(question: string, history: ConversationTurn[]): string {
  const lastUserMessage = history.filter(h => h.role === "user").slice(-1)[0];
  if (!lastUserMessage) return question;

  const wordCount = question.trim().split(/\s+/).length;
  const isFollowUp = FOLLOWUP_PHRASES.some(p => question.toLowerCase().includes(p));

  // Short follow-ups (< 6 words) are prepended with prior context
  if (wordCount < 6 && isFollowUp) {
    return `${lastUserMessage.content} — ${question}`;
  }

  return question;
}
```

**Example:**
- Turn 1: "What's driving the cloud variance?" → routes to `cloud-spend`
- Turn 2: "Tell me more" (3 words, follow-up phrase detected)
  - Enriched: "What's driving the cloud variance? — Tell me more"
  - Routes to `cloud-spend` again (rather than the generic default)

---

## FinanceSnapshot

The `FinanceSnapshot` is a single object computed once per request and passed to all response handlers. It prevents re-computation across handlers and guarantees consistent numbers within a response.

### Key Fields

```typescript
interface FinanceSnapshot {
  // Top-line actuals
  ytdActual: number;           // $18,247,500
  ytdBudget: number;           // $17,400,000
  ytdVariance: number;         // $847,500
  ytdVariancePct: number;      // 0.0487 (4.87%)
  fullYearForecast: number;    // Extrapolated from YTD pace

  // Monthly trend (5 months)
  monthly: MonthlyStat[];      // [{month, actual, budget, forecast}]
  currentMonth: MonthlyStat;   // May 2026 — highest-spend month
  momGrowthPct: number;        // Month-over-month actual growth rate

  // Business unit breakdown
  byBU: BURecord[];            // [{bu, actual, budget, variance}]
  topOverBU: {bu, variance};   // Highest unfavorable BU
  topFavBU:  {bu, variance};   // Highest favorable BU

  // Cloud
  cloudYTD: number;
  cloudBudget: number;
  cloudVariancePct: number;
  cloudMoMGrowth: number;      // May vs April growth rate
  cloudByProvider: ProviderRecord[];

  // External labor
  laborYTD: number;
  overBudgetContractors: Contractor[];
  totalExcessLabor: number;    // Sum of all contractor overages

  // Vendors
  expiringVendors90: Vendor[];  // Contracts expiring within 90 days
  expiringVendors180: Vendor[]; // Contracts expiring within 180 days
  highRiskVendors: Vendor[];

  // Headcount
  hcSummary: { filled, open, pendingOffer, onLeave, total };
  fillRate: number;             // 0.846 = 84.6%
  openReqs: HeadcountRecord[];
  openReqSalaryAtRisk: number; // Remaining-months salary for open positions

  // Raw arrays (for handlers that need full detail)
  headcount: HeadcountRecord[];
  contractors: Contractor[];

  // Risk engine output
  risks: RiskFlag[];
  actions: RecommendedAction[];

  // Formatting helpers bound to this snapshot
  fmt: (n: number, compact?: boolean) => string;
  pct: (n: number) => string;
  dt:  (iso: string) => string;
  daysUntil: (iso: string) => number;
}
```

### Cache Strategy

The snapshot is cached in a module-level variable (`_cache`) and reused within the same process lifetime. In a real production system:

```typescript
// Current: module-level cache (fine for demo/SSR)
let _cache: FinanceSnapshot | null = null;

// Production upgrade options:
// Option A: Redis cache with 1-hour TTL
// Option B: Next.js unstable_cache() for per-deployment caching
// Option C: Recompute per-request (fine for real-time ERP data)
```

---

## UI Architecture

### Component Hierarchy

```
RootLayout (server)
└── PageWrapper (server)
    └── ShellClient (client)              ← Owns mobile sidebar state
        ├── Sidebar (client)              ← Uses usePathname()
        ├── TopBar (client)               ← Hamburger, status indicators
        └── <main> (server-rendered)
            ├── StatsBanner (server)      ← Quick metrics strip
            ├── KPICard × N (server)      ← Sparklines, progress, delta
            ├── VarianceTable (server)    ← Inline utilisation bars
            ├── RiskAlerts (server)       ← Severity-sorted flags
            ├── BudgetVsActualChart (client) ← Recharts (needs browser)
            └── AgentChatPanel (client)   ← Full chat state machine
```

### Why Server Components for Data?

Next.js Server Components render on the server and send HTML to the browser. For this project, that means:

1. **No financial data in the JS bundle** — the browser receives rendered HTML, not serialized financial records
2. **No client-side state for data** — no `useEffect` + `useState` patterns for loading data
3. **Faster page loads** — KPI calculations happen server-side; the browser doesn't block on JavaScript
4. **Simpler code** — data fetching is just a function call, not an async hook

Only three component types need to be client components:
- **Sidebar** — needs `usePathname()` for active link detection
- **Chart components** — Recharts uses browser APIs (ResizeObserver, SVG rendering)
- **AgentChatPanel** — full interaction state machine (messages, streaming, history)

### AgentChatPanel State Machine

```
State:
  messages:    ChatMessage[]        // Full conversation history
  history:     ConversationTurn[]   // Simplified turns for engine context
  input:       string               // Current input field value
  loading:     boolean              // "Thinking" state (before streaming starts)
  streamText:  string               // Partial streamed text
  isStreaming: boolean              // "Typing" state (during character stream)

Transitions:
  sendMessage(text)
    → loading=true, push user message
    → await thinkDelay (700–1800ms)
    → getAgentResponse(agentId, text, history)
    → loading=false, isStreaming=true
    → streamResponse(answer)        // character-by-character
    → isStreaming=false
    → push agent message with full content
    → update history array
```

### Streaming Implementation

```typescript
async function streamResponse(fullText: string): Promise<void> {
  setIsStreaming(true);
  setStreamText("");

  let current = "";
  for (let i = 0; i < fullText.length; i++) {
    current += fullText[i];
    setStreamText(current);

    // Variable speed — pauses at natural boundaries
    const delay =
      fullText[i] === "\n"                       ? 8  :
      ".,!?".includes(fullText[i])               ? 25 :
      fullText[i] === ","                         ? 12 :
      fullText[i] === "*"                         ? 2  : // markdown chars fly by
      2;

    await new Promise(r => setTimeout(r, delay));
  }

  setIsStreaming(false);
  setStreamText("");
}
```

The streaming cursor (a pulsing vertical bar rendered after the current text) reinforces the effect:
```tsx
<span className="inline-block w-0.5 h-3 bg-nexora-500 animate-pulse ml-0.5" />
```

---

## API Layer

### `/api/agent` Route

```
POST /api/agent
Content-Type: application/json

{
  "agentId": "fpa",
  "question": "What is driving the variance?",
  "history": [
    { "role": "user",  "content": "Give me the budget summary" },
    { "role": "agent", "content": "...", "routeKey": "bva" }
  ]
}

Response:
{
  "answer":    "...",
  "keyPoints": [...],
  "riskFlags": [...],
  "actions":   [...],
  "routeKey":  "variance-drivers"
}
```

### Upgrade Path to Claude API

The route handler is structured for a one-file upgrade:

```typescript
// Current (mock):
const response = dispatchAgent(agentId, question, history);
return NextResponse.json(response);

// Upgrade to Claude (uncomment and add ANTHROPIC_API_KEY):
import Anthropic from "@anthropic-ai/sdk";
const client = new Anthropic();

const systemPrompt = buildSystemPrompt(agentId, snapshot);

const message = await client.messages.create({
  model: "claude-opus-4-5",
  max_tokens: 2048,
  system: systemPrompt,
  messages: [
    ...history.map(h => ({
      role: h.role === "user" ? "user" : "assistant" as const,
      content: h.content,
    })),
    { role: "user", content: question },
  ],
});

const answer = message.content[0].type === "text" ? message.content[0].text : "";
return NextResponse.json({ answer, keyPoints: [], riskFlags: [], actions: [] });
```

When using Claude, the `FinanceSnapshot` should be injected into the system prompt as structured context, ensuring the LLM has access to the same financial data the mock engine uses.

---

## Risk Engine

The `riskEngine.ts` module generates rule-based risk flags from live data. Rules run at page render time (server component) and produce `RiskFlag[]` and `RecommendedAction[]` arrays.

### Rule Categories

| Rule | Trigger | Severity |
|------|---------|----------|
| Cloud overage | Cloud actual > cloud budget | Critical if >$100K, else Warning |
| Contract expiry (<90d, no auto-renew) | Per vendor | Critical |
| Contract expiry (90–180d, no auto-renew) | Per vendor | Warning |
| Over-budget contractors | contractor.ytdSpend > contractor.budget | Warning (group) |
| Ending contractors | contractor.status === "Ending Soon" | Info |
| High-risk vendors | vendor.riskLevel === "High" | Warning |
| Critical role vacancies | Open reqs in Security or Cloud Engineering | Info |
| Cost center >5% variance | May actual > May budget × 1.05 | Warning |

### Output Schema

```typescript
interface RiskFlag {
  id:          string;          // "RISK-001", auto-incremented
  severity:    "critical" | "warning" | "info";
  title:       string;          // Short headline
  description: string;          // 1–2 sentences with specific data
  category:    string;          // "Cloud" | "Procurement" | "External Labor" | etc.
  impact:      number;          // Estimated dollar impact
}
```

Flags are sorted: critical → warning → info. The `RiskAlerts` component displays them in this order, with the severity summary bar in the header showing counts by level.

---

## Design System

### Color Tokens

The Nexora brand uses a custom indigo/purple palette defined in `tailwind.config.ts`:

```typescript
nexora: {
  50:  "#eef2ff",  // Backgrounds, hover states
  100: "#e0e7ff",  // Card accents, chip backgrounds
  200: "#c7d2fe",  // Borders, dividers
  300: "#a5b4fc",  // Subtle text, secondary elements
  400: "#818cf8",  // Icons, decorative
  500: "#6366f1",  // Progress bars, sparklines
  600: "#4f46e5",  // Primary buttons, active nav
  700: "#4338ca",  // Hover states
  800: "#3730a3",  // Dark accents
  900: "#312e81",  // Dark backgrounds
  950: "#1e1b4b",  // Executive summary gradient start
}
```

### Semantic Classes (globals.css)

```css
.card         { bg-white rounded-2xl border border-slate-200 shadow-sm }
.card-hover   { card + hover:shadow-md hover:border-slate-300 }
.nav-link     { text-slate-500 hover:bg-slate-100 }
.nav-link-active { bg-nexora-600 text-white }
.label        { text-[10px] font-bold text-slate-400 uppercase tracking-widest }
.tbl-head     { text-[10px] font-bold text-slate-400 uppercase tracking-widest }
.btn-primary  { bg-nexora-600 hover:bg-nexora-700 text-white rounded-xl }
.input        { bg-slate-100 focus:ring-2 focus:ring-nexora-300 }
.var-unfav    { bg-red-50 text-red-700 border border-red-100 }
.var-fav      { bg-emerald-50 text-emerald-700 border border-emerald-100 }
```

### Variance Color Semantics

Financial variance colors follow a consistent rule throughout the app:
- 🔴 **Red** = unfavorable (actual > budget, in a cost context)
- 🟢 **Green** = favorable (actual < budget, or above target in revenue/fill rate contexts)
- 🟡 **Amber** = warning / approaching threshold
- ⚪ **Slate** = neutral / no budget to compare

The `varianceBgClass()` utility in `lib/formatters.ts` encodes this logic:
```typescript
function varianceBgClass(variance: number): string {
  if (variance === 0) return "var-flat";
  return variance > 0 ? "var-unfav" : "var-fav";
}
```

---

## Performance Considerations

### Server Component Data Flow

Financial computations (actuals aggregation, risk flag generation, KPI calculation) run as server-side JavaScript during the request. The client receives pure HTML. No client-side data fetching, no loading skeletons for the main page content.

Measured benchmark (development server, cold start):
- Dashboard page first paint: ~180ms
- All 85 actuals rows aggregated: <1ms
- Risk flag generation (all rules): <2ms
- Agent response dispatch (mock): <5ms

### Bundle Size

Chart components (Recharts) are the only significant client JavaScript. These are dynamically loaded only on pages that use them:

```
Page bundle estimates:
├── / (Dashboard):          ~42KB (Recharts for BudgetVsActualChart)
├── /agents:                ~8KB  (no charts, no heavy components)
├── /cfo:                   ~12KB (chat panel only)
├── /fpa:                   ~42KB (BudgetVsActualChart + chat)
├── /vendors:               ~8KB  (static table + chat)
├── /external-labor:        ~8KB  (static table + chat)
├── /headcount:             ~18KB (HeadcountChart + chat)
└── /cio:                   ~42KB (SpendTrendChart + chat)
```

### Streaming UI Performance

The character streaming runs via `setState` at 2–25ms intervals. React batches re-renders automatically in React 18, so this produces 30–60 visible renders per second — enough for smooth animation without overwhelming the renderer.

---

## Security Notes

This is a portfolio/demo application with mock data. For a production deployment with real financial data:

1. **Add authentication** — Clerk, NextAuth, or Supabase Auth
2. **Add authorization** — row-level security based on business unit
3. **Sanitize agent input** — validate and sanitize all user input before passing to LLM
4. **Rate limit the API route** — prevent abuse of the `/api/agent` endpoint
5. **Remove route debug tags** — the `routeKey` field in responses is useful for demos but should be omitted in production
6. **Encrypt sensitive environment variables** — use Vercel's encrypted env var storage for API keys

---

*For business context and problem framing, see [CASE_STUDY.md](CASE_STUDY.md).*
*For setup instructions and feature overview, see [README.md](README.md).*
