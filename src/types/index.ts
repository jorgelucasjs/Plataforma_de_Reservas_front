export interface User {
  id: string;
  fullName: string;
  email: string;
  nif: string;
  userType: "client" | "provider";
  balance: number;
  createdAt: string;
  isActive: boolean;
}

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
  status: "confirmed" | "cancelled";
  createdAt: string;
  cancellationReason?: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  details?: Record<string, any>;
}
