# Panel Administracyjny Scraperów - School Finder

Ten prosty panel administracyjny pozwala na zarządzanie i uruchamianie scraperów dla aplikacji School Finder lokalnie, bez konieczności korzystania z głównego interfejsu aplikacji.

## Wymagania

- Node.js (wersja 14 lub nowsza)
- npm (menedżer pakietów Node.js)
- Dostęp do bazy danych Supabase (URL i klucz API)

## Instalacja

1. Zainstaluj wymagane zależności:

```bash
npm install express cors body-parser @supabase/supabase-js
```

## Uruchomienie

1. Uruchom serwer lokalny:

```bash
node scraper-server.js
```

2. Otwórz przeglądarkę i przejdź do adresu:

```
http://localhost:3500
```

3. W panelu konfiguracyjnym wprowadź dane dostępowe do Supabase:
   - Supabase URL (np. https://your-project.supabase.co)
   - Supabase Anon Key (klucz anonimowy)
   - Google Places API Key (opcjonalnie, jeśli chcesz korzystać z Google Places API)

4. Kliknij "Zapisz konfigurację", aby zapisać dane dostępowe lokalnie w przeglądarce.

## Funkcje

### Statystyki

Panel wyświetla podstawowe statystyki dotyczące danych w bazie:
- Całkowita liczba szkół
- Status scrapera (uruchomiony, zakończony, błąd)
- Data ostatniej aktualizacji
- Liczba szkół według regionów
- Liczba szkół według typów

### Uruchamianie scrapera

Możesz uruchomić scraper z następującymi opcjami:
- Region: wybierz konkretny region lub wszystkie regiony
- Typ szkoły: szkoły podstawowe/średnie, uczelnie wyższe lub wszystkie
- Pełne scrapowanie: zaznacz, aby nadpisać istniejące dane (w przeciwnym razie zostaną zaktualizowane tylko brakujące informacje)

## Bezpieczeństwo

**Uwaga**: Ten panel administracyjny jest przeznaczony wyłącznie do użytku lokalnego w środowisku deweloperskim. Nie zaleca się udostępniania go publicznie, ponieważ nie zawiera pełnej warstwy zabezpieczeń.

Dane dostępowe do Supabase są przechowywane lokalnie w przeglądarce (localStorage) i nie są wysyłane na żadne zewnętrzne serwery poza bezpośrednią komunikacją z Supabase.

## Rozwiązywanie problemów

### Nie można połączyć się z Supabase

- Sprawdź, czy podane URL i klucz API są poprawne
- Upewnij się, że masz odpowiednie uprawnienia w projekcie Supabase
- Sprawdź, czy tabele `schools` i `scraping_status` istnieją w bazie danych

### Scraper nie uruchamia się

- Sprawdź, czy nie ma już uruchomionego procesu scrapowania (tylko jeden proces może działać jednocześnie)
- Sprawdź logi serwera w konsoli, w której uruchomiono `node scraper-server.js`

## Dostosowanie

Możesz dostosować panel administracyjny, modyfikując pliki:
- `scraper-admin.html` - interfejs użytkownika
- `scraper-server.js` - logika serwera i komunikacja z Supabase

## Integracja z rzeczywistym scraperem

W obecnej implementacji, scraper jest symulowany (po 10 sekundach status zmienia się na "zakończony"). Aby zintegrować rzeczywisty scraper:

1. Zmodyfikuj endpoint `/api/admin/scraping/trigger` w pliku `scraper-server.js`
2. Zamiast symulacji, uruchom rzeczywisty proces scrapowania (np. wywołanie skryptu Python lub modułu Node.js)
3. Zaktualizuj status w tabeli `scraping_status` po zakończeniu procesu