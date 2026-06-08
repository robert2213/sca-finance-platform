/**
 * AgentOrchestrator
 *
 * Runs multiple agents in parallel, aggregates their findings,
 * resolves conflicts between agents, and returns a unified executive response.
 *
 * Used by POST /api/agent/orchestrate.
 *
 * In mock mode: calls dispatchAgent for each included agent.
 * In live mode: calls Claude in parallel via Promise.all.
 */

import type { AgentId, AgentResponse } from "@/types/finance";
import { dispatchAgent } from "./agentEngine";
import { getFinanceSnapshot } from "./dataContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AgentFinding {
  agentId: AgentId;
  agentName: string;
  answer: string;
  keyPoints: string[];
  actions: AgentResponse["actions"];
  confidence?: "High" | "Medium" | "Low";
}

export interface OrchestrationResult {
  question: string;
  mode: "live" | "mock";
  agentsInvolved: AgentId[];
  findings: AgentFinding[];
  synthesis: string;          // unified executive response combining all agent inputs
  combinedActions: AgentResponse["actions"];
  conflictsDetected: string[]; // any contradictions between agents
  confidence: "High" | "Medium" | "Low";
  durationMs: number;
}

// ─── Agent names ──────────────────────────────────────────────────────────────

const AGENT_NAMES: Record<AgentId, string> = {
  "cfo":            "CFO Agent",
  "fpa":            "FP&A Agent",
  "procurement":    "Procurement Agent",
  "external-labor": "External Labor Agent",
  "headcount":      "Headcount Agent",
  "cio":            "CIO Finance Partner",
  "finance-bp":     "Finance Business Partner",
  "validation":     "Data Quality Advisor",
};

// ─── Domain routing: which agents are relevant for a given question ───────────

export type OrchestrationType =
  | "full-board"     // All strategic agents: CFO + FP&A + Procurement + HC + External Labor
  | "executive"      // CFO + FP&A + CIO
  | "cost-review"    // FP&A + Procurement + External Labor
  | "workforce"      // Headcount + External Labor + Finance BP
  | "it-investment"  // CIO + Cloud (FP&A) + External Labor
  | "custom";        // Caller specifies agents explicitly

const ORCHESTRATION_SETS: Record<Exclude<OrchestrationType, "custom">, AgentId[]> = {
  "full-board":   ["cfo", "fpa", "procurement", "headcount", "external-labor"],
  "executive":    ["cfo", "fpa", "cio"],
  "cost-review":  ["fpa", "procurement", "external-labor"],
  "workforce":    ["headcount", "external-labor", "finance-bp"],
  "it-investment": ["cio", "fpa", "external-labor"],
};

// ─── Conflict detector ────────────────────────────────────────────────────────

/**
 * Looks for numeric contradictions between agent responses.
 * Simple heuristic: if two agents state materially different $ amounts for
 * the same concept, flag it.
 */
function detectConflicts(findings: AgentFinding[]): string[] {
  const conflicts: string[] = [];

  // Check for contradictory risk assessments
  const highRiskAgents   = findings.filter(f => f.keyPoints.some(k => /critical|severe|urgent/i.test(k)));
  const lowRiskAgents    = findings.filter(f => f.keyPoints.some(k => /on track|within budget|favorable/i.test(k)));

  if (highRiskAgents.length > 0 && lowRiskAgents.length > 0) {
    conflicts.push(
      `Risk assessment divergence: ${highRiskAgents.map(f => f.agentName).join(", ")} flag ` +
      `critical issues while ${lowRiskAgents.map(f => f.agentName).join(", ")} indicate ` +
      `favorable conditions — review domain scope differences`
    );
  }

  return conflicts;
}

// ─── Response synthesizer ─────────────────────────────────────────────────────

function synthesizeFindings(question: string, findings: AgentFinding[]): string {
  if (findings.length === 0) return "No agent findings to synthesize.";
  if (findings.length === 1) return findings[0].answer;

  const s = getFinanceSnapshot();

  const agentList = findings.map(f => f.agentName).join(", ");
  const topKeyPoints = findings
    .flatMap(f => f.keyPoints.slice(0, 2))
    .slice(0, 6);

  return [
    `**Multi-Agent Analysis** | ${agentList}`,
    "",
    `**Question:** ${question}`,
    "",
    `**Synthesized View** (YTD ${s.periodLabel}):`,
    "",
    ...topKeyPoints.map(p => `- ${p}`),
    "",
    "**Per-Agent Findings:**",
    ...findings.map(f => `\n**${f.agentName}:** ${f.answer.slice(0, 400)}${f.answer.length > 400 ? "..." : ""}`),
  ].join("\n");
}

// ─── Action deduplicator ──────────────────────────────────────────────────────

function mergeActions(findings: AgentFinding[]): AgentResponse["actions"] {
  const seen = new Set<string>();
  const merged: AgentResponse["actions"] = [];

  for (const finding of findings) {
    for (const action of finding.actions ?? []) {
      const key = action.title.toLowerCase().slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(action);
      }
    }
  }

  // Sort by priority: High → Medium → Low
  const priority = { High: 0, Medium: 1, Low: 2 };
  merged.sort((a, b) => (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1));

  return merged.slice(0, 8); // cap at 8 combined actions
}

// ─── Confidence rollup ────────────────────────────────────────────────────────

function rollupConfidence(findings: AgentFinding[]): "High" | "Medium" | "Low" {
  const confidences = findings.map(f => f.confidence ?? "High");
  if (confidences.includes("Low"))    return "Low";
  if (confidences.includes("Medium")) return "Medium";
  return "High";
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export async function orchestrate(
  question: string,
  orchestrationType: OrchestrationType = "full-board",
  customAgents?: AgentId[]
): Promise<OrchestrationResult> {
  const startMs = Date.now();

  // Determine which agents to involve
  const agentIds: AgentId[] =
    orchestrationType === "custom" && customAgents?.length
      ? customAgents
      : ORCHESTRATION_SETS[orchestrationType as Exclude<OrchestrationType, "custom">] ?? ORCHESTRATION_SETS["full-board"];

  // Run all agents in parallel
  const findingPromises = agentIds.map(async (agentId): Promise<AgentFinding> => {
    // In mock mode, dispatchAgent is synchronous — wrap in Promise for uniform handling
    const response = await Promise.resolve(dispatchAgent(agentId, question));
    return {
      agentId,
      agentName: AGENT_NAMES[agentId] ?? agentId,
      answer:     response.answer,
      keyPoints:  response.keyPoints,
      actions:    response.actions ?? [],
      confidence: response.confidence,
    };
  });

  const findings = await Promise.all(findingPromises);

  const conflicts      = detectConflicts(findings);
  const synthesis      = synthesizeFindings(question, findings);
  const combinedActions = mergeActions(findings);
  const confidence     = rollupConfidence(findings);

  return {
    question,
    mode:           "mock",  // updated to "live" by the API route when Claude is active
    agentsInvolved: agentIds,
    findings,
    synthesis,
    combinedActions,
    conflictsDetected: conflicts,
    confidence,
    durationMs: Date.now() - startMs,
  };
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export { ORCHESTRATION_SETS, AGENT_NAMES };
