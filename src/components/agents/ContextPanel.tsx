import type { ChatMessage, ActionItem } from "@/hooks/useConversation";
import clsx from "clsx";

interface ContextPanelProps {
  messages:  ChatMessage[];
  agentName: string;
}

const priorityCfg = {
  High:   { pill: "bg-red-50 text-red-700 border-red-200" },
  Medium: { pill: "bg-amber-50 text-amber-700 border-amber-200" },
  Low:    { pill: "bg-slate-100 text-slate-600 border-slate-200" },
};

export default function ContextPanel({ messages, agentName }: ContextPanelProps) {
  const agentMsgs = messages.filter(m => m.role === "agent");
  const turnCount = messages.filter(m => m.role === "user").length;

  // Accumulate key points from all agent responses (most recent first)
  const allKeyPoints: string[] = [];
  for (const msg of [...agentMsgs].reverse()) {
    for (const kp of msg.keyPoints ?? []) {
      if (!allKeyPoints.includes(kp) && allKeyPoints.length < 8) {
        allKeyPoints.push(kp);
      }
    }
  }

  // Accumulate unique actions (deduplicated by title)
  const seenTitles = new Set<string>();
  const allActions: ActionItem[] = [];
  for (const msg of [...agentMsgs].reverse()) {
    for (const a of msg.actions ?? []) {
      if (!seenTitles.has(a.title) && allActions.length < 6) {
        seenTitles.add(a.title);
        allActions.push(a);
      }
    }
  }

  const isEmpty = allKeyPoints.length === 0 && allActions.length === 0;

  return (
    <div className="flex flex-col h-full bg-slate-50/80 border-l border-slate-200">

      {/* Header */}
      <div className="shrink-0 px-4 py-3.5 border-b border-slate-200 bg-white">
        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">
          Session Context
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          {turnCount > 0
            ? `${turnCount} turn${turnCount !== 1 ? "s" : ""} · extracted from ${agentName}`
            : `Populated as ${agentName} responds`}
        </p>
      </div>

      {/* Content — scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {isEmpty ? (
          <div className="px-4 py-8 text-center">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5" />
              </svg>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-[160px] mx-auto">
              Key metrics, risks, and actions will appear here as the conversation progresses.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">

            {/* Key Takeaways */}
            {allKeyPoints.length > 0 && (
              <section className="px-4 py-4">
                <p className="label mb-3">Key Takeaways</p>
                <div className="space-y-2.5">
                  {allKeyPoints.map((kp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-nexora-400 mt-1.5 shrink-0" />
                      <p className="text-[10px] text-slate-600 leading-snug">{kp}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Recommended Actions */}
            {allActions.length > 0 && (
              <section className="px-4 py-4">
                <p className="label mb-3">Recommended Actions</p>
                <div className="space-y-2">
                  {allActions.map((a, i) => {
                    const cfg = priorityCfg[a.priority as keyof typeof priorityCfg] ?? priorityCfg.Low;
                    return (
                      <div key={i} className="rounded-xl bg-white border border-slate-100 px-3 py-2.5 shadow-sm">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={clsx(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md border",
                            cfg.pill
                          )}>
                            {a.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] font-semibold text-slate-700 leading-snug">
                          {a.title}
                        </p>
                        {(a.owner || a.dueDate) && (
                          <p className="text-[9px] text-slate-400 mt-1">
                            {a.owner}
                            {a.dueDate && ` · Due ${a.dueDate}`}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
