// Authentication Data Access Object

import { apiClient } from '../services/apiClient';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';

/**
 * Login user with email/NIF and password
 * @param credentials - Login credentials (identifier can be email or NIF)
 * @returns Promise<AuthResponse> - Authentication response with token and user data
 */
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response;
  } catch (error) {
    // Re-throw the error as it's already properly formatted by the API client
    throw error;
  }
}

/**
 * Register new user
 * @param userData - Registration data including user type selection
 * @returns Promise<AuthResponse> - Authentication response with token and user data
 */
export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/register', userData);
    return response;
  } catch (error) {
    // Re-throw the error as it's already properly formatted by the API client
    throw error;
  }
}

/**
 * Refresh authentication token
 * @returns Promise<AuthResponse> - New authentication response
 */
export async function refreshToken(): Promise<AuthResponse> {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/refresh');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user (invalidate token on server)
 * @returns Promise<void>
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post<void>('/auth/logout');
  } catch (error) {
    // Even if logout fails on server, we should still clear local token
    console.warn('Server logout failed:', error);
  }
}

/**
 * Verify current token validity
 * @returns Promise<boolean> - True if token is valid
 */
export async function verifyToken(): Promise<boolean> {
  try {
    await apiClient.get<void>('/auth/verify');
    return true;
  } catch (error) {
    return false;
  }
}