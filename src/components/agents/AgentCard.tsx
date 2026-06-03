import Link from "next/link";
import type { AgentDefinition } from "@/agents/types";
import clsx from "clsx";

interface AgentCardProps {
  agent: AgentDefinition;
}

const pageMap: Record<string, string> = {
  cfo:              "/cfo",
  fpa:              "/fpa",
  procurement:      "/vendors",
  "external-labor": "/external-labor",
  headcount:        "/headcount",
  cio:              "/cio",
};

const colorMap: Record<string, { bg: string; border: string; text: string; capBg: string }> = {
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-100", text: "text-indigo-700",  capBg: "bg-indigo-100"  },
  blue:    { bg: "bg-blue-50",    border: "border-blue-100",   text: "text-blue-700",    capBg: "bg-blue-100"    },
  purple:  { bg: "bg-purple-50",  border: "border-purple-100", text: "text-purple-700",  capBg: "bg-purple-100"  },
  amber:   { bg: "bg-amber-50",   border: "border-amber-100",  text: "text-amber-700",   capBg: "bg-amber-100"   },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-100",text: "text-emerald-700", capBg: "bg-emerald-100" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-100",   text: "text-rose-700",    capBg: "bg-rose-100"    },
};

export default function AgentCard({ agent }: AgentCardProps) {
  const color = colorMap[agent.color] ?? colorMap.indigo;

  return (
    <div className="card-hover flex flex-col overflow-hidden group">
      {/* Card top — colored accent */}
      <div className={clsx("px-5 pt-5 pb-4 border-b border-slate-100", color.bg)}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={clsx(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border",
            color.border, "bg-white"
          )}>
            {agent.avatar}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-slate-500 font-semibold">Active</span>
          </div>
        </div>

        <p className={clsx("font-black text-sm", color.text)}>{agent.name}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">{agent.title}</p>
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex-1 flex flex-col gap-4">
        <p className="text-[11px] text-slate-500 leading-relaxed">{agent.description}</p>

        {/* Capability chips */}
        <div className="flex flex-wrap gap-1.5">
          {agent.capabilities.map(cap => (
            <span
              key={cap}
              className={clsx(
                "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                color.capBg, color.border, color.text
              )}
            >
              {cap}
            </span>
          ))}
        </div>

        {/* Sample question */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide mb-1">
            Try asking…
          </p>
          <p className="text-[11px] text-slate-600 italic leading-snug">
            "{agent.suggestedQuestions[0]}"
          </p>
        </div>

        {/* CTA */}
        <Link
          href={pageMap[agent.id] ?? "/agents"}
          className={clsx(
            "mt-auto block w-full text-center text-sm font-bold rounded-xl px-4 py-2.5 transition-all duration-150",
            "border shadow-sm",
            color.capBg, color.border, color.text,
            "hover:shadow-md hover:scale-[1.01]"
          )}
        >
          Open {agent.name} →
        </Link>
      </div>
    </div>
  );
}
