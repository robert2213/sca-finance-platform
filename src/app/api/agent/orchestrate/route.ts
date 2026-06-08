/**
 * POST /api/agent/orchestrate
 *
 * Runs multiple finance agents in parallel against a single question,
 * aggregates their findings, and returns a unified executive response.
 *
 * Request body:
 * {
 *   question: string                      // required
 *   orchestrationType?: OrchestrationType // default: "full-board"
 *   agents?: AgentId[]                    // used when orchestrationType = "custom"
 * }
 *
 * When ANTHROPIC_API_KEY is present, each agent runs via Claude.
 * When absent, each agent runs via the keyword-routing mock engine.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AgentId } from "@/types/finance";
import type { OrchestrationType, AgentFinding, OrchestrationResult } from "@/agents/orchestrator";
import {
  orchestrate, ORCHESTRATION_SETS, AGENT_NAMES,
} from "@/agents/orchestrator";
import { getFinanceSnapshot } from "@/agents/dataContext";
import { buildSystemPrompt } from "@/lib/ai/system-prompt.builder";
import { parseAgentResponse } from "@/lib/ai/response.parser";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;

// ─── Live Claude agent call ───────────────────────────────────────────────────

async function callClaudeAgent(
  client: Anthropic,
  agentId: AgentId,
  question: string,
  snapshot: ReturnType<typeof getFinanceSnapshot>
): Promise<AgentFinding> {
  const systemPrompt = buildSystemPrompt(agentId, snapshot);

  const msg = await client.messages.create({
    model:      MODEL,
    max_tokens: MAX_TOKENS,
    system:     systemPrompt,
    messages:   [{ role: "user", content: question }],
  });

  const rawText = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map(b => b.text)
    .join("");

  const parsed = parseAgentResponse(rawText);

  return {
    agentId,
    agentName: AGENT_NAMES[agentId] ?? agentId,
    answer:     parsed.answer,
    keyPoints:  parsed.keyPoints,
    actions:    parsed.actions ?? [],
    confidence: parsed.confidence,
  };
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    const body = await request.json() as {
      question: string;
      orchestrationType?: OrchestrationType;
      agents?: AgentId[];
    };

    const { question, orchestrationType = "full-board", agents: customAgents } = body;

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (apiKey) {
      // ── Live Claude path: run all agents in parallel ──────────────────────
      const client   = new Anthropic({ apiKey });
      const snapshot = getFinanceSnapshot();

      const agentIds: AgentId[] =
        orchestrationType === "custom" && customAgents?.length
          ? customAgents
          : (ORCHESTRATION_SETS[orchestrationType as Exclude<OrchestrationType, "custom">] ?? ORCHESTRATION_SETS["full-board"]);

      try {
        const findingPromises = agentIds.map(agentId =>
          callClaudeAgent(client, agentId, question, snapshot).catch(err => {
            // Individual agent failure → fall back to mock for that agent only
            console.error(`[Orchestrate] Agent ${agentId} failed, using mock:`, err);
            return null;
          })
        );

        const rawFindings = await Promise.all(findingPromises);
        const findings    = rawFindings.filter((f): f is AgentFinding => f !== null);

        if (findings.length === 0) {
          // All agents failed — fall through to full mock
          throw new Error("All Claude agents failed");
        }

        // Use the orchestrator's synthesis logic with live findings
        const mockResult = await orchestrate(question, orchestrationType, customAgents);

        // Override mock findings with Claude's live findings
        const result: OrchestrationResult = {
          ...mockResult,
          mode:     "live",
          findings,
          durationMs: Date.now() - startMs,
        };

        console.log(`[Orchestrate] Live | ${findings.length} agents | ${Date.now() - startMs}ms`);
        return NextResponse.json(result);

      } catch (err) {
        console.error("[Orchestrate] Live path failed, falling back to mock:", err);
        // Fall through to mock
      }
    }

    // ── Mock path ─────────────────────────────────────────────────────────────
    const result = await orchestrate(question, orchestrationType, customAgents);
    console.log(`[Orchestrate] Mock | ${result.agentsInvolved.length} agents | ${Date.now() - startMs}ms`);
    return NextResponse.json({ ...result, durationMs: Date.now() - startMs });

  } catch (err) {
    console.error("[Orchestrate] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json({
    status: "ok",
    endpoint: "POST /api/agent/orchestrate",
    mode: hasApiKey ? "live" : "mock",
    model: hasApiKey ? MODEL : "mock-keyword-routing",
    orchestrationTypes: Object.keys(ORCHESTRATION_SETS),
    agentSets: ORCHESTRATION_SETS,
    description: "Runs multiple finance agents in parallel and returns a unified executive response",
  });
}
