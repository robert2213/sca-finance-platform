import Papa from "papaparse";
import type { RawRow } from "./types";

export interface ParsedFile {
  headers: string[];
  rows: RawRow[];
  parseErrors: string[];
}

/** Parse a CSV Buffer or string into rows of raw key→value objects. */
export function parseCsv(content: string | Buffer): ParsedFile {
  const input = Buffer.isBuffer(content) ? content.toString("utf-8") : content;
  const parseErrors: string[] = [];

  // Papa.parse with header:true returns ParseResult<Record<string,string>>
  const result = Papa.parse<Record<string, string>>(input, {
    header: true,
    skipEmptyLines: true,
    // Trim all values
    transform: (value: string) => value.trim(),
  });

  if (result.errors?.length) {
    for (const e of result.errors) {
      const row = e.row != null ? `Row ${e.row}: ` : "";
      parseErrors.push(`${row}${e.message}`);
    }
  }

  // Trim header names
  const rawFields = result.meta?.fields ?? [];
  const headers = rawFields.map((h) => h.trim());

  const rows: RawRow[] = result.data.map((row) => {
    const out: RawRow = {};
    for (let i = 0; i < rawFields.length; i++) {
      const trimmedKey = headers[i];
      const val = row[rawFields[i]];
      out[trimmedKey] = val === "" || val === undefined ? null : val;
    }
    return out;
  });

  return { headers, rows, parseErrors };
}
