import Link from "next/link";
import { getAgent } from "@/agents/registry";
import type { AgentId } from "@/types/finance";

interface AgentWorkspaceCTAProps {
  agentId:      AgentId;
  contextNote?: string;            // e.g. "Ask the FP&A Agent about the variance data above"
  prompts?:     string[];          // override default suggestions
}

export default function AgentWorkspaceCTA({
  agentId,
  contextNote,
  prompts,
}: AgentWorkspaceCTAProps) {
  const agent = getAgent(agentId);
  if (!agent) return null;

  const displayPrompts = prompts ?? agent.suggestedQuestions.slice(0, 3);

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="card-header flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-nexora-50 border border-nexora-100 flex items-center justify-center text-xl shrink-0">
          {agent.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-800 truncate">{agent.name}</p>
          <p className="text-[10px] text-slate-400 truncate">{agent.title}</p>
        </div>
        <Link
          href={`/agents/${agentId}`}
          className="btn-primary text-sm shrink-0 whitespace-nowrap"
        >
          Open Workspace ↗
        </Link>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {contextNote && (
          <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">{contextNote}</p>
        )}

        <p className="label mb-3">Ask about this page…</p>
        <div className="space-y-1.5">
          {displayPrompts.map((q, i) => (
            <Link
              key={i}
              href={`/agents/${agentId}?q=${encodeURIComponent(q)}`}
              className="flex items-center gap-2.5 group text-[11px] text-slate-600 hover:text-nexora-700 py-1.5 px-2 rounded-xl hover:bg-nexora-50 transition-all duration-150"
            >
              <span className="text-slate-300 group-hover:text-nexora-400 text-[10px] shrink-0">→</span>
              <span className="leading-snug">{q}</span>
            </Link>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[9px] text-slate-400">
            Full workspace · scrollable history · context panel
          </p>
          <Link href={`/agents/${agentId}`} className="text-[10px] text-nexora-600 font-semibold hover:underline">
            Open →
          </Link>
        </div>
      </div>
    </div>
  );
}
