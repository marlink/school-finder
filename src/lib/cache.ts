import { NextResponse } from 'next/server';

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Stale while revalidate in seconds
  tags?: string[]; // Cache tags for invalidation
}

// In-memory cache store (use Redis in production)
class MemoryCache {
  private cache = new Map<string, {
    data: unknown;
    timestamp: number;
    ttl: number;
    tags: string[];
  }>();

  set(key: string, data: unknown, config: CacheConfig): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: config.ttl * 1000, // Convert to milliseconds
      tags: config.tags || []
    });
  }

  get(key: string): unknown | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    const isExpired = now - item.timestamp > item.ttl;

    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  schools: {
    search: (params: Record<string, unknown>) => `schools:search:${JSON.stringify(params)}`,
    detail: (id: string) => `schools:detail:${id}`,
    similar: (id: string) => `schools:similar:${id}`,
    stats: () => 'schools:stats',
    filters: () => 'schools:filters'
  },
  user: {
    profile: (id: string) => `user:profile:${id}`,
    favorites: (id: string) => `user:favorites:${id}`,
    searches: (id: string) => `user:searches:${id}`
  },
  analytics: {
    dashboard: () => 'analytics:dashboard',
    searches: (period: string) => `analytics:searches:${period}`,
    popular: () => 'analytics:popular'
  }
};

// Cache decorator for API routes
export function withCache(config: CacheConfig) {
  return function <T extends (...args: unknown[]) => Promise<NextResponse>>(
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const request = args[0] as Request;
      const cacheKey = `${propertyKey}:${request.url}`;
      
      // Try to get from cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            'X-Cache': 'HIT',
            'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate || config.ttl}`
          }
        });
      }

      // Execute original method
      const response = await originalMethod.apply(this, args);
      const data = await response.json();

      // Cache the result
      cache.set(cacheKey, data, config);

      return NextResponse.json(data, {
        headers: {
          'X-Cache': 'MISS',
          'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate || config.ttl}`
        }
      });
    };

    return descriptor;
  };
}

// Cache middleware for manual caching
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  config: CacheConfig
): Promise<T> {
  // Try to get from cache
  const cachedData = cache.get(key);
  if (cachedData) {
    return cachedData;
  }

  // Fetch fresh data
  const data = await fetcher();
  
  // Cache the result
  cache.set(key, data, config);
  
  return data;
}

// Response caching utility
export function createCachedResponse(
  data: unknown,
  config: CacheConfig,
  cacheStatus: 'HIT' | 'MISS' = 'MISS'
): NextResponse {
  return NextResponse.json(data, {
    headers: {
      'X-Cache': cacheStatus,
      'Cache-Control': `public, max-age=${config.ttl}, stale-while-revalidate=${config.staleWhileRevalidate || config.ttl}`,
      'Vary': 'Accept-Encoding',
      'ETag': `"${Buffer.from(JSON.stringify(data)).toString('base64').slice(0, 16)}"`
    }
  });
}

// Cache warming utilities
export async function warmCache() {
  try {
    // Warm up common searches
    const commonSearches = [
      { q: '', type: 'all', city: '', page: 1, limit: 12 },
      { q: '', type: 'primary', city: '', page: 1, limit: 12 },
      { q: '', type: 'secondary', city: '', page: 1, limit: 12 }
    ];

    for (const search of commonSearches) {
      const key = cacheKeys.schools.search(search);
      // This would typically call the actual search function
      console.log(`Warming cache for key: ${key}`);
    }

    console.log('Cache warming completed');
  } catch (error) {
    console.error('Cache warming failed:', error);
  }
}

// Cache statistics
export function getCacheStats() {
  return {
    size: cache.size(),
    hitRate: 0, // Would need to track hits/misses
    memoryUsage: process.memoryUsage()
  };
}

// Cleanup expired cache entries (run periodically)
export function startCacheCleanup() {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000); // Clean up every 5 minutes
}

// Cache invalidation patterns
export const cacheInvalidation = {
  onSchoolUpdate: (schoolId: string) => {
    cache.invalidateByTag('schools');
    cache.invalidate(cacheKeys.schools.detail(schoolId));
    cache.invalidate(cacheKeys.schools.similar(schoolId));
  },
  
  onUserUpdate: (userId: string) => {
    cache.invalidate(cacheKeys.user.profile(userId));
    cache.invalidate(cacheKeys.user.favorites(userId));
    cache.invalidate(cacheKeys.user.searches(userId));
  },
  
  onSearchPerformed: () => {
    cache.invalidateByTag('analytics');
  }
};