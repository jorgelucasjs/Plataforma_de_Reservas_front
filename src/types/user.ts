// User profile and balance related types

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  nif: string;
  userType: 'client' | 'provider';
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserUpdateData {
  fullName?: string;
  email?: string;
}

export interface BalanceInfo {
  currentBalance: number;
  totalEarned?: number; // for providers
  totalSpent?: number;   // for clients
  lastUpdated: string;
}

// Form data types
export interface ProfileForm {
  fullName: string;
  email: string;
}

// User state management interfaces
export interface UserState {
  profile: UserProfile | null;
  balance: BalanceInfo | null;
  isLoading: boolean;
  error: string | null;
}

export interface UserActions {
  setProfile: (profile: UserProfile | null) => void;
  setBalance: (balance: BalanceInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateBalance: (newBalance: number) => void;
}