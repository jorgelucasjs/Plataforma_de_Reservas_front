import { ServerValidationService } from './serverValidationService';
import { globalErrorService } from './globalErrorService';
import { ErrorType } from '../types/error';

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
  jitterEnabled?: boolean;
  jitterFactor?: number;
  retryCondition?: (error: any) => boolean;
  onRetry?: (error: any, attempt: number) => void;
  onMaxRetriesReached?: (error: any) => void;
}

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
  halfOpenMaxCalls?: number;
}

export const CircuitBreakerState = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
} as const;

export type CircuitBreakerState = typeof CircuitBreakerState[keyof typeof CircuitBreakerState];

interface CircuitBreakerInstance {
  state: CircuitBreakerState;
  failures: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  halfOpenCalls: number;
  options: Required<CircuitBreakerOptions>;
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
    jitterEnabled: true,
    jitterFactor: 0.1,
    retryCondition: (error: any) => this.shouldRetry(error),
    onRetry: () => {},
    onMaxRetriesReached: () => {},
  };

  private circuitBreakers: Map<string, CircuitBreakerInstance> = new Map();
  private defaultCircuitBreakerOptions: Required<CircuitBreakerOptions> = {
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minute
    monitoringPeriod: 300000, // 5 minutes
    halfOpenMaxCalls: 3,
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
   * Retry a specific API call with smart error handling and circuit breaker
   */
  async retryApiCall<T>(
    apiCall: () => Promise<T>,
    context?: string,
    options: RetryOptions & { 
      useCircuitBreaker?: boolean;
      circuitBreakerOptions?: CircuitBreakerOptions;
    } = {}
  ): Promise<T> {
    const { useCircuitBreaker = true, circuitBreakerOptions, ...retryOptions } = options;
    
    // Create circuit breaker key from context
    const circuitBreakerKey = context || 'default-api-call';
    
    // Wrap API call with circuit breaker if enabled
    const wrappedApiCall = useCircuitBreaker 
      ? this.createCircuitBreaker(apiCall, circuitBreakerKey, circuitBreakerOptions)
      : apiCall;

    const result = await this.executeWithRetry(wrappedApiCall, {
      ...retryOptions,
      onRetry: (error, attempt) => {
        console.log(`Retrying ${context || 'API call'} (attempt ${attempt}):`, error.message);
        retryOptions.onRetry?.(error, attempt);
      },
      onMaxRetriesReached: (error) => {
        globalErrorService.reportError(
          error,
          this.getErrorType(error),
          { 
            context, 
            maxRetries: retryOptions.maxRetries || this.defaultOptions.maxRetries,
            circuitBreakerKey: useCircuitBreaker ? circuitBreakerKey : undefined,
            circuitBreakerStatus: useCircuitBreaker ? this.getCircuitBreakerStatus(circuitBreakerKey) : undefined
          }
        );
        retryOptions.onMaxRetriesReached?.(error);
      },
    });

    if (result.success) {
      return result.data!;
    } else {
      throw result.error;
    }
  }

  /**
   * Determine if an error should be retried with enhanced logic
   */
  private shouldRetry(error: any): boolean {
    // Never retry authentication/authorization errors
    if (ServerValidationService.isAuthenticationError(error) || 
        ServerValidationService.isAuthorizationError(error)) {
      return false;
    }

    // Never retry validation errors (client-side issues)
    if (ServerValidationService.isValidationError(error)) {
      return false;
    }

    // Always retry network errors
    if (ServerValidationService.isNetworkError(error)) {
      return true;
    }

    // Check HTTP status codes
    const status = error?.response?.status || error?.status;
    
    if (status) {
      // Retry 5xx server errors (500-599)
      if (status >= 500 && status < 600) {
        return true;
      }

      // Retry specific 4xx errors
      if (status >= 400 && status < 500) {
        // 408 Request Timeout - retry
        // 429 Too Many Requests - retry with backoff
        // 502 Bad Gateway - retry (sometimes classified as 4xx by proxies)
        // 503 Service Unavailable - retry
        // 504 Gateway Timeout - retry
        return [408, 429, 502, 503, 504].includes(status);
      }
    }

    // Retry timeout errors (various timeout scenarios)
    if (error?.code === 'ECONNABORTED' || 
        error?.code === 'ETIMEDOUT' ||
        error?.message?.toLowerCase().includes('timeout') ||
        error?.message?.toLowerCase().includes('timed out')) {
      return true;
    }

    // Retry connection errors
    if (error?.code === 'ECONNREFUSED' || 
        error?.code === 'ENOTFOUND' ||
        error?.code === 'ECONNRESET' ||
        error?.message?.toLowerCase().includes('network error') ||
        error?.message?.toLowerCase().includes('connection')) {
      return true;
    }

    // Retry AbortError from fetch timeouts
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      return true;
    }

    // Don't retry other errors by default
    return false;
  }

  /**
   * Calculate delay for next retry attempt with enhanced jitter
   */
  private calculateDelay(attempt: number, options: Required<RetryOptions>): number {
    let delay: number;

    if (options.exponentialBackoff) {
      // Exponential backoff: baseDelay * 2^attempt
      delay = options.baseDelay * Math.pow(2, attempt);
    } else {
      // Linear backoff: baseDelay * (attempt + 1)
      delay = options.baseDelay * (attempt + 1);
    }

    // Apply jitter if enabled
    if (options.jitterEnabled) {
      // Full jitter: random value between 0 and calculated delay
      // This helps prevent thundering herd problem
      const jitterRange = delay * options.jitterFactor;
      const jitter = Math.random() * jitterRange * 2 - jitterRange; // ±jitterFactor%
      delay = Math.max(0, delay + jitter);
    }

    // Ensure delay doesn't exceed maximum
    return Math.min(delay, options.maxDelay);
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
   * Create a retry wrapper for a function with optional circuit breaker
   */
  createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    options: RetryOptions & {
      useCircuitBreaker?: boolean;
      circuitBreakerKey?: string;
      circuitBreakerOptions?: CircuitBreakerOptions;
    } = {}
  ): T {
    const { useCircuitBreaker = false, circuitBreakerKey, circuitBreakerOptions, ...retryOptions } = options;
    
    return ((...args: Parameters<T>) => {
      const wrappedFn = () => fn(...args);
      
      if (useCircuitBreaker) {
        const key = circuitBreakerKey || `${fn.name || 'anonymous'}-${Math.random().toString(36).substr(2, 9)}`;
        const circuitBreakerFn = this.createCircuitBreaker(wrappedFn, key, circuitBreakerOptions);
        
        return this.executeWithRetry(circuitBreakerFn, retryOptions).then(result => {
          if (result.success) {
            return result.data;
          } else {
            throw result.error;
          }
        });
      } else {
        return this.executeWithRetry(wrappedFn, retryOptions).then(result => {
          if (result.success) {
            return result.data;
          } else {
            throw result.error;
          }
        });
      }
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
   * Enhanced circuit breaker pattern with half-open state
   */
  createCircuitBreaker<T>(
    fn: () => Promise<T>,
    key: string,
    options: CircuitBreakerOptions = {}
  ): () => Promise<T> {
    const opts = { ...this.defaultCircuitBreakerOptions, ...options };
    
    // Get or create circuit breaker instance
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, {
        state: CircuitBreakerState.CLOSED,
        failures: 0,
        lastFailureTime: 0,
        lastSuccessTime: Date.now(),
        halfOpenCalls: 0,
        options: opts,
      });
    }

    const breaker = this.circuitBreakers.get(key)!;

    return async (): Promise<T> => {
      const now = Date.now();

      // Update circuit breaker state based on time and conditions
      this.updateCircuitBreakerState(breaker, now);

      // Check if circuit is open
      if (breaker.state === CircuitBreakerState.OPEN) {
        const error = new Error(`Circuit breaker is OPEN for ${key}. Too many recent failures (${breaker.failures}/${breaker.options.failureThreshold})`);
        globalErrorService.reportError(
          error,
          ErrorType.INTERNAL_ERROR,
          { 
            circuitBreakerKey: key,
            state: breaker.state,
            failures: breaker.failures,
            lastFailureTime: breaker.lastFailureTime
          }
        );
        throw error;
      }

      // Check if we're in half-open state and have reached max calls
      if (breaker.state === CircuitBreakerState.HALF_OPEN && 
          breaker.halfOpenCalls >= breaker.options.halfOpenMaxCalls) {
        throw new Error(`Circuit breaker is HALF_OPEN for ${key} and has reached maximum test calls`);
      }

      try {
        // Increment half-open calls if in that state
        if (breaker.state === CircuitBreakerState.HALF_OPEN) {
          breaker.halfOpenCalls++;
        }

        const result = await fn();
        
        // Success - handle state transitions
        this.handleCircuitBreakerSuccess(breaker, now);
        
        return result;
      } catch (error) {
        // Failure - handle state transitions
        this.handleCircuitBreakerFailure(breaker, now, error, key);
        throw error;
      }
    };
  }

  /**
   * Update circuit breaker state based on time and current conditions
   */
  private updateCircuitBreakerState(breaker: CircuitBreakerInstance, now: number): void {
    switch (breaker.state) {
      case CircuitBreakerState.OPEN:
        // Check if we should transition to half-open
        if (now - breaker.lastFailureTime >= breaker.options.resetTimeout) {
          breaker.state = CircuitBreakerState.HALF_OPEN;
          breaker.halfOpenCalls = 0;
          console.log('Circuit breaker transitioning from OPEN to HALF_OPEN');
        }
        break;
        
      case CircuitBreakerState.HALF_OPEN:
        // Half-open state is managed by success/failure handlers
        break;
        
      case CircuitBreakerState.CLOSED:
        // Check if old failures should be cleared (sliding window)
        if (now - breaker.lastFailureTime >= breaker.options.monitoringPeriod) {
          breaker.failures = 0;
        }
        break;
    }
  }

  /**
   * Handle successful circuit breaker call
   */
  private handleCircuitBreakerSuccess(breaker: CircuitBreakerInstance, now: number): void {
    breaker.lastSuccessTime = now;

    switch (breaker.state) {
      case CircuitBreakerState.HALF_OPEN:
        // Successful call in half-open state - transition to closed
        breaker.state = CircuitBreakerState.CLOSED;
        breaker.failures = 0;
        breaker.halfOpenCalls = 0;
        console.log('Circuit breaker transitioning from HALF_OPEN to CLOSED after successful call');
        break;
        
      case CircuitBreakerState.CLOSED:
        // Reset failure count on success (but keep some history for sliding window)
        if (breaker.failures > 0) {
          breaker.failures = Math.max(0, breaker.failures - 1);
        }
        break;
    }
  }

  /**
   * Handle failed circuit breaker call
   */
  private handleCircuitBreakerFailure(
    breaker: CircuitBreakerInstance, 
    now: number, 
    error: any, 
    key: string
  ): void {
    breaker.lastFailureTime = now;
    breaker.failures++;

    switch (breaker.state) {
      case CircuitBreakerState.HALF_OPEN:
        // Failure in half-open state - go back to open
        breaker.state = CircuitBreakerState.OPEN;
        breaker.halfOpenCalls = 0;
        console.log('Circuit breaker transitioning from HALF_OPEN to OPEN after failure');
        break;
        
      case CircuitBreakerState.CLOSED:
        // Check if we should open the circuit
        if (breaker.failures >= breaker.options.failureThreshold) {
          breaker.state = CircuitBreakerState.OPEN;
          console.log(`Circuit breaker opening for ${key} after ${breaker.failures} failures`);
          
          globalErrorService.reportError(
            new Error(`Circuit breaker opened for ${key} after ${breaker.failures} consecutive failures`),
            ErrorType.INTERNAL_ERROR,
            { 
              circuitBreakerKey: key,
              failures: breaker.failures,
              threshold: breaker.options.failureThreshold,
              originalError: error
            }
          );
        }
        break;
    }
  }

  /**
   * Get circuit breaker status for monitoring
   */
  getCircuitBreakerStatus(key: string): CircuitBreakerInstance | null {
    return this.circuitBreakers.get(key) || null;
  }

  /**
   * Get all circuit breaker statuses
   */
  getAllCircuitBreakerStatuses(): Record<string, CircuitBreakerInstance> {
    const statuses: Record<string, CircuitBreakerInstance> = {};
    this.circuitBreakers.forEach((breaker, key) => {
      statuses[key] = { ...breaker };
    });
    return statuses;
  }

  /**
   * Reset a specific circuit breaker
   */
  resetCircuitBreaker(key: string): boolean {
    const breaker = this.circuitBreakers.get(key);
    if (breaker) {
      breaker.state = CircuitBreakerState.CLOSED;
      breaker.failures = 0;
      breaker.halfOpenCalls = 0;
      breaker.lastFailureTime = 0;
      breaker.lastSuccessTime = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Reset all circuit breakers
   */
  resetAllCircuitBreakers(): void {
    this.circuitBreakers.forEach((breaker) => {
      breaker.state = CircuitBreakerState.CLOSED;
      breaker.failures = 0;
      breaker.halfOpenCalls = 0;
      breaker.lastFailureTime = 0;
      breaker.lastSuccessTime = Date.now();
    });
  }
}

// Create singleton instance
export const retryService = new RetryService();

// Convenience functions
export const withRetry = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: RetryOptions & {
    useCircuitBreaker?: boolean;
    circuitBreakerKey?: string;
    circuitBreakerOptions?: CircuitBreakerOptions;
  }
) => retryService.createRetryWrapper(fn, options);

export const retryApiCall = <T>(
  apiCall: () => Promise<T>,
  context?: string,
  options?: RetryOptions & { 
    useCircuitBreaker?: boolean;
    circuitBreakerOptions?: CircuitBreakerOptions;
  }
) => retryService.retryApiCall(apiCall, context, options);

// Circuit breaker convenience functions
export const withCircuitBreaker = <T>(
  fn: () => Promise<T>,
  key: string,
  options?: CircuitBreakerOptions
) => retryService.createCircuitBreaker(fn, key, options);

export const getCircuitBreakerStatus = (key: string) => 
  retryService.getCircuitBreakerStatus(key);

export const getAllCircuitBreakerStatuses = () => 
  retryService.getAllCircuitBreakerStatuses();

export const resetCircuitBreaker = (key: string) => 
  retryService.resetCircuitBreaker(key);

export const resetAllCircuitBreakers = () => 
  retryService.resetAllCircuitBreakers();