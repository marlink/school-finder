import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock scraping jobs data - in a real app, this would come from a job queue system
    const jobs = [
      {
        id: '1',
        name: 'Ministry of Education Schools',
        status: 'running',
        progress: 65,
        startedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        estimatedCompletion: new Date(Date.now() + 1000 * 60 * 15), // 15 minutes from now
        schoolsProcessed: 1250,
        totalSchools: 1920,
        errors: 3
      },
      {
        id: '2',
        name: 'Regional Education Offices',
        status: 'completed',
        progress: 100,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        completedAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        schoolsProcessed: 856,
        totalSchools: 856,
        errors: 0
      },
      {
        id: '3',
        name: 'School Websites Scraping',
        status: 'failed',
        progress: 23,
        startedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        failedAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
        schoolsProcessed: 145,
        totalSchools: 630,
        errors: 15,
        errorMessage: 'Rate limit exceeded'
      },
      {
        id: '4',
        name: 'Google Places Data',
        status: 'pending',
        progress: 0,
        scheduledAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        schoolsProcessed: 0,
        totalSchools: 2500,
        errors: 0
      }
    ];

    const stats = {
      totalJobs: 4,
      activeJobs: 1,
      completedJobs: 1,
      failedJobs: 1,
      totalSchoolsScraped: 2251,
      successRate: 94.2
    };

    return NextResponse.json({ jobs, stats });
  } catch (error) {
    console.error('Error fetching scraping jobs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, jobId } = await request.json();

    // Mock job control - in a real app, this would interact with a job queue
    if (action === 'start' || action === 'stop' || action === 'restart') {
      // In a real implementation, you would interact with your scraping service
      // For now, we'll just log the action
      if (process.env.NODE_ENV === 'development') {
        console.log(`Job ${action} requested for job ${jobId}`);
      }
      
      return NextResponse.json({ success: true, message: `Job ${action} requested` });
    }
    return NextResponse.json({ success: true, message: `Job ${action} initiated` });
  } catch (error) {
    console.error('Error controlling scraping job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}