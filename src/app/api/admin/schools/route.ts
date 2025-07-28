import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortName: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    // Get schools and stats
    const [schools, totalSchools, totalActive, totalNew] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          shortName: true,
          type: true,
          address: true,
          contact: true,
          status: true,
          studentCount: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              userRatings: true,
              favorites: true,
              analytics: true
            }
          }
        }
      }),
      prisma.school.count({ where }),
      prisma.school.count({
        where: {
          ...where,
          status: 'active'
        }
      }),
      prisma.school.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Calculate average rating
    const avgRating = await prisma.ratingsUsers.aggregate({
      _avg: {
        overallRating: true
      }
    });

    const stats = {
      total: totalSchools,
      active: totalActive,
      new: totalNew,
      avgRating: avgRating._avg.overallRating || 0
    };

    return NextResponse.json({
      schools,
      stats,
      pagination: {
        page,
        limit,
        total: totalSchools,
        pages: Math.ceil(totalSchools / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { schoolId, status } = await request.json();

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    const school = await prisma.school.update({
      where: { id: schoolId },
      data: { status },
      select: {
        id: true,
        name: true,
        type: true,
        status: true,
        updatedAt: true
      }
    });

    return NextResponse.json({ school });
  } catch (error) {
    console.error('Error updating school:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('id');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    await prisma.school.delete({
      where: { id: schoolId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting school:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}