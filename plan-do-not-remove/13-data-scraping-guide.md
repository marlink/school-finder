# School Finder Portal - Przewodnik Zbierania Danych

## 1. Przegląd

Ten dokument opisuje proces zbierania danych o szkołach dla School Finder Portal. Dane są pozyskiwane z różnych źródeł przy użyciu Apify Actors, przetwarzane i zapisywane w bazie danych.

## 2. Źródła Danych

Dane o szkołach są pozyskiwane z następujących źródeł:

1. **Oficjalne rejestry szkół** - dane podstawowe jak nazwa, adres, typ szkoły
2. **Google Maps** - lokalizacja, oceny, opinie
3. **Strony internetowe szkół** - dodatkowe informacje, oferta edukacyjna
4. **Media społecznościowe** - aktualności, wydarzenia

## 3. Proces Zbierania Danych

### 3.1. Konfiguracja Apify

Do zbierania danych wykorzystujemy platformę Apify i jej aktorów. Aby skonfigurować Apify:

1. Utwórz konto na [Apify](https://apify.com)
2. Wygeneruj token API w ustawieniach konta
3. Ustaw token jako zmienną środowiskową `APIFY_API_TOKEN`

### 3.2. Aktorzy Apify

W projekcie wykorzystujemy następujących aktorów:

1. **Website Content Crawler** - do zbierania danych ze stron internetowych szkół
2. **Google Maps Scraper** - do pozyskiwania danych lokalizacyjnych i ocen
3. **Social Media Scraper** - do zbierania informacji z mediów społecznościowych

### 3.3. Harmonogram Zbierania Danych

Dane są zbierane według następującego harmonogramu:

1. **Dane podstawowe** - aktualizacja raz na miesiąc
2. **Oceny i opinie** - aktualizacja raz na tydzień
3. **Aktualności i wydarzenia** - aktualizacja codziennie

## 4. Implementacja

### 4.1. Klient Apify

```typescript
// lib/apify.ts
import { ApifyClient } from "apify-client";

export const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN,
});

export async function runActor(actorId: string, input: any) {
  console.log(`Running Apify actor ${actorId}`);
  
  const run = await apifyClient.actor(actorId).call(input);
  
  console.log(`Actor run finished with ID: ${run.id}`);
  
  return run;
}

export async function getDatasetItems(datasetId: string) {
  return await apifyClient.dataset(datasetId).listItems();
}
```

### 4.2. Endpoint API do Uruchamiania Scrapowania

```typescript
// app/api/admin/scrape/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { runActor, getDatasetItems } from "@/lib/apify";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  // Sprawdź uprawnienia administratora
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { actorId, input } = await request.json();
  
  if (!actorId) {
    return NextResponse.json({ error: "Actor ID is required" }, { status: 400 });
  }
  
  try {
    // Zapisz informację o rozpoczęciu scrapowania
    const scrapingLog = await prisma.scrapingLog.create({
      data: {
        actorId,
        status: "RUNNING",
        startedAt: new Date(),
      },
    });
    
    // Uruchom aktora Apify
    const run = await runActor(actorId, input);
    
    // Pobierz dane
    const items = await getDatasetItems(run.defaultDatasetId);
    
    // Zaktualizuj log scrapowania
    await prisma.scrapingLog.update({
      where: { id: scrapingLog.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        itemsCount: items.length,
        runId: run.id,
        datasetId: run.defaultDatasetId,
      },
    });
    
    return NextResponse.json({
      success: true,
      runId: run.id,
      itemsCount: items.length,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    
    // Zaktualizuj log scrapowania w przypadku błędu
    if (scrapingLog) {
      await prisma.scrapingLog.update({
        where: { id: scrapingLog.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          error: error.message,
        },
      });
    }
    
    return NextResponse.json(
      { error: "Scraping failed", message: error.message },
      { status: 500 }
    );
  }
}
```

### 4.3. Zadanie Cron do Automatycznego Scrapowania

```typescript
// app/api/cron/scrape-schools/route.ts
import { NextResponse } from "next/server";
import { runActor, getDatasetItems } from "@/lib/apify";
import { prisma } from "@/lib/prisma";
import { processSchoolData } from "@/lib/data-processing";

// Funkcja uruchamiana przez Vercel Cron Job
export async function GET(request: Request) {
  // Sprawdź tajny token dla bezpieczeństwa
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  
  if (token !== process.env.CRON_SECRET_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Zapisz informację o rozpoczęciu scrapowania
    const scrapingLog = await prisma.scrapingLog.create({
      data: {
        actorId: "google-maps-scraper",
        status: "RUNNING",
        startedAt: new Date(),
        isScheduled: true,
      },
    });
    
    // Uruchom aktora Apify dla Google Maps
    const run = await runActor("apify/google-maps-scraper", {
      searchStrings: ["szkoła podstawowa", "liceum", "technikum"],
      maxCrawledPlaces: 1000,
      language: "pl",
      maxImages: 0, // Nie pobieraj zdjęć dla oszczędności
    });
    
    // Pobierz dane
    const items = await getDatasetItems(run.defaultDatasetId);
    
    // Przetwórz i zapisz dane
    const processedCount = await processSchoolData(items);
    
    // Zaktualizuj log scrapowania
    await prisma.scrapingLog.update({
      where: { id: scrapingLog.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        itemsCount: items.length,
        processedCount,
        runId: run.id,
        datasetId: run.defaultDatasetId,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} schools`,
    });
  } catch (error) {
    console.error("Scheduled scraping error:", error);
    
    // Zaktualizuj log scrapowania w przypadku błędu
    if (scrapingLog) {
      await prisma.scrapingLog.update({
        where: { id: scrapingLog.id },
        data: {
          status: "FAILED",
          finishedAt: new Date(),
          error: error.message,
        },
      });
    }
    
    return NextResponse.json(
      { error: "Scheduled scraping failed", message: error.message },
      { status: 500 }
    );
  }
}
```

## 5. Przetwarzanie Danych

### 5.1. Transformacja Danych

Po zebraniu dane są przetwarzane przed zapisaniem do bazy danych:

```typescript
// lib/data-processing.ts
import { prisma } from "@/lib/prisma";
import { analyzeSentiment } from "@/lib/sentiment";

