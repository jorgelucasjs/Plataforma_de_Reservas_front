// Booking management service
import { bookingApi } from './bookingApi';
import type { 
  Booking, 
  BookingHistoryFilters 
} from './bookingApi';

export class BookingService {
  /**
   * Criar nova reserva (apenas clients)
   */
  async createBooking(bookingData: {
    serviceId: string;
    scheduledDate?: string;
    notes?: string;
  }): Promise<Booking> {
    try {
      return await bookingApi.createBooking(bookingData);
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      throw error;
    }
  }

  /**
   * Obter reservas do utilizador atual
   */
  async getMyBookings() {
    try {
      return await bookingApi.getMyBookings();
    } catch (error) {
      console.error('Erro ao obter minhas reservas:', error);
      throw error;
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    try {
      return await bookingApi.cancelBooking(bookingId, reason);
    } catch (error) {
      console.error('Erro ao cancelar reserva:', error);
      throw error;
    }
  }

  /**
   * Obter histórico de reservas com filtros
   */
  async getBookingHistory(filters: BookingHistoryFilters = {}) {
    try {
      return await bookingApi.getBookingHistory(filters);
    } catch (error) {
      console.error('Erro ao obter histórico de reservas:', error);
      throw error;
    }
  }

  /**
   * Obter reservas por período
   */
  async getBookingsByDateRange(startDate: string, endDate: string, filters: Omit<BookingHistoryFilters, 'startDate' | 'endDate'> = {}) {
    return this.getBookingHistory({
      ...filters,
      startDate,
      endDate
    });
  }

  /**
   * Obter reservas por status
   */
  async getBookingsByStatus(status: 'confirmed' | 'cancelled', filters: Omit<BookingHistoryFilters, 'status'> = {}) {
    return this.getBookingHistory({
      ...filters,
      status
    });
  }

  /**
   * Obter reservas por faixa de valor
   */
  async getBookingsByAmountRange(minAmount: number, maxAmount: number, filters: Omit<BookingHistoryFilters, 'minAmount' | 'maxAmount'> = {}) {
    return this.getBookingHistory({
      ...filters,
      minAmount,
      maxAmount
    });
  }

  /**
   * Obter reservas de um serviço específico
   */
  async getBookingsByService(serviceId: string, filters: Omit<BookingHistoryFilters, 'serviceId'> = {}) {
    return this.getBookingHistory({
      ...filters,
      serviceId
    });
  }

  /**
   * Obter estatísticas das reservas
   */
  async getBookingStats() {
    try {
      const bookings = await this.getMyBookings();
      
      const stats = {
        total: bookings.count,
        confirmed: bookings.bookings.filter(b => b.status === 'confirmed').length,
        cancelled: bookings.bookings.filter(b => b.status === 'cancelled').length,
        totalAmount: bookings.bookings
          .filter(b => b.status === 'confirmed')
          .reduce((sum, b) => sum + b.amount, 0),
        averageAmount: 0
      };

      if (stats.confirmed > 0) {
        stats.averageAmount = stats.totalAmount / stats.confirmed;
      }

      return stats;
    } catch (error) {
      console.error('Erro ao obter estatísticas das reservas:', error);
      throw error;
    }
  }
}

// Instância singleton
export const bookingService = new BookingService();