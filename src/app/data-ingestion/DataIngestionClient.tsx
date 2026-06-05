"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import {
  Upload, FileText, CheckCircle2, AlertTriangle,
  XCircle, RefreshCw, Database, ChevronRight, X,
} from "lucide-react";
import type { IngestionResult, SourceSystem } from "@/lib/ingestion/types";

// ─── Source system config ─────────────────────────────────────────────────────

const SOURCE_SYSTEMS: { id: SourceSystem; label: string; description: string; icon: string }[] = [
  { id: "gl-export",     label: "GL Export",      description: "General ledger actuals export (CSV/Excel)", icon: "📊" },
  { id: "budget-export", label: "Budget Export",   description: "Annual plan or revised budget data",        icon: "📋" },
  { id: "payroll",       label: "Payroll",         description: "Payroll or labor cost export",              icon: "👥" },
  { id: "vendors",       label: "Vendor File",     description: "Vendor contracts and spend data",           icon: "🤝" },
  { id: "quickbooks",    label: "QuickBooks",      description: "QuickBooks GL or P&L export",               icon: "📒" },
  { id: "stripe",        label: "Stripe",          description: "Stripe billing or revenue export",          icon: "💳" },
  { id: "other",         label: "Other",           description: "Any structured financial CSV or Excel",     icon: "📁" },
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

export default function DataIngestionClient() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragging, setDragging]         = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceSystem, setSourceSystem] = useState<SourceSystem>("gl-export");
  const [uploading, setUploading]       = useState(false);
  const [progress, setProgress]         = useState(0);
  const [result, setResult]             = useState<IngestionResult | null>(null);
  const [error, setError]               = useState<string | null>(null);

  // ── Drag-and-drop handlers ─────────────────────────────────────────────────

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) acceptFile(file);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function acceptFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    if (!["csv", "xlsx", "xls"].includes(ext)) {
      setError(`Unsupported file type ".${ext}". Please upload a CSV or Excel file.`);
      return;
    }
    setSelectedFile(file);
    setResult(null);
    setError(null);
  }

  // ── Upload ─────────────────────────────────────────────────────────────────

  async function handleUpload() {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setResult(null);
    setError(null);

    // Simulate progress during upload (actual progress isn't available via fetch)
    const progressInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 8, 85));
    }, 150);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sourceSystem", sourceSystem);

      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data: IngestionResult = await response.json();
      setResult(data);

      if (data.success) {
        // Trigger Next.js server-side re-fetch for dashboard pages
        router.refresh();
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  }

  function reset() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Source system selector ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">1. Select Source System</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Choose the system this file was exported from so Nexora can apply the correct field mapping
          </p>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {SOURCE_SYSTEMS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSourceSystem(s.id)}
              className={clsx(
                "flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all",
                sourceSystem === s.id
                  ? "border-nexora-300 bg-nexora-50 ring-1 ring-nexora-400"
                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <span className="text-xl leading-none">{s.icon}</span>
              <p className={clsx(
                "text-xs font-bold leading-tight mt-0.5",
                sourceSystem === s.id ? "text-nexora-700" : "text-slate-800"
              )}>
                {s.label}
              </p>
              <p className="text-[10px] text-slate-400 leading-snug">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── File dropzone ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2 className="section-title">2. Upload File</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            CSV or Excel (.xlsx / .xls) · Max 50 MB
          </p>
        </div>
        <div className="p-5">
          {!selectedFile ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
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
                <p className="text-xs text-slate-400 mt-1">
                  Supports CSV, Excel (.xlsx, .xls)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) acceptFile(f);
                }}
              />
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
                  {selectedFile.name.split(".").pop()?.toUpperCase()}
                </p>
              </div>
              {!uploading && (
                <button
                  onClick={reset}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl bg-red-50 border border-red-100">
              <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Upload & progress ── */}
      {selectedFile && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">3. Run Ingestion Pipeline</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Source:{" "}
                <span className="font-semibold text-nexora-600">
                  {SOURCE_SYSTEMS.find((s) => s.id === sourceSystem)?.label}
                </span>{" "}
                · File:{" "}
                <span className="font-semibold text-slate-600">{selectedFile.name}</span>
              </p>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className={clsx(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                uploading
                  ? "bg-nexora-100 text-nexora-300 cursor-not-allowed"
                  : "bg-nexora-600 text-white hover:bg-nexora-700 shadow-sm shadow-nexora-200"
              )}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload & Ingest
                </>
              )}
            </button>
          </div>

          {/* Progress bar */}
          {(uploading || progress > 0) && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {progress < 20 ? "Parsing file..." :
                   progress < 50 ? "Mapping fields..." :
                   progress < 80 ? "Cleaning data..." :
                   progress < 100 ? "Writing to database..." :
                   "Complete!"}
                </span>
                <span className="font-bold text-nexora-600">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-300",
                    progress === 100 ? "bg-emerald-500" : "bg-nexora-500"
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4">
          {/* Status banner */}
          <div className={clsx(
            "rounded-2xl border p-5 flex items-start gap-4",
            result.success
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          )}>
            <div className={clsx(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              result.success ? "bg-emerald-100" : "bg-amber-100"
            )}>
              {result.success
                ? <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                : <AlertTriangle className="w-5 h-5 text-amber-600" />
              }
            </div>
            <div className="flex-1">
              <p className={clsx(
                "text-sm font-bold",
                result.success ? "text-emerald-800" : "text-amber-800"
              )}>
                {result.success ? "Ingestion Complete" : "Ingestion Completed with Warnings"}
              </p>
              <p className={clsx(
                "text-xs mt-0.5",
                result.success ? "text-emerald-600" : "text-amber-600"
              )}>
                {result.fileName} · {SOURCE_SYSTEMS.find((s) => s.id === result.sourceSystem)?.label} · {result.durationMs}ms
              </p>
            </div>
            <button
              onClick={reset}
              className={clsx(
                "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors shrink-0",
                result.success
                  ? "border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "border-amber-300 text-amber-700 hover:bg-amber-100"
              )}
            >
              Upload Another
            </button>
          </div>

          {/* Metrics row */}
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

          {/* Data quality log */}
          {result.qualityLog.length > 0 && (
            <div className="card overflow-hidden">
              <div className="card-header flex items-center justify-between">
                <div>
                  <h2 className="section-title">Data Quality Log</h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {result.qualityLog.length} cleaning actions applied
                  </p>
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

          {/* Errors */}
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

          {/* Dashboard refresh CTA */}
          {result.success && result.rowsProcessed > 0 && (
            <div className="rounded-2xl bg-gradient-to-r from-nexora-50 to-purple-50 border border-nexora-100 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-nexora-100 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-nexora-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-nexora-800">Dashboards Updated</p>
                <p className="text-xs text-nexora-600 mt-0.5">
                  {result.rowsProcessed.toLocaleString()} rows written to the database. All dashboard pages will reflect the new data on next load.
                </p>
              </div>
              <a
                href="/"
                className="flex items-center gap-1.5 text-xs font-bold text-nexora-700 hover:text-nexora-800 shrink-0"
              >
                View Dashboard
                <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
