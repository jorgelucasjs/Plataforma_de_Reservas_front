import { create } from "zustand";
import { bookingDao, userDao } from "../dao";
import type { Booking } from "@/types";

interface BookingStore {
  bookings: Booking[];
  history: Booking[];
  isLoading: boolean;
  error: string | null;

  createBooking: (
    serviceId: string,
    servicePrice: number,
    scheduledDate?: string,
    notes?: string
  ) => Promise<void>;
  fetchMyBookings: () => Promise<void>;
  fetchHistory: (params?: any) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  clearError: () => void;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  history: [],
  isLoading: false,
  error: null,

  createBooking: async (serviceId, servicePrice, scheduledDate?, notes?) => {
    set({ isLoading: true, error: null });
    try {
      // Verificar saldo do cliente antes de contratar
      const balanceResponse = await userDao.getBalance();
      const balance = balanceResponse.data?.data?.balance ?? 0;

      if (balance < servicePrice) {
        const message = `Saldo insuficiente. Você tem ${balance.toFixed(2)}€ e o serviço custa ${servicePrice.toFixed(2)}€`;
        set({ error: message, isLoading: false });
        throw new Error(message);
      }

      // Criar booking
      await bookingDao.create({
        serviceId,
        scheduledDate,
        notes,
      });

      await get().fetchMyBookings();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Erro ao contratar serviço";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingDao.getMy();
      const bookings = response.data?.data?.bookings || [];
      set({ bookings, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao carregar reservas";
      set({ error: message, isLoading: false });
      console.error("Erro ao carregar reservas:", error);
    }
  },

  fetchHistory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingDao.getHistory(params);
      const bookings = response.data?.data?.bookings || [];
      set({ history: bookings, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao carregar histórico";
      set({ error: message, isLoading: false });
      console.error("Erro ao carregar histórico:", error);
    }
  },

  cancelBooking: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      await bookingDao.cancel(id, reason);
      await get().fetchMyBookings();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao cancelar reserva";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));