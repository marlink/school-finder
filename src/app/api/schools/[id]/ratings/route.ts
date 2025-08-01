import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { schoolReviewSchema } from '@/lib/validations';
import { validateRequest, getSecurityHeaders } from '@/lib/security';
import { z } from 'zod';

// Enhanced rating schema for this specific endpoint
const ratingSchema = z.object({
  overallRating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  teachingQuality: z.number().min(1).max(5).optional(),
  facilities: z.number().min(1).max(5).optional(),
  safety: z.number().min(1).max(5).optional(),
  extracurricular: z.number().min(1).max(5).optional(),
  comment: z.string().max(1000, 'Comment cannot exceed 1000 characters').optional(),
  isAnonymous: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Apply security validation with rate limiting
    const securityCheck = await validateRequest(request, {
      allowedMethods: ['POST'],
      rateLimitConfig: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5, // Max 5 ratings per 15 minutes per IP
        message: 'Too many rating submissions. Please try again later.'
      }
    });

    if (securityCheck) return securityCheck;

    // Get user session
    const user = await getUser();
    
    const { id } = await params;
    
    // Validate school ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid school ID format' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validate request body using Zod schema
    const validationResult = ratingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
    }

    const validatedData = validationResult.data;

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id }
    });

    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // For non-anonymous ratings, require authentication
    if (!validatedData.isAnonymous && !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required for non-anonymous ratings' },
        { status: 401 }
      );
    }

    // Create the rating
    const rating = await prisma.ratingsUsers.create({
      data: {
        schoolId: id,
        userId: validatedData.isAnonymous ? 'anonymous' : (user?.id || 'anonymous'),
        overallRating: validatedData.overallRating,
        teachingQuality: validatedData.teachingQuality || null,
        facilities: validatedData.facilities || null,
        safety: validatedData.safety || null,
        extracurricular: validatedData.extracurricular || null,
        comment: validatedData.comment || null,
        isAnonymous: validatedData.isAnonymous
      }
    });

    const response = NextResponse.json({
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

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
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
    // Apply security validation with rate limiting
    const securityCheck = await validateRequest(request, {
      allowedMethods: ['GET'],
      rateLimitConfig: {
        windowMs: 1 * 60 * 1000, // 1 minute
        maxRequests: 30, // Max 30 requests per minute per IP
        message: 'Too many requests. Please try again later.'
      }
    });

    if (securityCheck) return securityCheck;

    const { id } = await params;
    
    // Validate school ID format
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json(
        { error: 'Invalid school ID format' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Validate pagination parameters
    const paginationSchema = z.object({
      page: z.number().min(1).default(1),
      limit: z.number().min(1).max(50).default(10)
    });

    const paginationResult = paginationSchema.safeParse({
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10')
    });

    if (!paginationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid pagination parameters',
          details: paginationResult.error.issues
        },
        { status: 400 }
      );
    }

    const { page, limit } = paginationResult.data;
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

    const response = NextResponse.json({
      ratings: transformedRatings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

    // Add security headers
    const securityHeaders = getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}