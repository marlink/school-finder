# SEO Implementation

## Overview
The School Finder Portal implements SEO best practices to improve visibility in search engines and drive organic traffic.

## Metadata Configuration

### Page-Level Metadata
Use Next.js Metadata API to define SEO metadata for each page:

```tsx
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | School Finder Portal',
    default: 'School Finder Portal - Find the Perfect School',
  },
  description: 'Search and compare schools in your area with detailed information, ratings, and reviews.',
  keywords: ['schools', 'education', 'school finder', 'school ratings'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://schoolfinder.example.com',
    siteName: 'School Finder Portal',
    images: [{
      url: 'https://schoolfinder.example.com/og-image.jpg',
      width: 1200,
      height: 630,
      alt: 'School Finder Portal',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@schoolfinder',
  },
};
```

### Dynamic Metadata
Generate dynamic metadata for school detail pages:

```tsx
// app/schools/[id]/page.tsx
import { Metadata } from 'next';
import { getSchoolById } from '@/lib/schools';

export async function generateMetadata({ params }): Promise<Metadata> {
  const school = await getSchoolById(params.id);
  
  if (!school) {
    return {
      title: 'School Not Found',
    };
  }
  
  return {
    title: school.name,
    description: `Learn about ${school.name} - ${school.type} in ${school.city}, ${school.region}. View ratings, reviews, and detailed information.`,
    openGraph: {
      images: [{
        url: school.image || 'https://schoolfinder.example.com/default-school.jpg',
        width: 1200,
        height: 630,
        alt: school.name,
      }],
    },
  };
}
```

## Structured Data
Implement JSON-LD structured data for rich search results:

```tsx
// components/SchoolJsonLd.tsx
export function SchoolJsonLd({ school }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: school.name,
    description: school.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: school.address,
      addressLocality: school.city,
      addressRegion: school.region,
      postalCode: school.postalCode,
      addressCountry: 'PL',
    },
    telephone: school.phone,
    email: school.email,
    url: `https://schoolfinder.example.com/schools/${school.id}`,
    aggregateRating: school.ratings ? {
      '@type': 'AggregateRating',
      ratingValue: school.ratings.average,
      ratingCount: school.ratings.count,
    } : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## XML Sitemap
Generate a dynamic sitemap for search engines:

```tsx
// app/sitemap.ts
import { getAllSchools } from '@/lib/schools';

export default async function sitemap() {
  const baseUrl = 'https://schoolfinder.example.com';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/contact',
    '/pricing',
  ].map(path => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
  }));
  
  // Dynamic school pages
  const schools = await getAllSchools();
  const schoolPages = schools.map(school => ({
    url: `${baseUrl}/schools/${school.id}`,
    lastModified: new Date(school.updatedAt),
  }));
  
  return [...staticPages, ...schoolPages];
}
```