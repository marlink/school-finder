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

    // Get dashboard statistics
    const [
      totalUsers,
      totalSchools,
      totalSearches,
      activeUsers,
      newUsersToday,
      searchesToday
    ] = await Promise.all([
      prisma.user.count(),
      prisma.school.count(),
      prisma.searchHistory.count(),
      prisma.user.count({
        where: {
          updatedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.searchHistory.count({
        where: {
          timestamp: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      totalSchools,
      totalSearches,
      activeUsers,
      newUsersToday,
      searchesToday
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}