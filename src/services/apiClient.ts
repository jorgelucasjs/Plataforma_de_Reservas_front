// Centralized API client with request/response interceptors

import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';
import { tokenService } from './tokenService';
import { globalErrorService } from './globalErrorService';
import { retryService } from './retryService';
import { cacheService, staticDataCache } from './cacheService';

const baseURL = window.location.hostname === "localhost" ?
  "http://127.0.0.1:5002/angolaeventos-cd238/us-central1/sistemaDeReservaServer"
  :

  "https://sistemadereservaserver-33vs75arbq-uc.a.run.app"

// Helper function to create AppError objects
function createAppError(error: AppError): AppError {
  return error;
}

// API Response wrapper interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  code?: string;
}

// API Client configuration
interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
  enableRetry?: boolean;
  enableGlobalErrorHandling?: boolean;
  maxRetries?: number;
  enableCaching?: boolean;
  defaultCacheTTL?: number;
  enableRouteValidation?: boolean;
  enableRequestLogging?: boolean;
  enableResponseLogging?: boolean;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

// Enhanced error context for debugging
interface ApiErrorContext {
  url: string;
  method: string;
  requestId: string;
  timestamp: number;
  duration?: number;
  statusCode?: number;
  retryCount?: number;
  userType?: string;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  networkInfo?: {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
  };
}

// Route validation interface
interface RouteValidationResult {
  isValid: boolean;
  shouldFallback: boolean;
  fallbackRoute?: string;
  errorType: 'missing_route' | 'missing_resource' | 'unknown';
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: baseURL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  enableRetry: true,
  enableGlobalErrorHandling: true,
  maxRetries: 3,
  enableCaching: true,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
  enableRouteValidation: true,
  enableRequestLogging: import.meta.env?.DEV || false,
  enableResponseLogging: import.meta.env?.DEV || false,
  logLevel: import.meta.env?.DEV ? 'info' : 'error',
};

