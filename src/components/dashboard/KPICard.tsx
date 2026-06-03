import type { KPI } from "@/types/finance";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/formatters";
import clsx from "clsx";

// ─── Formatters ───────────────────────────────────────────────────────────────

function fmtValue(kpi: KPI, value = kpi.value): string {
  switch (kpi.format) {
    case "currency":  return formatCurrency(value, true);
    case "percent":   return formatPercent(value);
    case "headcount":
    case "number":    return formatNumber(value);
  }
}

// ─── Trend chip ───────────────────────────────────────────────────────────────

function TrendChip({ kpi }: { kpi: KPI }) {
  const delta    = kpi.value - kpi.prior;
  const isGood   =
    kpi.trend === "flat"
      ? true
      : kpi.trend === "up"
      ? kpi.trendPositive
      : !kpi.trendPositive;

  const arrow = kpi.trend === "flat" ? "→" : kpi.trend === "up" ? "↑" : "↓";
  const label =
    kpi.format === "percent"
      ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}pp`
      : kpi.format === "currency"
      ? formatCurrency(Math.abs(delta), true)
      : `${delta >= 0 ? "+" : ""}${Math.round(delta)}`;

  return (
    <div
      className={clsx(
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold shrink-0",
        isGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
      title="vs. prior period"
    >
      <span>{arrow}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Mini sparkline (pure CSS bars) ──────────────────────────────────────────

const sparkData: Record<string, number[]> = {
  currency:  [72, 76, 80, 85, 88, 93, 100],
  percent:   [50, 55, 60, 72, 68, 80, 100],
  headcount: [90, 92, 88, 92, 95, 96, 100],
  number:    [60, 70, 55, 75, 65, 80, 100],
};

function Sparkline({ format, isGood }: { format: KPI["format"]; isGood: boolean }) {
  const data = sparkData[format] ?? sparkData.currency;
  const max  = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-7">
      {data.map((v, i) => (
        <div
          key={i}
          className={clsx(
            "flex-1 rounded-sm",
            i === data.length - 1
              ? isGood ? "bg-emerald-400" : "bg-red-400"
              : "bg-slate-150"
          )}
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: i === data.length - 1 ? undefined : `rgba(148,163,184,${0.25 + (i / data.length) * 0.45})`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Main card ────────────────────────────────────────────────────────────────

interface KPICardProps {
  kpi: KPI;
  showSparkline?: boolean;
}

export default function KPICard({ kpi, showSparkline = true }: KPICardProps) {
  const variance    = kpi.value - kpi.budget;
  const variancePct = kpi.budget !== 0 ? variance / kpi.budget : 0;

  const overBudget = !kpi.trendPositive && kpi.format !== "headcount" && kpi.budget > 0 && variance > 0;
  const isGood     =
    kpi.trend === "flat"
      ? true
      : kpi.trend === "up"
      ? kpi.trendPositive
      : !kpi.trendPositive;

  const showProgress = kpi.budget > 0 && (kpi.format === "currency" || kpi.format === "headcount");
  const progressPct  = kpi.budget > 0 ? kpi.value / kpi.budget : 0;
  const progressColor =
    progressPct > 1.05 ? "bg-red-500" :
    progressPct > 0.95 ? "bg-amber-400" :
    "bg-nexora-500";

  // Status label
  const statusLabel = kpi.format === "headcount" && kpi.budget > 0
    ? `${kpi.value}/${kpi.budget} filled · ${kpi.budget - kpi.value} open`
    : kpi.budget > 0
    ? variance > 0
      ? `▲ ${formatPercent(Math.abs(variancePct))} over plan`
      : `▼ ${formatPercent(Math.abs(variancePct))} under plan`
    : null;

  const statusClass = kpi.format === "headcount" && kpi.budget > 0
    ? "bg-nexora-50 text-nexora-700"
    : overBudget
    ? "bg-red-50 text-red-700"
    : kpi.budget > 0
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-500";

  return (
    <div className="card-hover p-5 flex flex-col gap-3 overflow-hidden relative">
      {/* Over-budget glow */}
      {overBudget && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Row 1: Label + trend chip */}
      <div className="flex items-start justify-between gap-2">
        <p className="label leading-relaxed">{kpi.label}</p>
        <TrendChip kpi={kpi} />
      </div>

      {/* Row 2: Value */}
      <p className={clsx(
        "text-[26px] font-black leading-none tracking-tight",
        overBudget ? "text-red-700" : "text-slate-900"
      )}>
        {fmtValue(kpi)}
      </p>

      {/* Row 3: Sparkline */}
      {showSparkline && (
        <Sparkline format={kpi.format} isGood={isGood} />
      )}

      {/* Row 4: Budget context + progress bar */}
      {kpi.budget > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 font-medium">
              Budget: {fmtValue({ ...kpi, value: kpi.budget })}
            </span>
            {kpi.format !== "headcount" && kpi.budget > 0 && (
              <span className={clsx(
                "text-[10px] font-bold",
                variance > 0 ? "text-red-600" : "text-emerald-600"
              )}>
                {Math.round(progressPct * 100)}% utilized
              </span>
            )}
          </div>
          {showProgress && (
            <div className="progress-bar-track">
              <div
                className={clsx("progress-bar-fill", progressColor)}
                style={{ width: `${Math.min(progressPct * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Row 5: Status pill */}
      {statusLabel && (
        <div className={clsx(
          "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold w-fit",
          statusClass
        )}>
          {statusLabel}
        </div>
      )}
    </div>
  );
}
