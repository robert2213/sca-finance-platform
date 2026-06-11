import Papa from "papaparse";

export interface ParseResult {
  rows: Record<string, string>[];
  warnings: string[];
}

export function parseCsvString(csv: string): ParseResult {
  const warnings: string[] = [];
  const result = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h: string) => h.trim(),
    transform: (value: string) => value.trim(),
  });
  result.errors.forEach((e) =>
    warnings.push(`Row ${e.row ?? "?"}: ${e.message}`)
  );
  return { rows: result.data, warnings };
}

export async function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const warnings: string[] = [];
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim(),
      transform: (value: string) => value.trim(),
      complete(result) {
        result.errors.forEach((e) =>
          warnings.push(`Row ${e.row ?? "?"}: ${e.message}`)
        );
        resolve({ rows: result.data, warnings });
      },
    });
  });
}
