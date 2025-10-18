// Error handling types and enums

export const ErrorType = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR'
} as const;

export type ErrorType = typeof ErrorType[keyof typeof ErrorType];

export interface AppError {
  type: ErrorType;
  message: string;
  details?: any;
  code?: string;
  field?: string; // for validation errors
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Error state management
export interface ErrorState {
  globalError: AppError | null;
  formErrors: FormErrors;
  isLoading: boolean;
}

export interface ErrorActions {
  setGlobalError: (error: AppError | null) => void;
  setFormErrors: (errors: FormErrors) => void;
  setFieldError: (field: string, message: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
  setLoading: (loading: boolean) => void;
}