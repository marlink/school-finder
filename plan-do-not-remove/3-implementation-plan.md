# School Finder Portal - Plan Implementacji

> **WAŻNE**: NIGDY nie używaj plików z folderu `-Trash`. Folder ten zawiera przestarzałe lub odrzucone dokumenty, które nie powinny być wykorzystywane w implementacji.

## 1. Struktura Projektu

```
school-finder/
├── app/                    # Główny katalog aplikacji (App Router)
│   ├── admin/              # Panel administracyjny
│   ├── api/                # Endpointy API
│   ├── auth/               # Strony uwierzytelniania
│   ├── profile/            # Profil użytkownika
│   ├── schools/            # Strony szkół
│   ├── search/             # Wyszukiwarka
│   ├── layout.tsx          # Główny layout
│   └── page.tsx            # Strona główna
├── components/             # Komponenty wielokrotnego użytku
│   ├── ui/                 # Komponenty UI (Shadcn)
│   ├── maps/               # Komponenty map
│   ├── search/             # Komponenty wyszukiwania
│   └── analytics/          # Komponenty analityczne
├── lib/                    # Biblioteki i narzędzia
│   ├── auth.ts             # Konfiguracja NextAuth
│   ├── prisma.ts           # Klient Prisma
│   ├── sentiment.ts        # Analiza sentymentu
│   └── utils.ts            # Funkcje pomocnicze
├── prisma/                 # Konfiguracja bazy danych
│   └── schema.prisma       # Schema Prisma
└── public/                 # Statyczne zasoby
```

## 2. Kolejność Implementacji

### Faza 1: Podstawowa Struktura (Tydzień 1)
- Konfiguracja Next.js z App Router
- Integracja Shadcn UI z motywem tangerine (`npx shadcn@latest add https://tweakcn.com/r/themes/tangerine.json`)
- Konfiguracja Prisma i bazy danych
- Podstawowy layout i nawigacja (Navbar i Footer)

### Faza 2: Uwierzytelnianie (Tydzień 1-2)
- Konfiguracja NextAuth.js
- Strony logowania/rejestracji
- Zabezpieczenie tras
- Zarządzanie rolami użytkowników

### Faza 3: Wyszukiwanie Szkół (Tydzień 2-3)
- Komponenty wyszukiwania
- Integracja z API Google Maps
- Wyświetlanie wyników wyszukiwania
- Implementacja filtrów

### Faza 4: Szczegóły Szkół (Tydzień 3-4)
- Strony szczegółów szkół
- Integracja z Apify do scrapingu danych
- Analiza sentymentu komentarzy
- System oceniania szkół

### Faza 5: Profil Użytkownika (Tydzień 4-5)
- Strona profilu użytkownika
- Zarządzanie ulubionymi szkołami
- Historia wyszukiwań
- Ustawienia konta

### Faza 6: Subskrypcje i Płatności (Tydzień 5-6)
- Integracja z API Stripe
- Implementacja limitów wyszukiwania
- Zarządzanie subskrypcjami
- Obsługa płatności

### Faza 7: Panel Administracyjny (Tydzień 6-7)
- Zarządzanie szkołami
- Zarządzanie użytkownikami
- Statystyki i analityka
- Konfiguracja scrapingu

### Faza 8: Testowanie i Optymalizacja (Tydzień 7-8)
- Testy jednostkowe i integracyjne
- Optymalizacja wydajności
- Dostosowanie do urządzeń mobilnych
- Audyt dostępności

## 3. Struktura Stron

Szczegółowa struktura stron i ich komponenty zostały opisane w dokumencie [29-page-structure.md](./29-page-structure.md). Poniżej znajduje się lista głównych stron do zaimplementowania:

### 3.1. Strony Publiczne
- Strona główna (`/`) z wyszukiwarką, karuzelą szkół i tabelą regionów
- Strona kategorii/regionu z listą szkół i filtrami w trzech wariantach układu
- Strona miasta/miejscowości z listą szkół i filtrami w trzech wariantach układu
- Strona szczegółów szkoły z ograniczeniem do 2 szkół dla użytkowników bez subskrypcji
- Specjalna strona promocyjna z alternatywnym układem

### 3.2. Strony Wymagające Uwierzytelnienia
- Strona logowania i rejestracji
- Strona profilu użytkownika z zarządzaniem kontem, ulubionymi szkołami i statystykami

### 3.3. Strony Administracyjne
- Panel administracyjny do zarządzania szkołami, użytkownikami i danymi

Każda z głównych sekcji (szczególnie filtry) będzie miała trzy warianty układu, które użytkownik będzie mógł przełączać za pomocą małej nawigacji w prawym górnym rogu.