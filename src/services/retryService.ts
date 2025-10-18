import { ServerValidationService } from './serverValidationService';
import { globalErrorService } from './globalErrorService';
import { ErrorType } from '../types/error';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
  onMaxRetriesReached?: (error: any) => void;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: any;
  attempts: number;
  totalTime: number;
}

class RetryService {
  private defaultOptions: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    exponentialBackoff: true,
    retryCondition: (error: any) => this.shouldRetry(error),
    onRetry: () => {},
    onMaxRetriesReached: () => {},
  };

  /**
   * Execute a function with retry logic
   */
  async executeWithRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<RetryResult<T>> {
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    let lastError: any;
    let attempts = 0;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
      attempts = attempt + 1;
      
      try {
        const result = await fn();
        return {
          success: true,
          data: result,
          attempts,
          totalTime: Date.now() - startTime,
        };
      } catch (error) {
        lastError = error;

        // Don't retry on the last attempt
        if (attempt === opts.maxRetries) {
          opts.onMaxRetriesReached(error);
          break;
        }

        // Check if we should retry this error
        if (!opts.retryCondition(error)) {
          break;
        }

        // Call retry callback
        opts.onRetry(error, attempt + 1);

        // Calculate delay
        const delay = this.calculateDelay(attempt, opts);
        
        // Wait before retrying
        await this.delay(delay);
      }
    }

    return {
      success: false,
      error: lastError,
      attempts,
      totalTime: Date.now() - startTime,
    };
  }

  /**
   * Retry a specific API call with smart error handling
   */
  async retryApiCall<T>(
    apiCall: () => Promise<T>,
    context?: string,
    options: RetryOptions = {}
  ): Promise<T> {
    const result = await this.executeWithRetry(apiCall, {
      ...options,
      onRetry: (error, attempt) => {
        console.log(`Retrying ${context || 'API call'} (attempt ${attempt}):`, error.message);
        options.onRetry?.(error, attempt);
      },
      onMaxRetriesReached: (error) => {
        globalErrorService.reportError(
          error,
          this.getErrorType(error),
          { context, maxRetries: options.maxRetries || this.defaultOptions.maxRetries }
        );
        options.onMaxRetriesReached?.(error);
      },
    });

    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetry(error: any): boolean {
    // Retry network errors
    if (ServerValidationService.isNetworkError(error)) {
      return true;
    }

    // Retry 5xx server errors
    if (error?.response?.status >= 500) {
      return true;
    }

    // Retry timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return true;
    }

    // Don't retry client errors (4xx) except for specific cases
    if (error?.response?.status >= 400 && error?.response?.status < 500) {
      // Retry 408 (Request Timeout) and 429 (Too Many Requests)
      return error.response.status === 408 || error.response.status === 429;
    }

    return false;
  }

  /**
   * Calculate delay for next retry attempt
   */
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    if (options.exponentialBackoff) {
      // Exponential backoff with jitter
      const exponentialDelay = options.baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
      return Math.min(exponentialDelay + jitter, options.maxDelay);
    } else {
      // Linear backoff
      return Math.min(options.baseDelay * (attempt + 1), options.maxDelay);
    }
  }

  /**
   * Get error type for reporting
   */
  private getErrorType(error: any): ErrorType {
    if (ServerValidationService.isNetworkError(error)) {
      return ErrorType.NETWORK_ERROR;
    }
    if (ServerValidationService.isAuthenticationError(error)) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    if (ServerValidationService.isAuthorizationError(error)) {
      return ErrorType.AUTHORIZATION_ERROR;
    }
    if (ServerValidationService.isValidationError(error)) {
      return ErrorType.VALIDATION_ERROR;
    }
    return ErrorType.INTERNAL_ERROR;
  }

  /**
   * Create a delay promise
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Create a retry wrapper for a function
   */
  createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: RetryOptions = {}
  ): T {
    return ((...args: Parameters<T>) => {
      return this.executeWithRetry(() => fn(...args), options).then(result => {
        if (result.success) {
          return result.data;
        } else {
          throw result.error;
        }
      });
    }) as T;
  }

  /**
   * Batch retry multiple operations
   */
  async retryBatch<T>(
    operations: Array<() => Promise<T>>,
    options: RetryOptions = {}
  ): Promise<Array<RetryResult<T>>> {
    const results = await Promise.allSettled(
      operations.map(op => this.executeWithRetry(op, options))
    );

    return results.map(result => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          error: result.reason,
          attempts: 1,
          totalTime: 0,
        };
      }
    });
  }

  /**
   * Circuit breaker pattern - stop retrying if too many failures
   */
  createCircuitBreaker<T>(
    fn: () => Promise<T>,
    options: {
      failureThreshold?: number;
      resetTimeout?: number;
      monitoringPeriod?: number;
    } = {}
  ) {
    const opts = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 300000, // 5 minutes
      ...options,
    };

    let failures = 0;
    let lastFailureTime = 0;
    let isOpen = false;

    return async (): Promise<T> => {
      const now = Date.now();

      // Reset circuit breaker if enough time has passed
      if (isOpen && now - lastFailureTime > opts.resetTimeout) {
        isOpen = false;
        failures = 0;
      }

      // If circuit is open, reject immediately
      if (isOpen) {
        throw new Error('Circuit breaker is open - too many recent failures');
      }

      try {
        const result = await fn();
        
        // Reset failure count on success
        if (failures > 0) {
          failures = 0;
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = now;

        // Open circuit if threshold reached
        if (failures >= opts.failureThreshold) {
          isOpen = true;
          globalErrorService.reportError(
            new Error(`Circuit breaker opened after ${failures} failures`),
            ErrorType.INTERNAL_ERROR,
            { originalError: error, failureThreshold: opts.failureThreshold }
          );
        }

        throw error;
      }
    };
  }
}

// Create singleton instance
export const retryService = new RetryService();

// Convenience functions
export const withRetry = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions
) => retryService.createRetryWrapper(fn, options);

export const retryApiCall = <T>(
  apiCall: () => Promise<T>,
  context?: string,
  options?: RetryOptions
) => retryService.retryApiCall(apiCall, context, options);