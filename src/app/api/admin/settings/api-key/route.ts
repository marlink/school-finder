import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import crypto from 'crypto';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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