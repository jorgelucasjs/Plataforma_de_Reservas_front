import { create } from "zustand";
import { serviceDao } from "../dao";
import type { Service } from "@/types";

interface ServiceStore {
  services: Service[];
  myServices: Service[];
  isLoading: boolean;
  error: string | null;
  selectedService: Service | null;

  createService: (data: any) => Promise<void>;
  fetchServices: (params?: any) => Promise<void>;
  fetchMyServices: () => Promise<void>;
  fetchServicesByProvider: (providerId: string) => Promise<void>;
  updateService: (id: string, data: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  setSelectedService: (service: Service | null) => void;
  clearError: () => void;
}

export const useServiceStore = create<ServiceStore>((set, get) => ({
  services: [],
  myServices: [],
  isLoading: false,
  error: null,
  selectedService: null,

  createService: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await serviceDao.create(data);
      await get().fetchMyServices();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao criar serviço";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  fetchServices: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceDao.getAll(params);
      set({ services: response.data.services, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao carregar serviços";
      set({ error: message, isLoading: false });
    }
  },

  fetchMyServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceDao.getMy();
      set({ myServices: response.data.services, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao carregar meus serviços";
      set({ error: message, isLoading: false });
      console.error("Erro ao carregar meus serviços:", error);
    }
  },

  fetchServicesByProvider: async (providerId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await serviceDao.getByProvider(providerId);
      const services = response.data?.data?.services || [];
      set({ myServices: services, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao carregar serviços do provedor";
      set({ error: message, isLoading: false });
      console.error("Erro ao carregar serviços do provedor:", error);
    }
  },

  updateService: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await serviceDao.update(id, data);
      await get().fetchMyServices();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao atualizar serviço";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteService: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await serviceDao.delete(id);
      await get().fetchMyServices();
      set({ isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao eliminar serviço";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  setSelectedService: (service) => set({ selectedService: service }),
  clearError: () => set({ error: null }),
}));