# School Finder Portal - Optymalizacja Wydajności

## 1. Przegląd

Ten dokument zawiera wskazówki i strategie optymalizacji wydajności dla School Finder Portal. Wydajność jest kluczowym aspektem doświadczenia użytkownika i ma bezpośredni wpływ na zaangażowanie użytkowników i konwersje.

## 2. Optymalizacja Next.js

### 2.1. Statyczne Generowanie Stron (SSG)

Gdzie to możliwe, używamy statycznego generowania stron, aby zapewnić najszybsze ładowanie:

```tsx
// app/regions/[region]/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { RegionSchools } from "@/components/regions/RegionSchools";

type Props = {
  params: { region: string };
};

// Generuj statyczne ścieżki dla regionów
export async function generateStaticParams() {
  const regions = await prisma.school.findMany({
    select: { region: true },
    distinct: ["region"],
  });

  return regions.map((region) => ({
    region: region.region.toLowerCase().replace(/\s+/g, "-"),
  }));
}

// Generuj metadane dla każdej strony regionu
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const region = params.region.replace(/-/g, " ");
  const formattedRegion = region
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Szkoły w regionie ${formattedRegion} | School Finder`,
    description: `Przeglądaj szkoły w regionie ${formattedRegion}. Znajdź najlepsze placówki edukacyjne w Twojej okolicy.`,
  };
}

export default async function RegionPage({ params }: Props) {
  const region = params.region.replace(/-/g, " ");
  const formattedRegion = region
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const schools = await prisma.school.findMany({
    where: {
      region: {
        equals: formattedRegion,
        mode: "insensitive",
      },
    },
    take: 50,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Szkoły w regionie {formattedRegion}</h1>
      <RegionSchools schools={schools} region={formattedRegion} />
    </div>
  );
}
```

### 2.2. Inkrementalne Statyczne Regenerowanie (ISR)

Dla stron, które wymagają częstszych aktualizacji, używamy ISR:

```tsx
// app/schools/[id]/page.tsx
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SchoolDetails } from "@/components/schools/SchoolDetails";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

// Generuj statyczne ścieżki dla najpopularniejszych szkół
export async function generateStaticParams() {
  const popularSchools = await prisma.school.findMany({
    select: { id: true },
    orderBy: {
      visits: { _count: "desc" },
    },
    take: 100, // Generuj statycznie 100 najpopularniejszych szkół
  });

  return popularSchools.map((school) => ({
    id: school.id,
  }));
}

// Generuj metadane dla każdej strony szkoły
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const school = await prisma.school.findUnique({
    where: { id: params.id },
  });

  if (!school) {
    return {
      title: "Szkoła nie znaleziona | School Finder",
    };
  }

  return {
    title: `${school.name} | School Finder`,
    description: `Informacje o szkole ${school.name} w miejscowości ${school.city}. Sprawdź oceny, opinie i dane kontaktowe.`,
  };
}

export default async function SchoolPage({ params }: Props) {
  const school = await prisma.school.findUnique({
    where: { id: params.id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      },
    },
  });

  if (!school) {
    notFound();
  }

  // Zapisz wizytę
  await prisma.schoolVisit.create({
    data: {
      schoolId: school.id,
    },
  });

  return <SchoolDetails school={school} />;
}

// Ustaw rewalidację co 1 godzinę
export const revalidate = 3600;
```

### 2.3. Streaming i Suspense

Używamy Streaming i Suspense do poprawy postrzeganej wydajności:

```tsx
// app/search/page.tsx
import { Suspense } from "react";
import { SearchFilters } from "@/components/search/SearchFilters";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchSkeleton } from "@/components/search/SearchSkeleton";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Wyszukaj szkoły</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <SearchFilters initialFilters={searchParams} />
        </div>
        
        <div className="md:col-span-3">
          <Suspense fallback={<SearchSkeleton />}>
            <SearchResults searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
```

## 3. Optymalizacja Obrazów

### 3.1. Next.js Image Component

Używamy komponentu Image z Next.js do automatycznej optymalizacji obrazów:

```tsx
// components/schools/SchoolCard.tsx (fragment)
import Image from "next/image";

