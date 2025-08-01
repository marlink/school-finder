import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Clear all search history for the user
    await prisma.searchHistory.deleteMany({
      where: {
        userId: user.id
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Search history cleared successfully' 
    });

  } catch (error) {
    console.error('Clear search history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
