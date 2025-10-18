// Performance testing utilities for development and debugging

import { performanceMonitor } from './performance';
import { cacheService, staticDataCache, userDataCache } from '../services/cacheService';
import { memoizationService } from '../services/memoizationService';

interface PerformanceTestResult {
  name: string;
  duration: number;
  success: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

interface PerformanceTestSuite {
  name: string;
  tests: PerformanceTest[];
}

interface PerformanceTest {
  name: string;
  test: () => Promise<void> | void;
  timeout?: number;
  expectedMaxDuration?: number;
}

class PerformanceTester {
  private results: PerformanceTestResult[] = [];
  private suites: PerformanceTestSuite[] = [];

  // Add a test suite
  addSuite(suite: PerformanceTestSuite): void {
    this.suites.push(suite);
  }

  // Run a single test
  async runTest(test: PerformanceTest): Promise<PerformanceTestResult> {
    const start = performance.now();
    
    try {
      // Set up timeout if specified
      if (test.timeout) {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Test timeout after ${test.timeout}ms`)), test.timeout);
        });
        
        await Promise.race([
          Promise.resolve(test.test()),
          timeoutPromise,
        ]);
      } else {
        await Promise.resolve(test.test());
      }
      
      const duration = performance.now() - start;
      
      // Check if duration exceeds expected maximum
      const success = !test.expectedMaxDuration || duration <= test.expectedMaxDuration;
      
      return {
        name: test.name,
        duration,
        success,
        metadata: {
          expectedMaxDuration: test.expectedMaxDuration,
          exceedsExpected: test.expectedMaxDuration ? duration > test.expectedMaxDuration : false,
        },
      };
    } catch (error) {
      const duration = performance.now() - start;
      return {
        name: test.name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Run all tests in a suite
  async runSuite(suite: PerformanceTestSuite): Promise<PerformanceTestResult[]> {
    const results: PerformanceTestResult[] = [];
    
    console.log(`Running performance test suite: ${suite.name}`);
    
    for (const test of suite.tests) {
      console.log(`  Running test: ${test.name}`);
      const result = await this.runTest(test);
      results.push(result);
      
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${test.name}: ${result.duration.toFixed(2)}ms`);
      
      if (!result.success && result.error) {
        console.error(`    Error: ${result.error}`);
      }
    }
    
    return results;
  }

  // Run all test suites
  async runAllSuites(): Promise<PerformanceTestResult[]> {
    this.results = [];
    
    for (const suite of this.suites) {
      const suiteResults = await this.runSuite(suite);
      this.results.push(...suiteResults);
    }
    
    return this.results;
  }

  // Get test results summary
  getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    const averageDuration = total > 0 ? totalDuration / total : 0;
    
