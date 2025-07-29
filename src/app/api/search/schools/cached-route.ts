import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache, cacheKeys, getCachedData, createCachedResponse } from '@/lib/cache';

// Cache configuration for different types of data
const CACHE_CONFIG = {
  search: { ttl: 300, staleWhileRevalidate: 600, tags: ['schools', 'search'] }, // 5 minutes
  filters: { ttl: 3600, tags: ['schools'] }, // 1 hour
  stats: { ttl: 1800, tags: ['schools'] }, // 30 minutes
};

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get search parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const city = searchParams.get('city') || '';
    const voivodeship = searchParams.get('voivodeship') || '';
    const district = searchParams.get('district') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const maxDistance = parseFloat(searchParams.get('maxDistance') || '50');
    const userLat = parseFloat(searchParams.get('userLat') || '0');
    const userLng = parseFloat(searchParams.get('userLng') || '0');
    const languages = searchParams.get('languages')?.split(',') || [];
    const specializations = searchParams.get('specializations')?.split(',') || [];
    const facilities = searchParams.get('facilities')?.split(',') || [];
    const hasImages = searchParams.get('hasImages') === 'true';
    const establishedAfter = searchParams.get('establishedAfter') ? parseInt(searchParams.get('establishedAfter')!) : null;
    const establishedBefore = searchParams.get('establishedBefore') ? parseInt(searchParams.get('establishedBefore')!) : null;
    const minStudents = searchParams.get('minStudents') ? parseInt(searchParams.get('minStudents')!) : null;
    const maxStudents = searchParams.get('maxStudents') ? parseInt(searchParams.get('maxStudents')!) : null;

    // Create cache key for this search
    const searchCacheKey = cacheKeys.schools.search({
      query, type, city, voivodeship, district, sortBy, sortOrder,
      page, limit, minRating, maxDistance, userLat, userLng,
      languages, specializations, facilities, hasImages,
      establishedAfter, establishedBefore, minStudents, maxStudents,
      userId: session?.user?.id || 'anonymous'
    });

    // Try to get cached result
    const cachedResult = cache.get(searchCacheKey);
    if (cachedResult) {
      return createCachedResponse(cachedResult, CACHE_CONFIG.search, 'HIT');
    }

    // Check rate limiting for non-premium users
    if (session?.user?.email) {
      const userId = session.user.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionStatus: true }
      });

      if (user?.subscriptionStatus === 'free') {
        // Check search limit for free users
        const searchRecord = await prisma.userSearches.findUnique({
          where: { userId }
        });

        if (searchRecord) {
          const today = new Date();
          const lastReset = new Date(searchRecord.lastReset);
          const daysSinceReset = Math.floor((today.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceReset >= 1) {
            // Reset daily search count
            await prisma.userSearches.update({
              where: { userId },
              data: { searchCount: 1, lastReset: today }
            });
          } else if (searchRecord.searchCount >= 50) {
            // Free user limit reached
            return NextResponse.json(
              { error: 'Daily search limit reached. Upgrade to premium for unlimited searches.' },
              { status: 429 }
            );
          } else {
            // Increment search count
            await prisma.userSearches.update({
              where: { userId },
              data: { searchCount: searchRecord.searchCount + 1 }
            });
          }
        } else {
          // Create new search record
          await prisma.userSearches.create({
            data: { userId, searchCount: 1 }
          });
        }
      }
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

    // Execute search query with optimized select
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
          },
          favorites: session?.user?.id ? {
            where: { userId: session.user.id },
            select: { id: true }
          } : false
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
        const schoolLat = (school.location as { latitude?: number }).latitude;
        const schoolLng = (school.location as { longitude?: number }).longitude;
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
        isFavorite: session?.user?.id ? school.favorites.length > 0 : false,
        mainImage: school.images[0]?.imageUrl || null,
        userRatings: undefined, // Remove from response
        googleRatings: undefined, // Remove from response
        favorites: undefined // Remove from response
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

    // Track search analytics (async, don't wait)
    if (query) {
      trackSearchAnalytics(query, ratingFilteredSchools.length).catch(console.error);
    }

    const result = {
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

    // Cache the result
    cache.set(searchCacheKey, result, CACHE_CONFIG.search);

    return createCachedResponse(result, CACHE_CONFIG.search, 'MISS');

  } catch (error) {
    console.error('Search API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
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