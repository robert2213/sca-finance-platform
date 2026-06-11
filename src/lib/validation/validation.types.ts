export interface ValidationError {
  row?: number;
  field?: string;
  value?: string;
  message: string;
}

export interface ValidationWarning {
  row?: number;
  field?: string;
  value?: string;
  message: string;
}

export interface ValidationResult {
  dataType: string;
  period: string;
  rowsProcessed: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  passed: boolean;             // true when errors.length === 0
}
