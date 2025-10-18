import { RouterProvider } from 'react-router-dom';
import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { router } from './router';
import { AuthGuard } from './components/AuthGuard';
import { usePerformanceMonitoring } from './hooks/usePerformance';
import { performanceMonitor } from './utils/performance';
import { useEffect } from 'react';

function App() {
  usePerformanceMonitoring('App');

  // Initialize performance monitoring
  useEffect(() => {
    // Record app initialization
    performanceMonitor.recordMetric('app_initialized', performance.now(), 'timing');

    // Log performance summary in development
    if (import.meta.env.DEV) {
      const logPerformance = () => {
        const summary = performanceMonitor.getPerformanceSummary();
        console.log('Performance Summary:', summary);
      };

      // Log performance every 30 seconds in development
      const interval = setInterval(logPerformance, 30000);
      
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <ChakraProvider value={defaultSystem}>
      <AuthGuard>
        <RouterProvider router={router} />
      </AuthGuard>
    </ChakraProvider>
  );
}

export default App
