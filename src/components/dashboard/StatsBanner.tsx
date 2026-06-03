import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getYTDActual, getYTDBudget, getYTDVariance } from "@/data/actuals";
import { getTotalCloudYTD } from "@/data/cloudSpend";
import { getTotalContractorYTDSpend } from "@/data/externalLabor";
import { getHeadcountSummary } from "@/data/headcount";
import { generateRiskFlags } from "@/lib/riskEngine";
import clsx from "clsx";

interface StatItem {
  label: string;
  value: string;
  sub?: string;
  status: "good" | "warn" | "bad" | "neutral";
}

export default function StatsBanner() {
  const ytdActual  = getYTDActual();
  const ytdBudget  = getYTDBudget();
  const ytdVar     = getYTDVariance();
  const ytdVarPct  = ytdBudget > 0 ? ytdVar / ytdBudget : 0;
  const cloudYTD   = getTotalCloudYTD();
  const extLabor   = getTotalContractorYTDSpend();
  const hc         = getHeadcountSummary();
  const risks      = generateRiskFlags();
  const critCount  = risks.filter(r => r.severity === "critical").length;

  const stats: StatItem[] = [
    {
      label:  "YTD IT Spend",
      value:  formatCurrency(ytdActual, true),
      sub:    `${ytdVar > 0 ? "+" : ""}${formatPercent(ytdVarPct)} vs. budget`,
      status: ytdVar > 0 ? "bad" : "good",
    },
    {
      label:  "Cloud Spend",
      value:  formatCurrency(cloudYTD, true),
      sub:    "AWS · Azure · GCP",
      status: "warn",
    },
    {
      label:  "External Labor",
      value:  formatCurrency(extLabor, true),
      sub:    "12 contractors YTD",
      status: "warn",
    },
    {
      label:  "Headcount",
      value:  `${hc.filled} / ${hc.total}`,
      sub:    `${hc.open} open reqs`,
      status: hc.open > 5 ? "warn" : "good",
    },
    {
      label:  "Critical Risks",
      value:  String(critCount),
      sub:    `${risks.length} total flags`,
      status: critCount > 0 ? "bad" : "good",
    },
  ];

  const statusDot: Record<string, string> = {
    good:    "bg-emerald-500",
    warn:    "bg-amber-400",
    bad:     "bg-red-500",
    neutral: "bg-slate-300",
  };
  const statusText: Record<string, string> = {
    good:    "text-emerald-600",
    warn:    "text-amber-600",
    bad:     "text-red-600",
    neutral: "text-slate-400",
  };

  return (
    <div className="flex items-stretch gap-px bg-slate-200 rounded-2xl overflow-hidden border border-slate-200 shadow-sm mb-8">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="flex-1 bg-white px-4 py-3 flex flex-col gap-0.5 min-w-0 hover:bg-slate-50/80 transition-colors"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", statusDot[stat.status])} />
            <p className="label truncate">{stat.label}</p>
          </div>
          <p className="text-lg font-black text-slate-900 leading-none truncate">{stat.value}</p>
          {stat.sub && (
            <p className={clsx("text-[10px] font-semibold mt-0.5 truncate", statusText[stat.status])}>
              {stat.sub}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
