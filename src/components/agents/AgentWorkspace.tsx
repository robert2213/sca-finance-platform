"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentId } from "@/types/finance";
import { getAgentResponse, type ConversationTurn, type AgentResponseWithRoute } from "@/agents/mockResponses";
import { getAgent } from "@/agents/registry";
import { useConversation, type ChatMessage } from "@/hooks/useConversation";
import ContextPanel from "./ContextPanel";
import { TypingDots } from "@/components/ui/Spinner";
import clsx from "clsx";

// ─── Starter prompt packs per agent ──────────────────────────────────────────
// These are UI-only prompts — no business logic changes.

const STARTER_PACKS: Partial<Record<AgentId, Array<{ category: string; prompts: string[] }>>> = {
  "cfo": [
    { category: "Performance", prompts: ["Give me the executive financial summary for May 2026", "How do we explain the budget variance to the board?"] },
    { category: "Risk",        prompts: ["What are the top 3 financial risks I need to act on?", "Which areas need immediate executive attention?"] },
    { category: "Strategy",    prompts: ["Where are our biggest cost optimization opportunities?", "What should the CFO communicate to the CEO this week?"] },
  ],
  "fpa": [
    { category: "Variance",    prompts: ["What are the main drivers of our YTD budget variance?", "Which cost centers are most over budget and why?"] },
    { category: "Forecast",    prompts: ["How is our full-year forecast tracking vs. the approved plan?", "Walk me through the month-over-month spend trend Jan–May"] },
    { category: "Deep Dive",   prompts: ["Break down the Cloud Engineering variance by cost center", "Compare May actuals to the prior month"] },
  ],
  "procurement": [
    { category: "Contracts",   prompts: ["Which contracts are expiring in the next 90 days?", "What is our total committed vendor spend for the year?"] },
    { category: "Risk",        prompts: ["Where do we have vendor concentration risk?", "Which vendors should we prioritize for renewal negotiations?"] },
    { category: "Savings",     prompts: ["Where can we negotiate better terms at renewal?", "Which vendor relationships should we consolidate?"] },
  ],
  "external-labor": [
    { category: "Budget",      prompts: ["Which contractors are over their approved SOW budget?", "What is our YTD contractor spend vs. budget by BU?"] },
    { category: "Compliance",  prompts: ["Which contractor engagements need SOW amendments?", "How much of our external labor over-spend can be recovered?"] },
    { category: "Planning",    prompts: ["Which contractor engagements are ending in 60 days?", "Where should we convert contractors to FTE?"] },
  ],
  "headcount": [
    { category: "Fill Rate",   prompts: ["How many open requisitions do we have and where?", "What is our headcount fill rate vs. approved plan?"] },
    { category: "Cost Impact", prompts: ["How much salary budget are open reqs saving us?", "What is the contractor cost premium from HC gaps?"] },
    { category: "Pipeline",    prompts: ["Which business units have the largest HC gaps?", "Which open roles are creating the most operational risk?"] },
  ],
  "cio": [
    { category: "Briefing",    prompts: ["Prepare a 5-point IT financial briefing for the executive team", "Give me CIO-ready talking points on cloud spend and ROI"] },
    { category: "Narrative",   prompts: ["How do I explain the IT budget variance to the CEO?", "What is the full IT investment story for FY2026?"] },
    { category: "Cloud",       prompts: ["Summarize cloud spend trends and optimization opportunities", "What should the CIO say about the FinOps program?"] },
  ],
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  return text.split("\n\n").map((block, bi) => {
    const lines = block.split("\n");

    // Table detection
    if (lines.some(l => l.trim().startsWith("|"))) {
      const tableLines = lines.filter(l => l.trim().startsWith("|"));
      const headers    = tableLines[0]?.split("|").filter(Boolean).map(h => h.trim()) ?? [];
      const dataLines  = tableLines.slice(2);
      return (
        <div key={bi} className={clsx("overflow-x-auto", bi > 0 && "mt-4")}>
          <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-nexora-50">
              <tr>{headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-bold text-nexora-700 border-b border-slate-200">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {dataLines.map((row, ri) => {
                const cells = row.split("|").filter(Boolean).map(c => c.trim());
                return (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-slate-700 border-b border-slate-100">{cell}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    return (
      <div key={bi} className={clsx(bi > 0 && "mt-3")}>
        {lines.map((line, li) => {
          // Section heading: ## Title
          const h2Match = line.match(/^##\s+(.+)/);
          if (h2Match) return (
            <p key={li} className={clsx("text-[11px] font-black text-slate-700 uppercase tracking-wide", li > 0 ? "mt-4" : "")}>
              {h2Match[1]}
            </p>
          );

          const parts = line.split(/\*\*(.*?)\*\*/g);
          const rendered = parts.map((part, pi) =>
            pi % 2 === 1
              ? <strong key={pi} className="font-semibold text-slate-800">{part}</strong>
              : <span key={pi}>{part}</span>
          );

          // Bullet
          if (line.match(/^[-•]\s/)) return (
            <div key={li} className="flex items-start gap-2 mt-1.5">
              <span className="text-nexora-400 mt-0.5 shrink-0">▸</span>
              <span className="flex-1 text-[12px] leading-relaxed text-slate-600">{rendered.slice(1)}</span>
            </div>
          );

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s/);
          if (numMatch) return (
            <div key={li} className="flex items-start gap-2 mt-2">
              <span className="w-4 h-4 rounded-full bg-nexora-100 text-nexora-700 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1 text-[12px] leading-relaxed text-slate-700">
                {parts.map((p, i) => i % 2 === 1
                  ? <strong key={i} className="font-semibold">{p}</strong>
                  : <span key={i}>{p.replace(/^\d+\.\s/, "")}</span>
                )}
              </span>
            </div>
          );

          if (!line.trim()) return <div key={li} className="h-1" />;

          return (
            <p key={li} className={clsx("text-[12px] leading-relaxed text-slate-700", li > 0 && "mt-1")}>
              {rendered}
            </p>
          );
        })}
      </div>
    );
  });
}

// ─── Suggestion chip ──────────────────────────────────────────────────────────

function SuggestionChip({
  text, onClick, disabled,
}: { text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-left text-[11px] bg-white hover:bg-nexora-50 hover:border-nexora-200 text-slate-600 hover:text-nexora-700 border border-slate-200 rounded-xl px-3 py-2 transition-all duration-150 leading-snug disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
    >
      {text}
    </button>
  );
}

// ─── User bubble ─────────────────────────────────────────────────────────────

function UserBubble({ msg }: { msg: ChatMessage }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] bg-nexora-600 text-white rounded-2xl rounded-tr-sm px-4 py-3 overflow-hidden">
        <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
        <p className="text-[9px] text-nexora-300 mt-1.5 text-right font-medium">
          {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

// ─── Agent bubble ─────────────────────────────────────────────────────────────

function AgentBubble({ msg, avatar, streaming = false, streamText = "" }: {
  msg?: ChatMessage;
  avatar: string;
  streaming?: boolean;
  streamText?: string;
}) {
  const content   = streaming ? streamText : (msg?.content ?? "");
  const keyPoints = !streaming ? (msg?.keyPoints ?? []) : [];
  const actions   = !streaming ? (msg?.actions   ?? []) : [];

  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-xl bg-nexora-100 border border-nexora-200 flex items-center justify-center text-base shrink-0 mt-0.5">
        {avatar}
      </div>

      <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm overflow-hidden">
        {/* Main response body */}
        <div className="px-4 pt-4 pb-3 overflow-hidden">
          <div className="text-[12px] text-slate-700 leading-relaxed break-words">
            {renderMarkdown(content)}
            {streaming && (
              <span className="inline-block w-0.5 h-3.5 bg-nexora-500 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        </div>

        {/* Key takeaways */}
        {keyPoints.length > 0 && (
          <div className="mx-4 mb-3 rounded-xl bg-nexora-50 border border-nexora-100 px-3 py-3">
            <p className="label mb-2.5">Key Takeaways</p>
            <div className="space-y-2">
              {keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-nexora-400 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-nexora-700 leading-snug">{kp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended actions */}
        {actions.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
            <p className="label mb-2.5">Recommended Actions</p>
            <div className="space-y-2">
              {actions.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className={clsx(
                    "text-[9px] font-black px-1.5 py-0.5 rounded-md border shrink-0 mt-0.5",
                    a.priority === "High"   ? "bg-red-50 text-red-700 border-red-200" :
                    a.priority === "Medium" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                             "bg-slate-100 text-slate-600 border-slate-200"
                  )}>
                    {a.priority[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-700 leading-snug">{a.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {a.owner}{a.dueDate ? ` · Due ${a.dueDate}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamp */}
        {!streaming && msg && (
          <div className="px-4 py-2 border-t border-slate-50">
            <p className="text-[9px] text-slate-300 font-medium">
              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main workspace ───────────────────────────────────────────────────────────

interface AgentWorkspaceProps {
  agentId:         AgentId;
  initialQuestion?: string;
}

export default function AgentWorkspace({ agentId, initialQuestion }: AgentWorkspaceProps) {
  const agent = getAgent(agentId);
  const { messages, setMessages, history, setHistory, clearConversation } = useConversation(agentId);

  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [streamText,  setStreamText]  = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showContext, setShowContext] = useState(true);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef   = useRef<HTMLTextAreaElement>(null);
  const initFired     = useRef(false);

  // Direct scrollTop manipulation — never touches the page scroll container.
  // "instant" for streaming/loading; "smooth" only when a full message lands.
  const snapToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const smoothScrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  // Smooth scroll when a complete message arrives (messages array changes)
  useEffect(() => { smoothScrollToBottom(); }, [messages, smoothScrollToBottom]);
  // Snap instantly when the thinking indicator appears
  useEffect(() => { if (loading) snapToBottom(); }, [loading, snapToBottom]);

  // Fire initial question from URL param (only if no existing conversation)
  useEffect(() => {
    if (initialQuestion && !initFired.current && messages.length === 0) {
      initFired.current = true;
      void sendMessage(initialQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  // Auto-resize textarea
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  // ── Streaming ──────────────────────────────────────────────────────────────
  async function streamResponse(fullText: string): Promise<void> {
    setIsStreaming(true);
    setStreamText("");
    const chars = fullText.split("");
    let current = "";
    for (let i = 0; i < chars.length; i++) {
      current += chars[i];
      setStreamText(current);
      const c = chars[i];
      const delay = c === "\n" ? 6 : c === "." || c === "!" || c === "?" ? 20 : c === "," ? 10 : c === "*" ? 1 : 2;
      await new Promise(r => setTimeout(r, delay));
      // Snap (not smooth) during streaming so we never queue competing animations
      if (i % 80 === 0) snapToBottom();
    }
    setIsStreaming(false);
    setStreamText("");
  }

  // ── Send ───────────────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || loading || isStreaming) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const updatedHistory: ConversationTurn[] = [
      ...history,
      { role: "user", content: text },
    ];

    let response: AgentResponseWithRoute;

    try {
      // Call the server-side API route — uses Claude when ANTHROPIC_API_KEY is set,
      // falls back to mock keyword routing automatically.
      const res = await fetch("/api/agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ agentId, question: text, history: updatedHistory }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      response = await res.json() as AgentResponseWithRoute;

    } catch (err) {
      console.error("[AgentWorkspace] API call failed, using local mock:", err);
      // Last-resort client-side fallback (should not normally be reached)
      response = getAgentResponse(agentId, text, updatedHistory);
    }

    setLoading(false);

    await streamResponse(response.answer);

    const routeKey = response.routeKey ?? "unknown";
    const agentMsg: ChatMessage = {
      role:      "agent",
      content:   response.answer,
      keyPoints: response.keyPoints,
      actions:   response.actions,
      routeKey,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, agentMsg]);
    setHistory([
      ...updatedHistory,
      { role: "agent", content: response.answer, routeKey },
    ]);

    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  if (!agent) return null;

  const packs = STARTER_PACKS[agentId] ?? [];
  const turnCount = messages.filter(m => m.role === "user").length;

  return (
    <div className="flex h-full min-h-0">

      {/* ── Chat column ──────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col min-h-0 bg-slate-50">

        {/* Agent header */}
        <div className="shrink-0 px-6 py-3 border-b border-slate-200 bg-white flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nexora-100 to-nexora-200 border border-nexora-200 flex items-center justify-center text-xl shadow-sm shrink-0">
            {agent.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">{agent.name}</p>
            <p className="text-[10px] text-slate-400 truncate">{agent.title}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <div className={clsx(
                "w-2 h-2 rounded-full",
                isStreaming ? "bg-nexora-500 animate-pulse" :
                loading     ? "bg-amber-400 animate-pulse" :
                              "bg-emerald-500"
              )} />
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                {isStreaming ? "Typing…" : loading ? "Thinking…" : "Ready"}
              </span>
            </div>
            {/* Turn count */}
            {turnCount > 0 && (
              <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline">
                {turnCount} turn{turnCount !== 1 ? "s" : ""}
              </span>
            )}
            {/* Context toggle on smaller screens */}
            <button
              onClick={() => setShowContext(v => !v)}
              title="Toggle context panel"
              className={clsx(
                "p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors xl:hidden",
                showContext && "bg-nexora-50 text-nexora-600"
              )}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            {/* Clear button */}
            {turnCount > 0 && (
              <button
                onClick={clearConversation}
                className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
                title="Clear conversation"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* ── Message thread ──────────────────────────────────────────────── */}
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 py-6 space-y-6"
        >

          {/* Empty state — prompt starters */}
          {messages.length === 0 && !loading && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-nexora-50 to-nexora-100 border border-nexora-200 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  {agent.avatar}
                </div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{agent.name}</h2>
                <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                  {agent.description}
                </p>
              </div>

              {/* Starter prompt packs */}
              {packs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {packs.map((pack) => (
                    <div key={pack.category} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          {pack.category}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        {pack.prompts.map((q, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(q)}
                            disabled={loading}
                            className="w-full text-left text-[11px] text-slate-600 hover:text-nexora-700 hover:bg-nexora-50 rounded-xl px-3 py-2 transition-all duration-150 leading-snug"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Fallback: plain suggestion chips */}
              {packs.length === 0 && (
                <div className="space-y-2">
                  <p className="label text-center mb-3">Finance prompts</p>
                  {agent.suggestedQuestions.map((q, i) => (
                    <SuggestionChip key={i} text={q} onClick={() => sendMessage(q)} disabled={loading} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          {messages.map((msg, i) => (
            <div key={i} className="animate-chat max-w-3xl mx-auto w-full">
              {msg.role === "user"
                ? <UserBubble msg={msg} />
                : <AgentBubble msg={msg} avatar={agent.avatar} />
              }
            </div>
          ))}

          {/* Thinking indicator */}
          {loading && !isStreaming && (
            <div className="animate-chat max-w-3xl mx-auto w-full">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-nexora-100 border border-nexora-200 flex items-center justify-center text-base shrink-0">
                  {agent.avatar}
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <TypingDots />
                </div>
              </div>
            </div>
          )}

          {/* Streaming bubble */}
          {isStreaming && streamText && (
            <div className="animate-chat max-w-3xl mx-auto w-full">
              <AgentBubble avatar={agent.avatar} streaming streamText={streamText} />
            </div>
          )}

          {/* Spacer so the last message never sits flush against the input bar */}
          <div className="h-4 shrink-0" />
        </div>

        {/* Follow-up chips (mid-conversation) */}
        {messages.length > 0 && messages.length < 8 && !loading && !isStreaming && (
          <div className="shrink-0 px-4 sm:px-8 py-2 border-t border-slate-100 bg-white/80 flex gap-2 overflow-x-auto">
            {agent.suggestedQuestions.slice(1, 4).map((q, i) => (
              <SuggestionChip key={i} text={q} onClick={() => sendMessage(q)} disabled={loading} />
            ))}
          </div>
        )}

        {/* ── Input area ───────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-200 bg-white px-4 sm:px-8 py-4">
          <form
            onSubmit={e => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2 items-end"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => { setInput(e.target.value); autoResize(); }}
                onKeyDown={e => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={`Ask ${agent.name}…  (Enter to send · Shift+Enter for new line)`}
                disabled={loading || isStreaming}
                rows={1}
                className="input w-full resize-none text-sm leading-relaxed"
                style={{ minHeight: "42px", maxHeight: "120px" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || isStreaming || !input.trim()}
              className="btn-primary shrink-0 flex items-center gap-1.5 self-end"
            >
              <span className="hidden sm:inline text-sm">Send</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
          <p className="text-[9px] text-slate-400 mt-1.5 flex items-center justify-between">
            <span>
              {turnCount > 0
                ? `${turnCount} turn${turnCount !== 1 ? "s" : ""} · conversation saved locally`
                : "Conversation will be saved locally in your browser"}
            </span>
            {turnCount > 0 && (
              <button onClick={clearConversation} className="hover:text-slate-600 transition-colors">
                Clear history
              </button>
            )}
          </p>
        </div>
      </div>

      {/* ── Context panel ────────────────────────────────────────────────── */}
      <div className={clsx(
        "shrink-0 w-72 flex-col min-h-0 transition-all duration-300",
        // Always visible on xl, toggleable on smaller screens
        showContext ? "flex" : "hidden",
        "xl:flex"
      )}>
        <ContextPanel messages={messages} agentName={agent.name} />
      </div>

    </div>
  );
}
