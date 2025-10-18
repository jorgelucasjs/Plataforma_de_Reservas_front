// Service Management Repository - Business logic layer for service CRUD operations

import * as serviceDao from '../dao/serviceDao';
import { useServiceStore } from '../stores/serviceStore';
import { useAuthStore } from '../stores/authStore';
import type { Service, ServiceFilters, ServiceCreateData, ServiceUpdateData } from '../types/service';
import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';

export class ServiceRepository {
  /**
   * Load all services with filtering and update store
   * @param filters - Optional filters for search, price range, sorting, and pagination
   * @returns Promise<Service[]> - List of services
   */
  async loadServices(filters?: ServiceFilters): Promise<Service[]> {
    const { setServices, setLoading, setError, setTotal, setHasMore, setFilters } = useServiceStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Update filters in store if provided
      if (filters) {
        setFilters(filters);
      }

      // Get current filters from store
      const currentFilters = filters || useServiceStore.getState().filters;

      // Load services from API
      const response = await serviceDao.getServices(currentFilters);

      // Update store with results
      if (currentFilters.offset === 0) {
        // New search/filter - replace services
        setServices(response.services);
      } else {
        // Pagination - append services
        const { services } = useServiceStore.getState();
        setServices([...services, ...response.services]);
      }

      setTotal(response.total);
      setHasMore(response.hasMore);

      return response.services;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load services created by current provider and update store
   * @param filters - Optional filters for pagination and sorting
   * @returns Promise<Service[]> - List of provider's services
   */
  async loadMyServices(filters?: ServiceFilters): Promise<Service[]> {
    const { setMyServices, setLoading, setError } = useServiceStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can access their services');
      }

      setLoading(true);
      setError(null);

      // Load provider's services from API
      const response = await serviceDao.getMyServices(filters);

      // Update store with results
      if (filters?.offset === 0 || !filters?.offset) {
        // New search/filter - replace services
        setMyServices(response.services);
      } else {
        // Pagination - append services
        const { myServices } = useServiceStore.getState();
        setMyServices([...myServices, ...response.services]);
      }

      return response.services;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create a new service (provider only)
   * @param serviceData - Service creation data
   * @returns Promise<Service> - Created service
   */
  async createService(serviceData: ServiceCreateData): Promise<Service> {
    const { addService, setLoading, setError } = useServiceStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can create services');
      }

      setLoading(true);
      setError(null);

      // Validate service data
      this.validateServiceData(serviceData);

      // Create service via API
      const newService = await serviceDao.createService(serviceData);

      // Add to store
      addService(newService);

      return newService;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update an existing service (provider only)
   * @param serviceId - Service ID to update
   * @param serviceData - Updated service data
   * @returns Promise<Service> - Updated service
   */
  async updateService(serviceId: string, serviceData: ServiceUpdateData): Promise<Service> {
    const { updateService: updateServiceInStore, setLoading, setError } = useServiceStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can update services');
      }

      setLoading(true);
      setError(null);

      // Validate service ID
      if (!serviceId || !serviceId.trim()) {
        throw this.createValidationError('Service ID is required');
      }

      // Validate service data
      this.validateServiceUpdateData(serviceData);

      // Check if user owns this service
      await this.validateServiceOwnership(serviceId);

      // Update service via API
      const updatedService = await serviceDao.updateService(serviceId, serviceData);

      // Update in store
      updateServiceInStore(serviceId, updatedService);

      return updatedService;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Delete a service (provider only)
   * @param serviceId - Service ID to delete
   * @returns Promise<void>
   */
  async deleteService(serviceId: string): Promise<void> {
    const { removeService, setLoading, setError } = useServiceStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can delete services');
      }

      setLoading(true);
      setError(null);

      // Validate service ID
      if (!serviceId || !serviceId.trim()) {
        throw this.createValidationError('Service ID is required');
      }

      // Check if user owns this service
      await this.validateServiceOwnership(serviceId);

      // Delete service via API
      await serviceDao.deleteService(serviceId);

      // Remove from store
      removeService(serviceId);
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Toggle service active status (provider only)
   * @param serviceId - Service ID to toggle
   * @param isActive - New active status
   * @returns Promise<Service> - Updated service
   */
  async toggleServiceStatus(serviceId: string, isActive: boolean): Promise<Service> {
    const { updateService: updateServiceInStore, setLoading, setError } = useServiceStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can toggle service status');
      }

      setLoading(true);
      setError(null);

      // Validate service ID
      if (!serviceId || !serviceId.trim()) {
        throw this.createValidationError('Service ID is required');
      }

      // Check if user owns this service
      await this.validateServiceOwnership(serviceId);

      // Toggle status via API
      const updatedService = await serviceDao.toggleServiceStatus(serviceId, isActive);

      // Update in store
      updateServiceInStore(serviceId, { isActive: updatedService.isActive });

      return updatedService;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Search services by query
   * @param query - Search query string
   * @param additionalFilters - Optional additional filters
   * @returns Promise<Service[]> - Search results
   */
  async searchServices(query: string, additionalFilters?: Omit<ServiceFilters, 'search'>): Promise<Service[]> {
    const searchFilters: ServiceFilters = {
      ...additionalFilters,
      search: query,
      offset: 0, // Reset pagination for new search
    };

    return await this.loadServices(searchFilters);
  }

  /**
   * Load more services (pagination)
   * @returns Promise<Service[]> - Additional services
   */
  async loadMoreServices(): Promise<Service[]> {
    const { filters, services } = useServiceStore.getState();
    
    const nextPageFilters: ServiceFilters = {
      ...filters,
      offset: services.length,
    };

    return await this.loadServices(nextPageFilters);
  }

  /**
   * Get service by ID
   * @param serviceId - Service ID to fetch
   * @returns Promise<Service> - Service details
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const { setLoading, setError } = useServiceStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate service ID
      if (!serviceId || !serviceId.trim()) {
        throw this.createValidationError('Service ID is required');
      }

      // Get service from API
      const service = await serviceDao.getServiceById(serviceId);
      return service;
    } catch (error) {
      const serviceError = this.handleServiceError(error);
      setError(serviceError.message);
      throw serviceError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Apply filters to service list
   * @param filters - Filters to apply
   * @returns Promise<Service[]> - Filtered services
   */
  async applyFilters(filters: ServiceFilters): Promise<Service[]> {
    // Reset pagination when applying new filters
    const filtersWithReset: ServiceFilters = {
      ...filters,
      offset: 0,
    };

    return await this.loadServices(filtersWithReset);
  }

  /**
   * Clear all filters and reload services
   * @returns Promise<Service[]> - All services
   */
  async clearFilters(): Promise<Service[]> {
    // Load services with default filters
    const defaultFilters: ServiceFilters = {
      search: '',
      minPrice: undefined,
      maxPrice: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    };

    return await this.loadServices(defaultFilters);
  }

  /**
   * Validate service ownership (provider can only modify their own services)
   * @param serviceId - Service ID to check
   */
  private async validateServiceOwnership(serviceId: string): Promise<void> {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw this.createAuthorizationError('Authentication required');
    }

    try {
      // Get service details to check ownership
      const service = await serviceDao.getServiceById(serviceId);
      
      if (service.providerId !== user.id) {
        throw this.createAuthorizationError('You can only modify your own services');
      }
    } catch (error) {
      // If we can't verify ownership, deny access
      if (error && typeof error === 'object' && 'type' in error && error.type === ErrorType.AUTHORIZATION_ERROR) {
        throw error;
      }
      throw this.createAuthorizationError('Unable to verify service ownership');
    }
  }

