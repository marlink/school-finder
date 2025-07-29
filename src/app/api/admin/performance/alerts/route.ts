import { NextResponse } from 'next/server';
import { PerformanceAlerts } from '@/lib/performance';

export async function GET() {
  try {
    const alerts = PerformanceAlerts.checkAlerts();
    
    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Error checking performance alerts:', error);
    return NextResponse.json(
      { error: 'Failed to check performance alerts' },
      { status: 500 }
    );
  }
}