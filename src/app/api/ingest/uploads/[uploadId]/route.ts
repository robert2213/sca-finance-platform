import { NextRequest, NextResponse } from "next/server";
import { uploadHistory } from "@/lib/ingestion/upload-history.service";

// Reads the live in-memory store at request time (dynamic segment already
// forces on-demand rendering; declared explicitly for intent/no caching).
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/uploads/[uploadId]  — Sprint 11A.2
 *
 * Returns the full staging record for one upload, or 404 if unknown.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { uploadId: string } }
) {
  const record = uploadHistory.getUpload(params.uploadId);
  if (!record) {
    return NextResponse.json(
      { error: `Upload "${params.uploadId}" not found` },
      { status: 404 }
    );
  }
  return NextResponse.json(record);
}
