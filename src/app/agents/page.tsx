import PageWrapper from "@/components/layout/PageWrapper";
import AgentCard from "@/components/agents/AgentCard";
import StatsBanner from "@/components/dashboard/StatsBanner";
import { agentRegistry } from "@/agents/registry";

export default function AgentsPage() {
  return (
    <PageWrapper
      title="Agent Command Center"
      subtitle="6 specialized AI agents — each grounded in live financial data"
      badge="6 Active"
    >
      <StatsBanner />

      {/* Hero banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 border border-nexora-800/40 shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-nexora-950 via-nexora-900 to-indigo-950" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-nexora-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-8 py-8 flex items-center gap-8">
          <div className="text-5xl shrink-0">🤖</div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
              Nexora AI Finance Team
            </h2>
            <p className="text-nexora-200 text-sm leading-relaxed max-w-2xl">
              Each agent specializes in a distinct domain of IT Finance. Ask them natural-language questions
              and receive instant, FP&A-quality analysis grounded in your actual financial data.
              Currently running on{" "}
              <span className="text-nexora-300 font-semibold">mock AI responses</span> — add an API key
              to unlock live Claude or GPT-4 reasoning.
            </p>
          </div>
          <div className="shrink-0 hidden lg:block">
            <div className="grid grid-cols-3 gap-2">
              {agentRegistry.map(a => (
                <div key={a.id} className="w-10 h-10 rounded-xl bg-nexora-800/60 border border-nexora-700/50 flex items-center justify-center text-xl" title={a.name}>
                  {a.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stat pills */}
        <div className="relative px-8 pb-6 flex flex-wrap gap-3">
          {[
            { label: "Agents", value: "6" },
            { label: "Data Points", value: "168+" },
            { label: "Response Time", value: "<2s" },
            { label: "API Key Required", value: "No" },
            { label: "Finance Domains", value: "6" },
          ].map(pill => (
            <div key={pill.label} className="bg-nexora-800/50 border border-nexora-700/50 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <p className="text-[10px] text-nexora-500 font-medium">{pill.label}</p>
              <p className="text-sm font-black text-nexora-200">{pill.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {agentRegistry.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* How it works */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">How Nexora AI Agents Work</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Architecture · Data flow · Upgrade path</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "📂",
                title: "Grounded in Real Data",
                desc: "Every response is derived from your actual financial data — actuals, budget, forecast, headcount, vendors, and contractors. No hallucinations, no generic output.",
                accent: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                icon: "🧠",
                title: "Domain Expertise Built-In",
                desc: "Each agent carries deep FP&A and IT Finance logic. Ask about variance drivers, risk flags, forecast revisions, or vendor negotiations and get a professional answer.",
                accent: "text-nexora-600",
                bg: "bg-nexora-50",
              },
              {
                icon: "🔌",
                title: "API-Ready Architecture",
                desc: "Switch from mock responses to Claude or GPT-4 by adding an API key to .env.local. Same interface, same data, same UX — just real LLM reasoning powering the answers.",
                accent: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map(item => (
              <div key={item.title} className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center text-xl shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`font-bold text-sm mb-1 ${item.accent}`}>{item.title}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
