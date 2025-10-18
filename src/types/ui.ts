// UI state and component types

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingStates {
  [key: string]: LoadingState;
}

// Modal and dialog types
export interface ModalState {
  isOpen: boolean;
  type?: string;
  data?: any;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// Toast notification types
export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  isClosable?: boolean;
}

// Pagination types
export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginationActions {
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
}

// Search and filter UI state
export interface SearchState {
  query: string;
  isSearching: boolean;
  results: any[];
  hasResults: boolean;
}

export interface FilterState {
  isOpen: boolean;
  activeFilters: Record<string, any>;
  appliedFilters: Record<string, any>;
}

// Form UI state
export interface FormState {
  isDirty: boolean;
  isSubmitting: boolean;
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Global UI state management
export interface UIState {
  modals: Record<string, ModalState>;
  confirmDialog: ConfirmDialogState;
  toasts: ToastNotification[];
  loading: LoadingStates;
  sidebar: {
    isOpen: boolean;
    isMobile: boolean;
  };
}

export interface UIActions {
  openModal: (type: string, data?: any) => void;
  closeModal: (type: string) => void;
  showConfirmDialog: (config: Omit<ConfirmDialogState, 'isOpen'>) => void;
  hideConfirmDialog: () => void;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
  setLoading: (key: string, state: LoadingState) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}