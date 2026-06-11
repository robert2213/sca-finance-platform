import { NextResponse } from "next/server";
import { uploadHistory } from "@/lib/ingestion/upload-history.service";

// Reads the live in-memory store at request time — must not be statically
// cached at build, or it would serve a frozen empty list in production.
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/uploads  — Sprint 11A.2
 *
 * Returns the in-memory upload history, most recent first.
 *   { count, uploads }
 */
export async function GET() {
  const uploads = uploadHistory.listUploads(); // most recent first
  return NextResponse.json({ count: uploads.length, uploads });
}
