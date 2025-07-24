# Caching Strategy

## Overview
The School Finder Portal implements a multi-level caching strategy to improve performance and reduce database load.

## Client-Side Caching with SWR

### Basic Data Fetching
```typescript
// hooks/useSchools.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function useSchools(query, filters) {
  const { data, error, isLoading, mutate } = useSWR(
    query || filters ? `/api/schools?query=${query}&filters=${JSON.stringify(filters)}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  return {
    schools: data?.schools || [],
    isLoading,
    error,
    mutate,
  };
}
```

### Conditional Fetching
```typescript
// hooks/useSchoolDetails.ts
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';

export function useSchoolDetails(id, shouldFetch = true) {
  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/api/schools/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return {
    school: data?.school,
    isLoading,
    error,
  };
}
```

## Server-Side Caching

### API Route Caching
```typescript
// app/api/schools/route.ts
import { NextResponse } from 'next/server';
import { getSchools } from '@/lib/schools';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  const filters = searchParams.get('filters') 
    ? JSON.parse(searchParams.get('filters')) 
    : {};
  
  const schools = await getSchools(query, filters);
  
  // Set cache headers
  return NextResponse.json(
    { schools },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    }
  );
}
```

### Redis Caching for Expensive Operations
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export async function getCachedData(key, fetchFn, ttl = 3600) {
  // Try to get data from cache
  const cachedData = await redis.get(key);
  
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  
  // If not in cache, fetch fresh data
  const freshData = await fetchFn();
  
  // Store in cache
  await redis.set(key, JSON.stringify(freshData), { ex: ttl });
  
  return freshData;
}
```

Usage example:
```typescript
// lib/schools.ts
import { getCachedData } from './redis';
import { prisma } from './prisma';

export async function getPopularSchools() {
  return getCachedData(
    'popular-schools',
    async () => {
      return prisma.school.findMany({
        where: { rating: { gte: 4 } },
        orderBy: { viewCount: 'desc' },
        take: 10,
      });
    },
    1800 // 30 minutes TTL
  );
}
```

## Next.js Static Generation

### Incremental Static Regeneration (ISR)
```typescript
// app/schools/[id]/page.tsx
import { Metadata } from 'next';
import { getSchoolById, getAllSchoolIds } from '@/lib/schools';

// Generate static pages for all schools
export async function generateStaticParams() {
  const schoolIds = await getAllSchoolIds();
  return schoolIds.map(id => ({ id }));
}

// Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }): Promise<Metadata> {
  const school = await getSchoolById(params.id);
  
  if (!school) {
    return { title: 'School Not Found' };
  }
  
  return {
    title: school.name,
    description: `Learn about ${school.name} in ${school.city}, ${school.region}`,
  };
}

export default async function SchoolPage({ params }) {
  const school = await getSchoolById(params.id);
  
  if (!school) {
    return <div>School not found</div>;
  }
  
  return (
    <div>
      <h1>{school.name}</h1>
      {/* School details */}
    </div>
  );
}
```

## Cache Invalidation

### Manual Revalidation
```typescript
// app/api/admin/invalidate-cache/route.ts
import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { path, tag } = await request.json();
  
  if (path) {
    revalidatePath(path);
  }
  
  if (tag) {
    revalidateTag(tag);
  }
  
  return NextResponse.json({ revalidated: true, now: Date.now() });
}
```

### Automatic Revalidation on Data Changes
```typescript
// lib/schools.ts
import { revalidateTag } from 'next/cache';
import { prisma } from './prisma';

export async function updateSchool(id, data) {
  const updatedSchool = await prisma.school.update({
    where: { id },
    data,
  });
  
  // Revalidate cache for this school
  revalidateTag(`school-${id}`);
  
  return updatedSchool;
}
```