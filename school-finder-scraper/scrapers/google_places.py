import json
from scrapers.base_scraper import BaseScraper

class GooglePlacesScraper(BaseScraper):
    def __init__(self, config):
        super().__init__(config)
        self.api_key = config['google_api_key']
        self.base_url = 'https://maps.googleapis.com/maps/api/place'
    
    def search_school(self, name, location=None):
        """Wyszukiwanie szkoły w Google Places API"""
        params = {
            'input': name,
            'inputtype': 'textquery',
            'fields': 'place_id,formatted_address,geometry,name,rating,user_ratings_total,photos',
            'key': self.api_key,
            'language': 'pl'
        }
        
        if location:
            params['locationbias'] = f'circle:2000@{location["lat"]},{location["lng"]}'
        
        response = self.fetch(f'{self.base_url}/findplacefromtext/json', params=params)
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('candidates'):
            place_id = data['candidates'][0]['place_id']
            return self.get_place_details(place_id)
        
        return None
    
    def get_place_details(self, place_id):
        """Pobieranie szczegółów miejsca z Google Places API"""
        params = {
            'place_id': place_id,
            'fields': 'address_component,formatted_address,geometry,name,photo,place_id,plus_code,type,url,utc_offset,vicinity,website,rating,review,user_ratings_total',
            'key': self.api_key,
            'language': 'pl'
        }
        
        response = self.fetch(f'{self.base_url}/details/json', params=params)
        data = response.json()
        
        if data.get('status') == 'OK' and data.get('result'):
            return self._format_place_data(data['result'])
        
        return None
    
    def _format_place_data(self, place_data):
        """Formatowanie danych z Google Places do formatu aplikacji"""
        result = {
            'google_place_id': place_data.get('place_id'),
            'name': place_data.get('name'),
            'address': place_data.get('formatted_address'),
            'location': {
                'lat': place_data.get('geometry', {}).get('location', {}).get('lat'),
                'lng': place_data.get('geometry', {}).get('location', {}).get('lng')
            },
            'rating': place_data.get('rating'),
            'ratings_count': place_data.get('user_ratings_total'),
            'website': place_data.get('website'),
            'photos': []
        }
        
        # Pobieranie URL zdjęć
        if 'photos' in place_data:
            for photo in place_data['photos'][:5]:  # Ograniczenie do 5 zdjęć
                photo_reference = photo.get('photo_reference')
                if photo_reference:
                    photo_url = f'{self.base_url}/photo?maxwidth=800&photoreference={photo_reference}&key={self.api_key}'
                    result['photos'].append(photo_url)
        
        return result