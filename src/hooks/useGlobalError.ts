import { useEffect, useState, useCallback } from 'react';
import { globalErrorService, type GlobalError } from '../services/globalErrorService';
import { ErrorType } from '../types/error';

export interface UseGlobalErrorReturn {
  errors: GlobalError[];
  recentErrors: GlobalError[];
  hasErrors: boolean;
  hasRecentErrors: boolean;
  clearErrors: () => void;
  clearOldErrors: (maxAge?: number) => void;
  reportError: (error: Error | string, type?: ErrorType, context?: any) => string;
  getErrorsByType: (type: ErrorType) => GlobalError[];
  isOffline: boolean;
}

export function useGlobalError(): UseGlobalErrorReturn {
  const [errors, setErrors] = useState<GlobalError[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Subscribe to global errors
  useEffect(() => {
    // Initial load
    setErrors(globalErrorService.getErrors());

    // Subscribe to new errors
    const unsubscribe = globalErrorService.subscribe((_error) => {
      setErrors(globalErrorService.getErrors());
    });

    return unsubscribe;
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get recent errors (last 5 minutes)
  const recentErrors = errors.filter(
    error => Date.now() - error.timestamp.getTime() < 5 * 60 * 1000
  );

  const hasErrors = errors.length > 0;
  const hasRecentErrors = recentErrors.length > 0;

  const clearErrors = useCallback(() => {
    globalErrorService.clearErrors();
    setErrors([]);
  }, []);

  const clearOldErrors = useCallback((maxAge?: number) => {
    globalErrorService.clearOldErrors(maxAge);
    setErrors(globalErrorService.getErrors());
  }, []);

  const reportError = useCallback((
    error: Error | string,
    type?: ErrorType,
    context?: any
  ): string => {
    return globalErrorService.reportError(error, type, context);
  }, []);

  const getErrorsByType = useCallback((type: ErrorType): GlobalError[] => {
    return globalErrorService.getErrorsByType(type);
  }, []);

  return {
    errors,
    recentErrors,
    hasErrors,
    hasRecentErrors,
    clearErrors,
    clearOldErrors,
    reportError,
    getErrorsByType,
    isOffline,
  };
}

// Hook for handling async operations with error reporting
export function useAsyncError() {
  const { reportError } = useGlobalError();

  const executeAsync = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    errorContext?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      reportError(
        error instanceof Error ? error : new Error(String(error)),
        ErrorType.INTERNAL_ERROR,
        { context: errorContext }
      );
      return null;
    }
  }, [reportError]);

  const executeAsyncWithRetry = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    maxRetries: number = 3,
    errorContext?: string
  ): Promise<T | null> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        if (attempt === maxRetries) {
          reportError(
            error instanceof Error ? error : new Error(String(error)),
            ErrorType.INTERNAL_ERROR,
            { context: errorContext, attempts: attempt + 1 }
          );
          return null;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
    return null;
  }, [reportError]);

  return {
    executeAsync,
    executeAsyncWithRetry,
    reportError,
  };
}