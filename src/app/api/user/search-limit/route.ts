import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    // Get user's subscription status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If user is premium or enterprise, return unlimited status
    if (user.subscriptionStatus === 'premium' || user.subscriptionStatus === 'enterprise') {
      return NextResponse.json({
        searchCount: 0,
        maxSearches: -1, // -1 indicates unlimited
        resetTime: new Date().toISOString(),
        subscriptionStatus: user.subscriptionStatus,
        timeUntilReset: 0
      });
    }

    // For free users, check their search usage
    const searchRecord = await prisma.userSearches.findUnique({
      where: { userId }
    });

    const today = new Date();
    const maxSearchesForFree = 50; // Daily limit for free users
    
    if (!searchRecord) {
      // Create new search record for new user
      await prisma.userSearches.create({
        data: {
          userId,
          searchCount: 0,
          lastReset: today
        }
      });
      
      return NextResponse.json({
        searchCount: 0,
        maxSearches: maxSearchesForFree,
        resetTime: today.toISOString(),
        subscriptionStatus: user.subscriptionStatus,
        timeUntilReset: 24 // Reset in 24 hours
      });
    }

    // Check if we need to reset the daily count
    const lastReset = new Date(searchRecord.lastReset);
    const hoursSinceReset = (today.getTime() - lastReset.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceReset >= 24) {
      // Reset the daily count
      await prisma.userSearches.update({
        where: { userId },
        data: {
          searchCount: 0,
          lastReset: today
        }
      });
      
      return NextResponse.json({
        searchCount: 0,
        maxSearches: maxSearchesForFree,
        resetTime: today.toISOString(),
        subscriptionStatus: user.subscriptionStatus,
        timeUntilReset: 24
      });
    }

    // Calculate time until reset
    const timeUntilReset = 24 - hoursSinceReset;
    
    return NextResponse.json({
      searchCount: searchRecord.searchCount,
      maxSearches: maxSearchesForFree,
      resetTime: lastReset.toISOString(),
      subscriptionStatus: user.subscriptionStatus,
      timeUntilReset: timeUntilReset
    });

  } catch (error) {
    console.error('Search limit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
