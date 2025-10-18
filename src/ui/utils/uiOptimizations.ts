/**
 * UI Optimizations Utility
 * 
 * Provides comprehensive UI optimizations including performance enhancements,
 * accessibility improvements, and user experience optimizations.
 */

import { useEffect, useRef, useState, useCallback } from 'react';

// Add CSS animations for toast notifications
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
    document.head.appendChild(style);
}

// Performance optimization hooks
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export const useThrottle = <T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T => {
    const lastRun = useRef(Date.now());

    return useCallback(
        ((...args) => {
            if (Date.now() - lastRun.current >= delay) {
                callback(...args);
                lastRun.current = Date.now();
            }
        }) as T,
        [callback, delay]
    );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
    options: IntersectionObserverInit = {}
) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                if (entry.isIntersecting && !hasIntersected) {
                    setHasIntersected(true);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [hasIntersected, options]);

    return { elementRef, isIntersecting, hasIntersected };
};

// Virtual scrolling hook for large lists
export const useVirtualScroll = <T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
) => {
    const [scrollTop, setScrollTop] = useState(0);
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight) + 1,
        items.length
    );

    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    const handleScroll = useCallback((e: Event) => {
        const target = e.target as HTMLElement;
        setScrollTop(target.scrollTop);
    }, []);

    useEffect(() => {
        if (!containerRef) return;

        containerRef.addEventListener('scroll', handleScroll);
        return () => containerRef.removeEventListener('scroll', handleScroll);
    }, [containerRef, handleScroll]);

    return {
        containerRef: setContainerRef,
        visibleItems,
        totalHeight,
        offsetY,
        startIndex,
        endIndex,
    };
};

// Image lazy loading hook
export const useLazyImage = (src: string, placeholder?: string) => {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const { elementRef, hasIntersected } = useIntersectionObserver();

    useEffect(() => {
        if (!hasIntersected) return;

        const img = new Image();
        img.onload = () => {
            setImageSrc(src);
            setIsLoaded(true);
        };
        img.onerror = () => {
            setIsError(true);
        };
        img.src = src;
    }, [hasIntersected, src]);

    return { elementRef, imageSrc, isLoaded, isError };
};

