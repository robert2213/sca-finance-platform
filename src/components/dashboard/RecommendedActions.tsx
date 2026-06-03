import type { RecommendedAction } from "@/types/finance";
import { formatDate } from "@/lib/formatters";
import clsx from "clsx";

// ─── Priority config ──────────────────────────────────────────────────────────

const priorityCfg = {
  High:   { pill: "bg-red-100 text-red-700 border border-red-200",   dot: "bg-red-500",    num: 1 },
  Medium: { pill: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-400", num: 2 },
  Low:    { pill: "bg-slate-100 text-slate-600 border border-slate-200", dot: "bg-slate-400", num: 3 },
};

interface RecommendedActionsProps {
  actions: RecommendedAction[];
  limit?: number;
}

export default function RecommendedActions({ actions, limit }: RecommendedActionsProps) {
  const sorted = [...actions].sort(
    (a, b) => priorityCfg[a.priority].num - priorityCfg[b.priority].num
  );
  const shown  = limit ? sorted.slice(0, limit) : sorted;

  const high   = actions.filter(a => a.priority === "High").length;
  const medium = actions.filter(a => a.priority === "Medium").length;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="card-header flex items-center justify-between gap-3">
        <div>
          <h2 className="section-title">Recommended Actions</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {actions.length} actions · {high} high priority
          </p>
        </div>
        <div className="flex items-center gap-2">
          {high > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
              {high} High
            </span>
          )}
          {medium > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
              {medium} Medium
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="divide-y divide-slate-50">
        {shown.map((action, idx) => {
          const cfg = priorityCfg[action.priority];
          return (
            <div
              key={action.id}
              className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
            >
              {/* Number */}
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5">
                {idx + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={clsx(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                    cfg.pill
                  )}>
                    {action.priority.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{action.id}</span>
                </div>

                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  {action.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {action.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <span>👤</span>
                    <span className="font-medium text-slate-600">{action.owner}</span>
                  </span>
                  {action.dueDate && (
                    <span className="flex items-center gap-1">
                      <span>📅</span>
                      <span className="font-medium text-slate-600">Due {formatDate(action.dueDate)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Priority indicator */}
              <div
                className={clsx("w-1 h-full min-h-[40px] rounded-full shrink-0", cfg.dot)}
                title={`${action.priority} priority`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
