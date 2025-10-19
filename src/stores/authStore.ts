import { create } from "zustand";
import { authDao} from "../dao";
import type { User } from "@/types";
import { setData } from "@/dao/localStorage";
import { LOCALSTORAGE_USERDATA } from "@/utils/LocalstorageKeys";

interface AuthStore {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    register: (data: any) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    // refreshProfile: () => Promise<void>;
    // setAuthFromStorage: () => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,

    register: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authDao.register(data);
            const { token, user } = response.data.data;

            console.log("register", response.data.data)
        
            setData(LOCALSTORAGE_USERDATA, {
                ...user,
                token: token
            })

            set({ user, token, isAuthenticated: true, isLoading: false });
           // window.location.href = "/dashboard"
        } catch (error: any) {
            const message = error.response?.data?.message || "Erro ao registar";
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authDao.login({ email, password });
            const { token, user } = response.data.data;
             setData(LOCALSTORAGE_USERDATA, {
                ...user,
                token: token
            })
            set({ user, token, isAuthenticated: true, isLoading: false });
            //window.location.href = "/dashboard"
        } catch (error: any) {
            const message = error.response?.data?.message || "Erro ao autenticar";
            set({ error: message, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.clear()
        set({ user: null, token: null, isAuthenticated: false });
    },

    // refreshProfile: async () => {
    //     try {
    //         const response = await userDao.getProfile();
    //         set((state) => ({
    //             user: response.data,
    //         }));
    //     } catch (error) {
    //         console.error("Erro ao atualizar perfil:", error);
    //     }
    // },

    // setAuthFromStorage: () => {
    //     const token = localStorage.getItem("token");
    //     if (token) {
    //         set({ token, isAuthenticated: true });
    //     }
    // },

    clearError: () => set({ error: null }),
}));