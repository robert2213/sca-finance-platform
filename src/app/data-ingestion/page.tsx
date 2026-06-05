import PageWrapper from "@/components/layout/PageWrapper";
import StatsBanner from "@/components/dashboard/StatsBanner";
import { getConnectionMode } from "@/lib/databricks";
import DataIngestionClient from "./DataIngestionClient";

function SectionHeader({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="section-heading">
      <span className="section-heading-bar" />
      <span className="section-heading-text">
        {label}
        {sub && <span className="section-heading-sub">{sub}</span>}
      </span>
    </div>
  );
}

export default function DataIngestionPage() {
  const mode = getConnectionMode();

  return (
    <PageWrapper
      title="Data Ingestion"
      subtitle="Upload CSV or Excel files to populate Databricks Delta tables"
      badge="Pipeline"
    >
      <StatsBanner />

      {/* Connection mode notice */}
      <div className={`mb-6 rounded-2xl border px-5 py-3.5 flex items-center gap-3 ${
        mode === "databricks"
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
      }`}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${
          mode === "databricks" ? "bg-emerald-500" : "bg-amber-400 animate-pulse"
        }`} />
        <p className={`text-xs font-medium ${
          mode === "databricks" ? "text-emerald-700" : "text-amber-700"
        }`}>
          {mode === "databricks"
            ? "Connected to Databricks — uploaded data writes to Delta Lake tables."
            : "Running in local mode (SQLite) — no Databricks credentials set. Add DATABRICKS_HOST, DATABRICKS_TOKEN, and DATABRICKS_HTTP_PATH to .env.local to connect to Databricks."}
        </p>
      </div>

      <section>
        <SectionHeader
          label="Upload & Ingest Financial Data"
          sub="CSV, Excel — GL exports, payroll, vendors, QuickBooks, Stripe"
        />
        <DataIngestionClient />
      </section>

      {/* Pipeline reference */}
      <section className="mt-8">
        <SectionHeader label="Pipeline Reference" sub="What happens when you upload a file" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { step: "1", label: "Parse",    desc: "CSV / Excel parsed into rows",         color: "bg-blue-50 border-blue-100 text-blue-700" },
            { step: "2", label: "Map",      desc: "Fields mapped to Nexora data model",   color: "bg-nexora-50 border-nexora-100 text-nexora-700" },
            { step: "3", label: "Clean",    desc: "Dates, amounts, dupes, anomalies",     color: "bg-purple-50 border-purple-100 text-purple-700" },
            { step: "4", label: "Write",    desc: "MERGE into fact_transactions / dims",  color: "bg-emerald-50 border-emerald-100 text-emerald-700" },
            { step: "5", label: "Refresh",  desc: "Dashboard pages reload live data",     color: "bg-amber-50 border-amber-100 text-amber-700" },
          ].map((s) => (
            <div key={s.step} className={`rounded-xl border p-4 ${s.color.split(" ").slice(1).join(" ")} bg-white`}>
              <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black mb-2 ${s.color}`}>
                {s.step}
              </div>
              <p className="text-xs font-bold text-slate-800">{s.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Supported schemas */}
      <section className="mt-8">
        <SectionHeader label="Supported Delta Tables" sub="Data model populated by the ingestion pipeline" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { table: "fact_transactions",  desc: "All actuals, budgets, and forecasts by cost center and period" },
            { table: "dim_vendor",         desc: "Vendor contracts, spend, risk level, and renewal dates" },
            { table: "dim_cost_center",    desc: "Cost center master — name, BU, owner" },
            { table: "dim_contractor",     desc: "External labor engagements and burn rates" },
            { table: "dim_headcount",      desc: "Position roster, fill status, and salary budgets" },
            { table: "data_quality_log",   desc: "Audit trail of all cleaning actions per ingestion run" },
          ].map((t) => (
            <div key={t.table} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-white">
              <div className="w-2 h-2 rounded-full bg-nexora-500 shrink-0 mt-1.5" />
              <div>
                <p className="text-xs font-bold text-slate-800 font-mono">{t.table}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  );
}
