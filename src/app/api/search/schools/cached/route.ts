import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withPerformanceTracking } from '@/lib/performance';
import { cache, cacheKeys, CacheConfig } from '@/lib/cache';
import crypto from 'crypto';

async function cachedSearchHandler(request: NextRequest) {
  try {
    const user = await getUser();
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const city = searchParams.get('city') || '';
    const voivodeship = searchParams.get('voivodeship') || '';
    const district = searchParams.get('district') || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';
    const minRating = Math.max(0, Math.min(5, parseFloat(searchParams.get('minRating') || '0')));
    const maxDistance = searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : null;
    const userLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const userLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const languages = searchParams.get('languages')?.split(',').filter(Boolean) || [];
    const specializations = searchParams.get('specializations')?.split(',').filter(Boolean) || [];
    const facilities = searchParams.get('facilities')?.split(',').filter(Boolean) || [];
    const hasImages = searchParams.get('hasImages') === 'true';
    const establishedAfter = searchParams.get('establishedAfter') ? parseInt(searchParams.get('establishedAfter')!) : null;
    const establishedBefore = searchParams.get('establishedBefore') ? parseInt(searchParams.get('establishedBefore')!) : null;
    const minStudents = searchParams.get('minStudents') ? parseInt(searchParams.get('minStudents')!) : null;
    const maxStudents = searchParams.get('maxStudents') ? parseInt(searchParams.get('maxStudents')!) : null;

    // Create cache key based on search parameters (excluding user-specific data)
    const searchCacheKey = cacheKeys.schools.search({
      query,
      type,
      city,
      voivodeship,
      district,
      page,
      limit,
      sortBy,
      sortOrder,
      minRating,
      maxDistance,
      userLat,
      userLng,
      languages,
      specializations,
      facilities,
      hasImages,
      establishedAfter,
      establishedBefore,
      minStudents,
      maxStudents
    });

    // Try to get cached results first
    const cachedResult = cache.get(searchCacheKey) as {
      schools?: Array<{ id: string; isFavorite?: boolean }>;
      pagination?: unknown;
      searchInfo?: unknown;
    } | null;
    
    if (cachedResult) {
      // Add user-specific data to cached results if user is logged in
      if (user?.id && cachedResult.schools) {
        const schoolIds = cachedResult.schools.map((school: { id: string }) => school.id);
        const favorites = await prisma.favorite.findMany({
          where: {
            userId: user.id,
            schoolId: { in: schoolIds }
          },
          select: { schoolId: true }
        });

        const favoriteIds = new Set(favorites.map(f => f.schoolId));
        cachedResult.schools = cachedResult.schools.map((school: { id: string; isFavorite?: boolean }) => ({
          ...school,
          isFavorite: favoriteIds.has(school.id)
        }));
      }

      return NextResponse.json(cachedResult, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        }
      });
    }

    // Build search filters
    const whereClause: Record<string, unknown> = {};

    // Text search
    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { address: { path: ['street'], string_contains: query } },
        { address: { path: ['city'], string_contains: query } },
        { address: { path: ['district'], string_contains: query } }
      ];
    }

    // School type filter
    if (type !== 'all') {
      whereClause.type = type;
    }

    // Location filters
    if (city) {
      whereClause.address = {
        ...whereClause.address as Record<string, unknown>,
        path: ['city'],
        string_contains: city
      };
    }

    if (voivodeship) {
      whereClause.address = {
        ...whereClause.address as Record<string, unknown>,
        path: ['voivodeship'],
        string_contains: voivodeship
      };
    }

    if (district) {
      whereClause.address = {
        ...whereClause.address as Record<string, unknown>,
        path: ['district'],
        string_contains: district
      };
    }

    // Language filters
    if (languages.length > 0) {
      whereClause.languages = {
        array_contains: languages
      };
    }

    // Specialization filters
    if (specializations.length > 0) {
      whereClause.specializations = {
        array_contains: specializations
      };
    }

    // Facility filters
    if (facilities.length > 0) {
      whereClause.facilities = {
        array_contains: facilities
      };
    }

    // Images filter
    if (hasImages) {
      whereClause.images = {
        some: {}
      };
    }

    // Established year filters
    if (establishedAfter) {
      whereClause.establishedYear = {
        ...whereClause.establishedYear as Record<string, unknown>,
        gte: establishedAfter
      };
    }

    if (establishedBefore) {
      whereClause.establishedYear = {
        ...whereClause.establishedYear as Record<string, unknown>,
        lte: establishedBefore
      };
    }

    // Student count filters
    if (minStudents) {
      whereClause.studentCount = {
        ...whereClause.studentCount as Record<string, unknown>,
        gte: minStudents
      };
    }

    if (maxStudents) {
      whereClause.studentCount = {
        ...whereClause.studentCount as Record<string, unknown>,
        lte: maxStudents
      };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build order by clause
    let orderBy: Record<string, string> = {};
    switch (sortBy) {
      case 'name':
        orderBy = { name: sortOrder };
        break;
      case 'type':
        orderBy = { type: sortOrder };
        break;
      case 'studentCount':
        orderBy = { studentCount: sortOrder };
        break;
      case 'establishedYear':
        orderBy = { establishedYear: sortOrder };
        break;
      case 'createdAt':
        orderBy = { createdAt: sortOrder };
        break;
      default:
        orderBy = { name: 'asc' };
    }

    // Execute search query
    const [schools, totalCount] = await Promise.all([
      prisma.school.findMany({
        where: whereClause,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          type: true,
          address: true,
          contact: true,
          location: true,
          studentCount: true,
          teacherCount: true,
          establishedYear: true,
          languages: true,
          specializations: true,
          facilities: true,
          createdAt: true,
          images: {
            where: { imageType: 'main' },
            take: 1,
            select: {
              imageUrl: true,
              altText: true
            }
          },
          userRatings: {
            select: {
              overallRating: true
            }
          },
          googleRatings: {
            select: {
              rating: true
            }
          }
        }
      }),
      prisma.school.count({ where: whereClause })
    ]);

    // Calculate average ratings and add distance if coordinates provided
    const enhancedSchools = schools.map(school => {
      // Calculate average user rating
      const userRatings = school.userRatings.map(r => Number(r.overallRating));
      const avgUserRating = userRatings.length > 0 
        ? userRatings.reduce((a, b) => a + b, 0) / userRatings.length 
        : null;

      // Calculate average Google rating
      const googleRatings = school.googleRatings.map(r => Number(r.rating));
      const avgGoogleRating = googleRatings.length > 0 
        ? googleRatings.reduce((a, b) => a + b, 0) / googleRatings.length 
        : null;

      // Calculate distance if user coordinates provided
      let distance = null;
      if (userLat && userLng && school.location) {
        const location = school.location as { latitude?: number; longitude?: number };
        const schoolLat = location.latitude;
        const schoolLng = location.longitude;
        if (schoolLat && schoolLng) {
          distance = calculateDistance(userLat, userLng, schoolLat, schoolLng);
        }
      }

      return {
        ...school,
        avgUserRating: avgUserRating ? Number(avgUserRating.toFixed(1)) : null,
        avgGoogleRating: avgGoogleRating ? Number(avgGoogleRating.toFixed(1)) : null,
        userRatingCount: userRatings.length,
        googleRatingCount: googleRatings.length,
        distance: distance ? Number(distance.toFixed(1)) : null,
        isFavorite: false, // Will be set later for authenticated users
        mainImage: school.images[0]?.imageUrl || null,
        userRatings: undefined, // Remove from response
        googleRatings: undefined, // Remove from response
      };
    });

    // Filter by distance if specified
    const filteredSchools = maxDistance && userLat && userLng
      ? enhancedSchools.filter(school => !school.distance || school.distance <= maxDistance)
      : enhancedSchools;

    // Filter by minimum rating if specified
    const ratingFilteredSchools = minRating > 0
      ? filteredSchools.filter(school => {
          const rating = school.avgUserRating || school.avgGoogleRating;
          return rating && rating >= minRating;
        })
      : filteredSchools;

    // Sort by distance if requested
    if (sortBy === 'distance' && userLat && userLng) {
      ratingFilteredSchools.sort((a, b) => {
        const distA = a.distance || 999999;
        const distB = b.distance || 999999;
        return sortOrder === 'asc' ? distA - distB : distB - distA;
      });
    }

    // Sort by rating if requested
    if (sortBy === 'rating') {
      ratingFilteredSchools.sort((a, b) => {
        const ratingA = a.avgUserRating || a.avgGoogleRating || 0;
        const ratingB = b.avgUserRating || b.avgGoogleRating || 0;
        return sortOrder === 'asc' ? ratingA - ratingB : ratingB - ratingA;
      });
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Prepare response data (without user-specific data for caching)
    const responseData = {
      schools: ratingFilteredSchools,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage
      },
      searchInfo: {
        query,
        filters: {
          type,
          city,
          voivodeship,
          district,
          minRating,
          maxDistance,
          languages,
          specializations,
          facilities,
          hasImages,
          establishedAfter,
          establishedBefore,
          minStudents,
          maxStudents
        },
        sort: { sortBy, sortOrder }
      }
    };

    // Cache the results (5 minutes for search results)
    cache.set(searchCacheKey, responseData, { ttl: 300 });

    // Add user-specific data if user is logged in
    if (user?.id) {
      const schoolIds = ratingFilteredSchools.map(school => school.id);
      const favorites = await prisma.favorite.findMany({
        where: {
          userId: user.id,
          schoolId: { in: schoolIds }
        },
        select: { schoolId: true }
      });

      const favoriteIds = new Set(favorites.map(f => f.schoolId));
      responseData.schools = responseData.schools.map(school => ({
        ...school,
        isFavorite: favoriteIds.has(school.id)
      }));
    }

    // Track search analytics
    if (query) {
      await trackSearchAnalytics(query, ratingFilteredSchools.length);
    }

    return NextResponse.json(responseData, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
      }
    });

  } catch (error) {
    console.error('Cached Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to track search analytics
async function trackSearchAnalytics(searchTerm: string, resultCount: number) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.searchAnalytics.upsert({
      where: {
        date_searchTerm: {
          date: today,
          searchTerm: searchTerm.toLowerCase().trim()
        }
      },
      update: {
        searchCount: { increment: 1 },
        avgResults: resultCount
      },
      create: {
        date: today,
        searchTerm: searchTerm.toLowerCase().trim(),
        searchCount: 1,
        avgResults: resultCount
      }
    });
  } catch (error) {
    console.error('Failed to track search analytics:', error);
  }
}

// Export with performance tracking and caching
export const GET = withPerformanceTracking(cachedSearchHandler);