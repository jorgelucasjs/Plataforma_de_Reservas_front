// Authentication related types and interfaces

export type UserType = 'client' | 'provider';

export interface User {
  id: string;
  fullName: string;
  email: string;
  nif: string;
  userType: UserType;
  balance: number;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  identifier: string; // email or NIF
  password: string;
}

export interface RegisterData {
  fullName: string;
  nif: string;
  email: string;
  password: string;
  userType: UserType;
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  user: User;
}

// Form data types
export interface LoginForm {
  identifier: string;
  password: string;
}

export interface RegisterForm {
  fullName: string;
  nif: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: UserType;
}

// Auth state management interfaces
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  lastTokenCheck: number;
}

export interface AuthActions {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (isAuth: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsInitialized: (isInitialized: boolean) => void;
  setLastTokenCheck: (timestamp: number) => void;
  logout: () => void;
}