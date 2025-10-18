// User Management Repository - Business logic layer for user profile and balance management

import * as userDao from '../dao/userDao';
import { useUserStore } from '../stores/userStore';
import { useAuthStore } from '../stores/authStore';
import type { UserProfile, UserUpdateData, BalanceInfo } from '../types/user';
import type { User } from '../types/auth';
import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';

export class UserRepository {
  /**
   * Load user profile and update store
   * @returns Promise<UserProfile> - User profile data
   */
  async loadProfile(): Promise<UserProfile> {
    const { setProfile, setLoading, setError } = useUserStore.getState();
    const { setUser } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Get profile from API
      const user = await userDao.getUserProfile();

      // Convert User to UserProfile format
      const profile: UserProfile = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        nif: user.nif,
        userType: user.userType,
        balance: user.balance,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: new Date().toISOString(),
      };

      // Update stores
      setProfile(profile);
      setUser(user); // Also update auth store with latest user data

      return profile;
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Update user profile and sync with stores
   * @param updateData - Profile data to update
   * @returns Promise<UserProfile> - Updated profile
   */
  async updateProfile(updateData: UserUpdateData): Promise<UserProfile> {
    const { setProfile, setLoading, setError } = useUserStore.getState();
    const { setUser } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate update data
      this.validateProfileUpdateData(updateData);

      // Update profile via API
      const updatedUser = await userDao.updateUserProfile(updateData);

      // Convert to UserProfile format
      const profile: UserProfile = {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        nif: updatedUser.nif,
        userType: updatedUser.userType,
        balance: updatedUser.balance,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt,
        updatedAt: new Date().toISOString(),
      };

      // Update stores
      setProfile(profile);
      setUser(updatedUser); // Also update auth store

      return profile;
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load current balance and update store
   * @returns Promise<BalanceInfo> - Balance information
   */
  async loadBalance(): Promise<BalanceInfo> {
    const { setBalance, setLoading, setError, profile } = useUserStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Get balance from API
      const balanceResponse = await userDao.getUserBalance();

      // Create balance info
      const balanceInfo: BalanceInfo = {
        currentBalance: balanceResponse.balance,
        lastUpdated: balanceResponse.lastUpdated,
      };

      // Update balance in store
      setBalance(balanceInfo);

      // Also update profile balance if profile exists
      if (profile) {
        const { updateBalance } = useUserStore.getState();
        updateBalance(balanceResponse.balance);
      }

      return balanceInfo;
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get current balance from store or load from API
   * @returns Promise<number> - Current balance
   */
  async getCurrentBalance(): Promise<number> {
    const { balance } = useUserStore.getState();
    
    // If balance is already loaded and recent, return it
    if (balance && this.isBalanceRecent(balance.lastUpdated)) {
      return balance.currentBalance;
    }

    // Otherwise, load fresh balance
    const balanceInfo = await this.loadBalance();
    return balanceInfo.currentBalance;
  }

  /**
   * Check if user has sufficient balance for a transaction
   * @param amount - Amount to check
   * @returns Promise<boolean> - True if sufficient balance
   */
  async hasSufficientBalance(amount: number): Promise<boolean> {
    try {
      const currentBalance = await this.getCurrentBalance();
      return currentBalance >= amount;
    } catch (error) {
      // On error, assume insufficient balance for safety
      console.warn('Failed to check balance:', error);
      return false;
    }
  }

  /**
   * Refresh user data (profile and balance)
   * @returns Promise<void>
   */
  async refreshUserData(): Promise<void> {
    const { setLoading, setError } = useUserStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Load both profile and balance in parallel
      await Promise.all([
        this.loadProfile(),
        this.loadBalance(),
      ]);
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Change user password
   * @param currentPassword - Current password for verification
   * @param newPassword - New password
   * @returns Promise<void>
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { setLoading, setError } = useUserStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate password data
      this.validatePasswordChange(currentPassword, newPassword);

      // Change password via API
      await userDao.changePassword(currentPassword, newPassword);

      // Password changed successfully - no store updates needed
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Deactivate user account
   * @returns Promise<void>
   */
  async deactivateAccount(): Promise<void> {
    const { setLoading, setError, updateProfile } = useUserStore.getState();
    const { logout } = useAuthStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Deactivate account via API
      await userDao.deactivateAccount();

      // Update profile to reflect deactivation
      updateProfile({ isActive: false });

      // Logout user after deactivation
      logout();
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get user by ID (for provider/admin use)
   * @param userId - User ID to fetch
   * @returns Promise<User> - User data
   */
  async getUserById(userId: string): Promise<User> {
    const { setLoading, setError } = useUserStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate user ID
      if (!userId || !userId.trim()) {
        throw this.createValidationError('User ID is required');
      }

      // Get user from API
      const user = await userDao.getUserById(userId);
      return user;
    } catch (error) {
      const userError = this.handleUserError(error);
      setError(userError.message);
      throw userError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Validate profile update data
   * @param updateData - Data to validate
   */
  private validateProfileUpdateData(updateData: UserUpdateData): void {
    if (!updateData || Object.keys(updateData).length === 0) {
      throw this.createValidationError('No update data provided');
    }

    // Validate full name if provided
    if (updateData.fullName !== undefined) {
      if (!updateData.fullName || !updateData.fullName.trim()) {
        throw this.createValidationError('Full name cannot be empty');
      }
      if (updateData.fullName.trim().length < 2) {
        throw this.createValidationError('Full name must be at least 2 characters long');
      }
    }

    // Validate email if provided
    if (updateData.email !== undefined) {
      if (!updateData.email || !updateData.email.trim()) {
        throw this.createValidationError('Email cannot be empty');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw this.createValidationError('Please enter a valid email address');
      }
    }
  }

  /**
   * Validate password change data
   * @param currentPassword - Current password
   * @param newPassword - New password
   */
  private validatePasswordChange(currentPassword: string, newPassword: string): void {
    if (!currentPassword || !currentPassword.trim()) {
      throw this.createValidationError('Current password is required');
    }

    if (!newPassword || !newPassword.trim()) {
      throw this.createValidationError('New password is required');
    }

    if (newPassword.length < 6) {
      throw this.createValidationError('New password must be at least 6 characters long');
    }

    if (currentPassword === newPassword) {
      throw this.createValidationError('New password must be different from current password');
    }
  }

  /**
   * Check if balance data is recent (within 5 minutes)
   * @param lastUpdated - Last update timestamp
   * @returns boolean - True if recent
   */
  private isBalanceRecent(lastUpdated: string): boolean {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const lastUpdateTime = new Date(lastUpdated).getTime();
    return lastUpdateTime > fiveMinutesAgo;
  }

  /**
   * Handle user management errors and convert to AppError
   * @param error - Original error
   * @returns AppError - Formatted application error
   */
  private handleUserError(error: any): AppError {
    // If it's already an AppError, return as is
    if (error && typeof error === 'object' && 'type' in error) {
      return error as AppError;
    }

    // Handle different error scenarios
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        message: 'Authentication required. Please log in again.',
        details: error
      };
    }

    if (error?.message?.includes('403') || error?.message?.includes('Forbidden')) {
      return {
        type: ErrorType.AUTHORIZATION_ERROR,
        message: 'You do not have permission to perform this action.',
        details: error
      };
    }

    if (error?.message?.includes('404') || error?.message?.includes('Not Found')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'User not found.',
        details: error
      };
    }

    if (error?.message?.includes('409') || error?.message?.includes('Conflict')) {
      return {
        type: ErrorType.CONFLICT_ERROR,
        message: 'Email already exists. Please use a different email.',
        details: error
      };
    }

    if (error?.message?.includes('400') || error?.message?.includes('Bad Request')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Invalid data provided. Please check your input.',
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
export const userRepository = new UserRepository();