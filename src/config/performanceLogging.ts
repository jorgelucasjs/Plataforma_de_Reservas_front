// Performance logging configuration with environment awareness and throttling

export interface PerformanceLoggingConfig {
  enabled: boolean;
  logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
  logInterval: number; // milliseconds
  maxLogsPerInterval: number;
  enableConsoleOutput: boolean;
  enableMetricsCollection: boolean;
  throttleConfig: {
    enabled: boolean;
    windowSize: number; // milliseconds
    maxLogsPerWindow: number;
  };
  environment: {
    development: Partial<PerformanceLoggingConfig>;
    production: Partial<PerformanceLoggingConfig>;
    test: Partial<PerformanceLoggingConfig>;
  };
}

// Default configuration
const defaultConfig: PerformanceLoggingConfig = {
  enabled: true,
  logLevel: 'info',
  logInterval: 30000, // 30 seconds
  maxLogsPerInterval: 10,
  enableConsoleOutput: true,
  enableMetricsCollection: true,
  throttleConfig: {
    enabled: true,
    windowSize: 10000, // 10 seconds
    maxLogsPerWindow: 5,
  },
  environment: {
    development: {
      enabled: true,
      logLevel: 'debug',
      logInterval: 30000,
      maxLogsPerInterval: 20,
      enableConsoleOutput: true,
      enableMetricsCollection: true,
      throttleConfig: {
        enabled: true,
        windowSize: 10000,
        maxLogsPerWindow: 10,
      },
    },
    production: {
      enabled: false, // Disabled by default in production
      logLevel: 'error',
      logInterval: 300000, // 5 minutes
      maxLogsPerInterval: 2,
      enableConsoleOutput: false,
      enableMetricsCollection: true,
      throttleConfig: {
        enabled: true,
        windowSize: 60000, // 1 minute
        maxLogsPerWindow: 1,
      },
    },
    test: {
      enabled: false,
      logLevel: 'none',
      logInterval: 0,
      maxLogsPerInterval: 0,
      enableConsoleOutput: false,
      enableMetricsCollection: false,
      throttleConfig: {
        enabled: false,
        windowSize: 0,
        maxLogsPerWindow: 0,
      },
    },
  },
};

// Environment detection
function getEnvironment(): 'development' | 'production' | 'test' {
  if (typeof import.meta !== 'undefined') {
    if (import.meta.env.MODE === 'test') return 'test';
    if (import.meta.env.PROD) return 'production';
    if (import.meta.env.DEV) return 'development';
  }
  
  // Fallback detection
  if (typeof window !== 'undefined' && (window as any).process) {
    const nodeEnv = (window as any).process.env?.NODE_ENV;
    if (nodeEnv === 'test') return 'test';
    if (nodeEnv === 'production') return 'production';
  }
  
  return 'development';
}

// Get environment-specific configuration
export function getPerformanceLoggingConfig(): PerformanceLoggingConfig {
  const environment = getEnvironment();
  const envConfig = defaultConfig.environment[environment];
  
  return {
    ...defaultConfig,
    ...envConfig,
    throttleConfig: {
      ...defaultConfig.throttleConfig,
      ...envConfig.throttleConfig,
    },
  };
}

// Log throttling mechanism
class LogThrottler {
  private logCounts = new Map<string, { count: number; windowStart: number }>();
  private config: PerformanceLoggingConfig['throttleConfig'];

  constructor(config: PerformanceLoggingConfig['throttleConfig']) {
    this.config = config;
  }

  updateConfig(config: PerformanceLoggingConfig['throttleConfig']): void {
    this.config = config;
  }

  shouldLog(logKey: string): boolean {
    if (!this.config.enabled) return true;

    const now = Date.now();
    const existing = this.logCounts.get(logKey);

    if (!existing || now - existing.windowStart >= this.config.windowSize) {
      // New window or first log for this key
      this.logCounts.set(logKey, { count: 1, windowStart: now });
      return true;
    }

    if (existing.count >= this.config.maxLogsPerWindow) {
      return false; // Throttled
    }

    existing.count++;
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.logCounts.entries()) {
      if (now - data.windowStart >= this.config.windowSize * 2) {
        this.logCounts.delete(key);
      }
    }
  }
}

// Performance logger with throttling and environment awareness
export class PerformanceLogger {
  private config: PerformanceLoggingConfig;
  private throttler: LogThrottler;
  private logBuffer: Array<{ message: string; level: string; timestamp: number }> = [];
  private lastFlush = Date.now();

  constructor() {
    this.config = getPerformanceLoggingConfig();
    this.throttler = new LogThrottler(this.config.throttleConfig);
    
    // Setup periodic cleanup and flush
    setInterval(() => {
      this.throttler.cleanup();
      this.flushLogs();
    }, Math.min(this.config.logInterval, 60000));
  }

