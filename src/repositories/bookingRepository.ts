// Booking Management Repository - Business logic layer for booking operations and transactions

import * as bookingDao from '../dao/bookingDao';
import { useBookingStore } from '../stores/bookingStore';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';
import type { 
  Booking, 
  BookingCreateData, 
  BookingCancelData, 
  BookingFilters,
  Transaction,
  TransactionFilters
} from '../types/booking';
import type { AppError } from '../types/error';
import { ErrorType } from '../types/error';

export class BookingRepository {
  /**
   * Create a new booking with balance validation (client only)
   * @param bookingData - Booking creation data
   * @returns Promise<Booking> - Created booking
   */
  async createBooking(bookingData: BookingCreateData): Promise<Booking> {
    const { addBooking, addTransaction, setLoading, setError } = useBookingStore.getState();
    const { user } = useAuthStore.getState();
    const { updateBalance } = useUserStore.getState();
    
    try {
      // Check if user is a client
      if (!user || user.userType !== 'client') {
        throw this.createAuthorizationError('Only clients can create bookings');
      }

      setLoading(true);
      setError(null);

      // Validate booking data
      this.validateBookingData(bookingData);

      // Create booking via API (includes balance validation on server)
      const response = await bookingDao.createBooking(bookingData);

      // Update stores with the results
      addBooking(response.booking);
      addTransaction(response.transaction);
      
      // Update user balance
      updateBalance(response.newBalance);

      return response.booking;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Cancel a booking and handle balance reversal
   * @param bookingId - Booking ID to cancel
   * @param cancelData - Optional cancellation reason
   * @returns Promise<Booking> - Updated booking
   */
  async cancelBooking(bookingId: string, cancelData?: BookingCancelData): Promise<Booking> {
    const { updateBooking, addTransaction, setLoading, setError } = useBookingStore.getState();
    const { updateBalance } = useUserStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate booking ID
      if (!bookingId || !bookingId.trim()) {
        throw this.createValidationError('Booking ID is required');
      }

      // Validate user authorization for this booking
      await this.validateBookingAccess(bookingId);

      // Cancel booking via API (includes balance reversal on server)
      const response = await bookingDao.cancelBooking(bookingId, cancelData);

      // Update stores with the results
      updateBooking(bookingId, {
        status: 'cancelled',
        cancelledAt: response.booking.cancelledAt,
        cancellationReason: response.booking.cancellationReason,
      });
      
      addTransaction(response.transaction);
      
      // Update user balance
      updateBalance(response.newBalance);

      return response.booking;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load user's bookings with filtering
   * @param filters - Optional filters for pagination, sorting, and filtering
   * @returns Promise<Booking[]> - List of user's bookings
   */
  async loadMyBookings(filters?: BookingFilters): Promise<Booking[]> {
    const { setBookings, setLoading, setError, setTotal, setBookingFilters } = useBookingStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Update filters in store if provided
      if (filters) {
        setBookingFilters(filters);
      }

      // Get current filters from store
      const currentFilters = filters || useBookingStore.getState().bookingFilters;

      // Load bookings from API
      const response = await bookingDao.getMyBookings(currentFilters);

      // Update store with results
      if (currentFilters.offset === 0) {
        // New search/filter - replace bookings
        setBookings(response.bookings);
      } else {
        // Pagination - append bookings
        const { bookings } = useBookingStore.getState();
        setBookings([...bookings, ...response.bookings]);
      }

      setTotal(response.total);

      return response.bookings;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load booking history with filtering
   * @param filters - Optional filters for date range, amount, status, etc.
   * @returns Promise<Booking[]> - Filtered booking history
   */
  async loadBookingHistory(filters?: BookingFilters): Promise<Booking[]> {
    const { setBookings, setLoading, setError, setTotal, setBookingFilters } = useBookingStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Update filters in store if provided
      if (filters) {
        setBookingFilters(filters);
      }

      // Get current filters from store
      const currentFilters = filters || useBookingStore.getState().bookingFilters;

      // Load booking history from API
      const response = await bookingDao.getBookingHistory(currentFilters);

      // Update store with results
      if (currentFilters.offset === 0) {
        // New search/filter - replace bookings
        setBookings(response.bookings);
      } else {
        // Pagination - append bookings
        const { bookings } = useBookingStore.getState();
        setBookings([...bookings, ...response.bookings]);
      }

      setTotal(response.total);

      return response.bookings;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Load transaction history with filtering
   * @param filters - Optional filters for transaction type, date range, amount, etc.
   * @returns Promise<Transaction[]> - User's transaction history
   */
  async loadTransactionHistory(filters?: TransactionFilters): Promise<Transaction[]> {
    const { setTransactions, setLoading, setError, setTransactionTotal, setTransactionFilters } = useBookingStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Update filters in store if provided
      if (filters) {
        setTransactionFilters(filters);
      }

      // Get current filters from store
      const currentFilters = filters || useBookingStore.getState().transactionFilters;

      // Load transaction history from API
      const response = await bookingDao.getTransactionHistory(currentFilters);

      // Update store with results
      if (currentFilters.offset === 0) {
        // New search/filter - replace transactions
        setTransactions(response.transactions);
      } else {
        // Pagination - append transactions
        const { transactions } = useBookingStore.getState();
        setTransactions([...transactions, ...response.transactions]);
      }

      setTransactionTotal(response.total);

      return response.transactions;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get booking by ID
   * @param bookingId - Booking ID to fetch
   * @returns Promise<Booking> - Booking details
   */
  async getBookingById(bookingId: string): Promise<Booking> {
    const { setLoading, setError } = useBookingStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate booking ID
      if (!bookingId || !bookingId.trim()) {
        throw this.createValidationError('Booking ID is required');
      }

      // Get booking from API
      const booking = await bookingDao.getBookingById(bookingId);
      
      // Validate user has access to this booking
      await this.validateBookingAccess(bookingId, booking);

      return booking;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get transaction by ID
   * @param transactionId - Transaction ID to fetch
   * @returns Promise<Transaction> - Transaction details
   */
  async getTransactionById(transactionId: string): Promise<Transaction> {
    const { setLoading, setError } = useBookingStore.getState();
    
    try {
      setLoading(true);
      setError(null);

      // Validate transaction ID
      if (!transactionId || !transactionId.trim()) {
        throw this.createValidationError('Transaction ID is required');
      }

      // Get transaction from API
      const transaction = await bookingDao.getTransactionById(transactionId);
      return transaction;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Get bookings for a specific service (provider only)
   * @param serviceId - Service ID to get bookings for
   * @param filters - Optional filters
   * @returns Promise<Booking[]> - Bookings for the service
   */
  async getServiceBookings(serviceId: string, filters?: BookingFilters): Promise<Booking[]> {
    const { setLoading, setError } = useBookingStore.getState();
    const { user } = useAuthStore.getState();
    
    try {
      // Check if user is a provider
      if (!user || user.userType !== 'provider') {
        throw this.createAuthorizationError('Only providers can view service bookings');
      }

      setLoading(true);
      setError(null);

      // Validate service ID
      if (!serviceId || !serviceId.trim()) {
        throw this.createValidationError('Service ID is required');
      }

      // Get service bookings from API
      const response = await bookingDao.getServiceBookings(serviceId, filters);
      return response.bookings;
    } catch (error) {
      const bookingError = this.handleBookingError(error);
      setError(bookingError.message);
      throw bookingError;
    } finally {
      setLoading(false);
    }
  }

  /**
   * Apply filters to booking list
   * @param filters - Filters to apply
   * @returns Promise<Booking[]> - Filtered bookings
   */
  async applyBookingFilters(filters: BookingFilters): Promise<Booking[]> {
    // Reset pagination when applying new filters
    const filtersWithReset: BookingFilters = {
      ...filters,
      offset: 0,
    };

    return await this.loadMyBookings(filtersWithReset);
  }

  /**
   * Apply filters to transaction list
   * @param filters - Filters to apply
   * @returns Promise<Transaction[]> - Filtered transactions
   */
  async applyTransactionFilters(filters: TransactionFilters): Promise<Transaction[]> {
    // Reset pagination when applying new filters
    const filtersWithReset: TransactionFilters = {
      ...filters,
      offset: 0,
    };

    return await this.loadTransactionHistory(filtersWithReset);
  }

  /**
   * Load more bookings (pagination)
   * @returns Promise<Booking[]> - Additional bookings
   */
  async loadMoreBookings(): Promise<Booking[]> {
    const { bookingFilters, bookings } = useBookingStore.getState();
    
    const nextPageFilters: BookingFilters = {
      ...bookingFilters,
      offset: bookings.length,
    };

    return await this.loadMyBookings(nextPageFilters);
  }

  /**
   * Load more transactions (pagination)
   * @returns Promise<Transaction[]> - Additional transactions
   */
  async loadMoreTransactions(): Promise<Transaction[]> {
    const { transactionFilters, transactions } = useBookingStore.getState();
    
    const nextPageFilters: TransactionFilters = {
      ...transactionFilters,
      offset: transactions.length,
    };

    return await this.loadTransactionHistory(nextPageFilters);
  }

  /**
   * Clear all booking filters and reload
   * @returns Promise<Booking[]> - All bookings
   */
  async clearBookingFilters(): Promise<Booking[]> {
    // Load bookings with default filters
    const defaultFilters: BookingFilters = {
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    };

    return await this.loadMyBookings(defaultFilters);
  }

  /**
   * Clear all transaction filters and reload
   * @returns Promise<Transaction[]> - All transactions
   */
  async clearTransactionFilters(): Promise<Transaction[]> {
    // Load transactions with default filters
    const defaultFilters: TransactionFilters = {
      type: undefined,
      status: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 20,
      offset: 0,
    };

    return await this.loadTransactionHistory(defaultFilters);
  }

  /**
   * Validate booking access (user can only access their own bookings)
   * @param bookingId - Booking ID to check
   * @param booking - Optional booking object if already fetched
   */
  private async validateBookingAccess(bookingId: string, booking?: Booking): Promise<void> {
    const { user } = useAuthStore.getState();
    
    if (!user) {
      throw this.createAuthorizationError('Authentication required');
    }

    try {
      // Get booking details if not provided
      const bookingToCheck = booking || await bookingDao.getBookingById(bookingId);
      
      // Check if user is involved in this booking (as client or provider)
      const hasAccess = bookingToCheck.clientId === user.id || bookingToCheck.providerId === user.id;
      
      if (!hasAccess) {
        throw this.createAuthorizationError('You can only access your own bookings');
      }
    } catch (error) {
      // If we can't verify access, deny it
      if (error && typeof error === 'object' && 'type' in error && error.type === ErrorType.AUTHORIZATION_ERROR) {
        throw error;
      }
      throw this.createAuthorizationError('Unable to verify booking access');
    }
  }

  /**
   * Validate booking creation data
   * @param bookingData - Data to validate
   */
  private validateBookingData(bookingData: BookingCreateData): void {
    if (!bookingData.serviceId || !bookingData.serviceId.trim()) {
      throw this.createValidationError('Service ID is required');
    }

    // Additional validation can be added here
    // Note: Balance validation is handled on the server side for security
  }

  /**
   * Handle booking management errors and convert to AppError
   * @param error - Original error
   * @returns AppError - Formatted application error
   */
  private handleBookingError(error: unknown): AppError {
    // If it's already an AppError, return as is
    if (error && typeof error === 'object' && 'type' in error) {
      return error as AppError;
    }

    // Handle different error scenarios
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      return {
        type: ErrorType.AUTHENTICATION_ERROR,
        message: 'Authentication required. Please log in again.',
        details: error
      };
    }

    if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
      return {
        type: ErrorType.AUTHORIZATION_ERROR,
        message: 'You do not have permission to perform this action.',
        details: error
      };
    }

    if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'Booking or service not found.',
        details: error
      };
    }

    if (errorMessage.includes('insufficient balance') || 
        errorMessage.includes('INSUFFICIENT_BALANCE')) {
      return {
        type: ErrorType.INSUFFICIENT_BALANCE,
        message: 'Insufficient balance to complete this booking. Please add funds to your account.',
        details: error
      };
    }

    if (errorMessage.includes('409') || errorMessage.includes('Conflict')) {
      return {
        type: ErrorType.CONFLICT_ERROR,
        message: 'This booking cannot be processed. The service may no longer be available.',
        details: error
      };
    }

    if (errorMessage.includes('400') || errorMessage.includes('Bad Request')) {
      return {
        type: ErrorType.VALIDATION_ERROR,
        message: 'Invalid booking data. Please check your input.',
        details: error
      };
    }

    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Network error. Please check your connection and try again.',
        details: error
      };
    }

    // Default error
    return {
      type: ErrorType.INTERNAL_ERROR,
      message: errorMessage || 'An unexpected error occurred. Please try again.',
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

  /**
   * Create authorization error
   * @param message - Error message
   * @returns AppError - Authorization error
   */
  private createAuthorizationError(message: string): AppError {
    return {
      type: ErrorType.AUTHORIZATION_ERROR,
      message,
    };
  }
}

// Create and export singleton instance
export const bookingRepository = new BookingRepository();