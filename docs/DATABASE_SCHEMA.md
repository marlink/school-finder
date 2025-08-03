# School Finder Portal - Schema Bazy Danych

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Przegląd

Schema bazy danych dla School Finder Portal została zaprojektowana z myślą o efektywnym przechowywaniu danych o szkołach, użytkownikach, ocenach i subskrypcjach. Używamy Neon PostgreSQL z connection pooling oraz Prisma ORM do zarządzania bazą danych.

## 2. Konfiguracja Neon

### 2.1. Connection String z Pooling
```
# .env.local
# Neon connection string with pooling (recommended for production)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?pgbouncer=true&connect_timeout=10"

# Direct connection (only for migrations and specific operations)
DIRECT_DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb"
```

### 2.2. Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

## 2. Modele Danych

### 2.1. User

```prisma
model User {
  id                String    @id @default(cuid())
  name              String?
  email             String    @unique
  emailVerified     DateTime?
  image             String?
  password          String?
  role              String    @default("user") // "user" lub "admin"
  subscriptionStatus String    @default("free") // "free" lub "premium"
  subscriptionEnd   DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  accounts          Account[]
  sessions          Session[]
  favorites         Favorite[]
  ratings           Rating[]
  searchHistory     SearchHistory[]
}
```

### 2.2. School

```prisma
model School {
  id                String    @id @default(cuid())
  name              String
  type              String    // Typ szkoły (np. "primary", "high_school")
  address           String
  city              String
  region            String
  postalCode        String?
  phone             String?
  email             String?
  website           String?
  googleRating      Float?
  googleRatingCount Int?
  sentimentScore    Float?
  latitude          Float?
  longitude         Float?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  favorites         Favorite[]
  ratings           Rating[]
  comments          Comment[]
  visits            SchoolVisit[]
}
```

### 2.3. Rating

```prisma
model Rating {
  id                String    @id @default(cuid())
  value             Int       // Ocena od 1 do 5
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  @@unique([userId, schoolId]) // Użytkownik może ocenić szkołę tylko raz
}
```

### 2.4. Favorite

```prisma
model Favorite {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  @@unique([userId, schoolId]) // Szkoła może być dodana do ulubionych tylko raz
}
```

### 2.5. Comment

```prisma
model Comment {
  id                String    @id @default(cuid())
  content           String    // PostgreSQL TEXT type (no need for @db.Text)
  source            String    // Źródło komentarza (np. "google", "user")
  sentimentScore    Float?    // Wynik analizy sentymentu
  createdAt         DateTime  @default(now())
  
  // Relacje
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
}
```

### 2.6. SearchHistory

```prisma
model SearchHistory {
  id                String    @id @default(cuid())
  query             String
  filters           Json?     // Filtry wyszukiwania
  resultCount       Int
  createdAt         DateTime  @default(now())
  
  // Relacje
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId            String
}
```

### 2.7. SchoolVisit

```prisma
model SchoolVisit {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  
  // Relacje
  school            School    @relation(fields: [schoolId], references: [id], onDelete: Cascade)
  schoolId          String
  
  // Opcjonalna relacja z użytkownikiem (jeśli zalogowany)
  user              User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  userId            String?
}
```

### 2.8. ScrapingLog

```prisma
model ScrapingLog {
  id                String    @id @default(cuid())
  actorId           String    // ID aktora Apify
  runId             String    // ID uruchomienia
  status            String    // Status: "started", "succeeded", "failed"
  startedAt         DateTime  @default(now())
  finishedAt        DateTime?
  errorMessage      String?
  schoolsProcessed  Int?      // Liczba przetworzonych szkół
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

## 3. Indeksy i Optymalizacja

```prisma
// W modelu School
model School {
  // ... pola jak wyżej
  
  @@index([city])
  @@index([region])
  @@index([type])
  @@index([googleRating])
  @@index([sentimentScore])
  @@index([createdAt])
}

// W modelu User
model User {
  // ... pola jak wyżej
  
  @@index([email])
  @@index([subscriptionStatus])
  @@index([createdAt])
}

// W modelu Rating
model Rating {
  // ... pola jak wyżej
  
  @@index([schoolId])
  @@index([userId])
  @@index([createdAt])
}

