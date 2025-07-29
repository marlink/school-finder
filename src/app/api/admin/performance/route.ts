import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { performanceMonitor, PerformanceAlerts } from '@/lib/performance';

// Mock system metrics - in production, you'd get these from actual system monitoring
function getSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  
  return {
    uptime,
    memoryUsage: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external,
    },
    cpuUsage: Math.random() * 100, // Mock CPU usage
    activeConnections: Math.floor(Math.random() * 100) + 10,
    requestsPerMinute: Math.floor(Math.random() * 200) + 50,
  };
}

function getSlowQueries() {
  // Mock slow queries - in production, you'd track these from actual performance data
  return [
    {
      operation: 'search-schools',
      duration: 2500,
      timestamp: new Date(Date.now() - 300000).toISOString(),
      details: 'Complex search with multiple filters and sorting',
    },
    {
      operation: 'school-details',
      duration: 1800,
      timestamp: new Date(Date.now() - 600000).toISOString(),
      details: 'Loading school with extensive review data',
    },
  ];
}

function getErrorLog() {
  // Mock error log - in production, you'd track these from actual error monitoring
  return [
    {
      operation: 'search-schools',
      error: 'Database connection timeout',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      count: 3,
    },
    {
      operation: 'user-favorites',
      error: 'Invalid user session',
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      count: 1,
    },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get performance metrics from the monitor
    const stats = performanceMonitor.getStats();
    const systemMetrics = getSystemMetrics();
    const slowQueries = getSlowQueries();
    const errorLog = getErrorLog();

    // Create metrics in the expected format for the dashboard
    const metrics = [
      {
        operation: 'search-schools',
        count: stats.totalRequests,
        totalTime: stats.totalRequests * stats.averageResponseTime,
        averageTime: stats.averageResponseTime,
        minTime: Math.max(0, stats.averageResponseTime - 100),
        maxTime: stats.averageResponseTime + 200,
        lastExecuted: new Date().toISOString(),
        errorCount: Math.floor(stats.totalRequests * (stats.errorRate / 100)),
        successRate: 100 - stats.errorRate,
      },
    ];

    return NextResponse.json({
      metrics,
      systemMetrics,
      slowQueries,
      errorLog,
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'reset') {
      performanceMonitor.cleanup();
      return NextResponse.json({ message: 'Performance metrics reset successfully' });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing performance action:', error);
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}