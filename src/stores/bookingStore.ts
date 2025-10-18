import { create } from 'zustand';
import type { 
  BookingState, 
  BookingActions, 
  Booking, 
  Transaction, 
  BookingFilters, 
  TransactionFilters 
} from '../types/booking';

// Combined interface for the booking store
interface BookingStore extends BookingState, BookingActions {}

export const useBookingStore = create<BookingStore>((set, get) => ({
  // Initial state
  bookings: [],
  transactions: [],
  bookingFilters: {
    status: undefined,
    dateFrom: undefined,
    dateTo: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit: 20,
    offset: 0,
  },
  transactionFilters: {
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
  },
  isLoading: false,
  error: null,
  total: 0,
  transactionTotal: 0,

  // Actions following the useXxxUiState pattern
  setBookings: (bookings: Booking[]) => {
    set({ bookings });
  },

  setTransactions: (transactions: Transaction[]) => {
    set({ transactions });
  },

  setBookingFilters: (filters: BookingFilters) => {
    const currentFilters = get().bookingFilters;
    set({ 
      bookingFilters: { 
        ...currentFilters, 
        ...filters 
      } 
    });
  },

  setTransactionFilters: (filters: TransactionFilters) => {
    const currentFilters = get().transactionFilters;
    set({ 
      transactionFilters: { 
        ...currentFilters, 
        ...filters 
      } 
    });
  },

  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setTotal: (total: number) => {
    set({ total });
  },

  setTransactionTotal: (transactionTotal: number) => {
    set({ transactionTotal });
  },

  addBooking: (booking: Booking) => {
    const { bookings } = get();
    set({ bookings: [booking, ...bookings] });
  },

  updateBooking: (id: string, bookingUpdates: Partial<Booking>) => {
    const { bookings } = get();
    const updatedBookings = bookings.map(booking =>
      booking.id === id 
        ? { ...booking, ...bookingUpdates }
        : booking
    );
    set({ bookings: updatedBookings });
  },

  removeBooking: (id: string) => {
    const { bookings } = get();
    const filteredBookings = bookings.filter(booking => booking.id !== id);
    set({ bookings: filteredBookings });
  },

  addTransaction: (transaction: Transaction) => {
    const { transactions } = get();
    set({ transactions: [transaction, ...transactions] });
  },

  clearBookings: () => {
    set({ 
      bookings: [],
      total: 0,
      error: null 
    });
  },

  clearTransactions: () => {
    set({ 
      transactions: [],
      transactionTotal: 0,
      error: null 
    });
  },
}));

// UI state hook following the useXxxUiState pattern
export const useBookingUiState = () => {
  const {
    bookings,
    transactions,
    bookingFilters,
    transactionFilters,
    isLoading,
    error,
    total,
    transactionTotal,
    setBookings,
    setTransactions,
    setBookingFilters,
    setTransactionFilters,
    setLoading,
    setError,
    setTotal,
    setTransactionTotal,
    addBooking,
    updateBooking,
    removeBooking,
    addTransaction,
    clearBookings,
    clearTransactions,
  } = useBookingStore();

  return {
    // State
    bookings,
    transactions,
    bookingFilters,
    transactionFilters,
    isLoading,
    error,
    total,
    transactionTotal,
    
    // Actions
    setBookings,
    setTransactions,
    setBookingFilters,
    setTransactionFilters,
    setLoading,
    setError,
    setTotal,
    setTransactionTotal,
    addBooking,
    updateBooking,
    removeBooking,
    addTransaction,
    clearBookings,
    clearTransactions,
    
    // Computed values
    hasBookings: bookings.length > 0,
    hasTransactions: transactions.length > 0,
    confirmedBookings: bookings.filter(b => b.status === 'confirmed'),
    cancelledBookings: bookings.filter(b => b.status === 'cancelled'),
    totalBookingAmount: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.amount, 0),
    
    // Helper methods for booking filters
    updateBookingDateRange: (dateFrom?: string, dateTo?: string) => {
      setBookingFilters({ ...bookingFilters, dateFrom, dateTo, offset: 0 });
    },
    
    updateBookingAmountRange: (minAmount?: number, maxAmount?: number) => {
      setBookingFilters({ ...bookingFilters, minAmount, maxAmount, offset: 0 });
    },
    
    updateBookingStatus: (status?: 'confirmed' | 'cancelled') => {
      setBookingFilters({ ...bookingFilters, status, offset: 0 });
    },
    
    updateBookingSorting: (
      sortBy: 'createdAt' | 'amount' | 'serviceName', 
      sortOrder: 'asc' | 'desc'
    ) => {
      setBookingFilters({ ...bookingFilters, sortBy, sortOrder, offset: 0 });
    },
    
    resetBookingFilters: () => {
      setBookingFilters({
        status: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        minAmount: undefined,
        maxAmount: undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: 20,
        offset: 0,
      });
    },
    
    // Helper methods for transaction filters
    updateTransactionDateRange: (dateFrom?: string, dateTo?: string) => {
      setTransactionFilters({ ...transactionFilters, dateFrom, dateTo, offset: 0 });
    },
    
    updateTransactionAmountRange: (minAmount?: number, maxAmount?: number) => {
      setTransactionFilters({ ...transactionFilters, minAmount, maxAmount, offset: 0 });
    },
    
    updateTransactionType: (type?: 'payment' | 'refund') => {
      setTransactionFilters({ ...transactionFilters, type, offset: 0 });
    },
    
    updateTransactionSorting: (
      sortBy: 'createdAt' | 'amount' | 'serviceName', 
      sortOrder: 'asc' | 'desc'
    ) => {
      setTransactionFilters({ ...transactionFilters, sortBy, sortOrder, offset: 0 });
    },
    
    resetTransactionFilters: () => {
      setTransactionFilters({
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
      });
    },
  };
};