// Service Management Data Access Object - Provider Only

import type { Service, ServiceFilters, ServiceCreateData, ServiceUpdateData } from '../types/service';

const BASE_URL = 'http://127.0.0.1:5002/angolaeventos-cd238/us-central1/sistemaDeReservaServer';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJZVmVlMFIzSXJRd1N0OEtrUFpFdiIsImVtYWlsIjoicHJvdmlkZXJAZXhlbXBsby5jb20iLCJ1c2VyVHlwZSI6InByb3ZpZGVyIiwiaWF0IjoxNzYwODU5OTc0LCJleHAiOjE3NjA5NDYzNzQsImlzcyI6ImJvb2tpbmctcGxhdGZvcm0tYXBpIn0.zT4bewS2cffrBSnhXPshkij8HlbTxbP0_owDNYm-D4w';

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
 */
export async function getServices(filters?: ServiceFilters): Promise<ServiceListResponse> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${AUTH_TOKEN}`);

  const params = new URLSearchParams();
  if (filters?.search) params.append('search', filters.search);
  if (filters?.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters?.limit !== undefined) params.append('limit', filters.limit.toString());
  if (filters?.offset !== undefined) params.append('offset', filters.offset.toString());

  const queryString = params.toString();
  const url = queryString ? `${BASE_URL}/services?${queryString}` : `${BASE_URL}/services`;

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
    redirect: "follow"
  };

  const response = await fetch(url, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Create a new service (provider only)
 */
export async function createService(serviceData: ServiceCreateData): Promise<Service> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${AUTH_TOKEN}`);

  const requestOptions: RequestInit = {
    method: "POST",
    headers: headers,
    body: JSON.stringify(serviceData),
    redirect: "follow"
  };

  const response = await fetch(`${BASE_URL}/services`, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Update an existing service (provider only)
 */
export async function updateService(serviceId: string, serviceData: ServiceUpdateData): Promise<Service> {
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${AUTH_TOKEN}`);

  const requestOptions: RequestInit = {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(serviceData),
    redirect: "follow"
  };

  const response = await fetch(`${BASE_URL}/services/${serviceId}`, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Delete a service (provider only)
 */
export async function deleteService(serviceId: string): Promise<void> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${AUTH_TOKEN}`);

  const requestOptions: RequestInit = {
    method: "DELETE",
    headers: headers,
    redirect: "follow"
  };

  const response = await fetch(`${BASE_URL}/services/${serviceId}`, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

/**
 * Get service by ID
 */
export async function getServiceById(serviceId: string): Promise<Service> {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${AUTH_TOKEN}`);

  const requestOptions: RequestInit = {
    method: "GET",
    headers: headers,
    redirect: "follow"
  };

  const response = await fetch(`${BASE_URL}/services/${serviceId}`, requestOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}