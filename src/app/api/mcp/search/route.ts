import { NextRequest, NextResponse } from 'next/server';
import { mcpService } from '@/lib/mcp/service';

/**
 * MCP Search API
 * 
 * Handles AI-powered search requests with context understanding
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { query, filters, limit = 10 } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
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

    // Return search results
    return NextResponse.json({
      results: searchResults,
      totalResults: searchResults.length,
      processingTime,
      suggestions
    });
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
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'MCP service is healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        vectorSearch: !!process.env.QDRANT_URL,
        aiProcessing: true
      }
    });
  } catch (error) {
    console.error('MCP Health Check Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'MCP service health check failed' },
      { status: 500 }
    );
  }
}