// ...

<div className="relative h-40 mb-4">
  <Image
    src={school.imageUrl || "/images/school-placeholder.jpg"}
    alt={school.name}
    fill
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    className="object-cover rounded-t-lg"
    priority={priority}
  />
</div>
```

### 3.2. Konfiguracja Optymalizacji Obrazów

Konfigurujemy optymalizację obrazów w pliku next.config.js:

```javascript
// next.config.js (fragment)
module.exports = {
  // ...
  images: {
    domains: ["maps.googleapis.com", "lh3.googleusercontent.com", "avatars.githubusercontent.com"],
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};
```

## 4. Optymalizacja Ładowania JavaScript

### 4.1. Dynamiczny Import

Używamy dynamicznego importu dla komponentów, które nie są krytyczne dla pierwszego renderowania:

```tsx
// app/layout.tsx (fragment)
import dynamic from "next/dynamic";

// Dynamiczny import dla komponentu, który nie jest potrzebny przy pierwszym renderowaniu
const ThemeToggle = dynamic(() => import("@/components/theme/ThemeToggle"), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />,
});

// Dynamiczny import dla ciężkiego komponentu mapy
const SchoolsMap = dynamic(() => import("@/components/maps/SchoolsMap"), {
  loading: () => (
    <div className="w-full h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
      <p>Ładowanie mapy...</p>
    </div>
  ),
});
```

### 4.2. Podział Kodu (Code Splitting)

Next.js automatycznie dzieli kod na poziomie stron, ale możemy dodatkowo zoptymalizować podział kodu:

```tsx
// components/subscription/SubscriptionForm.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";

// Ładuj Stripe tylko po stronie klienta i tylko gdy jest potrzebne
let stripePromise: Promise<any> | null = null;

export function SubscriptionForm() {
  const [loading, setLoading] = useState(false);

  // Inicjalizuj Stripe tylko gdy komponent jest zamontowany
  useEffect(() => {
    if (!stripePromise) {
      stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
    }
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error creating checkout session:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSubscribe} disabled={loading}>
      {loading ? "Ładowanie..." : "Subskrybuj Premium"}
    </Button>
  );
}
```

## 5. Optymalizacja Bazy Danych

### 5.1. Indeksy

Dodajemy indeksy do często wyszukiwanych pól w bazie danych:

```prisma
// prisma/schema.prisma (fragment)
model School {
  id          String   @id @default(cuid())
  name        String
  type        String
  city        String
  region      String
  address     String
  contact     String?
  officialId  String   @unique
  googleRating Float?
  sentimentScore Float?
  latitude    Float?
  longitude   Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relacje
  ratings     Rating[]
  favorites   Favorite[]
  visits      SchoolVisit[]

  // Indeksy dla często wyszukiwanych pól
  @@index([city])
  @@index([region])
  @@index([type])
  @@index([name])
}
```

### 5.2. Optymalizacja Zapytań

Optymalizujemy zapytania do bazy danych, wybierając tylko potrzebne pola:

```typescript
// lib/schools.ts (fragment)
import { prisma } from "./prisma";

export async function getSchoolsForHomepage() {
  // Pobierz tylko potrzebne pola dla strony głównej
  return prisma.school.findMany({
    select: {
      id: true,
      name: true,
      type: true,
      city: true,
      region: true,
      googleRating: true,
      // Nie pobieraj pełnych danych, których nie potrzebujemy na stronie głównej
    },
    orderBy: {
      googleRating: "desc",
    },
    take: 6,
  });
}

