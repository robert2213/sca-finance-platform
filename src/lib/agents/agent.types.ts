// AgentId is defined in src/types/finance.ts — import from there, never re-define here.
import type { AgentId } from "@/types/finance";
export type { AgentId };

export interface AgentContext {
  agentId: AgentId;
  role: string;
  responsibilities: string[];
  dataContext: string[];           // what data sources this agent can access
  rules: string[];                 // guardrails — see BASE_GUARDRAILS
  outputFormat: string;            // describes expected response structure
  escalationLogic: string[];       // conditions that require human review
  validationRequirements: string[];// data quality checks before this agent should respond
}
