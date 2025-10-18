// Memoization service for expensive computations

interface MemoOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
  keyGenerator?: (...args: any[]) => string;
}

interface MemoEntry<T> {
  value: T;
  timestamp: number;
  expiresAt?: number;
  accessCount: number;
  lastAccessed: number;
}

class MemoizationService {
  private caches = new Map<string, Map<string, MemoEntry<any>>>();
  private defaultMaxSize = 50;
  private defaultTTL = 10 * 60 * 1000; // 10 minutes

  // Create a memoized version of a function
  memoize<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    options: MemoOptions & { name?: string } = {}
  ): (...args: TArgs) => TReturn {
    const {
      maxSize = this.defaultMaxSize,
      ttl = this.defaultTTL,
      keyGenerator = this.defaultKeyGenerator,
      name = fn.name || 'anonymous',
    } = options;

    const cache = new Map<string, MemoEntry<TReturn>>();
    this.caches.set(name, cache);

    return (...args: TArgs): TReturn => {
      const key = keyGenerator(...args);
      const now = Date.now();

      // Check if we have a valid cached result
      const entry = cache.get(key);
      if (entry) {
        // Check if entry is still valid
        if (!entry.expiresAt || now < entry.expiresAt) {
          entry.accessCount++;
          entry.lastAccessed = now;
          return entry.value;
        } else {
          // Remove expired entry
          cache.delete(key);
        }
      }

      // Compute new result
      const result = fn(...args);

      // Evict oldest entries if cache is full
      if (cache.size >= maxSize) {
        this.evictLRU(cache, Math.floor(maxSize * 0.2)); // Remove 20% of entries
      }

      // Store new result
      const newEntry: MemoEntry<TReturn> = {
        value: result,
        timestamp: now,
        expiresAt: ttl ? now + ttl : undefined,
        accessCount: 1,
        lastAccessed: now,
      };

      cache.set(key, newEntry);
      return result;
    };
  }

  // Create a memoized async function
  memoizeAsync<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => Promise<TReturn>,
    options: MemoOptions & { name?: string } = {}
  ): (...args: TArgs) => Promise<TReturn> {
    const {
      maxSize = this.defaultMaxSize,
      ttl = this.defaultTTL,
      keyGenerator = this.defaultKeyGenerator,
      name = fn.name || 'asyncAnonymous',
    } = options;

    const cache = new Map<string, MemoEntry<Promise<TReturn>>>();
    const pendingPromises = new Map<string, Promise<TReturn>>();
    this.caches.set(name, cache);

    return async (...args: TArgs): Promise<TReturn> => {
      const key = keyGenerator(...args);
      const now = Date.now();

      // Check if we have a valid cached result
      const entry = cache.get(key);
      if (entry) {
        // Check if entry is still valid
        if (!entry.expiresAt || now < entry.expiresAt) {
          entry.accessCount++;
          entry.lastAccessed = now;
          return entry.value;
        } else {
          // Remove expired entry
          cache.delete(key);
        }
      }

      // Check if there's already a pending promise for this key
      const pendingPromise = pendingPromises.get(key);
      if (pendingPromise) {
        return pendingPromise;
      }

      // Create new promise
      const promise = fn(...args).finally(() => {
        pendingPromises.delete(key);
      });

      pendingPromises.set(key, promise);

      // Evict oldest entries if cache is full
      if (cache.size >= maxSize) {
        this.evictLRU(cache, Math.floor(maxSize * 0.2));
      }

      // Store promise in cache
      const newEntry: MemoEntry<Promise<TReturn>> = {
        value: promise,
        timestamp: now,
        expiresAt: ttl ? now + ttl : undefined,
        accessCount: 1,
        lastAccessed: now,
      };

      cache.set(key, newEntry);
      return promise;
    };
  }

  // Default key generator
  private defaultKeyGenerator(...args: any[]): string {
    return JSON.stringify(args);
  }

  // Evict least recently used entries
  private evictLRU<T>(cache: Map<string, MemoEntry<T>>, count: number): void {
    const entries = Array.from(cache.entries())
      .sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed)
      .slice(0, count);

    for (const [key] of entries) {
      cache.delete(key);
    }
  }

  // Clear cache for a specific function
  clearCache(name: string): boolean {
    const cache = this.caches.get(name);
    if (cache) {
      cache.clear();
      return true;
    }
    return false;
  }

  // Clear all caches
  clearAllCaches(): void {
    for (const cache of this.caches.values()) {
      cache.clear();
    }
  }

  // Get cache statistics
  getCacheStats(name?: string) {
    if (name) {
      const cache = this.caches.get(name);
      if (!cache) return null;
      return this.calculateCacheStats(name, cache);
    }

    const stats: Record<string, any> = {};
    for (const [cacheName, cache] of this.caches.entries()) {
      stats[cacheName] = this.calculateCacheStats(cacheName, cache);
    }
    return stats;
  }

  private calculateCacheStats(name: string, cache: Map<string, MemoEntry<any>>) {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;
    let totalAccessCount = 0;

    for (const entry of cache.values()) {
      totalAccessCount += entry.accessCount;
      if (!entry.expiresAt || now < entry.expiresAt) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      name,
      totalEntries: cache.size,
      validEntries,
      expiredEntries,
      totalAccessCount,
      averageAccessCount: cache.size > 0 ? totalAccessCount / cache.size : 0,
      hitRate: cache.size > 0 ? validEntries / cache.size : 0,
    };
  }

  // Clean up expired entries
  cleanupExpired(): number {
    let totalCleaned = 0;
    const now = Date.now();

    for (const cache of this.caches.values()) {
      const keysToDelete: string[] = [];
      
      for (const [key, entry] of cache.entries()) {
        if (entry.expiresAt && now >= entry.expiresAt) {
          keysToDelete.push(key);
        }
      }

      for (const key of keysToDelete) {
        cache.delete(key);
        totalCleaned++;
      }
    }

    return totalCleaned;
  }
}

