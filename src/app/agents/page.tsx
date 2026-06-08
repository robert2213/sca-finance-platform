import Link from "next/link";
import PageWrapper from "@/components/layout/PageWrapper";
import { agentRegistry } from "@/agents/registry";
import clsx from "clsx";

const colorMap: Record<string, { bg: string; border: string; text: string; cap: string }> = {
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200", text: "text-indigo-700",  cap: "bg-indigo-100"  },
  blue:    { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700",    cap: "bg-blue-100"    },
  purple:  { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-700",  cap: "bg-purple-100"  },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",   cap: "bg-amber-100"   },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-700", cap: "bg-emerald-100" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700",    cap: "bg-rose-100"    },
};

// Page-map: which detail page is associated with each agent
const detailPageMap: Record<string, string> = {
  cfo:              "/cfo",
  fpa:              "/fpa",
  procurement:      "/vendors",
  "external-labor": "/external-labor",
  headcount:        "/headcount",
  cio:              "/cio",
};

export default function AgentsPage() {
  return (
    <PageWrapper
      title="Agent Command Center"
      subtitle="6 specialized AI finance agents — each grounded in live financial data"
      badge="6 Active"
    >
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-nexora-800/40 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-nexora-950 via-nexora-900 to-indigo-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-nexora-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-8 py-8">
          <div className="flex items-start gap-6">
            <div className="shrink-0 text-4xl">🤖</div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white mb-2 tracking-tight">
                AI Finance Team
              </h2>
              <p className="text-nexora-200 text-sm leading-relaxed max-w-2xl">
                Each agent specializes in a distinct domain of IT Finance. Ask in natural language
                and get instant FP&amp;A-quality analysis grounded in your live financial data.
                Conversations are saved locally — pick up where you left off.
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Agents",          value: "6" },
              { label: "Response Time",   value: "<2s" },
              { label: "Conversation",    value: "Saved" },
              { label: "API Key",         value: "Not Required" },
              { label: "Finance Domains", value: "6" },
            ].map(pill => (
              <div key={pill.label} className="bg-nexora-800/50 border border-nexora-700/50 rounded-xl px-3 py-1.5 flex items-center gap-2">
                <p className="text-[10px] text-nexora-400 font-medium">{pill.label}</p>
                <p className="text-sm font-black text-nexora-200">{pill.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agent cards ───────────────────────────────────────────────────── */}
      <section className="mb-10">
        <div className="section-heading mb-6">
          <span className="section-heading-bar" />
          <span className="section-heading-text">Select an Agent to Open Workspace</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {agentRegistry.map(agent => {
            const c = colorMap[agent.color] ?? colorMap.indigo;
            return (
              <div key={agent.id} className="card-hover overflow-hidden flex flex-col group">
                {/* Colored top section */}
                <div className={clsx("px-5 pt-5 pb-4 border-b border-slate-100", c.bg)}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm border bg-white",
                      c.border
                    )}>
                      {agent.avatar}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-slate-500 font-semibold">Active</span>
                    </div>
                  </div>
                  <p className={clsx("font-black text-sm", c.text)}>{agent.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{agent.title}</p>
                </div>

                {/* Body */}
                <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1.5">
                    {agent.capabilities.map(cap => (
                      <span key={cap} className={clsx(
                        "text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        c.cap, c.border, c.text
                      )}>
                        {cap}
                      </span>
                    ))}
                  </div>

                  {/* Sample questions */}
                  <div className="space-y-1">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Try asking…</p>
                    {agent.suggestedQuestions.slice(0, 2).map((q, i) => (
                      <Link
                        key={i}
                        href={`/agents/${agent.id}?q=${encodeURIComponent(q)}`}
                        className="flex items-start gap-2 text-[11px] text-slate-600 hover:text-nexora-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors group/q"
                      >
                        <span className="text-slate-300 group-hover/q:text-nexora-400 shrink-0">→</span>
                        <span className="leading-snug">{q}</span>
                      </Link>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="mt-auto flex gap-2 pt-1">
                    <Link
                      href={`/agents/${agent.id}`}
                      className={clsx(
                        "flex-1 text-center text-sm font-bold rounded-xl px-4 py-2.5 transition-all duration-150",
                        "border shadow-sm",
                        c.cap, c.border, c.text,
                        "hover:shadow-md hover:scale-[1.01]"
                      )}
                    >
                      Open Workspace ↗
                    </Link>
                    <Link
                      href={detailPageMap[agent.id] ?? "/"}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-[11px] font-semibold hover:bg-slate-50 transition-colors shrink-0"
                      title="View data page"
                    >
                      Data
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section>
        <div className="section-heading mb-4">
          <span className="section-heading-bar" />
          <span className="section-heading-text">How the Workspace Works</span>
        </div>
        <div className="card overflow-hidden">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: "📂", title: "Grounded in Real Data",     desc: "Every response derives from your actual financial data — actuals, budget, forecast, headcount, vendors, and contractors.",        accent: "text-blue-600",    bg: "bg-blue-50"    },
                { icon: "🧠", title: "Domain Expertise",          desc: "Each agent carries deep FP&A and IT Finance logic. Ask about variance drivers, risk flags, forecast revisions, or vendor risk.", accent: "text-nexora-600", bg: "bg-nexora-50" },
                { icon: "💾", title: "Saved Conversations",       desc: "Your conversation history is stored locally in your browser. Navigate freely and return to any agent to continue where you left off.", accent: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: "🔌", title: "API-Ready",                 desc: "Switch from mock responses to Claude or GPT-4 by adding an API key to .env.local. Same interface, same data, real LLM reasoning.", accent: "text-purple-600",  bg: "bg-purple-50"  },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0", item.bg)}>
                    {item.icon}
                  </div>
                  <div>
                    <p className={clsx("font-bold text-sm mb-1", item.accent)}>{item.title}</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

    </PageWrapper>
  );
}
