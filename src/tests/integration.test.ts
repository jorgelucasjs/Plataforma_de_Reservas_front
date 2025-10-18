/**
 * Integration Tests for Service Provider Platform
 * 
 * This file contains comprehensive integration tests that verify:
 * - Complete user journeys from registration to booking
 * - Role-based access control throughout the application
 * - Error scenarios and edge cases
 * - Data consistency across all operations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { create } from 'zustand';
import { authRepository } from '@/repositories/authRepository';
import { serviceRepository } from '@/repositories/serviceRepository';
import { bookingRepository } from '@/repositories/bookingRepository';
import { userRepository } from '@/repositories/userRepository';
import { useAuthStore } from '@/stores/authStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import type { User, Service, Booking, LoginCredentials, RegisterData } from '@/types';

// Mock API responses
const mockApiResponses = {
  registerClient: {
    success: true,
    data: {
      token: 'mock-client-token',
      expiresIn: '24h',
      user: {
        id: 'client-1',
        fullName: 'John Client',
        email: 'client@example.com',
        nif: '123456789',
        userType: 'client' as const,
        balance: 1000,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  },
  registerProvider: {
    success: true,
    data: {
      token: 'mock-provider-token',
      expiresIn: '24h',
      user: {
        id: 'provider-1',
        fullName: 'Jane Provider',
        email: 'provider@example.com',
        nif: '987654321',
        userType: 'provider' as const,
        balance: 0,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z'
      }
    }
  },
  createService: {
    success: true,
    data: {
      id: 'service-1',
      name: 'Web Development',
      description: 'Professional web development services',
      price: 500,
      providerId: 'provider-1',
      providerName: 'Jane Provider',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  createBooking: {
    success: true,
    data: {
      id: 'booking-1',
      clientId: 'client-1',
      clientName: 'John Client',
      serviceId: 'service-1',
      serviceName: 'Web Development',
      providerId: 'provider-1',
      providerName: 'Jane Provider',
      amount: 500,
      status: 'confirmed' as const,
      createdAt: '2024-01-01T00:00:00Z'
    }
  }
};

// Mock fetch globally
global.fetch = vi.fn();

describe('Service Provider Platform Integration Tests', () => {
  beforeEach(() => {
    // Reset all stores
    useAuthStore.getState().logout();
    useServiceStore.setState({
      services: [],
      myServices: [],
      filters: {},
      isLoading: false,
      error: null,
      total: 0,
      hasMore: false
    });
    useBookingStore.setState({
      bookings: [],
      myBookings: [],
      transactionHistory: [],
      isLoading: false,
      error: null,
      total: 0
    });
    useUserStore.setState({
      profile: null,
      balance: 0,
      isLoading: false,
      error: null
    });

    // Reset fetch mock
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete User Journey: Client Registration to Service Booking', () => {
    it('should complete full client journey successfully', async () => {
      // Step 1: Client Registration
      const clientRegisterData: RegisterData = {
        fullName: 'John Client',
        email: 'client@example.com',
        nif: '123456789',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'client'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.registerClient
      });

      await authRepository.register(clientRegisterData);

      // Verify client is authenticated
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.userType).toBe('client');
      expect(authState.user?.balance).toBe(1000);

      // Step 2: Browse Services (mock service list)
      const mockServices = [mockApiResponses.createService.data];
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { services: mockServices, total: 1 }
        })
      });

      await serviceRepository.loadServices();

      // Verify services are loaded
      const serviceState = useServiceStore.getState();
      expect(serviceState.services).toHaveLength(1);
      expect(serviceState.services[0].name).toBe('Web Development');

      // Step 3: Book Service
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.createBooking
      });

      // Mock updated user balance after booking
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockApiResponses.registerClient.data.user, balance: 500 }
        })
      });

      await bookingRepository.createBooking('service-1');

      // Verify booking was created and balance updated
      const bookingState = useBookingStore.getState();
      const userState = useUserStore.getState();
      
      expect(bookingState.myBookings).toHaveLength(1);
      expect(bookingState.myBookings[0].amount).toBe(500);
      expect(userState.balance).toBe(500); // 1000 - 500
    });

    it('should handle insufficient balance scenario', async () => {
      // Setup client with low balance
      const lowBalanceUser = {
        ...mockApiResponses.registerClient.data.user,
        balance: 100
      };

      useAuthStore.setState({
        user: lowBalanceUser,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      useUserStore.setState({
        profile: lowBalanceUser,
        balance: 100,
        isLoading: false,
        error: null
      });

      // Mock insufficient balance error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'INSUFFICIENT_BALANCE',
          message: 'Insufficient balance to complete booking'
        })
      });

      // Attempt to book expensive service
      await expect(bookingRepository.createBooking('service-1')).rejects.toThrow('Insufficient balance');

      // Verify no booking was created
      const bookingState = useBookingStore.getState();
      expect(bookingState.myBookings).toHaveLength(0);
    });
  });

  describe('Complete User Journey: Provider Registration to Service Management', () => {
    it('should complete full provider journey successfully', async () => {
      // Step 1: Provider Registration
      const providerRegisterData: RegisterData = {
        fullName: 'Jane Provider',
        email: 'provider@example.com',
        nif: '987654321',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'provider'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.registerProvider
      });

      await authRepository.register(providerRegisterData);

      // Verify provider is authenticated
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.userType).toBe('provider');

      // Step 2: Create Service
      const serviceData = {
        name: 'Web Development',
        description: 'Professional web development services',
        price: 500
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponses.createService
      });

      await serviceRepository.createService(serviceData);

      // Verify service was created
      const serviceState = useServiceStore.getState();
      expect(serviceState.myServices).toHaveLength(1);
      expect(serviceState.myServices[0].name).toBe('Web Development');

      // Step 3: Receive Booking (simulate client booking)
      const mockBooking = mockApiResponses.createBooking.data;
      
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { bookings: [mockBooking], total: 1 }
        })
      });

      await bookingRepository.loadMyBookings();

      // Verify booking appears in provider's bookings
      const bookingState = useBookingStore.getState();
      expect(bookingState.myBookings).toHaveLength(1);
      expect(bookingState.myBookings[0].providerId).toBe('provider-1');
    });

    it('should handle service validation errors', async () => {
      // Setup authenticated provider
      useAuthStore.setState({
        user: mockApiResponses.registerProvider.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock validation error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          error: 'VALIDATION_ERROR',
          message: 'Service name is required'
        })
      });

      // Attempt to create invalid service
      const invalidServiceData = {
        name: '',
        description: 'Test description',
        price: 100
      };

      await expect(serviceRepository.createService(invalidServiceData)).rejects.toThrow('Service name is required');

      // Verify no service was created
      const serviceState = useServiceStore.getState();
      expect(serviceState.myServices).toHaveLength(0);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should enforce client-only access to service booking', async () => {
      // Setup authenticated provider
      useAuthStore.setState({
        user: mockApiResponses.registerProvider.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock authorization error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'AUTHORIZATION_ERROR',
          message: 'Only clients can book services'
        })
      });

      // Provider attempts to book service
      await expect(bookingRepository.createBooking('service-1')).rejects.toThrow('Only clients can book services');
    });

    it('should enforce provider-only access to service management', async () => {
      // Setup authenticated client
      useAuthStore.setState({
        user: mockApiResponses.registerClient.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock authorization error
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({
          success: false,
          error: 'AUTHORIZATION_ERROR',
          message: 'Only providers can create services'
        })
      });

      // Client attempts to create service
      const serviceData = {
        name: 'Test Service',
        description: 'Test description',
        price: 100
      };

      await expect(serviceRepository.createService(serviceData)).rejects.toThrow('Only providers can create services');
    });
  });

  describe('Data Consistency and Transaction Integrity', () => {
    it('should maintain data consistency during booking cancellation', async () => {
      // Setup initial state with existing booking
      const mockBooking = mockApiResponses.createBooking.data;
      
      useAuthStore.setState({
        user: mockApiResponses.registerClient.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      useBookingStore.setState({
        myBookings: [mockBooking],
        bookings: [],
        transactionHistory: [],
        isLoading: false,
        error: null,
        total: 1
      });

      useUserStore.setState({
        profile: mockApiResponses.registerClient.data.user,
        balance: 500, // After booking
        isLoading: false,
        error: null
      });

      // Mock successful cancellation
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockBooking,
            status: 'cancelled',
            cancelledAt: '2024-01-02T00:00:00Z',
            cancellationReason: 'User requested cancellation'
          }
        })
      });

      // Mock updated balance after refund
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockApiResponses.registerClient.data.user, balance: 1000 }
        })
      });

      await bookingRepository.cancelBooking('booking-1');

      // Verify booking status updated and balance restored
      const bookingState = useBookingStore.getState();
      const userState = useUserStore.getState();

      expect(bookingState.myBookings[0].status).toBe('cancelled');
      expect(userState.balance).toBe(1000); // Refunded
    });

    it('should handle concurrent booking attempts gracefully', async () => {
      // Setup client
      useAuthStore.setState({
        user: mockApiResponses.registerClient.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock conflict error for concurrent booking
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({
          success: false,
          error: 'CONFLICT',
          message: 'Service is no longer available'
        })
      });

      await expect(bookingRepository.createBooking('service-1')).rejects.toThrow('Service is no longer available');

      // Verify no booking was created
      const bookingState = useBookingStore.getState();
      expect(bookingState.myBookings).toHaveLength(0);
    });
  });

  describe('Error Scenarios and Edge Cases', () => {
    it('should handle network errors gracefully', async () => {
      // Mock network error
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const loginData: LoginCredentials = {
        identifier: 'test@example.com',
        password: 'password123'
      };

      await expect(authRepository.login(loginData)).rejects.toThrow('Network error');

      // Verify auth state remains unchanged
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.user).toBeNull();
    });

    it('should handle malformed API responses', async () => {
      // Mock malformed response
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' })
      });

      await expect(serviceRepository.loadServices()).rejects.toThrow();
    });

    it('should handle authentication token expiration', async () => {
      // Setup expired token scenario
      useAuthStore.setState({
        user: mockApiResponses.registerClient.data.user,
        token: 'expired-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock 401 unauthorized response
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          error: 'AUTHENTICATION_ERROR',
          message: 'Token expired'
        })
      });

      await expect(serviceRepository.loadServices()).rejects.toThrow('Token expired');

      // Verify user is logged out
      const authState = useAuthStore.getState();
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.token).toBeNull();
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle large service lists efficiently', async () => {
      // Mock large service list
      const largeServiceList = Array.from({ length: 1000 }, (_, i) => ({
        ...mockApiResponses.createService.data,
        id: `service-${i}`,
        name: `Service ${i}`
      }));

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { services: largeServiceList, total: 1000 }
        })
      });

      const startTime = performance.now();
      await serviceRepository.loadServices();
      const endTime = performance.now();

      // Verify performance (should complete within reasonable time)
      expect(endTime - startTime).toBeLessThan(1000); // Less than 1 second

      // Verify all services loaded
      const serviceState = useServiceStore.getState();
      expect(serviceState.services).toHaveLength(1000);
    });

    it('should handle rapid successive API calls', async () => {
      // Setup authenticated user
      useAuthStore.setState({
        user: mockApiResponses.registerClient.data.user,
        token: 'mock-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      // Mock multiple rapid calls
      const promises = Array.from({ length: 10 }, () => {
        (fetch as any).mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            success: true,
            data: { services: [], total: 0 }
          })
        });
        return serviceRepository.loadServices();
      });

      // All calls should complete without errors
      await expect(Promise.all(promises)).resolves.toBeDefined();
    });
  });
});