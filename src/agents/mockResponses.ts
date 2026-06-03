/**
 * mockResponses.ts
 *
 * Public-facing dispatcher for all agent responses.
 * Delegates to the agentEngine which routes to per-agent response libraries.
 *
 * Backward-compatible exports maintained for API route and any direct callers.
 */

import type { AgentId, AgentResponse } from "@/types/finance";
import { dispatchAgent, type ConversationTurn } from "./agentEngine";

// ─── Extended response type that includes the routing debug tag ───────────────

export type AgentResponseWithRoute = AgentResponse & { routeKey: string };

// ─── Main dispatcher (used by AgentChatPanel + /api/agent) ───────────────────

export function getAgentResponse(
  agentId: AgentId,
  question: string,
  history: ConversationTurn[] = []
): AgentResponseWithRoute {
  return dispatchAgent(agentId, question, history);
}

// ─── Named agent functions (backward-compatible for direct callers) ───────────

export function cfoRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("cfo", question, history);
}

export function fpaRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("fpa", question, history);
}

export function procurementRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("procurement", question, history);
}

export function externalLaborRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("external-labor", question, history);
}

export function headcountRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("headcount", question, history);
}

export function cioRespond(question: string, history?: ConversationTurn[]): AgentResponseWithRoute {
  return dispatchAgent("cio", question, history);
}

// Re-export ConversationTurn type for consumers
export type { ConversationTurn };
