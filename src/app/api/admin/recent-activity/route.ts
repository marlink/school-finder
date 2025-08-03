import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent activity
    const [recentUsers, recentSearches, recentRatings] = await Promise.all([
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true
        }
      }),
      prisma.searchHistory.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.ratingsUsers.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          },
          school: {
            select: {
              name: true
            }
          }
        }
      })
    ]);

    const activity = [
      ...recentUsers.map(user => ({
        id: user.id,
        type: 'user_registration',
        description: `New user registered: ${user.name || user.email}`,
        timestamp: user.createdAt,
        user: user.name || user.email
      })),
      ...recentSearches.map(search => ({
        id: search.id,
        type: 'search',
        description: `Search: "${search.query}"`,
        timestamp: search.timestamp,
        user: search.user.name || search.user.email
      })),
      ...recentRatings.map(rating => ({
        id: rating.id,
        type: 'rating',
        description: `New rating for ${rating.school.name}`,
        timestamp: rating.createdAt,
        user: rating.user.name || rating.user.email
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    return NextResponse.json({ activity });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}