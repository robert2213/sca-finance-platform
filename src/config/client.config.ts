// Client configuration — the single source of truth for all client-specific branding,
// structure, and module enablement. Replace this object per deployment.

export type Month =
  | "January" | "February" | "March" | "April" | "May" | "June"
  | "July" | "August" | "September" | "October" | "November" | "December";

export type ModuleKey =
  | "actuals"
  | "budget"
  | "forecast"
  | "headcount"
  | "vendors"
  | "external_labor"
  | "cloud_spend"
  | "executive_reporting"
  | "agents";

export interface BusinessUnit {
  id: string;
  name: string;
  leadName?: string;
  budgetOwner?: string;
}

export interface CostCenter {
  id: string;
  name: string;
  department: string;
  businessUnitId: string;
}

export interface Department {
  id: string;
  name: string;
  businessUnitId: string;
}

export interface Account {
  code: string;
  name: string;
  category: "OpEx" | "CapEx" | "Revenue" | "Headcount";
  subcategory?: string;
}

export interface AgentConfig {
  agentId: string;
  enabled: boolean;
  displayName: string;
  description: string;
}

export interface ClientConfig {
  clientId: string;
  clientName: string;
  logoPath: string;
  primaryColor: string;
  fiscalYearStart: Month;
  reportingCurrency: "USD";
  reportingPeriods: string[];
  forecastCycles: string[];
  businessUnits: BusinessUnit[];
  costCenters: CostCenter[];
  departments: Department[];
  chartOfAccounts: Account[];
  activeModules: ModuleKey[];
  agents: AgentConfig[];
}

const defaultConfig: ClientConfig = {
  clientId: "demo-client",
  clientName: "Demo Client",
  logoPath: "/logo.svg",
  primaryColor: "#6366f1",
  fiscalYearStart: "January",
  reportingCurrency: "USD",
  reportingPeriods: [
    "2026-01","2026-02","2026-03","2026-04","2026-05","2026-06",
    "2026-07","2026-08","2026-09","2026-10","2026-11","2026-12",
  ],
  forecastCycles: ["3+9", "6+6", "9+3"],
  businessUnits: [
    { id: "BU-001", name: "Cloud Engineering",  leadName: "Sarah Chen",      budgetOwner: "Sarah Chen" },
    { id: "BU-002", name: "Data & Analytics",   leadName: "Marcus Johnson",  budgetOwner: "Marcus Johnson" },
    { id: "BU-003", name: "Infrastructure",     leadName: "David Kim",       budgetOwner: "David Kim" },
    { id: "BU-004", name: "Security",           leadName: "Jennifer Walsh",  budgetOwner: "Jennifer Walsh" },
    { id: "BU-005", name: "Enterprise Apps",    leadName: "Robert Martinez", budgetOwner: "Robert Martinez" },
    { id: "BU-006", name: "IT Operations",      leadName: "Lisa Thompson",   budgetOwner: "Lisa Thompson" },
  ],
  costCenters: [
    { id: "CC-001", name: "Cloud Engineering", department: "Engineering & Cloud",      businessUnitId: "BU-001" },
    { id: "CC-002", name: "Data & Analytics",  department: "Data Science & Analytics", businessUnitId: "BU-002" },
    { id: "CC-003", name: "Infrastructure",    department: "IT Infrastructure",        businessUnitId: "BU-003" },
    { id: "CC-004", name: "Security",          department: "Cybersecurity",            businessUnitId: "BU-004" },
    { id: "CC-005", name: "Enterprise Apps",   department: "Enterprise Applications",  businessUnitId: "BU-005" },
    { id: "CC-006", name: "IT Operations",     department: "IT Operations & Support",  businessUnitId: "BU-006" },
  ],
  departments: [
    { id: "DEPT-001", name: "Engineering & Cloud",      businessUnitId: "BU-001" },
    { id: "DEPT-002", name: "Data Science & Analytics", businessUnitId: "BU-002" },
    { id: "DEPT-003", name: "IT Infrastructure",        businessUnitId: "BU-003" },
    { id: "DEPT-004", name: "Cybersecurity",            businessUnitId: "BU-004" },
    { id: "DEPT-005", name: "Enterprise Applications",  businessUnitId: "BU-005" },
    { id: "DEPT-006", name: "IT Operations & Support",  businessUnitId: "BU-006" },
  ],
  chartOfAccounts: [
    { code: "7100", name: "Cloud Infrastructure",    category: "OpEx", subcategory: "Cloud Compute" },
    { code: "7110", name: "Software Licenses",       category: "OpEx", subcategory: "SaaS & Licensing" },
    { code: "7120", name: "External Labor",          category: "OpEx", subcategory: "Contractor & Consulting" },
    { code: "7130", name: "Professional Services",   category: "OpEx", subcategory: "Contractor & Consulting" },
    { code: "7140", name: "Hardware & Equipment",    category: "CapEx" },
    { code: "7200", name: "Salaries & Benefits",     category: "Headcount" },
    { code: "7210", name: "Recruiting & Onboarding", category: "Headcount" },
    { code: "7300", name: "Telecom & Networking",    category: "OpEx", subcategory: "Infrastructure" },
    { code: "7310", name: "Facilities & Utilities",  category: "OpEx", subcategory: "Infrastructure" },
    { code: "7400", name: "Training & Development",  category: "OpEx" },
    { code: "7410", name: "Travel & Expenses",       category: "OpEx" },
  ],
  activeModules: [
    "actuals", "budget", "forecast", "headcount",
    "vendors", "external_labor", "cloud_spend", "executive_reporting", "agents",
  ],
  agents: [
    { agentId: "cfo",            enabled: true,  displayName: "CFO Agent",              description: "Executive summary, board narrative, risk assessment" },
    { agentId: "fpa",            enabled: true,  displayName: "FP&A Agent",             description: "Variance analysis, cost center drill-down, forecast" },
    { agentId: "procurement",    enabled: true,  displayName: "Procurement Agent",      description: "Contracts, vendor risk, renewal strategy" },
    { agentId: "external-labor", enabled: true,  displayName: "External Labor Agent",   description: "Contractor burn rate, SOW compliance" },
    { agentId: "headcount",      enabled: true,  displayName: "Headcount Agent",        description: "Fill rate, open reqs, salary budget" },
    { agentId: "cio",            enabled: true,  displayName: "CIO Finance Partner",    description: "IT investment narrative, cloud ROI" },
    { agentId: "finance-bp",    enabled: true,  displayName: "Finance Business Partner", description: "BU commentary, budget owner guidance" },
    { agentId: "validation",    enabled: true,  displayName: "Data Quality Advisor",   description: "Upload validation, error remediation" },
  ],
};

export default defaultConfig;
