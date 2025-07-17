from supabase import create_client
import json

class SupabaseClient:
    def __init__(self, config):
        self.url = config['supabase_url']
        self.key = config['supabase_key']
        self.client = create_client(self.url, self.key)
    
    def upsert_schools(self, schools):
        """Dodawanie lub aktualizacja szkół w bazie danych"""
        # Konwersja danych do formatu zgodnego z bazą danych
        formatted_schools = []
        for school in schools:
            formatted_school = {
                'name': school.get('name'),
                'address': school.get('address'),
                'type': school.get('type'),
                'rspo': school.get('rspo'),
                'description': school.get('description', ''),
                'principal': school.get('principal', ''),
                'contact_info': json.dumps(school.get('contact', {})),
                'location': json.dumps(school.get('location', {})),
                'google_place_id': school.get('google_place_id', ''),
                'rating': school.get('rating'),
                'ratings_count': school.get('ratings_count', 0),
                'website': school.get('website', ''),
                'photos': json.dumps(school.get('photos', [])),
                # Pola specyficzne dla uczelni wyższych
                'founding_date': school.get('founding_date'),
                'students_count': school.get('students_count'),
                'faculties': json.dumps(school.get('faculties', [])),
                'courses': json.dumps(school.get('courses', [])),
                'last_updated': 'NOW()'
            }
            formatted_schools.append(formatted_school)
        
        # Upsert do tabeli schools
        result = self.client.table('schools').upsert(
            formatted_schools, 
            on_conflict='rspo'  # Klucz, po którym identyfikujemy duplikaty
        ).execute()
        
        return result
    
    def get_existing_schools(self):
        """Pobieranie istniejących szkół z bazy danych"""
        result = self.client.table('schools').select('rspo, name, address, last_updated').execute()
        return result.data if hasattr(result, 'data') else []
    
    def update_scraping_status(self, status, details=None):
        """Aktualizacja statusu scrapowania w bazie danych"""
        data = {
            'status': status,
            'last_run': 'NOW()',
            'details': json.dumps(details) if details else None
        }
        
        result = self.client.table('scraping_status').upsert(data).execute()
        return result