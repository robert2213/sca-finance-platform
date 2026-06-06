"use client";

import React, { useEffect, useRef } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import clsx from "clsx";
import {
  Database,
  Cpu,
  Layers,
  LayoutDashboard,
  Bot,
  Target,
  Clock,
  Eye,
  Zap,
  CheckCircle2,
  Briefcase,
  BarChart3,
  Users,
  UploadCloud,
  AlertTriangle,
  FileText,
  Package,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Stage {
  n: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  items: string[];
  type: "chips" | "agents" | "outcomes";
  connector?: string;
  databricks?: boolean;
}

interface ImpactCard {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface Persona {
  icon: React.ElementType;
  title: string;
  desc: string;
}

interface WorkflowStep {
  n: number;
  icon: React.ElementType;
  title: string;
  desc: string;
  databricks?: boolean;
}

// ── Static data ───────────────────────────────────────────────────────────────

const STAGES: Stage[] = [
  {
    n: 1,
    icon: Database,
    title: "Financial Data Sources",
    desc: "Financial information enters the platform from your existing operational and financial systems — no manual data entry required.",
    items: ["ERP Systems", "QuickBooks", "NetSuite", "Stripe", "Payroll Systems", "Excel / CSV Uploads", "Vendor Data", "Procurement Systems"],
    type: "chips",
    connector: "Raw financial data",
  },
  {
    n: 2,
    icon: Cpu,
    title: "Data Integration & Intelligence Engine",
    desc: "Data is automatically consolidated, validated, and structured into a single trusted financial model — eliminating reconciliation work.",
    items: ["Automated Validation", "Data Cleansing", "Financial Transformation", "Model Standardization", "Anomaly Detection", "Audit Trail"],
    type: "chips",
    databricks: true,
    connector: "Validated, structured data",
  },
  {
    n: 3,
    icon: Layers,
    title: "Financial Intelligence Layer",
    desc: "Every financial dimension is organized into a unified analytical framework — actuals, budget, forecast, and workforce data in one place.",
    items: ["Budget & Plan", "Actuals", "Forecast", "Headcount & Labor", "Vendor & Procurement", "KPI Models"],
    type: "chips",
    connector: "Unified financial model",
  },
  {
    n: 4,
    icon: LayoutDashboard,
    title: "Nexora Analytics Platform",
    desc: "Decision-makers gain real-time visibility into financial performance across every business unit and spend category.",
    items: ["Executive Dashboard", "Variance Analysis", "Risk Monitoring", "KPI Tracking", "Spend Analysis", "Forecast Workbench"],
    type: "chips",
    connector: "Performance analytics",
  },
  {
    n: 5,
    icon: Bot,
    title: "Finance Decision Support Agents",
    desc: "Specialized finance agents analyze performance, risk, spend, and workforce data to surface decision-ready insights before leaders have to search for them.",
    items: ["CFO Agent", "FP&A Agent", "Procurement Agent", "Headcount Agent", "External Labor Agent", "Finance Business Partner"],
    type: "agents",
    connector: "AI-generated insights",
  },
  {
    n: 6,
    icon: Target,
    title: "Executive Outcomes",
    desc: "Leadership receives actionable intelligence — not raw data — enabling faster decisions with greater confidence.",
    items: ["Executive Commentary", "Board Reporting", "Monthly Reporting Packages", "Risk Identification", "Recommended Actions", "Decision Support"],
    type: "outcomes",
  },
];

const AGENT_EMOJIS: Record<string, string> = {
  "CFO Agent":                "🏦",
  "FP&A Agent":               "📊",
  "Procurement Agent":        "🛒",
  "Headcount Agent":          "👥",
  "External Labor Agent":     "🔧",
  "Finance Business Partner": "🤝",
};

const IMPACT: ImpactCard[] = [
  {
    icon: Clock,
    title: "Reduce Monthly Reporting Effort",
    desc: "Decrease time spent gathering, reconciling, and formatting financial data by 50–80% through automated data preparation and reporting workflows.",
  },
  {
    icon: Eye,
    title: "Improve Financial Visibility",
    desc: "Give finance and executive leaders a centralized, real-time view of performance against budget, forecast, spend, headcount, and vendor activity.",
  },
  {
    icon: Zap,
    title: "Surface Variances Faster",
    desc: "Identify budget risks, spend drivers, and forecast concerns in seconds instead of waiting for month-end reporting cycles.",
  },
  {
    icon: CheckCircle2,
    title: "Support Better Decisions",
    desc: "Turn financial data into executive commentary, recommended actions, and decision-ready insights for leadership review.",
  },
];

const PERSONAS: Persona[] = [
  {
    icon: Briefcase,
    title: "Chief Financial Officer",
    desc: "Full-company financial visibility, forecast accuracy tracking, risk exposure monitoring, and board-ready reporting — without waiting on manual report cycles.",
  },
  {
    icon: BarChart3,
    title: "FP&A & Finance Directors",
    desc: "Automated variance analysis, multi-cycle reforecast support, spend driver identification, and executive commentary generation at the click of a button.",
  },
  {
    icon: Users,
    title: "Finance Business Partners",
    desc: "Department-level budget vs. actual tracking, headcount cost visibility, vendor spend governance, and real-time KPI monitoring by business unit.",
  },
];

// ── Scroll reveal hook ────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("arch-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.08 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}

// ── Flow connector ────────────────────────────────────────────────────────────

function FlowConnector({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center py-0.5" aria-hidden="true">
      {/* Upper track */}
      <div className="relative w-px h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="arch-flow-slug" />
      </div>

      {/* Label pill */}
      <div className="flex items-center gap-1.5 px-3 py-1 my-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <span className="w-1.5 h-1.5 rounded-full bg-nexora-500 animate-pulse shrink-0" />
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {label}
        </span>
      </div>

      {/* Lower track */}
      <div className="relative w-px h-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="arch-flow-slug" style={{ animationDelay: "1s" }} />
      </div>

      {/* Arrow tip */}
      <div
        className="w-0 h-0"
        style={{
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "5px solid #cbd5e1",
        }}
      />
    </div>
  );
}

// ── Stage items ───────────────────────────────────────────────────────────────

function StageItems({ items, type }: { items: string[]; type: Stage["type"] }) {
  if (type === "agents") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl
                       bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600
                       hover:bg-nexora-50 dark:hover:bg-nexora-900/30
                       hover:border-nexora-200 dark:hover:border-nexora-700
                       hover:-translate-y-0.5 transition-all duration-150 cursor-default"
          >
            <span className="text-base leading-none shrink-0">
              {AGENT_EMOJIS[item] ?? "🤖"}
            </span>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (type === "outcomes") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
                       bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40
                       hover:bg-emerald-100 dark:hover:bg-emerald-900/40
                       hover:border-emerald-200 dark:hover:border-emerald-700
                       hover:-translate-y-0.5 transition-all duration-150 cursor-default"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-[12px] font-semibold text-emerald-800 dark:text-emerald-300 leading-tight">
              {item}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // default: chips
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-[12px] font-medium px-3 py-1.5 rounded-lg
                     bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600
                     text-slate-600 dark:text-slate-300
                     hover:bg-nexora-50 dark:hover:bg-nexora-900/30
                     hover:border-nexora-200 dark:hover:border-nexora-700
                     hover:text-nexora-700 dark:hover:text-nexora-300
                     transition-all duration-150 cursor-default select-none"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

// ── Stage card ────────────────────────────────────────────────────────────────

function StageCard({ stage, delay }: { stage: Stage; delay: number }) {
  const ref = useReveal();
  const Icon = stage.icon;

  return (
    <div ref={ref} className="arch-reveal" style={{ transitionDelay: `${delay}s` }}>
      <div
        className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                   shadow-sm hover:shadow-md hover:border-nexora-200 dark:hover:border-nexora-700
                   hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
      >
        {/* Left accent stripe */}
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-nexora-400 via-nexora-500 to-nexora-600" />

        {/* Header */}
        <div className="pl-6 pr-5 py-5 border-b border-slate-100 dark:border-slate-700/80">
          <div className="flex items-start gap-3">
            {/* Step badge */}
            <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-nexora-100 dark:bg-nexora-900/60 border border-nexora-200 dark:border-nexora-700 flex items-center justify-center">
              <span className="text-[10px] font-black text-nexora-600 dark:text-nexora-400 tabular-nums">
                {String(stage.n).padStart(2, "0")}
              </span>
            </div>

            {/* Icon + title + description */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2.5 flex-wrap mb-1.5">
                <div className="w-8 h-8 rounded-lg bg-nexora-50 dark:bg-nexora-900/40 border border-nexora-100 dark:border-nexora-800 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-nexora-600 dark:text-nexora-400" />
                </div>
                <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-tight pt-0.5 flex-1">
                  {stage.title}
                </h3>
                {stage.databricks && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 whitespace-nowrap self-start mt-0.5">
                    Powered by Databricks
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="pl-6 pr-5 py-4">
          <StageItems items={stage.items} type={stage.type} />
        </div>
      </div>
    </div>
  );
}

// ── Business impact section ───────────────────────────────────────────────────

function ImpactSection() {
  const ref = useReveal();

  return (
    <div ref={ref} className="arch-reveal mb-14">
      <div className="section-heading">
        <span className="section-heading-bar" />
        <span className="section-heading-text">
          Business Impact
          <span className="section-heading-sub">What Nexora delivers to finance leadership</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {IMPACT.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                         shadow-sm p-6 flex items-start gap-4
                         hover:shadow-md hover:border-nexora-200 dark:hover:border-nexora-700
                         hover:-translate-y-0.5 transition-all duration-200"
              style={{ transitionDelay: `${i * 0.05}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-nexora-50 dark:bg-nexora-900/40 border border-nexora-100 dark:border-nexora-800 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-nexora-600 dark:text-nexora-400" />
              </div>
              <div className="min-w-0">
                <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {card.title}
                </h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Personas section ──────────────────────────────────────────────────────────

function PersonasSection() {
  const ref = useReveal();

  return (
    <div ref={ref} className="arch-reveal">
      <div className="section-heading">
        <span className="section-heading-bar" />
        <span className="section-heading-text">
          Built for Finance Leadership
          <span className="section-heading-sub">Nexora serves every layer of the finance organization</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PERSONAS.map((persona, i) => {
          const Icon = persona.icon;
          return (
            <div
              key={persona.title}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700
                         shadow-sm p-6 text-center
                         hover:shadow-md hover:border-nexora-200 dark:hover:border-nexora-700
                         hover:-translate-y-0.5 transition-all duration-200"
              style={{ transitionDelay: `${i * 0.08}s` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-nexora-50 dark:bg-nexora-900/40 border border-nexora-100 dark:border-nexora-800 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-nexora-600 dark:text-nexora-400" />
              </div>
              <h4 className="text-[14px] font-bold text-slate-900 dark:text-slate-100 mb-2">
                {persona.title}
              </h4>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {persona.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Example workflow data ─────────────────────────────────────────────────────

const WORKFLOW: WorkflowStep[] = [
  {
    n: 1,
    icon: UploadCloud,
    title: "QuickBooks / ERP Export",
    desc: "Financial data is imported from accounting, ERP, payroll, procurement, or spreadsheet sources.",
  },
  {
    n: 2,
    icon: Cpu,
    title: "Databricks Processing",
    desc: "Data is validated, cleaned, transformed, and structured into a trusted financial model.",
    databricks: true,
  },
  {
    n: 3,
    icon: Layers,
    title: "Financial Model Standardization",
    desc: "Actuals, budget, forecast, vendor, labor, and headcount data are aligned into a unified analytical framework.",
  },
  {
    n: 4,
    icon: AlertTriangle,
    title: "Variance & Risk Detection",
    desc: "The platform identifies budget pressure, spend drivers, forecast risk, and emerging financial issues automatically.",
  },
  {
    n: 5,
    icon: Bot,
    title: "Finance Agent Review",
    desc: "Specialized finance agents interpret results and generate business context without requiring manual analysis.",
  },
  {
    n: 6,
    icon: FileText,
    title: "Executive Commentary",
    desc: "Nexora converts analysis into leadership-ready narrative, variance explanations, and recommended actions.",
  },
  {
    n: 7,
    icon: Package,
    title: "Monthly Reporting Package",
    desc: "Finance leaders receive dashboards, commentary, risk summaries, and complete reporting outputs — ready to present.",
  },
];

// ── Workflow connector ────────────────────────────────────────────────────────

function WorkflowConnector() {
  return (
    <>
      {/* Desktop: right arrow with gradient line */}
      <div className="hidden md:flex items-center shrink-0 px-0.5" aria-hidden="true">
        <div className="h-px w-5 bg-gradient-to-r from-slate-200 to-nexora-200 dark:from-slate-700 dark:to-nexora-700" />
        <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 -ml-px shrink-0" />
      </div>
      {/* Mobile: down arrow */}
      <div className="flex md:hidden justify-center py-1" aria-hidden="true">
        <ChevronDown className="w-4 h-4 text-slate-300 dark:text-slate-600" />
      </div>
    </>
  );
}

// ── Workflow card ─────────────────────────────────────────────────────────────

function WorkflowCard({ step }: { step: WorkflowStep }) {
  const Icon = step.icon;
  return (
    <div
      className={clsx(
        "relative flex-shrink-0 w-full md:w-44 rounded-2xl border shadow-sm p-4",
        "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-default",
        step.databricks
          ? "bg-nexora-50/50 dark:bg-nexora-900/20 border-nexora-200 dark:border-nexora-700"
          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-nexora-200 dark:hover:border-nexora-700"
      )}
    >
      {/* Step badge */}
      <span className="absolute top-3 left-3 text-[10px] font-black text-slate-400 dark:text-slate-500 tabular-nums leading-none">
        {String(step.n).padStart(2, "0")}
      </span>

      {/* Icon */}
      <div className="flex justify-center mt-5 mb-3">
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center border",
            step.databricks
              ? "bg-nexora-100 dark:bg-nexora-900/50 border-nexora-200 dark:border-nexora-700"
              : "bg-nexora-50 dark:bg-nexora-900/40 border-nexora-100 dark:border-nexora-800"
          )}
        >
          <Icon className="w-5 h-5 text-nexora-600 dark:text-nexora-400" />
        </div>
      </div>

      {/* Title */}
      <h5 className="text-[12px] font-bold text-slate-900 dark:text-slate-100 text-center mb-1.5 leading-tight">
        {step.title}
      </h5>

      {/* Description */}
      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed text-center line-clamp-3">
        {step.desc}
      </p>

      {/* Databricks trust signal */}
      {step.databricks && (
        <div className="mt-2 flex justify-center">
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-nexora-100 dark:bg-nexora-900/50 text-nexora-600 dark:text-nexora-400 border border-nexora-200 dark:border-nexora-700 whitespace-nowrap">
            Powered by Databricks
          </span>
        </div>
      )}
    </div>
  );
}

// ── Workflow section ──────────────────────────────────────────────────────────

function WorkflowSection() {
  const ref = useReveal();

  return (
    <div ref={ref} className="arch-reveal mb-14">
      <div className="section-heading">
        <span className="section-heading-bar" />
        <span className="section-heading-text">
          Example Workflow
          <span className="section-heading-sub">How raw financial data becomes executive-ready reporting</span>
        </span>
      </div>

      {/* Horizontal scroll on desktop, vertical stack on mobile */}
      <div className="overflow-x-auto -mx-1 px-1 pb-2">
        <div className="flex flex-col md:flex-row md:items-start md:min-w-max gap-0">
          {WORKFLOW.map((step, i) => (
            <React.Fragment key={step.n}>
              <WorkflowCard step={step} />
              {i < WORKFLOW.length - 1 && <WorkflowConnector />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ArchitecturePage() {
  return (
    <PageWrapper
      title="System Architecture"
      subtitle="Nexora Finance Command Center — from raw financial data to executive decision support"
      badge="Platform"
    >
      {/* Hero */}
      <div className="text-center mb-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2 leading-tight tracking-tight">
          Nexora Finance Command Center{" "}
          <span className="gradient-text">Architecture</span>
        </h2>
        <p className="text-[14px] text-slate-500 dark:text-slate-400">
          From Raw Financial Data to Executive Decision Support
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-2">
          Nexora connects fragmented financial data to dashboards, AI-assisted analysis, and executive reporting workflows.
        </p>
      </div>

      {/* Flow diagram */}
      <div className="max-w-3xl mx-auto mb-14">
        {STAGES.map((stage, i) => (
          <div key={stage.n}>
            <StageCard stage={stage} delay={i * 0.06} />
            {stage.connector && <FlowConnector label={stage.connector} />}
          </div>
        ))}
      </div>

      {/* Business Impact */}
      <ImpactSection />

      {/* Example Workflow */}
      <WorkflowSection />

      {/* Finance Leadership personas */}
      <PersonasSection />
    </PageWrapper>
  );
}
