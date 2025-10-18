// Request caching service for static data optimization

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes
  private maxSize = 100;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL;
    this.maxSize = options.maxSize || this.maxSize;
  }

  // Generate cache key from URL and parameters
  private generateKey(url: string, params?: Record<string, any>): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${url}:${paramString}`;
  }

  // Check if cache entry is valid
  private isValid(entry: CacheEntry<any>): boolean {
    return Date.now() < entry.expiresAt;
  }

  // Check if cache entry is stale but not expired
  private isStale(entry: CacheEntry<any>, staleTTL: number = this.defaultTTL / 2): boolean {
    return Date.now() > (entry.timestamp + staleTTL) && Date.now() < entry.expiresAt;
  }

  // Evict oldest entries when cache is full
  private evictOldest(): void {
    if (this.cache.size >= this.maxSize) {
      let oldestKey = '';
      let oldestTime = Date.now();

      for (const [key, entry] of this.cache.entries()) {
        if (entry.timestamp < oldestTime) {
          oldestTime = entry.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
  }

  // Get cached data
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (this.isValid(entry)) {
      return entry.data;
    }

    // Remove expired entry
    this.cache.delete(key);
    return null;
  }

  // Set cached data
  set<T>(key: string, data: T, ttl?: number): void {
    this.evictOldest();

    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + (ttl || this.defaultTTL),
    };

    this.cache.set(key, entry);
  }

  // Delete cached data
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cached data
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Clear expired entries
  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now >= entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  // Get cached data with stale-while-revalidate strategy
  async getWithSWR<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; staleTTL?: number } = {}
  ): Promise<T> {
    const entry = this.cache.get(key);
    const { ttl = this.defaultTTL, staleTTL = ttl / 2 } = options;

    // Return fresh data if available
    if (entry && this.isValid(entry) && !this.isStale(entry, staleTTL)) {
      return entry.data;
    }

    // Check if there's already a pending request for this key
    const pendingRequest = this.pendingRequests.get(key);
    if (pendingRequest) {
      // If we have stale data, return it immediately and let the pending request update the cache
      if (entry && this.isValid(entry)) {
        return entry.data;
      }
      // Otherwise wait for the pending request
      return pendingRequest;
    }

    // Create new request
    const request = fetchFn().then(data => {
      this.set(key, data, ttl);
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      this.pendingRequests.delete(key);
      // If we have stale data and the request fails, return stale data
      if (entry && this.isValid(entry)) {
        return entry.data;
      }
      throw error;
    });

    this.pendingRequests.set(key, request);

    // If we have stale data, return it immediately and update in background
    if (entry && this.isValid(entry)) {
      return entry.data;
    }

    // Otherwise wait for the request
    return request;
  }

  // Cached fetch wrapper
  async cachedFetch<T>(
    url: string,
    options: RequestInit & { cacheKey?: string; ttl?: number; useStaleWhileRevalidate?: boolean } = {}
  ): Promise<T> {
    const { cacheKey, ttl, useStaleWhileRevalidate = true, ...fetchOptions } = options;
    const key = cacheKey || this.generateKey(url, fetchOptions);

    if (useStaleWhileRevalidate) {
      return this.getWithSWR(key, async () => {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
      }, { ttl });
    }

    // Simple cache strategy
    const cached = this.get<T>(key);
    if (cached) {
      return cached;
    }

    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    this.set(key, data, ttl);
    return data;
  }

  // Prefetch data and store in cache
  async prefetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await fetchFn();
      this.set(key, data, ttl);
    } catch (error) {
      console.warn(`Failed to prefetch data for key ${key}:`, error);
    }
  }

  // Get cache statistics
  getStats() {
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      totalSize++;
      if (this.isValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    }

    return {
      totalEntries: totalSize,
      validEntries,
      expiredEntries,
      pendingRequests: this.pendingRequests.size,
      hitRate: totalSize > 0 ? validEntries / totalSize : 0,
    };
  }

  // Invalidate cache entries by pattern
  invalidatePattern(pattern: string | RegExp): number {
    let deletedCount = 0;
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

// Create default cache instance
export const cacheService = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
});

// Create separate cache instances for different data types
export const staticDataCache = new CacheService({
  ttl: 30 * 60 * 1000, // 30 minutes for static data
  maxSize: 50,
});

export const userDataCache = new CacheService({
  ttl: 2 * 60 * 1000, // 2 minutes for user data
  maxSize: 20,
});

// Auto-cleanup expired entries every 5 minutes
setInterval(() => {
  cacheService.clearExpired();
  staticDataCache.clearExpired();
  userDataCache.clearExpired();
}, 5 * 60 * 1000);

export { CacheService };