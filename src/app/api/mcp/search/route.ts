import { NextRequest, NextResponse } from 'next/server';
import { mcpService } from '@/lib/mcp/service';
import { validateRequest, getSecurityHeaders } from '@/lib/security';
import { stackServerApp } from '@/stack';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// MCP Search validation schema
const mcpSearchSchema = z.object({
  query: z.string().min(1, 'Query is required').max(200, 'Query too long'),
  filters: z.object({
    schoolType: z.enum(['public', 'private', 'charter', 'all']).optional(),
    region: z.string().optional(),
    city: z.string().optional(),
    minRating: z.number().min(0).max(5).optional(),
    maxDistance: z.number().min(1).max(100).optional(),
  }).optional(),
  limit: z.number().min(1).max(50).default(10),
});

/**
 * MCP Search API
 * 
 * Handles AI-powered search requests with context understanding
 */
export async function POST(request: NextRequest) {
  try {
    // Apply security validation with rate limiting
    const securityCheck = await validateRequest(request, {
      allowedMethods: ['POST'],
      rateLimitConfig: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 20, // Max 20 searches per minute per IP
        message: 'Too many search requests. Please try again later.'
      }
    });

    if (securityCheck) return securityCheck;

    // Check user authentication
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = mcpSearchSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { query, filters, limit } = validationResult.data;

    // Check search limits based on user subscription
    const subscriptionTier = user.clientMetadata?.subscriptionTier || 'free';
    const hasActiveSubscription = user.clientMetadata?.subscriptionStatus === 'active';
    
    // Define search limits
    const searchLimits = {
      free: 50,
      premium: 500,
      enterprise: -1 // unlimited
    };

    // Skip limit check for enterprise users
    if (subscriptionTier !== 'enterprise' || !hasActiveSubscription) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Count today's searches
      const searchCount = await prisma.searchHistory.count({
        where: {
          userId: user.id,
          timestamp: {
            gte: today
          }
        }
      });

      const currentLimit = searchLimits[subscriptionTier as keyof typeof searchLimits] || searchLimits.free;
      
      if (searchCount >= currentLimit) {
        return NextResponse.json(
          { 
            error: 'Search limit exceeded',
            message: `Daily search limit of ${currentLimit} reached. Upgrade your plan for more searches.`,
            searchesUsed: searchCount,
            searchLimit: currentLimit,
            subscriptionTier
          },
          { status: 429 }
        );
      }
    }

    // Start timing for performance measurement
    const startTime = performance.now();

    // Perform search using MCP service
    const searchResults = await mcpService.search({
      query,
      filters,
      userPreferences: {
        preferredLanguage: 'en'
      }
    });

    // Get search suggestions
    const suggestions = await mcpService.getSuggestions(query);

    // Calculate processing time
    const processingTime = Math.round(performance.now() - startTime);

    // Log search to history for usage tracking
    try {
      await prisma.searchHistory.create({
        data: {
          userId: user.id,
          query,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('Failed to log search history:', error);
      // Don't fail the search if logging fails
    }

    // Return search results
    const response = NextResponse.json({
      results: searchResults,
      totalResults: searchResults.length,
      processingTime,
      suggestions,
      searchLimitInfo: {
        subscriptionTier,
        hasActiveSubscription
      }
    });

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('MCP Search API Error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(request: NextRequest) {
  try {
    // Apply basic rate limiting for health checks
    const securityCheck = await validateRequest(request, {
      allowedMethods: ['GET'],
      rateLimitConfig: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 60, // Max 60 health checks per minute per IP
        message: 'Too many health check requests.'
      }
    });

    if (securityCheck) return securityCheck;

    const response = NextResponse.json({
      status: 'ok',
      message: 'MCP service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        vectorSearch: !!process.env.QDRANT_URL,
        aiProcessing: true
      }
    });

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('MCP Health Check Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'MCP service health check failed' },
      { status: 500 }
    );
  }
}