    const slowestTest = this.results.reduce((slowest, current) => 
      current.duration > slowest.duration ? current : slowest,
      this.results[0] || { name: 'None', duration: 0 }
    );
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? (passed / total) * 100 : 0,
      totalDuration,
      averageDuration,
      slowestTest,
    };
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

// Create global performance tester
export const performanceTester = new PerformanceTester();

// Pre-defined test suites

// Cache performance tests
const cacheTestSuite: PerformanceTestSuite = {
  name: 'Cache Performance',
  tests: [
    {
      name: 'Cache Set/Get Performance',
      expectedMaxDuration: 1, // 1ms
      test: () => {
        const testData = { id: 1, name: 'Test', data: new Array(1000).fill('test') };
        cacheService.set('test-key', testData);
        const retrieved = cacheService.get('test-key');
        if (!retrieved) throw new Error('Cache retrieval failed');
      },
    },
    {
      name: 'Cache Miss Performance',
      expectedMaxDuration: 0.5, // 0.5ms
      test: () => {
        const result = cacheService.get('non-existent-key');
        if (result !== null) throw new Error('Expected cache miss');
      },
    },
    {
      name: 'Cache Eviction Performance',
      expectedMaxDuration: 10, // 10ms
      test: () => {
        // Fill cache beyond capacity
        for (let i = 0; i < 150; i++) {
          cacheService.set(`key-${i}`, { data: i });
        }
      },
    },
  ],
};

// Memoization performance tests
const memoizationTestSuite: PerformanceTestSuite = {
  name: 'Memoization Performance',
  tests: [
    {
      name: 'Memoized Function First Call',
      expectedMaxDuration: 5, // 5ms
      test: () => {
        const expensiveFunction = memoizationService.memoize((n: number) => {
          let result = 0;
          for (let i = 0; i < n; i++) {
            result += Math.sqrt(i);
          }
          return result;
        }, { name: 'test-expensive' });
        
        expensiveFunction(1000);
      },
    },
    {
      name: 'Memoized Function Cached Call',
      expectedMaxDuration: 0.1, // 0.1ms
      test: () => {
        const expensiveFunction = memoizationService.memoize((n: number) => {
          let result = 0;
          for (let i = 0; i < n; i++) {
            result += Math.sqrt(i);
          }
          return result;
        }, { name: 'test-expensive-cached' });
        
        // First call to populate cache
        expensiveFunction(1000);
        // Second call should be cached
        expensiveFunction(1000);
      },
    },
  ],
};

// Component render performance tests
const componentTestSuite: PerformanceTestSuite = {
  name: 'Component Performance',
  tests: [
    {
      name: 'Large List Rendering',
      expectedMaxDuration: 100, // 100ms
      test: () => {
        // Simulate rendering a large list
        const items = new Array(1000).fill(0).map((_, i) => ({ id: i, name: `Item ${i}` }));
        
        // Simulate component render time
        const start = performance.now();
        items.forEach(item => {
          // Simulate DOM operations
          const element = document.createElement('div');
          element.textContent = item.name;
          element.setAttribute('data-id', String(item.id));
        });
        const duration = performance.now() - start;
        
        if (duration > 100) {
          throw new Error(`Rendering took ${duration}ms, expected < 100ms`);
        }
      },
    },
  ],
};

// Memory performance tests
const memoryTestSuite: PerformanceTestSuite = {
  name: 'Memory Performance',
  tests: [
    {
      name: 'Memory Usage Check',
      test: () => {
        if (typeof performance !== 'undefined' && 'memory' in performance) {
          const memory = (performance as any).memory;
          const usedMB = memory.usedJSHeapSize / (1024 * 1024);
          
          console.log(`Current memory usage: ${usedMB.toFixed(2)}MB`);
          
          // Record memory usage
          performanceMonitor.recordMetric('memory_test_usage', memory.usedJSHeapSize, 'gauge');
        }
      },
    },
    {
      name: 'Memory Leak Detection',
      test: () => {
        const initialMemory = typeof performance !== 'undefined' && 'memory' in performance
          ? (performance as any).memory.usedJSHeapSize
          : 0;
        
        // Create and cleanup objects
        const objects = new Array(10000).fill(0).map((_, i) => ({ id: i, data: new Array(100).fill(i) }));
        
        // Clear references
        objects.length = 0;
        
        // Force garbage collection if available
        if (typeof window !== 'undefined' && 'gc' in window) {
          (window as any).gc();
        }
        
        const finalMemory = typeof performance !== 'undefined' && 'memory' in performance
          ? (performance as any).memory.usedJSHeapSize
          : 0;
        
        const memoryIncrease = finalMemory - initialMemory;
        console.log(`Memory increase: ${(memoryIncrease / (1024 * 1024)).toFixed(2)}MB`);
      },
    },
  ],
};

// Add all test suites
performanceTester.addSuite(cacheTestSuite);
performanceTester.addSuite(memoizationTestSuite);
performanceTester.addSuite(componentTestSuite);
performanceTester.addSuite(memoryTestSuite);

// Utility functions for performance testing

// Test API performance
export async function testApiPerformance(
  apiCall: () => Promise<any>,
  expectedMaxDuration: number = 1000
): Promise<PerformanceTestResult> {
  const start = performance.now();
  
  try {
    await apiCall();
    const duration = performance.now() - start;
    
    return {
      name: 'API Call',
      duration,
      success: duration <= expectedMaxDuration,
      metadata: { expectedMaxDuration },
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      name: 'API Call',
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Test component render performance
export function testComponentRender(
  renderFunction: () => void,
  expectedMaxDuration: number = 16
): PerformanceTestResult {
  const start = performance.now();
  
  try {
    renderFunction();
    const duration = performance.now() - start;
    
    return {
      name: 'Component Render',
      duration,
      success: duration <= expectedMaxDuration,
      metadata: { expectedMaxDuration },
    };
  } catch (error) {
    const duration = performance.now() - start;
    return {
      name: 'Component Render',
      duration,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Performance benchmark utility
export class PerformanceBenchmark {
  private measurements: number[] = [];
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  // Start a measurement
  start(): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.measurements.push(duration);
      performanceMonitor.recordMetric(`benchmark_${this.name}`, duration, 'timing');
    };
  }

  // Get statistics
  getStats() {
    if (this.measurements.length === 0) {
      return null;
    }

    const sorted = [...this.measurements].sort((a, b) => a - b);
    const sum = this.measurements.reduce((a, b) => a + b, 0);
    
    return {
      count: this.measurements.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      mean: sum / this.measurements.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  // Clear measurements
  clear(): void {
    this.measurements = [];
  }
}

// Global performance testing functions for development
if (import.meta.env.DEV) {
  // Make performance testing available globally in development
  (window as any).performanceTester = performanceTester;
  (window as any).testApiPerformance = testApiPerformance;
  (window as any).testComponentRender = testComponentRender;
  (window as any).PerformanceBenchmark = PerformanceBenchmark;
  
  // Add console commands
  console.log('Performance testing utilities available:');
  console.log('- performanceTester.runAllSuites()');
  console.log('- testApiPerformance(apiCall, maxDuration)');
  console.log('- testComponentRender(renderFn, maxDuration)');
  console.log('- new PerformanceBenchmark(name)');
}

export { PerformanceTester, PerformanceTestSuite, PerformanceTest, PerformanceTestResult };