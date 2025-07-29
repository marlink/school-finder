import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateRequest, getSecurityHeaders, sanitizeInput } from '@/lib/security';
import { z } from 'zod';

export interface SecurityConfig {
  requireAuth?: boolean;
  requireApiKey?: boolean;
  allowedMethods?: string[];
  rateLimitConfig?: {
    windowMs: number;
    maxRequests: number;
    message?: string;
  };
  allowedRoles?: string[];
  validateSchema?: z.ZodSchema;
  sanitizeInputs?: boolean;
}

export interface ApiRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
  validatedData?: any;
}

/**
 * Comprehensive API security middleware
 * Handles authentication, authorization, validation, rate limiting, and security headers
 */
export async function withApiSecurity(
  handler: (request: ApiRequest, ...args: any[]) => Promise<NextResponse>,
  config: SecurityConfig = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Apply basic security validation
      const securityCheck = await validateRequest(request, {
        allowedMethods: config.allowedMethods,
        requireApiKey: config.requireApiKey,
        rateLimitConfig: config.rateLimitConfig,
      });

      if (securityCheck) return securityCheck;

      // Create enhanced request object
      const apiRequest = request as ApiRequest;

      // Handle authentication if required
      if (config.requireAuth) {
        const session = await getServerSession(authOptions);
        
        if (!session?.user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        apiRequest.user = {
          id: session.user.id,
          email: session.user.email || '',
          role: session.user.role || 'user',
        };

        // Check role-based authorization
        if (config.allowedRoles && !config.allowedRoles.includes(apiRequest.user.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Validate request body if schema provided
      if (config.validateSchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        try {
          const body = await request.json();
          
          // Sanitize inputs if enabled
          if (config.sanitizeInputs) {
            const sanitizedBody = sanitizeObjectInputs(body);
            apiRequest.validatedData = config.validateSchema.parse(sanitizedBody);
          } else {
            apiRequest.validatedData = config.validateSchema.parse(body);
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            return NextResponse.json(
              {
                error: 'Validation failed',
                details: error.issues,
              },
              { status: 400 }
            );
          }
          
          return NextResponse.json(
            { error: 'Invalid request body' },
            { status: 400 }
          );
        }
      }

      // Call the actual handler
      const response = await handler(apiRequest, ...args);

      // Add security headers to response
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add CORS headers if needed
      response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');

      return response;
    } catch (error) {
      console.error('API Security Middleware Error:', error);
      
      const errorResponse = NextResponse.json(
        { 
          error: 'Internal server error',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );

      // Add security headers even to error responses
      const securityHeaders = getSecurityHeaders();
      Object.entries(securityHeaders).forEach(([key, value]) => {
        errorResponse.headers.set(key, value);
      });

      return errorResponse;
    }
  };
}

/**
 * Recursively sanitize object inputs
 */
function sanitizeObjectInputs(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObjectInputs);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObjectInputs(value);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Common security configurations for different endpoint types
 */
export const SecurityConfigs = {
  // Public endpoints (no auth required)
  public: {
    rateLimitConfig: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 100,
      message: 'Too many requests. Please try again later.',
    },
    sanitizeInputs: true,
  },

  // User endpoints (auth required)
  user: {
    requireAuth: true,
    rateLimitConfig: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 60,
      message: 'Too many requests. Please try again later.',
    },
    sanitizeInputs: true,
  },

  // Admin endpoints (admin role required)
  admin: {
    requireAuth: true,
    allowedRoles: ['admin'],
    rateLimitConfig: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 120,
      message: 'Too many admin requests. Please try again later.',
    },
    sanitizeInputs: true,
  },

  // API key protected endpoints
  apiKey: {
    requireApiKey: true,
    rateLimitConfig: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 1000,
      message: 'API rate limit exceeded.',
    },
    sanitizeInputs: true,
  },

  // High-frequency endpoints (like search)
  search: {
    rateLimitConfig: {
      windowMs: 1 * 60 * 1000, // 1 minute
      maxRequests: 30,
      message: 'Too many search requests. Please try again later.',
    },
    sanitizeInputs: true,
  },

  // Write operations (more restrictive)
  write: {
    requireAuth: true,
    rateLimitConfig: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10,
      message: 'Too many write operations. Please try again later.',
    },
    sanitizeInputs: true,
  },
} as const;

/**
 * Helper function to create secured API handlers
 */
export function createSecuredHandler<T extends any[]>(
  handler: (request: ApiRequest, ...args: T) => Promise<NextResponse>,
  config: SecurityConfig = {}
) {
  return withApiSecurity(handler, config);
}