import { create } from 'zustand';
import type { AuthState, AuthActions, User } from '../types/auth';
import { tokenService } from '../services/tokenService';

// Combined interface for the auth store
interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>((set) => ({
  // Initial state
  user: null,
  token: tokenService.getToken(),
  isAuthenticated: tokenService.hasValidToken(),
  isLoading: false,
  error: null,

  // Actions following the useXxxUiState pattern
  setUser: (user: User | null) => {
    set({ user });
  },

  setToken: (token: string | null) => {
    set({ token });
    if (token) {
      // Update authentication status when token is set
      set({ isAuthenticated: true });
    }
  },

  setIsAuthenticated: (isAuthenticated: boolean) => {
    set({ isAuthenticated });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  logout: () => {
    // Clear token from storage
    tokenService.clearToken();
    
    // Reset all auth state
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));

// UI state hook following the useXxxUiState pattern
export const useAuthUiState = () => {
  const {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setToken,
    setIsAuthenticated,
    setLoading,
    setError,
    logout,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    setUser,
    setToken,
    setIsAuthenticated,
    setLoading,
    setError,
    logout,
  };
};