  /**
   * Validate service creation data
   * @param serviceData - Data to validate
   */
  private validateServiceData(serviceData: ServiceCreateData): void {
    if (!serviceData.name || !serviceData.name.trim()) {
      throw this.createValidationError('Service name is required');
    }

    if (serviceData.name.trim().length < 3) {
      throw this.createValidationError('Service name must be at least 3 characters long');
    }

    if (serviceData.name.trim().length > 100) {
      throw this.createValidationError('Service name must be less than 100 characters');
    }

    if (!serviceData.description || !serviceData.description.trim()) {
      throw this.createValidationError('Service description is required');
    }

    if (serviceData.description.trim().length < 10) {
      throw this.createValidationError('Service description must be at least 10 characters long');
    }

    if (serviceData.description.trim().length > 1000) {
      throw this.createValidationError('Service description must be less than 1000 characters');
    }

    if (serviceData.price === undefined || serviceData.price === null) {
      throw this.createValidationError('Service price is required');
    }

    if (serviceData.price <= 0) {
      throw this.createValidationError('Service price must be greater than 0');
    }

    if (serviceData.price > 999999.99) {
      throw this.createValidationError('Service price must be less than 1,000,000');
    }

    // Check for reasonable decimal places (max 2)
    if (serviceData.price % 0.01 !== 0) {
      throw this.createValidationError('Service price can have at most 2 decimal places');
    }
  }

