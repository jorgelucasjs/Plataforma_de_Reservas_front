import { create } from "zustand";
import { bookingDao } from "../dao";
import type { Booking } from "@/types";

interface BookingStore {
  bookings: Booking[];
  history: Booking[];
  isLoading: boolean;
  error: string | null;

  createBooking: (serviceId: string) => Promise<void>;
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

  createBooking: async (serviceId) => {
    set({ isLoading: true, error: null });
    try {
      await bookingDao.create(serviceId);
      await get().fetchMyBookings();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao contratar serviço";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchMyBookings: async () => {
    try {
      const response = await bookingDao.getMy();

      console.log("fetchMyBookings", response)
      set({ bookings: response.data.bookings });
    } catch (error: any) {
      console.error("Erro ao carregar reservas:", error);
    }
  },

  fetchHistory: async (params) => {
    set({ isLoading: true });
    try {
      const response = await bookingDao.getHistory(params);
      set({ history: response.data.bookings, isLoading: false });
    } catch (error: any) {
      console.error("Erro ao carregar histórico:", error);
      set({ isLoading: false });
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