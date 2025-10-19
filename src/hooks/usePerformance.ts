// React hooks for performance monitoring and optimization

import { useEffect, useRef, useCallback, useMemo } from 'react';
import { performanceMonitor, timing } from '../utils/performance';
import { performanceLogger } from '../config/performanceLogging';

// Hook to measure component render performance with selective logging
export function useRenderPerformance(
  componentName: string,
  options: {
    enableLogging?: boolean;
    slowRenderThreshold?: number;
  } = {}
) {
  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);
  const { enableLogging = false, slowRenderThreshold = 16 } = options;

  useEffect(() => {
    renderStartRef.current = performance.now();
    renderCountRef.current++;
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current;
    
    // Only record render performance if logging is enabled or render is slow
    if (enableLogging || renderTime > slowRenderThreshold) {
      performanceMonitor.recordComponentRender(componentName, renderTime);
    }
  });

  const recordCustomMetric = useCallback((name: string, value: number) => {
    // Only record custom metrics if logging is enabled
    if (enableLogging) {
      performanceMonitor.recordMetric(`${componentName}_${name}`, value, 'gauge');
    }
  }, [componentName, enableLogging]);

  return {
    renderCount: renderCountRef.current,
    recordCustomMetric,
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

// Hook for monitoring API request performance with controlled logging
export function useApiPerformance(options: { enableLogging?: boolean } = {}) {
  const { enableLogging = false } = options;

  const measureApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const start = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - start;
      
      // Record metrics selectively
      if (enableLogging || duration > 1000) { // Log slow API calls
        performanceMonitor.recordMetric(`api_${endpoint}_success`, duration, 'timing');
        performanceLogger.logApiPerformance(endpoint, duration, true);
      }
      
      if (enableLogging) {
        performanceMonitor.recordMetric(`api_${endpoint}_count`, 1, 'counter');
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      
      // Always log errors
      performanceMonitor.recordMetric(`api_${endpoint}_error`, duration, 'timing');
      performanceMonitor.recordMetric(`api_${endpoint}_error_count`, 1, 'counter');
      performanceLogger.logApiPerformance(endpoint, duration, false);
      
      throw error;
    }
  }, [enableLogging]);

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

// Hook for performance monitoring with cleanup and configurable intervals
export function usePerformanceMonitoring(
  componentName: string, 
  options: {
    enableDetailedLogging?: boolean;
    monitoringInterval?: number;
    collectMemoryMetrics?: boolean;
  } = {}
) {
  const mountTime = useRef<number>(performance.now());
  const lastMetricsCollection = useRef<number>(performance.now());
  const renderCount = useRef<number>(0);
  const performanceData = useRef<{
    totalRenderTime: number;
    maxRenderTime: number;
    minRenderTime: number;
  }>({
    totalRenderTime: 0,
    maxRenderTime: 0,
    minRenderTime: Infinity,
  });

  const {
    enableDetailedLogging = false,
    monitoringInterval = 60000, // 1 minute default
    collectMemoryMetrics = false,
  } = options;

  useEffect(() => {
    const mountDuration = performance.now() - mountTime.current;
    
    // Only record mount if it's significant or detailed logging is enabled
    if (mountDuration > 1 || enableDetailedLogging) {
      performanceMonitor.recordMetric(`component_${componentName}_mount`, mountDuration, 'timing');
    }

    // Setup periodic metrics collection if enabled
    let metricsInterval: number | null = null;
    
    if (enableDetailedLogging && monitoringInterval > 0) {
      metricsInterval = setInterval(() => {
        collectPerformanceData();
      }, monitoringInterval);
    }

    return () => {
      if (metricsInterval) {
        clearInterval(metricsInterval);
      }

      // Record component unmount with summary
      const totalLifetime = performance.now() - mountTime.current;
      const avgRenderTime = renderCount.current > 0 
        ? performanceData.current.totalRenderTime / renderCount.current 
        : 0;

      // Only record significant metrics or when detailed logging is enabled
      if (totalLifetime > 100 || enableDetailedLogging) {
        performanceMonitor.recordMetric(`component_${componentName}_lifetime`, totalLifetime, 'timing');
        
        if (renderCount.current > 0) {
          performanceMonitor.recordMetric(`component_${componentName}_avg_render`, avgRenderTime, 'gauge');
          performanceMonitor.recordMetric(`component_${componentName}_render_count`, renderCount.current, 'counter');
          
          if (enableDetailedLogging) {
            performanceMonitor.recordMetric(`component_${componentName}_max_render`, performanceData.current.maxRenderTime, 'gauge');
            performanceMonitor.recordMetric(`component_${componentName}_min_render`, performanceData.current.minRenderTime, 'gauge');
          }
        }
      }
    };
  }, [componentName, enableDetailedLogging, monitoringInterval]);

  const collectPerformanceData = useCallback(() => {
    const now = performance.now();
    
    // Collect memory metrics if enabled
    if (collectMemoryMetrics && typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      performanceMonitor.recordMetric(`component_${componentName}_memory_used`, memory.usedJSHeapSize, 'gauge');
    }

    // Reset collection timer
    lastMetricsCollection.current = now;
  }, [componentName, collectMemoryMetrics]);

  const recordCustomEvent = useCallback((eventName: string, value?: number) => {
    // Only record if detailed logging is enabled or it's an important event
    if (enableDetailedLogging || eventName.includes('error') || eventName.includes('warning')) {
      performanceMonitor.recordMetric(`${componentName}_${eventName}`, value || 1, 'counter');
    }
  }, [componentName, enableDetailedLogging]);

  const recordRenderTime = useCallback((renderTime: number) => {
    renderCount.current++;
    performanceData.current.totalRenderTime += renderTime;
    performanceData.current.maxRenderTime = Math.max(performanceData.current.maxRenderTime, renderTime);
    performanceData.current.minRenderTime = Math.min(performanceData.current.minRenderTime, renderTime);

    // Only record individual render times if detailed logging is enabled and render is slow
    if (enableDetailedLogging && renderTime > 16) { // Slower than 60fps
      performanceMonitor.recordMetric(`component_${componentName}_slow_render`, renderTime, 'timing');
    }
  }, [componentName, enableDetailedLogging]);

  const getPerformanceSummary = useCallback(() => {
    const avgRenderTime = renderCount.current > 0 
      ? performanceData.current.totalRenderTime / renderCount.current 
      : 0;

    return {
      componentName,
      renderCount: renderCount.current,
      averageRenderTime: avgRenderTime,
      maxRenderTime: performanceData.current.maxRenderTime === 0 ? 0 : performanceData.current.maxRenderTime,
      minRenderTime: performanceData.current.minRenderTime === Infinity ? 0 : performanceData.current.minRenderTime,
      totalLifetime: performance.now() - mountTime.current,
    };
  }, [componentName]);

  return { 
    recordCustomEvent, 
    recordRenderTime, 
    getPerformanceSummary,
    collectPerformanceData,
  };
}

// Re-export React for the debounce hook
import React from 'react';