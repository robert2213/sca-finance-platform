import type { FileValidationIssue } from "../file-validation.types";

/**
 * Error when the file has no usable content: either no header row at all, or a
 * header row with zero data rows beneath it. Both block the pipeline — there is
 * nothing to map, validate, or stage.
 */
export function validateEmptyFile(headers: string[], rowCount: number): FileValidationIssue[] {
  const hasHeaders = headers.some((h) => h.trim() !== "");

  if (!hasHeaders && rowCount === 0) {
    return [{
      validator: "empty-file",
      severity: "error",
      message: "File is empty — no header row and no data rows were found.",
    }];
  }

  if (rowCount === 0) {
    return [{
      validator: "empty-file",
      severity: "error",
      message: "File has a header row but no data rows.",
    }];
  }

  return [];
}
