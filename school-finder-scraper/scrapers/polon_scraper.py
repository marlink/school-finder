from scrapers.base_scraper import BaseScraper
import json

class POLonScraper(BaseScraper):
    """Scraper do pobierania danych z API POL-on (System Informacji o Nauce i Szkolnictwie Wyższym)"""
    
    def __init__(self, config):
        super().__init__(config)
        self.api_url = config.get('polon_api_url', 'https://polon.nauka.gov.pl/opi-ws/api/')
        self.api_key = config.get('polon_api_key')
        self.headers.update({
            'X-API-Key': self.api_key,
            'Content-Type': 'application/json'
        })
    
    def get_university_list(self, limit=None):
        """Pobieranie listy uczelni z POL-on"""
        params = {}
        if limit:
            params['limit'] = limit
            
        response = self.fetch(f'{self.api_url}institutions', params=params)
        data = response.json()
        
        universities = []
        for item in data.get('institutions', []):
            university = {
                'name': item.get('name'),
                'rspo': item.get('uid'),  # Używamy UID jako identyfikatora RSPO
                'type': 'university',
                'address': self._format_address(item.get('address', {})),
                'url': item.get('website')
            }
            universities.append(university)
            
        return universities
    
    def get_university_details(self, uid):
        """Pobieranie szczegółów uczelni z POL-on"""
        response = self.fetch(f'{self.api_url}institution/{uid}')
        data = response.json()
        
        if not data:
            return None
            
        details = {
            'name': data.get('name'),
            'rspo': data.get('uid'),
            'type': 'university',
            'address': self._format_address(data.get('address', {})),
            'description': data.get('description', ''),
            'contact': {
                'phone': data.get('phone', ''),
                'email': data.get('email', ''),
                'website': data.get('website', '')
            },
            'location': {
                'lat': data.get('location', {}).get('latitude'),
                'lng': data.get('location', {}).get('longitude')
            },
            'principal': data.get('rector', {}).get('name', ''),
            # Dodatkowe pola specyficzne dla uczelni wyższych
            'founding_date': data.get('foundingDate'),
            'students_count': data.get('studentsCount'),
            'faculties': [faculty.get('name') for faculty in data.get('faculties', [])],
            'courses': [course.get('name') for course in data.get('courses', [])]
        }
        
        return details
    
    def _format_address(self, address):
        """Formatowanie adresu z POL-on"""
        if not address:
            return ''
            
        return f"{address.get('street', '')} {address.get('buildingNumber', '')}, {address.get('postalCode', '')} {address.get('city', '')}"