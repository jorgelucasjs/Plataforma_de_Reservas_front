// User Management Data Access Object

import { apiClient } from '../services/apiClient';
import type { User } from '../types/auth';

// User profile update data interface
export interface UpdateUserProfileData {
  fullName?: string;
  email?: string;
  nif?: string;
}

// User balance response interface
export interface UserBalanceResponse {
  balance: number;
  lastUpdated: string;
}

/**
 * Get current user profile
 * @returns Promise<User> - Current user profile data
 */
export async function getUserProfile(): Promise<User> {
  try {
    const response = await apiClient.get<User>('/users/profile');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get current user balance
 * @returns Promise<UserBalanceResponse> - User balance information
 */
export async function getUserBalance(): Promise<UserBalanceResponse> {
  try {
    const response = await apiClient.get<UserBalanceResponse>('/users/balance');
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile information
 * @param profileData - Updated profile data
 * @returns Promise<User> - Updated user profile
 */
export async function updateUserProfile(profileData: UpdateUserProfileData): Promise<User> {
  try {
    const response = await apiClient.put<User>('/users/profile', profileData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user by ID (for admin or provider use)
 * @param userId - User ID to fetch
 * @returns Promise<User> - User profile data
 */
export async function getUserById(userId: string): Promise<User> {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Deactivate user account
 * @returns Promise<void>
 */
export async function deactivateAccount(): Promise<void> {
  try {
    await apiClient.patch<void>('/users/profile', { isActive: false });
  } catch (error) {
    throw error;
  }
}

/**
 * Change user password
 * @param currentPassword - Current password for verification
 * @param newPassword - New password
 * @returns Promise<void>
 */
export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  try {
    await apiClient.patch<void>('/users/password', {
      currentPassword,
      newPassword,
    });
  } catch (error) {
    throw error;
  }
}