  /**
   * Validate service update data
   * @param serviceData - Data to validate
   */
  private validateServiceUpdateData(serviceData: ServiceUpdateData): void {
    if (!serviceData || Object.keys(serviceData).length === 0) {
      throw this.createValidationError('No update data provided');
    }

    // Validate name if provided
    if (serviceData.name !== undefined) {
      if (!serviceData.name || !serviceData.name.trim()) {
        throw this.createValidationError('Service name cannot be empty');
      }
      if (serviceData.name.trim().length < 3) {
        throw this.createValidationError('Service name must be at least 3 characters long');
      }
      if (serviceData.name.trim().length > 100) {
        throw this.createValidationError('Service name must be less than 100 characters');
      }
    }

    // Validate description if provided
    if (serviceData.description !== undefined) {
      if (!serviceData.description || !serviceData.description.trim()) {
        throw this.createValidationError('Service description cannot be empty');
      }
      if (serviceData.description.trim().length < 10) {
        throw this.createValidationError('Service description must be at least 10 characters long');
      }
      if (serviceData.description.trim().length > 1000) {
        throw this.createValidationError('Service description must be less than 1000 characters');
      }
    }

    // Validate price if provided
    if (serviceData.price !== undefined) {
      if (serviceData.price <= 0) {
        throw this.createValidationError('Service price must be greater than 0');
      }
      if (serviceData.price > 999999.99) {
        throw this.createValidationError('Service price must be less than 1,000,000');
      }
      // Check for reasonable decimal places (max 2)
      if (serviceData.price % 0.01 !== 0) {
        throw this.createValidationError('Service price can have at most 2 decimal places');
      }
    }
  }

  /**
   * Handle service management errors and convert to AppError
   * @param error - Original error
   * @returns AppError - Formatted application error
   */
  private handleServiceError(error: unknown): AppError {
    // If it's already an AppError, return as is
    if (error && typeof error === 'object' && 'type' in error) {
      return error as AppError;
    }

    // Handle different error scenarios
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        message: 'Authentication required. Please log in again.',
        details: error
      };
    }

    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      return {
        type: ErrorType.AUTHORIZATION_ERROR,
        message: 'You do not have permission to perform this action.',
        details: error
      };
    }

    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'Service not found.',
        details: error
      };
    }

    if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
      return {
        type: ErrorType.CONFLICT_ERROR,
        message: 'A service with this name already exists.',
        details: error
      };
    }

    if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Invalid service data. Please check your input.',
        details: error
      };
    }

    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection and try again.',
        details: error
      };
    }

    // Default error
    return {
      type: ErrorType.INTERNAL_ERROR,
      message: errorMessage || 'An unexpected error occurred. Please try again.',
      details: error
    };
  }

  /**
   * Create validation error
   * @param message - Error message
   * @returns AppError - Validation error
   */
  private createValidationError(message: string): AppError {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message,
    };
  }

  /**
   * Create authorization error
   * @param message - Error message
   * @returns AppError - Authorization error
   */
  private createAuthorizationError(message: string): AppError {
    return {
      type: ErrorType.AUTHORIZATION_ERROR,
      message,
    };
  }
}

// Create and export singleton instance
export const serviceRepository = new ServiceRepository();