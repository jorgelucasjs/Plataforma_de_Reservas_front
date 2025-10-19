// Hook para gerenciar serviços
import { useState, useCallback } from 'react';
import { serviceService } from '../services/serviceService';
import type { 
  Service, 
  ServiceFilters, 
  CreateServiceData, 
  UpdateServiceData 
} from '../services/bookingApi';

export interface UseServicesReturn {
  services: Service[];
  loading: boolean;
  error: string | null;
  total: number;
  
  // Actions
  getServices: (filters?: ServiceFilters) => Promise<void>;
  createService: (serviceData: CreateServiceData) => Promise<Service>;
  updateService: (serviceId: string, updateData: UpdateServiceData) => Promise<Service>;
  deleteService: (serviceId: string) => Promise<void>;
  getMyServices: () => Promise<void>;
  searchServices: (searchTerm: string, filters?: Omit<ServiceFilters, 'search'>) => Promise<void>;
  clearError: () => void;
  refreshServices: () => Promise<void>;
}

export const useServices = (): UseServicesReturn => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [lastFilters, setLastFilters] = useState<ServiceFilters>({});

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getServices = useCallback(async (filters: ServiceFilters = {}) => {
    await handleRequest(
      () => serviceService.getServices(filters),
      (result) => {
        setServices(result.services);
        setTotal(result.total);
        setLastFilters(filters);
      }
    );
  }, [handleRequest]);

  const createService = useCallback(async (serviceData: CreateServiceData): Promise<Service> => {
    return handleRequest(
      () => serviceService.createService(serviceData),
      () => {
        // Refresh services after creation
        getServices(lastFilters);
      }
    );
  }, [handleRequest, getServices, lastFilters]);

  const updateService = useCallback(async (serviceId: string, updateData: UpdateServiceData): Promise<Service> => {
    return handleRequest(
      () => serviceService.updateService(serviceId, updateData),
      () => {
        // Refresh services after update
        getServices(lastFilters);
      }
    );
  }, [handleRequest, getServices, lastFilters]);

  const deleteService = useCallback(async (serviceId: string): Promise<void> => {
    return handleRequest(
      () => serviceService.deleteService(serviceId),
      () => {
        // Remove service from local state
        setServices(prev => prev.filter(s => s.id !== serviceId));
        setTotal(prev => prev - 1);
      }
    );
  }, [handleRequest]);

  const getMyServices = useCallback(async () => {
    await handleRequest(
      () => serviceService.getMyServices(),
      (result) => {
        setServices(result.services);
        setTotal(result.total);
      }
    );
  }, [handleRequest]);

  const searchServices = useCallback(async (
    searchTerm: string, 
    filters: Omit<ServiceFilters, 'search'> = {}
  ) => {
    const searchFilters = { ...filters, search: searchTerm };
    await getServices(searchFilters);
  }, [getServices]);

  const refreshServices = useCallback(async () => {
    await getServices(lastFilters);
  }, [getServices, lastFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    services,
    loading,
    error,
    total,
    getServices,
    createService,
    updateService,
    deleteService,
    getMyServices,
    searchServices,
    clearError,
    refreshServices,
  };
};