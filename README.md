# School Finder App

![Next.js](https://img.shields.io/badge/Next.js-15.3.5-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue) ![Supabase](https://img.shields.io/badge/Supabase-2.x-green) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-cyan) ![Mapbox](https://img.shields.io/badge/Mapbox-3.x-purple)

## O Projekcie

School Finder App to kompleksowa platforma do wyszukiwania i porównywania szkół w Polsce. Aplikacja umożliwia rodzicom znalezienie najlepszych placówek edukacyjnych dla swoich dzieci na podstawie lokalizacji, ocen, opinii i innych istotnych kryteriów.

### Główne Funkcjonalności

- **Interaktywna Mapa Szkół** - wizualizacja szkół na mapie z wykorzystaniem Mapbox GL JS
- **Zaawansowane Filtrowanie** - wyszukiwanie szkół według regionu, ocen i innych parametrów
- **Szczegółowe Profile Szkół** - kompletne informacje o każdej placówce
- **System Ocen i Recenzji** - możliwość dodawania i przeglądania opinii o szkołach
- **Panel Użytkownika** - zarządzanie ulubionymi szkołami i historią przeglądania
- **Panel Administratora** - zarządzanie danymi szkół i analiza statystyk

## Technologie

- **Frontend**: Next.js 15.3.5 (App Router), TypeScript, Tailwind CSS, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth)
- **Mapy**: Mapbox GL JS
- **Wykresy**: Recharts
- **Walidacja**: Zod

## Rozpoczęcie Pracy

### Wymagania

- Node.js 18.x lub nowszy
- npm 9.x lub nowszy

### Instalacja

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd school-finder-app

# Instalacja zależności
npm install

# Konfiguracja zmiennych środowiskowych
cp .env.example .env.local
# Edytuj .env.local, aby dodać swoje klucze API

# Uruchomienie serwera deweloperskiego
npm run dev
```

Otwórz [http://localhost:3000](http://localhost:3000) w przeglądarce, aby zobaczyć aplikację.

## Struktura Projektu

```
src/
├── app/              # Strony aplikacji (Next.js App Router)
├── components/       # Komponenty UI
├── contexts/         # Konteksty React (np. AuthContext)
├── data/             # Dane testowe i mockowe
├── lib/              # Biblioteki i integracje (np. Supabase)
├── types/            # Definicje TypeScript
└── utils/            # Funkcje pomocnicze

supabase/
└── migrations/       # Migracje bazy danych
```

## Konfiguracja Środowiska

### Ważna Zasada: Umieszczenie pliku .env.local

**ZAWSZE** przechowuj pliki `.env.local` w katalogu głównym projektu. NIGDY nie umieszczaj ich w podfolderach.

Zapewnia to:
- Spójne ładowanie zmiennych środowiskowych przez Next.js
- Prawidłowy dostęp do danych uwierzytelniających bazy danych i kluczy API
- Kompatybilność z komendami Supabase CLI

Nieprawidłowe umieszczenie może powodować błędy połączenia podczas uruchamiania migracji bazy danych.

## Dokumentacja

Dodatkowe informacje o projekcie można znaleźć w następujących dokumentach:

- [Status Rozwoju](./DEVELOPMENT-STATUS.md) - aktualny stan projektu
- [Planowane Funkcjonalności](./TO-BE-DEVELOPED.md) - funkcje oczekujące na implementację
- [Zasady Współpracy](./CONTRIBUTING.md) - wytyczne dla współtwórców

## Licencja

Ten projekt jest licencjonowany na warunkach licencji MIT - zobacz plik [LICENSE](./LICENSE) dla szczegółów.
