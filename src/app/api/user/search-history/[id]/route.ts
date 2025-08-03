import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const searchHistoryId = resolvedParams.id;

    if (!searchHistoryId) {
      return NextResponse.json(
        { error: 'Search history ID is required' },
        { status: 400 }
      );
    }

    // First check if the search history entry exists and belongs to the user
    const existingEntry = await prisma.searchHistory.findFirst({
      where: {
        id: searchHistoryId,
        userId: session.user.id
      }
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Search history entry not found' },
        { status: 404 }
      );
    }

    // Delete the specific search history entry
    await prisma.searchHistory.delete({
      where: {
        id: searchHistoryId
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Search history entry removed successfully' 
    });

  } catch (error) {
    console.error('Remove search history entry API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
