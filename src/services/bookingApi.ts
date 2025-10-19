// Booking API Service - Implementação baseada no guia da API
import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '../types/auth';

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

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
  scheduledDate?: string;
  notes?: string;
}

export interface ServiceFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface BookingHistoryFilters {
  startDate?: string;
  endDate?: string;
  status?: 'confirmed' | 'cancelled';
  minAmount?: number;
  maxAmount?: number;
  serviceId?: string;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  price?: number;
  isActive?: boolean;
}

class BookingAPIClass {
  setToken(_token: string | null): void {
    // Token é gerenciado pelo apiClient através do tokenService
    // Este método é mantido para compatibilidade
  }

  // Autenticação
  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email: credentials.identifier,
      password: credentials.password
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  // Utilizadores
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  async getBalance(): Promise<{ balance: number }> {
    return apiClient.get<{ balance: number }>(API_CONFIG.ENDPOINTS.USERS.BALANCE);
  }

  // Serviços
  async getServices(filters: ServiceFilters = {}): Promise<{
    services: Service[];
    total: number;
  }> {
    const queryString = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    const url = `${API_CONFIG.ENDPOINTS.SERVICES.LIST}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    return apiClient.get<{ services: Service[]; total: number }>(url);
  }

  async createService(serviceData: CreateServiceData): Promise<Service> {
    return apiClient.post<Service>(API_CONFIG.ENDPOINTS.SERVICES.CREATE, serviceData);
  }

  async getMyServices(): Promise<{
    services: Service[];
    total: number;
  }> {
    return apiClient.get<{ services: Service[]; total: number }>(API_CONFIG.ENDPOINTS.SERVICES.MY_SERVICES);
  }

  async updateService(serviceId: string, updateData: UpdateServiceData): Promise<Service> {
    return apiClient.put<Service>(API_CONFIG.ENDPOINTS.SERVICES.UPDATE(serviceId), updateData);
  }

  async deleteService(serviceId: string): Promise<void> {
    return apiClient.delete<void>(API_CONFIG.ENDPOINTS.SERVICES.DELETE(serviceId));
  }

  // Reservas
  async createBooking(bookingData: {
    serviceId: string;
    scheduledDate?: string;
    notes?: string;
  }): Promise<Booking> {
    return apiClient.post<Booking>(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, bookingData);
  }

  async getMyBookings(): Promise<{
    bookings: Booking[];
    count: number;
    userType: string;
  }> {
    return apiClient.get<{
      bookings: Booking[];
      count: number;
      userType: string;
    }>(API_CONFIG.ENDPOINTS.BOOKINGS.MY_BOOKINGS);
  }

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const body = reason ? { cancellationReason: reason } : {};
    return apiClient.put<Booking>(API_CONFIG.ENDPOINTS.BOOKINGS.CANCEL(bookingId), body);
  }

  async getBookingHistory(filters: BookingHistoryFilters = {}): Promise<{
    bookings: Booking[];
    total: number;
    hasMore: boolean;
    filters: any;
    userType: string;
  }> {
    const queryString = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    });

    const url = `${API_CONFIG.ENDPOINTS.BOOKINGS.HISTORY}${queryString.toString() ? `?${queryString.toString()}` : ''}`;
    return apiClient.get<{
      bookings: Booking[];
      total: number;
      hasMore: boolean;
      filters: any;
      userType: string;
    }>(url);
  }

  // Administração
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return apiClient.get<{ status: string; timestamp: string }>(API_CONFIG.ENDPOINTS.ADMIN.HEALTH);
  }

  async getSystemStatus(): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ADMIN.STATUS);
  }
}

// Instância padrão da API
export const bookingApi = new BookingAPIClass();

// Exportar a classe para instâncias customizadas
export { BookingAPIClass as BookingAPI };