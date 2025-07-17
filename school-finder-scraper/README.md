# School Finder Scraper

Scraper do pobierania danych o szkołach z Rejestru Szkół i Placówek Oświatowych (RSPO) oraz uczelniach wyższych z API POL-on (System Informacji o Nauce i Szkolnictwie Wyższym), a także wzbogacania ich o informacje z Google Places API.

## Funkcjonalności

- Pobieranie listy szkół z RSPO
- Pobieranie listy uczelni wyższych z API POL-on
- Pobieranie szczegółowych informacji o szkołach i uczelniach
- Wzbogacanie danych o informacje z Google Places API (oceny, zdjęcia, itp.)
- Zapisywanie danych do bazy Supabase
- Śledzenie statusu scrapowania
- Obsługa różnych trybów scrapowania (pełny, aktualizacja, test)
- Możliwość wyboru typu instytucji do scrapowania (szkoły, uczelnie wyższe lub wszystkie)

## Wymagania

- Python 3.8+
- Biblioteki: supabase, curl_cffi, lxml

## Instalacja

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd school-finder-scraper

# Instalacja zależności
pip install -r requirements.txt
```

## Konfiguracja

Przed uruchomieniem scrapera należy skonfigurować plik `config/settings.py` z odpowiednimi parametrami:

- Dane dostępowe do Supabase
- Klucz API Google Places (opcjonalnie)
- Klucz API POL-on (dla scrapowania uczelni wyższych)
- Parametry scrapowania (limity zapytań, opóźnienia, itp.)

## Użycie

```bash
# Tryb aktualizacji (domyślny) - aktualizuje tylko szkoły, które wymagają odświeżenia
python main.py --mode update

# Tryb pełny - pobiera wszystkie szkoły niezależnie od statusu
python main.py --mode full

# Tryb testowy z limitem szkół
python main.py --mode test --limit 10

# Scrapowanie tylko szkół (domyślne)
python main.py --type schools

# Scrapowanie tylko uczelni wyższych
python main.py --type universities

# Scrapowanie zarówno szkół, jak i uczelni wyższych
python main.py --type all

# Użycie niestandardowego pliku konfiguracyjnego
python main.py --config path/to/config.py
```

## Struktura projektu

```
school-finder-scraper/
├── config/                 # Konfiguracja
│   ├── __init__.py
│   └── settings.py
├── logs/                   # Logi (tworzone automatycznie)
├── parsers/                # Parsery danych
│   ├── __init__.py
│   ├── schema.py
│   └── xpath_parser.py
├── scrapers/               # Scrapery dla różnych źródeł
│   ├── __init__.py
│   ├── base_scraper.py
│   ├── google_places.py
│   ├── men_scraper.py
│   └── polon_scraper.py
├── storage/                # Obsługa bazy danych
│   ├── __init__.py
│   └── supabase_client.py
├── utils/                  # Narzędzia pomocnicze
│   ├── __init__.py
│   ├── logger.py
│   ├── proxy_manager.py
│   └── rate_limiter.py
├── main.py                 # Główny skrypt
└── README.md               # Dokumentacja
```

## Rozszerzanie

Aby dodać obsługę nowego źródła danych:

1. Utwórz nowy scraper w katalogu `scrapers/`
2. Zaimplementuj odpowiedni parser w katalogu `parsers/`
3. Zintegruj nowe źródło w `main.py`

## Licencja

Ten projekt jest objęty licencją MIT. Szczegóły w pliku LICENSE.