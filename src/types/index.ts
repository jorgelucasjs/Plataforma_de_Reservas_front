// Main types export file

// Authentication types
export * from './auth';

// User types
export * from './user';

// Service types
export * from './service';

// Booking types
export * from './booking';

// API types
export * from './api';

// Error types
export * from './error';

// Validation types
export * from './validation';

// UI types
export * from './ui';

// Common utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type ID = string;
export type Timestamp = string;

// Generic CRUD operations
export interface CrudOperations<T, CreateData, UpdateData> {
  create: (data: CreateData) => Promise<T>;
  read: (id: ID) => Promise<T>;
  update: (id: ID, data: UpdateData) => Promise<T>;
  delete: (id: ID) => Promise<void>;
  list: (filters?: any) => Promise<T[]>;
}

// Generic state management pattern
export interface BaseState {
  isLoading: boolean;
  error: string | null;
}

export interface BaseActions {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Route types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  isProtected: boolean;
  allowedRoles?: ('client' | 'provider')[];
  title?: string;
}

// Environment configuration
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'production' | 'test';
  version: string;
  features: {
    [key: string]: boolean;
  };
}