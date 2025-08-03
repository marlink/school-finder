import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data sources - in a real app, this would come from a configuration database
    const sources = [
      {
        id: '1',
        name: 'Ministry of Education API',
        type: 'api',
        url: 'https://api.gov.pl/education/schools',
        active: true,
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        schoolCount: 1920,
        successRate: 98.5,
        avgResponseTime: 450
      },
      {
        id: '2',
        name: 'Regional Education Offices',
        type: 'web_scraping',
        url: 'https://kuratorium.edu.pl',
        active: true,
        lastSync: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        schoolCount: 856,
        successRate: 100,
        avgResponseTime: 1200
      },
      {
        id: '3',
        name: 'School Directory Portal',
        type: 'web_scraping',
        url: 'https://schools.directory.pl',
        active: false,
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24), // 24 hours ago
        schoolCount: 0,
        successRate: 0,
        avgResponseTime: 0,
        errorMessage: 'Site blocking requests'
      },
      {
        id: '4',
        name: 'Google Places API',
        type: 'api',
        url: 'https://maps.googleapis.com/maps/api/place',
        active: true,
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
        schoolCount: 2500,
        successRate: 95.2,
        avgResponseTime: 320
      }
    ];

    return NextResponse.json({ sources });
  } catch (error) {
    console.error('Error fetching scraping sources:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId, active } = await request.json();

    // Mock source update - in a real app, this would update the configuration
    console.log(`Source ${sourceId} ${active ? 'activated' : 'deactivated'}`);

    return NextResponse.json({ success: true, message: `Source ${active ? 'activated' : 'deactivated'}` });
  } catch (error) {
    console.error('Error updating scraping source:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}