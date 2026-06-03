import type { AgentId } from "@/types/finance";
import type { ConversationTurn, AgentResponseWithRoute } from "./mockResponses";

export interface AgentDefinition {
  id: AgentId;
  name: string;
  title: string;
  description: string;
  avatar: string;      // emoji used as avatar
  color: string;       // Tailwind color key
  capabilities: string[];
  suggestedQuestions: string[];
  respond: (question: string, history?: ConversationTurn[]) => AgentResponseWithRoute;
}
