"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentId } from "@/types/finance";
import { getAgentResponse, type ConversationTurn, type AgentResponseWithRoute } from "@/agents/mockResponses";
import { getAgent } from "@/agents/registry";
import { TypingDots } from "@/components/ui/Spinner";
import clsx from "clsx";

// ─── Message types ────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "agent";
  content: string;
  keyPoints?: string[];
  actions?: Array<{ id: string; priority: string; title: string; description: string; owner: string; dueDate?: string }>;
  routeKey?: string;
  timestamp: Date;
}

// ─── Markdown renderer ────────────────────────────────────────────────────────

function renderMarkdown(text: string) {
  return text.split("\n\n").map((block, bi) => {
    const lines = block.split("\n");

    // Table detection
    if (lines.some(l => l.includes("|") && l.trim().startsWith("|"))) {
      const tableLines = lines.filter(l => l.trim().startsWith("|"));
      const headerLine = tableLines[0];
      const dataLines  = tableLines.slice(2); // skip separator row
      const headers    = headerLine.split("|").filter(Boolean).map(h => h.trim());
      return (
        <div key={bi} className={bi > 0 ? "mt-3 overflow-x-auto" : "overflow-x-auto"}>
          <table className="w-full text-[10px] border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-nexora-50">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-2 py-1.5 text-left font-bold text-nexora-700 border-b border-slate-200">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataLines.map((row, ri) => {
                const cells = row.split("|").filter(Boolean).map(c => c.trim());
                return (
                  <tr key={ri} className={ri % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1.5 text-slate-700 border-b border-slate-100">{cell}</td>
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
      <div key={bi} className={bi > 0 ? "mt-3" : ""}>
        {lines.map((line, li) => {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          const rendered = parts.map((part, pi) =>
            pi % 2 === 1
              ? <strong key={pi} className="font-bold text-slate-800">{part}</strong>
              : <span key={pi}>{part}</span>
          );

          // Bullet
          if (line.match(/^[-•]\s/)) {
            return (
              <div key={li} className="flex items-start gap-1.5 mt-1">
                <span className="text-nexora-400 mt-0.5 shrink-0 text-[10px]">▸</span>
                <span className="flex-1 text-[11px] leading-relaxed text-slate-600">{rendered.slice(1)}</span>
              </div>
            );
          }

          // Numbered list
          const numMatch = line.match(/^(\d+)\.\s/);
          if (numMatch) {
            return (
              <div key={li} className="flex items-start gap-2 mt-2">
                <span className="w-4 h-4 rounded-full bg-nexora-100 text-nexora-700 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">
                  {numMatch[1]}
                </span>
                <span className="flex-1 text-[11px] leading-relaxed text-slate-700">
                  {parts.map((p, i) => i % 2 === 1
                    ? <strong key={i} className="font-bold">{p}</strong>
                    : <span key={i}>{p.replace(/^\d+\.\s/, "")}</span>
                  )}
                </span>
              </div>
            );
          }

          // Empty line
          if (!line.trim()) return <div key={li} className="h-1" />;

          return (
            <p key={li} className={clsx("text-[11px] leading-relaxed", li > 0 ? "mt-1" : "")}>
              {rendered}
            </p>
          );
        })}
      </div>
    );
  });
}

// ─── Suggestion chip ──────────────────────────────────────────────────────────

function SuggestionChip({ text, onClick, disabled }: { text: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="text-left text-[11px] bg-slate-100 hover:bg-nexora-50 hover:border-nexora-200 text-slate-600 hover:text-nexora-700 border border-slate-200 rounded-xl px-3 py-2 transition-all duration-150 leading-snug disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {text}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AgentChatPanelProps {
  agentId: AgentId;
  initialQuestion?: string;
  height?: string;
}

export default function AgentChatPanel({
  agentId,
  initialQuestion,
  height = "560px",
}: AgentChatPanelProps) {
  const agent = getAgent(agentId);
  const [messages, setMessages]     = useState<ChatMessage[]>([]);
  const [history, setHistory]       = useState<ConversationTurn[]>([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [streamText, setStreamText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef      = useRef<HTMLInputElement>(null);
  const initFired     = useRef(false);

  // Direct scrollTop — never triggers scrolling in parent page containers.
  // Instant during streaming to avoid queued-animation stall.
  const snapToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const smoothScrollToBottom = useCallback(() => {
    const el = scrollAreaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, []);

  // Smooth scroll only when a full message is committed
  useEffect(() => { smoothScrollToBottom(); }, [messages, smoothScrollToBottom]);
  // Instant snap when loading indicator appears
  useEffect(() => { if (loading) snapToBottom(); }, [loading, snapToBottom]);

  useEffect(() => {
    if (initialQuestion && !initFired.current) {
      initFired.current = true;
      void sendMessage(initialQuestion);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Streaming text effect ──────────────────────────────────────────────────
  async function streamResponse(fullText: string): Promise<void> {
    setIsStreaming(true);
    setStreamText("");

    // Stream character by character with variable speed
    const chars = fullText.split("");
    let current = "";

    for (let i = 0; i < chars.length; i++) {
      current += chars[i];
      setStreamText(current);

      // Speed: fast for normal chars, pause at sentence boundaries
      const char = chars[i];
      const delay =
        char === "\n" ? 8 :
        char === "." || char === "!" || char === "?" ? 25 :
        char === "," ? 12 :
        char === "*" ? 2 :  // markdown markers fly by
        2;

      await new Promise(r => setTimeout(r, delay));
      if (i % 80 === 0) snapToBottom();
    }

    setIsStreaming(false);
    setStreamText("");
  }

  // ── Send message ──────────────────────────────────────────────────────────
  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Update conversation history
    const updatedHistory: ConversationTurn[] = [
      ...history,
      { role: "user", content: text },
    ];

    // Minimum thinking delay (simulates AI processing)
    const thinkDelay = 700 + Math.random() * 900;
    await new Promise(r => setTimeout(r, thinkDelay));

    // Get response from agent engine (with history context)
    const response: AgentResponseWithRoute = getAgentResponse(agentId, text, updatedHistory);
    setLoading(false);

    // Stream the response text
    await streamResponse(response.answer);

    // Commit the full message
    const agentMsg: ChatMessage = {
      role:      "agent",
      content:   response.answer,
      keyPoints: response.keyPoints,
      actions:   response.actions,
      routeKey:  response.routeKey,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, agentMsg]);

    // Update history for future turns
    setHistory([
      ...updatedHistory,
      { role: "agent", content: response.answer, routeKey: response.routeKey },
    ]);

    // Refocus input
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  if (!agent) return null;

  return (
    <div className="card flex flex-col overflow-hidden" style={{ height }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-5 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/60">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nexora-100 to-nexora-200 flex items-center justify-center text-lg shadow-sm shrink-0">
          {agent.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 truncate">{agent.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{agent.title}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {history.length > 0 && (
            <span className="text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
              {Math.ceil(history.length / 2)} turns
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className={clsx("w-2 h-2 rounded-full", isStreaming ? "bg-nexora-500 animate-pulse" : loading ? "bg-amber-400 animate-pulse" : "bg-emerald-500")} />
            <span className="text-[10px] text-slate-500 font-medium">
              {isStreaming ? "Typing…" : loading ? "Thinking…" : "Ready"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────── */}
      <div ref={scrollAreaRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">

        {/* Empty state */}
        {messages.length === 0 && !loading && (
          <div className="flex flex-col py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-nexora-50 border border-nexora-100 flex items-center justify-center text-2xl shadow-sm shrink-0">
                {agent.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{agent.name}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">{agent.description}</p>
              </div>
            </div>
            <p className="label mb-2.5">Finance prompts — click to ask</p>
            <div className="grid grid-cols-1 gap-1.5">
              {agent.suggestedQuestions.map((q, i) => (
                <SuggestionChip key={i} text={q} onClick={() => sendMessage(q)} disabled={loading} />
              ))}
            </div>
          </div>
        )}

        {/* Thread */}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={clsx(
              "animate-chat",
              msg.role === "user" ? "flex justify-end" : "flex justify-start items-start gap-2"
            )}
          >
            {msg.role === "agent" && (
              <div className="w-7 h-7 rounded-lg bg-nexora-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
                {agent.avatar}
              </div>
            )}

            <div className={clsx(
              "max-w-[90%] rounded-2xl overflow-hidden",
              msg.role === "user"
                ? "bg-nexora-600 text-white rounded-tr-sm px-4 py-3"
                : "bg-white border border-slate-200 rounded-tl-sm shadow-sm"
            )}>
              {msg.role === "user" ? (
                <>
                  <p className="text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className="text-[9px] text-nexora-300 mt-1.5 text-right font-medium">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </>
              ) : (
                <>
                  {/* Response body */}
                  <div className="px-4 pt-3 pb-2 overflow-hidden">
                    <div className="text-[11px] text-slate-700 leading-relaxed break-words">
                      {renderMarkdown(msg.content)}
                    </div>
                  </div>

                  {/* Key points strip */}
                  {msg.keyPoints && msg.keyPoints.length > 0 && (
                    <div className="mx-4 mb-3 rounded-xl bg-nexora-50 border border-nexora-100 px-3 py-2.5">
                      <p className="label mb-2">Key Takeaways</p>
                      <div className="space-y-1.5">
                        {msg.keyPoints.map((kp, ki) => (
                          <div key={ki} className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-nexora-400 mt-1.5 shrink-0" />
                            <p className="text-[10px] text-nexora-700 leading-snug">{kp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions strip */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="border-t border-slate-100 px-4 py-2.5 bg-slate-50/60">
                      <p className="label mb-2">Recommended Actions</p>
                      <div className="space-y-1.5">
                        {msg.actions.slice(0, 3).map((a, ai) => (
                          <div key={ai} className="flex items-start gap-2">
                            <span className={clsx(
                              "text-[9px] font-black px-1.5 py-0.5 rounded-md border shrink-0 mt-0.5",
                              a.priority === "High"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : a.priority === "Medium"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            )}>
                              {a.priority.toUpperCase()[0]}
                            </span>
                            <div>
                              <p className="text-[10px] font-semibold text-slate-700">{a.title}</p>
                              <p className="text-[9px] text-slate-400">{a.owner}{a.dueDate ? ` · Due ${a.dueDate}` : ""}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="px-4 pb-2.5 flex items-center justify-between">
                    <p className="text-[9px] text-slate-300 font-medium">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    {msg.routeKey && (
                      <span className="text-[9px] text-slate-300 font-mono">
                        route:{msg.routeKey}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Thinking indicator */}
        {loading && !isStreaming && (
          <div className="flex items-start gap-2 animate-chat">
            <div className="w-7 h-7 rounded-lg bg-nexora-100 flex items-center justify-center text-sm shrink-0">
              {agent.avatar}
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <TypingDots />
            </div>
          </div>
        )}

        {/* Streaming indicator */}
        {isStreaming && streamText && (
          <div className="flex items-start gap-2 animate-chat">
            <div className="w-7 h-7 rounded-lg bg-nexora-100 flex items-center justify-center text-sm shrink-0 mt-0.5">
              {agent.avatar}
            </div>
            <div className="max-w-[90%] bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm px-4 py-3 overflow-hidden">
              <div className="text-[11px] text-slate-700 leading-relaxed break-words">
                {renderMarkdown(streamText)}
              </div>
              <span className="inline-block w-0.5 h-3 bg-nexora-500 animate-pulse ml-0.5 align-middle" />
            </div>
          </div>
        )}

      </div>

      {/* ── Suggested follow-ups (after first message) ──────────────────── */}
      {messages.length > 0 && messages.length < 4 && !loading && (
        <div className="shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto">
          {agent.suggestedQuestions.slice(1, 3).map((q, i) => (
            <SuggestionChip
              key={i}
              text={q}
              onClick={() => sendMessage(q)}
              disabled={loading}
            />
          ))}
        </div>
      )}

      {/* ── Input ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-slate-100 px-4 py-3 bg-slate-50/60">
        <form onSubmit={e => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask ${agent.name}…`}
            disabled={loading || isStreaming}
            className="input flex-1 text-xs"
          />
          <button
            type="submit"
            disabled={loading || isStreaming || !input.trim()}
            className="btn-primary shrink-0 flex items-center gap-1.5"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
        {history.length > 0 && (
          <div className="flex items-center justify-between mt-2">
            <p className="text-[9px] text-slate-400">
              Context-aware · {Math.ceil(history.length / 2)} turn{Math.ceil(history.length / 2) > 1 ? "s" : ""} in memory
            </p>
            <button
              onClick={() => { setMessages([]); setHistory([]); }}
              className="text-[9px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              Clear chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
