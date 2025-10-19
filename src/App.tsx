import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { router } from './router';
import { AuthGuard } from './components/AuthGuard';
import { usePerformanceMonitoring } from './hooks/usePerformance';
import { performanceMonitor } from './utils/performance';
import { performanceLogger } from './config/performanceLogging';
import { useEffect, useRef } from 'react';

function App() {
  usePerformanceMonitoring('App');
  const performanceIntervalRef = useRef<number | null>(null);
  const metricsCountRef = useRef(0);

  // Initialize performance monitoring with controlled logging
  useEffect(() => {
    // Record app initialization
    performanceMonitor.recordMetric('app_initialized', performance.now(), 'timing');
    performanceLogger.info('Application initialized', 'app_init');

    // Setup environment-aware performance logging
    const config = performanceLogger.getConfig();
    
    if (config.enabled && config.enableConsoleOutput) {
      const logPerformance = () => {
        const summary = performanceMonitor.getPerformanceSummary();
        
        // Aggregate metrics instead of detailed logging
        const aggregatedSummary = {
          componentCount: summary.componentCount,
          avgRenderTime: Math.round(summary.averageRenderTime * 100) / 100,
          recentMetrics: summary.recentMetrics,
          memoryUsage: getMemoryUsage(),
        };

        // Use the performance logger with throttling
        performanceLogger.logPerformanceSummary(aggregatedSummary);
        
        metricsCountRef.current++;
        
        // Implement log rotation - clear old metrics every 100 summaries
        if (metricsCountRef.current % 100 === 0) {
          performanceMonitor.clearMetrics();
          performanceLogger.info('Performance metrics rotated to prevent memory issues', 'metrics_rotation');
        }
      };

      // Use configurable interval from performance logging config
      performanceIntervalRef.current = setInterval(logPerformance, config.logInterval);
    }

    return () => {
      if (performanceIntervalRef.current) {
        clearInterval(performanceIntervalRef.current);
      }
    };
  }, []);

  // Helper function to get memory usage
  const getMemoryUsage = () => {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
    }
    return null;
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
    </ChakraProvider>
  );
}

export default App
