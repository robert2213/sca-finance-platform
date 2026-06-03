import { NextRequest, NextResponse } from "next/server";
import { dispatchAgent } from "@/agents/agentEngine";
import type { AgentId } from "@/types/finance";
import type { ConversationTurn } from "@/agents/agentEngine";

/**
 * POST /api/agent
 *
 * Body:
 *   { agentId: AgentId, question: string, history?: ConversationTurn[] }
 *
 * Returns: AgentResponse & { routeKey: string }
 *
 * ─── Upgrade to real Claude API ──────────────────────────────────────────────
 *
 * To use Anthropic Claude instead of mock responses:
 *
 * 1. Add ANTHROPIC_API_KEY to .env.local
 * 2. npm install @anthropic-ai/sdk
 * 3. Replace the dispatchAgent call below with:
 *
 *   import Anthropic from "@anthropic-ai/sdk";
 *   const client = new Anthropic();
 *
 *   const systemPrompt = buildSystemPrompt(agentId, snapshot);  // inject financial data
 *
 *   const message = await client.messages.create({
 *     model: "claude-opus-4-5",
 *     max_tokens: 2048,
 *     system: systemPrompt,
 *     messages: [
 *       ...history.map(h => ({ role: h.role === "user" ? "user" : "assistant", content: h.content })),
 *       { role: "user", content: question },
 *     ],
 *   });
 *
 *   const answer = message.content[0].type === "text" ? message.content[0].text : "";
 *   return NextResponse.json({ answer, keyPoints: [], riskFlags: [], actions: [] });
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      agentId: AgentId;
      question: string;
      history?: ConversationTurn[];
    };

    const { agentId, question, history = [] } = body;

    if (!agentId || !question?.trim()) {
      return NextResponse.json(
        { error: "agentId and question are required" },
        { status: 400 }
      );
    }

    // Simulate realistic AI response latency (600ms – 1.8s)
    // Remove this when using a real API
    await new Promise(r => setTimeout(r, 600 + Math.random() * 1200));

    const response = dispatchAgent(agentId, question, history);
    return NextResponse.json(response);

  } catch (err) {
    console.error("[Agent API]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    agents: ["cfo", "fpa", "procurement", "external-labor", "headcount", "cio"],
    mode: "mock",
    message: "POST with { agentId, question, history? } to query an agent",
  });
}
