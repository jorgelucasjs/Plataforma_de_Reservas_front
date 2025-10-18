import { create } from 'zustand';
import type { UserState, UserActions, UserProfile, BalanceInfo } from '../types/user';

// Combined interface for the user store
interface UserStore extends UserState, UserActions {}

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  profile: null,
  balance: null,
  isLoading: false,
  error: null,

  // Actions following the useXxxUiState pattern
  setProfile: (profile: UserProfile | null) => {
    set({ profile });
    
    // If profile is set, also update balance info
    if (profile) {
      const currentBalance = get().balance;
      set({
        balance: {
          currentBalance: profile.balance,
          totalEarned: currentBalance?.totalEarned,
          totalSpent: currentBalance?.totalSpent,
          lastUpdated: new Date().toISOString(),
        }
      });
    }
  },

  setBalance: (balance: BalanceInfo | null) => {
    set({ balance });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  updateProfile: (updates: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    if (currentProfile) {
      const updatedProfile = {
        ...currentProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      set({ profile: updatedProfile });
    }
  },

  updateBalance: (newBalance: number) => {
    const currentProfile = get().profile;
    const currentBalance = get().balance;
    
    // Update profile balance
    if (currentProfile) {
      set({
        profile: {
          ...currentProfile,
          balance: newBalance,
          updatedAt: new Date().toISOString(),
        }
      });
    }

    // Update balance info
    set({
      balance: {
        currentBalance: newBalance,
        totalEarned: currentBalance?.totalEarned,
        totalSpent: currentBalance?.totalSpent,
        lastUpdated: new Date().toISOString(),
      }
    });
  },
}));

// UI state hook following the useXxxUiState pattern
export const useUserUiState = () => {
  const {
    profile,
    balance,
    isLoading,
    error,
    setProfile,
    setBalance,
    setLoading,
    setError,
    updateProfile,
    updateBalance,
  } = useUserStore();

  return {
    // State
    profile,
    balance,
    isLoading,
    error,
    
    // Actions
    setProfile,
    setBalance,
    setLoading,
    setError,
    updateProfile,
    updateBalance,
    
    // Computed values
    hasProfile: profile !== null,
    currentBalance: balance?.currentBalance ?? 0,
    isProvider: profile?.userType === 'provider',
    isClient: profile?.userType === 'client',
  };
};