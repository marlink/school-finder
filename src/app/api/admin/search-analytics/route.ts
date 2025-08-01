import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

/**
 * API endpoint to fetch search analytics data for admin dashboard
 * 
 * This endpoint returns search term statistics including:
 * - What terms were searched
 * - How many times each term was searched
 * - Average number of results returned
 * 
 * The data is aggregated by search term and date.
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    await requireAdmin();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const days = searchParams.get('days') || '30';
    const limit = searchParams.get('limit') || '100';
    const searchTerm = searchParams.get('searchTerm');
    const sortBy = searchParams.get('sortBy') || 'count'; // 'count' or 'date'
    
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
    
    // Add searchTerm filter if provided
    if (searchTerm) {
      whereClause.searchTerm = {
        contains: searchTerm,
      };
    }
    
    // Determine the order by clause
    const orderBy: any[] = [];
    
    if (sortBy === 'date') {
      orderBy.push({ date: 'desc' });
      orderBy.push({ searchCount: 'desc' });
    } else {
      // Default to sorting by count
      orderBy.push({ searchCount: 'desc' });
      orderBy.push({ date: 'desc' });
    }
    
    // Fetch search analytics data
    const searchAnalytics = await prisma.searchAnalytics.findMany({
      where: whereClause,
      orderBy,
      take: parseInt(limit) || 100,
    });
    
    // Format the data for the response
    const formattedData = searchAnalytics.map(item => ({
      date: item.date.toISOString().split('T')[0],
      searchTerm: item.searchTerm,
      searchCount: item.searchCount,
      avgResults: parseFloat(item.avgResults.toString()),
    }));
    
    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 });
  }
}
