import { useEffect, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { tokenService } from '../services/tokenService';
import { authRepository } from '../repositories/authRepository';

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    lastTokenCheck,
    setToken,
    setIsAuthenticated,
    setLoading,
    setError,
    setIsInitialized,
    setLastTokenCheck,
    logout: storeLogout,
  } = useAuthStore();

  // Initialize authentication state on mount
  const initializeAuth = useCallback(async () => {
    if (isInitialized) {
      return; // Already initialized
    }

    try {
      await authRepository.initializeAuth();
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
      setIsInitialized(true); // Mark as initialized even on error
    }
  }, [isInitialized, setError, setIsInitialized]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Auto-refresh token before expiration and periodic verification
  useEffect(() => {
    if (!token || !isAuthenticated || !isInitialized) return;

    const checkTokenExpiration = async () => {
      // Check if we need to verify token (every 5 minutes)
      const now = Date.now();
      const timeSinceLastCheck = now - lastTokenCheck;
      const FIVE_MINUTES = 5 * 60 * 1000;

      if (timeSinceLastCheck > FIVE_MINUTES) {
        try {
          const isValid = await authRepository.verifyTokenWithServer();
          if (!isValid) {
            logout();
          }
        } catch (error) {
          console.warn('Token verification failed:', error);
          // Don't logout on network errors, just log the warning
        }
      } else if (!tokenService.isTokenValid(token)) {
        // Local token validation failed
        logout();
      }
    };

    // Check token validity every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated, isInitialized, lastTokenCheck]);

  const login = async (credentials: { identifier: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authRepository.login(credentials);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    fullName: string;
    nif: string;
    email: string;
    password: string;
    confirmPassword: string;
    userType: 'client' | 'provider';
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authRepository.register(userData);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    tokenService.removeToken();
    storeLogout();
  }, [storeLogout]);

  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  // Verify token with server (useful for components that need to ensure auth state)
  const verifyAuth = useCallback(async () => {
    if (!isInitialized) {
      await initializeAuth();
      return;
    }

    if (token && isAuthenticated) {
      try {
        const isValid = await authRepository.verifyTokenWithServer();
        if (!isValid) {
          logout();
        }
      } catch (error) {
        console.warn('Auth verification failed:', error);
      }
    }
  }, [isInitialized, token, isAuthenticated, initializeAuth, logout]);

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    isInitialized,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    initializeAuth,
    verifyAuth,
    
    // Computed values
    isClient: user?.userType === 'client',
    isProvider: user?.userType === 'provider',
  };
}