import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint to fetch school analytics data for admin dashboard
 * 
 * This endpoint returns engagement metrics for schools including:
 * - Times added to favorites
 * - New ratings submitted
 * - Average time spent on school page
 * - Click-through rate from search results
 * 
 * The data is aggregated by school and date.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the session to check if user is authenticated and is an admin
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '30';
    const schoolId = searchParams.get('schoolId');
    
    // Calculate the date range
    const daysAgo = parseInt(days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);
    
    // Build the query
    const whereClause: any = {
      date: {
        gte: startDate,
      },
    };
    
    // Add schoolId filter if provided
    if (schoolId) {
      whereClause.schoolId = schoolId;
    }
    
    // Fetch school analytics data
    const schoolAnalytics = await prisma.schoolAnalytics.findMany({
      where: whereClause,
      orderBy: [
        {
          date: 'desc',
        },
      ],
      include: {
        school: {
          select: {
            name: true,
          },
        },
      },
    });
    
    // Format the data for the response
    const formattedData = schoolAnalytics.map(item => ({
      schoolId: item.schoolId,
      schoolName: item.school.name,
      date: item.date.toISOString().split('T')[0],
      favoritesAdded: item.favoritesAdded,
      ratingsSubmitted: item.ratingsSubmitted,
      avgTimeOnPage: item.avgTimeOnPage,
      clickThroughRate: parseFloat(item.clickThroughRate.toString()),
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching school analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
