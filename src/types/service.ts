// Service related types and interfaces

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  providerId: string;
  providerName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ServiceCreateData {
  name: string;
  description: string;
  price: number;
}

export interface ServiceUpdateData {
  name?: string;
  description?: string;
  price?: number;
}

// Form data types
export interface ServiceForm {
  name: string;
  description: string;
  price: number;
}

// Service state management interfaces
export interface ServiceState {
  services: Service[];
  myServices: Service[];
  filters: ServiceFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
}

export interface ServiceActions {
  setServices: (services: Service[]) => void;
  setMyServices: (services: Service[]) => void;
  setFilters: (filters: ServiceFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotal: (total: number) => void;
  setHasMore: (hasMore: boolean) => void;
  addService: (service: Service) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  removeService: (id: string) => void;
  clearServices: () => void;
}