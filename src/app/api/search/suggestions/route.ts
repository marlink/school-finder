import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all'; // 'schools', 'locations', 'all'
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query || query.length < 2) {
      return NextResponse.json({
        suggestions: [],
        categories: {
          schools: [],
          locations: [],
          specializations: [],
          facilities: []
        }
      });
    }

    const suggestions: any[] = [];
    const categories = {
      schools: [] as any[],
      locations: [] as any[],
      specializations: [] as any[],
      facilities: [] as any[]
    };

    // Search for schools
    if (type === 'all' || type === 'schools') {
      const schools = await prisma.school.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { shortName: { contains: query, mode: 'insensitive' } }
          ],
          status: 'active'
        },
        select: {
          id: true,
          name: true,
          shortName: true,
          type: true,
          address: true,
          images: {
            where: { imageType: 'main' },
            take: 1,
            select: { imageUrl: true }
          }
        },
        take: limit,
        orderBy: { name: 'asc' }
      });

      for (const school of schools) {
        const suggestion = {
          id: school.id,
          type: 'school',
          title: school.name,
          subtitle: `${school.type} • ${(school.address as any).city}, ${(school.address as any).voivodeship}`,
          image: school.images[0]?.imageUrl || null,
          url: `/schools/${school.id}`
        };
        
        suggestions.push(suggestion);
        categories.schools.push(suggestion);
      }
    }

    // Search for locations (cities, voivodeships, districts)
    if (type === 'all' || type === 'locations') {
      const locations = await prisma.school.findMany({
        where: {
          OR: [
            { address: { path: ['city'], string_contains: query } },
            { address: { path: ['voivodeship'], string_contains: query } },
            { address: { path: ['district'], string_contains: query } }
          ],
          status: 'active'
        },
        select: {
          address: true
        },
        take: 50 // Get more to deduplicate
      });

      // Extract unique locations
      const uniqueCities = new Set<string>();
      const uniqueVoivodeships = new Set<string>();
      const uniqueDistricts = new Set<string>();

      for (const location of locations) {
        const addr = location.address as any;
        if (addr.city && addr.city.toLowerCase().includes(query.toLowerCase())) {
          uniqueCities.add(`${addr.city}, ${addr.voivodeship}`);
        }
        if (addr.voivodeship && addr.voivodeship.toLowerCase().includes(query.toLowerCase())) {
          uniqueVoivodeships.add(addr.voivodeship);
        }
        if (addr.district && addr.district.toLowerCase().includes(query.toLowerCase())) {
          uniqueDistricts.add(`${addr.district}, ${addr.voivodeship}`);
        }
      }

      // Add city suggestions
      Array.from(uniqueCities).slice(0, 3).forEach(city => {
        const [cityName, voivodeship] = city.split(', ');
        const suggestion = {
          id: `city-${cityName}`,
          type: 'location',
          title: cityName,
          subtitle: `City in ${voivodeship}`,
          image: null,
          url: `/search?city=${encodeURIComponent(cityName)}`
        };
        suggestions.push(suggestion);
        categories.locations.push(suggestion);
      });

      // Add voivodeship suggestions
      Array.from(uniqueVoivodeships).slice(0, 2).forEach(voivodeship => {
        const suggestion = {
          id: `voivodeship-${voivodeship}`,
          type: 'location',
          title: voivodeship,
          subtitle: 'Voivodeship',
          image: null,
          url: `/search?voivodeship=${encodeURIComponent(voivodeship)}`
        };
        suggestions.push(suggestion);
        categories.locations.push(suggestion);
      });

      // Add district suggestions
      Array.from(uniqueDistricts).slice(0, 2).forEach(district => {
        const [districtName, voivodeship] = district.split(', ');
        const suggestion = {
          id: `district-${districtName}`,
          type: 'location',
          title: districtName,
          subtitle: `District in ${voivodeship}`,
          image: null,
          url: `/search?district=${encodeURIComponent(districtName)}`
        };
        suggestions.push(suggestion);
        categories.locations.push(suggestion);
      });
    }

    // Search for specializations
    if (type === 'all' || type === 'specializations') {
      const specializationMatches = await prisma.school.findMany({
        where: {
          specializations: {
            array_contains: [query]
          },
          status: 'active'
        },
        select: {
          specializations: true
        },
        take: 20
      });

      const uniqueSpecializations = new Set<string>();
      for (const school of specializationMatches) {
        const specs = school.specializations as string[];
        if (specs) {
          for (const spec of specs) {
            if (spec.toLowerCase().includes(query.toLowerCase())) {
              uniqueSpecializations.add(spec);
            }
          }
        }
      }

      Array.from(uniqueSpecializations).slice(0, 3).forEach(specialization => {
        const suggestion = {
          id: `specialization-${specialization}`,
          type: 'specialization',
          title: specialization,
          subtitle: 'Specialization',
          image: null,
          url: `/search?specializations=${encodeURIComponent(specialization)}`
        };
        suggestions.push(suggestion);
        categories.specializations.push(suggestion);
      });
    }

    // Search for facilities
    if (type === 'all' || type === 'facilities') {
      const facilityMatches = await prisma.school.findMany({
        where: {
          facilities: {
            array_contains: [query]
          },
          status: 'active'
        },
        select: {
          facilities: true
        },
        take: 20
      });

      const uniqueFacilities = new Set<string>();
      for (const school of facilityMatches) {
        const facilities = school.facilities as string[];
        if (facilities) {
          for (const facility of facilities) {
            if (facility.toLowerCase().includes(query.toLowerCase())) {
              uniqueFacilities.add(facility);
            }
          }
        }
      }

      Array.from(uniqueFacilities).slice(0, 3).forEach(facility => {
        const suggestion = {
          id: `facility-${facility}`,
          type: 'facility',
          title: facility,
          subtitle: 'Facility',
          image: null,
          url: `/search?facilities=${encodeURIComponent(facility)}`
        };
        suggestions.push(suggestion);
        categories.facilities.push(suggestion);
      });
    }

    // Sort suggestions by relevance (exact matches first)
    suggestions.sort((a, b) => {
      const aExact = a.title.toLowerCase().startsWith(query.toLowerCase());
      const bExact = b.title.toLowerCase().startsWith(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return a.title.localeCompare(b.title);
    });

    return NextResponse.json({
      suggestions: suggestions.slice(0, limit),
      categories,
      query,
      count: suggestions.length
    });

  } catch (error) {
    console.error('Search suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
