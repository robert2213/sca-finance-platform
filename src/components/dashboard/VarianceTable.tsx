import { formatCurrency, formatPercent } from "@/lib/formatters";
import clsx from "clsx";

export interface VarianceRow {
  label: string;
  sublabel?: string;
  actual: number;
  budget: number;
  forecast?: number;
  variance: number;
  variancePct: number;
  highlight?: boolean;
}

interface VarianceTableProps {
  rows: VarianceRow[];
  showForecast?: boolean;
  title?: string;
  subtitle?: string;
}

// ─── Variance pill ────────────────────────────────────────────────────────────

function VariancePill({ value, pct, compact = false }: { value: number; pct: number; compact?: boolean }) {
  const unfav = value > 0;
  const flat  = Math.abs(pct) < 0.001;
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={clsx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold",
        flat   ? "var-flat" :
        unfav  ? "var-unfav" :
                 "var-fav"
      )}>
        {!flat && <span>{unfav ? "▲" : "▼"}</span>}
        <span>{formatCurrency(Math.abs(value), true)}</span>
      </span>
      {!compact && (
        <span className={clsx(
          "text-[10px] font-semibold",
          flat   ? "text-slate-400" :
          unfav  ? "text-red-500"   :
                   "text-emerald-600"
        )}>
          {flat ? "—" : `${formatPercent(Math.abs(pct))}`}
        </span>
      )}
    </div>
  );
}

// ─── Inline utilisation bar ───────────────────────────────────────────────────

function UtilBar({ actual, budget }: { actual: number; budget: number }) {
  if (budget <= 0) return null;
  const pct = Math.min((actual / budget) * 100, 130);
  const color =
    pct > 105 ? "bg-red-500"    :
    pct >  95 ? "bg-amber-400"  :
                "bg-nexora-500";
  return (
    <div className="w-20 hidden xl:block">
      <div className="flex items-center gap-1.5">
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx("h-full rounded-full transition-all duration-500", color)}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-medium w-6 text-right">
          {Math.round(pct)}%
        </span>
      </div>
    </div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export default function VarianceTable({
  rows,
  showForecast = false,
  title,
  subtitle,
}: VarianceTableProps) {
  const totActual   = rows.reduce((s, r) => s + r.actual, 0);
  const totBudget   = rows.reduce((s, r) => s + r.budget, 0);
  const totForecast = rows.reduce((s, r) => s + (r.forecast ?? 0), 0);
  const totVariance = totActual - totBudget;
  const totVarPct   = totBudget > 0 ? totVariance / totBudget : 0;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      {title && (
        <div className="card-header flex items-center justify-between">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {/* Summary chips */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 rounded-xl px-3 py-1.5 text-[11px] font-semibold text-slate-600">
              <span className="text-slate-400">Actual</span>
              <span>{formatCurrency(totActual, true)}</span>
            </div>
            <div className={clsx(
              "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold",
              totVariance > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            )}>
              <span>{totVariance > 0 ? "▲" : "▼"}</span>
              <span>{formatCurrency(Math.abs(totVariance), true)}</span>
              <span className="opacity-70">({formatPercent(Math.abs(totVarPct))})</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80">
              <th className="px-6 py-3 text-left tbl-head">Category / Entity</th>
              <th className="px-4 py-3 text-right tbl-head">Actual</th>
              <th className="px-4 py-3 text-right tbl-head">Budget</th>
              {showForecast && (
                <th className="px-4 py-3 text-right tbl-head">Forecast</th>
              )}
              <th className="px-4 py-3 text-right tbl-head">Variance</th>
              <th className="px-4 py-3 tbl-head hidden xl:table-cell">Utilisation</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {rows.map((row, i) => (
              <tr
                key={i}
                className={clsx(
                  "tbl-row",
                  row.highlight
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "hover:bg-slate-50/80"
                )}
              >
                {/* Label */}
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-2">
                    {row.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{row.label}</p>
                      {row.sublabel && (
                        <p className="text-[10px] text-slate-400 mt-0.5">{row.sublabel}</p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Actual */}
                <td className="px-4 py-3.5 text-right">
                  <span className="font-bold text-slate-800">{formatCurrency(row.actual, true)}</span>
                </td>

                {/* Budget */}
                <td className="px-4 py-3.5 text-right">
                  <span className="text-slate-500 font-medium">{formatCurrency(row.budget, true)}</span>
                </td>

                {/* Forecast */}
                {showForecast && (
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-nexora-600 font-semibold">
                      {row.forecast != null ? formatCurrency(row.forecast, true) : "—"}
                    </span>
                  </td>
                )}

                {/* Variance */}
                <td className="px-4 py-3.5 text-right">
                  <VariancePill value={row.variance} pct={row.variancePct} />
                </td>

                {/* Utilisation bar */}
                <td className="px-4 py-3.5 hidden xl:table-cell">
                  <UtilBar actual={row.actual} budget={row.budget} />
                </td>
              </tr>
            ))}
          </tbody>

          {/* Footer totals */}
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <td className="px-6 py-3.5">
                <span className="text-sm font-bold text-slate-700">Total</span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="font-black text-slate-900">{formatCurrency(totActual, true)}</span>
              </td>
              <td className="px-4 py-3.5 text-right">
                <span className="font-bold text-slate-600">{formatCurrency(totBudget, true)}</span>
              </td>
              {showForecast && (
                <td className="px-4 py-3.5 text-right">
                  <span className="font-bold text-nexora-700">{formatCurrency(totForecast, true)}</span>
                </td>
              )}
              <td className="px-4 py-3.5 text-right">
                <VariancePill value={totVariance} pct={totVarPct} />
              </td>
              <td className="px-4 py-3.5 hidden xl:table-cell">
                <UtilBar actual={totActual} budget={totBudget} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
