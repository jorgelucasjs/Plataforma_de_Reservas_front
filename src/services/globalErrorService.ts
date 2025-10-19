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
  count: number; // For error consolidation
  lastOccurrence: Date;
  fingerprint: string; // For error deduplication
}

export interface ErrorThrottleConfig {
  maxErrorsPerMinute: number;
  maxSameErrorsPerMinute: number;
  throttleWindowMs: number;
}

interface ErrorThrottleState {
  totalErrors: number;
  errorCounts: Map<string, number>;
  windowStart: number;
}

class GlobalErrorService {
  private errors: GlobalError[] = [];
  private errorMap: Map<string, GlobalError> = new Map(); // For quick lookup by fingerprint
  private maxErrors = 50; // Keep last 50 errors
  private listeners: Array<(error: GlobalError) => void> = [];
  
  // Error throttling configuration
  private throttleConfig: ErrorThrottleConfig = {
    maxErrorsPerMinute: 30,
    maxSameErrorsPerMinute: 5,
    throttleWindowMs: 60000, // 1 minute
  };
  
  private throttleState: ErrorThrottleState = {
    totalErrors: 0,
    errorCounts: new Map(),
    windowStart: Date.now(),
  };

  /**
   * Generate a fingerprint for error deduplication
   */
  private generateErrorFingerprint(
    message: string, 
    type: ErrorType, 
    stack?: string,
    context?: any
  ): string {
    // Create a fingerprint based on error characteristics
    const stackLines = stack ? stack.split('\n').slice(0, 3).join('|') : '';
    const contextKey = context ? JSON.stringify(context).substring(0, 100) : '';
    
    return `${type}:${message}:${stackLines}:${contextKey}`;
  }

  /**
   * Check if error should be throttled
   */
  private shouldThrottleError(fingerprint: string): boolean {
    const now = Date.now();
    
    // Reset throttle window if needed
    if (now - this.throttleState.windowStart >= this.throttleConfig.throttleWindowMs) {
      this.throttleState = {
        totalErrors: 0,
        errorCounts: new Map(),
        windowStart: now,
      };
    }

    // Check total error limit
    if (this.throttleState.totalErrors >= this.throttleConfig.maxErrorsPerMinute) {
      return true;
    }

    // Check same error limit
    const sameErrorCount = this.throttleState.errorCounts.get(fingerprint) || 0;
    if (sameErrorCount >= this.throttleConfig.maxSameErrorsPerMinute) {
      return true;
    }

    return false;
  }

  /**
   * Update throttle state after processing an error
   */
  private updateThrottleState(fingerprint: string): void {
    this.throttleState.totalErrors++;
    const currentCount = this.throttleState.errorCounts.get(fingerprint) || 0;
    this.throttleState.errorCounts.set(fingerprint, currentCount + 1);
  }

