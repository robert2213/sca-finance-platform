import * as XLSX from "xlsx";
import type { RawRow } from "./types";

export interface ParsedFile {
  headers: string[];
  rows: RawRow[];
  parseErrors: string[];
}

/**
 * Parse an Excel file (.xlsx / .xls) from a Buffer.
 * Reads the first sheet and returns rows as key→value objects.
 * Dates are converted to ISO strings (XLSX stores them as serial numbers).
 */
export function parseExcel(buffer: Buffer): ParsedFile {
  const parseErrors: string[] = [];

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
  } catch (err) {
    return {
      headers: [],
      rows: [],
      parseErrors: [err instanceof Error ? err.message : "Failed to parse Excel file"],
    };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [], parseErrors: ["No sheets found in workbook"] };
  }

  const sheet = workbook.Sheets[sheetName];
  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  if (!raw.length) {
    return { headers: [], rows: [], parseErrors: ["Sheet is empty"] };
  }

  const headers = Object.keys(raw[0]).map((h) => String(h).trim());

  const rows: RawRow[] = raw.map((r) => {
    const out: RawRow = {};
    for (const key of Object.keys(r)) {
      const trimmed = String(key).trim();
      const val = r[key];
      if (val === null || val === undefined || val === "") {
        out[trimmed] = null;
      } else if (val instanceof Date) {
        out[trimmed] = val.toISOString().slice(0, 10); // YYYY-MM-DD
      } else {
        out[trimmed] = String(val).trim();
      }
    }
    return out;
  });

  return { headers, rows, parseErrors };
}
