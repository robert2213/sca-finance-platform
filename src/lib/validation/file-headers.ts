// Header-row extraction for file-structure validation (Sprint 11A.3).
//
// The semantic-stack parsers (parsers/*) return data rows keyed by header, which
// collapses duplicate columns into a single object key. File-structure
// validation needs the RAW header row (order and duplicates preserved), so we
// read just the first row here. This module is the only file-validation code
// that touches the raw bytes; the validators themselves are pure functions over
// the extracted headers/rows so they stay trivially unit-testable.

import Papa from "papaparse";
import * as XLSX from "xlsx";

/** Raw header names from CSV text (order + duplicates + blanks preserved, trimmed). */
export function extractCsvHeaders(csvText: string): string[] {
  const result = Papa.parse<string[]>(csvText, { preview: 1, skipEmptyLines: true });
  const first = Array.isArray(result.data?.[0]) ? (result.data[0] as string[]) : [];
  return first.map((h) => String(h ?? "").trim());
}

/** Raw header names from the first (or named) sheet of an XLSX buffer. */
export function extractXlsxHeaders(buffer: ArrayBuffer, sheetName?: string): string[] {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return [];
  }
  const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });
  const first = Array.isArray(rows?.[0]) ? (rows[0] as unknown[]) : [];
  return first.map((h) => String(h ?? "").trim());
}
