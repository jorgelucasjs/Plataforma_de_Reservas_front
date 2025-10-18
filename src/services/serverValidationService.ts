import { ErrorType } from '../types/error';

export interface ServerValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ServerErrorResponse {
  success: false;
  message: string;
  errors?: ServerValidationError[];
  code?: string;
  type?: ErrorType;
}

export class ServerValidationService {
  /**
   * Parse server validation errors from API response
   */
  static parseServerErrors(error: any): Record<string, string> {
    const fieldErrors: Record<string, string> = {};

    // Handle different error response formats
    if (error?.response?.data) {
      const data = error.response.data;

      // Format 1: { errors: [{ field: 'email', message: 'Email already exists' }] }
      if (Array.isArray(data.errors)) {
        data.errors.forEach((err: ServerValidationError) => {
          if (err.field && err.message) {
            fieldErrors[err.field] = err.message;
          }
        });
      }

      // Format 2: { errors: { email: 'Email already exists', password: 'Too weak' } }
      if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
        Object.entries(data.errors).forEach(([field, message]) => {
          if (typeof message === 'string') {
            fieldErrors[field] = message;
          }
        });
      }

      // Format 3: { message: 'Validation failed', details: { email: ['Email already exists'] } }
      if (data.details && typeof data.details === 'object') {
        Object.entries(data.details).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            fieldErrors[field] = messages[0];
          } else if (typeof messages === 'string') {
            fieldErrors[field] = messages;
          }
        });
      }

      // Format 4: Single field error in message
      if (data.message && data.field) {
        fieldErrors[data.field] = data.message;
      }
    }

    return fieldErrors;
  }

  /**
   * Map server error codes to user-friendly messages
   */
  static mapErrorCodeToMessage(code: string, field?: string): string {
    const errorMessages: Record<string, string> = {
      // Authentication errors
      'AUTH_INVALID_CREDENTIALS': 'Invalid email/NIF or password',
      'AUTH_USER_NOT_FOUND': 'User not found',
      'AUTH_ACCOUNT_LOCKED': 'Account is temporarily locked',
      'AUTH_TOKEN_EXPIRED': 'Session expired. Please log in again',
      'AUTH_TOKEN_INVALID': 'Invalid session. Please log in again',

      // Registration errors
      'REG_EMAIL_EXISTS': 'Email address is already registered',
      'REG_NIF_EXISTS': 'NIF is already registered',
      'REG_INVALID_NIF': 'Invalid NIF format',
      'REG_WEAK_PASSWORD': 'Password is too weak',

      // Service errors
      'SERVICE_NAME_EXISTS': 'A service with this name already exists',
      'SERVICE_NOT_FOUND': 'Service not found',
      'SERVICE_UNAUTHORIZED': 'You are not authorized to modify this service',
      'SERVICE_INVALID_PRICE': 'Invalid service price',

      // Booking errors
      'BOOKING_INSUFFICIENT_BALANCE': 'Insufficient balance for this booking',
      'BOOKING_SERVICE_UNAVAILABLE': 'Service is no longer available',
      'BOOKING_ALREADY_EXISTS': 'You have already booked this service',
      'BOOKING_NOT_FOUND': 'Booking not found',
      'BOOKING_CANNOT_CANCEL': 'This booking cannot be cancelled',

      // Profile errors
      'PROFILE_EMAIL_EXISTS': 'Email address is already in use',
      'PROFILE_INVALID_DATA': 'Invalid profile data',

      // General validation errors
      'VALIDATION_REQUIRED': `${field || 'Field'} is required`,
      'VALIDATION_INVALID_FORMAT': `${field || 'Field'} has invalid format`,
      'VALIDATION_TOO_SHORT': `${field || 'Field'} is too short`,
      'VALIDATION_TOO_LONG': `${field || 'Field'} is too long`,
      'VALIDATION_INVALID_RANGE': `${field || 'Field'} is out of valid range`,

      // Network errors
      'NETWORK_ERROR': 'Network connection error. Please check your internet connection',
      'SERVER_ERROR': 'Server error. Please try again later',
      'TIMEOUT_ERROR': 'Request timeout. Please try again',
    };

    return errorMessages[code] || 'An unexpected error occurred';
  }

  /**
   * Handle server validation errors and return formatted field errors
   */
  static handleServerValidationError(error: any): {
    fieldErrors: Record<string, string>;
    generalError?: string;
  } {
    const fieldErrors = this.parseServerErrors(error);
    let generalError: string | undefined;

    // If no field-specific errors, create a general error message
    if (Object.keys(fieldErrors).length === 0) {
      if (error?.response?.data?.code) {
        generalError = this.mapErrorCodeToMessage(error.response.data.code);
      } else if (error?.response?.data?.message) {
        generalError = error.response.data.message;
      } else if (error?.message) {
        generalError = error.message;
      } else {
        generalError = 'An unexpected error occurred. Please try again.';
      }
    }

    return { fieldErrors, generalError };
  }

  /**
   * Check if error is a validation error (400 status)
   */
  static isValidationError(error: any): boolean {
    return error?.response?.status === 400 || error?.response?.data?.type === ErrorType.VALIDATION_ERROR;
  }

  /**
   * Check if error is an authentication error (401 status)
   */
  static isAuthenticationError(error: any): boolean {
    return error?.response?.status === 401 || error?.response?.data?.type === ErrorType.AUTHENTICATION_ERROR;
  }

  /**
   * Check if error is an authorization error (403 status)
   */
  static isAuthorizationError(error: any): boolean {
    return error?.response?.status === 403 || error?.response?.data?.type === ErrorType.AUTHORIZATION_ERROR;
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: any): boolean {
    return !error?.response || error?.code === 'NETWORK_ERROR' || error?.code === 'ECONNABORTED';
  }

  /**
   * Get user-friendly error message for display
   */
  static getUserFriendlyErrorMessage(error: any): string {
    if (this.isNetworkError(error)) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    if (this.isAuthenticationError(error)) {
      return 'Authentication failed. Please check your credentials and try again.';
    }

    if (this.isAuthorizationError(error)) {
      return 'You do not have permission to perform this action.';
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.message) {
      return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  /**
   * Create validation error for insufficient balance
   */
  static createInsufficientBalanceError(serviceName: string, servicePrice: number, userBalance: number): ServerValidationError {
    const shortfall = servicePrice - userBalance;
    return {
      field: 'balance',
      message: `Insufficient balance. You need €${shortfall.toFixed(2)} more to book "${serviceName}".`,
      code: 'BOOKING_INSUFFICIENT_BALANCE',
    };
  }

  /**
   * Create validation error for duplicate service name
   */
  static createDuplicateServiceNameError(serviceName: string): ServerValidationError {
    return {
      field: 'name',
      message: `A service named "${serviceName}" already exists. Please choose a different name.`,
      code: 'SERVICE_NAME_EXISTS',
    };
  }

  /**
   * Create validation error for invalid price
   */
  static createInvalidPriceError(price: number): ServerValidationError {
    return {
      field: 'price',
      message: `Price €${price.toFixed(2)} is invalid. Price must be between €0.01 and €10,000.00.`,
      code: 'SERVICE_INVALID_PRICE',
    };
  }
}