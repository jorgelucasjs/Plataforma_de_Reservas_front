import { ToastService } from './toastService';
import { ServerValidationService } from './serverValidationService';
import { ErrorType } from '../types/error';

export interface GlobalError {
  id: string;
  message: string;
  type: ErrorType;
  timestamp: Date;
  context?: any;
  stack?: string;
  handled: boolean;
}

class GlobalErrorService {
  private errors: GlobalError[] = [];
  private maxErrors = 50; // Keep last 50 errors
  private listeners: Array<(error: GlobalError) => void> = [];

  /**
   * Report an error to the global error system
   */
  reportError(
    error: Error | string,
    type: ErrorType = ErrorType.INTERNAL_ERROR,
    context?: any,
    handled = false
  ): string {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const globalError: GlobalError = {
      id: errorId,
      message: typeof error === 'string' ? error : error.message,
      type,
      timestamp: new Date(),
      context,
      stack: typeof error === 'object' ? error.stack : undefined,
      handled,
    };

    // Add to error list
    this.errors.unshift(globalError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(globalError);
      } catch (err) {
        console.error('Error in global error listener:', err);
      }
    });

    // Log to console
    console.error(`[GlobalError ${errorId}]`, {
      message: globalError.message,
      type: globalError.type,
      context: globalError.context,
      stack: globalError.stack,
    });

    // Show user notification for unhandled errors
    if (!handled) {
      this.showUserNotification(globalError);
    }

    return errorId;
  }

  /**
   * Handle network errors with retry mechanism
   */
  handleNetworkError(
    error: any,
    retryFn?: () => Promise<any>,
    maxRetries = 3
  ): Promise<any> {
    const isNetworkError = ServerValidationService.isNetworkError(error);
    
    if (isNetworkError && retryFn && maxRetries > 0) {
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await retryFn();
            resolve(result);
          } catch (retryError) {
            if (maxRetries > 1) {
              // Try again with reduced retry count
              resolve(this.handleNetworkError(retryError, retryFn, maxRetries - 1));
            } else {
              // Final failure
              this.reportError(
                retryError instanceof Error ? retryError : new Error(String(retryError)),
                ErrorType.NETWORK_ERROR,
                { originalError: error, retriesAttempted: 3 - maxRetries }
              );
              reject(retryError);
            }
          }
        }, 1000 * (4 - maxRetries)); // Exponential backoff: 1s, 2s, 3s
      });
    } else {
      // Not a network error or no retry function
      this.reportError(error, isNetworkError ? ErrorType.NETWORK_ERROR : ErrorType.INTERNAL_ERROR);
      return Promise.reject(error);
    }
  }

  /**
   * Handle API errors with appropriate user feedback
   */
  handleApiError(error: any, context?: any): {
    fieldErrors: Record<string, string>;
    generalError?: string;
    errorId: string;
  } {
    const errorId = this.reportError(error, ErrorType.INTERNAL_ERROR, context, true);
    
    if (ServerValidationService.isValidationError(error)) {
      const { fieldErrors, generalError } = ServerValidationService.handleServerValidationError(error);
      return { fieldErrors, generalError, errorId };
    }

    if (ServerValidationService.isAuthenticationError(error)) {
      const generalError = 'Your session has expired. Please log in again.';
      ToastService.error('Session Expired', generalError);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 2000);
      
      return { fieldErrors: {}, generalError, errorId };
    }

    if (ServerValidationService.isAuthorizationError(error)) {
      const generalError = 'You do not have permission to perform this action.';
      return { fieldErrors: {}, generalError, errorId };
    }

    if (ServerValidationService.isNetworkError(error)) {
      const generalError = 'Network connection error. Please check your internet connection and try again.';
      return { fieldErrors: {}, generalError, errorId };
    }

    // Generic error
    const generalError = ServerValidationService.getUserFriendlyErrorMessage(error);
    return { fieldErrors: {}, generalError, errorId };
  }

  /**
   * Show user-friendly notification for errors
   */
  private showUserNotification(error: GlobalError) {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        ToastService.error(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection.',
          { duration: 5000 }
        );
        break;

      case ErrorType.AUTHENTICATION_ERROR:
        ToastService.error(
          'Authentication Error',
          'Your session has expired. Please log in again.',
          { duration: 5000 }
        );
        break;

      case ErrorType.AUTHORIZATION_ERROR:
        ToastService.error(
          'Access Denied',
          'You do not have permission to perform this action.',
          { duration: 4000 }
        );
        break;

      case ErrorType.VALIDATION_ERROR:
        ToastService.error(
          'Validation Error',
          'Please check your input and try again.',
          { duration: 4000 }
        );
        break;

      case ErrorType.NOT_FOUND:
        ToastService.error(
          'Not Found',
          'The requested resource was not found.',
          { duration: 4000 }
        );
        break;

      case ErrorType.INSUFFICIENT_BALANCE:
        ToastService.error(
          'Insufficient Balance',
          'You do not have enough balance to complete this action.',
          { duration: 4000 }
        );
        break;

      default:
        ToastService.error(
          'Unexpected Error',
          'An unexpected error occurred. Please try again.',
          { duration: 4000 }
        );
        break;
    }
  }

  /**
   * Subscribe to error events
   */
  subscribe(listener: (error: GlobalError) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Get all errors
   */
  getErrors(): GlobalError[] {
    return [...this.errors];
  }

  /**
   * Get errors by type
   */
  getErrorsByType(type: ErrorType): GlobalError[] {
    return this.errors.filter(error => error.type === type);
  }

  /**
   * Clear all errors
   */
  clearErrors(): void {
    this.errors = [];
  }

  /**
   * Clear errors older than specified time
   */
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * Check if the application is offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Handle offline/online state changes
   */
  setupOfflineHandling(): () => void {
    const handleOnline = () => {
      ToastService.success(
        'Connection Restored',
        'You are back online.',
        { duration: 3000 }
      );
    };

    const handleOffline = () => {
      ToastService.error(
        'Connection Lost',
        'You are currently offline. Some features may not work.',
        { duration: 5000 }
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers(): () => void {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorToReport = event.reason instanceof Error 
        ? event.reason 
        : new Error(String(event.reason));
      
      this.reportError(
        errorToReport,
        ErrorType.INTERNAL_ERROR,
        { type: 'unhandledrejection' }
      );
    };

    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      this.reportError(
        event.error || new Error(event.message),
        ErrorType.INTERNAL_ERROR,
        {
          type: 'javascript',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      );
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Setup offline handling
    const cleanupOfflineHandling = this.setupOfflineHandling();
    
    // Return cleanup function
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
      cleanupOfflineHandling();
    };
  }
}

// Create singleton instance
export const globalErrorService = new GlobalErrorService();

// Setup global handlers when the module is imported
if (typeof window !== 'undefined') {
  const cleanup = globalErrorService.setupGlobalHandlers();
  
  // Store cleanup function for potential future use
  (globalErrorService as any)._cleanup = cleanup;
}