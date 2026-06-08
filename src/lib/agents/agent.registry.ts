import type { AgentContext, AgentId } from "./agent.types";
import { cfoAgent } from "./contexts/cfo.agent";
import { fpaAgent } from "./contexts/fpa.agent";
import { procurementAgent } from "./contexts/procurement.agent";
import { headcountAgent } from "./contexts/headcount.agent";
import { externalLaborAgent } from "./contexts/external-labor.agent";
import { cioAgent } from "./contexts/cio.agent";
import { financeBpAgent } from "./contexts/finance-bp.agent";
import { validationAgent } from "./contexts/validation.agent";

const registry: Record<AgentId, AgentContext> = {
  "cfo":            cfoAgent,
  "fpa":            fpaAgent,
  "procurement":    procurementAgent,
  "headcount":      headcountAgent,
  "external-labor": externalLaborAgent,
  "cio":            cioAgent,
  "finance-bp":     financeBpAgent,
  "validation":     validationAgent,
};

export function getAgentContext(id: AgentId): AgentContext {
  return registry[id];
}

export function getAllAgentContexts(): AgentContext[] {
  return Object.values(registry);
}

export { registry as agentRegistry };
