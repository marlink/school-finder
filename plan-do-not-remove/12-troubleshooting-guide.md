# School Finder Portal - Przewodnik Rozwiązywania Problemów

## 1. Przegląd

Ten dokument zawiera wskazówki dotyczące rozwiązywania typowych problemów, które mogą wystąpić podczas rozwoju, wdrażania i użytkowania School Finder Portal. Przewodnik ten jest przeznaczony dla deweloperów i administratorów systemu.

## 2. Problemy z Uwierzytelnianiem

### 2.1. Użytkownik nie może się zalogować

**Objawy:**
- Użytkownik nie może zalogować się przez Google lub GitHub
- Po kliknięciu przycisku logowania nic się nie dzieje lub pojawia się błąd

**Możliwe przyczyny i rozwiązania:**

1. **Niepoprawne klucze API**
   - Sprawdź, czy zmienne środowiskowe `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_ID` i `GITHUB_CLIENT_SECRET` są poprawnie ustawione
   - Zweryfikuj, czy dozwolone adresy URL przekierowania w konsolach Google i GitHub są poprawne

2. **Problem z NextAuth.js**
   - Sprawdź logi serwera pod kątem błędów związanych z NextAuth
   - Upewnij się, że `NEXTAUTH_URL` jest poprawnie ustawiony i wskazuje na właściwy adres aplikacji
   - Zweryfikuj, czy `NEXTAUTH_SECRET` jest ustawiony

3. **Problem z bazą danych**
   - Sprawdź połączenie z bazą danych
   - Upewnij się, że tabele użytkowników i sesji istnieją i mają poprawną strukturę

**Przykładowy kod debugowania:**

```typescript
// pages/api/auth/debug.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Tylko dla środowiska deweloperskiego
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ error: "Forbidden" });
  }

  const session = await getServerSession(req, res, authOptions);
  const dbStatus = await checkDatabaseConnection();
  const envVars = checkEnvironmentVariables();

  return res.status(200).json({
    session,
    dbStatus,
    envVars,
  });
}

async function checkDatabaseConnection() {
  try {
    // Sprawdź połączenie z bazą danych
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true };
  } catch (error) {
    return { connected: false, error: error.message };
  }
}

function checkEnvironmentVariables() {
  const requiredVars = [
    "NEXTAUTH_URL",
    "NEXTAUTH_SECRET",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "DATABASE_URL",
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  const maskedVars = requiredVars.reduce((acc, varName) => {
    acc[varName] = process.env[varName] ? "[SET]" : "[MISSING]";
    return acc;
  }, {});

  return {
    missingVars,
    maskedVars,
  };
}
```

## 3. Problemy z API

### 3.1. Endpoint API zwraca błąd 500

**Objawy:**
- Zapytania do API zwracają błąd 500 (Internal Server Error)
- Funkcjonalność zależna od API nie działa

**Możliwe przyczyny i rozwiązania:**

1. **Błąd w kodzie API**
   - Sprawdź logi serwera, aby zidentyfikować konkretny błąd
   - Dodaj bardziej szczegółowe obsługiwanie błędów w kodzie API

2. **Problem z bazą danych**
   - Sprawdź połączenie z bazą danych
   - Zweryfikuj, czy zapytania do bazy danych są poprawne

3. **Problem z zewnętrznym API**
   - Jeśli endpoint korzysta z zewnętrznego API (np. Apify, Google Maps), sprawdź czy te usługi działają poprawnie
   - Upewnij się, że klucze API dla zewnętrznych usług są poprawne i aktywne

**Przykładowy kod do debugowania API:**

```typescript
// lib/api-debug.ts
import { NextApiRequest, NextApiResponse } from "next";

export function withErrorHandling(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(`API Error [${req.method} ${req.url}]:`, error);
      
      // Zwróć szczegółowe informacje o błędzie tylko w środowisku deweloperskim
      if (process.env.NODE_ENV === "development") {
        return res.status(500).json({
          error: "Internal Server Error",
          message: error.message,
          stack: error.stack,
        });
      }
      
      // W produkcji zwróć ogólny komunikat o błędzie
      return res.status(500).json({
        error: "Internal Server Error",
        requestId: generateRequestId(), // Unikalny identyfikator do śledzenia błędu w logach
      });
    }
  };
}

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}
```

### 3.2. Problemy z limitowaniem zapytań (Rate Limiting)

