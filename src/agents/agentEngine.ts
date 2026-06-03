/**
 * agentEngine.ts
 *
 * Core dispatch and routing engine for all Nexora AI agents.
 *
 * Features:
 * - Scored keyword matching (each keyword has a confidence weight)
 * - Conversation history context (follow-up question awareness)
 * - Response variant selection (avoids repetitive outputs)
 * - Cross-agent handoff hints
 * - Data-grounded responses via FinanceSnapshot
 */

import type { AgentId, AgentResponse } from "@/types/finance";
import { getFinanceSnapshot } from "./dataContext";
import { cfoResponses }          from "./responses/cfo";
import { fpaResponses }          from "./responses/fpa";
import { procurementResponses }  from "./responses/procurement";
import { externalLaborResponses } from "./responses/externalLabor";
import { headcountResponses }    from "./responses/headcount";
import { cioResponses }          from "./responses/cio";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ConversationTurn {
  role: "user" | "agent";
  content: string;
  routeKey?: string;   // which route was matched
}

interface RouteDefinition {
  key: string;
  keywords: string[];     // triggers
  negatives?: string[];   // terms that CANCEL this route
  weight: number;         // base confidence (0–10)
  handler: (ctx: ConversationContext) => AgentResponse;
}

interface ConversationContext {
  question:    string;
  normalized:  string;
  history:     ConversationTurn[];
  priorRoute:  string | null;
  snapshot:    ReturnType<typeof getFinanceSnapshot>;
  agentId:     AgentId;
}

// ─── Route registry ───────────────────────────────────────────────────────────

const routeMap: Record<AgentId, RouteDefinition[]> = {
  cfo:             cfoResponses,
  fpa:             fpaResponses,
  procurement:     procurementResponses,
  "external-labor": externalLaborResponses,
  headcount:       headcountResponses,
  cio:             cioResponses,
};

// ─── Keyword scorer ───────────────────────────────────────────────────────────

function scoreRoute(normalized: string, route: RouteDefinition): number {
  let score = 0;

  for (const kw of route.keywords) {
    if (normalized.includes(kw.toLowerCase())) {
      // Longer keyword matches = higher confidence
      score += route.weight + kw.split(" ").length;
    }
  }

  // Apply negatives
  for (const neg of route.negatives ?? []) {
    if (normalized.includes(neg.toLowerCase())) {
      score = Math.max(0, score - 5);
    }
  }

  return score;
}

// ─── Follow-up detector ───────────────────────────────────────────────────────

const FOLLOWUP_PHRASES = [
  "tell me more", "more detail", "elaborate", "expand on", "what about",
  "and how", "how so", "can you explain", "go deeper", "drill down",
  "specifically", "give me more", "break that down",
];

function isFollowUp(normalized: string, history: ConversationTurn[]): boolean {
  if (history.length === 0) return false;
  return FOLLOWUP_PHRASES.some(p => normalized.includes(p));
}

// ─── Context enrichment ───────────────────────────────────────────────────────

/**
 * Adds context from prior conversation turns into the current question
 * so that follow-ups resolve correctly.
 */
function buildEnrichedQuery(question: string, history: ConversationTurn[]): string {
  const last = history.filter(h => h.role === "user").slice(-1)[0];
  if (!last) return question;

  // If follow-up is very short (< 6 words), prepend prior context
  const words = question.trim().split(/\s+/);
  if (words.length < 6 && isFollowUp(question.toLowerCase(), history)) {
    return `${last.content} — ${question}`;
  }
  return question;
}

// ─── Main dispatch ────────────────────────────────────────────────────────────

export function dispatchAgent(
  agentId: AgentId,
  question: string,
  history: ConversationTurn[] = []
): AgentResponse & { routeKey: string } {
  const snapshot    = getFinanceSnapshot();
  const enriched    = buildEnrichedQuery(question, history);
  const normalized  = enriched.toLowerCase().trim();
  const priorRoute  = history.filter(h => h.routeKey).slice(-1)[0]?.routeKey ?? null;

  const routes = routeMap[agentId] ?? [];

  const ctx: ConversationContext = {
    question:   enriched,
    normalized,
    history,
    priorRoute,
    snapshot,
    agentId,
  };

  // Score all routes
  const scored = routes
    .map(route => ({ route, score: scoreRoute(normalized, route) }))
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  // Pick top match; fall back to first (default) route
  const winner = scored[0]?.route ?? routes[0];
  const response = winner.handler(ctx);

  return { ...response, routeKey: winner.key };
}

// Re-export so consumers don't need to know about the engine internals
export type { ConversationContext };