export async function processSchoolData(items: any[]) {
  let processedCount = 0;
  
  for (const item of items) {
    try {
      // Sprawdź, czy szkoła już istnieje
      const existingSchool = await prisma.school.findFirst({
        where: {
          OR: [
            { googlePlaceId: item.placeId },
            { name: item.name, address: item.address },
          ],
        },
      });
      
      // Przygotuj dane szkoły
      const schoolData = {
        name: item.name,
        address: item.address,
        city: extractCity(item.address),
        region: extractRegion(item.address),
        type: determineSchoolType(item.name, item.categories),
        googlePlaceId: item.placeId,
        googleRating: item.rating,
        googleReviewsCount: item.reviewsCount,
        latitude: item.latitude,
        longitude: item.longitude,
        website: item.website,
        phone: item.phone,
      };
      
      // Analizuj sentyment opinii
      let sentimentScore = null;
      if (item.reviews && item.reviews.length > 0) {
        const reviewsText = item.reviews.map(r => r.text).join(" ");
        sentimentScore = await analyzeSentiment(reviewsText);
      }
      
      if (existingSchool) {
        // Aktualizuj istniejącą szkołę
        await prisma.school.update({
          where: { id: existingSchool.id },
          data: {
            ...schoolData,
            sentimentScore,
            updatedAt: new Date(),
          },
        });
      } else {
        // Utwórz nową szkołę
        await prisma.school.create({
          data: {
            ...schoolData,
            sentimentScore,
          },
        });
      }
      
      processedCount++;
    } catch (error) {
      console.error(`Error processing school ${item.name}:`, error);
    }
  }
  
  return processedCount;
}

// Funkcje pomocnicze do ekstrakcji danych
function extractCity(address: string): string {
  // Implementacja ekstrakcji miasta z adresu
  const cityRegex = /\d{2}-\d{3}\s+([^,]+)/;
  const match = address.match(cityRegex);
  return match ? match[1].trim() : "";
}

function extractRegion(address: string): string {
  // Implementacja ekstrakcji województwa
  // Można użyć mapowania kodów pocztowych do województw
  return "";
}