// Create default memoization service instance
export const memoizationService = new MemoizationService();

// Convenience functions for common use cases
export const memoize = memoizationService.memoize.bind(memoizationService);
export const memoizeAsync = memoizationService.memoizeAsync.bind(memoizationService);

// Specific memoized functions for common expensive operations

// Memoized currency formatter
export const formatCurrency = memoize(
  (amount: number, currency: string = 'EUR', locale: string = 'pt-PT') => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  },
  { name: 'formatCurrency', maxSize: 100, ttl: 30 * 60 * 1000 } // 30 minutes
);

// Memoized date formatter
export const formatDate = memoize(
  (date: string | Date, options: Intl.DateTimeFormatOptions = {}, locale: string = 'pt-PT') => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    }).format(dateObj);
  },
  { name: 'formatDate', maxSize: 200, ttl: 60 * 60 * 1000 } // 1 hour
);

// Memoized text truncation
export const truncateText = memoize(
  (text: string, maxLength: number, suffix: string = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },
  { name: 'truncateText', maxSize: 500, ttl: 60 * 60 * 1000 } // 1 hour
);

// Memoized search filtering
export const filterBySearch = memoize(
  <T extends Record<string, any>>(
    items: T[],
    searchTerm: string,
    searchFields: (keyof T)[]
  ): T[] => {
    if (!searchTerm.trim()) return items;
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return items.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && 
               typeof value === 'string' && 
               value.toLowerCase().includes(lowercaseSearch);
      })
    );
  },
  { 
    name: 'filterBySearch', 
    maxSize: 100, 
    ttl: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (items, searchTerm, searchFields) => 
      `${items.length}-${searchTerm}-${searchFields.join(',')}`
  }
);

// Memoized sorting
export const sortItems = memoize(
  <T extends Record<string, any>>(
    items: T[],
    sortBy: keyof T,
    sortOrder: 'asc' | 'desc'
  ): T[] => {
    return [...items].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (aValue === bValue) return 0;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  },
  { 
    name: 'sortItems', 
    maxSize: 100, 
    ttl: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (items, sortBy, sortOrder) => 
      `${items.length}-${String(sortBy)}-${sortOrder}`
  }
);

// Auto-cleanup expired entries every 10 minutes
setInterval(() => {
  memoizationService.cleanupExpired();
}, 10 * 60 * 1000);

export { MemoizationService };