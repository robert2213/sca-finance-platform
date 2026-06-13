/**
 * POST /api/agent/executive
 *
 * Generates a monthly executive financial narrative using Claude.
 * Returns a structured JSON deck suitable for rendering, Markdown export,
 * or downstream PowerPoint generation.
 *
 * When ANTHROPIC_API_KEY is absent, returns a mock deck built from
 * the live FinanceSnapshot — still data-grounded, just not LLM-written.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getFinanceSnapshot, resolveSnapshot } from "@/agents/dataContext";
import { withTenant } from "@/lib/tenant/with-tenant";
import type { TenantContext } from "@/lib/tenant/tenant-context";
import { buildSystemPrompt } from "@/lib/ai/system-prompt.builder";
import { formatCurrency, formatPercent } from "@/lib/formatters";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;  // Executive deck needs more tokens than a single agent response

// ─── Response shape ──────────────────────────────────────────────────────────

export interface ExecutiveDeckSection {
  title: string;
  content: string;           // markdown-formatted narrative
  keyMetrics?: string[];     // bullet points with specific numbers
  actions?: string[];        // recommended actions for this section
}

export interface ExecutiveDeck {
  generatedAt: string;       // ISO timestamp
  period: string;            // e.g. "YTD May 2026"
  mode: "live" | "mock";
  confidence: "High" | "Medium" | "Low";

  // ── Deck sections ──────────────────────────────────────────────────────────
  executiveSummary:        ExecutiveDeckSection;
  budgetVsActual:          ExecutiveDeckSection;
  forecastRisk:            ExecutiveDeckSection;
  topVarianceDrivers:      ExecutiveDeckSection;
  vendorCommentary:        ExecutiveDeckSection;
  headcountCommentary:     ExecutiveDeckSection;
  externalLaborCommentary: ExecutiveDeckSection;
  recommendedActions:      ExecutiveDeckSection;
  questionsForLeadership:  ExecutiveDeckSection;

  // ── Governance ─────────────────────────────────────────────────────────────
  dataCitations: string[];
  missingData:   string[];
  assumptions:   string[];
}

// ─── System prompt for executive deck ────────────────────────────────────────

function buildExecutiveDeckPrompt(snapshot: ReturnType<typeof getFinanceSnapshot>): string {
  // Reuse the CFO system prompt as the base — it has full financial data
  const basePrompt = buildSystemPrompt("cfo", snapshot);

  const deckInstructions = `
## EXECUTIVE DECK GENERATION TASK

You are generating a complete monthly executive financial narrative. This will be used in a
board/executive leadership meeting. Every section must be specific, data-grounded, and action-oriented.

Respond with ONLY a valid JSON object matching this exact structure (no text before or after):

{
  "executiveSummary": {
    "title": "Executive Financial Summary",
    "content": "2-3 paragraph narrative (markdown). Synthesize overall financial position, key wins, key concerns, and strategic context.",
    "keyMetrics": ["YTD actual vs budget with $ and % variance", "Full-year forecast vs plan", "Top risk in 1 sentence"],
    "actions": ["1-2 immediate executive actions required"]
  },
  "budgetVsActual": {
    "title": "Budget vs. Actual Commentary",
    "content": "Paragraph explaining YTD variance by business unit. Name specific BUs that are over/under and why.",
    "keyMetrics": ["BU-level variances with $ amounts"],
    "actions": []
  },
  "forecastRisk": {
    "title": "Full-Year Forecast & Risk",
    "content": "What is the full-year trajectory? What risks could cause a miss vs. plan? What is the range of outcomes?",
    "keyMetrics": ["Full-year forecast vs budget", "Key risk items that could shift the number"],
    "actions": ["Action to mitigate the largest forecast risk"]
  },
  "topVarianceDrivers": {
    "title": "Top Variance Drivers",
    "content": "Name the 3-5 specific line items or cost categories driving the largest variances (favorable and unfavorable). Quantify each.",
    "keyMetrics": ["Each driver with $ variance amount"],
    "actions": []
  },
  "vendorCommentary": {
    "title": "Vendor & Contract Commentary",
    "content": "Expiring contracts, high-risk vendors, spend concentration. What actions are needed in the next 30-90 days?",
    "keyMetrics": ["# contracts expiring, $ at risk, high-risk vendor count"],
    "actions": ["Specific vendor actions with owner and due date"]
  },
  "headcountCommentary": {
    "title": "Headcount Commentary",
    "content": "Fill rate vs. plan, open reqs by BU, salary budget impact of open positions.",
    "keyMetrics": ["Fill rate %, open req count, salary budget at risk"],
    "actions": ["Hiring priority actions"]
  },
  "externalLaborCommentary": {
    "title": "External Labor Commentary",
    "content": "Contractor spend vs. budget, over-budget engagements, SOW risks, engagements ending soon.",
    "keyMetrics": ["YTD contractor spend vs budget, over-budget engagement count, $ excess"],
    "actions": ["Contract actions for over-budget or ending-soon engagements"]
  },
  "recommendedActions": {
    "title": "Recommended Actions",
    "content": "Consolidated list of the 5-7 most important actions across all categories. Prioritized by urgency and financial impact.",
    "keyMetrics": [],
    "actions": ["Each action: what, who, by when, $ impact"]
  },
  "questionsForLeadership": {
    "title": "Questions for Leadership",
    "content": "3-5 questions the finance team needs leadership to answer in order to close gaps, resolve risks, or update the forecast.",
    "keyMetrics": [],
    "actions": []
  },
  "confidence": "High",
  "dataCitations": ["List 5-8 specific metrics you cited with their values"],
  "missingData": ["Any data gaps that limited the analysis"],
  "assumptions": ["Assumptions made beyond what data explicitly states"]
}
`.trim();

  return `${basePrompt}\n\n---\n\n${deckInstructions}`;
}

// ─── Mock deck builder ────────────────────────────────────────────────────────

function buildMockDeck(snapshot: ReturnType<typeof getFinanceSnapshot>): ExecutiveDeck {
  const s = snapshot;
  const fmt = formatCurrency;
  const pct = formatPercent;

  const varDir = s.ytdVariance > 0 ? "unfavorable" : "favorable";
  const topBU = s.topOverBU;
  const topFav = s.topFavBU;

  return {
    generatedAt: new Date().toISOString(),
    period: s.periodLabel,
    mode: "mock",
    confidence: "High",

    executiveSummary: {
      title: "Executive Financial Summary",
      content: `**YTD IT spend is ${fmt(s.ytdActual)}**, tracking ${pct(Math.abs(s.ytdVariancePct))} ${varDir} vs. the approved plan of ${fmt(s.ytdBudget)}. The primary driver is cloud infrastructure over-spend, with AWS and GCP both exceeding budget YTD.\n\nFull-year forecast of ${fmt(s.fullYearForecast)} vs. budget of ${fmt(s.fullYearBudget)} indicates continued pressure unless cost actions are taken in H2. The FinOps optimization program targeting $350K in cloud savings is the highest-priority mitigation.\n\nHeadcount fill rate of ${pct(s.fillRate)} creates a secondary risk — open positions are generating contractor dependency at a cost premium.`,
      keyMetrics: [
        `YTD Actual: ${fmt(s.ytdActual)} vs Budget: ${fmt(s.ytdBudget)} (${pct(s.ytdVariancePct)} ${varDir})`,
        `Full-Year Forecast: ${fmt(s.fullYearForecast)} vs Budget: ${fmt(s.fullYearBudget)}`,
        `Cloud over-budget: ${fmt(s.cloudVariance)} | HC fill rate: ${pct(s.fillRate)}`,
      ],
      actions: [
        "Approve H2 cloud cost reduction plan — target $350K savings via FinOps program",
        "Prioritize open headcount fills to reduce contractor dependency premium",
      ],
    },

    budgetVsActual: {
      title: "Budget vs. Actual Commentary",
      content: `YTD variance of ${fmt(s.ytdVariance)} (${pct(s.ytdVariancePct)}) is driven primarily by cloud and external labor spend.${topBU ? ` **${topBU.bu}** is the largest over-budget business unit at ${pct(topBU.variancePct)} unfavorable.` : ""}${topFav ? ` **${topFav.bu}** shows favorable variance at ${pct(Math.abs(topFav.variancePct))} under budget, driven by delayed hiring.` : ""}`,
      keyMetrics: s.byBU.slice(0, 4).map(bu => {
        const v = bu.budget > 0 ? (bu.actual - bu.budget) / bu.budget : 0;
        return `${bu.bu}: ${fmt(bu.actual)} actual vs ${fmt(bu.budget)} budget (${pct(v)})`;
      }),
      actions: [],
    },

    forecastRisk: {
      title: "Full-Year Forecast & Risk",
      content: `Full-year forecast of ${fmt(s.fullYearForecast)} vs. plan of ${fmt(s.fullYearBudget)} (${pct((s.fullYearForecast - s.fullYearBudget) / s.fullYearBudget)}) assumes modest deceleration in H2. Primary upside risk is continued cloud growth as AI/ML platform workloads scale. Primary downside is successful FinOps execution delivering planned savings.`,
      keyMetrics: [
        `Full-Year Forecast: ${fmt(s.fullYearForecast)} vs Budget: ${fmt(s.fullYearBudget)}`,
        `Cloud MoM growth: ${pct(s.cloudMoMGrowth)} — if sustained, adds ~${fmt(s.cloudVariance * 1.4)} to YE overrun`,
        `${s.overBudgetContractors.length} over-budget contractors — ${fmt(s.totalExcessLabor)} excess already incurred`,
      ],
      actions: ["Execute FinOps cloud optimization by end of Q3 to capture H2 savings"],
    },

    topVarianceDrivers: {
      title: "Top Variance Drivers",
      content: `The following are the primary contributors to the YTD budget variance:\n\n1. **Cloud Infrastructure** — ${fmt(s.cloudVariance)} over budget (${pct(s.cloudVariancePct)}). AWS EC2 and GCP Vertex AI are the primary drivers.\n2. **External Labor** — ${fmt(s.laborVariance)} over budget. ${s.overBudgetContractors.length} engagements are individually over their approved SOW budgets.\n3. **Headcount** — Under-spend of ~${fmt(Math.abs(s.openReqSalaryAtRisk * -1))} due to ${s.openReqs.length} open positions — this is a favorable offset but creates operational risk.`,
      keyMetrics: [
        `Cloud: ${fmt(s.cloudVariance)} over (${pct(s.cloudVariancePct)})`,
        `External Labor: ${fmt(s.laborVariance)} over`,
        `Headcount under-spend: open reqs generating ${fmt(s.openReqSalaryAtRisk)} in salary budget offset`,
      ],
      actions: [],
    },

    vendorCommentary: {
      title: "Vendor & Contract Commentary",
      content: `Total annual vendor commitment is ${fmt(s.vendorCommitment)} with ${fmt(s.vendorYTDSpend)} spent YTD. **${s.expiringVendors90.length} contract(s) expire within 90 days** — renewals requiring immediate action.${s.highRiskVendors.length > 0 ? ` **${s.highRiskVendors.length} high-risk vendor(s)** require monitoring.` : ""}`,
      keyMetrics: [
        `Annual commitment: ${fmt(s.vendorCommitment)}`,
        `Expiring in 90 days: ${s.expiringVendors90.length} contracts`,
        `High-risk vendors: ${s.highRiskVendors.length}`,
      ],
      actions: s.expiringVendors90.slice(0, 3).map(v =>
        `Renew/action ${v.name} — expires ${v.contractEnd}${v.autoRenew ? " (auto-renews)" : " — MANUAL RENEWAL REQUIRED"}`
      ),
    },

    headcountCommentary: {
      title: "Headcount Commentary",
      content: `Headcount fill rate is **${pct(s.fillRate)}** (${s.hcSummary.filled} filled / ${s.hcSummary.total} approved). **${s.openReqs.length} open requisitions** are active, concentrated in ${s.hcByBU.filter(b => b.open > 0).map(b => b.bu).slice(0, 3).join(", ")}. Open positions represent ${fmt(s.openReqSalaryAtRisk)} in remaining-year salary budget.`,
      keyMetrics: [
        `Fill rate: ${pct(s.fillRate)} (${s.hcSummary.filled}/${s.hcSummary.total})`,
        `Open requisitions: ${s.openReqs.length}`,
        `Salary budget at risk: ${fmt(s.openReqSalaryAtRisk)} (remaining months)`,
      ],
      actions: ["Review top 3 open reqs for offer readiness — candidate pipelines need weekly check-in"],
    },

    externalLaborCommentary: {
      title: "External Labor Commentary",
      content: `YTD contractor spend is **${fmt(s.laborYTD)}** vs budget of **${fmt(s.laborBudget)}** (${pct((s.laborYTD - s.laborBudget) / s.laborBudget)}). **${s.overBudgetContractors.length} engagement(s)** are individually over their approved budgets, with ${fmt(s.totalExcessLabor)} in excess spend. **${s.endingSoonContractors.length} engagement(s)** end within 60 days — decision needed on extension or close-out.`,
      keyMetrics: [
        `YTD contractor spend: ${fmt(s.laborYTD)} vs budget ${fmt(s.laborBudget)}`,
        `Over-budget engagements: ${s.overBudgetContractors.length} (${fmt(s.totalExcessLabor)} excess)`,
        `Ending within 60 days: ${s.endingSoonContractors.length}`,
      ],
      actions: [
        `Review ${s.overBudgetContractors.length} over-budget engagements — determine if SOW amendments are needed`,
        `Decision on ${s.endingSoonContractors.length} ending-soon engagements — extend or close by end of month`,
      ],
    },

    recommendedActions: {
      title: "Recommended Actions — Top 6",
      content: "The following actions are prioritized by urgency and financial impact:",
      keyMetrics: [],
      actions: [
        `[HIGH | Finance] Approve H2 cloud FinOps plan — target ${fmt(350000)} savings by Q4`,
        `[HIGH | Procurement] Renew / action ${s.expiringVendors90.length} contracts expiring within 90 days`,
        `[HIGH | HR] Fill top 3 open headcount reqs — reduce contractor dependency`,
        `[MEDIUM | Finance BP] Review ${s.overBudgetContractors.length} over-budget contractor SOWs — approve amendments or initiate close-out`,
        `[MEDIUM | CFO] Present full-year forecast risk to board — quantify $${fmt(Math.abs(s.fullYearForecast - s.fullYearBudget))} overrun scenario`,
        `[LOW | IT] Implement cloud tagging compliance to improve cost attribution to business units`,
      ],
    },

    questionsForLeadership: {
      title: "Questions for Leadership",
      content: "Finance needs leadership input on the following before the forecast can be finalized:",
      keyMetrics: [],
      actions: [
        "Is the AI platform (GCP Vertex AI) buildout on track to its approved roadmap? What is the expected H2 spend rate?",
        `Are the ${s.openReqs.length} open headcount requisitions still active, or should any be deferred to FY2027?`,
        `Should any of the ${s.overBudgetContractors.length} over-budget contractor engagements be capped or closed? What is the business impact of reducing scope?`,
        "Has the board approved any budget amendments for H2 that are not yet reflected in the current plan?",
        "What is the expected impact of the FinOps optimization program — is the $350K savings target confirmed?",
      ],
    },

    dataCitations: [
      `YTD IT Spend: ${fmt(s.ytdActual)} (source: fact_transactions, transaction_type=actual)`,
      `YTD Budget: ${fmt(s.ytdBudget)} (source: fact_transactions, transaction_type=budget)`,
      `Cloud YTD: ${fmt(s.cloudYTD)} vs budget ${fmt(s.cloudBudget)} (source: cloudSpend static data)`,
      `Contractor YTD: ${fmt(s.laborYTD)} vs budget ${fmt(s.laborBudget)} (source: dim_contractor)`,
      `Headcount fill rate: ${pct(s.fillRate)} — ${s.hcSummary.filled}/${s.hcSummary.total} (source: dim_headcount)`,
      `Expiring contracts (90 days): ${s.expiringVendors90.length} (source: dim_vendor)`,
    ],

    missingData: [
      "Monthly cloud cost by service tag not available — provider-level only",
      "Individual cost center budget allocations not available for sub-BU drill-down",
      "H2 approved budget amendments not captured if entered after last data refresh",
    ],

    assumptions: [
      "Full-year forecast assumes 3% H2 deceleration vs. H1 run rate",
      "Salary budget at risk calculation uses 7 remaining months (June–December)",
      "Cloud MoM growth rate extrapolated from April–May trend",
    ],
  };
}

// ─── Claude deck parser ───────────────────────────────────────────────────────

function parseDeckResponse(
  raw: string,
  snapshot: ReturnType<typeof getFinanceSnapshot>
): ExecutiveDeck {
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const start = cleaned.indexOf("{");
  const end   = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1) return buildMockDeck(snapshot);

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as any;

    const section = (key: string, fallback: ExecutiveDeckSection): ExecutiveDeckSection => {
      const s = parsed[key];
      if (!s || typeof s.content !== "string") return fallback;
      return {
        title:      typeof s.title === "string" ? s.title : fallback.title,
        content:    s.content,
        keyMetrics: Array.isArray(s.keyMetrics) ? s.keyMetrics.filter((k: unknown) => typeof k === "string") : [],
        actions:    Array.isArray(s.actions)    ? s.actions.filter((a: unknown) => typeof a === "string")    : [],
      };
    };

    const mock = buildMockDeck(snapshot);

    return {
      generatedAt: new Date().toISOString(),
      period:      snapshot.periodLabel,
      mode:        "live",
      confidence:  ["High", "Medium", "Low"].includes(parsed.confidence) ? parsed.confidence : "High",
      executiveSummary:        section("executiveSummary",        mock.executiveSummary),
      budgetVsActual:          section("budgetVsActual",          mock.budgetVsActual),
      forecastRisk:            section("forecastRisk",            mock.forecastRisk),
      topVarianceDrivers:      section("topVarianceDrivers",      mock.topVarianceDrivers),
      vendorCommentary:        section("vendorCommentary",        mock.vendorCommentary),
      headcountCommentary:     section("headcountCommentary",     mock.headcountCommentary),
      externalLaborCommentary: section("externalLaborCommentary", mock.externalLaborCommentary),
      recommendedActions:      section("recommendedActions",      mock.recommendedActions),
      questionsForLeadership:  section("questionsForLeadership",  mock.questionsForLeadership),
      dataCitations: Array.isArray(parsed.dataCitations)
        ? parsed.dataCitations.filter((c: unknown) => typeof c === "string")
        : mock.dataCitations,
      missingData: Array.isArray(parsed.missingData)
        ? parsed.missingData.filter((m: unknown) => typeof m === "string")
        : mock.missingData,
      assumptions: Array.isArray(parsed.assumptions)
        ? parsed.assumptions.filter((a: unknown) => typeof a === "string")
        : mock.assumptions,
    };
  } catch {
    return buildMockDeck(snapshot);
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

async function handleExecutive(_request: NextRequest, ctx: TenantContext) {
  // Tenant-scoped snapshot from the authenticated session.
  const snapshot = await resolveSnapshot(ctx.clientId);
  const apiKey   = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const systemPrompt = buildExecutiveDeckPrompt(snapshot);

      const msg = await client.messages.create({
        model:      MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{
          role:    "user",
          content: "Generate the complete monthly executive financial deck for the current period.",
        }],
        system: systemPrompt,
      });

      const rawText = msg.content
        .filter((b): b is Anthropic.TextBlock => b.type === "text")
        .map(b => b.text)
        .join("");

      console.log(`[Executive API] Claude responded | tokens=${msg.usage.output_tokens}`);

      const deck = parseDeckResponse(rawText, snapshot);
      return NextResponse.json(deck);

    } catch (err) {
      console.error("[Executive API] Claude failed, falling back to mock:", err);
      // Fall through to mock
    }
  }

  // Mock path
  const deck = buildMockDeck(snapshot);
  console.log("[Executive API] Returning mock deck");
  return NextResponse.json(deck);
}

export const POST = withTenant(handleExecutive, { permission: "reports:view_executive", action: "agent.executive" });

export async function GET() {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/agent/executive",
    mode: hasApiKey ? "live" : "mock",
    model: hasApiKey ? MODEL : "mock-data-driven",
    description: "Generates a complete monthly executive financial narrative deck",
    sections: [
      "executiveSummary", "budgetVsActual", "forecastRisk", "topVarianceDrivers",
      "vendorCommentary", "headcountCommentary", "externalLaborCommentary",
      "recommendedActions", "questionsForLeadership",
    ],
  });
}
