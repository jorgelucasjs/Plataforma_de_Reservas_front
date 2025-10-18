// Booking related types and interfaces

export interface Booking {
  id: string;
  clientId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  amount: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface BookingCreateData {
  serviceId: string;
}

export interface BookingCancelData {
  reason?: string;
}

export interface BookingFilters {
  status?: 'confirmed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'amount' | 'serviceName';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Transaction related types
export interface Transaction {
  id: string;
  bookingId: string;
  serviceName: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  amount: number;
  type: 'payment' | 'refund';
  status: 'completed' | 'cancelled';
  createdAt: string;
}

export interface TransactionFilters {
  type?: 'payment' | 'refund';
  status?: 'completed' | 'cancelled';
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'amount' | 'serviceName';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Booking state management interfaces
export interface BookingState {
  bookings: Booking[];
  transactions: Transaction[];
  bookingFilters: BookingFilters;
  transactionFilters: TransactionFilters;
  isLoading: boolean;
  error: string | null;
  total: number;
  transactionTotal: number;
}

export interface BookingActions {
  setBookings: (bookings: Booking[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  setBookingFilters: (filters: BookingFilters) => void;
  setTransactionFilters: (filters: TransactionFilters) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTotal: (total: number) => void;
  setTransactionTotal: (total: number) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  removeBooking: (id: string) => void;
  addTransaction: (transaction: Transaction) => void;
  clearBookings: () => void;
  clearTransactions: () => void;
}