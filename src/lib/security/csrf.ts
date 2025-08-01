import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { csrfTokenSchema } from '@/lib/validation/schemas';

/**
 * CSRF Protection Implementation
 * Prevents Cross-Site Request Forgery attacks
 */

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf-token';
const CSRF_TOKEN_LENGTH = 32;

// Store CSRF tokens in memory (in production, use Redis or database)
const csrfTokenStore = new Map<string, { token: string; expires: number }>();

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

/**
 * Create CSRF token for a session
 */
export function createCSRFToken(sessionId: string): string {
  const token = generateCSRFToken();
  const expires = Date.now() + (60 * 60 * 1000); // 1 hour expiry
  
  csrfTokenStore.set(sessionId, { token, expires });
  
  // Clean up expired tokens
  cleanupExpiredTokens();
  
  return token;
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  // Validate token format first
  const validation = csrfTokenSchema.safeParse(token);
  if (!validation.success) {
    return false;
  }
  
  const stored = csrfTokenStore.get(sessionId);
  if (!stored) {
    return false;
  }
  
  // Check if token has expired
  if (Date.now() > stored.expires) {
    csrfTokenStore.delete(sessionId);
    return false;
  }
  
  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(stored.token, 'hex'),
    Buffer.from(token, 'hex')
  );
}

/**
 * Clean up expired CSRF tokens
 */
function cleanupExpiredTokens(): void {
  const now = Date.now();
  for (const [sessionId, data] of csrfTokenStore.entries()) {
    if (now > data.expires) {
      csrfTokenStore.delete(sessionId);
    }
  }
}

/**
 * Get session ID from request (you may need to adapt this based on your auth system)
 */
function getSessionId(request: NextRequest): string | null {
  // Try to get session ID from Stack Auth or cookies
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract session ID from auth header
    const match = authHeader.match(/Bearer (.+)/);
    if (match) {
      return crypto.createHash('sha256').update(match[1]).digest('hex');
    }
  }
  
  // Fallback to IP + User-Agent hash for anonymous users
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return crypto.createHash('sha256').update(`${ip}:${userAgent}`).digest('hex');
}

/**
 * CSRF protection middleware
 */
export async function withCSRFProtection(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const method = request.method;
  
  // Only protect state-changing methods
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return handler(request);
  }
  
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session required for CSRF protection' },
      { status: 400 }
    );
  }
  
  // Get CSRF token from header
  const csrfToken = request.headers.get(CSRF_TOKEN_HEADER);
  if (!csrfToken) {
    return NextResponse.json(
      { error: 'CSRF token required' },
      { status: 403 }
    );
  }
  
  // Validate CSRF token
  if (!validateCSRFToken(sessionId, csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }
  
  return handler(request);
}

/**
 * API route to get CSRF token
 */
export async function getCSRFTokenHandler(request: NextRequest): Promise<NextResponse> {
  const sessionId = getSessionId(request);
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Session required' },
      { status: 400 }
    );
  }
  
  const token = createCSRFToken(sessionId);
  
  const response = NextResponse.json({ csrfToken: token });
  
  // Set CSRF token in cookie for additional security
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60, // 1 hour
  });
  
  return response;
}

/**
 * Helper to add CSRF token to form data
 */
export function addCSRFTokenToFormData(formData: FormData, token: string): void {
  formData.append('_csrf', token);
}

/**
 * Helper to get CSRF token from form data
 */
export function getCSRFTokenFromFormData(formData: FormData): string | null {
  return formData.get('_csrf') as string | null;
}

/**
 * React hook to get CSRF token (for client-side usage)
 */
export async function fetchCSRFToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/csrf');
    if (!response.ok) {
      throw new Error('Failed to fetch CSRF token');
    }
    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
}

/**
 * Configuration for CSRF protection
 */
export const CSRFConfig = {
  tokenLength: CSRF_TOKEN_LENGTH,
  tokenExpiry: 60 * 60 * 1000, // 1 hour
  headerName: CSRF_TOKEN_HEADER,
  cookieName: CSRF_COOKIE_NAME,
  protectedMethods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  excludedPaths: [
    '/api/auth',
    '/api/health',
    '/api/csrf',
  ],
} as const;