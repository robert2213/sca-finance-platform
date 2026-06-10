import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { dispatchAgent } from "@/agents/agentEngine";
import { buildSnapshotFromDB } from "@/agents/dataContext";
import defaultConfig from "@/config/client.config";
import { buildSystemPrompt, classifyIntent, extractTemporalIntent } from "@/lib/ai/system-prompt.builder";
import { parseAgentResponse } from "@/lib/ai/response.parser";
import {
  buildAmbiguityResponse,
  TIME_SENSITIVE_INTENTS,
} from "@/lib/ai/conversation-context";
import { routeResponseMode } from "@/lib/ai/response-mode-router";
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

  // ── Layer 1a: Intent classification ───────────────────────────────────────
  const intent  = classifyIntent(question);

  // ── Layer 1b: Temporal intent extraction ──────────────────────────────────
  const temporal = extractTemporalIntent(question);

  // ── Layer 1c: Response Mode Router (Step 7 logging) ───────────────────────
  const modeResult           = routeResponseMode(question);
  const responseMode         = modeResult.mode;
  const fullYearDataInjected =
    responseMode === 'FULL_YEAR_FORECAST' ||
    (responseMode === 'GENERAL_QA' && intent.intent === 'FORECAST_ANALYSIS');

  // ── Phase 2: [INTENT ROUTER] structured log ───────────────────────────────
  const horizonApplied     = temporal.type !== "unknown";
  const fallbackTriggered  = intent.intent === "GENERAL_FINANCIAL_QA";
  const ambiguityDetected  =
    TIME_SENSITIVE_INTENTS.includes(intent.intent) && temporal.confidence < 0.6;

  // Step 7: Full structured log with all required fields
  console.log("[INTENT ROUTER]", {
    rawQuestion:          question,
    detectedIntent:       intent.intent,
    temporalIntent: {
      type:       temporal.type,
      specific:   temporal.specific,
      startMonth: temporal.startMonth,
      endMonth:   temporal.endMonth,
      confidence: temporal.confidence,
      rawMatch:   temporal.rawMatch,
    },
    responseMode,
    templateUsed:         null,   // live path: Claude generates directly, no template
    fallbackUsed:         fallbackTriggered,
    dataSectionsInjected: intent.dataSections,
    fullYearDataInjected,
    agentVoice:           agentId,
    horizonApplied,
    ambiguityDetected,
    timestamp: new Date().toISOString(),
  });

  // WARNING: this combination should never occur on the live path
  // Cast to string to avoid TS narrowing false-positive (the union types are mutually exclusive
  // by design, but we keep this guard as a belt-and-suspenders runtime check)
  if (fullYearDataInjected && (modeResult.mode as string) === 'MONTHLY_FORECAST') {
    console.warn('[INTENT ROUTER] WARNING: fullYearDataInjected=true with responseMode=MONTHLY_FORECAST', {
      agentId, question, responseMode, intent: intent.intent, temporalType: temporal.type,
    });
  }

  pipelineLog("INTENT_CLASSIFIED", {
    agentId,
    question,
    intent:               intent.intent,
    intentConfidence:     intent.confidence,
    dataSections:         intent.dataSections,
    temporalType:         temporal.type,
    temporalSpecific:     temporal.specific,
    temporalConfidence:   temporal.confidence,
    responseMode,
    fullYearDataInjected,
    horizonApplied,
    ambiguityDetected,
  });

  // ── Phase 4: Ambiguity detection — low temporal confidence on time-sensitive intents ──
  if (ambiguityDetected) {
    pipelineLog("AMBIGUITY_TRIGGERED", {
      agentId,
      intent:           intent.intent,
      temporalType:     temporal.type,
      temporalConfidence: temporal.confidence,
      reason: "Temporal scope unclear for time-sensitive intent — asking clarifying question",
    });

    // Return a clarifying question without calling Claude.
    // Cast through unknown: AmbiguityResponse has extra fields (pendingClarification etc.)
    // that don't exist on AgentResponse, so a direct cast would fail strict mode.
    return buildAmbiguityResponse(question, intent.intent, temporal) as unknown as ReturnType<typeof parseAgentResponse>;
  }

  // ── Layer 2: System prompt construction ───────────────────────────────────
  // Sprint 2 Phase 1: use DB-backed snapshot for live Claude path.
  // clientId sourced from defaultConfig until Sprint 3 Clerk auth lands.
  const snapshot     = await buildSnapshotFromDB(defaultConfig.clientId);
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
      // ── Guard pre-check: structured guard responses take priority over Claude ──
      const guardCheck = dispatchAgent(agentId, question, history);
      if (guardCheck.routeKey.endsWith('-guard')) {
        pipelineLog("GUARD_RESPONSE_BYPASSED_CLAUDE", {
          agentId,
          routeKey:  guardCheck.routeKey,
          question,
          elapsedMs: Date.now() - startMs,
        });
        return NextResponse.json({ ...guardCheck, mode: "live-guard" });
      }

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

    // Step 7: WARNING if full-year data injected for a monthly question
    if (mockResponse.fullYearDataInjected && mockResponse.responseMode === 'MONTHLY_FORECAST') {
      console.warn('[PIPELINE] WARNING: fullYearDataInjected=true with responseMode=MONTHLY_FORECAST on mock path', {
        agentId, question, routeKey: mockResponse.routeKey,
      });
    }

    pipelineLog("REQUEST_COMPLETE", {
      agentId,
      mode:                 "mock",
      routeKey:             mockResponse.routeKey,
      responseMode:         mockResponse.responseMode,
      templateUsed:         mockResponse.templateUsed,
      fallbackUsed:         mockResponse.fallbackUsed,
      fullYearDataInjected: mockResponse.fullYearDataInjected,
      agentVoice:           agentId,
      elapsedMs:            Date.now() - startMs,
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
