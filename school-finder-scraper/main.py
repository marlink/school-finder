import argparse
import logging
import time
from config.settings import load_config
from scrapers.men_scraper import MENScraper
from scrapers.polon_scraper import POLonScraper
from scrapers.google_places import GooglePlacesScraper
from parsers.xpath_parser import XPathParser
from storage.supabase_client import SupabaseClient
from utils.logger import setup_logger

def main():
    # Konfiguracja parsera argumentów
    parser = argparse.ArgumentParser(description='School Finder Scraper')
    parser.add_argument('--config', type=str, default='config/settings.py', help='Path to config file')
    parser.add_argument('--mode', type=str, choices=['full', 'update', 'test'], default='update', help='Scraping mode')
    parser.add_argument('--type', type=str, choices=['schools', 'universities', 'all'], default='schools', help='Type of institutions to scrape')
    parser.add_argument('--limit', type=int, default=0, help='Limit number of schools to scrape (0 for no limit)')
    args = parser.parse_args()
    
    # Ładowanie konfiguracji
    config = load_config(args.config)
    
    # Konfiguracja loggera
    logger = setup_logger(config.get('log_level', 'INFO'))
    logger.info(f"Starting scraper in {args.mode} mode")
    
    # Inicjalizacja komponentów
    supabase = SupabaseClient(config)
    men_scraper = MENScraper(config)
    polon_scraper = POLonScraper(config)
    google_scraper = GooglePlacesScraper(config)
    parser = XPathParser(config)
    
    # Aktualizacja statusu
    supabase.update_scraping_status('running')
    
    try:
        # Pobieranie istniejących szkół z bazy danych
        existing_schools = {school['rspo']: school for school in supabase.get_existing_schools()}
        logger.info(f"Found {len(existing_schools)} existing schools in database")
        
        schools = []
        
        # Pobieranie danych w zależności od wybranego typu instytucji
        if args.type in ['schools', 'all']:
            # Pobieranie listy szkół z MEN
            schools_from_men = men_scraper.get_school_list()
            logger.info(f"Found {len(schools_from_men)} schools on MEN website")
            schools.extend(schools_from_men)
            
        if args.type in ['universities', 'all']:
            # Pobieranie listy uczelni z POL-on
            universities = polon_scraper.get_university_list()
            logger.info(f"Found {len(universities)} universities on POL-on API")
            schools.extend(universities)
        
        # Ograniczenie liczby szkół do scrapowania (dla testów)
        if args.limit > 0:
            schools = schools[:args.limit]
        
        # Statystyki
        stats = {'total': len(schools), 'updated': 0, 'failed': 0, 'new': 0}
        
        # Scrapowanie szczegółów dla każdej szkoły
        for i, school in enumerate(schools):
            try:
                rspo = school.get('rspo')
                logger.info(f"Processing school {i+1}/{len(schools)}: {school['name']} (RSPO: {rspo})")
                
                # Sprawdzenie czy szkoła istnieje i czy potrzebuje aktualizacji
                if args.mode == 'update' and rspo in existing_schools:
                    # Pomijanie szkół, które były aktualizowane w ciągu ostatnich 30 dni
                    # Logika do implementacji
                    pass
                
                # Pobieranie szczegółów szkoły/uczelni z odpowiedniego źródła
                if school.get('type') == 'university':
                    school_details = polon_scraper.get_university_details(school['rspo'])
                else:
                    school_details = men_scraper.get_school_details(school['rspo'])
                
                # Wzbogacanie danych o informacje z Google Places
                if config.get('use_google_places', True):
                    google_data = google_scraper.search_school(
                        school_details['name'], 
                        school_details.get('location')
                    )
                    if google_data:
                        # Łączenie danych z MEN i Google Places
                        school_details.update({
                            'google_place_id': google_data.get('google_place_id'),
                            'rating': google_data.get('rating'),
                            'ratings_count': google_data.get('ratings_count'),
                            'photos': google_data.get('photos')
                        })
                        # Jeśli brak lokalizacji z MEN, użyj z Google
                        if not school_details.get('location') and google_data.get('location'):
                            school_details['location'] = google_data['location']
                
                # Zapisywanie do bazy danych
                supabase.upsert_schools([school_details])
                
                # Aktualizacja statystyk
                if rspo in existing_schools:
                    stats['updated'] += 1
                else:
                    stats['new'] += 1
                
                # Opóźnienie między zapytaniami
                time.sleep(config.get('delay_between_schools', 1))
                
            except Exception as e:
                logger.error(f"Error processing school {school.get('name')}: {str(e)}")
                stats['failed'] += 1
        
        # Aktualizacja statusu
        supabase.update_scraping_status('completed', stats)
        logger.info(f"Scraping completed. Stats: {stats}")
        
    except Exception as e:
        logger.error(f"Scraping failed: {str(e)}")
        supabase.update_scraping_status('failed', {'error': str(e)})

if __name__ == "__main__":
    main()