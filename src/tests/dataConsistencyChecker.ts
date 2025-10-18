/**
 * Data Consistency Checker
 * 
 * This module validates data consistency across all operations in the application,
 * ensuring that state changes are properly synchronized and atomic operations
 * maintain data integrity.
 */

import { useAuthStore } from '@/stores/authStore';
import { useServiceStore } from '@/stores/serviceStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useUserStore } from '@/stores/userStore';
import type { User, Service, Booking } from '@/types';

interface ConsistencyIssue {
  type: 'error' | 'warning';
  category: string;
  description: string;
  affectedData?: any;
}

interface ConsistencyReport {
  timestamp: string;
  totalChecks: number;
  issues: ConsistencyIssue[];
  isConsistent: boolean;
}

class DataConsistencyChecker {
  private issues: ConsistencyIssue[] = [];

  private addIssue(type: 'error' | 'warning', category: string, description: string, affectedData?: any) {
    this.issues.push({
      type,
      category,
      description,
      affectedData
    });
  }

  private checkAuthConsistency(): void {
    const authState = useAuthStore.getState();
    
    // Check if authentication state is consistent
    if (authState.isAuthenticated && !authState.user) {
      this.addIssue('error', 'Authentication', 'User is marked as authenticated but user data is missing');
    }
    
    if (authState.isAuthenticated && !authState.token) {
      this.addIssue('error', 'Authentication', 'User is marked as authenticated but token is missing');
    }
    
    if (!authState.isAuthenticated && authState.user) {
      this.addIssue('warning', 'Authentication', 'User data exists but user is not marked as authenticated');
    }
    
    if (!authState.isAuthenticated && authState.token) {
      this.addIssue('warning', 'Authentication', 'Token exists but user is not marked as authenticated');
    }
    
    // Check user data validity
    if (authState.user) {
      const user = authState.user;
      
      if (!user.id || !user.email || !user.fullName || !user.nif) {
        this.addIssue('error', 'User Data', 'Required user fields are missing', user);
      }
      
      if (user.userType !== 'client' && user.userType !== 'provider') {
        this.addIssue('error', 'User Data', 'Invalid user type', user);
      }
      
      if (typeof user.balance !== 'number' || user.balance < 0) {
        this.addIssue('error', 'User Data', 'Invalid balance value', user);
      }
      
      // Check email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(user.email)) {
        this.addIssue('error', 'User Data', 'Invalid email format', user);
      }
      
      // Check NIF format (assuming 9 digits)
      const nifRegex = /^\d{9}$/;
      if (!nifRegex.test(user.nif)) {
        this.addIssue('warning', 'User Data', 'Invalid NIF format', user);
      }
    }
  }

  private checkUserProfileConsistency(): void {
    const authState = useAuthStore.getState();
    const userState = useUserStore.getState();
    
    // Check if user profile matches auth user
    if (authState.user && userState.profile) {
      const authUser = authState.user;
      const profileUser = userState.profile;
      
      if (authUser.id !== profileUser.id) {
        this.addIssue('error', 'User Profile', 'Auth user ID does not match profile user ID');
      }
      
      if (authUser.email !== profileUser.email) {
        this.addIssue('error', 'User Profile', 'Auth user email does not match profile email');
      }
      
      if (authUser.balance !== profileUser.balance) {
        this.addIssue('warning', 'User Profile', 'Auth user balance does not match profile balance');
      }
    }
    
    // Check if balance in user store matches auth store
    if (authState.user && userState.balance !== authState.user.balance) {
      this.addIssue('warning', 'Balance Sync', 'User store balance does not match auth store balance');
    }
  }

  private checkServiceConsistency(): void {
    const authState = useAuthStore.getState();
    const serviceState = useServiceStore.getState();
    
    // Check if provider has access to correct services
    if (authState.user?.userType === 'provider') {
      serviceState.myServices.forEach(service => {
        if (service.providerId !== authState.user?.id) {
          this.addIssue('error', 'Service Ownership', 'Service does not belong to current provider', service);
        }
      });
    }
    
    // Check service data validity
    serviceState.services.forEach(service => {
      if (!service.id || !service.name || !service.providerId) {
        this.addIssue('error', 'Service Data', 'Required service fields are missing', service);
      }
      
      if (typeof service.price !== 'number' || service.price <= 0) {
        this.addIssue('error', 'Service Data', 'Invalid service price', service);
      }
      
      if (service.name.trim().length === 0) {
        this.addIssue('error', 'Service Data', 'Service name is empty', service);
      }
    });
    
    serviceState.myServices.forEach(service => {
      if (!service.id || !service.name || !service.providerId) {
        this.addIssue('error', 'My Service Data', 'Required service fields are missing', service);
      }
      
      if (typeof service.price !== 'number' || service.price <= 0) {
        this.addIssue('error', 'My Service Data', 'Invalid service price', service);
      }
    });
  }

  private checkBookingConsistency(): void {
    const authState = useAuthStore.getState();
    const bookingState = useBookingStore.getState();
    const serviceState = useServiceStore.getState();
    
    // Check booking data validity
    bookingState.bookings.forEach(booking => {
      if (!booking.id || !booking.clientId || !booking.serviceId || !booking.providerId) {
        this.addIssue('error', 'Booking Data', 'Required booking fields are missing', booking);
      }
      
      if (typeof booking.amount !== 'number' || booking.amount <= 0) {
        this.addIssue('error', 'Booking Data', 'Invalid booking amount', booking);
      }
      
      if (booking.status !== 'confirmed' && booking.status !== 'cancelled') {
        this.addIssue('error', 'Booking Data', 'Invalid booking status', booking);
      }
    });
    
    bookingState.myBookings.forEach(booking => {
      // Check if booking belongs to current user
      if (authState.user?.userType === 'client' && booking.clientId !== authState.user.id) {
        this.addIssue('error', 'Booking Ownership', 'Booking does not belong to current client', booking);
      }
      
      if (authState.user?.userType === 'provider' && booking.providerId !== authState.user.id) {
        this.addIssue('error', 'Booking Ownership', 'Booking does not belong to current provider', booking);
      }
      
      // Check if service exists for booking
      const serviceExists = serviceState.services.some(s => s.id === booking.serviceId) ||
                           serviceState.myServices.some(s => s.id === booking.serviceId);
      
      if (!serviceExists) {
        this.addIssue('warning', 'Booking Reference', 'Booking references non-existent service', booking);
      }
    });
    
    // Check transaction history consistency
    bookingState.transactionHistory.forEach(transaction => {
      if (!transaction.id || !transaction.amount) {
        this.addIssue('error', 'Transaction Data', 'Required transaction fields are missing', transaction);
      }
      
      if (typeof transaction.amount !== 'number') {
        this.addIssue('error', 'Transaction Data', 'Invalid transaction amount', transaction);
      }
    });
  }

  private checkCrossStoreConsistency(): void {
    const authState = useAuthStore.getState();
    const serviceState = useServiceStore.getState();
    const bookingState = useBookingStore.getState();
    
    // Check if bookings reference existing services
    bookingState.myBookings.forEach(booking => {
      const service = serviceState.services.find(s => s.id === booking.serviceId) ||
                     serviceState.myServices.find(s => s.id === booking.serviceId);
      
      if (service) {
        // Check if booking amount matches service price
        if (booking.amount !== service.price) {
          this.addIssue('warning', 'Price Consistency', 'Booking amount does not match service price', {
            booking,
            service
          });
        }
        
        // Check if provider names match
        if (booking.providerName !== service.providerName) {
          this.addIssue('warning', 'Provider Name Consistency', 'Booking provider name does not match service provider name', {
            booking,
            service
          });
        }
      }
    });
    
    // Check if user balance is consistent with transaction history
    if (authState.user?.userType === 'client') {
      const totalSpent = bookingState.transactionHistory
        .filter(t => t.clientId === authState.user?.id && t.status === 'confirmed')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalRefunded = bookingState.transactionHistory
        .filter(t => t.clientId === authState.user?.id && t.status === 'cancelled')
        .reduce((sum, t) => sum + t.amount, 0);
      
      // This is a simplified check - in reality, we'd need initial balance
      if (totalSpent > 0 || totalRefunded > 0) {
        this.addIssue('warning', 'Balance History', 'Cannot verify balance consistency without initial balance data');
      }
    }
  }

  private checkLoadingStatesConsistency(): void {
    const authState = useAuthStore.getState();
    const serviceState = useServiceStore.getState();
    const bookingState = useBookingStore.getState();
    const userState = useUserStore.getState();
    
    // Check for stuck loading states
    const loadingStates = [
      { store: 'auth', loading: authState.isLoading },
      { store: 'service', loading: serviceState.isLoading },
      { store: 'booking', loading: bookingState.isLoading },
      { store: 'user', loading: userState.isLoading }
    ];
    
    loadingStates.forEach(state => {
      if (state.loading) {
        this.addIssue('warning', 'Loading State', `${state.store} store is in loading state - may indicate stuck operation`);
      }
    });
  }

  private checkErrorStatesConsistency(): void {
    const authState = useAuthStore.getState();
    const serviceState = useServiceStore.getState();
    const bookingState = useBookingStore.getState();
    const userState = useUserStore.getState();
    
    // Check for persistent error states
    const errorStates = [
      { store: 'auth', error: authState.error },
      { store: 'service', error: serviceState.error },
      { store: 'booking', error: bookingState.error },
      { store: 'user', error: userState.error }
    ];
    
    errorStates.forEach(state => {
      if (state.error) {
        this.addIssue('warning', 'Error State', `${state.store} store has persistent error: ${state.error}`);
      }
    });
  }

  public checkConsistency(): ConsistencyReport {
    this.issues = []; // Reset issues
    
    // Run all consistency checks
    this.checkAuthConsistency();
    this.checkUserProfileConsistency();
    this.checkServiceConsistency();
    this.checkBookingConsistency();
    this.checkCrossStoreConsistency();
    this.checkLoadingStatesConsistency();
    this.checkErrorStatesConsistency();
    
    const totalChecks = 7; // Number of check categories
    const hasErrors = this.issues.some(issue => issue.type === 'error');
    
    return {
      timestamp: new Date().toISOString(),
      totalChecks,
      issues: this.issues,
      isConsistent: !hasErrors
    };
  }

  public generateReport(): string {
    const report = this.checkConsistency();
    
    let output = '📊 Data Consistency Report\n';
    output += '='.repeat(50) + '\n';
    output += `Timestamp: ${report.timestamp}\n`;
    output += `Total Checks: ${report.totalChecks}\n`;
    output += `Status: ${report.isConsistent ? '✅ Consistent' : '❌ Issues Found'}\n`;
    output += `Issues Found: ${report.issues.length}\n\n`;
    
    if (report.issues.length > 0) {
      const errors = report.issues.filter(i => i.type === 'error');
      const warnings = report.issues.filter(i => i.type === 'warning');
      
      if (errors.length > 0) {
        output += `❌ Errors (${errors.length}):\n`;
        errors.forEach((issue, index) => {
          output += `  ${index + 1}. [${issue.category}] ${issue.description}\n`;
          if (issue.affectedData) {
            output += `     Data: ${JSON.stringify(issue.affectedData, null, 2).substring(0, 100)}...\n`;
          }
        });
        output += '\n';
      }
      
      if (warnings.length > 0) {
        output += `⚠️  Warnings (${warnings.length}):\n`;
        warnings.forEach((issue, index) => {
          output += `  ${index + 1}. [${issue.category}] ${issue.description}\n`;
          if (issue.affectedData) {
            output += `     Data: ${JSON.stringify(issue.affectedData, null, 2).substring(0, 100)}...\n`;
          }
        });
        output += '\n';
      }
    } else {
      output += '✅ No consistency issues found!\n\n';
    }
    
    output += '='.repeat(50);
    
    return output;
  }

  public logReport(): void {
    console.log(this.generateReport());
  }

  public getIssues(): ConsistencyIssue[] {
    return this.issues;
  }

  public hasErrors(): boolean {
    return this.issues.some(issue => issue.type === 'error');
  }

  public hasWarnings(): boolean {
    return this.issues.some(issue => issue.type === 'warning');
  }
}

// Utility function to run consistency check and log results
export function checkDataConsistency(): ConsistencyReport {
  const checker = new DataConsistencyChecker();
  const report = checker.checkConsistency();
  
  if (import.meta.env.DEV) {
    checker.logReport();
  }
  
  return report;
}

// Utility function to continuously monitor consistency
export function startConsistencyMonitoring(intervalMs: number = 30000): () => void {
  const checker = new DataConsistencyChecker();
  
  const interval = setInterval(() => {
    const report = checker.checkConsistency();
    
    if (!report.isConsistent) {
      console.warn('🚨 Data consistency issues detected!');
      checker.logReport();
    }
  }, intervalMs);
  
  // Return cleanup function
  return () => clearInterval(interval);
}

export { DataConsistencyChecker };
export type { ConsistencyIssue, ConsistencyReport };

// Auto-setup in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  // Add to global scope for manual testing
  (window as any).checkDataConsistency = checkDataConsistency;
  (window as any).startConsistencyMonitoring = startConsistencyMonitoring;
  
  console.log('🔧 Data Consistency Checker loaded. Run checkDataConsistency() in console to test.');
}