// W modelu Comment
model Comment {
  // ... pola jak wyżej
  
  @@index([schoolId])
  @@index([source])
  @@index([sentimentScore])
  @@index([createdAt])
}
```

## 4. Konfiguracja Connection Pooling

### 4.1. Prisma Client Configuration

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Neon with pooling
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 4.2. Connection Pool Settings

```typescript
// lib/db-config.ts
export const dbConfig = {
  // Neon connection pooling settings
  maxConnections: 10, // Maksymalna liczba połączeń w puli
  connectionTimeout: 10000, // 10 sekund timeout
  idleTimeout: 30000, // 30 sekund idle timeout
  
  // Query optimization
  queryTimeout: 5000, // 5 sekund timeout dla zapytań
  
  // Cache settings
  cacheMaxAge: 300, // 5 minut cache dla często używanych zapytań
};
```

## 5. Migracje i Seeding

### 5.1. Przykładowe Dane (Seed)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Tworzenie administratora
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD!, 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'neatgroupnet@gmail.com' },
    update: {},
    create: {
      email: 'neatgroupnet@gmail.com',
      name: 'Administrator',
      role: 'admin',
      password: hashedPassword,
      subscriptionStatus: 'premium',
    },
  });

  // Przykładowe szkoły
  const schools = [
    {
      name: 'Szkoła Podstawowa nr 1 w Warszawie',
      type: 'primary',
      address: 'ul. Przykładowa 1',
      city: 'Warszawa',
      region: 'Mazowieckie',
      postalCode: '00-001',
      phone: '+48 22 123 45 67',
      email: 'sp1@warszawa.edu.pl',
      website: 'https://sp1.warszawa.edu.pl',
      googleRating: 4.2,
      googleRatingCount: 45,
      sentimentScore: 0.75,
      latitude: 52.2297,
      longitude: 21.0122,
    },
    {
      name: 'Liceum Ogólnokształcące im. Adama Mickiewicza',
      type: 'high_school',
      address: 'ul. Mickiewicza 10',
      city: 'Kraków',
      region: 'Małopolskie',
      postalCode: '31-120',
      phone: '+48 12 234 56 78',
      email: 'lo.mickiewicz@krakow.edu.pl',
      website: 'https://lo-mickiewicz.krakow.edu.pl',
      googleRating: 4.5,
      googleRatingCount: 78,
      sentimentScore: 0.82,
      latitude: 50.0647,
      longitude: 19.9450,
    },
  ];

  for (const school of schools) {
    await prisma.school.upsert({
      where: { name: school.name },
      update: {},
      create: school,
    });
  }

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 5.2. Skrypty Migracji

```json
// package.json scripts
{
  "scripts": {
    "db:migrate": "prisma migrate dev",
    "db:migrate:prod": "prisma migrate deploy",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

## 6. Optymalizacja Wydajności

### 6.1. Zapytania z Connection Pooling

```typescript
// lib/queries/schools.ts
import { prisma } from '@/lib/prisma';
import { dbConfig } from '@/lib/db-config';

export async function getSchoolsByCity(city: string, limit = 20, offset = 0) {
  return await prisma.school.findMany({
    where: {
      city: {
        contains: city,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
      type: true,
      address: true,
      city: true,
      googleRating: true,
      sentimentScore: true,
      latitude: true,
      longitude: true,
    },
    orderBy: [
      { googleRating: 'desc' },
      { sentimentScore: 'desc' },
    ],
    take: limit,
    skip: offset,
  });
}

export async function getSchoolWithDetails(id: string) {
  return await prisma.school.findUnique({
    where: { id },
    include: {
      ratings: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      comments: {
        where: {
          sentimentScore: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      },
      _count: {
        select: {
          ratings: true,
          favorites: true,
        },
      },
    },
  });
}
```

### 6.2. Cache Integration z Redis

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!);

export async function getCachedSchools(
  cacheKey: string,
  queryFn: () => Promise<any>,
  ttl = 300 // 5 minut
) {
  try {
    // Sprawdź cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Wykonaj zapytanie do bazy
    const data = await queryFn();
    
    // Zapisz w cache
    await redis.setex(cacheKey, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback do bezpośredniego zapytania
    return await queryFn();
  }
}

// Użycie
export async function getPopularSchools() {
  return getCachedSchools(
    'schools:popular',
    () => prisma.school.findMany({
      where: {
        googleRating: {
          gte: 4.0,
        },
      },
      orderBy: {
        googleRatingCount: 'desc',
      },
      take: 10,
    }),
    600 // 10 minut cache
  );
}
```

## 7. Monitoring i Maintenance

### 7.1. Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test connection pool
    const activeConnections = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      activeConnections,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
```

### 7.2. Cleanup Jobs

```typescript
// app/api/cron/cleanup/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Usuń stare sesje (starsze niż 30 dni)
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    // Usuń stare logi scrapingu (starsze niż 90 dni)
    await prisma.scrapingLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
```

## 8. Deployment i Production

### 8.1. Inicjalizacja Prisma

```bash
npx prisma init
```

### 8.2. Generowanie Migracji

```bash
npx prisma migrate dev --name init
```

### 8.3. Wdrażanie Migracji

```bash
npx prisma migrate deploy
```

### 8.4. Generowanie Klienta Prisma

```bash
npx prisma generate
```