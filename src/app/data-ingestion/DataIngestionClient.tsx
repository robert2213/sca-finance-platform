"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Upload, FileText, CheckCircle2, AlertTriangle,
  XCircle, RefreshCw, Database, ChevronRight, X,
  Plug, FileUp, Zap, BookOpen, ShoppingCart,
  Building2, Globe, Users, ChevronDown,
} from "lucide-react";
import type { IngestionResult, SourceSystem } from "@/lib/ingestion/types";

// ─── Data types ───────────────────────────────────────────────────────────────

type DataType = {
  id: string;
  label: string;
  description: string;
  example: string;
  icon: string;
  sourceSystem: SourceSystem;
};

const DATA_TYPES: DataType[] = [
  {
    id: "actuals",
    label: "Actuals & Transactions",
    description: "Real spend that has already occurred",
    example: "Monthly GL export, invoice records, purchase history",
    icon: "💸",
    sourceSystem: "gl-export",
  },
  {
    id: "budget",
    label: "Budget & Plan",
    description: "Approved spending plan or revised forecast",
    example: "Annual budget, quarterly reforecast, revised plan",
    icon: "📋",
    sourceSystem: "budget-export",
  },
  {
    id: "vendors",
    label: "Vendor Contracts",
    description: "Vendor master with contract values and renewal dates",
    example: "Procurement register, contract tracker",
    icon: "🤝",
    sourceSystem: "vendors",
  },
  {
    id: "headcount",
    label: "Headcount & Workforce",
    description: "Position roster — filled roles and open requisitions",
    example: "HRIS export, org chart data, open req list",
    icon: "👥",
    sourceSystem: "headcount",
  },
  {
    id: "contractors",
    label: "External Labor & Contractors",
    description: "Contractor engagements, SOWs, and burn rates",
    example: "Staffing agency roster, contractor spend tracker",
    icon: "🧑‍💻",
    sourceSystem: "contractors",
  },
];

// Optional source system hint for field mapping
type SourceHint = { id: SourceSystem; label: string };
const SOURCE_HINTS: SourceHint[] = [
  { id: "gl-export",     label: "Generic / Internal"  },
  { id: "quickbooks",    label: "QuickBooks"          },
  { id: "stripe",        label: "Stripe"              },
  { id: "other",         label: "Square"              },
  { id: "gl-export",     label: "SAP"                 },
  { id: "gl-export",     label: "NetSuite"            },
];

// Connected sources (coming soon)
const CONNECTED_SOURCES = [
  { id: "stripe",     label: "Stripe",      desc: "Pull billing & revenue events",   icon: <Zap className="w-4 h-4" /> },
  { id: "quickbooks", label: "QuickBooks",  desc: "Sync GL, P&L, and AP/AR",         icon: <BookOpen className="w-4 h-4" /> },
  { id: "square",     label: "Square",      desc: "Import payment and sales data",   icon: <ShoppingCart className="w-4 h-4" /> },
  { id: "sap",        label: "SAP",         desc: "Connect to SAP ERP modules",      icon: <Building2 className="w-4 h-4" /> },
  { id: "netsuite",   label: "NetSuite",    desc: "Sync from NetSuite financials",   icon: <Globe className="w-4 h-4" /> },
  { id: "salesforce", label: "Salesforce",  desc: "Pull CRM and revenue pipeline",   icon: <Users className="w-4 h-4" /> },
];

const ACTION_LABELS: Record<string, string> = {
  date_standardized:       "Date standardized",
  vendor_normalized:       "Vendor name normalized",
  duplicate_removed:       "Duplicate removed",
  null_amount_filled:      "Null amount set to 0",
  negative_flagged:        "Negative amount flagged",
  anomaly_flagged:         "Anomaly flagged",
  parse_error:             "Parse error",
  missing_required_field:  "Missing required field",
};

