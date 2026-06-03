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
  const delta     = kpi.value - kpi.prior;
  const deltaPct  = kpi.prior !== 0 ? delta / Math.abs(kpi.prior) : 0;
  const isGood    =
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
        "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold",
        isGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
      )}
      title="vs. prior period"
    >
      <span>{arrow}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="progress-bar-track mt-2">
      <div
        className={clsx("progress-bar-fill", color)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Mini sparkline (pure CSS bars) ──────────────────────────────────────────

const sparkData: Record<string, number[]> = {
  // rough month-over-month trend shapes per metric type
  currency:  [72, 76, 80, 85, 88, 93, 100],
  percent:   [50, 55, 60, 72, 68, 80, 100],
  headcount: [90, 92, 88, 92, 95, 96, 100],
  number:    [60, 70, 55, 75, 65, 80, 100],
};

function Sparkline({ format, isGood }: { format: KPI["format"]; isGood: boolean }) {
  const data = sparkData[format] ?? sparkData.currency;
  const max  = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className={clsx(
            "flex-1 rounded-sm transition-all duration-300",
            i === data.length - 1
              ? isGood ? "bg-emerald-500" : "bg-red-500"
              : "bg-slate-200"
          )}
          style={{ height: `${(v / max) * 100}%` }}
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

  // For budget progress, is spending over budget "bad"?
  const overBudget = !kpi.trendPositive && kpi.format !== "headcount" && variance > 0;
  const isGood     =
    kpi.trend === "flat"
      ? true
      : kpi.trend === "up"
      ? kpi.trendPositive
      : !kpi.trendPositive;

  // Progress bar config
  const showProgress = kpi.budget > 0 && kpi.format === "currency";
  const progressPct  = kpi.budget > 0 ? Math.min(kpi.value / kpi.budget, 1.2) : 0;
  const progressColor = progressPct > 1.05
    ? "bg-red-500"
    : progressPct > 0.95
    ? "bg-amber-400"
    : "bg-nexora-500";

  return (
    <div className="card-hover p-5 flex flex-col gap-2.5 overflow-hidden relative">
      {/* Subtle top-right glow for over-budget cards */}
      {overBudget && (
        <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/5 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Row 1: Label + trend chip */}
      <div className="flex items-center justify-between gap-2">
        <p className="label truncate">{kpi.label}</p>
        <TrendChip kpi={kpi} />
      </div>

      {/* Row 2: Value */}
      <div>
        <p className={clsx(
          "text-2xl font-black leading-none tracking-tight",
          overBudget ? "text-red-700" : "text-slate-900"
        )}>
          {fmtValue(kpi)}
        </p>
      </div>

      {/* Row 3: Sparkline OR progress */}
      {showSparkline && (
        <Sparkline format={kpi.format} isGood={isGood} />
      )}

      {/* Row 4: Budget context */}
      {kpi.budget > 0 && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">
              Budget: {fmtValue({ ...kpi, value: kpi.budget })}
            </span>
            {kpi.format !== "headcount" && (
              <span
                className={clsx(
                  "font-bold",
                  variance > 0 ? "text-red-600" : "text-emerald-600"
                )}
              >
                {variance > 0 ? "+" : ""}{formatPercent(Math.abs(variancePct))}
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

          {/* Headcount fill bar */}
          {kpi.format === "headcount" && kpi.budget > 0 && (
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill bg-nexora-500"
                style={{ width: `${(kpi.value / kpi.budget) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Row 5: Status pill */}
      <div className={clsx(
        "rounded-lg px-2.5 py-1.5 text-[10px] font-bold flex items-center gap-1.5 w-fit",
        kpi.format === "headcount" && kpi.budget > 0
          ? "bg-nexora-50 text-nexora-700"
          : overBudget
          ? "bg-red-50 text-red-700"
          : kpi.budget > 0
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-500"
      )}>
        {kpi.format === "headcount" && kpi.budget > 0 ? (
          <>{kpi.value}/{kpi.budget} filled · {kpi.budget - kpi.value} open</>
        ) : kpi.budget > 0 ? (
          <>
            <span>{variance > 0 ? "▲ Over" : "▼ Under"} budget</span>
          </>
        ) : (
          <span>No budget set</span>
        )}
      </div>
    </div>
  );
}
