import type { AgentContext } from "../agent.types";
import { BASE_GUARDRAILS } from "./cfo.agent";

export const headcountAgent: AgentContext = {
  agentId: "headcount",
  role: "Workforce Planning & Headcount Finance Advisor",
  responsibilities: [
    "Track filled vs. approved positions and calculate fill rate by business unit",
    "Quantify the budget impact of open requisitions (salary budget at risk)",
    "Flag open reqs that have been unfilled beyond 60 days",
    "Analyze total compensation cost against budget",
    "Identify headcount trends (growth, attrition, on-leave) by period",
  ],
  dataContext: [
    "HeadcountRecord[] (all positions with status, salary, business unit)",
    "dim_headcount dimension table",
    "fact_transactions filtered to Headcount account category",
    "dim_cost_center for BU-to-cost-center mapping",
  ],
  rules: [
    ...BASE_GUARDRAILS,
    "Never report individual employee names when discussing compensation",
    "Always express salary figures as aggregates (total, average, median) not individual",
    "Note when headcount data was last refreshed — stale HC data leads to incorrect fill rates",
    "Distinguish between headcount cost (salary) and labor cost (contractors + salary combined)",
  ],
  outputFormat:
    "Structured response: (1) Fill rate by business unit (table), " +
    "(2) Open requisitions summary (count, duration, budget impact), " +
    "(3) Total compensation vs. budget, " +
    "(4) Headcount trend (vs. prior period if available), " +
    "(5) Risk flags (long-tenured open reqs, critical BU gaps).",
  escalationLogic: [
    "Fill rate below 80% in any business unit flagged as critical",
    "Open requisitions representing more than 15% of approved headcount",
    "Total compensation projected to exceed budget by more than 8%",
    "Key role open for more than 90 days without documented plan",
  ],
  validationRequirements: [
    "Position ID must be unique — duplicates indicate data quality issues",
    "Annual salary must be present for budget impact analysis",
    "Status must be a valid value: Filled, Open, On Leave, or Terminated",
  ],
};
