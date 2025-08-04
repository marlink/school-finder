import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUser } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    const schoolId = resolvedParams.id;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Fetch school details with images
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        images: {
          select: {
            id: true,
            imageUrl: true,
            altText: true,
            imageType: true,
            caption: true,
            uploadedAt: true
          }
        }
      }
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school is favorited by the current user
    let isFavorite = false;
    if (user) {
      const favorite = await prisma.favorite.findUnique({
        where: {
          userId_schoolId: {
            userId: user.id,
            schoolId: schoolId
          }
        }
      });
      
      isFavorite = !!favorite;
    }

    // Organize images by type
    const images = school.images || [];
    const mainImages = images.filter(img => img.imageType === 'main');
    const galleryImages = images.filter(img => img.imageType === 'gallery');
    const facilityImages = images.filter(img => img.imageType === 'facility');

    // Structure the response (without ratings)
    const response = {
      ...school,
      isFavorite,
      organizedImages: {
        main: mainImages,
        gallery: galleryImages,
        facility: facilityImages
      },
      images: undefined // Remove from response as it's processed into organizedImages
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('School details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
