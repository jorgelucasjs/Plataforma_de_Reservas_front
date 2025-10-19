// Service Management Repository - Simplified for Provider Only

import * as serviceDao from '../dao/serviceDao';
import { useServiceStore } from '../stores/serviceStore';
import type { Service, ServiceFilters, ServiceCreateData, ServiceUpdateData } from '../types/service';
import { CURRENT_USER_INFO } from '@/utils/LocalstorageKeys';

export class ServiceRepository {
  /**
   * Load all services with filtering
   */
  async loadServices(filters?: ServiceFilters): Promise<Service[]> {
    const { setServices, setLoading, setError } = useServiceStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      const response = await serviceDao.getServices(filters);
      setServices(response.services);

      return response.services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load provider's services
   */
  async loadMyServices(filters?: ServiceFilters): Promise<Service[]> {
    const { setMyServices, setLoading, setError } = useServiceStore.getState();
    
    try {
      if (!CURRENT_USER_INFO || CURRENT_USER_INFO.userType !== 'provider') {
        throw new Error('Only providers can access their services');
      }

      setLoading(true);
      setError(null);

      const response = await serviceDao.getServices(filters);
      setMyServices(response.services);

      return response.services;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Create a new service
   */
  async createService(serviceData: ServiceCreateData): Promise<Service> {
    const { addService, setLoading, setError } = useServiceStore.getState();
    
    try {
      if (!CURRENT_USER_INFO || CURRENT_USER_INFO.userType !== 'provider') {
        throw new Error('Only providers can create services');
      }

      setLoading(true);
      setError(null);

      const newService = await serviceDao.createService(serviceData);
      addService(newService);

      return newService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create service';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update an existing service
   */
  async updateService(serviceId: string, serviceData: ServiceUpdateData): Promise<Service> {
    const { updateService: updateServiceInStore, setLoading, setError } = useServiceStore.getState();
    
    try {
      if (!CURRENT_USER_INFO || CURRENT_USER_INFO.userType !== 'provider') {
        throw new Error('Only providers can update services');
      }

      setLoading(true);
      setError(null);

      const updatedService = await serviceDao.updateService(serviceId, serviceData);
      updateServiceInStore(serviceId, updatedService);

      return updatedService;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update service';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Delete a service
   */
  async deleteService(serviceId: string): Promise<void> {
    const { removeService, setLoading, setError } = useServiceStore.getState();
    
    try {
      if (!CURRENT_USER_INFO || CURRENT_USER_INFO.userType !== 'provider') {
        throw new Error('Only providers can delete services');
      }

      setLoading(true);
      setError(null);

      await serviceDao.deleteService(serviceId);
      removeService(serviceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete service';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(serviceId: string): Promise<Service> {
    const { setLoading, setError } = useServiceStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      return await serviceDao.getServiceById(serviceId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get service';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }
}

export const serviceRepository = new ServiceRepository();