  /**
   * Categorize error based on its characteristics
   */
  private categorizeError(error: Error | string, type: ErrorType, context?: any): {
    category: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    userFriendlyMessage: string;
  } {
    const message = typeof error === 'string' ? error : error.message;
    
    // Check context for additional categorization hints
    const contextCategory = context?.category;
    const contextSeverity = context?.severity;
    
    // Determine category and severity
    switch (type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return {
          category: 'authentication',
          severity: 'medium',
          userFriendlyMessage: 'Please log in again to continue.'
        };
        
      case ErrorType.AUTHORIZATION_ERROR:
        return {
          category: 'authorization',
          severity: 'medium',
          userFriendlyMessage: 'You don\'t have permission to perform this action.'
        };
        
      case ErrorType.NETWORK_ERROR:
        return {
          category: 'network',
          severity: 'high',
          userFriendlyMessage: 'Connection problem. Please check your internet and try again.'
        };
        
      case ErrorType.VALIDATION_ERROR:
        return {
          category: 'validation',
          severity: 'low',
          userFriendlyMessage: 'Please check your input and try again.'
        };
        
      case ErrorType.NOT_FOUND:
        return {
          category: 'not_found',
          severity: 'low',
          userFriendlyMessage: 'The requested item was not found.'
        };
        
      case ErrorType.RATE_LIMIT_ERROR:
        return {
          category: 'rate_limit',
          severity: 'medium',
          userFriendlyMessage: 'Too many requests. Please wait a moment and try again.'
        };
        
      case ErrorType.INTERNAL_ERROR:
        // Further categorize internal errors
        if (message.toLowerCase().includes('database') || 
            message.toLowerCase().includes('sql')) {
          return {
            category: 'database',
            severity: 'critical',
            userFriendlyMessage: 'A system error occurred. Our team has been notified.'
          };
        }
        
        if (message.toLowerCase().includes('timeout')) {
          return {
            category: 'timeout',
            severity: 'high',
            userFriendlyMessage: 'The request took too long. Please try again.'
          };
        }
        
        return {
          category: 'system',
          severity: 'high',
          userFriendlyMessage: 'An unexpected error occurred. Please try again.'
        };
        
      default:
        return {
          category: contextCategory || 'unknown',
          severity: contextSeverity || 'medium',
          userFriendlyMessage: 'An error occurred. Please try again.'
        };
    }
  }

