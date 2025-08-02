import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id;
    
    // Get user subscription information from Stack Auth
    const userSubscription = user.clientMetadata?.subscription || 'free';
    const subscriptionTier = user.clientMetadata?.subscriptionTier || 'free';
    
    // Determine user tier based on Stack Auth metadata
    const isFreeTier = subscriptionTier === 'free' || !subscriptionTier;
    const isPremium = subscriptionTier === 'premium';
    const isEnterprise = subscriptionTier === 'enterprise';
    
    // Check if user has an active subscription
    const hasActiveSubscription = user.clientMetadata?.subscriptionStatus === 'active';
    
    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true }
    });

    const userSubscriptionStatus = dbUser?.subscriptionStatus || subscriptionTier;

    // Define search limits based on subscription tier
    const searchLimits = {
      free: 50,      // 50 searches per day for free users
      premium: 500,  // 500 searches per day for premium users  
      enterprise: -1 // Unlimited for enterprise users
    };

    // Get current search limit based on tier
    const currentSearchLimit = searchLimits[subscriptionTier as keyof typeof searchLimits] || searchLimits.free;

    // If user is enterprise, return unlimited status
    if (isEnterprise && hasActiveSubscription) {
      return NextResponse.json({
        searchesUsed: 0,
        searchLimit: -1, // -1 indicates unlimited
        remainingSearches: -1,
        resetTime: null,
        subscriptionStatus: userSubscriptionStatus,
        subscriptionTier,
        message: 'Unlimited searches available for Enterprise users'
      });
    }

    // If user is premium with active subscription, return premium limits
    if (isPremium && hasActiveSubscription) {
      // Get today's search count for premium users
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const searchCount = await prisma.searchHistory.count({
         where: {
           userId: userId,
           timestamp: {
             gte: today
           }
         }
       });

      const remainingSearches = Math.max(0, searchLimits.premium - searchCount);
      const resetTime = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Next day

      return NextResponse.json({
        searchesUsed: searchCount,
        searchLimit: searchLimits.premium,
        remainingSearches,
        resetTime: resetTime.toISOString(),
        subscriptionStatus: userSubscriptionStatus,
        subscriptionTier,
        message: `Premium user: ${remainingSearches} searches remaining today`
      });
    }

    // For free users (default case), check their search usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's search count for free users using SearchHistory
    const searchCount = await prisma.searchHistory.count({
      where: {
        userId: userId,
        timestamp: {
          gte: today
        }
      }
    });

    const remainingSearches = Math.max(0, searchLimits.free - searchCount);
    const resetTime = new Date(today.getTime() + 24 * 60 * 60 * 1000); // Next day
    const hoursUntilReset = Math.ceil((resetTime.getTime() - new Date().getTime()) / (1000 * 60 * 60));

    return NextResponse.json({
      searchesUsed: searchCount,
      searchLimit: searchLimits.free,
      remainingSearches,
      resetTime: resetTime.toISOString(),
      subscriptionStatus: userSubscriptionStatus,
      subscriptionTier,
      timeUntilReset: hoursUntilReset,
      message: hasActiveSubscription 
        ? `Free tier: ${remainingSearches} searches remaining today` 
        : `Free user: ${remainingSearches} searches remaining today. Upgrade for more searches!`
    });

  } catch (error) {
    console.error('Search limit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
