# Konfiguracja scrapera dla School Finder

def load_config(config_path=None):
    """
    Ładowanie konfiguracji z pliku lub zwracanie domyślnej konfiguracji
    """
    # W rzeczywistej implementacji można wczytać konfigurację z pliku
    # Dla uproszczenia zwracamy domyślną konfigurację
    
    return {
        # Supabase
        'supabase_url': 'https://zsmerzvhrosbhjkoobgl.supabase.co',
        'supabase_key': 'your-supabase-key',
        
        # Google Places API
        'google_api_key': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbWVyenZocm9zYmhqa29vYmdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NjYxMSwiZXhwIjoyMDY4MDYyNjExfQ.jXgHit7yzSNDrBtj7fFv8puE0A1rTj-FjMyB8bHGZzw',
        'use_google_places': True,
        
        # Scraping
        'rate_limit': 24,  # Liczba zapytań na minutę
        'delay_between_schools': 5,  # Opóźnienie między zapytaniami w sekundach
        'proxies': [],  # Lista proxy w formacie {'http': 'http://user:pass@host:port'}
        
        # Logging
        'log_level': 'INFO',
        
        # Źródła danych
        'men_base_url': 'https://rspo.gov.pl',
        'men_search_url': 'https://rspo.gov.pl/szkoly-i-placowki/wyszukiwarka',

        # API dla uczelni wyższych
        'polon_api_url': 'https://polon.nauka.gov.pl/opi-ws/api/',
        'polon_api_key': 'your-polon-api-key',
        'usos_api_url': 'https://usos.example.edu.pl/usosapi/',
        'usos_consumer_key': 'your-usos-consumer-key',
        'usos_consumer_secret': 'your-usos-consumer-secret',
        'bdl_api_url': 'https://bdl.stat.gov.pl/api/v1/',
        'bdl_api_key': 'your-bdl-api-key'
    }