**Objawy:**
- Użytkownicy otrzymują błąd 429 (Too Many Requests)
- Niektóre zapytania są blokowane, mimo że użytkownik nie przekroczył limitu

**Możliwe przyczyny i rozwiązania:**

1. **Niepoprawna implementacja rate limitingu**
   - Sprawdź, czy liczniki zapytań są poprawnie resetowane
   - Zweryfikuj, czy limity są odpowiednio ustawione dla różnych typów użytkowników

2. **Problem z przechowywaniem stanu limitów**
   - Jeśli używasz pamięci serwera do przechowywania limitów, mogą one być resetowane przy restarcie serwera
   - Rozważ użycie bardziej trwałego rozwiązania, jak Redis lub baza danych

**Przykładowe rozwiązanie z użyciem Redis:**

```typescript
// lib/rate-limit-redis.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

type LimitOptions = {
  limit: number;
  windowMs: number;
};

const defaultOptions: LimitOptions = {
  limit: 5, // 5 zapytań
  windowMs: 60 * 60 * 1000, // 1 godzina
};

export function rateLimit(options: Partial<LimitOptions> = {}) {
  const { limit, windowMs } = { ...defaultOptions, ...options };
  const windowInSeconds = Math.ceil(windowMs / 1000);

  return async function rateLimitMiddleware(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    // Pobierz token użytkownika
    const token = await getToken({ req });
    const userId = token?.sub;

    // Użyj ID użytkownika lub adresu IP jako klucza
    const key = `ratelimit:${userId || req.headers["x-forwarded-for"]?.toString() || req.socket.remoteAddress || "unknown"}`;
    
    try {
      // Inkrementuj licznik i ustaw czas wygaśnięcia
      const count = await redis.incr(key);
      
      // Jeśli to pierwszy request, ustaw czas wygaśnięcia
      if (count === 1) {
        await redis.expire(key, windowInSeconds);
      }
      
      // Pobierz pozostały czas
      const ttl = await redis.ttl(key);
      
      // Ustaw nagłówki informujące o limitach
      res.setHeader("X-RateLimit-Limit", limit.toString());
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - count).toString());
      res.setHeader("X-RateLimit-Reset", (Date.now() + ttl * 1000).toString());
      
      // Jeśli limit został przekroczony, zwróć błąd
      if (count > limit) {
        return res.status(429).json({
          error: "Too many requests",
          resetAt: new Date(Date.now() + ttl * 1000).toISOString(),
        });
      }
      
      return next();
    } catch (error) {
      console.error("Rate limiting error:", error);
      // W przypadku błędu z Redis, pozwól na wykonanie zapytania
      return next();
    }
  };
}
```

## 4. Problemy z Renderowaniem

### 4.1. Hydration Error

**Objawy:**
- W konsoli przeglądarki pojawia się błąd "Hydration failed because the initial UI does not match what was rendered on the server"
- Komponenty UI wyglądają niepoprawnie lub nie działają

**Możliwe przyczyny i rozwiązania:**

1. **Różnice między renderowaniem serwerowym a klienckim**
   - Upewnij się, że komponenty nie używają API dostępnych tylko w przeglądarce (np. `window`, `document`) podczas renderowania serwerowego
   - Użyj `useEffect` do kodu, który powinien działać tylko po stronie klienta

2. **Problemy z generowaniem ID lub kluczy**
   - Upewnij się, że generowane ID lub klucze są deterministyczne i takie same na serwerze i kliencie

**Przykładowe rozwiązanie:**

```tsx
// components/ClientOnly.tsx
import { useEffect, useState } from "react";

export function ClientOnly({ children, fallback = null }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? children : fallback;
}

// Użycie:
// <ClientOnly>
//   <KomponentUżywającyAPIKlienta />
// </ClientOnly>
```

### 4.2. Problemy z CSS

**Objawy:**
- Style nie są aplikowane poprawnie
- Występuje "flash of unstyled content" (FOUC)

**Możliwe przyczyny i rozwiązania:**

1. **Problemy z ładowaniem CSS**
   - Upewnij się, że pliki CSS są poprawnie importowane
   - Sprawdź, czy Tailwind CSS jest poprawnie skonfigurowany

2. **Konflikty klas CSS**
   - Sprawdź, czy nie ma konfliktów między klasami Tailwind a innymi bibliotekami CSS

