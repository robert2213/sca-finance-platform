"use client";

import { useState } from "react";
import type { KPI, KPIStatus } from "@/types/finance";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import clsx from "clsx";

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<KPIStatus, {
  pill:  string;
  label: string;
  bar:   string;
  text:  string;
}> = {
  favorable:   { pill: "bg-emerald-100 text-emerald-800 border border-emerald-200", label: "Favorable",   bar: "bg-emerald-500", text: "text-emerald-700" },
  watch:       { pill: "bg-amber-100 text-amber-800 border border-amber-200",       label: "Watch",       bar: "bg-amber-400",   text: "text-amber-700"   },
  unfavorable: { pill: "bg-red-100 text-red-800 border border-red-200",             label: "Unfavorable", bar: "bg-red-500",     text: "text-red-700"     },
  neutral:     { pill: "bg-slate-100 text-slate-600 border border-slate-200",       label: "On Track",    bar: "bg-slate-400",   text: "text-slate-500"   },
};

// ─── Value formatter ───────────────────────────────────────────────────────────

function fmtValue(kpi: KPI, value = kpi.value): string {
  switch (kpi.format) {
    case "currency":  return formatCurrency(value, true);
    case "percent":   return formatPercent(value);
    case "headcount":
    case "number":    return formatNumber(value);
  }
}

// ─── Variance / context row ────────────────────────────────────────────────────
// Headcount uses a natural "X/Y filled · Z open" row, not a % variance.
// Currency uses "$+X / +Y%" with a thin progress bar.
// Everything else uses a compact delta line.

function VarianceRow({ kpi, status }: { kpi: KPI; status: KPIStatus }) {
  const hasBudget = kpi.hasBudget !== false && kpi.budget > 0;
  if (!hasBudget) return null;

  const cfg = statusConfig[status];

  // ── Headcount: "78/85 filled · 7 open" ──────────────────────────────────────
  if (kpi.format === "headcount") {
    const open     = Math.max(0, kpi.budget - kpi.value);
    const fillRate = kpi.budget > 0 ? (kpi.value / kpi.budget) * 100 : 0;
    return (
      <div className="flex items-center justify-between text-[11px] pt-0.5">
        <span className="text-slate-400">
          {kpi.value}/{kpi.budget} filled · {fillRate.toFixed(0)}%
        </span>
        <span className={clsx("font-semibold", open > 0 ? "text-amber-600" : "text-emerald-600")}>
          {open > 0 ? `${open} open` : "Fully staffed"}
        </span>
      </div>
    );
  }

  const varianceDollar = kpi.varianceDollar ?? (kpi.value - kpi.budget);
  const variancePct    = kpi.budget !== 0 ? varianceDollar / Math.abs(kpi.budget) : 0;
  const isZero         = Math.abs(variancePct) < 0.001;

  if (isZero) {
    return (
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Budget {fmtValue({ ...kpi, value: kpi.budget })}</span>
        <span className="font-semibold text-slate-500">On Plan</span>
      </div>
    );
  }

  const isOver = varianceDollar > 0;
  const arrow  = isOver ? "▲" : "▼";
  const sign   = isOver ? "+" : "–";

  let varianceText: string;
  if (kpi.format === "percent") {
    const pp = varianceDollar * 100;
    varianceText = `${pp > 0 ? "+" : ""}${pp.toFixed(1)}pp`;
  } else if (kpi.format === "currency") {
    const d = formatCurrency(Math.abs(varianceDollar), true);
    const p = `${Math.abs(variancePct * 100).toFixed(1)}%`;
    varianceText = `${sign}${d} / ${sign}${p}`;
  } else {
    varianceText = `${isOver ? "+" : ""}${Math.round(varianceDollar)}`;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-slate-400">Budget {fmtValue({ ...kpi, value: kpi.budget })}</span>
        <span className={clsx("font-bold", cfg.text)}>{arrow} {varianceText}</span>
      </div>
      {/* Budget utilisation bar — currency only */}
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
// Card face: label + status, value, variance — scannable in <5 seconds.
// Driver and action text are hidden behind an "Insight ▾" toggle.

export default function KPICard({ kpi }: { kpi: KPI }) {
  const [expanded, setExpanded] = useState(false);

  // Derive status: explicit field takes priority
  let status: KPIStatus = kpi.status ?? "neutral";
  if (!kpi.status) {
    const v   = kpi.value - kpi.budget;
    const pct = kpi.budget !== 0 ? v / kpi.budget : 0;
    const bad = !kpi.trendPositive;
    if (Math.abs(pct) < 0.005)    status = "neutral";
    else if (bad  && pct >  0.05) status = "unfavorable";
    else if (bad  && pct >  0.01) status = "watch";
    else if (!bad && pct < -0.05) status = "unfavorable";
    else if (!bad && pct < -0.01) status = "watch";
    else                          status = "favorable";
  }

  const cfg        = statusConfig[status];
  const valueColor = status === "unfavorable" ? "text-red-700" : "text-slate-900";
  const hasDetail  = !!(kpi.driver || kpi.action);

  return (
    <div className="card-hover flex flex-col gap-2.5 p-5 overflow-hidden relative">

      {/* ── Row 1: Label + Status pill ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <p className="label leading-relaxed">{kpi.label}</p>
        <span className={clsx(
          "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0",
          cfg.pill
        )}>
          {cfg.label}
        </span>
      </div>

      {/* ── Row 2: Primary value ───────────────────────────────────────────── */}
      <p className={clsx(
        "text-[28px] font-black leading-none tracking-tight",
        valueColor
      )}>
        {fmtValue(kpi)}
      </p>

      {/* ── Row 3: Variance / context row ─────────────────────────────────── */}
      <VarianceRow kpi={kpi} status={status} />

      {/* ── Row 4: Insight toggle ──────────────────────────────────────────── */}
      {hasDetail && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-nexora-600 transition-colors mt-0.5 w-fit"
          >
            <span className="text-[8px]">{expanded ? "▴" : "▾"}</span>
            <span>Insight</span>
          </button>

          {expanded && (
            <div className="border-t border-slate-100 pt-2.5 space-y-2 animate-chat">
              {kpi.driver && (
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {kpi.driver}
                </p>
              )}
              {kpi.action && (
                <p className="flex items-start gap-1 text-[10px] text-nexora-600 font-medium">
                  <span className="shrink-0 mt-0.5">→</span>
                  <span>{kpi.action}</span>
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
