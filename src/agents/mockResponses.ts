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

// ─── Main dispatcher (used by AgentChatPanel + /api/agent) ───────────────────

export function getAgentResponse(
  agentId: AgentId,
  question: string,
  history: ConversationTurn[] = []
): AgentResponse {
  return dispatchAgent(agentId, question, history);
}

// ─── Named agent functions (backward-compatible for direct callers) ───────────

export function cfoRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("cfo", question, history);
}

export function fpaRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("fpa", question, history);
}

export function procurementRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("procurement", question, history);
}

export function externalLaborRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("external-labor", question, history);
}

export function headcountRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("headcount", question, history);
}

export function cioRespond(question: string, history?: ConversationTurn[]): AgentResponse {
  return dispatchAgent("cio", question, history);
}

// Re-export ConversationTurn type for consumers
export type { ConversationTurn };
