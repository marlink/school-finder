import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mcpService } from '@/lib/mcp/service';
import { validateRequest, getSecurityHeaders } from '@/lib/security';

// Request validation schema
const SuggestionRequestSchema = z.object({
  query: z.string().min(1, 'Query is required').max(200, 'Query too long'),
});

export async function POST(request: NextRequest) {
  try {
    // Apply security validation with rate limiting
    const securityCheck = await validateRequest(request, {
      allowedMethods: ['POST'],
      rateLimitConfig: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 30, // Max 30 suggestion requests per minute per IP
        message: 'Too many suggestion requests. Please try again later.'
      }
    });

    if (securityCheck) return securityCheck;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = SuggestionRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const { query } = validationResult.data;

    // Get suggestions from MCP service
    const suggestions = await mcpService.getSuggestions(query);

    // Create response
    const response = NextResponse.json({
      suggestions,
      query,
      timestamp: new Date().toISOString(),
    });

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;

  } catch (error) {
    console.error('MCP Suggestions API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
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
      status: 'healthy',
      service: 'mcp-suggestions',
      timestamp: new Date().toISOString(),
    });

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('MCP Suggestions Health Check Error:', error);
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service unavailable' },
      { status: 503 }
    );
  }
}