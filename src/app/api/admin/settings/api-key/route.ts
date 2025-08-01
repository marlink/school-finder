import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import crypto from 'crypto';

export async function POST() {
  try {
    await requireAdmin();

    // Generate new API key
    const newApiKey = 'sk_live_' + crypto.randomBytes(32).toString('hex');

    return NextResponse.json({
      success: true,
      apiKey: newApiKey
    });
  } catch (error) {
    console.error('Error generating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}