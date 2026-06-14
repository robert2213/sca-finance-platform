# Agent Contexts

`src/lib/agents/` defines typed `AgentContext` objects for each AI finance agent. These are the structural definitions — separate from the response libraries in `src/agents/responses/`.

## Structure

```typescript
interface AgentContext {
  agentId: AgentId;
  role: string;
  responsibilities: string[];
  dataContext: string[];           // what data this agent can access
  rules: string[];                 // guardrails — BASE_GUARDRAILS + agent-specific
  outputFormat: string;            // expected response shape
  escalationLogic: string[];       // conditions requiring human review
  validationRequirements: string[];// data quality checks before responding
}
```

## Shared Guardrails

All agents spread `BASE_GUARDRAILS` (defined in `contexts/cfo.agent.ts`) into their `rules` array:

```typescript
export const BASE_GUARDRAILS = [
  "Never fabricate or extrapolate numbers not present in source data",
  "Distinguish factual observations from interpretation explicitly",
  "Cite the data source or metric used for every claim",
  "Flag missing, incomplete, or low-confidence data before drawing conclusions",
  "Recommend follow-up questions when data gaps are found",
];
```

Add to `BASE_GUARDRAILS` to apply a rule to all agents without editing each context file.

## Agents

| Agent ID | Role | Key Domain |
|---|---|---|
| `cfo` | CFO Advisor | Executive narrative, board prep, full-year risk |
| `fpa` | FP&A Specialist | Variance analysis, forecast, rolling reforecast |
| `procurement` | Procurement Advisor | Vendor contracts, renewal pipeline, concentration risk |
| `headcount` | Workforce Finance | Fill rate, open reqs, compensation budget |
| `external-labor` | External Labor Advisor | Contractor burn rate, SOW compliance, ending soon |
| `finance-bp` | Finance Business Partner | BU-scoped spend, non-finance translation, budget owner support |
| `validation` | Data Quality Advisor | Validation results interpretation, remediation guidance |

## Registry

```typescript
import { getAgentContext } from "@/lib/agents/agent.registry";

const ctx = getAgentContext("cfo");
// ctx.rules, ctx.dataContext, ctx.escalationLogic, etc.
```

## Connecting to an LLM

When wiring Claude or another LLM, the `AgentContext` becomes the system prompt:

```typescript
const ctx = getAgentContext(agentId);

const systemPrompt = `
You are the ${ctx.role}.

Your responsibilities:
${ctx.responsibilities.map(r => `- ${r}`).join("\n")}

You have access to:
${ctx.dataContext.map(d => `- ${d}`).join("\n")}

Rules you must follow:
${ctx.rules.map(r => `- ${r}`).join("\n")}

Output format: ${ctx.outputFormat}

Escalate to human review when:
${ctx.escalationLogic.map(e => `- ${e}`).join("\n")}
`;
```

No changes to agent context files are needed when switching from mock responses to a real LLM.
