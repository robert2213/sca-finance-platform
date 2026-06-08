// Parses Claude's JSON response into the AgentResponse shape.
// Fails gracefully — always returns a valid AgentResponse even if parsing fails.

import type { AgentResponse } from "@/types/finance";

export function parseAgentResponse(rawText: string): AgentResponse {
  // Strip markdown code fences if Claude wrapped the JSON
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Find the outermost JSON object — Claude sometimes adds a preamble sentence
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd   = cleaned.lastIndexOf("}");

  if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
    return fallback(rawText);
  }

  const jsonStr = cleaned.slice(jsonStart, jsonEnd + 1);

  try {
    const parsed = JSON.parse(jsonStr) as {
      answer?: unknown;
      keyPoints?: unknown;
      actions?: unknown;
    };

    const answer = typeof parsed.answer === "string" && parsed.answer.trim()
      ? parsed.answer.trim()
      : fallbackAnswer(rawText);

    const keyPoints = Array.isArray(parsed.keyPoints)
      ? parsed.keyPoints
          .filter((k): k is string => typeof k === "string")
          .slice(0, 6)
      : [];

    const actions = Array.isArray(parsed.actions)
      ? parsed.actions
          .filter((a): a is Record<string, unknown> => a !== null && typeof a === "object")
          .slice(0, 4)
          .map((a, i) => ({
            id:          typeof a.id === "string"          ? a.id          : `ACTION-${i + 1}`,
            priority:    validatePriority(a.priority)      ?? "Medium",
            title:       typeof a.title === "string"       ? a.title       : "Recommended Action",
            description: typeof a.description === "string" ? a.description : "",
            owner:       typeof a.owner === "string"       ? a.owner       : "Finance Team",
            dueDate:     typeof a.dueDate === "string"     ? a.dueDate     : undefined,
          }))
      : [];

    return { answer, keyPoints, riskFlags: [], actions };

  } catch {
    return fallback(rawText);
  }
}

function validatePriority(v: unknown): "High" | "Medium" | "Low" | null {
  if (v === "High" || v === "Medium" || v === "Low") return v;
  return null;
}

function fallbackAnswer(raw: string): string {
  // If JSON parse failed but we have text, return it as-is
  return raw.trim() || "I was unable to generate a response. Please try again.";
}

function fallback(raw: string): AgentResponse {
  return {
    answer:    fallbackAnswer(raw),
    keyPoints: [],
    riskFlags: [],
    actions:   [],
  };
}
