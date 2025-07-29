import { NextRequest, NextResponse } from 'next/server';
import { performanceMonitor } from '@/lib/performance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const window = searchParams.get('window') || '1h';
    
    // Convert window to milliseconds
    const timeWindows: Record<string, number> = {
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
    };
    
    const timeWindow = timeWindows[window] || timeWindows['1h'];
    const stats = performanceMonitor.getStats(timeWindow);
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching performance stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance stats' },
      { status: 500 }
    );
  }
}