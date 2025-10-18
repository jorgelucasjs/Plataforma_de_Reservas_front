// React hooks for performance monitoring and optimization

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { performanceMonitor, timing } from '../utils/performance';

// Hook to measure component render performance
export function useRenderPerformance(componentName: string) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current++;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    performanceMonitor.recordComponentRender(componentName, renderTime);
  });

  return {
    renderCount: renderCountRef.current,
    recordCustomMetric: (name: string, value: number) => {
      performanceMonitor.recordMetric(`${componentName}_${name}`, value, 'gauge');
    },
  };
}

// Hook to measure function execution time
export function usePerformanceMeasure() {
  const measureFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    name: string
  ): T => {
    return performanceMonitor.measureFunction(fn, name);
  }, []);

  const measureAsyncFunction = useCallback(<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name: string
  ): T => {
    return performanceMonitor.measureAsyncFunction(fn, name);
  }, []);

  const measureTime = useCallback(<T>(name: string, fn: () => T): T => {
    return timing.time(name, fn);
  }, []);

  const measureTimeAsync = useCallback(async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return timing.timeAsync(name, fn);
  }, []);

  return {
    measureFunction,
    measureAsyncFunction,
    measureTime,
    measureTimeAsync,
  };
}

// Hook for debounced performance monitoring
export function useDebounce<T>(value: T, delay: number, measureName?: string): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const start = performance.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
      
      if (measureName) {
        const end = performance.now();
        performanceMonitor.recordMetric(`debounce_${measureName}`, end - start, 'timing');
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, measureName]);

  return debouncedValue;
}

// Hook for throttled performance monitoring
export function useThrottle<T>(value: T, limit: number, measureName?: string): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const start = performance.now();
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
        
        if (measureName) {
          const end = performance.now();
          performanceMonitor.recordMetric(`throttle_${measureName}`, end - start, 'timing');
        }
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit, measureName]);

  return throttledValue;
}

// Hook for memoized expensive computations with performance tracking
export function useExpensiveMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  measureName?: string
): T {
  return useMemo(() => {
    if (measureName) {
      return timing.time(`memo_${measureName}`, factory);
    }
    return factory();
  }, deps);
}

// Hook for monitoring list performance (virtualization helper)
export function useListPerformance(
  items: any[],
  itemHeight: number,
  containerHeight: number,
  measureName?: string
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const bufferSize = Math.min(5, Math.ceil(visibleCount * 0.5));

  useEffect(() => {
    if (measureName) {
      performanceMonitor.recordMetric(`list_${measureName}_total_items`, items.length, 'gauge');
      performanceMonitor.recordMetric(`list_${measureName}_visible_items`, visibleCount, 'gauge');
      performanceMonitor.recordMetric(`list_${measureName}_buffer_size`, bufferSize, 'gauge');
    }
  }, [items.length, visibleCount, bufferSize, measureName]);

  return {
    visibleCount,
    bufferSize,
    shouldVirtualize: items.length > visibleCount * 2,
  };
}

// Hook for monitoring API request performance
export function useApiPerformance() {
  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await apiCall();
      const end = performance.now();
      
      performanceMonitor.recordMetric(`api_${endpoint}_success`, end - start, 'timing');
      performanceMonitor.recordMetric(`api_${endpoint}_count`, 1, 'counter');
      
      return result;
    } catch (error) {
      const end = performance.now();
      
      performanceMonitor.recordMetric(`api_${endpoint}_error`, end - start, 'timing');
      performanceMonitor.recordMetric(`api_${endpoint}_error_count`, 1, 'counter');
      
      throw error;
    }
  }, []);

  return { measureApiCall };
}

// Hook for performance-aware infinite scrolling
export function useInfiniteScrollPerformance(
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => void,
  measureName?: string
) {
  const observerRef = useRef<IntersectionObserver | undefined>(undefined);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isFetchingNextPage) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        const start = performance.now();
        
        fetchNextPage();
        
        if (measureName) {
          // Measure time to next page load
          setTimeout(() => {
            const end = performance.now();
            performanceMonitor.recordMetric(`infinite_scroll_${measureName}`, end - start, 'timing');
          }, 100);
        }
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [isFetchingNextPage, hasNextPage, fetchNextPage, measureName]);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return { lastElementRef, loadingRef };
}

// Hook for monitoring form performance
export function useFormPerformance(formName: string) {
  const startTimeRef = useRef<number>(performance.now());
  const fieldInteractions = useRef<number>(0);

  const recordFieldInteraction = useCallback(() => {
    fieldInteractions.current++;
    performanceMonitor.recordMetric(`form_${formName}_interactions`, fieldInteractions.current, 'counter');
  }, [formName]);

  const recordFormSubmission = useCallback((success: boolean) => {
    const totalTime = performance.now() - startTimeRef.current;
    const status = success ? 'success' : 'error';
    
    performanceMonitor.recordMetric(`form_${formName}_${status}`, totalTime, 'timing');
    performanceMonitor.recordMetric(`form_${formName}_total_interactions`, fieldInteractions.current, 'gauge');
  }, [formName]);

  return {
    recordFieldInteraction,
    recordFormSubmission,
  };
}

// Hook for performance monitoring with cleanup
export function usePerformanceMonitoring(componentName: string) {
  const mountTime = useRef<number>(performance.now());

  useEffect(() => {
    // Record component mount
    performanceMonitor.recordMetric(`component_${componentName}_mount`, performance.now() - mountTime.current, 'timing');

    return () => {
      // Record component unmount
      const totalLifetime = performance.now() - mountTime.current;
      performanceMonitor.recordMetric(`component_${componentName}_lifetime`, totalLifetime, 'timing');
    };
  }, [componentName]);

  const recordCustomEvent = useCallback((eventName: string, value?: number) => {
    performanceMonitor.recordMetric(`${componentName}_${eventName}`, value || 1, 'counter');
  }, [componentName]);

  return { recordCustomEvent };
}

// Re-export React for the debounce hook
import React from 'react';