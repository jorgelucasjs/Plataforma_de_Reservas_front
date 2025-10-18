import { useEffect } from 'react';
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
    setToken,
    setIsAuthenticated,
    setLoading,
    setError,
    logout: storeLogout,
  } = useAuthStore();

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        const storedToken = tokenService.getToken();
        
        if (storedToken && tokenService.isTokenValid(storedToken)) {
          // Token exists and is valid, verify with server and get user data
          setToken(storedToken);
          
          try {
            // This would typically be a "me" endpoint to get current user
            // For now, we'll assume the token is valid and set authenticated
            setIsAuthenticated(true);
          } catch (error) {
            // Token is invalid, clear it
            tokenService.removeToken();
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
          // No valid token found
          tokenService.removeToken();
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [setToken, setIsAuthenticated, setLoading, setError]);

  // Auto-refresh token before expiration
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (!tokenService.isTokenValid(token)) {
        logout();
      }
    };

    // Check token validity every minute
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

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

  const logout = () => {
    tokenService.removeToken();
    storeLogout();
  };

  const clearError = () => {
    setError(null);
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    login,
    register,
    logout,
    clearError,
    
    // Computed values
    isClient: user?.userType === 'client',
    isProvider: user?.userType === 'provider',
  };
}