const ACTION_COLORS: Record<string, string> = {
  date_standardized:       "text-blue-600 bg-blue-50 border-blue-100",
  vendor_normalized:       "text-nexora-600 bg-nexora-50 border-nexora-100",
  duplicate_removed:       "text-amber-600 bg-amber-50 border-amber-100",
  null_amount_filled:      "text-slate-500 bg-slate-50 border-slate-100",
  negative_flagged:        "text-orange-600 bg-orange-50 border-orange-100",
  anomaly_flagged:         "text-red-600 bg-red-50 border-red-100",
  parse_error:             "text-red-700 bg-red-50 border-red-200",
  missing_required_field:  "text-red-700 bg-red-50 border-red-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

type Method = "connected" | "import";

export default function DataIngestionClient() {
  const router      = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Selection
  const [method,      setMethod]      = useState<Method | null>(null);
  const [dataType,    setDataType]    = useState<DataType | null>(null);
  const [sourceHintIdx, setSourceHintIdx] = useState(0); // index into SOURCE_HINTS

  // File / upload
  const [dragging,     setDragging]     = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading,    setUploading]    = useState(false);
  const [progress,     setProgress]     = useState(0);
  const [result,       setResult]       = useState<IngestionResult | null>(null);
  const [fileError,    setFileError]    = useState<string | null>(null);

  // The actual sourceSystem sent to the API — data type wins; source hint overrides
  // for actuals only (since the hint is about column-name format, not data category)
  function getSourceSystem(): SourceSystem {
    if (!dataType) return "other";
    // For actuals, let the source hint influence field mapping
    if (dataType.id === "actuals") return SOURCE_HINTS[sourceHintIdx].id;
    return dataType.sourceSystem;
  }

  // ── Drag / drop ────────────────────────────────────────────────────────────
  const onDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(true);  }, []);
  const onDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragging(false); }, []);
  const onDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) acceptFile(f);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function acceptFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setFileError(`"${ext.toUpperCase()}" isn't supported yet. Upload a CSV or Excel file.`);
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setFileError(null);
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true); setProgress(0); setResult(null); setFileError(null);

    const tick = setInterval(() => setProgress((p) => Math.min(p + 8, 85)), 150);
    try {
      const fd = new FormData();
      fd.append("file", selectedFile);
      fd.append("sourceSystem", getSourceSystem());
      const res  = await fetch("/api/ingest", { method: "POST", body: fd });
      clearInterval(tick); setProgress(100);
      const data: IngestionResult = await res.json();
      setResult(data);
      if (data.success) router.refresh();
    } catch (err) {
      clearInterval(tick);
      setFileError(err instanceof Error ? err.message : "Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setMethod(null); setDataType(null); setSourceHintIdx(0);
    setSelectedFile(null); setResult(null); setFileError(null); setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function back() {
    if (result || selectedFile) {
      setSelectedFile(null); setResult(null); setFileError(null); setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } else if (dataType) {
      setDataType(null);
    } else {
      setMethod(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Back link */}
      {method && !result && (
        <button onClick={back}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors font-medium">
          ← Back
        </button>
      )}

      {/* ── STEP 1: Choose method ── */}
      {!method && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="section-title">How would you like to bring in data?</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Connect directly via API or upload a file from any source</p>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Connected Source */}
            <button onClick={() => setMethod("connected")}
              className="flex flex-col items-start gap-4 p-6 rounded-xl border border-slate-200 bg-white
                         hover:border-violet-200 hover:bg-violet-50/30 text-left transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center">
                  <Plug className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-violet-700">Connected Source</p>
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wide">Live API sync</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Authenticate once and pull data directly — Stripe, QuickBooks, Square, SAP, NetSuite, Salesforce.
                No file exports needed.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Stripe","QuickBooks","SAP","NetSuite"].map(s => (
                  <span key={s} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{s}</span>
                ))}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-400">+2 more</span>
              </div>
            </button>

            {/* Import File */}
            <button onClick={() => setMethod("import")}
              className="flex flex-col items-start gap-4 p-6 rounded-xl border border-nexora-200 bg-nexora-50/20
                         hover:bg-nexora-50/60 text-left transition-all group ring-1 ring-nexora-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-nexora-100 border border-nexora-200 flex items-center justify-center">
                  <FileUp className="w-5 h-5 text-nexora-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 group-hover:text-nexora-700">Import File</p>
                  <span className="text-[10px] font-bold text-nexora-500 uppercase tracking-wide">CSV · Excel</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Upload any financial file — exported from QuickBooks, Stripe, SAP, or built
                manually in Excel. Nexora maps the columns automatically.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["Transactions","Budget","Vendors","Headcount","Contractors"].map(t => (
                  <span key={t} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-nexora-100 text-nexora-600">{t}</span>
                ))}
              </div>
            </button>

          </div>
        </div>
      )}

      {/* ── STEP 1b: Connected Source — coming soon ── */}
      {method === "connected" && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="section-title">Connected Sources</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live API integrations — authenticate once, pull data on demand
            </p>
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CONNECTED_SOURCES.map((s) => (
              <div key={s.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/60 opacity-60 cursor-not-allowed">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600">{s.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{s.desc}</p>
                  <span className="mt-1.5 inline-block text-[9px] font-bold text-slate-400 uppercase tracking-wider border border-slate-200 rounded-full px-2 py-0.5">
                    Coming soon
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 pb-5 pt-1">
            <p className="text-[11px] text-slate-400 text-center">
              Direct integrations are coming.{" "}
              <button onClick={() => setMethod("import")} className="text-nexora-600 font-semibold hover:underline">
                Import a file instead →
              </button>
            </p>
          </div>
        </div>
      )}

      {/* ── STEP 2: What kind of data? ── */}
      {method === "import" && !dataType && (
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2 className="section-title">What kind of data are you importing?</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tells Nexora which table to populate and how to interpret the amounts
            </p>
          </div>
          <div className="p-5 space-y-2">
            {DATA_TYPES.map((dt) => (
              <button key={dt.id} onClick={() => setDataType(dt)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white
                           hover:border-nexora-300 hover:bg-nexora-50/30 text-left transition-all group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-xl">
                  {dt.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-nexora-700">{dt.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dt.description}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 italic">{dt.example}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-nexora-400 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 3: Upload ── */}
      {method === "import" && dataType && !result && (
        <div className="card overflow-hidden">
          <div className="card-header flex items-start justify-between gap-4">
            <div>
              <h2 className="section-title">
                <span className="mr-1.5">{dataType.icon}</span>
                {dataType.label}
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{dataType.description}</p>
            </div>
            {/* Source hint — only surfaced for actuals where column names vary */}
            {dataType.id === "actuals" && (
              <div className="shrink-0 flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Exported from</span>
                <div className="relative">
                  <select
                    value={sourceHintIdx}
                    onChange={(e) => setSourceHintIdx(Number(e.target.value))}
                    className="appearance-none text-[11px] font-semibold text-slate-600 bg-slate-50 border border-slate-200
                               rounded-lg pl-2.5 pr-6 py-1 cursor-pointer hover:border-slate-300 focus:outline-none"
                  >
                    {SOURCE_HINTS.map((h, i) => (
                      <option key={i} value={i}>{h.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="p-5">
            {!selectedFile ? (
              <div
                onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={clsx(
                  "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed",
                  "cursor-pointer transition-all duration-200 py-14 px-6 text-center",
                  dragging
                    ? "border-nexora-400 bg-nexora-50 scale-[1.01]"
                    : "border-slate-200 bg-slate-50/60 hover:border-nexora-300 hover:bg-nexora-50/30"
                )}
              >
                <div className={clsx(
                  "w-14 h-14 rounded-2xl flex items-center justify-center transition-colors",
                  dragging ? "bg-nexora-100" : "bg-white border border-slate-200"
                )}>
                  <Upload className={clsx("w-6 h-6", dragging ? "text-nexora-600" : "text-slate-400")} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {dragging ? "Drop it here" : "Drag & drop or click to browse"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">CSV · Excel (.xlsx, .xls) · Max 50 MB</p>
                </div>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) acceptFile(f); }} />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="w-12 h-12 rounded-xl bg-nexora-50 border border-nexora-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-nexora-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(0)} KB ·{" "}
                    {selectedFile.name.split(".").pop()?.toUpperCase()} · {dataType.label}
                  </p>
                </div>
                {!uploading && (
                  <button onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {fileError && (
              <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
                <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{fileError}</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="border-t border-slate-100 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-slate-500">
                  Ready to import{" "}
                  <span className="font-semibold text-slate-700">{selectedFile.name}</span>
                </p>
                {(uploading || progress > 0) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-slate-400">
                      {progress < 20 ? "Parsing file…" :
                       progress < 50 ? "Mapping fields…" :
                       progress < 80 ? "Cleaning data…" :
                       progress < 100 ? "Writing to database…" : "Complete!"}
                    </p>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-48">
                      <div className={clsx("h-full rounded-full transition-all duration-300",
                        progress === 100 ? "bg-emerald-500" : "bg-nexora-500")}
                        style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <button onClick={handleUpload} disabled={uploading}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0",
                  uploading
                    ? "bg-nexora-100 text-nexora-300 cursor-not-allowed"
                    : "bg-nexora-600 text-white hover:bg-nexora-700 shadow-sm shadow-nexora-200"
                )}>
                {uploading
                  ? <><RefreshCw className="w-4 h-4 animate-spin" /> Processing…</>
                  : <><Upload className="w-4 h-4" /> Import File</>
                }
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4">
          <div className={clsx(
            "rounded-2xl border p-5 flex items-start gap-4",
            result.success ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
          )}>
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              result.success ? "bg-emerald-100" : "bg-amber-100")}>
              {result.success
                ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            </div>
            <div className="flex-1">
              <p className={clsx("text-sm font-bold",
                result.success ? "text-emerald-800" : "text-amber-800")}>
                {result.success ? "Import Complete" : "Import Completed with Warnings"}
              </p>
              <p className={clsx("text-xs mt-0.5",
                result.success ? "text-emerald-600" : "text-amber-600")}>
                {result.fileName} · {dataType?.label} · {result.durationMs}ms
              </p>
            </div>
            <button onClick={reset}
              className={clsx("text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors shrink-0",
                result.success
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "border-amber-300 text-amber-700 hover:bg-amber-100")}>
              Import Another
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Rows Received",  value: result.rowsReceived,  color: "text-slate-700",   bg: "bg-white" },
              { label: "Rows Processed", value: result.rowsProcessed, color: "text-emerald-700", bg: "bg-emerald-50" },
              { label: "Rows Flagged",   value: result.rowsFlagged,   color: "text-amber-700",   bg: "bg-amber-50" },
              { label: "Rows Skipped",   value: result.rowsSkipped,   color: "text-slate-500",   bg: "bg-slate-50" },
            ].map((m) => (
              <div key={m.label} className={clsx("rounded-xl border border-slate-100 p-4 text-center", m.bg)}>
                <p className={clsx("text-2xl font-black", m.color)}>{m.value.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">{m.label}</p>
              </div>
            ))}
          </div>

          {result.qualityLog.length > 0 && (
            <div className="card overflow-hidden">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h2 className="section-title">Data Quality Log</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">{result.qualityLog.length} cleaning actions applied</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <Database className="w-3.5 h-3.5" />
                  Logged to data_quality_log
                </div>
              </div>
              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {result.qualityLog.map((entry, i) => (
                  <div key={i} className="px-5 py-2.5 flex items-start gap-3">
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 mt-0.5",
                      ACTION_COLORS[entry.action] ?? "text-slate-500 bg-slate-50 border-slate-100"
                    )}>
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </span>
                    <p className="text-xs text-slate-500 flex-1">{entry.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors.filter(Boolean).length > 0 && (
            <div className="card overflow-hidden">
              <div className="card-header">
                <h2 className="section-title text-red-700">Errors</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {result.errors.filter(Boolean).map((err, i) => (
                  <div key={i} className="px-5 py-2.5 flex items-start gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600">{err}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.success && result.rowsProcessed > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-nexora-50 to-purple-50 border border-nexora-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-nexora-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-nexora-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-nexora-800">Dashboards Updated</p>
                <p className="text-xs text-nexora-600 mt-0.5">
                  {result.rowsProcessed.toLocaleString()} rows written. All dashboard pages will reflect the new data on next load.
                </p>
              </div>
              <a href="/" className="flex items-center gap-1.5 text-xs font-bold text-nexora-700 hover:text-nexora-800 shrink-0">
                View Dashboard <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
