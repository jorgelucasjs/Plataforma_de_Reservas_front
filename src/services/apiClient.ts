// Centralized API client with request/response interceptors

import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';
import { tokenService } from './tokenService';

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
}

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
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

  // HTTP Methods
  async get<T>(url: string, options: RequestInit = {}): Promise<T> {
    const [fullUrl, requestOptions] = await this.prepareRequest(url, {
      ...options,
      method: 'GET',
    });

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
  }

  async post<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const [fullUrl, requestOptions] = await this.prepareRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

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
  }

  async put<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const [fullUrl, requestOptions] = await this.prepareRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

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
  }

  async patch<T>(url: string, data?: any, options: RequestInit = {}): Promise<T> {
    const [fullUrl, requestOptions] = await this.prepareRequest(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });

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
  }

  async delete<T>(url: string, options: RequestInit = {}): Promise<T> {
    const [fullUrl, requestOptions] = await this.prepareRequest(url, {
      ...options,
      method: 'DELETE',
    });

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
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient();

// Set up token provider for the default client
apiClient.setTokenProvider(() => tokenService.getToken());

// Export the class for custom instances if needed
export { ApiClient };