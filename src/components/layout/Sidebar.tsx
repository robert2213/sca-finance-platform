"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Bot,
  TrendingUp,
  BarChart3,
  ShoppingCart,
  HardHat,
  Users,
  Lightbulb,
  X,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  sublabel?: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "critical" | "warning" | "info" | "success";
}

const nav: NavItem[] = [
  { href: "/",               label: "Dashboard",     sublabel: "Executive overview",  icon: LayoutDashboard },
  { href: "/agents",         label: "AI Agents",     sublabel: "6 finance agents",    icon: Bot,   badge: "6", badgeVariant: "info" },
  { href: "/cfo",            label: "CFO Summary",   sublabel: "Executive narrative",  icon: TrendingUp },
  { href: "/fpa",            label: "FP&A Variance", sublabel: "Budget vs. actuals",  icon: BarChart3 },
  { href: "/vendors",        label: "Vendor Spend",  sublabel: "Contracts & risk",    icon: ShoppingCart },
  { href: "/external-labor", label: "Ext. Labor",    sublabel: "Contractor spend",    icon: HardHat, badge: "4!", badgeVariant: "warning" },
  { href: "/headcount",      label: "Headcount",     sublabel: "Workforce planning",  icon: Users },
  { href: "/cio",            label: "CIO Briefing",  sublabel: "IT leadership view",  icon: Lightbulb },
];

const badgeColors: Record<string, string> = {
  critical: "bg-red-500 text-white",
  warning:  "bg-amber-500 text-white",
  info:     "bg-nexora-500 text-white",
  success:  "bg-emerald-500 text-white",
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    onClose?.();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          "fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col z-30",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <div className="px-5 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nexora-500 to-nexora-700 flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-sm tracking-tight">N</span>
            </div>
            <div>
              <p className="font-black text-slate-900 text-sm leading-tight tracking-tight">Nexora</p>
              <p className="text-[10px] text-slate-400 leading-tight font-medium">AI Finance Dept.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="label px-3 pb-3">Navigation</p>
          {nav.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx("nav-link group relative", active && "nav-link-active")}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/50 rounded-r-full -ml-3" />
                )}

                <span
                  className={clsx(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </span>

                <div className="flex-1 min-w-0">
                  <p className="leading-tight text-[13px] font-semibold truncate">{item.label}</p>
                  {item.sublabel && (
                    <p className={clsx(
                      "text-[10px] leading-tight truncate mt-0.5",
                      active ? "text-white/60" : "text-slate-400"
                    )}>
                      {item.sublabel}
                    </p>
                  )}
                </div>

                {item.badge && (
                  <span
                    className={clsx(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none shrink-0",
                      active
                        ? "bg-white/25 text-white"
                        : badgeColors[item.badgeVariant ?? "info"]
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="px-4 py-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexora-100 to-nexora-200 flex items-center justify-center text-nexora-700 font-bold text-xs shrink-0">
              IT
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">IT Finance Team</p>
              <p className="text-[10px] text-slate-400 truncate">FP&amp;A · Finance Partner</p>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-r from-nexora-50 to-purple-50 border border-nexora-100 px-3 py-2.5 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-nexora-500 animate-pulse shrink-0" />
            <div>
              <p className="text-[11px] text-nexora-700 font-semibold">AI Mode: Mock</p>
              <p className="text-[10px] text-nexora-400">No API key required</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
            <span>YTD May 2026</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Live
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
