This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## About Me

I specialise in translating brand visions into beautiful, functional, and user-friendly digital interfaces. My approach centers on using design systems to build consistent and scalable products efficiently, bridging the gap between initial wireframes and pixel-perfect execution. Whether digital-first or requiring print consistency, I ensure the design language resonates. With deep proficiency in Figma and the modern design stack (Figma, Storybook, Sketch, Zeplin, Adobe CS), I deliver polished user experiences that meet both user needs and business goals. 

I build beautiful, intuitive user interfaces that bring brands to life in the digital space. Utilizing design systems is key to my process, ensuring efficiency, consistency, and scalability from wireframe to final design. I translate brand essence into effective design languages across digital touchpoints (and print, where required). 

My core expertise lies in Figma, supported by broad experience across the design/prototyping ecosystem (Sketch, Zeplin) and practical knowledge of implementation tools like Webflow and Flutter. I am highly proficient in the Adobe Creative Suite **and bring strong traditional sketching skills to my design process.**

## Phase 1: Architektura i technologie (100% ukończone)

- [x] Framework: Next.js 15.3.5 (App Router)
- [x] Język: TypeScript
- [x] Baza danych i autentykacja: Supabase
- [x] Stylowanie: Tailwind CSS
- [x] Mapy: Mapbox GL JS
- [x] Wykresy: Recharts
- [x] Walidacja: Zod
- [x] UI Components: Radix UI

## Phase 2: Struktura bazy danych (100% ukończone)

- [x] Tabela regions - informacje o regionach
- [x] Tabela schools - dane szkół
- [x] Tabela users - dane użytkowników
- [x] Tabela user_favorites - ulubione szkoły użytkowników
- [x] Tabela user_reviews - recenzje szkół
- [x] Tabela user_stats - statystyki użytkowników
- [x] Tabela user_viewed_schools - historia przeglądanych szkół
- [x] Storage buckets - przechowywanie plików

## Phase 3: Komponenty interfejsu użytkownika (85% ukończone)

- [x] Układ strony i nawigacja
- [x] Komponenty autoryzacji (logowanie, rejestracja, reset hasła)
- [x] Komponenty mapy i wizualizacji danych
- [x] Panel administratora
- [x] Profil użytkownika i ustawienia
- [x] Wyszukiwarka i filtry szkół
- [x] System ocen i recenzji
- [ ] Responsywność na urządzeniach mobilnych

## Phase 4: API i funkcjonalność backendu (75% ukończone)

- [x] Integracja z Supabase Auth
- [x] Middleware do autoryzacji
- [x] API dla szkół i regionów
- [x] API dla panelu administratora
- [x] API dla recenzji i ocen
- [x] API dla statystyk użytkownika
- [ ] Scraping danych szkół
- [ ] Walidacja danych wejściowych

## Phase 5: Testowanie i jakość (25% ukończone)

- [ ] Testy jednostkowe komponentów UI
- [ ] Testy integracyjne API
- [ ] Testy end-to-end
- [x] Audyt dostępności (accessibility)
- [x] Optymalizacja wydajności
- [ ] Obsługa błędów i monitoring
- [ ] Dokumentacja API
- [ ] Dokumentacja użytkownika

## Phase 6: Wdrożenie i infrastruktura (10% ukończone)

- [x] Konfiguracja środowiska deweloperskiego
- [ ] Konfiguracja CI/CD
- [ ] Wdrożenie na środowisko testowe
- [ ] Wdrożenie na środowisko produkcyjne
- [ ] Konfiguracja domeny i SSL
- [ ] Monitoring i alerty
- [ ] Kopie zapasowe bazy danych
- [ ] Skalowanie i optymalizacja kosztów

## Phase 7: Bezpieczeństwo (15% ukończone)

- [x] Bezpieczna autentykacja użytkowników
- [ ] Autoryzacja i kontrola dostępu
- [ ] Ochrona przed CSRF i XSS
- [ ] Szyfrowanie danych wrażliwych
- [ ] Audyt bezpieczeństwa
- [ ] Zgodność z RODO/GDPR
- [ ] Polityka prywatności
- [ ] Regulamin serwisu

## Phase 8: Rozszerzenia i funkcje dodatkowe (0% ukończone)

- [ ] Powiadomienia e-mail i push
- [ ] Integracja z mediami społecznościowymi
- [ ] Wersja mobilna (PWA)
- [ ] Porównywanie szkół
- [ ] Zaawansowana analityka dla administratorów
- [ ] Wielojęzyczność
- [ ] Tryb ciemny/jasny
- [ ] API dla deweloperów zewnętrznych

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


## Environment Configuration

### Important Rule: .env.local Placement

**ALWAYS** keep `.env.local` files in the project root directory. NEVER place them inside sub-folders.

This ensures:
- Consistent environment variable loading by Next.js
- Proper access to database credentials and API keys
- Compatibility with Supabase CLI commands

Incorrect placement can cause connection errors when running database migrations.