// Optimized toast notifications (custom implementation)
export const useOptimizedToast = () => {
    const toastQueue = useRef<Array<{ id: string; config: any }>>([]);
    const activeToasts = useRef(new Set<string>());

    const showToast = useCallback((config: {
        title: string;
        description?: string;
        status?: 'success' | 'error' | 'warning' | 'info';
        duration?: number | null;
        isClosable?: boolean;
    }) => {
        const id = `toast-${Date.now()}-${Math.random()}`;

        // Limit concurrent toasts
        if (activeToasts.current.size >= 3) {
            toastQueue.current.push({ id, config });
            return;
        }

        activeToasts.current.add(id);

        // Create toast element
        const toastElement = document.createElement('div');
        toastElement.id = id;
        toastElement.className = `toast toast-${config.status || 'info'}`;
        toastElement.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 400px;
      margin-bottom: 8px;
      animation: slideInRight 0.3s ease-out;
    `;

        toastElement.innerHTML = `
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">${config.title}</div>
          ${config.description ? `<div style="color: #666; font-size: 14px;">${config.description}</div>` : ''}
        </div>
        ${config.isClosable !== false ? '<button style="background: none; border: none; cursor: pointer; font-size: 18px; color: #999;">&times;</button>' : ''}
      </div>
    `;

        // Add to DOM
        document.body.appendChild(toastElement);

        // Handle close
        const closeToast = () => {
            toastElement.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (document.body.contains(toastElement)) {
                    document.body.removeChild(toastElement);
                }
                activeToasts.current.delete(id);

                // Show next toast in queue
                if (toastQueue.current.length > 0) {
                    const next = toastQueue.current.shift();
                    if (next) {
                        setTimeout(() => showToast(next.config), 100);
                    }
                }
            }, 300);
        };

        // Close button handler
        const closeButton = toastElement.querySelector('button');
        if (closeButton) {
            closeButton.addEventListener('click', closeToast);
        }

        // Auto close
        if (config.duration !== null) {
            setTimeout(closeToast, config.duration || 5000);
        }
    }, []);

    return { showToast };
};

// Form optimization utilities
export const useFormOptimization = () => {
    const [isDirty, setIsDirty] = useState(false);
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

    const markFieldTouched = useCallback((fieldName: string) => {
        setTouchedFields(prev => new Set(prev).add(fieldName));
    }, []);

    const markFormDirty = useCallback(() => {
        setIsDirty(true);
    }, []);

    const resetForm = useCallback(() => {
        setIsDirty(false);
        setTouchedFields(new Set());
    }, []);

    const isFieldTouched = useCallback((fieldName: string) => {
        return touchedFields.has(fieldName);
    }, [touchedFields]);

    return {
        isDirty,
        touchedFields,
        markFieldTouched,
        markFormDirty,
        resetForm,
        isFieldTouched,
    };
};

// Accessibility utilities
export const useAccessibilityAnnouncements = () => {
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }, []);

    return { announce };
};

// Focus management
export const useFocusManagement = () => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const trapFocus = useCallback((container: HTMLElement) => {
        const focusable = container.querySelectorAll(focusableElements);
        const firstFocusable = focusable[0] as HTMLElement;
        const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) {
                if (document.activeElement === firstFocusable) {
                    lastFocusable.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastFocusable) {
                    firstFocusable.focus();
                    e.preventDefault();
                }
            }
        };

        container.addEventListener('keydown', handleTabKey);
        firstFocusable?.focus();

        return () => {
            container.removeEventListener('keydown', handleTabKey);
        };
    }, []);

    const restoreFocus = useCallback(() => {
        const lastFocused = document.querySelector('[data-last-focused]') as HTMLElement;
        if (lastFocused) {
            lastFocused.focus();
            lastFocused.removeAttribute('data-last-focused');
        }
    }, []);

    const saveFocus = useCallback(() => {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
            activeElement.setAttribute('data-last-focused', 'true');
        }
    }, []);

    return { trapFocus, restoreFocus, saveFocus };
};

// Performance monitoring
export const usePerformanceMonitoring = () => {
    const [metrics, setMetrics] = useState<Record<string, number>>({});

    const startTiming = useCallback((label: string) => {
        performance.mark(`${label}-start`);
    }, []);

    const endTiming = useCallback((label: string) => {
        performance.mark(`${label}-end`);
        performance.measure(label, `${label}-start`, `${label}-end`);

        const measure = performance.getEntriesByName(label)[0];
        setMetrics(prev => ({
            ...prev,
            [label]: measure.duration,
        }));
    }, []);

    const getMetrics = useCallback(() => metrics, [metrics]);

    return { startTiming, endTiming, getMetrics };
};

// Responsive utilities
export const useResponsiveValue = <T>(values: Record<string, T>) => {
    const [currentValue, setCurrentValue] = useState<T>(values.base || values.sm);

    useEffect(() => {
        const updateValue = () => {
            const width = window.innerWidth;

            if (width >= 1280 && values['2xl']) {
                setCurrentValue(values['2xl']);
            } else if (width >= 992 && values.xl) {
                setCurrentValue(values.xl);
            } else if (width >= 768 && values.lg) {
                setCurrentValue(values.lg);
            } else if (width >= 480 && values.md) {
                setCurrentValue(values.md);
            } else if (values.sm) {
                setCurrentValue(values.sm);
            } else {
                setCurrentValue(values.base);
            }
        };

        updateValue();
        window.addEventListener('resize', updateValue);

        return () => window.removeEventListener('resize', updateValue);
    }, [values]);

    return currentValue;
};

// Animation utilities
export const useAnimationFrame = (callback: () => void, deps: any[] = []) => {
    const requestRef = useRef<number>(0);
    const callbackRef = useRef(callback);

    // Update callback ref when callback changes
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const animate = () => {
            callbackRef.current();
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, deps);
};

// Error boundary utilities
export const useErrorRecovery = () => {
    const [error, setError] = useState<Error | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    const captureError = useCallback((error: Error) => {
        setError(error);
        console.error('Captured error:', error);
    }, []);

    const retry = useCallback(() => {
        setError(null);
        setRetryCount(prev => prev + 1);
    }, []);

    const reset = useCallback(() => {
        setError(null);
        setRetryCount(0);
    }, []);

    return { error, retryCount, captureError, retry, reset };
};

// Local storage optimization
export const useOptimizedLocalStorage = <T>(key: string, defaultValue: T) => {
    const [value, setValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    });

    const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
        try {
            const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
            setValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Error saving to localStorage:`, error);
        }
    }, [key, value]);

    return [value, setStoredValue] as const;
};

// Network status monitoring
export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [connectionType, setConnectionType] = useState<string>('unknown');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Check connection type if available
        if ('connection' in navigator) {
            const connection = (navigator as any).connection;
            setConnectionType(connection.effectiveType || 'unknown');

            const handleConnectionChange = () => {
                setConnectionType(connection.effectiveType || 'unknown');
            };

            connection.addEventListener('change', handleConnectionChange);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                connection.removeEventListener('change', handleConnectionChange);
            };
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOnline, connectionType };
};

// Export all utilities
export default {
    useDebounce,
    useThrottle,
    useIntersectionObserver,
    useVirtualScroll,
    useLazyImage,
    useOptimizedToast,
    useFormOptimization,
    useAccessibilityAnnouncements,
    useFocusManagement,
    usePerformanceMonitoring,
    useResponsiveValue,
    useAnimationFrame,
    useErrorRecovery,
    useOptimizedLocalStorage,
    useNetworkStatus,
};