class ApiClient {
  private config: ApiClientConfig;
  private tokenProvider: (() => string | null) | null = null;
  private knownRoutes: Set<string> = new Set();
  private missingRoutes: Set<string> = new Set();
  private requestCounter: number = 0;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initializeKnownRoutes();
  }

  /**
   * Generate unique request ID for tracking
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  /**
   * Get network information for error context
   */
  private getNetworkInfo(): ApiErrorContext['networkInfo'] {
    if (typeof navigator === 'undefined') return undefined;

    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
    };
  }

  /**
   * Detect if error is network-related
   */
  private isNetworkError(error: any): boolean {
    if (!error) return false;

    // Check error types that indicate network issues
    const networkErrorCodes = [
      'NETWORK_ERROR',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ECONNRESET',
      'ETIMEDOUT',
      'ECONNABORTED'
    ];

    const networkErrorNames = [
      'NetworkError',
      'AbortError',
      'TimeoutError'
    ];

    // Check error code
    if (error.code && networkErrorCodes.includes(error.code)) {
      return true;
    }

    // Check error name
    if (error.name && networkErrorNames.includes(error.name)) {
      return true;
    }

    // Check error message for network-related keywords
    const message = error.message?.toLowerCase() || '';
    const networkKeywords = [
      'network error',
      'connection',
      'timeout',
      'fetch',
      'cors',
      'net::',
      'failed to fetch'
    ];

    return networkKeywords.some(keyword => message.includes(keyword));
  }

  /**
   * Log request/response with configurable levels
   */
  private log(level: 'error' | 'warn' | 'info' | 'debug', message: string, data?: any): void {
    const logLevels = ['none', 'error', 'warn', 'info', 'debug'];
    const currentLevelIndex = logLevels.indexOf(this.config.logLevel || 'error');
    const messageLevelIndex = logLevels.indexOf(level);

    if (currentLevelIndex >= messageLevelIndex && currentLevelIndex > 0) {
      console[level](`[ApiClient] ${message}`, data);
    }
  }

  // Initialize known routes based on expected API endpoints
  private initializeKnownRoutes(): void {
    this.knownRoutes.add('/services');
    this.knownRoutes.add('/services/my-services');
    this.knownRoutes.add('/auth/login');
    this.knownRoutes.add('/auth/verify');
    this.knownRoutes.add('/users/profile');
    this.knownRoutes.add('/bookings');
    this.knownRoutes.add('/bookings/my-bookings');
    this.knownRoutes.add('/health');
  }

  // Set token provider function
  setTokenProvider(provider: () => string | null) {
    this.tokenProvider = provider;
  }

  // Validate route before making API call
  private validateRoute(url: string): RouteValidationResult {
    // Extract base route from URL (remove query params and dynamic segments)
    const baseRoute = this.extractBaseRoute(url);

    // Check if route is known to be missing
    if (this.missingRoutes.has(baseRoute)) {
      return {
        isValid: false,
        shouldFallback: true,
        fallbackRoute: this.getFallbackRoute(baseRoute),
        errorType: 'missing_route'
      };
    }

    // Check if route is in known routes
    if (this.knownRoutes.has(baseRoute)) {
      return {
        isValid: true,
        shouldFallback: false,
        errorType: 'unknown'
      };
    }

    // Unknown route - assume valid but prepare for potential fallback
    return {
      isValid: true,
      shouldFallback: false,
      errorType: 'unknown'
    };
  }

  // Extract base route from URL
  private extractBaseRoute(url: string): string {
    // Remove query parameters
    const urlWithoutQuery = url.split('?')[0];

    // Remove dynamic segments (IDs, UUIDs)
    const segments = urlWithoutQuery.split('/');
    const baseSegments = segments.map(segment => {
      // Replace UUIDs and numeric IDs with placeholder
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment) ||
        /^\d+$/.test(segment)) {
        return ':id';
      }
      return segment;
    });

    return baseSegments.join('/');
  }

  // Get fallback route for missing routes
  private getFallbackRoute(missingRoute: string): string | undefined {
    const fallbackMap: Record<string, string> = {
      '/services/my-services': '/services', // Fallback to general services endpoint
      '/bookings/my-bookings': '/bookings', // Fallback to general bookings endpoint
    };

    return fallbackMap[missingRoute];
  }

  // Handle 404 errors with route validation
  private handle404Error(url: string, _responseData: any): RouteValidationResult {
    const baseRoute = this.extractBaseRoute(url);

    // Mark route as missing for future requests
    this.missingRoutes.add(baseRoute);

    // Log missing route for backend team awareness
    console.warn('Missing API route detected:', {
      route: baseRoute,
      fullUrl: url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });

    // Determine if this is a missing route or missing resource
    const isResourceNotFound = /\/[0-9a-f-]+$/i.test(url) || /\/\d+$/.test(url);

    return {
      isValid: false,
      shouldFallback: !isResourceNotFound,
      fallbackRoute: isResourceNotFound ? undefined : this.getFallbackRoute(baseRoute),
      errorType: isResourceNotFound ? 'missing_resource' : 'missing_route'
    };
  }

  // Request interceptor - adds authentication headers and handles request setup
  private async prepareRequest(
    url: string, 
    options: RequestInit = {},
    requestId?: string
  ): Promise<[string, RequestInit, ApiErrorContext]> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    const method = options.method || 'GET';
    const timestamp = Date.now();

    // Prepare headers
    const headers = new Headers(options.headers);

    // Add default headers
    Object.entries(this.config.headers || {}).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });

    // Add request ID for tracking
    if (requestId) {
      headers.set('X-Request-ID', requestId);
    }

    // Add authentication token if available
    if (this.tokenProvider) {
      const token = this.tokenProvider();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Prepare request options
    const requestOptions: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout),
    };

    // Create error context for debugging
    const errorContext: ApiErrorContext = {
      url: fullUrl,
      method,
      requestId: requestId || 'unknown',
      timestamp,
      requestHeaders: Object.fromEntries(headers.entries()),
      requestBody: options.body ? JSON.parse(options.body as string) : undefined,
      networkInfo: this.getNetworkInfo(),
    };

    // Log request if enabled
    if (this.config.enableRequestLogging) {
      this.log('info', `${method} ${url}`, {
        requestId,
        headers: Object.fromEntries(headers.entries()),
        body: options.body,
        networkInfo: errorContext.networkInfo,
      });
    }

    return [fullUrl, requestOptions, errorContext];
  }

  // Response interceptor - handles response transformation and error mapping
  private async handleResponse<T>(
    response: Response, 
    errorContext: ApiErrorContext
  ): Promise<T> {
    let responseData: any;
    const startTime = errorContext.timestamp;
    const duration = Date.now() - startTime;

    // Update error context with response info
    errorContext.duration = duration;
    errorContext.statusCode = response.status;
    errorContext.responseHeaders = Object.fromEntries(response.headers.entries());

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      errorContext.responseBody = responseData;
    } catch (error) {
      this.log('error', 'Failed to parse response', {
        ...errorContext,
        parseError: error,
      });

      throw createAppError({
        type: ErrorType.NETWORK_ERROR,
        message: 'Failed to parse response',
        details: { ...errorContext, parseError: error },
      });
    }

    // Log response if enabled
    if (this.config.enableResponseLogging) {
      this.log('info', `${response.status} ${errorContext.method} ${errorContext.url}`, {
        requestId: errorContext.requestId,
        status: response.status,
        duration,
        responseSize: JSON.stringify(responseData).length,
      });
    }

    // Handle successful responses
    if (response.ok) {
      // If response follows ApiResponse format, return the data
      if (responseData && typeof responseData === 'object' && 'data' in responseData) {
        return responseData.data;
      }
      // Otherwise return the raw response
      return responseData;
    }

    // Handle error responses
    this.handleErrorResponse(response.status, responseData, errorContext);
  }

  // Error response handler with enhanced context
  private handleErrorResponse(
    status: number, 
    responseData: any, 
    errorContext: ApiErrorContext
  ): never {
    let errorType: ErrorType;
    let message = 'An error occurred';
    let details = {
      ...responseData,
      context: errorContext,
    };

    // Log error with full context
    this.log('error', `HTTP ${status} Error: ${errorContext.method} ${errorContext.url}`, {
      ...errorContext,
      responseData,
    });

    // Map HTTP status codes to error types
    switch (status) {
      case 400:
        errorType = ErrorType.VALIDATION_ERROR;
        message = responseData?.message || 'Invalid request data';
        break;
      case 401:
        errorType = ErrorType.AUTHENTICATION_ERROR;
        message = responseData?.message || 'Authentication required';
        break;
      case 403:
        errorType = ErrorType.AUTHORIZATION_ERROR;
        message = responseData?.message || 'Access denied';
        break;
      case 404:
        errorType = ErrorType.NOT_FOUND;
        // Enhanced 404 handling with route validation
        const routeValidation = this.handle404Error(
          errorContext.url,
          responseData
        );

        if (routeValidation.errorType === 'missing_route') {
          message = responseData?.message || 'API route not found. This may be a backend configuration issue.';
        } else {
          message = responseData?.message || 'Resource not found';
        }

        // Add route validation info to error details
        details = {
          ...details,
          routeValidation
        };
        break;
      case 409:
        errorType = ErrorType.CONFLICT_ERROR;
        message = responseData?.message || 'Resource conflict';
        break;
      case 422:
        errorType = ErrorType.VALIDATION_ERROR;
        message = responseData?.message || 'Validation failed';
        break;
      case 429:
        errorType = ErrorType.RATE_LIMIT_ERROR;
        message = responseData?.message || 'Too many requests';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = ErrorType.INTERNAL_ERROR;
        message = responseData?.message || 'Server error';
        break;
      default:
        errorType = ErrorType.NETWORK_ERROR;
        message = responseData?.message || `HTTP ${status} error`;
    }

    throw createAppError({
      type: errorType,
      message,
      details,
      code: responseData?.code,
    });
  }

  // Execute request with enhanced error handling and context
  private async executeRequest<T>(
    url: string,
    options: RequestInit = {},
    context?: string
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const requestContext = context || `${options.method || 'GET'} ${url}`;

    const requestFn = async (): Promise<T> => {
      // Validate route if enabled
      if (this.config.enableRouteValidation) {
        const routeValidation = this.validateRoute(url);

        if (!routeValidation.isValid && routeValidation.shouldFallback && routeValidation.fallbackRoute) {
          this.log('warn', `Using fallback route for ${url} -> ${routeValidation.fallbackRoute}`, {
            requestId,
            originalUrl: url,
            fallbackUrl: routeValidation.fallbackRoute,
          });
          return this.executeRequest<T>(routeValidation.fallbackRoute, options, context);
        }
      }

      const [fullUrl, requestOptions, errorContext] = await this.prepareRequest(url, options, requestId);

      try {
        const response = await fetch(fullUrl, requestOptions);
        return this.handleResponse<T>(response, errorContext);
      } catch (error) {
        // Enhanced error handling with network detection
        const isNetworkErr = this.isNetworkError(error);
        
        // Update error context with additional info
        errorContext.duration = Date.now() - errorContext.timestamp;
        
        this.log('error', `Request failed: ${requestContext}`, {
          ...errorContext,
          error: error,
          isNetworkError: isNetworkErr,
        });

        if (error && typeof error === 'object' && 'type' in error) {
          // Type guard to check if it's an AppError
          const appError = error as AppError;

          // Check if this is a 404 error that might have a fallback
          if (appError.type === ErrorType.NOT_FOUND && this.config.enableRouteValidation) {
            const routeValidation = this.handle404Error(url, appError.details || {});

            if (routeValidation.shouldFallback && routeValidation.fallbackRoute) {
              this.log('warn', `404 fallback: ${url} -> ${routeValidation.fallbackRoute}`, {
                requestId,
                originalUrl: url,
                fallbackUrl: routeValidation.fallbackRoute,
              });
              return this.executeRequest<T>(routeValidation.fallbackRoute, options, context);
            }
          }
          
          // Add error context to existing AppError
          appError.details = {
            ...appError.details,
            context: errorContext,
          };
          
          throw appError;
        }

        // Create new AppError with full context
        const errorType = isNetworkErr ? ErrorType.NETWORK_ERROR : ErrorType.INTERNAL_ERROR;
        const errorMessage = isNetworkErr ? 'Network request failed' : 'Request failed';
        
        throw createAppError({
          type: errorType,
          message: errorMessage,
          details: {
            originalError: error,
            context: errorContext,
            isNetworkError: isNetworkErr,
          },
        });
      }
    };

    try {
      if (this.config.enableRetry) {
        return await retryService.retryApiCall(
          requestFn,
          requestContext,
          {
            maxRetries: this.config.maxRetries,
            useCircuitBreaker: true,
            onRetry: (error, attempt) => {
              this.log('warn', `Retrying request ${requestContext} (attempt ${attempt})`, {
                requestId,
                error: error.message,
                attempt,
              });
            },
          }
        );
      } else {
        return await requestFn();
      }
    } catch (error) {
      if (this.config.enableGlobalErrorHandling) {
        const { generalError } = globalErrorService.handleApiError(error, { 
          url, 
          method: options.method,
          requestId,
          context: requestContext,
        });
        if (generalError) {
          // Error has been handled globally, re-throw for local handling
          throw error;
        }
      }
      throw error;
    }
  }

  // HTTP Methods with caching support
  async get<T>(
    url: string,
    options: RequestInit & {
      cache?: boolean;
      cacheTTL?: number;
      cacheKey?: string;
      useStaleWhileRevalidate?: boolean;
    } = {}
  ): Promise<T> {
    const {
      cache = this.config.enableCaching,
      cacheTTL = this.config.defaultCacheTTL,
      cacheKey,
      useStaleWhileRevalidate = true,
      ...requestOptions
    } = options;

    // Use caching for GET requests if enabled
    if (cache && requestOptions.method !== 'POST') {
      const key = cacheKey || `${url}:${JSON.stringify(requestOptions)}`;

      if (useStaleWhileRevalidate) {
        return cacheService.getWithSWR(
          key,
          () => this.executeRequest<T>(url, { ...requestOptions, method: 'GET' }, `GET ${url}`),
          { ttl: cacheTTL }
        );
      } else {
        const cached = cacheService.get<T>(key);
        if (cached) return cached;

        const result = await this.executeRequest<T>(url, { ...requestOptions, method: 'GET' }, `GET ${url}`);
        cacheService.set(key, result, cacheTTL);
        return result;
      }
    }

    return this.executeRequest<T>(url, { ...requestOptions, method: 'GET' }, `GET ${url}`);
  }

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.executeRequest<T>(
      url,
      {
        ...options,
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      `POST ${url}`
    );
  }

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.executeRequest<T>(
      url,
      {
        ...options,
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      `PUT ${url}`
    );
  }

  async patch<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    return this.executeRequest<T>(
      url,
      {
        ...options,
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      `PATCH ${url}`
    );
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    return this.executeRequest<T>(url, { ...options, method: 'DELETE' }, `DELETE ${url}`);
  }

  // Utility methods for configuration
  enableRetry(enabled: boolean = true): void {
    this.config.enableRetry = enabled;
  }

  enableGlobalErrorHandling(enabled: boolean = true): void {
    this.config.enableGlobalErrorHandling = enabled;
  }

  enableCaching(enabled: boolean = true): void {
    this.config.enableCaching = enabled;
  }

  setMaxRetries(maxRetries: number): void {
    this.config.maxRetries = maxRetries;
  }

  setCacheTTL(ttl: number): void {
    this.config.defaultCacheTTL = ttl;
  }

  // Cache management methods
  clearCache(): void {
    cacheService.clear();
    staticDataCache.clear();
  }

  invalidateCache(pattern: string | RegExp): number {
    return cacheService.invalidatePattern(pattern) + staticDataCache.invalidatePattern(pattern);
  }

  getCacheStats() {
    return {
      main: cacheService.getStats(),
      static: staticDataCache.getStats(),
    };
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await this.get('/health');
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Route validation management methods
  enableRouteValidation(enabled: boolean = true): void {
    this.config.enableRouteValidation = enabled;
  }

  addKnownRoute(route: string): void {
    this.knownRoutes.add(route);
  }

  removeKnownRoute(route: string): void {
    this.knownRoutes.delete(route);
  }

  clearMissingRoutes(): void {
    this.missingRoutes.clear();
  }

  getMissingRoutes(): string[] {
    return Array.from(this.missingRoutes);
  }

  getKnownRoutes(): string[] {
    return Array.from(this.knownRoutes);
  }

  // Logging configuration methods
  enableRequestLogging(enabled: boolean = true): void {
    this.config.enableRequestLogging = enabled;
  }

  enableResponseLogging(enabled: boolean = true): void {
    this.config.enableResponseLogging = enabled;
  }

  setLogLevel(level: ApiClientConfig['logLevel']): void {
    this.config.logLevel = level;
  }

  getLogLevel(): ApiClientConfig['logLevel'] {
    return this.config.logLevel;
  }

  // API client statistics
  getStats(): {
    requestCount: number;
    knownRoutes: number;
    missingRoutes: number;
    config: ApiClientConfig;
  } {
    return {
      requestCount: this.requestCounter,
      knownRoutes: this.knownRoutes.size,
      missingRoutes: this.missingRoutes.size,
      config: { ...this.config },
    };
  }

  // Reset statistics
  resetStats(): void {
    this.requestCounter = 0;
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient();

// Set up token provider for the default client
apiClient.setTokenProvider(() => tokenService.getToken());

// Export the class for custom instances if needed
export { ApiClient };