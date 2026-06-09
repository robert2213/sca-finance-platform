import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { dispatchAgent } from "@/agents/agentEngine";
import { getFinanceSnapshot } from "@/agents/dataContext";
import { buildSystemPrompt, classifyIntent } from "@/lib/ai/system-prompt.builder";
import { parseAgentResponse } from "@/lib/ai/response.parser";
import type { AgentId } from "@/types/finance";
import type { ConversationTurn } from "@/agents/agentEngine";

const MODEL         = "claude-sonnet-4-6";
const MAX_TOKENS    = 2048;
const MAX_RETRIES   = 2;
const RETRY_DELAY_MS = 1000;

// ── Pipeline log helper ────────────────────────────────────────────────────────
// Emit structured JSON logs at each pipeline stage so every layer is traceable.
// In production, pipe to your log aggregator; locally, visible in `next dev` terminal.

function pipelineLog(stage: string, data: Record<string, unknown>) {
  const line = JSON.stringify({ ts: new Date().toISOString(), stage, ...data });
  console.log(`[PIPELINE] ${line}`);
}

// Lazy-initialize the Anthropic client — only created when API key is present.
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
  history:  ConversationTurn[],
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
  agentId:  AgentId,
  question: string,
  history:  ConversationTurn[],
  attempt   = 0
): Promise<ReturnType<typeof parseAgentResponse>> {
  const client = getClient();
  if (!client) throw new Error("ANTHROPIC_API_KEY not configured");

  // ── Layer 1: Intent classification ────────────────────────────────────────
  const intent = classifyIntent(question);
  pipelineLog("INTENT_CLASSIFIED", {
    agentId,
    question,
    intent:       intent.intent,
    confidence:   intent.confidence,
    dataSections: intent.dataSections,
  });

  // ── Layer 2: System prompt construction ───────────────────────────────────
  const snapshot     = getFinanceSnapshot();
  const systemPrompt = buildSystemPrompt(agentId, snapshot, question);

  pipelineLog("SYSTEM_PROMPT_BUILT", {
    agentId,
    intent:        intent.intent,
    promptLength:  systemPrompt.length,
    dataSections:  intent.dataSections,
    // In development, log the full prompt so you can verify the question directive is present.
    // Remove or gate behind DEBUG_PROMPTS=true in production if prompts are large.
    ...(process.env.NODE_ENV === "development" && {
      systemPromptPreview: systemPrompt.slice(0, 600) + (systemPrompt.length > 600 ? "…[truncated]" : ""),
    }),
  });

  // ── Layer 3: Message construction ────────────────────────────────────────
  const messages = toAnthropicMessages(history, question);

  pipelineLog("MESSAGES_BUILT", {
    agentId,
    question,
    questionReachedMessages: messages[messages.length - 1]?.content === question,
    messageCount:  messages.length,
    lastMessage:   messages[messages.length - 1],
  });

  // ── Layer 4: Claude API call ───────────────────────────────────────────────
  pipelineLog("CLAUDE_REQUEST_SENT", {
    agentId,
    model:      MODEL,
    maxTokens:  MAX_TOKENS,
    attempt,
  });

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

    // ── Layer 5: Response received ─────────────────────────────────────────
    pipelineLog("CLAUDE_RESPONSE_RECEIVED", {
      agentId,
      stopReason:   msg.stop_reason,
      inputTokens:  msg.usage.input_tokens,
      outputTokens: msg.usage.output_tokens,
      rawLength:    rawText.length,
    });

    // ── Layer 6: Parse response ────────────────────────────────────────────
    const parsed = parseAgentResponse(rawText);

    pipelineLog("RESPONSE_PARSED", {
      agentId,
      hasAnswer:    Boolean(parsed.answer),
      answerLength: parsed.answer?.length ?? 0,
      keyPoints:    parsed.keyPoints?.length ?? 0,
      actions:      parsed.actions?.length ?? 0,
      confidence:   parsed.confidence,
    });

    return parsed;

  } catch (err: unknown) {
    const isRetryable =
      err instanceof Anthropic.APIError &&
      (err.status === 529 || err.status === 503 || err.status === 429);

    pipelineLog("CLAUDE_ERROR", {
      agentId,
      attempt,
      error:      (err as Error).message,
      retryable:  isRetryable,
    });

    if (isRetryable && attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt);
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

    // ── Layer 0: Request received ─────────────────────────────────────────
    pipelineLog("REQUEST_RECEIVED", {
      agentId,
      question,
      questionLength: question?.length ?? 0,
      historyTurns:   history.length,
    });

    if (!agentId || !question?.trim()) {
      return NextResponse.json(
        { error: "agentId and question are required" },
        { status: 400 }
      );
    }

    const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

    if (hasApiKey) {
      // ── Real Claude path ────────────────────────────────────────────────
      try {
        const response = await callClaude(agentId, question, history);
        pipelineLog("REQUEST_COMPLETE", {
          agentId,
          mode:    "live",
          elapsedMs: Date.now() - startMs,
        });
        return NextResponse.json({ ...response, routeKey: "claude", mode: "live" });

      } catch (claudeErr: unknown) {
        pipelineLog("CLAUDE_FALLBACK_TO_MOCK", {
          agentId,
          error: (claudeErr as Error).message,
        });
        // Fall through to mock
      }
    }

    // ── Mock fallback path ───────────────────────────────────────────────
    await sleep(400 + Math.random() * 800);
    const mockResponse = dispatchAgent(agentId, question, history);
    pipelineLog("REQUEST_COMPLETE", {
      agentId,
      mode:      "mock",
      routeKey:  mockResponse.routeKey,
      elapsedMs: Date.now() - startMs,
    });
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
