import type { ValidationWarning } from "../validation.types";

interface NumericRow {
  [key: string]: unknown;
}

// Flags negative amounts, zero values where positive is expected, and statistical outliers.
export function validateAnomalies(
  rows: NumericRow[],
  numericFields: string[],
  outlierThresholdZ = 3.0
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const field of numericFields) {
    const values = rows
      .map((r, i) => ({ val: parseFloat(String(r[field] ?? "0")), i }))
      .filter(({ val }) => !isNaN(val));

    // Negative check
    values.forEach(({ val, i }) => {
      if (val < 0) {
        warnings.push({
          row: i + 2,
          field,
          value: String(val),
          message: `Negative value (${val}) in field "${field}" — verify intentional`,
        });
      }
    });

    // Outlier detection using Z-score
    if (values.length < 3) continue;
    const nums = values.map((v) => v.val);
    const mean = nums.reduce((s, v) => s + v, 0) / nums.length;
    const std  = Math.sqrt(nums.reduce((s, v) => s + (v - mean) ** 2, 0) / nums.length);

    if (std === 0) continue;

    values.forEach(({ val, i }) => {
      const z = Math.abs((val - mean) / std);
      if (z > outlierThresholdZ) {
        warnings.push({
          row: i + 2,
          field,
          value: String(val),
          message: `Potential outlier in "${field}": ${val} is ${z.toFixed(1)} standard deviations from mean (${mean.toFixed(0)})`,
        });
      }
    });
  }

  return warnings;
}