function determineSchoolType(name: string, categories: string[]): string {
  // Określ typ szkoły na podstawie nazwy i kategorii
  if (name.toLowerCase().includes("podstawowa")) return "PRIMARY";
  if (name.toLowerCase().includes("liceum")) return "HIGH_SCHOOL";
  if (name.toLowerCase().includes("technikum")) return "TECHNICAL";
  
  // Sprawdź kategorie
  if (categories.some(c => c.includes("podstawowa"))) return "PRIMARY";
  if (categories.some(c => c.includes("liceum"))) return "HIGH_SCHOOL";
  if (categories.some(c => c.includes("technikum"))) return "TECHNICAL";
  
  return "OTHER";
}
```

### 5.2. Analiza Sentymentu

Do analizy sentymentu opinii wykorzystujemy bibliotekę Natural.js:

```typescript
// lib/sentiment.ts
import natural from "natural";

export async function analyzeSentiment(text: string): Promise<number> {
  // Inicjalizacja analizatora sentymentu
  const analyzer = new natural.SentimentAnalyzer(
    "Polish", 
    natural.PorterStemmerPl, 
    "afinn"
  );
  
  // Tokenizacja tekstu
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  
  // Analiza sentymentu
  const sentiment = analyzer.getSentiment(tokens);
  
  // Normalizacja wyniku do zakresu 0-5
  // Wynik analizy jest zwykle w zakresie od -1 do 1
  return Math.min(5, Math.max(0, (sentiment + 1) * 2.5));
}
```

## 6. Panel Administracyjny

Panel administracyjny zawiera interfejs do zarządzania procesem zbierania danych:

```tsx
// app/admin/scraping/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export default function ScrapingPage() {
  const [actorId, setActorId] = useState("apify/google-maps-scraper");
  const [searchQuery, setSearchQuery] = useState("szkoła podstawowa");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  async function handleStartScraping() {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId,
          input: {
            searchStrings: [searchQuery],
            maxCrawledPlaces: 100,
            language: "pl",
          },
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Scraping started",
          description: `Successfully started scraping with run ID: ${data.runId}`,
        });
      } else {
        throw new Error(data.error || "Failed to start scraping");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Data Scraping Management</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Start New Scraping Task</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="actor">Apify Actor</Label>
              <Select value={actorId} onValueChange={setActorId}>
                <SelectTrigger id="actor">
                  <SelectValue placeholder="Select actor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apify/google-maps-scraper">Google Maps Scraper</SelectItem>
                  <SelectItem value="apify/website-content-crawler">Website Content Crawler</SelectItem>
                  <SelectItem value="apify/facebook-scraper">Facebook Scraper</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="search">Search Query</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g., szkoła podstawowa Warszawa"
              />
            </div>
            
            <Button onClick={handleStartScraping} disabled={isLoading}>
              {isLoading ? "Starting..." : "Start Scraping"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## 7. Dobre Praktyki

### 7.1. Etyczne Zbieranie Danych

1. **Przestrzegaj warunków korzystania** z serwisów, z których zbierasz dane
2. **Ogranicz częstotliwość zapytań**, aby nie przeciążać serwerów źródłowych
3. **Zbieraj tylko niezbędne dane** zgodnie z zasadą minimalizacji danych
4. **Aktualizuj dane regularnie**, aby zapewnić ich aktualność

### 7.2. Obsługa Błędów

1. **Monitoruj procesy scrapowania** i rejestruj błędy
2. **Implementuj mechanizmy ponawiania** w przypadku tymczasowych błędów
3. **Ustaw limity czasowe** dla operacji scrapowania
4. **Przygotuj plan awaryjny** na wypadek niedostępności źródeł danych

## 8. Rozwiązywanie Problemów

### 8.1. Typowe Problemy

1. **Blokowanie IP** - rozwiązanie: używaj proxy, ogranicz częstotliwość zapytań
2. **Zmiany w strukturze stron** - rozwiązanie: regularnie aktualizuj selektory, używaj bardziej odpornych metod ekstrakcji
3. **Niekompletne dane** - rozwiązanie: implementuj mechanizmy walidacji i uzupełniania danych z alternatywnych źródeł

### 8.2. Monitorowanie

1. **Regularnie sprawdzaj logi** scrapowania
2. **Ustaw powiadomienia** o błędach
3. **Monitoruj jakość danych** poprzez automatyczne testy spójności

## 9. Podsumowanie

Prawidłowo skonfigurowany proces zbierania danych jest kluczowy dla funkcjonowania School Finder Portal. Regularne aktualizacje danych zapewniają użytkownikom dostęp do aktualnych informacji o szkołach, co zwiększa wartość platformy.