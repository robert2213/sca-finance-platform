import type { KPI, KPIStatus } from "@/types/finance";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import clsx from "clsx";

// ─── Status config ─────────────────────────────────────────────────────────────
// Green = favorable, Red = unfavorable, Amber = watch, Slate = neutral
// Follows standard finance convention, NOT "red = any overage"

const statusConfig: Record<KPIStatus, {
  pill:  string;
  label: string;
  bar:   string;
  text:  string;
  bg:    string;
}> = {
  favorable: {
    pill:  "bg-emerald-100 text-emerald-800 border border-emerald-200",
    label: "Favorable",
    bar:   "bg-emerald-500",
    text:  "text-emerald-700",
    bg:    "",
  },
  watch: {
    pill:  "bg-amber-100 text-amber-800 border border-amber-200",
    label: "Watch",
    bar:   "bg-amber-400",
    text:  "text-amber-700",
    bg:    "",
  },
  unfavorable: {
    pill:  "bg-red-100 text-red-800 border border-red-200",
    label: "Unfavorable",
    bar:   "bg-red-500",
    text:  "text-red-700",
    bg:    "bg-red-50/30",
  },
  neutral: {
    pill:  "bg-slate-100 text-slate-600 border border-slate-200",
    label: "On Track",
    bar:   "bg-slate-400",
    text:  "text-slate-500",
    bg:    "",
  },
};

// ─── Value formatters ──────────────────────────────────────────────────────────

function fmtValue(kpi: KPI, value = kpi.value): string {
  switch (kpi.format) {
    case "currency":  return formatCurrency(value, true);
    case "percent":   return formatPercent(value);
    case "headcount":
    case "number":    return formatNumber(value);
  }
}

// ─── Variance row ──────────────────────────────────────────────────────────────
// Shows: "▲ +$458K / +3.2% unfav." or "▼ –$82K / –0.8% fav."
// This is the single most important piece of information on the card.

function VarianceRow({ kpi, status }: { kpi: KPI; status: KPIStatus }) {
  const hasBudget = kpi.hasBudget !== false && kpi.budget > 0;
  if (!hasBudget) return null;

  const varianceDollar = kpi.varianceDollar ?? (kpi.value - kpi.budget);
  const variancePct    = kpi.budget !== 0 ? varianceDollar / Math.abs(kpi.budget) : 0;
  const isOver         = varianceDollar > 0;
  const isZero         = Math.abs(variancePct) < 0.001;

  const cfg = statusConfig[status];

  if (isZero) {
    return (
      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>Budget: {fmtValue({ ...kpi, value: kpi.budget })}</span>
        <span className="font-semibold text-slate-500">On Plan</span>
      </div>
    );
  }

  const arrow = isOver ? "▲" : "▼";

  // For currency metrics show $+amount / +pct
  // For percent metrics show +Xpp
  // For number metrics show +N count
  let varianceText: string;
  if (kpi.format === "percent") {
    const pp = varianceDollar * 100;
    varianceText = `${pp > 0 ? "+" : ""}${pp.toFixed(1)}pp`;
  } else if (kpi.format === "currency") {
    const dollarStr = formatCurrency(Math.abs(varianceDollar), true);
    const pctStr    = `${Math.abs(variancePct * 100).toFixed(1)}%`;
    varianceText = `${isOver ? "+" : "–"}${dollarStr} / ${isOver ? "+" : "–"}${pctStr}`;
  } else {
    varianceText = `${isOver ? "+" : ""}${Math.round(varianceDollar)}`;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Budget {fmtValue({ ...kpi, value: kpi.budget })}
        </span>
        <div className={clsx("flex items-center gap-1 text-[11px] font-bold", cfg.text)}>
          <span>{arrow}</span>
          <span>{varianceText}</span>
        </div>
      </div>
      {/* Utilisation bar only for currency with budget */}
      {kpi.format === "currency" && (
        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-700", cfg.bar)}
            style={{ width: `${Math.min((kpi.value / kpi.budget) * 100, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  kpi: KPI;
}

export default function KPICard({ kpi }: KPICardProps) {
  // Derive status: explicit field takes priority, then compute from budget comparison
  let status: KPIStatus = kpi.status ?? "neutral";
  if (!kpi.status) {
    const v   = kpi.value - kpi.budget;
    const pct = kpi.budget !== 0 ? v / kpi.budget : 0;
    const bad = !kpi.trendPositive;
    if (Math.abs(pct) < 0.005)       status = "neutral";
    else if (bad && pct > 0.05)       status = "unfavorable";
    else if (bad && pct > 0.01)       status = "watch";
    else if (!bad && pct < -0.05)     status = "unfavorable";
    else if (!bad && pct < -0.01)     status = "watch";
    else                              status = "favorable";
  }

  const cfg = statusConfig[status];

  // Large value color: only deep red for genuinely unfavorable
  const valueColor = status === "unfavorable"
    ? "text-red-700"
    : "text-slate-900";

  return (
    <div className={clsx(
      "card-hover flex flex-col gap-3 p-5 overflow-hidden relative",
      cfg.bg
    )}>
      {/* Row 1: Label + Status pill */}
      <div className="flex items-start justify-between gap-2">
        <p className="label leading-relaxed">{kpi.label}</p>
        <span className={clsx(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
          cfg.pill
        )}>
          {cfg.label}
        </span>
      </div>

      {/* Row 2: Primary value */}
      <p className={clsx("text-[28px] font-black leading-none tracking-tight", valueColor)}>
        {fmtValue(kpi)}
      </p>

      {/* Row 3: Variance vs. budget (the answer to "how does it compare?") */}
      <VarianceRow kpi={kpi} status={status} />

      {/* Row 4: Driver text (the answer to "why?") */}
      {kpi.driver && (
        <div className="border-t border-slate-100 pt-2.5 mt-0.5">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1">
            Driver
          </p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {kpi.driver}
          </p>
        </div>
      )}

      {/* Row 5: Action (the answer to "what to do?") — only shown if present */}
      {kpi.action && (
        <div className="flex items-start gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-2 mt-0.5">
          <span className="text-nexora-400 text-[10px] mt-0.5 shrink-0">→</span>
          <p className="text-[10px] text-slate-600 leading-snug">{kpi.action}</p>
        </div>
      )}
    </div>
  );
}
