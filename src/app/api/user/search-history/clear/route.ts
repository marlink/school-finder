import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Clear all search history for the user
    await prisma.searchHistory.deleteMany({
      where: {
        userId: session.user.id
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
