import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUser } from '@/lib/auth';

/**
 * API endpoint to track school analytics data
 * 
 * This endpoint records engagement metrics for schools including:
 * - Times added to favorites
 * - New ratings submitted
 * - Average time spent on school page
 * - Click-through rate from search results
 * 
 * The data is aggregated by school and date.
 */
export async function POST(request: NextRequest) {
  try {
    // Get the user to check if user is authenticated (optional for analytics)
    const user = await getUser();
    
    // Extract data from request body
    const body = await request.json();
    const { 
      schoolId, 
      metricType, // 'favorite_add', 'rating_submit', 'page_view', 'search_click'
      timeOnPage, // in seconds, for 'page_view'
      clickThrough, // boolean, for 'search_click'
    } = body;
    
    // Validate required fields
    if (!schoolId || !metricType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Get today's date (without time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Find or create analytics record for today
    const analytics = await prisma.schoolAnalytics.upsert({
      where: {
        schoolId_date: {
          schoolId,
          date: today,
        },
      },
      update: {},
      create: {
        schoolId,
        date: today,
        favoritesAdded: 0,
        ratingsSubmitted: 0,
        avgTimeOnPage: 0,
        clickThroughRate: 0,
      },
    });
    
    // Update metrics based on the metric type
    switch (metricType) {
      case 'favorite_add':
        await prisma.schoolAnalytics.update({
          where: {
            schoolId_date: {
              schoolId,
              date: today,
            },
          },
          data: {
            favoritesAdded: { increment: 1 },
          },
        });
        break;
        
      case 'rating_submit':
        await prisma.schoolAnalytics.update({
          where: {
            schoolId_date: {
              schoolId,
              date: today,
            },
          },
          data: {
            ratingsSubmitted: { increment: 1 },
          },
        });
        break;
        
      case 'page_view':
        if (typeof timeOnPage === 'number') {
          const newTotalTime = (analytics.avgTimeOnPage * analytics.pageViews) + timeOnPage;
          const newPageViews = analytics.pageViews + 1;
          const newAvgTimeOnPage = Math.round(newTotalTime / newPageViews);

          await prisma.schoolAnalytics.update({
            where: {
              schoolId_date: {
                schoolId,
                date: today,
              },
            },
            data: {
              pageViews: { increment: 1 },
              avgTimeOnPage: newAvgTimeOnPage,
            },
          });
        }
        break;
        
      case 'search_click':
        if (clickThrough === true) {
          await prisma.schoolAnalytics.update({
            where: {
              schoolId_date: {
                schoolId,
                date: today,
              },
            },
            data: {
              clickThroughRate: { increment: 1 }, // Simplified: just counting clicks
            },
          });
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid metric type' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking school analytics:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}