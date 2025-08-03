import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      overallRating,
      teachingQuality,
      facilities,
      safety,
      extracurricular,
      comment,
      isAnonymous,
      userId
    } = body;

    // Validate required fields
    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return NextResponse.json(
        { error: 'Overall rating is required and must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Create the rating
    const rating = await prisma.ratingsUsers.create({
      data: {
        schoolId: id,
        userId: isAnonymous ? 'anonymous' : userId || 'anonymous',
        overallRating: Number(overallRating),
        teachingQuality: teachingQuality ? Number(teachingQuality) : null,
        facilities: facilities ? Number(facilities) : null,
        safety: safety ? Number(safety) : null,
        extracurricular: extracurricular ? Number(extracurricular) : null,
        comment: comment || null,
        isAnonymous: Boolean(isAnonymous)
      }
    });

    return NextResponse.json({
      success: true,
      rating: {
        id: rating.id,
        overallRating: rating.overallRating,
        teachingQuality: rating.teachingQuality,
        facilities: rating.facilities,
        safety: rating.safety,
        extracurricular: rating.extracurricular,
        comment: rating.comment,
        isAnonymous: rating.isAnonymous,
        createdAt: rating.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: 'Failed to create rating' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get ratings for the school
    const ratings = await prisma.ratingsUsers.findMany({
      where: { schoolId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.ratingsUsers.count({
      where: { schoolId: id }
    });

    // Transform the data
    const transformedRatings = ratings.map(rating => ({
      id: rating.id,
      overallRating: rating.overallRating,
      teachingQuality: rating.teachingQuality,
      facilities: rating.facilities,
      safety: rating.safety,
      extracurricular: rating.extracurricular,
      comment: rating.comment,
      createdAt: rating.createdAt,
      isAnonymous: rating.isAnonymous,
      user: rating.isAnonymous ? null : {
        id: rating.user?.id,
        name: rating.user?.name,
        email: rating.user?.email
      }
    }));

    return NextResponse.json({
      ratings: transformedRatings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}