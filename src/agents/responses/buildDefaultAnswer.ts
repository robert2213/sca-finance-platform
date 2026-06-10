/**
 * buildDefaultAnswer — shared default handler for all agent response libraries.
 *
 * Delegates to role-analysis-engine, which analyzes the finance snapshot from
 * the selected agent's professional perspective and generates a natural prose
 * response without capability menus or scripted templates.
 */

import type { AgentResponse } from "@/types/finance";
import type { ConversationContext } from "../agentEngine";
import { buildRoleAnalysisResponse } from "@/lib/ai/role-analysis-engine";

export function buildDefaultAnswer(ctx: ConversationContext): AgentResponse {
  return buildRoleAnalysisResponse(ctx);
}
