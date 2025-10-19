// Performance monitoring and optimization utilities

import React from "react";

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string>;
}

interface ComponentPerformanceData {
  componentName: string;
  renderTime: number;
  renderCount: number;
  lastRender: number;
  averageRenderTime: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private componentMetrics = new Map<string, ComponentPerformanceData>();
  private observers: PerformanceObserver[] = [];
  private isEnabled = true;

  constructor() {
    this.setupPerformanceObservers();
  }

  // Setup performance observers for Web Vitals
  private setupPerformanceObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page_load_time', navEntry.loadEventEnd - navEntry.fetchStart, 'timing');
            this.recordMetric('dom_content_loaded', navEntry.domContentLoadedEventEnd - navEntry.fetchStart, 'timing');
            this.recordMetric('first_paint', navEntry.responseEnd - navEntry.fetchStart, 'timing');
          }
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric(entry.name.replace('-', '_'), entry.startTime, 'timing');
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe largest contentful paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('largest_contentful_paint', lastEntry.startTime, 'timing');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Observe layout shifts
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        this.recordMetric('cumulative_layout_shift', clsValue, 'gauge');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('Failed to setup performance observers:', error);
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, type: PerformanceMetric['type'], tags?: Record<string, string>): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      type,
      tags,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  // Measure function execution time
  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name?: string
  ): T {
    const functionName = name || fn.name || 'anonymous';
    
    return ((...args: Parameters<T>) => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      this.recordMetric(`function_${functionName}`, end - start, 'timing');
      
      return result;
    }) as T;
  }

  // Measure async function execution time
  measureAsyncFunction<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    name?: string
  ): T {
    const functionName = name || fn.name || 'asyncAnonymous';
    
    return (async (...args: Parameters<T>) => {
      const start = performance.now();
      try {
        const result = await fn(...args);
        const end = performance.now();
        this.recordMetric(`async_function_${functionName}`, end - start, 'timing');
        return result;
      } catch (error) {
        const end = performance.now();
        this.recordMetric(`async_function_${functionName}_error`, end - start, 'timing');
        throw error;
      }
    }) as T;
  }

  // Record component render performance with controlled logging
  recordComponentRender(componentName: string, renderTime: number): void {
    const existing = this.componentMetrics.get(componentName);
    
    if (existing) {
      existing.renderCount++;
      existing.lastRender = Date.now();
      existing.averageRenderTime = (existing.averageRenderTime * (existing.renderCount - 1) + renderTime) / existing.renderCount;
    } else {
      this.componentMetrics.set(componentName, {
        componentName,
        renderTime,
        renderCount: 1,
        lastRender: Date.now(),
        averageRenderTime: renderTime,
      });
    }

    this.recordMetric(`component_render_${componentName}`, renderTime, 'timing');
    
    // Use performance logger for component performance with throttling
    if (typeof window !== 'undefined' && (window as any).performanceLogger) {
      (window as any).performanceLogger.logComponentPerformance(componentName, renderTime);
    }
  }

  // Get performance metrics
  getMetrics(name?: string, limit?: number): PerformanceMetric[] {
    let filtered = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;

    if (limit) {
      filtered = filtered.slice(-limit);
    }

    return filtered;
  }

  // Get component performance data
  getComponentMetrics(componentName?: string): ComponentPerformanceData[] {
    if (componentName) {
      const data = this.componentMetrics.get(componentName);
      return data ? [data] : [];
    }

    return Array.from(this.componentMetrics.values());
  }

  // Get performance summary
  getPerformanceSummary() {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < 60000); // Last minute

    const summary = {
      totalMetrics: this.metrics.length,
      recentMetrics: recentMetrics.length,
      componentCount: this.componentMetrics.size,
      averageRenderTime: 0,
      slowestComponents: [] as ComponentPerformanceData[],
      webVitals: {} as Record<string, number>,
    };

    // Calculate average render time
    const renderTimes = Array.from(this.componentMetrics.values());
    if (renderTimes.length > 0) {
      summary.averageRenderTime = renderTimes.reduce((sum, data) => sum + data.averageRenderTime, 0) / renderTimes.length;
    }

    // Find slowest components
    summary.slowestComponents = renderTimes
      .sort((a, b) => b.averageRenderTime - a.averageRenderTime)
      .slice(0, 5);

    // Extract Web Vitals
    const vitalsMetrics = ['largest_contentful_paint', 'first_input_delay', 'cumulative_layout_shift'];
    for (const vital of vitalsMetrics) {
      const metric = this.metrics.find(m => m.name === vital);
      if (metric) {
        summary.webVitals[vital] = metric.value;
      }
    }

    return summary;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.componentMetrics.clear();
  }

  // Enable/disable monitoring
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  // Cleanup observers
  cleanup(): void {
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Performance measurement decorators and utilities

// Measure component render time
export function measureRender(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const MeasuredComponent = (props: any) => {
      const start = performance.now();
      
      React.useEffect(() => {
        const end = performance.now();
        performanceMonitor.recordComponentRender(componentName, end - start);
      });

      return React.createElement(Component, props);
    };

    MeasuredComponent.displayName = `Measured(${componentName})`;
    return MeasuredComponent as T;
  };
}

// Performance timing utilities
export const timing = {
  // Mark the start of a performance measurement
  mark: (name: string): void => {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${name}-start`);
    }
  },

  // Measure the time since a mark
  measure: (name: string): number => {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const entries = performance.getEntriesByName(name, 'measure');
      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        performanceMonitor.recordMetric(name, duration, 'timing');
        return duration;
      }
    }
    return 0;
  },

  // Time a function execution
  time: <T>(name: string, fn: () => T): T => {
    timing.mark(name);
    const result = fn();
    timing.measure(name);
    return result;
  },

  // Time an async function execution
  timeAsync: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    timing.mark(name);
    try {
      const result = await fn();
      timing.measure(name);
      return result;
    } catch (error) {
      timing.measure(`${name}_error`);
      throw error;
    }
  },
};

// Memory usage monitoring
export const memoryMonitor = {
  // Get current memory usage (if available)
  getCurrentUsage: (): Record<string, number> | null => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  // Monitor memory usage over time
  startMonitoring: (interval: number = 30000): (() => void) => {
    const intervalId = setInterval(() => {
      const usage = memoryMonitor.getCurrentUsage();
      if (usage) {
        performanceMonitor.recordMetric('memory_used_js_heap', usage.usedJSHeapSize, 'gauge');
        performanceMonitor.recordMetric('memory_total_js_heap', usage.totalJSHeapSize, 'gauge');
      }
    }, interval);

    return () => clearInterval(intervalId);
  },
};

// Bundle size monitoring
export const bundleMonitor = {
  // Record bundle load times
  recordBundleLoad: (bundleName: string, loadTime: number): void => {
    performanceMonitor.recordMetric(`bundle_load_${bundleName}`, loadTime, 'timing');
  },

  // Monitor dynamic imports
  measureDynamicImport: async <T>(importFn: () => Promise<T>, name: string): Promise<T> => {
    const start = performance.now();
    try {
      const result = await importFn();
      const end = performance.now();
      bundleMonitor.recordBundleLoad(name, end - start);
      return result;
    } catch (error) {
      const end = performance.now();
      performanceMonitor.recordMetric(`bundle_load_${name}_error`, end - start, 'timing');
      throw error;
    }
  },
};

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    performanceMonitor.cleanup();
  });
}

export { PerformanceMonitor };