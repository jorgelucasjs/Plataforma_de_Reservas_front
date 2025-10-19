// Service Management Data Access Object

import { apiClient } from '../services/apiClient';
import type { Service, ServiceFilters, ServiceCreateData, ServiceUpdateData } from '../types/service';

// Service list response interface
export interface ServiceListResponse {
  services: Service[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

/**
 * Get all services with optional filtering and pagination
 * @param filters - Optional filters for search, price range, sorting, and pagination
 * @returns Promise<ServiceListResponse> - List of services with pagination info
 */
export async function getServices(filters?: ServiceFilters): Promise<ServiceListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.minPrice !== undefined) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice !== undefined) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/services?${queryString}` : '/services';
    
    const response = await apiClient.get<ServiceListResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get services created by the current provider
 * @param filters - Optional filters for pagination and sorting
 * @returns Promise<ServiceListResponse> - List of provider's services
 */
export async function getMyServices(filters?: ServiceFilters): Promise<ServiceListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/services/my-services?${queryString}` : '/services/my-services';
    
    try {
      const response = await apiClient.get<ServiceListResponse>(url);
      return response;
    } catch (error) {
      // Enhanced error handling for missing route
      if (error && typeof error === 'object' && 'type' in error && error.type === 'NOT_FOUND') {
        console.warn('my-services route not found, attempting fallback to general services with provider filter');
        
        // Fallback: Use general services endpoint with provider filtering
        // This assumes the backend can filter by current user when no specific endpoint exists
        const fallbackParams = new URLSearchParams(params);
        fallbackParams.append('provider', 'current'); // Backend should filter by current user
        
        const fallbackQueryString = fallbackParams.toString();
        const fallbackUrl = fallbackQueryString ? `/services?${fallbackQueryString}` : '/services?provider=current';
        
        try {
          const fallbackResponse = await apiClient.get<ServiceListResponse>(fallbackUrl);
          
          // Log successful fallback for monitoring
          console.info('Successfully used fallback route for my-services', {
            originalUrl: url,
            fallbackUrl,
            timestamp: new Date().toISOString()
          });
          
          return fallbackResponse;
        } catch (fallbackError) {
          console.error('Fallback route also failed:', fallbackError);
          throw error; // Throw original error
        }
      }
      
      throw error;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Get service by ID
 * @param serviceId - Service ID to fetch
 * @returns Promise<Service> - Service details
 */
export async function getServiceById(serviceId: string): Promise<Service> {
  try {
    const response = await apiClient.get<Service>(`/services/${serviceId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a new service (provider only)
 * @param serviceData - Service creation data
 * @returns Promise<Service> - Created service
 */
export async function createService(serviceData: ServiceCreateData): Promise<Service> {
  try {
    const response = await apiClient.post<Service>('/services', serviceData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Update an existing service (provider only)
 * @param serviceId - Service ID to update
 * @param serviceData - Updated service data
 * @returns Promise<Service> - Updated service
 */
export async function updateService(serviceId: string, serviceData: ServiceUpdateData): Promise<Service> {
  try {
    const response = await apiClient.put<Service>(`/services/${serviceId}`, serviceData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Delete a service (provider only)
 * @param serviceId - Service ID to delete
 * @returns Promise<void>
 */
export async function deleteService(serviceId: string): Promise<void> {
  try {
    await apiClient.delete<void>(`/services/${serviceId}`);
  } catch (error) {
    throw error;
  }
}

/**
 * Toggle service active status (provider only)
 * @param serviceId - Service ID to toggle
 * @param isActive - New active status
 * @returns Promise<Service> - Updated service
 */
export async function toggleServiceStatus(serviceId: string, isActive: boolean): Promise<Service> {
  try {
    const response = await apiClient.patch<Service>(`/services/${serviceId}/status`, { isActive });
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Search services by name or description
 * @param query - Search query string
 * @param filters - Optional additional filters
 * @returns Promise<ServiceListResponse> - Search results
 */
export async function searchServices(query: string, filters?: Omit<ServiceFilters, 'search'>): Promise<ServiceListResponse> {
  try {
    const searchFilters: ServiceFilters = {
      ...filters,
      search: query,
    };
    
    return await getServices(searchFilters);
  } catch (error) {
    throw error;
  }
}