  updateConfig(newConfig?: Partial<PerformanceLoggingConfig>): void {
    if (newConfig) {
      this.config = { ...this.config, ...newConfig };
    } else {
      this.config = getPerformanceLoggingConfig();
    }
    this.throttler.updateConfig(this.config.throttleConfig);
  }

  private shouldLog(level: PerformanceLoggingConfig['logLevel']): boolean {
    if (!this.config.enabled) return false;

    const levels = ['none', 'error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private addToBuffer(message: string, level: string): void {
    this.logBuffer.push({
      message,
      level,
      timestamp: Date.now(),
    });

    // Limit buffer size
    if (this.logBuffer.length > this.config.maxLogsPerInterval * 2) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogsPerInterval);
    }
  }

  private flushLogs(): void {
    const now = Date.now();
    if (now - this.lastFlush < this.config.logInterval || this.logBuffer.length === 0) {
      return;
    }

    if (this.config.enableConsoleOutput) {
      const logsToFlush = this.logBuffer.slice(0, this.config.maxLogsPerInterval);
      
      for (const log of logsToFlush) {
        const method = log.level === 'error' ? 'error' : 
                     log.level === 'warn' ? 'warn' : 'log';
        console[method](`[Performance ${log.level.toUpperCase()}]`, log.message);
      }

      if (this.logBuffer.length > this.config.maxLogsPerInterval) {
        console.log(`[Performance INFO] ${this.logBuffer.length - this.config.maxLogsPerInterval} additional logs throttled`);
      }
    }

    this.logBuffer = [];
    this.lastFlush = now;
  }

  log(message: string, level: PerformanceLoggingConfig['logLevel'] = 'info', logKey?: string): void {
    if (!this.shouldLog(level)) return;

    const key = logKey || `${level}_${message.substring(0, 50)}`;
    if (!this.throttler.shouldLog(key)) return;

    this.addToBuffer(message, level);
  }

  error(message: string, logKey?: string): void {
    this.log(message, 'error', logKey);
  }

  warn(message: string, logKey?: string): void {
    this.log(message, 'warn', logKey);
  }

  info(message: string, logKey?: string): void {
    this.log(message, 'info', logKey);
  }

  debug(message: string, logKey?: string): void {
    this.log(message, 'debug', logKey);
  }

  // Log performance summary with throttling
  logPerformanceSummary(summary: any): void {
    if (!this.shouldLog('info')) return;
    if (!this.throttler.shouldLog('performance_summary')) return;

    const message = `Performance Summary - Components: ${summary.componentCount}, Avg Render: ${summary.averageRenderTime?.toFixed(2)}ms, Recent Metrics: ${summary.recentMetrics}`;
    this.addToBuffer(message, 'info');
  }

  // Log component performance with throttling
  logComponentPerformance(componentName: string, renderTime: number): void {
    if (!this.shouldLog('debug')) return;
    if (!this.throttler.shouldLog(`component_${componentName}`)) return;

    const message = `Component ${componentName} rendered in ${renderTime.toFixed(2)}ms`;
    this.addToBuffer(message, 'debug');
  }

  // Log API performance with throttling
  logApiPerformance(endpoint: string, duration: number, success: boolean): void {
    const level = success ? 'debug' : 'warn';
    if (!this.shouldLog(level)) return;
    if (!this.throttler.shouldLog(`api_${endpoint}`)) return;

    const status = success ? 'completed' : 'failed';
    const message = `API ${endpoint} ${status} in ${duration.toFixed(2)}ms`;
    this.addToBuffer(message, level);
  }

  // Force flush logs (useful for testing or immediate output)
  flush(): void {
    this.lastFlush = 0; // Reset to force flush
    this.flushLogs();
  }

  // Get current configuration
  getConfig(): PerformanceLoggingConfig {
    return { ...this.config };
  }

  // Get throttling statistics
  getThrottlingStats(): Record<string, { count: number; windowStart: number }> {
    return Object.fromEntries(this.throttler['logCounts']);
  }
}

// Global performance logger instance
export const performanceLogger = new PerformanceLogger();

// Make performance logger globally available for integration
if (typeof window !== 'undefined') {
  (window as any).performanceLogger = performanceLogger;
}

// Utility functions for common logging patterns
export const logUtils = {
  // Log with automatic key generation
  logWithAutoKey: (message: string, level: PerformanceLoggingConfig['logLevel'] = 'info') => {
    const key = `auto_${level}_${Date.now()}`;
    performanceLogger.log(message, level, key);
  },

  // Log performance metric
  logMetric: (name: string, value: number, unit = 'ms') => {
    performanceLogger.debug(`Metric ${name}: ${value}${unit}`, `metric_${name}`);
  },

  // Log error with context
  logErrorWithContext: (error: Error, context: string) => {
    performanceLogger.error(`${context}: ${error.message}`, `error_${context}`);
  },

  // Log warning with throttling
  logThrottledWarning: (message: string, key: string) => {
    performanceLogger.warn(message, `warning_${key}`);
  },
};

export default performanceLogger;