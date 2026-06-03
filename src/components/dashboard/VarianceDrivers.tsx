import { formatCurrency, formatPercent } from "@/lib/formatters";
import clsx from "clsx";

export interface VarianceDriver {
  rank:        number;
  category:    string;
  title:       string;
  variance:    number;          // $ amount (positive = unfavorable spend, negative = favorable)
  budget:      number;          // base for % calc
  context:     string;          // 1–2 sentences of explanation
  action:      string;          // what to do
  status:      "unfavorable" | "watch" | "favorable";
  actionOwner?: string;
  actionDue?:   string;
}

interface VarianceDriversProps {
  drivers: VarianceDriver[];
  period?: string;
}

const statusStyle = {
  unfavorable: {
    accent:  "border-l-red-500",
    badge:   "bg-red-100 text-red-800 border border-red-200",
    rank:    "bg-red-100 text-red-700",
    dollar:  "text-red-700",
    arrow:   "▲",
  },
  watch: {
    accent:  "border-l-amber-400",
    badge:   "bg-amber-100 text-amber-800 border border-amber-200",
    rank:    "bg-amber-100 text-amber-700",
    dollar:  "text-amber-700",
    arrow:   "▲",
  },
  favorable: {
    accent:  "border-l-emerald-500",
    badge:   "bg-emerald-100 text-emerald-800 border border-emerald-200",
    rank:    "bg-emerald-100 text-emerald-700",
    dollar:  "text-emerald-700",
    arrow:   "▼",
  },
};

export default function VarianceDrivers({ drivers, period = "YTD May 2026" }: VarianceDriversProps) {
  return (
    <div className="card overflow-hidden">
      <div className="card-header flex items-center justify-between">
        <div>
          <h2 className="section-title">Top Variance Drivers</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {period} · Root causes of budget variance with recommended actions
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-semibold">
          <span className="flex items-center gap-1 text-red-600">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Unfavorable
          </span>
          <span className="flex items-center gap-1 text-amber-600">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Watch
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Favorable
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {drivers.map((d) => {
          const s         = statusStyle[d.status];
          const hasBudget = d.budget > 0;
          const varPct    = hasBudget ? d.variance / d.budget : 0;
          const absDollar = Math.abs(d.variance);
          const sign      = d.variance >= 0 ? "+" : "–";

          return (
            <div
              key={d.rank}
              className={clsx(
                "px-6 py-5 border-l-4 transition-colors hover:bg-slate-50/40",
                s.accent
              )}
            >
              <div className="flex items-start gap-4">
                {/* Rank bubble */}
                <div className={clsx(
                  "w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5",
                  s.rank
                )}>
                  {d.rank}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <p className="text-[13px] font-bold text-slate-800 leading-tight">{d.title}</p>
                    <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide", s.badge)}>
                      {d.category}
                    </span>
                  </div>

                  {/* Context */}
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-2.5">
                    {d.context}
                  </p>

                  {/* Recommended action */}
                  <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                    <span className="text-nexora-400 font-bold text-[10px] shrink-0 mt-0.5">→</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-700 leading-snug font-medium">{d.action}</p>
                      {(d.actionOwner || d.actionDue) && (
                        <p className="text-[9px] text-slate-400 mt-0.5">
                          {d.actionOwner && <span>{d.actionOwner}</span>}
                          {d.actionOwner && d.actionDue && <span> · </span>}
                          {d.actionDue && <span>Due {d.actionDue}</span>}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Impact block */}
                <div className="shrink-0 text-right ml-4">
                  <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                    {d.variance >= 0 ? "Over Budget" : "Under Budget"}
                  </p>
                  <p className={clsx("text-xl font-black leading-tight", s.dollar)}>
                    {s.arrow} {sign}{formatCurrency(absDollar, true)}
                  </p>
                  {hasBudget && (
                    <p className={clsx("text-[11px] font-semibold mt-0.5", s.dollar)}>
                      {sign}{Math.abs(varPct * 100).toFixed(1)}% vs. plan
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
