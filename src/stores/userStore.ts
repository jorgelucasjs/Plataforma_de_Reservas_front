import { create } from "zustand";
import { userDao } from "../dao";
import { getData, setData } from "@/dao/localStorage";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";
import type { User } from "@/types";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  addBalance: (email: string, amount: number) => Promise<void>;
  refreshUser: () => void;
  fetchUserByEmail: (email: string) => Promise<User | null>;
  clearError: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: getData(LOCALSTORAGE_USERDATA),
  isLoading: false,
  error: null,

  addBalance: async (email: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userDao.addBalance({ email, amount });
      const updatedUser = response.data.user;
      
      // Atualiza o localStorage com os novos dados do usuário
      const currentUser = getData(LOCALSTORAGE_USERDATA);
      const newUserData = { ...currentUser, ...updatedUser };
      setData(LOCALSTORAGE_USERDATA, newUserData);
      
      set({ user: newUserData, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao adicionar saldo";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  refreshUser: () => {
    const user = getData(LOCALSTORAGE_USERDATA);
    set({ user });
  },

  fetchUserByEmail: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userDao.getUserByEmail(email);
      const userData = response.data.data;
      
      // Atualiza o localStorage com os dados mais recentes
      const currentUser = getData(LOCALSTORAGE_USERDATA);
      const updatedUser = { ...currentUser, ...userData };
      setData(LOCALSTORAGE_USERDATA, updatedUser);
      
      set({ user: updatedUser, isLoading: false });
      return updatedUser;
    } catch (error: any) {
      const message = error.response?.data?.message || "Erro ao buscar usuário";
      set({ error: message, isLoading: false });
      return null;
    }
  },

  clearError: () => set({ error: null }),
}));
