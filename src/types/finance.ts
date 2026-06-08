// ─── Core Finance Types ───────────────────────────────────────────────────────

export type Month =
  | "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export type BusinessUnit =
  | "Infrastructure" | "Security" | "Applications" | "Data & Analytics"
  | "Cloud Engineering" | "IT Operations" | "Enterprise Architecture";

export type CostCategory =
  | "Labor" | "External Labor" | "Software" | "Hardware"
  | "Cloud" | "Professional Services" | "Telecom" | "Facilities" | "Other";

export interface MonthlyStat {
  month: Month;
  actual: number;
  budget: number;
  forecast: number;
}

export interface CostCenter {
  id: string;
  name: string;
  businessUnit: BusinessUnit;
  owner: string;
}

export interface ActualRecord {
  costCenterId: string;
  costCenterName: string;
  businessUnit: BusinessUnit;
  category: CostCategory;
  month: Month;
  year: number;
  actual: number;
  budget: number;
  forecast: number;
  variance: number;          // actual - budget
  variancePct: number;       // variance / budget
}

// ─── Vendor / Procurement ────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  name: string;
  category: CostCategory;
  contractStart: string;     // ISO date
  contractEnd: string;       // ISO date
  annualValue: number;
  ytdSpend: number;
  remainingCommitment: number;
  businessUnit: BusinessUnit;
  autoRenew: boolean;
  riskLevel: "Low" | "Medium" | "High";
}

// ─── External Labor ───────────────────────────────────────────────────────────

export interface Contractor {
  id: string;
  name: string;
  role: string;
  vendor: string;
  costCenterId: string;
  costCenterName: string;
  businessUnit: BusinessUnit;
  monthlyRate: number;
  ytdSpend: number;
  budget: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Ending Soon" | "Over Budget" | "On Hold";
}

// ─── Headcount ────────────────────────────────────────────────────────────────

export type HCStatus = "Filled" | "Open" | "Pending Offer" | "On Leave";

export interface HeadcountRecord {
  id: string;
  title: string;
  businessUnit: BusinessUnit;
  level: "IC3" | "IC4" | "IC5" | "M1" | "M2" | "M3" | "Dir" | "VP";
  status: HCStatus;
  location: string;
  openDate?: string;
  fillDate?: string;
  annualSalary: number;
  isBackfill: boolean;
}

// ─── Cloud Spend ──────────────────────────────────────────────────────────────

export interface CloudSpendRecord {
  provider: "AWS" | "Azure" | "GCP";
  service: string;
  businessUnit: BusinessUnit;
  month: Month;
  spend: number;
  budget: number;
}

// ─── Agent Types ──────────────────────────────────────────────────────────────

// Canonical AgentId — single source of truth.
// src/lib/agents/agent.types.ts re-exports this; do not re-define there.
export type AgentId =
  | "cfo"
  | "fpa"
  | "procurement"
  | "external-labor"
  | "headcount"
  | "cio"
  | "finance-bp"
  | "validation";

export interface AgentMessage {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
  agentId?: AgentId;
}

// Legacy lightweight context (conversation layer).
// The richer AgentContext used by the agent registry lives in src/lib/agents/agent.types.ts.
export interface AgentConversationContext {
  question: string;
  agentId: AgentId;
}

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface AgentResponse {
  answer: string;
  keyPoints: string[];
  riskFlags: RiskFlag[];
  actions: RecommendedAction[];

  // ── Governance fields (populated by live Claude; omitted in mock mode) ───────
  confidence?: ConfidenceLevel;         // overall confidence in the response
  dataCitations?: string[];             // specific metrics cited (e.g. "YTD actual $2.4M")
  assumptions?: string[];               // what was inferred vs. explicitly stated in data
  missingData?: string[];               // data gaps that could affect the analysis
  mode?: "live" | "mock";               // which path produced this response
}

// ─── Risk & Alerts ────────────────────────────────────────────────────────────

export type RiskSeverity = "critical" | "warning" | "info";

export interface RiskFlag {
  id: string;
  severity: RiskSeverity;
  title: string;
  description: string;
  category: string;
  impact: number;            // estimated $ impact
}

export interface RecommendedAction {
  id: string;
  priority: "High" | "Medium" | "Low";
  title: string;
  description: string;
  owner: string;
  dueDate?: string;
}

// ─── Dashboard KPIs ───────────────────────────────────────────────────────────

export type KPIStatus = "favorable" | "unfavorable" | "watch" | "neutral";

export interface KPI {
  label: string;
  value: number;
  budget: number;
  prior: number;             // prior month or prior year actual
  format: "currency" | "percent" | "number" | "headcount";
  trend: "up" | "down" | "flat";
  trendPositive: boolean;    // whether up is good or bad for this KPI

  // ── Narrative fields (optional — used by executive dashboard KPIs) ─────────
  status?: KPIStatus;        // explicit favorable/unfavorable override
  driver?: string;           // 1-sentence explanation of why this is happening
  action?: string;           // recommended action
  varianceDollar?: number;   // explicit $ variance (overrides computed value - budget)
  hasBudget?: boolean;       // false = no budget comparison to show
}
