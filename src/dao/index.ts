import type { AuthResponse, User, Service, Booking } from "@/types";
import apiClient from "./apiClient";

export const authDao = {
  register: (data: {
    fullName: string;
    nif: string;
    email: string;
    password: string;
    userType: "client" | "provider";
  }) => apiClient.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResponse>("/auth/login", data),
};

export const userDao = {
  getProfile: () => apiClient.get<User>("/users/profile"),

  getBalance: () => apiClient.get<{ data: { balance: number } }>("/users/balance"),

  addBalance: (data: { email: string; amount: number }) =>
    apiClient.post<{ success: boolean; message: string; user: User }>("/auth/add-balance", data),
};

export const serviceDao = {
  create: (data: {
    name: string;
    description: string;
    price: number;
  }) => apiClient.post<Service>("/services", data),

  getAll: (params?: {
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) => apiClient.get<{ data: { services: Service[]; total: number } }>("/services", params),

  getMy: () => apiClient.get<{ data: { services: Service[]; total: number } }>("/services/my"),

  getByProvider: (providerId: string) => 
    apiClient.get<{ data: { services: Service[]; total: number } }>(`/services/provider/${providerId}`),

  update: (id: string, data: { name?: string; price?: number; isActive?: boolean }) =>
    apiClient.post<Service>(`/services/${id}`, data),

  delete: (id: string) => apiClient.delete(`/services/${id}`),
};

export const bookingDao = {
  create: (data: {
    serviceId: string;
    scheduledDate?: string;
    notes?: string;
  }) => apiClient.post<Booking>("/bookings", data),

  getMy: () => apiClient.get<{ data: { bookings: Booking[]; count: number; userType: string } }>("/bookings/my"),

  cancel: (id: string, reason?: string) =>
    apiClient.put(`/bookings/${id}/cancel`, { cancellationReason: reason }),

  getHistory: (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    minAmount?: number;
    maxAmount?: number;
    serviceId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) => apiClient.get<{ data: { bookings: Booking[]; count: number } }>("/bookings/history", params),
};