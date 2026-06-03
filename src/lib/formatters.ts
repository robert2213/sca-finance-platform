// ─── Currency ─────────────────────────────────────────────────────────────────

export function formatCurrency(value: number, compact = false): string {
  if (compact) {
    if (Math.abs(value) >= 1_000_000)
      return `$${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000)
      return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Percent ──────────────────────────────────────────────────────────────────

export function formatPercent(value: number, decimals = 1): string {
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(decimals)}%`;
}

// ─── Variance helpers ─────────────────────────────────────────────────────────

export function varianceClass(variance: number, inverse = false): string {
  if (variance === 0) return "text-slate-500";
  const unfavorable = inverse ? variance < 0 : variance > 0;
  return unfavorable ? "text-red-600" : "text-emerald-600";
}

export function varianceBgClass(variance: number): string {
  if (variance === 0) return "bg-slate-100 text-slate-700";
  return variance > 0
    ? "bg-red-50 text-red-700"
    : "bg-emerald-50 text-emerald-700";
}

// ─── Date ─────────────────────────────────────────────────────────────────────

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const now = new Date();
  const target = new Date(iso);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(iso: string, withinDays = 180): boolean {
  return daysUntil(iso) <= withinDays && daysUntil(iso) >= 0;
}

// ─── Numbers ──────────────────────────────────────────────────────────────────

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
