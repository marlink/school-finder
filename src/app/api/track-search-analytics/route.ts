import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * API endpoint to track search analytics data
 * 
 * This endpoint records search term statistics including:
 * - What terms were searched
 * - How many times each term was searched
 * - Average number of results returned
 * 
 * The data is aggregated by search term and date.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the session to check if user is authenticated (optional)
    const session = await getServerSession(authOptions);
    
    // Extract data from request body
    const body = await request.json();
    const { 
      searchTerm, 
      resultCount, // number of results returned for this search
    } = body;
    
    // Validate required fields
    if (!searchTerm) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Normalize search term (lowercase, trim)
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();
    
    // Skip tracking for very short search terms (optional)
    if (normalizedSearchTerm.length < 2) {
      return NextResponse.json({ success: true, message: 'Search term too short, not tracked' });
    }
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find analytics record for today and this search term
    let analytics = await prisma.searchAnalytics.findUnique({
      where: {
        date_searchTerm: {
          date: today,
          searchTerm: normalizedSearchTerm,
        },
      },
    });

    if (analytics) {
      // If record exists, update it
      const newSearchCount = analytics.searchCount + 1;
      const currentAvg = parseFloat(analytics.avgResults.toString());
      const newAvg = ((currentAvg * analytics.searchCount) + (resultCount || 0)) / newSearchCount;

      analytics = await prisma.searchAnalytics.update({
        where: {
          id: analytics.id,
        },
        data: {
          searchCount: { increment: 1 },
          avgResults: newAvg,
        },
      });
    } else {
      // If record does not exist, create it
      analytics = await prisma.searchAnalytics.create({
        data: {
          date: today,
          searchTerm: normalizedSearchTerm,
          searchCount: 1,
          avgResults: resultCount || 0,
        },
      });
    }
    
    // Also track this search in the user_searches table if user is logged in
    // This is for subscription limits tracking
    if (session?.user?.id) {
      // Get the user's search record
      const userSearch = await prisma.userSearches.findUnique({
        where: { userId: session.user.id },
      });
      
      // If record exists, check if we need to reset the counter
      if (userSearch) {
        const lastReset = new Date(userSearch.lastReset);
        const now = new Date();
        const hoursSinceReset = Math.abs(now.getTime() - lastReset.getTime()) / 36e5; // 36e5 is the number of milliseconds in an hour
        
        // Reset counter if it's been more than 24 hours since the last reset
        if (hoursSinceReset >= 24) {
          await prisma.userSearches.update({
            where: { userId: session.user.id },
            data: {
              searchCount: 1,
              lastReset: now,
            },
          });
        } else {
          // Otherwise, increment the counter
          await prisma.userSearches.update({
            where: { userId: session.user.id },
            data: {
              searchCount: { increment: 1 },
            },
          });
        }
      } else {
        // Create a new record if it doesn't exist
        await prisma.userSearches.create({
          data: {
            userId: session.user.id,
            searchCount: 1,
            lastReset: new Date(),
          },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking search analytics:', error);
    return NextResponse.json({ error: 'Failed to track search analytics' }, { status: 500 });
  }
}