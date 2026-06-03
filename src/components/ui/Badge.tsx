import clsx from "clsx";
import type { RiskSeverity } from "@/types/finance";

interface BadgeProps {
  label: string;
  variant?: RiskSeverity | "success" | "neutral";
  size?: "sm" | "md";
}

const variantMap: Record<string, string> = {
  critical: "badge-critical",
  warning:  "badge-warning",
  info:     "badge-info",
  success:  "badge-success",
  neutral:  "bg-slate-100 text-slate-600 border border-slate-200",
};

export default function Badge({ label, variant = "neutral", size = "sm" }: BadgeProps) {
  return (
    <span className={clsx(
      "inline-flex items-center rounded-full font-semibold",
      size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1",
      variantMap[variant]
    )}>
      {label}
    </span>
  );
}