**Przykładowe rozwiązanie:**

```tsx
// app/layout.tsx
import "@/styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <head />
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
```

## 5. Problemy z Wydajnością

### 5.1. Wolne ładowanie strony

**Objawy:**
- Strony ładują się wolno
- Metryki Web Vitals (LCP, FID, CLS) są poniżej oczekiwań

**Możliwe przyczyny i rozwiązania:**

1. **Duże pakiety JavaScript**
   - Użyj narzędzi jak `@next/bundle-analyzer` do analizy rozmiaru pakietów
   - Zoptymalizuj import bibliotek, używając dynamicznego importu gdzie to możliwe

2. **Nieoptymalne zapytania do bazy danych**
   - Sprawdź, czy zapytania do bazy danych są zoptymalizowane
   - Dodaj indeksy do często wyszukiwanych pól

3. **Brak buforowania**
   - Zaimplementuj buforowanie na poziomie API i bazy danych
   - Użyj ISR (Incremental Static Regeneration) dla często odwiedzanych stron

**Przykładowe rozwiązanie - analiza pakietów:**

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer({
  // Reszta konfiguracji Next.js
});
```

### 5.2. Problemy z pamięcią

**Objawy:**
- Aplikacja zużywa dużo pamięci
- Występują wycieki pamięci (memory leaks)

**Możliwe przyczyny i rozwiązania:**

1. **Nieoczyszczone subskrypcje lub timery**
   - Upewnij się, że wszystkie subskrypcje i timery są czyszczone w `useEffect`

2. **Duże zestawy danych w stanie aplikacji**
   - Ogranicz ilość danych przechowywanych w stanie
   - Rozważ użycie wirtualizacji dla długich list

**Przykładowe rozwiązanie - wirtualizacja listy:**

```tsx
// components/schools/VirtualizedSchoolList.tsx
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { SchoolCard } from "./SchoolCard";

