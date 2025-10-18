// Performance optimization configuration

export const performanceConfig = {
  // Caching configuration
  cache: {
    // Default TTL for different data types
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    staticDataTTL: 30 * 60 * 1000, // 30 minutes
    userDataTTL: 2 * 60 * 1000, // 2 minutes
    
    // Cache sizes
    maxCacheSize: 100,
    staticDataMaxSize: 50,
    userDataMaxSize: 20,
    
    // Enable/disable caching
    enabled: true,
    useStaleWhileRevalidate: true,
  },

  // Memoization configuration
  memoization: {
    // Default settings for memoized functions
    defaultMaxSize: 50,
    defaultTTL: 10 * 60 * 1000, // 10 minutes
    
    // Specific configurations for different function types
    formatters: {
      maxSize: 200,
      ttl: 60 * 60 * 1000, // 1 hour
    },
    
    filters: {
      maxSize: 100,
      ttl: 5 * 60 * 1000, // 5 minutes
    },
    
    computations: {
      maxSize: 50,
      ttl: 10 * 60 * 1000, // 10 minutes
    },
  },

  // Virtual scrolling configuration
  virtualScrolling: {
    // Thresholds for enabling virtualization
    listThreshold: 50, // Enable for lists with more than 50 items
    gridThreshold: 100, // Enable for grids with more than 100 items
    
    // Default item sizes
    defaultItemHeight: 80,
    defaultItemWidth: 200,
    
    // Overscan (number of items to render outside visible area)
    defaultOverscan: 5,
    
    // Buffer sizes
    bufferSize: 10,
  },

  // Debouncing and throttling
  debouncing: {
    search: 300, // ms
    resize: 100, // ms
    scroll: 16, // ms (60fps)
    input: 200, // ms
  },

  // Bundle optimization
  bundleOptimization: {
    // Code splitting thresholds
    chunkSizeWarningLimit: 1000, // KB
    assetInlineLimit: 4, // KB
    
    // Preloading
    enablePreloading: true,
    preloadCriticalRoutes: ['/dashboard', '/services'],
    
    // Lazy loading
    enableLazyLoading: true,
    lazyLoadImages: true,
    lazyLoadComponents: true,
  },

  // Performance monitoring
  monitoring: {
    enabled: true,
    
    // Metrics collection
    collectWebVitals: true,
    collectComponentMetrics: true,
    collectApiMetrics: true,
    
    // Sampling rates (0-1)
    samplingRate: 1.0, // Collect all metrics in development
    productionSamplingRate: 0.1, // Collect 10% in production
    
    // Retention
    maxMetrics: 1000,
    cleanupInterval: 10 * 60 * 1000, // 10 minutes
    
    // Thresholds for warnings
    thresholds: {
      componentRenderTime: 16, // ms (60fps)
      apiResponseTime: 1000, // ms
      bundleLoadTime: 3000, // ms
      memoryUsage: 50 * 1024 * 1024, // 50MB
    },
  },

  // Network optimization
  network: {
    // Request optimization
    enableRequestCaching: true,
    enableRequestDeduplication: true,
    enableRetry: true,
    maxRetries: 3,
    retryDelay: 1000, // ms
    
    // Compression
    enableCompression: true,
    compressionThreshold: 1024, // bytes
    
    // Prefetching
    enablePrefetching: true,
    prefetchOnHover: true,
    prefetchDelay: 100, // ms
  },

  // Image optimization
  images: {
    // Lazy loading
    enableLazyLoading: true,
    lazyLoadingThreshold: 100, // px from viewport
    
    // Responsive images
    enableResponsiveImages: true,
    breakpoints: [480, 768, 1024, 1280],
    
    // Formats
    preferredFormats: ['webp', 'avif', 'jpg'],
    fallbackFormat: 'jpg',
    
    // Quality
    defaultQuality: 80,
    thumbnailQuality: 60,
  },

  // Development settings
  development: {
    // Performance warnings
    enablePerformanceWarnings: true,
    warnOnSlowComponents: true,
    warnOnLargeProps: true,
    warnOnMemoryLeaks: true,
    
    // Debugging
    enablePerformanceLogging: true,
    logInterval: 30000, // ms
    
    // Hot reloading optimization
    enableFastRefresh: true,
    preserveState: true,
  },

  // Production settings
  production: {
    // Optimizations
    enableAllOptimizations: true,
    enableTreeShaking: true,
    enableMinification: true,
    enableCompression: true,
    
    // Monitoring
    enableErrorReporting: true,
    enablePerformanceReporting: true,
    
    // Caching
    enableAggressiveCaching: true,
    enableServiceWorker: false, // Can be enabled if needed
  },
};

// Environment-specific configuration
export const getPerformanceConfig = () => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  return {
    ...performanceConfig,
    
    // Override settings based on environment
    monitoring: {
      ...performanceConfig.monitoring,
      samplingRate: isDevelopment 
        ? performanceConfig.monitoring.samplingRate 
        : performanceConfig.monitoring.productionSamplingRate,
    },
    
    development: {
      ...performanceConfig.development,
      enablePerformanceWarnings: isDevelopment,
      enablePerformanceLogging: isDevelopment,
    },
    
    production: {
      ...performanceConfig.production,
      enableAllOptimizations: isProduction,
    },
  };
};

// Performance feature flags
export const performanceFeatures = {
  // Core features
  ENABLE_CACHING: true,
  ENABLE_MEMOIZATION: true,
  ENABLE_VIRTUAL_SCROLLING: true,
  ENABLE_LAZY_LOADING: true,
  
  // Advanced features
  ENABLE_PREFETCHING: true,
  ENABLE_REQUEST_DEDUPLICATION: true,
  ENABLE_STALE_WHILE_REVALIDATE: true,
  ENABLE_PERFORMANCE_MONITORING: true,
  
  // Experimental features
  ENABLE_CONCURRENT_FEATURES: false,
  ENABLE_STREAMING: false,
  ENABLE_SELECTIVE_HYDRATION: false,
  
  // Debug features (development only)
  ENABLE_PERFORMANCE_PROFILER: import.meta.env.DEV,
  ENABLE_RENDER_TRACKING: import.meta.env.DEV,
  ENABLE_MEMORY_PROFILING: import.meta.env.DEV,
};

// Helper function to check if a feature is enabled
export const isFeatureEnabled = (feature: keyof typeof performanceFeatures): boolean => {
  return performanceFeatures[feature] === true;
};

// Performance budgets (for monitoring and alerts)
export const performanceBudgets = {
  // Time budgets (milliseconds)
  pageLoadTime: 3000,
  firstContentfulPaint: 1500,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  
  // Size budgets (bytes)
  totalBundleSize: 1024 * 1024, // 1MB
  initialBundleSize: 512 * 1024, // 512KB
  imageSize: 500 * 1024, // 500KB
  
  // Memory budgets (bytes)
  heapSize: 50 * 1024 * 1024, // 50MB
  
  // Network budgets
  apiResponseTime: 1000, // ms
  maxConcurrentRequests: 6,
  
  // Component budgets
  componentRenderTime: 16, // ms (60fps)
  maxComponentDepth: 15,
  maxPropsSize: 1024, // bytes
};

export default performanceConfig;