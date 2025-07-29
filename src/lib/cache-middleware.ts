import { NextRequest, NextResponse } from 'next/server';
import { cache, CacheConfig, createCachedResponse } from '@/lib/cache';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Rate limiting store
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Create new window
      const resetTime = now + windowMs;
      const entry = { count: 1, resetTime };
      this.store.set(key, entry);
      return entry;
    }

    // Increment existing window
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const rateLimitStore = new RateLimitStore();

// Clean up rate limit store every 5 minutes
setInterval(() => {
  rateLimitStore.cleanup();
}, 5 * 60 * 1000);

// Rate limiting middleware
export function withRateLimit(config: RateLimitConfig) {
  return function <T extends (request: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest) => {
      const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') || 
        'unknown';

      const key = `rate_limit:${clientIp}:${request.nextUrl.pathname}`;
      const result = rateLimitStore.increment(key, config.windowMs);

      if (result.count > config.maxRequests) {
        const resetTime = Math.ceil((result.resetTime - Date.now()) / 1000);
        return NextResponse.json(
          { 
            error: 'Too many requests', 
            message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
            retryAfter: resetTime
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': resetTime.toString()
            }
          }
        );
      }

      // Add rate limit headers to response
      const response = await handler(request);
      const remaining = Math.max(0, config.maxRequests - result.count);
      
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

      return response;
    }) as T;
  };
}

// Cache middleware with automatic key generation
export function withAutoCache(config: CacheConfig & { keyGenerator?: (request: NextRequest) => string }) {
  return function <T extends (request: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest) => {
      // Generate cache key
      const cacheKey = config.keyGenerator 
        ? config.keyGenerator(request)
        : `auto_cache:${request.nextUrl.pathname}:${request.nextUrl.search}`;

      // Try to get from cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return createCachedResponse(cachedData, config, 'HIT');
      }

      // Execute handler
      const response = await handler(request);
      
      // Only cache successful responses
      if (response.status === 200) {
        try {
          const data = await response.clone().json();
          cache.set(cacheKey, data, config);
          return createCachedResponse(data, config, 'MISS');
        } catch (error) {
          console.error('Failed to cache response:', error);
          return response;
        }
      }

      return response;
    }) as T;
  };
}

// Combined middleware for caching and rate limiting
export function withCacheAndRateLimit(
  cacheConfig: CacheConfig & { keyGenerator?: (request: NextRequest) => string },
  rateLimitConfig: RateLimitConfig
) {
  return function <T extends (request: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): T {
    const rateLimitedHandler = withRateLimit(rateLimitConfig)(handler);
    return withAutoCache(cacheConfig)(rateLimitedHandler);
  };
}

// Conditional caching based on user authentication
export function withConditionalCache(
  authenticatedConfig: CacheConfig,
  unauthenticatedConfig: CacheConfig,
  keyGenerator?: (request: NextRequest, isAuthenticated: boolean) => string
) {
  return function <T extends (request: NextRequest) => Promise<NextResponse>>(
    handler: T
  ): T {
    return (async (request: NextRequest) => {
      // Check if user is authenticated (simplified check)
      const authHeader = request.headers.get('authorization');
      const sessionCookie = request.cookies.get('next-auth.session-token');
      const isAuthenticated = !!(authHeader || sessionCookie);

      const config = isAuthenticated ? authenticatedConfig : unauthenticatedConfig;
      const cacheKey = keyGenerator 
        ? keyGenerator(request, isAuthenticated)
        : `conditional_cache:${isAuthenticated ? 'auth' : 'unauth'}:${request.nextUrl.pathname}:${request.nextUrl.search}`;

      // Try to get from cache
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        return createCachedResponse(cachedData, config, 'HIT');
      }

      // Execute handler
      const response = await handler(request);
      
      // Only cache successful responses
      if (response.status === 200) {
        try {
          const data = await response.clone().json();
          cache.set(cacheKey, data, config);
          return createCachedResponse(data, config, 'MISS');
        } catch (error) {
          console.error('Failed to cache response:', error);
          return response;
        }
      }

      return response;
    }) as T;
  };
}

// Cache invalidation utilities
export class CacheInvalidator {
  static invalidateSchoolData(schoolId?: string) {
    if (schoolId) {
      // Invalidate specific school
      cache.invalidateByTag(`school:${schoolId}`);
    } else {
      // Invalidate all school data
      cache.invalidateByTag('schools');
    }
  }

  static invalidateUserData(userId: string) {
    cache.invalidateByTag(`user:${userId}`);
  }

  static invalidateSearchResults() {
    cache.invalidateByTag('search');
  }

  static invalidateAnalytics() {
    cache.invalidateByTag('analytics');
  }

  static invalidateAll() {
    cache.clear();
  }
}

// Cache warming for common requests
export class CacheWarmer {
  static async warmSearchCache() {
    const commonSearches = [
      { q: '', type: 'all', page: 1, limit: 12 },
      { q: '', type: 'primary', page: 1, limit: 12 },
      { q: '', type: 'secondary', page: 1, limit: 12 },
      { q: '', type: 'university', page: 1, limit: 12 }
    ];

    for (const search of commonSearches) {
      try {
        // This would make actual requests to warm the cache
        const searchParams = new URLSearchParams({
          q: search.q,
          type: search.type,
          page: search.page.toString(),
          limit: search.limit.toString()
        });
        console.log(`Warming cache for search: ${searchParams.toString()}`);
        // In a real implementation, you'd make actual HTTP requests here
      } catch (error) {
        console.error('Failed to warm search cache:', error);
      }
    }
  }

  static async warmSchoolDetailsCache(popularSchoolIds: string[]) {
    for (const schoolId of popularSchoolIds) {
      try {
        console.log(`Warming cache for school: ${schoolId}`);
        // In a real implementation, you'd make actual HTTP requests here
      } catch (error) {
        console.error(`Failed to warm cache for school ${schoolId}:`, error);
      }
    }
  }
}

// Cache statistics and monitoring
export class CacheMonitor {
  private static hitCount = 0;
  private static missCount = 0;
  private static errorCount = 0;

  static recordHit() {
    this.hitCount++;
  }

  static recordMiss() {
    this.missCount++;
  }

  static recordError() {
    this.errorCount++;
  }

  static getStats() {
    const total = this.hitCount + this.missCount;
    const hitRate = total > 0 ? (this.hitCount / total) * 100 : 0;

    return {
      hits: this.hitCount,
      misses: this.missCount,
      errors: this.errorCount,
      total,
      hitRate: Number(hitRate.toFixed(2)),
      cacheSize: cache.size()
    };
  }

  static reset() {
    this.hitCount = 0;
    this.missCount = 0;
    this.errorCount = 0;
  }
}

// Export default configurations
export const defaultCacheConfigs = {
  search: {
    ttl: 300, // 5 minutes
    staleWhileRevalidate: 600, // 10 minutes
    tags: ['search', 'schools']
  },
  schoolDetails: {
    ttl: 1800, // 30 minutes
    staleWhileRevalidate: 3600, // 1 hour
    tags: ['schools']
  },
  userProfile: {
    ttl: 900, // 15 minutes
    staleWhileRevalidate: 1800, // 30 minutes
    tags: ['user']
  },
  analytics: {
    ttl: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours
    tags: ['analytics']
  }
};

export const defaultRateLimitConfigs = {
  search: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30 // 30 requests per minute
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100 // 100 requests per minute
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 auth attempts per 15 minutes
  }
};