export async function searchSchools(params: {
  query?: string;
  city?: string;
  region?: string;
  type?: string;
  page: number;
  limit: number;
}) {
  const { query, city, region, type, page, limit } = params;
  const skip = (page - 1) * limit;

  // Buduj warunki wyszukiwania dynamicznie
  const where: any = {};

  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { address: { contains: query, mode: "insensitive" } },
    ];
  }

  if (city) {
    where.city = { contains: city, mode: "insensitive" };
  }

  if (region) {
    where.region = { equals: region, mode: "insensitive" };
  }

  if (type) {
    where.type = { equals: type };
  }

  // Wykonaj zapytanie count i findMany równolegle
  const [total, schools] = await Promise.all([
    prisma.school.count({ where }),
    prisma.school.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        city: true,
        region: true,
        googleRating: true,
        sentimentScore: true,
        // Nie pobieraj pełnych danych dla listy wyników
      },
      skip,
      take: limit,
    }),
  ]);

  const pages = Math.ceil(total / limit);

  return { schools, total, pages };
}
```

## 6. Optymalizacja Frontendu

### 6.1. Lazy Loading

Implementujemy lazy loading dla komponentów, które znajdują się poza widokiem:

```tsx
// components/home/SchoolList.tsx (fragment)
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { SchoolCard } from "@/components/schools/SchoolCard";

export function SchoolList({ initialSchools }) {
  const [schools, setSchools] = useState(initialSchools);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Użyj react-intersection-observer do wykrywania, kiedy użytkownik przewinie do końca listy
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Ładuj więcej szkół, gdy użytkownik przewinie do końca listy
  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreSchools();
    }
  }, [inView]);

  const loadMoreSchools = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      const nextPage = page + 1;
      const res = await fetch(`/api/schools?page=${nextPage}&limit=6`);
      const data = await res.json();
      
      if (data.schools.length === 0) {
        setHasMore(false);
      } else {
        setSchools([...schools, ...data.schools]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more schools:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <SchoolCard key={school.id} school={school} />
      ))}
      
      {/* Element referencyjny do wykrywania przewijania */}
      {hasMore && (
        <div ref={ref} className="col-span-full flex justify-center p-4">
          {loading && <p>Ładowanie więcej szkół...</p>}
        </div>
      )}
    </div>
  );
}
```

### 6.2. Memoizacja Komponentów

Używamy React.memo i useMemo do optymalizacji renderowania komponentów:

```tsx
// components/search/SearchFilters.tsx (fragment)
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const MemoizedFilterOption = React.memo(({ label, value, selected, onChange }) => (
  <div
    className={`px-3 py-2 rounded-md cursor-pointer ${selected ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
    onClick={() => onChange(value)}
  >
    {label}
  </div>
));

export function SearchFilters({ initialFilters }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Memoizuj aktualne filtry, aby uniknąć niepotrzebnych renderowań
  const currentFilters = useMemo(() => {
    return {
      query: searchParams.get("query") || "",
      city: searchParams.get("city") || "",
      region: searchParams.get("region") || "",
      type: searchParams.get("type") || "",
    };
  }, [searchParams]);
  
  // Memoizuj funkcję aktualizacji filtrów
  const updateFilters = useMemo(() => {
    return (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      
      router.push(`/search?${params.toString()}`);
    };
  }, [router, searchParams]);
  
  // Reszta komponentu...
}
```

## 7. Monitorowanie Wydajności

### 7.1. Web Vitals

Implementujemy monitorowanie Web Vitals, aby śledzić wydajność aplikacji:

```typescript
// lib/web-vitals.ts
import { ReportHandler } from "web-vitals";

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && typeof onPerfEntry === "function") {
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
```

```typescript
// app/layout.tsx (fragment)
import { useReportWebVitals } from "next/web-vitals";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Raportuj Web Vitals do własnego endpointu
  useReportWebVitals((metric) => {
    const body = JSON.stringify(metric);
    const url = "/api/analytics/vitals";

    // Używaj `navigator.sendBeacon()` jeśli jest dostępny, w przeciwnym razie użyj fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, { body, method: "POST", keepalive: true });
    }
  });

  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
```

### 7.2. Endpoint do Zbierania Metryk

```typescript
// pages/api/analytics/vitals.ts
import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const metric = req.body;
    
    // Zapisz metrykę w bazie danych
    await prisma.webVital.create({
      data: {
        name: metric.name,
        value: metric.value,
        id: metric.id,
        startTime: metric.startTime,
        label: metric.label,
        url: metric.url,
      },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error saving web vital:", error);
    return res.status(500).json({ error: "Failed to save web vital" });
  }
}
```