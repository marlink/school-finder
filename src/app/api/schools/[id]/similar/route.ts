import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get the current school to find similar ones
    const currentSchool = await prisma.school.findUnique({
      where: { id },
      select: {
        type: true,
        address: true,
        establishedYear: true
      }
    });

    if (!currentSchool) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    const address = currentSchool.address as any;
    
    // Find similar schools based on type and location
    const similarSchools = await prisma.school.findMany({
      where: {
        AND: [
          { id: { not: id } }, // Exclude current school
          { type: currentSchool.type }, // Same type
          // Add location-based filtering if address data is available
          ...(address?.voivodeship ? [{
            address: {
              path: ['voivodeship'],
              equals: address.voivodeship
            }
          }] : [])
        ]
      },
      include: {
        images: {
          take: 1,
          orderBy: { displayOrder: 'asc' }
        },
        userRatings: {
          select: {
            overallRating: true
          }
        },
        googleRatings: {
          take: 1,
          orderBy: { reviewDate: 'desc' },
          select: {
            rating: true
          }
        },
        _count: {
          select: {
            userRatings: true
          }
        }
      },
      take: 6,
      orderBy: [
        { establishedYear: 'desc' },
        { studentCount: 'desc' }
      ]
    });

    // Transform the data for the frontend
    const transformedSchools = similarSchools.map(school => {
      const schoolAddress = school.address as any;
      
      // Calculate average user rating
      const avgUserRating = school.userRatings.length > 0
        ? school.userRatings.reduce((sum: number, rating: any) => sum + Number(rating.overallRating), 0) / school.userRatings.length
        : 0;

      // Get Google rating
      const googleRating = school.googleRatings[0] ? Number(school.googleRatings[0].rating) : null;

      return {
        id: school.id,
        name: school.name,
        type: school.type,
        city: schoolAddress?.city || 'Unknown',
        establishedYear: school.establishedYear,
        studentCount: school.studentCount,
        rating: avgUserRating || googleRating || 0,
        reviewCount: school._count.userRatings,
        image: school.images[0]?.imageUrl || null
      };
    });

    return NextResponse.json(transformedSchools);
  } catch (error) {
    console.error('Error fetching similar schools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch similar schools' },
      { status: 500 }
    );
  }
}