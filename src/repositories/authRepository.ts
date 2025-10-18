// Authentication Repository - Business logic layer for authentication

import * as authDao from '../dao/authDao';
import { useAuthStore } from '../stores/authStore';
import { tokenService } from '../services/tokenService';
import type { LoginCredentials, RegisterData, AuthResponse } from '../types/auth';
import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';

export class AuthRepository {
  /**
   * Login user with credentials and update auth store
   * @param credentials - Login credentials (email/NIF and password)
   * @returns Promise<AuthResponse> - Authentication response
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { setUser, setToken, setIsAuthenticated, setLoading, setError } = useAuthStore.getState();
    
    try {
      // Set loading state
      setLoading(true);
      setError(null);

      // Validate credentials
      this.validateLoginCredentials(credentials);

      // Call DAO to authenticate
      const response = await authDao.loginUser(credentials);

      // Save token to storage
      tokenService.saveToken(response.token, response.expiresIn);

      // Update auth store
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      // Handle authentication errors
      const authError = this.handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Register new user and update auth store
   * @param userData - Registration data
   * @returns Promise<AuthResponse> - Authentication response
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    const { setUser, setToken, setIsAuthenticated, setLoading, setError } = useAuthStore.getState();
    
    try {
      // Set loading state
      setLoading(true);
      setError(null);

      // Validate registration data
      this.validateRegistrationData(userData);

      // Call DAO to register
      const response = await authDao.registerUser(userData);

      // Save token to storage
      tokenService.saveToken(response.token, response.expiresIn);

      // Update auth store
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      // Handle registration errors
      const authError = this.handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Logout user and clear auth state
   */
  async logout(): Promise<void> {
    const { logout: clearAuthState, setLoading, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Call server logout (optional - continues even if it fails)
      await authDao.logoutUser();
    } catch (error) {
      // Log error but don't prevent logout
      console.warn('Server logout failed:', error);
    } finally {
      // Always clear local auth state
      clearAuthState();
      setLoading(false);
    }
  }

  /**
   * Refresh authentication token
   * @returns Promise<AuthResponse> - New authentication response
   */
  async refreshToken(): Promise<AuthResponse> {
    const { setUser, setToken, setIsAuthenticated, setLoading, setError } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Call DAO to refresh token
      const response = await authDao.refreshToken();

      // Save new token to storage
      tokenService.saveToken(response.token, response.expiresIn);

      // Update auth store
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (error) {
      // If refresh fails, logout user
      const { logout: clearAuthState } = useAuthStore.getState();
      clearAuthState();
      
      const authError = this.handleAuthError(error);
      setError(authError.message);
      throw authError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Verify current token and update auth state
   * @returns Promise<boolean> - True if token is valid
   */
  async verifyToken(): Promise<boolean> {
    const { setIsAuthenticated, setError } = useAuthStore.getState();
    
    try {
      // Check if token exists locally
      if (!tokenService.hasValidToken()) {
        setIsAuthenticated(false);
        return false;
      }

      // Verify token with server
      const isValid = await authDao.verifyToken();
      
      if (!isValid) {
        // Clear invalid token
        const { logout: clearAuthState } = useAuthStore.getState();
        clearAuthState();
        return false;
      }

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      // On verification error, assume token is invalid
      const { logout: clearAuthState } = useAuthStore.getState();
      clearAuthState();
      setError('Session verification failed');
      return false;
    }
  }

  /**
   * Initialize authentication state on app startup
   */
  async initializeAuth(): Promise<void> {
    const { setLoading } = useAuthStore.getState();
    
    try {
      setLoading(true);

      // Check if we have a valid token
      if (tokenService.hasValidToken()) {
        // Verify token with server
        await this.verifyToken();
      } else {
        // No valid token, ensure auth state is cleared
        const { logout: clearAuthState } = useAuthStore.getState();
        clearAuthState();
      }
    } catch (error) {
      // On initialization error, clear auth state
      const { logout: clearAuthState } = useAuthStore.getState();
      clearAuthState();
      console.warn('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Validate login credentials
   * @param credentials - Login credentials to validate
   */
  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials.identifier || !credentials.identifier.trim()) {
      throw this.createValidationError('Email or NIF is required');
    }

    if (!credentials.password || !credentials.password.trim()) {
      throw this.createValidationError('Password is required');
    }

    // Basic email or NIF format validation
    const identifier = credentials.identifier.trim();
    const isEmail = identifier.includes('@');
    const isNIF = /^\d{9}$/.test(identifier);

    if (!isEmail && !isNIF) {
      throw this.createValidationError('Please enter a valid email or 9-digit NIF');
    }
  }

  /**
   * Validate registration data
   * @param userData - Registration data to validate
   */
  private validateRegistrationData(userData: RegisterData): void {
    if (!userData.fullName || !userData.fullName.trim()) {
      throw this.createValidationError('Full name is required');
    }

    if (!userData.email || !userData.email.trim()) {
      throw this.createValidationError('Email is required');
    }

    if (!userData.nif || !userData.nif.trim()) {
      throw this.createValidationError('NIF is required');
    }

    if (!userData.password || !userData.password.trim()) {
      throw this.createValidationError('Password is required');
    }

    if (!userData.userType) {
      throw this.createValidationError('User type is required');
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw this.createValidationError('Please enter a valid email address');
    }

    // NIF format validation (9 digits)
    if (!/^\d{9}$/.test(userData.nif)) {
      throw this.createValidationError('NIF must be exactly 9 digits');
    }

    // Password strength validation
    if (userData.password.length < 6) {
      throw this.createValidationError('Password must be at least 6 characters long');
    }

    // User type validation
    if (!['client', 'provider'].includes(userData.userType)) {
      throw this.createValidationError('User type must be either client or provider');
    }
  }

  /**
   * Handle authentication errors and convert to AppError
   * @param error - Original error
   * @returns AppError - Formatted application error
   */
  private handleAuthError(error: any): AppError {
    // If it's already an AppError, return as is
    if (error && typeof error === 'object' && 'type' in error) {
      return error as AppError;
    }

    // Handle different error scenarios
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        message: 'Invalid credentials. Please check your email/NIF and password.',
        details: error
      };
    }

    if (error?.message?.includes('409') || error?.message?.includes('Conflict')) {
      return {
        type: ErrorType.CONFLICT_ERROR,
        message: 'An account with this email or NIF already exists.',
        details: error
      };
    }

    if (error?.message?.includes('400') || error?.message?.includes('Bad Request')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Please check your input and try again.',
        details: error
      };
    }

    if (error?.message?.includes('Network') || error?.message?.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection and try again.',
        details: error
      };
    }

    // Default error
    return {
      type: ErrorType.INTERNAL_ERROR,
      message: error?.message || 'An unexpected error occurred. Please try again.',
      details: error
    };
  }

  /**
   * Create validation error
   * @param message - Error message
   * @returns AppError - Validation error
   */
  private createValidationError(message: string): AppError {
    return {
      type: ErrorType.VALIDATION_ERROR,
      message,
    };
  }
}

// Create and export singleton instance
export const authRepository = new AuthRepository();