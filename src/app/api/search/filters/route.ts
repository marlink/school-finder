import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const include = searchParams.get('include')?.split(',') || ['all'];
    const region = searchParams.get('region') || '';

    const filters: Record<string, any> = {};

    // Get school types
    if (include.includes('all') || include.includes('types')) {
      const schoolTypes = await prisma.school.groupBy({
        by: ['type'],
        where: {
          status: 'active',
          ...(region && {
            address: {
              path: ['voivodeship'],
              string_contains: region
            }
          })
        },
        _count: {
          type: true
        },
        orderBy: {
          _count: {
            type: 'desc'
          }
        }
      });

      filters.types = schoolTypes.map(item => ({
        value: item.type,
        label: item.type,
        count: item._count.type
      }));
    }

    // Get locations (voivodeships, cities, districts)
    if (include.includes('all') || include.includes('locations')) {
      const locations = await prisma.school.findMany({
        where: {
          status: 'active'
        },
        select: {
          address: true
        }
      });

      const voivodeships = new Map<string, number>();
      const cities = new Map<string, { count: number, voivodeship: string }>();
      const districts = new Map<string, { count: number, voivodeship: string }>();

      for (const school of locations) {
        const addr = school.address as Record<string, any>;
        
        // Count voivodeships
        if (addr.voivodeship) {
          voivodeships.set(addr.voivodeship, (voivodeships.get(addr.voivodeship) || 0) + 1);
        }
        
        // Count cities
        if (addr.city && addr.voivodeship) {
          const cityKey = `${addr.city}, ${addr.voivodeship}`;
          cities.set(cityKey, {
            count: (cities.get(cityKey)?.count || 0) + 1,
            voivodeship: addr.voivodeship
          });
        }
        
        // Count districts
        if (addr.district && addr.voivodeship) {
          const districtKey = `${addr.district}, ${addr.voivodeship}`;
          districts.set(districtKey, {
            count: (districts.get(districtKey)?.count || 0) + 1,
            voivodeship: addr.voivodeship
          });
        }
      }

      filters.locations = {
        voivodeships: Array.from(voivodeships.entries())
          .map(([name, count]) => ({ value: name, label: name, count }))
          .sort((a, b) => b.count - a.count),
        
        cities: Array.from(cities.entries())
          .map(([name, data]) => ({
            value: name.split(', ')[0],
            label: name,
            count: data.count,
            voivodeship: data.voivodeship
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 50), // Limit to top 50 cities
        
        districts: Array.from(districts.entries())
          .map(([name, data]) => ({
            value: name.split(', ')[0],
            label: name,
            count: data.count,
            voivodeship: data.voivodeship
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 30) // Limit to top 30 districts
      };
    }

    // Get languages (prioritize English and Polish)
    if (include.includes('all') || include.includes('languages')) {
      const schools = await prisma.school.findMany({
        where: {
          status: 'active',
          languages: {
            not: Prisma.JsonNull
          }
        },
        select: {
          languages: true
        }
      });

      const languageCount = new Map<string, number>();
      for (const school of schools) {
        const languages = school.languages as string[];
        if (languages) {
          for (const lang of languages) {
            languageCount.set(lang, (languageCount.get(lang) || 0) + 1);
          }
        }
      }

      // Priority languages (English and Polish)
      const priorityLanguages = ['English', 'Polish', 'Angielski', 'Polski'];
      const languageResults = Array.from(languageCount.entries())
        .map(([lang, count]) => ({ value: lang, label: lang, count }))
        .sort((a, b) => {
          // Prioritize English and Polish
          const aIsPriority = priorityLanguages.some(pl => a.value.toLowerCase().includes(pl.toLowerCase()));
          const bIsPriority = priorityLanguages.some(pl => b.value.toLowerCase().includes(pl.toLowerCase()));
          
          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;
          
          return b.count - a.count;
        });

      filters.languages = languageResults;
    }

    // Get specializations
    if (include.includes('all') || include.includes('specializations')) {
      const schools = await prisma.school.findMany({
        where: {
          status: 'active',
          specializations: {
            not: Prisma.JsonNull
          }
        },
        select: {
          specializations: true
        }
      });

      const specializationCount = new Map<string, number>();
      for (const school of schools) {
        const specializations = school.specializations as string[];
        if (specializations) {
          for (const spec of specializations) {
            specializationCount.set(spec, (specializationCount.get(spec) || 0) + 1);
          }
        }
      }

      filters.specializations = Array.from(specializationCount.entries())
        .map(([spec, count]) => ({ value: spec, label: spec, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Get facilities
    if (include.includes('all') || include.includes('facilities')) {
      const schools = await prisma.school.findMany({
        where: {
          status: 'active',
          facilities: {
            not: Prisma.JsonNull
          }
        },
        select: {
          facilities: true
        }
      });

      const facilityCount = new Map<string, number>();
      for (const school of schools) {
        const facilities = school.facilities as string[];
        if (facilities) {
          for (const facility of facilities) {
            facilityCount.set(facility, (facilityCount.get(facility) || 0) + 1);
          }
        }
      }

      filters.facilities = Array.from(facilityCount.entries())
        .map(([facility, count]) => ({ value: facility, label: facility, count }))
        .sort((a, b) => b.count - a.count);
    }

    // Get student count ranges
    if (include.includes('all') || include.includes('studentRanges')) {
      const studentCounts = await prisma.school.findMany({
        where: {
          status: 'active',
          studentCount: {
            not: null
          }
        },
        select: {
          studentCount: true
        }
      });

      const counts = studentCounts.map(s => s.studentCount!).sort((a, b) => a - b);
      const min = counts[0] || 0;
      const max = counts[counts.length - 1] || 1000;

      filters.studentRanges = {
        min,
        max,
        ranges: [
          { value: '0-100', label: '0-100 students', min: 0, max: 100 },
          { value: '101-300', label: '101-300 students', min: 101, max: 300 },
          { value: '301-500', label: '301-500 students', min: 301, max: 500 },
          { value: '501-1000', label: '501-1000 students', min: 501, max: 1000 },
          { value: '1001+', label: '1001+ students', min: 1001, max: 99999 }
        ]
      };
    }

    // Get establishment year ranges
    if (include.includes('all') || include.includes('yearRanges')) {
      const years = await prisma.school.findMany({
        where: {
          status: 'active',
          establishedYear: {
            not: null
          }
        },
        select: {
          establishedYear: true
        }
      });

      const yearList = years.map(y => y.establishedYear!).sort((a, b) => a - b);
      const minYear = yearList[0] || 1900;
      const maxYear = yearList[yearList.length - 1] || new Date().getFullYear();

      filters.yearRanges = {
        min: minYear,
        max: maxYear,
        ranges: [
          { value: 'before-1950', label: 'Before 1950', min: 0, max: 1949 },
          { value: '1950-1980', label: '1950-1980', min: 1950, max: 1980 },
          { value: '1981-2000', label: '1981-2000', min: 1981, max: 2000 },
          { value: '2001-2010', label: '2001-2010', min: 2001, max: 2010 },
          { value: '2011+', label: '2011 and later', min: 2011, max: 9999 }
        ]
      };
    }

    // Get rating ranges
    if (include.includes('all') || include.includes('ratingRanges')) {
      filters.ratingRanges = {
        min: 1,
        max: 5,
        ranges: [
          { value: '4.5+', label: '4.5+ stars', min: 4.5, max: 5 },
          { value: '4+', label: '4+ stars', min: 4, max: 5 },
          { value: '3.5+', label: '3.5+ stars', min: 3.5, max: 5 },
          { value: '3+', label: '3+ stars', min: 3, max: 5 },
          { value: '2+', label: '2+ stars', min: 2, max: 5 }
        ]
      };
    }

    // Get distance ranges
    if (include.includes('all') || include.includes('distanceRanges')) {
      filters.distanceRanges = {
        ranges: [
          { value: '5', label: 'Within 5 km', max: 5 },
          { value: '10', label: 'Within 10 km', max: 10 },
          { value: '20', label: 'Within 20 km', max: 20 },
          { value: '50', label: 'Within 50 km', max: 50 },
          { value: '100', label: 'Within 100 km', max: 100 }
        ]
      };
    }

    // Get popular search terms
    if (include.includes('all') || include.includes('popularSearches')) {
      const popularSearches = await prisma.searchAnalytics.findMany({
        where: {
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: {
          searchCount: 'desc'
        },
        take: 10,
        select: {
          searchTerm: true,
          searchCount: true
        }
      });

      filters.popularSearches = popularSearches.map(search => ({
        term: search.searchTerm,
        count: search.searchCount
      }));
    }

    return NextResponse.json({
      filters,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Search filters API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
