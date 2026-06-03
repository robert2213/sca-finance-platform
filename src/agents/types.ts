import type { AgentId, AgentResponse } from "@/types/finance";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  avatar: string;      // emoji used as avatar
  color: string;       // Tailwind color key
  capabilities: string[];
  suggestedQuestions: string[];
  respond: (question: string) => AgentResponse;
}
