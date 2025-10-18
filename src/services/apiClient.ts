// Centralized API client with request/response interceptors

import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';
import { tokenService } from './tokenService';
import { globalErrorService } from './globalErrorService';
import { retryService } from './retryService';
import { cacheService, staticDataCache } from './cacheService';

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
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  enableRetry: true,
  enableGlobalErrorHandling: true,
  maxRetries: 3,
  enableCaching: true,
  defaultCacheTTL: 5 * 60 * 1000, // 5 minutes
};

class ApiClient {
  private config: ApiClientConfig;
  private tokenProvider: (() => string | null) | null = null;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // Set token provider function
  setTokenProvider(provider: () => string | null) {
    this.tokenProvider = provider;
  }

  // Request interceptor - adds authentication headers and handles request setup
  private async prepareRequest(url: string, options: RequestInit = {}): Promise<[string, RequestInit]> {
    const fullUrl = url.startsWith('http') ? url : `${this.config.baseURL}${url}`;
    
    // Prepare headers
    const headers = new Headers(options.headers);
    
    // Add default headers
    Object.entries(this.config.headers || {}).forEach(([key, value]) => {
      if (!headers.has(key)) {
        headers.set(key, value);
      }
    });

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

    return [fullUrl, requestOptions];
  }

  // Response interceptor - handles response transformation and error mapping
  private async handleResponse<T>(response: Response): Promise<T> {
    let responseData: any;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
    } catch (error) {
      throw createAppError({
        type: ErrorType.NETWORK_ERROR,
        message: 'Failed to parse response',
        details: error,
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
    this.handleErrorResponse(response.status, responseData);
  }

  // Error response handler
  private handleErrorResponse(status: number, responseData: any): never {
    let errorType: ErrorType;
    let message = 'An error occurred';
    let details = responseData;

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
        message = responseData?.message || 'Resource not found';
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

  // Execute request with optional retry and error handling
  private async executeRequest<T>(
    url: string,
    options: RequestInit = {},
    context?: string
  ): Promise<T> {
    const requestFn = async (): Promise<T> => {
      const [fullUrl, requestOptions] = await this.prepareRequest(url, options);
      
      try {
        const response = await fetch(fullUrl, requestOptions);
        return this.handleResponse<T>(response);
      } catch (error) {
        if (error && typeof error === 'object' && 'type' in error) {
          throw error;
        }
        throw createAppError({
          type: ErrorType.NETWORK_ERROR,
          message: 'Network request failed',
          details: error,
        });
      }
    };

    try {
      if (this.config.enableRetry) {
        return await retryService.retryApiCall(
          requestFn,
          context || `${options.method || 'GET'} ${url}`,
          {
            maxRetries: this.config.maxRetries,
            onRetry: (error, attempt) => {
              console.log(`Retrying request ${context || url} (attempt ${attempt}):`, error.message);
            },
          }
        );
      } else {
        return await requestFn();
      }
    } catch (error) {
      if (this.config.enableGlobalErrorHandling) {
        const { generalError } = globalErrorService.handleApiError(error, { url, method: options.method });
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
}

// Create and export the default API client instance
export const apiClient = new ApiClient();

// Set up token provider for the default client
apiClient.setTokenProvider(() => tokenService.getToken());

// Export the class for custom instances if needed
export { ApiClient };