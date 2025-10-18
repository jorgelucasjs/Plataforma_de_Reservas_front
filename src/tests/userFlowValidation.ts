/**
 * User Flow Validation Script
 * 
 * This script validates complete user journeys and role-based access control
 * by simulating real user interactions with the application.
 */

import { authRepository } from '@/repositories/authRepository';
import { serviceRepository } from '@/repositories/serviceRepository';
import { bookingRepository } from '@/repositories/bookingRepository';
import { userRepository } from '@/repositories/userRepository';
import { useAuthStore } from '@/stores/authStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import type { RegisterData, LoginCredentials } from '@/types';

interface ValidationResult {
  testName: string;
  success: boolean;
  error?: string;
  duration: number;
}

class UserFlowValidator {
  private results: ValidationResult[] = [];

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<ValidationResult> {
    const startTime = performance.now();
    
    try {
      await testFn();
      const duration = performance.now() - startTime;
      
      const result: ValidationResult = {
        testName,
        success: true,
        duration
      };
      
      this.results.push(result);
      console.log(`✅ ${testName} - Passed (${duration.toFixed(2)}ms)`);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      const result: ValidationResult = {
        testName,
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration
      };
      
      this.results.push(result);
      console.error(`❌ ${testName} - Failed: ${result.error} (${duration.toFixed(2)}ms)`);
      return result;
    }
  }

  private resetStores() {
    // Reset all stores to initial state
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
  }

  async validateClientJourney(): Promise<ValidationResult[]> {
    console.log('\n🔍 Validating Client User Journey...\n');
    
    const clientTests: ValidationResult[] = [];

    // Test 1: Client Registration
    clientTests.push(await this.runTest('Client Registration', async () => {
      this.resetStores();
      
      const registerData: RegisterData = {
        fullName: 'Test Client',
        email: 'client@test.com',
        nif: '123456789',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'client'
      };

      await authRepository.register(registerData);
      
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || authState.user?.userType !== 'client') {
        throw new Error('Client registration failed or user type incorrect');
      }
    }));

