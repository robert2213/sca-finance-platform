import { NextRequest, NextResponse } from "next/server";
import { financialStage } from "@/lib/ingestion/financial-stage.resolver";

// Reads the live stage at request time — must not be statically cached.
export const dynamic = "force-dynamic";

/**
 * GET /api/ingest/staged  — Sprint 11A.6
 *
 * Inspect the financial staging buffer (canonical records produced from validated
 * uploads). NO Databricks / fact_transactions reads — in-memory stage only.
 *
 *   GET /api/ingest/staged                    → { totalRecords, uploads: [{ uploadId, sourceType, sourceFile, count }] }
 *   GET /api/ingest/staged?uploadId=<id>      → { uploadId, count, records: [...] }
 */
export async function GET(request: NextRequest) {
  const uploadId = request.nextUrl.searchParams.get("uploadId");

  if (uploadId) {
    const records = await financialStage.getByUpload(uploadId);
    return NextResponse.json({ uploadId, count: records.length, records });
  }

  const [totalRecords, uploads] = await Promise.all([
    financialStage.count(),
    financialStage.listUploadSummaries(),
  ]);
  return NextResponse.json({ totalRecords, uploads });
}
