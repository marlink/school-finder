import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      schoolId, 
      overallRating, 
      teachingQuality, 
      facilities, 
      safety, 
      extracurricular, 
      comment, 
      isAnonymous 
    } = body;

    // Validate required fields
    if (!schoolId || !overallRating) {
      return NextResponse.json({ error: 'School ID and overall rating are required' }, { status: 400 });
    }

    // Validate rating values (1-5)
    const ratings = [overallRating, teachingQuality, facilities, safety, extracurricular].filter(r => r !== undefined);
    if (ratings.some(rating => rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'All ratings must be between 1 and 5' }, { status: 400 });
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Upsert rating (create or update)
    const rating = await prisma.ratingsUsers.upsert({
      where: {
        userId_schoolId: {
          userId: user.id,
          schoolId
        }
      },
      update: {
        overallRating,
        teachingQuality,
        facilities,
        safety,
        extracurricular,
        comment,
        isAnonymous: Boolean(isAnonymous),
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        schoolId,
        overallRating,
        teachingQuality,
        facilities,
        safety,
        extracurricular,
        comment,
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
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt
      }
    });

  } catch (error) {
    console.error('Rating creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const userId = searchParams.get('userId');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    // Get user's own rating if userId provided
    let userRating = null;
    if (userId) {
      userRating = await prisma.ratingsUsers.findUnique({
        where: {
          userId_schoolId: {
            userId,
            schoolId
          }
        }
      });
    }

    // Get aggregated ratings for the school
    const ratings = await prisma.ratingsUsers.findMany({
      where: { schoolId },
      select: {
        overallRating: true,
        teachingQuality: true,
        facilities: true,
        safety: true,
        extracurricular: true,
        comment: true,
        isAnonymous: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate averages
    const totalRatings = ratings.length;
    const averages = {
      overall: totalRatings > 0 ? ratings.reduce((sum, r) => sum + Number(r.overallRating), 0) / totalRatings : 0,
      teachingQuality: 0,
      facilities: 0,
      safety: 0,
      extracurricular: 0
    };

    // Calculate category averages (only for non-null values)
    const categories = ['teachingQuality', 'facilities', 'safety', 'extracurricular'] as const;
    categories.forEach(category => {
      const validRatings = ratings.filter(r => r[category] !== null);
      if (validRatings.length > 0) {
        averages[category] = validRatings.reduce((sum, r) => sum + Number(r[category]), 0) / validRatings.length;
      }
    });

    // Format user reviews (hide user info for anonymous reviews)
    const reviews = ratings.map(rating => ({
      overallRating: rating.overallRating,
      teachingQuality: rating.teachingQuality,
      facilities: rating.facilities,
      safety: rating.safety,
      extracurricular: rating.extracurricular,
      comment: rating.comment,
      createdAt: rating.createdAt,
      author: rating.isAnonymous ? null : {
        name: rating.user.name,
        image: rating.user.image
      }
    }));

    return NextResponse.json({
      userRating,
      averages,
      totalRatings,
      reviews
    });

  } catch (error) {
    console.error('Rating retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
