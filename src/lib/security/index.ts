import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting middleware
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  
  // Clean up expired entries
  for (const [k, v] of rateLimitStore.entries()) {
    if (v.resetTime < now) {
      rateLimitStore.delete(k);
    }
  }
  
  const current = rateLimitStore.get(key);
  
  if (!current) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }
  
  if (current.resetTime < now) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }
  
  if (current.count >= config.maxRequests) {
    return NextResponse.json(
      {
        success: false,
        error: config.message || 'Too many requests',
        retryAfter: Math.ceil((current.resetTime - now) / 1000),
      },
      { status: 429 }
    );
  }
  
  current.count++;
  return null;
}

// Get client IP address
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return 'unknown';
}

// CSRF protection
export function generateCSRFToken(): string {
  return crypto.randomUUID();
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length > 0;
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://maps.googleapis.com",
      "frame-src 'self' https://www.google.com",
    ].join('; '),
  };
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score += 1;
  else feedback.push('Password should be at least 8 characters long');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Password should contain lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Password should contain uppercase letters');
  
  if (/\d/.test(password)) score += 1;
  else feedback.push('Password should contain numbers');
  
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;
  else feedback.push('Password should contain special characters');
  
  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

// API key validation
export function validateApiKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  return validApiKeys.includes(apiKey);
}

// Request validation middleware
export async function validateRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireApiKey?: boolean;
    allowedMethods?: string[];
    rateLimitConfig?: RateLimitConfig;
  } = {}
): Promise<NextResponse | null> {
  // Check allowed methods
  if (options.allowedMethods && !options.allowedMethods.includes(request.method)) {
    return NextResponse.json(
      { success: false, error: 'Method not allowed' },
      { status: 405 }
    );
  }
  
  // Apply rate limiting (skip in test environment)
  if (options.rateLimitConfig && process.env.NODE_ENV !== 'test') {
    const rateLimitResponse = await rateLimit(request, options.rateLimitConfig);
    if (rateLimitResponse) return rateLimitResponse;
  }
  
  // Validate API key
  if (options.requireApiKey) {
    const apiKey = request.headers.get('x-api-key');
    if (!validateApiKey(apiKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key' },
        { status: 401 }
      );
    }
  }
  
  return null;
}

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

// Success response helper
export function createSuccessResponse(
  data: unknown,
  message: string = 'Success'
): NextResponse {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
}