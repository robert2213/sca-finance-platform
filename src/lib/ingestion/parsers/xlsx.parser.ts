import * as XLSX from "xlsx";
import type { ParseResult } from "./csv.parser";

export function parseXlsx(buffer: ArrayBuffer, sheetName?: string): ParseResult {
  const warnings: string[] = [];
  let workbook: XLSX.WorkBook;

  try {
    workbook = XLSX.read(buffer, { type: "array", cellText: true, cellDates: true });
  } catch (err) {
    return { rows: [], warnings: [`Failed to parse Excel file: ${err}`] };
  }

  const sheet = sheetName
    ? workbook.Sheets[sheetName]
    : workbook.Sheets[workbook.SheetNames[0]];

  if (!sheet) {
    warnings.push(`Sheet "${sheetName ?? workbook.SheetNames[0]}" not found.`);
    return { rows: [], warnings };
  }

  if (!sheetName && workbook.SheetNames.length > 1) {
    warnings.push(
      `Workbook has ${workbook.SheetNames.length} sheets; using "${workbook.SheetNames[0]}". Specify sheetName to use a different sheet.`
    );
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    defval: "",
    raw: false,
  });

  return { rows, warnings };
}
