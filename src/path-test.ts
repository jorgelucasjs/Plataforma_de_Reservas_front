// Test TypeScript path aliases
import type { User } from '@/types';
import type { AuthState } from '@/types/auth';

// This should compile without errors if paths are configured correctly
const testUser: User = {
  id: '1',
  fullName: 'Test User',
  email: 'test@example.com',
  nif: '123456789',
  userType: 'client',
  balance: 100,
  isActive: true,
  createdAt: '2024-01-01T00:00:00Z'
};

const testAuthState: AuthState = {
  user: testUser,
  token: 'test-token',
  isAuthenticated: true,
  isLoading: false,
  error: null
};

export { testUser, testAuthState };