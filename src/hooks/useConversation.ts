"use client";

import { useState, useEffect, useRef } from "react";
import type { AgentId } from "@/types/finance";
import type { ConversationTurn } from "@/agents/mockResponses";

// ─── Shared message type ───────────────────────────────────────────────────────

export interface ActionItem {
  id: string;
  priority: string;
  title: string;
  description: string;
  owner: string;
  dueDate?: string;
}

export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  keyPoints?: string[];
  actions?: ActionItem[];
  routeKey?: string;
  timestamp: Date;
}

// ─── Storage helpers ───────────────────────────────────────────────────────────

const PREFIX = "nexora_conv_v1_";

interface StoredMessage extends Omit<ChatMessage, "timestamp"> {
  timestamp: string; // ISO date string
}
interface StoredConversation {
  messages: StoredMessage[];
  history:  ConversationTurn[];
}

function toStored(msgs: ChatMessage[]): StoredMessage[] {
  return msgs.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
}
function fromStored(stored: StoredMessage[]): ChatMessage[] {
  return stored.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useConversation(agentId: AgentId) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history,  setHistory]  = useState<ConversationTurn[]>([]);
  const hydratedRef = useRef(false);

  const key = `${PREFIX}${agentId}`;

  // Hydrate from localStorage on first mount (client-only)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const data: StoredConversation = JSON.parse(raw);
        setMessages(fromStored(data.messages ?? []));
        setHistory(data.history ?? []);
      }
    } catch {
      // Corrupted or unavailable — start fresh
    }
  }, [key]);

  // Persist on every change (skip the initial empty state)
  useEffect(() => {
    if (!hydratedRef.current) return;
    if (messages.length === 0 && history.length === 0) return;
    try {
      const data: StoredConversation = {
        messages: toStored(messages),
        history,
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Quota exceeded or private browsing — no-op
    }
  }, [messages, history, key]);

  const clearConversation = () => {
    setMessages([]);
    setHistory([]);
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  };

  return { messages, setMessages, history, setHistory, clearConversation };
}

// ─── Lightweight preview for agent cards (no React state) ─────────────────────

export interface ConversationPreview {
  lastQuestion: string;
  turnCount:    number;
}

export function getConversationPreview(agentId: AgentId): ConversationPreview | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${PREFIX}${agentId}`);
    if (!raw) return null;
    const data: StoredConversation = JSON.parse(raw);
    const userMsgs = (data.messages ?? []).filter(m => m.role === "user");
    const last = userMsgs[userMsgs.length - 1];
    if (!last) return null;
    return {
      lastQuestion: last.content,
      turnCount:    userMsgs.length,
    };
  } catch {
    return null;
  }
}
