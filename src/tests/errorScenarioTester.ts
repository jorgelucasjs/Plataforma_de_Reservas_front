/**
 * Error Scenario Tester
 * 
 * This module tests various error scenarios and edge cases to ensure
 * the application handles them gracefully and maintains stability.
 */

import { authRepository } from '@/repositories/authRepository';
import { serviceRepository } from '@/repositories/serviceRepository';
import { bookingRepository } from '@/repositories/bookingRepository';
import { userRepository } from '@/repositories/userRepository';
import { useAuthStore } from '@/stores/authStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import type { LoginCredentials, RegisterData } from '@/types';

interface ErrorTestResult {
  testName: string;
  scenario: string;
  expectedError: string;
  actualError?: string;
  success: boolean;
  duration: number;
}

interface ErrorTestSuite {
  suiteName: string;
  results: ErrorTestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

class ErrorScenarioTester {
  private results: ErrorTestSuite[] = [];

  private async runErrorTest(
    testName: string,
    scenario: string,
    expectedError: string,
    testFn: () => Promise<void>
  ): Promise<ErrorTestResult> {
    const startTime = performance.now();
    
    try {
      await testFn();
      
      // If we reach here, the test failed because no error was thrown
      const duration = performance.now() - startTime;
      return {
        testName,
        scenario,
        expectedError,
        actualError: 'No error thrown',
        success: false,
        duration
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      const actualError = error instanceof Error ? error.message : String(error);
      
      // Check if the error matches what we expected
      const success = actualError.toLowerCase().includes(expectedError.toLowerCase()) ||
                     expectedError.toLowerCase().includes(actualError.toLowerCase());
      
      return {
        testName,
        scenario,
        expectedError,
        actualError,
        success,
        duration
      };
    }
  }

  private resetStores(): void {
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

  async testAuthenticationErrors(): Promise<ErrorTestSuite> {
    const suiteName = 'Authentication Error Scenarios';
    const results: ErrorTestResult[] = [];
    
    console.log(`\n🧪 Testing ${suiteName}...`);

    // Test 1: Invalid email format
    results.push(await this.runErrorTest(
      'Invalid Email Format',
      'Login with malformed email address',
      'invalid email',
      async () => {
        this.resetStores();
        const invalidLogin: LoginCredentials = {
          identifier: 'invalid-email',
          password: 'password123'
        };
        await authRepository.login(invalidLogin);
      }
    ));

    // Test 2: Empty credentials
    results.push(await this.runErrorTest(
      'Empty Credentials',
      'Login with empty email and password',
      'required',
      async () => {
        this.resetStores();
        const emptyLogin: LoginCredentials = {
          identifier: '',
          password: ''
        };
        await authRepository.login(emptyLogin);
      }
    ));

    // Test 3: Wrong password
    results.push(await this.runErrorTest(
      'Wrong Password',
      'Login with correct email but wrong password',
      'invalid credentials',
      async () => {
        this.resetStores();
        const wrongPassword: LoginCredentials = {
          identifier: 'user@example.com',
          password: 'wrongpassword'
        };
        await authRepository.login(wrongPassword);
      }
    ));

    // Test 4: Non-existent user
    results.push(await this.runErrorTest(
      'Non-existent User',
      'Login with email that does not exist',
      'user not found',
      async () => {
        this.resetStores();
        const nonExistentUser: LoginCredentials = {
          identifier: 'nonexistent@example.com',
          password: 'password123'
        };
        await authRepository.login(nonExistentUser);
      }
    ));

    // Test 5: Password too short
    results.push(await this.runErrorTest(
      'Password Too Short',
      'Register with password shorter than minimum length',
      'password too short',
      async () => {
        this.resetStores();
        const shortPassword: RegisterData = {
          fullName: 'Test User',
          email: 'test@example.com',
          nif: '123456789',
          password: '123',
          confirmPassword: '123',
          userType: 'client'
        };
        await authRepository.register(shortPassword);
      }
    ));

    // Test 6: Password mismatch
    results.push(await this.runErrorTest(
      'Password Mismatch',
      'Register with passwords that do not match',
      'passwords do not match',
      async () => {
        this.resetStores();
        const mismatchPassword: RegisterData = {
          fullName: 'Test User',
          email: 'test@example.com',
          nif: '123456789',
          password: 'password123',
          confirmPassword: 'differentpassword',
          userType: 'client'
        };
        await authRepository.register(mismatchPassword);
      }
    ));

    // Test 7: Duplicate email
    results.push(await this.runErrorTest(
      'Duplicate Email',
      'Register with email that already exists',
      'email already exists',
      async () => {
        this.resetStores();
        const duplicateEmail: RegisterData = {
          fullName: 'Test User',
          email: 'existing@example.com',
          nif: '123456789',
          password: 'password123',
          confirmPassword: 'password123',
          userType: 'client'
        };
        await authRepository.register(duplicateEmail);
      }
    ));

    // Test 8: Invalid NIF format
    results.push(await this.runErrorTest(
      'Invalid NIF Format',
      'Register with invalid NIF format',
      'invalid nif',
      async () => {
        this.resetStores();
        const invalidNIF: RegisterData = {
          fullName: 'Test User',
          email: 'test@example.com',
          nif: '12345', // Too short
          password: 'password123',
          confirmPassword: 'password123',
          userType: 'client'
        };
        await authRepository.register(invalidNIF);
      }
    ));

    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;

    return {
      suiteName,
      results,
      totalTests: results.length,
      passedTests,
      failedTests
    };
  }

  async testServiceManagementErrors(): Promise<ErrorTestSuite> {
    const suiteName = 'Service Management Error Scenarios';
    const results: ErrorTestResult[] = [];
    
    console.log(`\n🧪 Testing ${suiteName}...`);

    // Setup authenticated provider
    const setupProvider = () => {
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
    };

    // Test 1: Empty service name
    results.push(await this.runErrorTest(
      'Empty Service Name',
      'Create service with empty name',
      'name is required',
      async () => {
        this.resetStores();
        setupProvider();
        await serviceRepository.createService({
          name: '',
          description: 'Test description',
          price: 100
        });
      }
    ));

    // Test 2: Negative price
    results.push(await this.runErrorTest(
      'Negative Price',
      'Create service with negative price',
      'price must be positive',
      async () => {
        this.resetStores();
        setupProvider();
        await serviceRepository.createService({
          name: 'Test Service',
          description: 'Test description',
          price: -100
        });
      }
    ));

    // Test 3: Zero price
    results.push(await this.runErrorTest(
      'Zero Price',
      'Create service with zero price',
      'price must be greater than zero',
      async () => {
        this.resetStores();
        setupProvider();
        await serviceRepository.createService({
          name: 'Test Service',
          description: 'Test description',
          price: 0
        });
      }
    ));

    // Test 4: Client trying to create service
    results.push(await this.runErrorTest(
      'Client Creating Service',
      'Client user attempting to create service',
      'only providers can create services',
      async () => {
        this.resetStores();
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
        await serviceRepository.createService({
          name: 'Test Service',
          description: 'Test description',
          price: 100
        });
      }
    ));

    // Test 5: Unauthenticated service creation
    results.push(await this.runErrorTest(
      'Unauthenticated Service Creation',
      'Creating service without authentication',
      'authentication required',
      async () => {
        this.resetStores();
        await serviceRepository.createService({
          name: 'Test Service',
          description: 'Test description',
          price: 100
        });
      }
    ));

    // Test 6: Update non-existent service
    results.push(await this.runErrorTest(
      'Update Non-existent Service',
      'Updating service that does not exist',
      'service not found',
      async () => {
        this.resetStores();
        setupProvider();
        await serviceRepository.updateService('non-existent-id', {
          name: 'Updated Service',
          description: 'Updated description',
          price: 200
        });
      }
    ));

    // Test 7: Delete service with active bookings
    results.push(await this.runErrorTest(
      'Delete Service with Active Bookings',
      'Deleting service that has active bookings',
      'cannot delete service with active bookings',
      async () => {
        this.resetStores();
        setupProvider();
        await serviceRepository.deleteService('service-with-bookings');
      }
    ));

    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;

    return {
      suiteName,
      results,
      totalTests: results.length,
      passedTests,
      failedTests
    };
  }

  async testBookingErrors(): Promise<ErrorTestSuite> {
    const suiteName = 'Booking Error Scenarios';
    const results: ErrorTestResult[] = [];
    
    console.log(`\n🧪 Testing ${suiteName}...`);

    // Setup authenticated client
    const setupClient = (balance: number = 1000) => {
      useAuthStore.setState({
        user: {
          id: 'client-1',
          fullName: 'Test Client',
          email: 'client@test.com',
          nif: '123456789',
          userType: 'client',
          balance,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        token: 'client-token',
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
      
      useUserStore.setState({
        profile: {
          id: 'client-1',
          fullName: 'Test Client',
          email: 'client@test.com',
          nif: '123456789',
          userType: 'client',
          balance,
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        balance,
        isLoading: false,
        error: null
      });
    };

    // Test 1: Insufficient balance
    results.push(await this.runErrorTest(
      'Insufficient Balance',
      'Booking service with insufficient balance',
      'insufficient balance',
      async () => {
        this.resetStores();
        setupClient(50); // Low balance
        await bookingRepository.createBooking('expensive-service-id');
      }
    ));

    // Test 2: Non-existent service
    results.push(await this.runErrorTest(
      'Non-existent Service',
      'Booking service that does not exist',
      'service not found',
      async () => {
        this.resetStores();
        setupClient();
        await bookingRepository.createBooking('non-existent-service');
      }
    ));

    // Test 3: Provider booking own service
    results.push(await this.runErrorTest(
      'Provider Booking Own Service',
      'Provider attempting to book their own service',
      'cannot book own service',
      async () => {
        this.resetStores();
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
        await bookingRepository.createBooking('own-service-id');
      }
    ));

    // Test 4: Inactive service booking
    results.push(await this.runErrorTest(
      'Inactive Service Booking',
      'Booking service that is inactive',
      'service is not active',
      async () => {
        this.resetStores();
        setupClient();
        await bookingRepository.createBooking('inactive-service-id');
      }
    ));

    // Test 5: Cancel non-existent booking
    results.push(await this.runErrorTest(
      'Cancel Non-existent Booking',
      'Cancelling booking that does not exist',
      'booking not found',
      async () => {
        this.resetStores();
        setupClient();
        await bookingRepository.cancelBooking('non-existent-booking');
      }
    ));

    // Test 6: Cancel already cancelled booking
    results.push(await this.runErrorTest(
      'Cancel Already Cancelled Booking',
      'Cancelling booking that is already cancelled',
      'booking already cancelled',
      async () => {
        this.resetStores();
        setupClient();
        await bookingRepository.cancelBooking('already-cancelled-booking');
      }
    ));

    // Test 7: Unauthenticated booking
    results.push(await this.runErrorTest(
      'Unauthenticated Booking',
      'Creating booking without authentication',
      'authentication required',
      async () => {
        this.resetStores();
        await bookingRepository.createBooking('service-id');
      }
    ));

    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;

    return {
      suiteName,
      results,
      totalTests: results.length,
      passedTests,
      failedTests
    };
  }

  async testNetworkErrors(): Promise<ErrorTestSuite> {
    const suiteName = 'Network Error Scenarios';
    const results: ErrorTestResult[] = [];
    
    console.log(`\n🧪 Testing ${suiteName}...`);

    // Test 1: Network timeout
    results.push(await this.runErrorTest(
      'Network Timeout',
      'Request timeout due to slow network',
      'timeout',
      async () => {
        this.resetStores();
        // Simulate timeout by making request that takes too long
        await authRepository.login({
          identifier: 'timeout@test.com',
          password: 'password123'
        });
      }
    ));

    // Test 2: Server unavailable
    results.push(await this.runErrorTest(
      'Server Unavailable',
      'Server returns 503 Service Unavailable',
      'service unavailable',
      async () => {
        this.resetStores();
        await serviceRepository.loadServices();
      }
    ));

    // Test 3: Network disconnection
    results.push(await this.runErrorTest(
      'Network Disconnection',
      'Network connection lost during request',
      'network error',
      async () => {
        this.resetStores();
        await userRepository.loadProfile();
      }
    ));

    // Test 4: Malformed response
    results.push(await this.runErrorTest(
      'Malformed Response',
      'Server returns invalid JSON',
      'invalid response',
      async () => {
        this.resetStores();
        await serviceRepository.loadServices();
      }
    ));

    const passedTests = results.filter(r => r.success).length;
    const failedTests = results.filter(r => !r.success).length;

    return {
      suiteName,
      results,
      totalTests: results.length,
      passedTests,
      failedTests
    };
  }

  async runAllErrorTests(): Promise<void> {
    console.log('🚨 Starting Error Scenario Testing...\n');
    
    const startTime = performance.now();
    
    // Run all error test suites
    const authSuite = await this.testAuthenticationErrors();
    const serviceSuite = await this.testServiceManagementErrors();
    const bookingSuite = await this.testBookingErrors();
    const networkSuite = await this.testNetworkErrors();
    
    this.results = [authSuite, serviceSuite, bookingSuite, networkSuite];
    
    const totalTime = performance.now() - startTime;
    
    // Generate summary
    const totalTests = this.results.reduce((sum, suite) => sum + suite.totalTests, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passedTests, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failedTests, 0);
    
    // Print detailed results
    console.log('\n📊 Error Scenario Test Results:');
    console.log('='.repeat(60));
    
    this.results.forEach(suite => {
      console.log(`\n${suite.suiteName}:`);
      console.log(`  Total: ${suite.totalTests} | Passed: ${suite.passedTests} | Failed: ${suite.failedTests}`);
      
      if (suite.failedTests > 0) {
        console.log('  Failed Tests:');
        suite.results
          .filter(r => !r.success)
          .forEach(r => {
            console.log(`    ❌ ${r.testName}: Expected "${r.expectedError}", Got "${r.actualError}"`);
          });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log(`Overall Results:`);
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${totalPassed} ✅`);
    console.log(`Failed: ${totalFailed} ❌`);
    console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime.toFixed(2)}ms`);
    console.log('='.repeat(60));
  }

  getResults(): ErrorTestSuite[] {
    return this.results;
  }

  getFailedTests(): ErrorTestResult[] {
    return this.results.flatMap(suite => suite.results.filter(r => !r.success));
  }

  getPassedTests(): ErrorTestResult[] {
    return this.results.flatMap(suite => suite.results.filter(r => r.success));
  }
}

export { ErrorScenarioTester };
export type { ErrorTestResult, ErrorTestSuite };

// Auto-setup in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  const tester = new ErrorScenarioTester();
  
  // Add to global scope for manual testing
  (window as any).testErrorScenarios = () => tester.runAllErrorTests();
  
  console.log('🔧 Error Scenario Tester loaded. Run testErrorScenarios() in console to test.');
}