import { create } from 'zustand';
import type { ServiceState, ServiceActions, Service, ServiceFilters } from '../types/service';

// Combined interface for the service store
interface ServiceStore extends ServiceState, ServiceActions {}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  // Initial state
  services: [],
  myServices: [],
  filters: {
    search: '',
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 20,
    offset: 0,
  },
  isLoading: false,
  error: null,
  total: 0,
  hasMore: false,

  // Actions following the useXxxUiState pattern
  setServices: (services: Service[]) => {
    set({ services });
  },

  setMyServices: (myServices: Service[]) => {
    set({ myServices });
  },

  setFilters: (filters: ServiceFilters) => {
    const currentFilters = get().filters;
    set({ 
      filters: { 
        ...currentFilters, 
        ...filters 
      } 
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setTotal: (total: number) => {
    set({ total });
  },

  setHasMore: (hasMore: boolean) => {
    set({ hasMore });
  },

  addService: (service: Service) => {
    const { services, myServices } = get();
    
    // Add to general services list
    set({ services: [service, ...(services || [])] });
    
    // Add to myServices if it belongs to current user
    // Note: This will be determined by the repository layer
    set({ myServices: [service, ...(myServices || [])] });
  },

  updateService: (id: string, serviceUpdates: Partial<Service>) => {
    const { services, myServices } = get();
    
    // Update in general services list
    const updatedServices = (services || []).map(service =>
      service.id === id 
        ? { ...service, ...serviceUpdates, updatedAt: new Date().toISOString() }
        : service
    );
    
    // Update in myServices list
    const updatedMyServices = (myServices || []).map(service =>
      service.id === id 
        ? { ...service, ...serviceUpdates, updatedAt: new Date().toISOString() }
        : service
    );
    
    set({ 
      services: updatedServices,
      myServices: updatedMyServices 
    });
  },

  removeService: (id: string) => {
    const { services, myServices } = get();
    
    // Remove from general services list
    const filteredServices = (services || []).filter(service => service.id !== id);
    
    // Remove from myServices list
    const filteredMyServices = (myServices || []).filter(service => service.id !== id);
    
    set({ 
      services: filteredServices,
      myServices: filteredMyServices 
    });
  },

  clearServices: () => {
    set({ 
      services: [],
      myServices: [],
      total: 0,
      hasMore: false,
      error: null 
    });
  },
}));

// UI state hook following the useXxxUiState pattern
export const useServiceUiState = () => {
  const {
    services,
    myServices,
    filters,
    isLoading,
    error,
    total,
    hasMore,
    setServices,
    setMyServices,
    setFilters,
    setLoading,
    setError,
    setTotal,
    setHasMore,
    addService,
    updateService,
    removeService,
    clearServices,
  } = useServiceStore();

  return {
    // State
    services,
    myServices,
    filters,
    isLoading,
    error,
    total,
    hasMore,
    
    // Actions
    setServices,
    setMyServices,
    setFilters,
    setLoading,
    setError,
    setTotal,
    setHasMore,
    addService,
    updateService,
    removeService,
    clearServices,
    
    // Computed values
    hasServices: services?.length > 0,
    hasMyServices: myServices?.length > 0,
    isSearching: Boolean(filters.search),
    isFiltered: Boolean(filters.minPrice || filters.maxPrice),
    
    // Helper methods for filters
    updateSearch: (search: string) => {
      setFilters({ ...filters, search, offset: 0 });
    },
    
    updatePriceRange: (minPrice?: number, maxPrice?: number) => {
      setFilters({ ...filters, minPrice, maxPrice, offset: 0 });
    },
    
    updateSorting: (sortBy: 'name' | 'price' | 'createdAt', sortOrder: 'asc' | 'desc') => {
      setFilters({ ...filters, sortBy, sortOrder, offset: 0 });
    },
    
    resetFilters: () => {
      setFilters({
        search: '',
        minPrice: undefined,
        maxPrice: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 20,
        offset: 0,
      });
    },
  };
};