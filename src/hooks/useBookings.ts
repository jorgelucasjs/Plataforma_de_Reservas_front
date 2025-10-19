// Hook para gerenciar reservas
import { useState, useCallback } from 'react';
import { bookingService } from '../services/bookingService';
import type {
  Booking,
  BookingHistoryFilters
} from '../services/bookingApi';

export interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  total: number;
  userType: string;

  // Actions
  createBooking: (bookingData: { serviceId: string; scheduledDate?: string; notes?: string }) => Promise<Booking>;
  getMyBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, reason?: string) => Promise<Booking>;
  getBookingHistory: (filters?: BookingHistoryFilters) => Promise<void>;
  getBookingsByDateRange: (startDate: string, endDate: string, filters?: Omit<BookingHistoryFilters, 'startDate' | 'endDate'>) => Promise<void>;
  getBookingsByStatus: (status: 'confirmed' | 'cancelled', filters?: Omit<BookingHistoryFilters, 'status'>) => Promise<void>;
  getBookingStats: () => Promise<any>;
  clearError: () => void;
  refreshBookings: () => Promise<void>;
}

export const useBookings = (): UseBookingsReturn => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [userType, setUserType] = useState('');
  const [lastFilters, setLastFilters] = useState<BookingHistoryFilters>({});

  const handleRequest = useCallback(async <T>(
    requestFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T> => {
    setLoading(true);
    setError(null);

    try {
      const result = await requestFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyBookings = useCallback(async () => {
    await handleRequest(
      () => bookingService.getMyBookings(),
      (result) => {
        setBookings(result.bookings);
        setTotal(result.count);
        setUserType(result.userType);
      }
    );
  }, [handleRequest]);

  const createBooking = useCallback(async (bookingData: {
    serviceId: string;
    scheduledDate?: string;
    notes?: string
  }): Promise<Booking> => {
    return handleRequest(
      () => bookingService.createBooking(bookingData),
      () => {
        // Refresh bookings after creation
        getMyBookings();
      }
    );
  }, [handleRequest, getMyBookings]);

  const cancelBooking = useCallback(async (bookingId: string, reason?: string): Promise<Booking> => {
    return handleRequest(
      () => bookingService.cancelBooking(bookingId, reason),
      (updatedBooking) => {
        // Update booking in local state
        setBookings(prev =>
          prev.map(booking =>
            booking.id === bookingId ? updatedBooking : booking
          )
        );
      }
    );
  }, [handleRequest]);

  const getBookingHistory = useCallback(async (filters: BookingHistoryFilters = {}) => {
    await handleRequest(
      () => bookingService.getBookingHistory(filters),
      (result) => {
        setBookings(result.bookings);
        setTotal(result.total);
        setUserType(result.userType);
        setLastFilters(filters);
      }
    );
  }, [handleRequest]);

  const getBookingsByDateRange = useCallback(async (
    startDate: string,
    endDate: string,
    filters: Omit<BookingHistoryFilters, 'startDate' | 'endDate'> = {}
  ) => {
    await getBookingHistory({ ...filters, startDate, endDate });
  }, [getBookingHistory]);

  const getBookingsByStatus = useCallback(async (
    status: 'confirmed' | 'cancelled',
    filters: Omit<BookingHistoryFilters, 'status'> = {}
  ) => {
    await getBookingHistory({ ...filters, status });
  }, [getBookingHistory]);

  const getBookingStats = useCallback(async () => {
    return handleRequest(() => bookingService.getBookingStats());
  }, [handleRequest]);

  const refreshBookings = useCallback(async () => {
    if (Object.keys(lastFilters).length > 0) {
      await getBookingHistory(lastFilters);
    } else {
      await getMyBookings();
    }
  }, [getBookingHistory, getMyBookings, lastFilters]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    bookings,
    loading,
    error,
    total,
    userType,
    createBooking,
    getMyBookings,
    cancelBooking,
    getBookingHistory,
    getBookingsByDateRange,
    getBookingsByStatus,
    getBookingStats,
    clearError,
    refreshBookings,
  };
};