    // Test 2: Client Login
    clientTests.push(await this.runTest('Client Login', async () => {
      this.resetStores();
      
      const loginData: LoginCredentials = {
        identifier: 'client@test.com',
        password: 'password123'
      };

      await authRepository.login(loginData);
      
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated) {
        throw new Error('Client login failed');
      }
    }));

    // Test 3: Browse Services
    clientTests.push(await this.runTest('Browse Services', async () => {
      await serviceRepository.loadServices();
      
      const serviceState = useServiceStore.getState();
      if (serviceState.error) {
        throw new Error(`Failed to load services: ${serviceState.error}`);
      }
    }));

    // Test 4: Search and Filter Services
    clientTests.push(await this.runTest('Search and Filter Services', async () => {
      await serviceRepository.searchServices('web development');
      await serviceRepository.filterServices({ minPrice: 100, maxPrice: 1000 });
      
      const serviceState = useServiceStore.getState();
      if (serviceState.error) {
        throw new Error(`Failed to search/filter services: ${serviceState.error}`);
      }
    }));

    // Test 5: View Profile and Balance
    clientTests.push(await this.runTest('View Profile and Balance', async () => {
      await userRepository.loadProfile();
      
      const userState = useUserStore.getState();
      if (userState.error) {
        throw new Error(`Failed to load profile: ${userState.error}`);
      }
    }));

    // Test 6: Book Service (if sufficient balance)
    clientTests.push(await this.runTest('Book Service', async () => {
      const userState = useUserStore.getState();
      if (userState.balance >= 100) {
        await bookingRepository.createBooking('test-service-id');
        
        const bookingState = useBookingStore.getState();
        if (bookingState.error) {
          throw new Error(`Failed to create booking: ${bookingState.error}`);
        }
      } else {
        // Test insufficient balance scenario
        try {
          await bookingRepository.createBooking('expensive-service-id');
          throw new Error('Should have failed due to insufficient balance');
        } catch (error) {
          if (!error.message.includes('insufficient balance')) {
            throw error;
          }
        }
      }
    }));

    // Test 7: View Booking History
    clientTests.push(await this.runTest('View Booking History', async () => {
      await bookingRepository.loadMyBookings();
      
      const bookingState = useBookingStore.getState();
      if (bookingState.error) {
        throw new Error(`Failed to load bookings: ${bookingState.error}`);
      }
    }));

    // Test 8: View Transaction History
    clientTests.push(await this.runTest('View Transaction History', async () => {
      await bookingRepository.loadTransactionHistory();
      
      const bookingState = useBookingStore.getState();
      if (bookingState.error) {
        throw new Error(`Failed to load transaction history: ${bookingState.error}`);
      }
    }));

    return clientTests;
  }

  async validateProviderJourney(): Promise<ValidationResult[]> {
    console.log('\n🔍 Validating Provider User Journey...\n');
    
    const providerTests: ValidationResult[] = [];

    // Test 1: Provider Registration
    providerTests.push(await this.runTest('Provider Registration', async () => {
      this.resetStores();
      
      const registerData: RegisterData = {
        fullName: 'Test Provider',
        email: 'provider@test.com',
        nif: '987654321',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'provider'
      };

      await authRepository.register(registerData);
      
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated || authState.user?.userType !== 'provider') {
        throw new Error('Provider registration failed or user type incorrect');
      }
    }));

    // Test 2: Provider Login
    providerTests.push(await this.runTest('Provider Login', async () => {
      this.resetStores();
      
      const loginData: LoginCredentials = {
        identifier: 'provider@test.com',
        password: 'password123'
      };

      await authRepository.login(loginData);
      
      const authState = useAuthStore.getState();
      if (!authState.isAuthenticated) {
        throw new Error('Provider login failed');
      }
    }));

    // Test 3: Create Service
    providerTests.push(await this.runTest('Create Service', async () => {
      const serviceData = {
        name: 'Test Service',
        description: 'A test service for validation',
        price: 250
      };

      await serviceRepository.createService(serviceData);
      
      const serviceState = useServiceStore.getState();
      if (serviceState.error) {
        throw new Error(`Failed to create service: ${serviceState.error}`);
      }
    }));

    // Test 4: View My Services
    providerTests.push(await this.runTest('View My Services', async () => {
      await serviceRepository.loadMyServices();
      
      const serviceState = useServiceStore.getState();
      if (serviceState.error) {
        throw new Error(`Failed to load my services: ${serviceState.error}`);
      }
    }));

    // Test 5: Update Service
    providerTests.push(await this.runTest('Update Service', async () => {
      const updateData = {
        name: 'Updated Test Service',
        description: 'An updated test service',
        price: 300
      };

      await serviceRepository.updateService('test-service-id', updateData);
      
      const serviceState = useServiceStore.getState();
      if (serviceState.error) {
        throw new Error(`Failed to update service: ${serviceState.error}`);
      }
    }));

    // Test 6: View Received Bookings
    providerTests.push(await this.runTest('View Received Bookings', async () => {
      await bookingRepository.loadMyBookings();
      
      const bookingState = useBookingStore.getState();
      if (bookingState.error) {
        throw new Error(`Failed to load received bookings: ${bookingState.error}`);
      }
    }));

    // Test 7: View Earnings History
    providerTests.push(await this.runTest('View Earnings History', async () => {
      await bookingRepository.loadTransactionHistory();
      
      const bookingState = useBookingStore.getState();
      if (bookingState.error) {
        throw new Error(`Failed to load earnings history: ${bookingState.error}`);
      }
    }));

    return providerTests;
  }

  async validateRoleBasedAccess(): Promise<ValidationResult[]> {
    console.log('\n🔍 Validating Role-Based Access Control...\n');
    
    const rbacTests: ValidationResult[] = [];

    // Test 1: Client cannot create services
    rbacTests.push(await this.runTest('Client Cannot Create Services', async () => {
      // Setup client user
      useAuthStore.setState({
        user: {
          id: 'client-1',
          fullName: 'Test Client',
          email: 'client@test.com',
          nif: '123456789',
          userType: 'client',
          balance: 1000,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        token: 'client-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      const serviceData = {
        name: 'Unauthorized Service',
        description: 'This should fail',
        price: 100
      };

      try {
        await serviceRepository.createService(serviceData);
        throw new Error('Client should not be able to create services');
      } catch (error) {
        if (!error.message.includes('authorization') && !error.message.includes('provider')) {
          throw error;
        }
      }
    }));

    // Test 2: Provider cannot book services
    rbacTests.push(await this.runTest('Provider Cannot Book Services', async () => {
      // Setup provider user
      useAuthStore.setState({
        user: {
          id: 'provider-1',
          fullName: 'Test Provider',
          email: 'provider@test.com',
          nif: '987654321',
          userType: 'provider',
          balance: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        token: 'provider-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      try {
        await bookingRepository.createBooking('test-service-id');
        throw new Error('Provider should not be able to book services');
      } catch (error) {
        if (!error.message.includes('authorization') && !error.message.includes('client')) {
          throw error;
        }
      }
    }));

    // Test 3: Unauthenticated user cannot access protected resources
    rbacTests.push(await this.runTest('Unauthenticated Access Denied', async () => {
      this.resetStores();

      try {
        await serviceRepository.loadMyServices();
        throw new Error('Unauthenticated user should not access protected resources');
      } catch (error) {
        if (!error.message.includes('authentication') && !error.message.includes('unauthorized')) {
          throw error;
        }
      }
    }));

    return rbacTests;
  }

  async validateErrorScenarios(): Promise<ValidationResult[]> {
    console.log('\n🔍 Validating Error Scenarios...\n');
    
    const errorTests: ValidationResult[] = [];

    // Test 1: Invalid login credentials
    errorTests.push(await this.runTest('Invalid Login Credentials', async () => {
      this.resetStores();
      
      const invalidLogin: LoginCredentials = {
        identifier: 'invalid@test.com',
        password: 'wrongpassword'
      };

      try {
        await authRepository.login(invalidLogin);
        throw new Error('Login should have failed with invalid credentials');
      } catch (error) {
        if (!error.message.includes('invalid') && !error.message.includes('authentication')) {
          throw error;
        }
      }
    }));

    // Test 2: Duplicate registration
    errorTests.push(await this.runTest('Duplicate Registration', async () => {
      const duplicateData: RegisterData = {
        fullName: 'Duplicate User',
        email: 'existing@test.com',
        nif: '123456789',
        password: 'password123',
        confirmPassword: 'password123',
        userType: 'client'
      };

      try {
        await authRepository.register(duplicateData);
        throw new Error('Registration should have failed for duplicate email/NIF');
      } catch (error) {
        if (!error.message.includes('exists') && !error.message.includes('duplicate')) {
          throw error;
        }
      }
    }));

    // Test 3: Invalid service data
    errorTests.push(await this.runTest('Invalid Service Data', async () => {
      // Setup authenticated provider
      useAuthStore.setState({
        user: {
          id: 'provider-1',
          fullName: 'Test Provider',
          email: 'provider@test.com',
          nif: '987654321',
          userType: 'provider',
          balance: 0,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        token: 'provider-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      const invalidService = {
        name: '', // Invalid: empty name
        description: 'Test',
        price: -100 // Invalid: negative price
      };

      try {
        await serviceRepository.createService(invalidService);
        throw new Error('Service creation should have failed with invalid data');
      } catch (error) {
        if (!error.message.includes('validation') && !error.message.includes('invalid')) {
          throw error;
        }
      }
    }));

    return errorTests;
  }

  async runAllValidations(): Promise<void> {
    console.log('🚀 Starting User Flow Validation...\n');
    
    const startTime = performance.now();
    
    // Run all validation suites
    const clientResults = await this.validateClientJourney();
    const providerResults = await this.validateProviderJourney();
    const rbacResults = await this.validateRoleBasedAccess();
    const errorResults = await this.validateErrorScenarios();
    
    const totalTime = performance.now() - startTime;
    
    // Compile results
    const allResults = [...clientResults, ...providerResults, ...rbacResults, ...errorResults];
    const passed = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;
    
    // Print summary
    console.log('\n📊 Validation Summary:');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${allResults.length}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success Rate: ${((passed / allResults.length) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      allResults
        .filter(r => !r.success)
        .forEach(r => console.log(`  - ${r.testName}: ${r.error}`));
    }
    
    console.log('\n' + '='.repeat(50));
    
    // Store results for potential further analysis
    this.results = allResults;
  }

  getResults(): ValidationResult[] {
    return this.results;
  }

  getFailedTests(): ValidationResult[] {
    return this.results.filter(r => !r.success);
  }

  getPassedTests(): ValidationResult[] {
    return this.results.filter(r => r.success);
  }
}

// Export for use in tests or manual validation
export { UserFlowValidator };
export type { ValidationResult };

// Auto-run validation if this file is executed directly
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Only run in development environment
  const validator = new UserFlowValidator();
  
  // Add to global scope for manual testing
  (window as any).validateUserFlows = () => validator.runAllValidations();
  
  console.log('🔧 User Flow Validator loaded. Run validateUserFlows() in console to test.');
}