export function VirtualizedSchoolList({ schools }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: schools.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Szacowana wysokość elementu w pikselach
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <SchoolCard school={schools[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 6. Problemy z Wdrożeniem

### 6.1. Błędy podczas wdrażania na Vercel

**Objawy:**
- Wdrożenie na Vercel kończy się błędem
- Aplikacja działa lokalnie, ale nie na produkcji

**Możliwe przyczyny i rozwiązania:**

1. **Brakujące zmienne środowiskowe**
   - Upewnij się, że wszystkie wymagane zmienne środowiskowe są ustawione w panelu Vercel

2. **Problemy z zależnościami**
   - Sprawdź, czy wszystkie zależności są poprawnie zainstalowane
   - Upewnij się, że wersje Node.js i npm są kompatybilne

3. **Błędy w kodzie specyficzne dla produkcji**
   - Sprawdź logi wdrożenia na Vercel
   - Dodaj więcej logowania do kodu, aby zidentyfikować problemy

**Przykładowa lista kontrolna wdrożenia:**

```markdown
## Lista kontrolna wdrożenia

### Zmienne środowiskowe
- [ ] NEXTAUTH_URL
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID
- [ ] GITHUB_CLIENT_SECRET
- [ ] DATABASE_URL
- [ ] APIFY_API_TOKEN
- [ ] GOOGLE_MAPS_API_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

### Konfiguracja
- [ ] Upewnij się, że `next.config.js` jest poprawnie skonfigurowany
- [ ] Sprawdź, czy wszystkie zależności są zainstalowane
- [ ] Upewnij się, że baza danych jest dostępna z Vercel

### Po wdrożeniu
- [ ] Sprawdź, czy strona główna ładuje się poprawnie
- [ ] Przetestuj logowanie
- [ ] Przetestuj wyszukiwanie szkół
- [ ] Przetestuj wyświetlanie szczegółów szkoły
- [ ] Przetestuj funkcje premium (jeśli dostępne)
```

### 6.2. Problemy z bazą danych po wdrożeniu

**Objawy:**
- Aplikacja nie może połączyć się z bazą danych
- Zapytania do bazy danych zwracają błędy

**Możliwe przyczyny i rozwiązania:**

1. **Niepoprawny URL bazy danych**
   - Sprawdź, czy `DATABASE_URL` jest poprawnie ustawiony
   - Upewnij się, że baza danych jest dostępna z Vercel

2. **Brakujące migracje**
   - Upewnij się, że wszystkie migracje Prisma zostały zastosowane

3. **Problemy z połączeniem**
   - Sprawdź, czy firewall nie blokuje połączeń z Vercel
   - Upewnij się, że limit połączeń do bazy danych nie został przekroczony

**Przykładowy skrypt do weryfikacji bazy danych:**

```typescript
// scripts/verify-database.ts
import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  
  try {
    console.log("Sprawdzanie połączenia z bazą danych...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Połączenie z bazą danych działa poprawnie");
    
    console.log("Sprawdzanie tabel...");
    const tables = [
      "User",
      "School",
      "Rating",
      "Favorite",
      "Comment",
      "SearchHistory",
      "SchoolVisit",
      "ScrapingLog",
    ];
    
    for (const table of tables) {
      const count = await prisma[table.toLowerCase()].count();
      console.log(`✅ Tabela ${table}: ${count} rekordów`);
    }
    
    console.log("Wszystkie testy zakończone pomyślnie!");
  } catch (error) {
    console.error("❌ Błąd podczas weryfikacji bazy danych:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

## 7. Problemy z Zewnętrznymi API

### 7.1. Problemy z Google Maps API

**Objawy:**
- Mapy nie ładują się
- W konsoli pojawia się błąd związany z Google Maps API

**Możliwe przyczyny i rozwiązania:**

1. **Niepoprawny klucz API**
   - Sprawdź, czy `GOOGLE_MAPS_API_KEY` jest poprawnie ustawiony
   - Upewnij się, że klucz API ma włączone odpowiednie usługi (Maps JavaScript API, Geocoding API)

2. **Problemy z ograniczeniami domen**
   - Sprawdź, czy domena aplikacji jest dodana do dozwolonych domen w konsoli Google Cloud

**Przykładowe rozwiązanie z obsługą błędów:**

```tsx
// components/maps/SchoolMap.tsx
import { useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export function SchoolMap({ latitude, longitude, name, className }) {
  const [loadError, setLoadError] = useState(null);
  const { isLoaded, loadError: jsApiLoadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    if (jsApiLoadError) {
      console.error("Google Maps API load error:", jsApiLoadError);
      setLoadError("Nie udało się załadować Google Maps API. Sprawdź konsolę, aby uzyskać więcej informacji.");
    }
  }, [jsApiLoadError]);

  if (loadError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-red-500">{loadError}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p>Ładowanie mapy...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={className}
      center={{ lat: latitude, lng: longitude }}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: true,
        mapTypeControl: false,
      }}
    >
      <Marker position={{ lat: latitude, lng: longitude }} title={name} />
    </GoogleMap>
  );
}
```

### 7.2. Problemy z Apify

**Objawy:**
- Scrapowanie danych nie działa
- Endpoint `/api/scrape` zwraca błędy

**Możliwe przyczyny i rozwiązania:**

1. **Niepoprawny token API**
   - Sprawdź, czy `APIFY_API_TOKEN` jest poprawnie ustawiony
   - Upewnij się, że token API jest aktywny

2. **Problemy z aktorem Apify**
   - Sprawdź, czy wybrany aktor istnieje i jest dostępny
   - Upewnij się, że parametry wejściowe dla aktora są poprawne

**Przykładowe rozwiązanie z obsługą błędów:**

```typescript
// lib/apify.ts
import { ApifyClient } from "apify-client";

export async function runApifyActor(actorId: string, input: any) {
  try {
    const apifyClient = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });

    // Sprawdź, czy aktor istnieje
    try {
      await apifyClient.actor(actorId).get();
    } catch (error) {
      throw new Error(`Aktor Apify o ID "${actorId}" nie istnieje lub nie jest dostępny`);
    }

    // Uruchom aktora
    console.log(`Uruchamianie aktora Apify ${actorId} z parametrami:`, input);
    const run = await apifyClient.actor(actorId).call(input);
    console.log(`Aktor Apify ${actorId} zakończył działanie, ID uruchomienia: ${run.id}`);

    // Pobierz dane
    const dataset = await apifyClient.dataset(run.defaultDatasetId).listItems();
    return dataset.items;
  } catch (error) {
    console.error("Błąd podczas korzystania z Apify:", error);
    throw new Error(`Błąd Apify: ${error.message}`);
  }
}
```