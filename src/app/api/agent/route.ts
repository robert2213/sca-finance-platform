import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { dispatchAgent } from "@/agents/agentEngine";
import { getFinanceSnapshot } from "@/agents/dataContext";
import { buildSystemPrompt } from "@/lib/ai/system-prompt.builder";
import { parseAgentResponse } from "@/lib/ai/response.parser";
import type { AgentId } from "@/types/finance";
import type { ConversationTurn } from "@/agents/agentEngine";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 2048;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;

// Lazy-initialize the client — only created when ANTHROPIC_API_KEY is present.
let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!_client) _client = new Anthropic({ apiKey: key });
  return _client;
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

// Convert internal history to Anthropic messages format
function toAnthropicMessages(
  history: ConversationTurn[],
  question: string
): Anthropic.MessageParam[] {
  const messages: Anthropic.MessageParam[] = [];

  for (const turn of history) {
    messages.push({
      role:    turn.role === "user" ? "user" : "assistant",
      content: turn.content,
    });
  }

  // Append current question
  messages.push({ role: "user", content: question });

  // Anthropic requires alternating user/assistant turns — merge consecutive same-role messages
  const merged: Anthropic.MessageParam[] = [];
  for (const msg of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === msg.role) {
      // Concatenate content
      const prevContent = typeof last.content === "string" ? last.content : "";
      const newContent  = typeof msg.content  === "string" ? msg.content  : "";
      last.content = prevContent + "\n\n" + newContent;
    } else {
      merged.push({ ...msg });
    }
  }

  // Must start with a user message
  if (merged[0]?.role !== "user") {
    merged.unshift({ role: "user", content: question });
  }

  return merged;
}

async function callClaude(
  agentId: AgentId,
  question: string,
  history: ConversationTurn[],
  attempt = 0
): Promise<ReturnType<typeof parseAgentResponse>> {
  const client = getClient();
  if (!client) throw new Error("ANTHROPIC_API_KEY not configured");

  const snapshot     = getFinanceSnapshot();
  const systemPrompt = buildSystemPrompt(agentId, snapshot);
  const messages     = toAnthropicMessages(history, question);

  try {
    const msg = await client.messages.create({
      model:      MODEL,
      max_tokens: MAX_TOKENS,
      system:     systemPrompt,
      messages,
    });

    const rawText = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text)
      .join("");

    console.log(`[Agent API] Claude responded | agent=${agentId} | stop_reason=${msg.stop_reason} | tokens=${msg.usage.output_tokens}`);

    return parseAgentResponse(rawText);

  } catch (err: unknown) {
    const isRetryable =
      err instanceof Anthropic.APIError &&
      (err.status === 529 || err.status === 503 || err.status === 429);

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
      console.warn(`[Agent API] Retrying (attempt ${attempt + 1}) after ${delay}ms | error: ${(err as Error).message}`);
      await sleep(delay);
      return callClaude(agentId, question, history, attempt + 1);
    }

    throw err;
  }
}

export async function POST(request: NextRequest) {
  const startMs = Date.now();

  try {
    const body = await request.json() as {
      agentId:  AgentId;
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

    const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

    if (hasApiKey) {
      // ── Real Claude path ────────────────────────────────────────────────────
      try {
        const response = await callClaude(agentId, question, history);
        console.log(`[Agent API] Claude | agent=${agentId} | ${Date.now() - startMs}ms`);
        return NextResponse.json({ ...response, routeKey: "claude", mode: "live" });

      } catch (claudeErr: unknown) {
        // Log and fall through to mock
        console.error(`[Agent API] Claude failed, falling back to mock | ${(claudeErr as Error).message}`);
        // Fall through to mock below
      }
    }

    // ── Mock fallback path ──────────────────────────────────────────────────
    // Used when no API key is present, or Claude errors after retries.
    await sleep(400 + Math.random() * 800); // realistic latency simulation
    const mockResponse = dispatchAgent(agentId, question, history);
    console.log(`[Agent API] Mock | agent=${agentId} | ${Date.now() - startMs}ms`);
    return NextResponse.json({ ...mockResponse, mode: "mock" });

  } catch (err) {
    console.error("[Agent API] Unhandled error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json({
    status: "ok",
    mode:   hasApiKey ? "live" : "mock",
    model:  hasApiKey ? MODEL : "mock-keyword-routing",
    agents: ["cfo", "fpa", "procurement", "external-labor", "headcount", "cio", "finance-bp", "validation"],
  });
}