  /**
   * Report an error to the global error system with consolidation and throttling
   */
  reportError(
    error: Error | string,
    type: ErrorType = ErrorType.INTERNAL_ERROR,
    context?: any,
    handled = false
  ): string {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'object' ? error.stack : undefined;
    const fingerprint = this.generateErrorFingerprint(message, type, stack, context);
    
    // Check if error should be throttled
    if (this.shouldThrottleError(fingerprint)) {
      // Still update existing error count if it exists
      const existingError = this.errorMap.get(fingerprint);
      if (existingError) {
        existingError.count++;
        existingError.lastOccurrence = new Date();
        return existingError.id;
      }
      
      // Create a throttled error indicator
      console.warn(`Error throttled: ${message} (type: ${type})`);
      return 'throttled';
    }

    // Update throttle state
    this.updateThrottleState(fingerprint);

    // Check if we already have this error (consolidation)
    const existingError = this.errorMap.get(fingerprint);
    if (existingError) {
      // Update existing error
      existingError.count++;
      existingError.lastOccurrence = new Date();
      
      // Move to front of array
      const index = this.errors.findIndex(e => e.id === existingError.id);
      if (index > -1) {
        this.errors.splice(index, 1);
        this.errors.unshift(existingError);
      }
      
      // Notify listeners about the updated error
      this.listeners.forEach(listener => {
        try {
          listener(existingError);
        } catch (err) {
          console.error('Error in global error listener:', err);
        }
      });
      
      return existingError.id;
    }

    // Create new error
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const errorCategory = this.categorizeError(error, type, context);
    
    const globalError: GlobalError = {
      id: errorId,
      message,
      type,
      timestamp: new Date(),
      context: {
        ...context,
        category: errorCategory.category,
        severity: errorCategory.severity,
        userFriendlyMessage: errorCategory.userFriendlyMessage,
      },
      stack,
      handled,
      count: 1,
      lastOccurrence: new Date(),
      fingerprint,
    };

    // Add to error list and map
    this.errors.unshift(globalError);
    this.errorMap.set(fingerprint, globalError);
    
    // Keep only the most recent errors
    if (this.errors.length > this.maxErrors) {
      const removedError = this.errors.pop();
      if (removedError) {
        this.errorMap.delete(removedError.fingerprint);
      }
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(globalError);
      } catch (err) {
        console.error('Error in global error listener:', err);
      }
    });

    // Log to console with appropriate level based on severity
    const logLevel = errorCategory.severity === 'critical' ? 'error' : 
                    errorCategory.severity === 'high' ? 'error' :
                    errorCategory.severity === 'medium' ? 'warn' : 'log';
    
    console[logLevel](`[GlobalError ${errorId}] ${errorCategory.category}:`, {
      message: globalError.message,
      type: globalError.type,
      severity: errorCategory.severity,
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
   * Show user-friendly notification for errors with improved messaging
   */
  private showUserNotification(error: GlobalError) {
    const category = error.context?.category || 'unknown';
    const severity = error.context?.severity || 'medium';
    const userFriendlyMessage = error.context?.userFriendlyMessage || error.message;
    
    // Determine toast duration based on severity
    const duration = severity === 'critical' ? 8000 :
                    severity === 'high' ? 6000 :
                    severity === 'medium' ? 4000 : 3000;

    // Show count if error has occurred multiple times
    const countSuffix = error.count > 1 ? ` (${error.count} times)` : '';
    const finalMessage = userFriendlyMessage + countSuffix;

    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        ToastService.error(
          'Connection Error',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.AUTHENTICATION_ERROR:
        ToastService.error(
          'Authentication Error',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.AUTHORIZATION_ERROR:
        ToastService.error(
          'Access Denied',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.VALIDATION_ERROR:
        ToastService.error(
          'Validation Error',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.NOT_FOUND:
        ToastService.error(
          'Not Found',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.INSUFFICIENT_BALANCE:
        ToastService.error(
          'Insufficient Balance',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.RATE_LIMIT_ERROR:
        ToastService.error(
          'Rate Limited',
          finalMessage,
          { duration }
        );
        break;

      case ErrorType.CONFLICT_ERROR:
        ToastService.error(
          'Conflict',
          finalMessage,
          { duration }
        );
        break;

      default:
        // Use category-based titles for internal errors
        const title = category === 'database' ? 'System Error' :
                     category === 'timeout' ? 'Timeout Error' :
                     category === 'network' ? 'Connection Error' :
                     'Unexpected Error';
        
        ToastService.error(
          title,
          finalMessage,
          { duration }
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
    this.errorMap.clear();
  }

  /**
   * Clear errors older than specified time
   */
  clearOldErrors(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    const oldErrors = this.errors.filter(error => error.timestamp <= cutoff);
    
    // Remove from map as well
    oldErrors.forEach(error => {
      this.errorMap.delete(error.fingerprint);
    });
    
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    total: number;
    byType: Record<ErrorType, number>;
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    throttleStats: {
      totalInWindow: number;
      windowStart: Date;
      isThrottling: boolean;
    };
  } {
    const stats = {
      total: this.errors.length,
      byType: {} as Record<ErrorType, number>,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      throttleStats: {
        totalInWindow: this.throttleState.totalErrors,
        windowStart: new Date(this.throttleState.windowStart),
        isThrottling: this.throttleState.totalErrors >= this.throttleConfig.maxErrorsPerMinute,
      },
    };

    // Count errors by type, category, and severity
    this.errors.forEach(error => {
      // By type
      stats.byType[error.type] = (stats.byType[error.type] || 0) + error.count;
      
      // By category
      const category = error.context?.category || 'unknown';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + error.count;
      
      // By severity
      const severity = error.context?.severity || 'unknown';
      stats.bySeverity[severity] = (stats.bySeverity[severity] || 0) + error.count;
    });

    return stats;
  }

  /**
   * Get consolidated errors (errors with count > 1)
   */
  getConsolidatedErrors(): GlobalError[] {
    return this.errors.filter(error => error.count > 1);
  }

  /**
   * Configure error throttling
   */
  configureThrottling(config: Partial<ErrorThrottleConfig>): void {
    this.throttleConfig = { ...this.throttleConfig, ...config };
  }

  /**
   * Get current throttle configuration
   */
  getThrottleConfig(): ErrorThrottleConfig {
    return { ...this.throttleConfig };
  }

  /**
   * Reset throttle state
   */
  resetThrottleState(): void {
    this.throttleState = {
      totalErrors: 0,
      errorCounts: new Map(),
      windowStart: Date.now(),
    };
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