import { NextResponse } from "next/server";
import { uploadHistory } from "@/lib/ingestion/upload-history.resolver";

// Reads the live store at request time — must not be statically cached at
// build, or it would serve a frozen list in production.
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/uploads  — Sprint 11A.2 (durable store in 11A.4)
 *
 * Returns the active upload history (Databricks-backed when configured, else
 * in-memory), most recent first.
 *   { count, uploads }
 */
export async function GET() {
  const uploads = await uploadHistory.listUploads(); // most recent first
  return NextResponse.json({ count: uploads.length, uploads });
}
