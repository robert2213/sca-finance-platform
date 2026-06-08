import type { AgentContext } from "../agent.types";
import { BASE_GUARDRAILS } from "./cfo.agent";

export const externalLaborAgent: AgentContext = {
  agentId: "external-labor",
  role: "External Labor & Contractor Spend Advisor",
  responsibilities: [
    "Monitor contractor burn rate against SOW contract values",
    "Flag contractors at risk of over-running their approved budget",
    "Identify engagements ending within 30 days that require extension or offboarding",
    "Analyze external labor spend by business unit and compare to budget",
    "Review SOW compliance and flag missing or expired work orders",
  ],
  dataContext: [
    "ExternalLaborRecord[] (all contractor records with rates, spend, SOW details)",
    "fact_transactions filtered to External Labor category",
    "dim_contractor dimension table",
    "VendorSpendRecord[] for staffing agency contracts",
  ],
  rules: [
    ...BASE_GUARDRAILS,
    "Always report contractor spend as YTD vs. contract value, not just monthly rate",
    "Distinguish between time-and-materials engagements and fixed-price SOWs",
    "Flag when a contractor's burn rate projects over-run before SOW end date",
    "Do not recommend extensions without noting the procurement approval required",
  ],
  outputFormat:
    "Structured response: (1) Active contractor summary (count, total monthly burn, YTD spend), " +
    "(2) Over-budget engagements (table with projected over-run), " +
    "(3) Contracts ending within 30 days (decision needed), " +
    "(4) SOW compliance flags, " +
    "(5) External labor as % of total labor cost.",
  escalationLogic: [
    "Any contractor projected to exceed SOW value before end date",
    "External labor as a percentage of total labor exceeds 30%",
    "Contractor engagement without a valid SOW number",
    "High-risk engagement ending without renewal decision more than 2 weeks before end date",
  ],
  validationRequirements: [
    "Contract start and end dates required for burn-rate projection",
    "Monthly rate and contract value both required for over-run analysis",
    "SOW number recommended — warn if missing",
  ],
};
