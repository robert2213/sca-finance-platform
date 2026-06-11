import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getKPIBundle } from "@/lib/services/kpi.service";
import clsx from "clsx";

interface StatItem {
  label: string;
  value: string;
  sub?: string;
  status: "good" | "warn" | "bad" | "neutral";
}

export default async function StatsBanner({ clientId }: { clientId?: string }) {
  const bundle = await getKPIBundle(clientId);

  const stats: StatItem[] = [
    {
      label:  "YTD IT Spend",
      value:  formatCurrency(bundle.ytdActual, true),
      sub:    `${bundle.ytdVariance > 0 ? "+" : ""}${formatPercent(bundle.ytdVariancePct)} vs. budget`,
      status: bundle.ytdVariance > 0 ? "bad" : "good",
    },
    {
      label:  "Cloud Spend",
      value:  bundle.cloudActual > 0 ? formatCurrency(bundle.cloudActual, true) : "—",
      sub:    "AWS · Azure · GCP",
      status: bundle.cloudActual > bundle.cloudBudget ? "warn" : "good",
    },
    {
      label:  "External Labor",
      value:  formatCurrency(bundle.externalLaborActual, true),
      sub:    `${bundle.contractorCount} contractors YTD`,
      status: bundle.externalLaborActual > bundle.externalLaborBudget ? "warn" : "good",
    },
    {
      label:  "Headcount",
      value:  `${bundle.headcountFilled} / ${bundle.headcountTotal}`,
      sub:    `${bundle.openReqs} open reqs`,
      status: bundle.openReqs > 5 ? "warn" : "good",
    },
    {
      label:  "Critical Risks",
      value:  String(bundle.riskCount),
      sub:    `${bundle.totalRiskCount} total flags`,
      status: bundle.riskCount > 0 ? "bad" : "good",
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
