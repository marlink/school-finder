import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { DataMonitor, getDataOverview } from '@/lib/data-monitor';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'full';
    const format = searchParams.get('format') || 'json';

    const monitor = new DataMonitor();

    if (reportType === 'overview') {
      const overview = await getDataOverview();
      return NextResponse.json(overview);
    }

    if (reportType === 'export') {
      const exportData = await monitor.exportReport(format as 'json' | 'csv');
      
      if (format === 'csv') {
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="data-monitor-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        });
      }
      
      return new NextResponse(exportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="data-monitor-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    }

    // Full report
    const report = await monitor.generateReport();
    return NextResponse.json(report);

  } catch (error) {
    console.error('Error generating data monitor report:', error);
    return NextResponse.json(
      { error: 'Failed to generate data monitor report' },
      { status: 500 }
    );
  }
}
