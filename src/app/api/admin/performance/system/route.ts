import { NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance';

export async function GET() {
  try {
    const systemMetrics = performanceMonitor.getSystemMetrics();
    const uptime = performanceMonitor.getUptime();
    
    return NextResponse.json({
      ...systemMetrics,
      uptime,
    });
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system metrics' },
      { status: 500 }
    );
  }
}