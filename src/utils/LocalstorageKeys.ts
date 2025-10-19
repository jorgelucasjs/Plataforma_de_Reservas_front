import { getData } from "@/dao/localStorage"
import type { User } from "@/types/auth";


export const LOCALSTORAGE_USERDATA = 'LOCAL_STORAGE_USER_DATA'

export const CURRENT_USER_INFO = getData(LOCALSTORAGE_USERDATA) as User | null

// Helper function to get current user safely
export const getCurrentUser = (): User | null => {
  return getData(LOCALSTORAGE_USERDATA) as User | null;
}

// Helper function to check if user is logged in
export const isUserLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
}

// Helper function to check if user is provider
export const isProvider = (): boolean => {
  const user = getCurrentUser();
  return user?.userType === 'provider';
}

// Helper function to check if user is client
export const isClient = (): boolean => {
  const user = getCurrentUser();
  return user?.userType === 'client';
}
