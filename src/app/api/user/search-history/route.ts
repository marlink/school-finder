import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET: Retrieve user's search history
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 15;
    
    // Retrieve search history for the user
    const searchHistory = await prisma.searchHistory.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });

    return NextResponse.json({ 
      success: true, 
      data: searchHistory
    });

  } catch (error) {
    console.error('Get search history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add a new search query to history
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Get the search query from request body
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { error: 'Valid search query is required' },
        { status: 400 }
      );
    }

    // Add the search query to history
    const newSearchHistory = await prisma.searchHistory.create({
      data: {
        userId: user.id,
        query: query.trim()
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: newSearchHistory,
      message: 'Search query added to history'
    });

  } catch (error) {
    console.error('Add search history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}