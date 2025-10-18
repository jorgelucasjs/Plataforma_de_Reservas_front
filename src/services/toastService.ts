import { create } from 'zustand';
import type { ToastProps } from '../ui/components/Toast';

interface ToastState {
  toasts: ToastProps[];
}

interface ToastActions {
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

interface ToastStore extends ToastState, ToastActions {}

const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: get().removeToast,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },
}));

// Toast service class for easier usage
export class ToastService {
  private static store = useToastStore;

  /**
   * Show a success toast
   */
  static success(title: string, description?: string, options?: Partial<ToastProps>): string {
    return this.store.getState().addToast({
      type: 'success',
      title,
      description,
      duration: 5000,
      isClosable: true,
      ...options,
    });
  }

  /**
   * Show an error toast
   */
  static error(title: string, description?: string, options?: Partial<ToastProps>): string {
    return this.store.getState().addToast({
      type: 'error',
      title,
      description,
      duration: 7000, // Longer duration for errors
      isClosable: true,
      ...options,
    });
  }

  /**
   * Show a warning toast
   */
  static warning(title: string, description?: string, options?: Partial<ToastProps>): string {
    return this.store.getState().addToast({
      type: 'warning',
      title,
      description,
      duration: 6000,
      isClosable: true,
      ...options,
    });
  }

  /**
   * Show an info toast
   */
  static info(title: string, description?: string, options?: Partial<ToastProps>): string {
    return this.store.getState().addToast({
      type: 'info',
      title,
      description,
      duration: 5000,
      isClosable: true,
      ...options,
    });
  }

  /**
   * Show a booking success toast with specific styling
   */
  static bookingSuccess(serviceName: string, amount: number): string {
    return this.success(
      'Booking Confirmed!',
      `Successfully booked "${serviceName}" for €${amount.toFixed(2)}`,
      { duration: 6000 }
    );
  }

  /**
   * Show a booking error toast with specific styling
   */
  static bookingError(serviceName: string, error: string): string {
    return this.error(
      'Booking Failed',
      `Could not book "${serviceName}": ${error}`,
      { duration: 8000 }
    );
  }

  /**
   * Show an insufficient balance toast
   */
  static insufficientBalance(serviceName: string, required: number, available: number): string {
    const shortfall = required - available;
    return this.warning(
      'Insufficient Balance',
      `You need €${shortfall.toFixed(2)} more to book "${serviceName}". Current balance: €${available.toFixed(2)}`,
      { duration: 8000 }
    );
  }

  /**
   * Remove a specific toast
   */
  static remove(id: string): void {
    this.store.getState().removeToast(id);
  }

  /**
   * Clear all toasts
   */
  static clearAll(): void {
    this.store.getState().clearAllToasts();
  }
}

// Hook for components to use toast state
export const useToastState = () => {
  const { toasts, removeToast } = useToastStore();
  return { toasts, removeToast };
};