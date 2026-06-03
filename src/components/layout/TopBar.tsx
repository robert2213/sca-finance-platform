"use client";

interface TopBarProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onMenuClick?: () => void;
}

export default function TopBar({ title, subtitle, badge, onMenuClick }: TopBarProps) {
  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
      {/* Left: Hamburger (mobile) + Title */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
          aria-label="Open menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[17px] font-bold text-slate-900 leading-tight truncate">{title}</h1>
            {badge && (
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-nexora-100 text-nexora-700 text-[10px] font-bold uppercase tracking-wider border border-nexora-200">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-slate-400 leading-tight truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right: Status indicators */}
      <div className="flex items-center gap-2 shrink-0 ml-4">
        {/* Period */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[11px] font-semibold text-slate-600">YTD May 2026</span>
        </div>

        {/* Last updated */}
        <div className="hidden lg:block text-[11px] text-slate-400">
          Updated <span className="text-slate-600 font-semibold">Jun 2, 2026</span>
        </div>

        {/* AI status */}
        <div className="flex items-center gap-1.5 bg-nexora-50 border border-nexora-100 rounded-xl px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-nexora-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-nexora-700">6 Agents</span>
        </div>
      </div>
    </header>
  );
}
