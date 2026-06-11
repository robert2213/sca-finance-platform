import type { FileValidationIssue } from "../file-validation.types";

/** File extensions the upload pipeline can parse. Single source of truth. */
export const SUPPORTED_EXTENSIONS = ["csv", "xlsx", "xls", "xlsm"] as const;

/** Lowercased extension (no dot) of a filename, or "" if it has none. */
export function getExtension(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

/**
 * Map a filename to the parser family, or null if the extension is unsupported.
 * The upload route uses this for parse routing so the supported set lives in
 * exactly one place.
 */
export function classifyFileType(fileName: string): "csv" | "xlsx" | null {
  const ext = getExtension(fileName);
  if (ext === "csv") return "csv";
  if (ext === "xlsx" || ext === "xls" || ext === "xlsm") return "xlsx";
  return null;
}

/** Error when the file extension is missing or unsupported. */
export function validateUnsupportedFile(fileName: string): FileValidationIssue[] {
  const ext = getExtension(fileName);

  if (!ext) {
    return [{
      validator: "unsupported-file",
      severity: "error",
      message: `File "${fileName}" has no extension. Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}.`,
    }];
  }

  if (!(SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)) {
    return [{
      validator: "unsupported-file",
      severity: "error",
      message: `Unsupported file type ".${ext}". Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}.`,
      column: ext,
    }];
  }

  return [];
}
