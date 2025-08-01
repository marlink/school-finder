import { NextRequest } from 'next/server';
import { getCSRFTokenHandler } from '@/lib/security/csrf';

/**
 * CSRF Token API Endpoint
 * GET /api/csrf - Returns a CSRF token for the current session
 */

export async function GET(request: NextRequest) {
  return getCSRFTokenHandler(request);
}