/**
 * Konfiguracja scrapera dla School Finder
 */

import { ScraperConfig } from '../index';

/**
 * Ładowanie konfiguracji z zmiennych środowiskowych lub domyślnych wartości
 */
export function loadConfig(): ScraperConfig {
  return {
    // Supabase
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    
    // Google Places API
    googleApiKey: process.env.GOOGLE_API_KEY || '',
    useGooglePlaces: true,
    
    // Scraping
    rateLimit: 24,  // Liczba zapytań na minutę
    delayBetweenSchools: 5,  // Opóźnienie między zapytaniami w sekundach
    proxies: [],  // Lista proxy w formacie {'http': 'http://user:pass@host:port'}
    
    // Logging
    logLevel: 'INFO',
    
    // Źródła danych
    menBaseUrl: 'https://rspo.gov.pl',
    menSearchUrl: 'https://rspo.gov.pl/szkoly-i-placowki/wyszukiwarka',

    // API dla uczelni wyższych
    polonApiUrl: 'https://polon.nauka.gov.pl/opi-ws/api/',
    polonApiKey: process.env.POLON_API_KEY || '',
  };
}