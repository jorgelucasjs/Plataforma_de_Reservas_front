// Booking Management Data Access Object

import { apiClient } from '../services/apiClient';
import type { 
  Booking, 
  BookingCreateData, 
  BookingCancelData, 
  BookingFilters,
  Transaction,
  TransactionFilters
} from '../types/booking';

// Booking list response interface
export interface BookingListResponse {
  bookings: Booking[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Transaction list response interface
export interface TransactionListResponse {
  transactions: Transaction[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

// Booking creation response interface
export interface BookingCreateResponse {
  booking: Booking;
  transaction: Transaction;
  newBalance: number;
}

/**
 * Create a new booking (client only)
 * @param bookingData - Booking creation data
 * @returns Promise<BookingCreateResponse> - Created booking with transaction details
 */
export async function createBooking(bookingData: BookingCreateData): Promise<BookingCreateResponse> {
  try {
    const response = await apiClient.post<BookingCreateResponse>('/bookings', bookingData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get bookings for the current user (role-specific)
 * @param filters - Optional filters for pagination, sorting, and filtering
 * @returns Promise<BookingListResponse> - List of user's bookings
 */
export async function getMyBookings(filters?: BookingFilters): Promise<BookingListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.minAmount !== undefined) {
      params.append('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      params.append('maxAmount', filters.maxAmount.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/bookings/my?${queryString}` : '/bookings/my';
    
    const response = await apiClient.get<BookingListResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get booking by ID
 * @param bookingId - Booking ID to fetch
 * @returns Promise<Booking> - Booking details
 */
export async function getBookingById(bookingId: string): Promise<Booking> {
  try {
    const response = await apiClient.get<Booking>(`/bookings/${bookingId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Cancel a booking
 * @param bookingId - Booking ID to cancel
 * @param cancelData - Optional cancellation reason
 * @returns Promise<BookingCreateResponse> - Updated booking with refund transaction
 */
export async function cancelBooking(bookingId: string, cancelData?: BookingCancelData): Promise<BookingCreateResponse> {
  try {
    const response = await apiClient.patch<BookingCreateResponse>(`/bookings/${bookingId}/cancel`, cancelData);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get booking history with filtering support
 * @param filters - Optional filters for date range, amount, status, etc.
 * @returns Promise<BookingListResponse> - Filtered booking history
 */
export async function getBookingHistory(filters?: BookingFilters): Promise<BookingListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.minAmount !== undefined) {
      params.append('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      params.append('maxAmount', filters.maxAmount.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/bookings/history?${queryString}` : '/bookings/history';
    
    const response = await apiClient.get<BookingListResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get transaction history for the current user
 * @param filters - Optional filters for transaction type, date range, amount, etc.
 * @returns Promise<TransactionListResponse> - User's transaction history
 */
export async function getTransactionHistory(filters?: TransactionFilters): Promise<TransactionListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.type) {
      params.append('type', filters.type);
    }
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.minAmount !== undefined) {
      params.append('minAmount', filters.minAmount.toString());
    }
    if (filters?.maxAmount !== undefined) {
      params.append('maxAmount', filters.maxAmount.toString());
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/transactions/history?${queryString}` : '/transactions/history';
    
    const response = await apiClient.get<TransactionListResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get transaction by ID
 * @param transactionId - Transaction ID to fetch
 * @returns Promise<Transaction> - Transaction details
 */
export async function getTransactionById(transactionId: string): Promise<Transaction> {
  try {
    const response = await apiClient.get<Transaction>(`/transactions/${transactionId}`);
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Get bookings for a specific service (provider only)
 * @param serviceId - Service ID to get bookings for
 * @param filters - Optional filters
 * @returns Promise<BookingListResponse> - Bookings for the service
 */
export async function getServiceBookings(serviceId: string, filters?: BookingFilters): Promise<BookingListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters?.status) {
      params.append('status', filters.status);
    }
    if (filters?.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters?.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters?.sortOrder) {
      params.append('sortOrder', filters.sortOrder);
    }
    if (filters?.limit !== undefined) {
      params.append('limit', filters.limit.toString());
    }
    if (filters?.offset !== undefined) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/services/${serviceId}/bookings?${queryString}` : `/services/${serviceId}/bookings`;
    
    const response = await apiClient.get<BookingListResponse>(url);
    return response;
  } catch (error) {
    throw error;
  }
}