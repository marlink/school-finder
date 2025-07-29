import { cache } from './cache';

export interface PerformanceMetrics {
  timestamp: number;
  endpoint: string;
  method: string;
  responseTime: number;
  cacheHit: boolean;
  statusCode: number;
  userAgent?: string;
  userId?: string;
}

export interface SystemMetrics {
  timestamp: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cacheStats: {
    size: number;
    hitRate: number;
    missRate: number;
  };
  apiMetrics: {
    totalRequests: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k metrics
  private startTime = Date.now();

  // Track API performance
  trackRequest(metrics: PerformanceMetrics): void {
    this.metrics.push(metrics);
    
    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  // Get performance statistics
  getStats(
    timeWindow = 3600000, // Default 1 hour
    filters: {
      endpoint?: string;
      userId?: string;
    } = {}
  ): {
    totalRequests: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
    slowestEndpoints: Array<{ endpoint: string; avgTime: number }>;
    requestsPerMinute: number;
  } {
    const cutoff = Date.now() - timeWindow;
    const recentMetrics = this.metrics.filter(m => 
      m.timestamp > cutoff &&
      (!filters.endpoint || m.endpoint === filters.endpoint) &&
      (!filters.userId || m.userId === filters.userId)
    );

    if (recentMetrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
        slowestEndpoints: [],
        requestsPerMinute: 0,
      };
    }

    const totalRequests = recentMetrics.length;
    const averageResponseTime = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests;
    const cacheHits = recentMetrics.filter(m => m.cacheHit).length;
    const cacheHitRate = (cacheHits / totalRequests) * 100;
    const errors = recentMetrics.filter(m => m.statusCode >= 400).length;
    const errorRate = (errors / totalRequests) * 100;
    const requestsPerMinute = (totalRequests / (timeWindow / 60000));

    // Calculate slowest endpoints
    const endpointStats = new Map<string, { total: number; count: number }>();
    recentMetrics.forEach(m => {
      const current = endpointStats.get(m.endpoint) || { total: 0, count: 0 };
      endpointStats.set(m.endpoint, {
        total: current.total + m.responseTime,
        count: current.count + 1,
      });
    });

    const slowestEndpoints = Array.from(endpointStats.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        avgTime: stats.total / stats.count,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);

    return {
      totalRequests,
      averageResponseTime,
      cacheHitRate,
      errorRate,
      slowestEndpoints,
      requestsPerMinute,
    };
  }

  // Get system metrics
  getSystemMetrics(): SystemMetrics {
    const memoryUsage = process.memoryUsage();
    const cacheStats = {
      size: 0,
      hitRate: 0,
      missRate: 0,
    }; // Placeholder - will be implemented when cache stats are available
    const apiStats = this.getStats();

    return {
      timestamp: Date.now(),
      memoryUsage: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        percentage: (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      },
      cacheStats: {
        size: cacheStats.size,
        hitRate: cacheStats.hitRate,
        missRate: cacheStats.missRate,
      },
      apiMetrics: {
        totalRequests: apiStats.totalRequests,
        averageResponseTime: apiStats.averageResponseTime,
        errorRate: apiStats.errorRate,
      },
    };
  }

  // Get uptime
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  // Clear old metrics
  cleanup(): void {
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // Keep 24 hours
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
  }

  // Export metrics for analysis
  exportMetrics(timeWindow = 3600000): PerformanceMetrics[] {
    const cutoff = Date.now() - timeWindow;
    return this.metrics.filter(m => m.timestamp > cutoff);
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Middleware for tracking API performance
export function withPerformanceTracking<T extends Request, R extends Response>(
  handler: (request: T) => Promise<R>
) {
  return async (request: T): Promise<R> => {
    const startTime = Date.now();
    const url = new URL(request.url);
    const endpoint = url.pathname;
    const method = request.method;
    
    let response: R;
    let cacheHit = false;

    try {
      // Check if response came from cache
      response = await handler(request);
      cacheHit = response.headers.get('X-Cache') === 'HIT';
      
      // Track metrics
      const responseTime = Date.now() - startTime;
      const userAgent = request.headers.get('User-Agent') || undefined;
      
      performanceMonitor.trackRequest({
        timestamp: Date.now(),
        endpoint,
        method,
        responseTime,
        cacheHit,
        statusCode: response.status,
        userAgent,
      });

      return response;
    } catch (error) {
      // Create error response
      const errorResponse = new Response(
        JSON.stringify({ error: 'Internal Server Error' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );

      // Track error metrics
      const responseTime = Date.now() - startTime;
      const userAgent = request.headers.get('User-Agent') || undefined;
      
      performanceMonitor.trackRequest({
        timestamp: Date.now(),
        endpoint,
        method,
        responseTime,
        cacheHit: false,
        statusCode: errorResponse.status,
        userAgent,
      });

      throw error;
    }
  };
}

// Performance alerts
export class PerformanceAlerts {
  private static readonly SLOW_RESPONSE_THRESHOLD = 2000; // 2 seconds
  private static readonly HIGH_ERROR_RATE_THRESHOLD = 5; // 5%
  private static readonly LOW_CACHE_HIT_RATE_THRESHOLD = 70; // 70%

  static checkAlerts(): {
    slowResponses: boolean;
    highErrorRate: boolean;
    lowCacheHitRate: boolean;
    alerts: string[];
  } {
    const stats = performanceMonitor.getStats();
    const alerts: string[] = [];

    const slowResponses = stats.averageResponseTime > this.SLOW_RESPONSE_THRESHOLD;
    const highErrorRate = stats.errorRate > this.HIGH_ERROR_RATE_THRESHOLD;
    const lowCacheHitRate = stats.cacheHitRate < this.LOW_CACHE_HIT_RATE_THRESHOLD;

    if (slowResponses) {
      alerts.push(`Slow response time: ${stats.averageResponseTime.toFixed(0)}ms (threshold: ${this.SLOW_RESPONSE_THRESHOLD}ms)`);
    }

    if (highErrorRate) {
      alerts.push(`High error rate: ${stats.errorRate.toFixed(1)}% (threshold: ${this.HIGH_ERROR_RATE_THRESHOLD}%)`);
    }

    if (lowCacheHitRate && stats.totalRequests > 10) {
      alerts.push(`Low cache hit rate: ${stats.cacheHitRate.toFixed(1)}% (threshold: ${this.LOW_CACHE_HIT_RATE_THRESHOLD}%)`);
    }

    return {
      slowResponses,
      highErrorRate,
      lowCacheHitRate,
      alerts,
    };
  }
}

// Utility functions
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

// Start cleanup interval
if (typeof window === 'undefined') {
  setInterval(() => {
    performanceMonitor.cleanup();
  }, 60 * 60 * 1000); // Cleanup every hour
}