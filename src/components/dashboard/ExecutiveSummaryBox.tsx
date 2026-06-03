interface ExecutiveSummaryBoxProps {
  agentName: string;
  agentAvatar: string;
  summary: string;
  keyPoints: string[];
}

export default function ExecutiveSummaryBox({
  agentName,
  agentAvatar,
  summary,
  keyPoints,
}: ExecutiveSummaryBoxProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-nexora-800/60 shadow-lg">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-nexora-950 via-nexora-900 to-indigo-950" />

      {/* Decorative orbs */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-nexora-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        {/* Header */}
        <div className="px-6 py-4 border-b border-nexora-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nexora-600/70 border border-nexora-500/50 flex items-center justify-center text-xl shadow-sm">
              {agentAvatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{agentName}</p>
              <p className="text-[10px] text-nexora-400 font-medium">AI-Generated Executive Summary</p>
            </div>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-nexora-800/60 border border-nexora-700/50 rounded-xl px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-nexora-300 font-semibold">Live</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-[13px] text-nexora-100 leading-relaxed mb-5 font-light">
            {summary}
          </p>

          {/* Key points */}
          <div className="space-y-2.5">
            <p className="text-[9px] font-bold text-nexora-500 uppercase tracking-widest mb-3">
              Key Points
            </p>
            {keyPoints.map((point, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-md bg-nexora-700/60 border border-nexora-600/50 flex items-center justify-center text-[8px] font-black text-nexora-300 shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <p className="text-[11px] text-nexora-300 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-nexora-800/50 flex items-center justify-between">
          <p className="text-[10px] text-nexora-600">
            Powered by Nexora AI · Mock mode · No data leaves your browser
          </p>
          <p className="text-[10px] text-nexora-600">YTD May 2026</p>
        </div>
      </div>
    </div>
  );
}
