import { notFound } from "next/navigation";
import AgentShell from "@/components/layout/AgentShell";
import AgentWorkspace from "@/components/agents/AgentWorkspace";
import { getAgent } from "@/agents/registry";
import type { AgentId } from "@/types/finance";

interface Props {
  params:       { agentId: string };
  searchParams?: { q?: string };
}

export default function AgentWorkspacePage({ params, searchParams }: Props) {
  const agent = getAgent(params.agentId as AgentId);
  if (!agent) notFound();

  return (
    <AgentShell
      title={agent.name}
      subtitle={agent.title}
      badge="Workspace"
    >
      <AgentWorkspace
        agentId={params.agentId as AgentId}
        initialQuestion={searchParams?.q}
      />
    </AgentShell>
  );
}

// Pre-render all 6 agent workspaces as static pages
export function generateStaticParams() {
  return [
    { agentId: "cfo" },
    { agentId: "fpa" },
    { agentId: "procurement" },
    { agentId: "external-labor" },
    { agentId: "headcount" },
    { agentId: "cio" },
  ];
}
