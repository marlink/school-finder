class SchoolSchema:
    """
    Klasa odpowiedzialna za walidację i normalizację danych szkół
    """
    def __init__(self):
        self.required_fields = ['name', 'rspo']
        self.optional_fields = [
            'address', 'type', 'url', 'description', 'principal',
            'contact', 'location', 'region', 'county', 'community',
            'place_id', 'rating', 'ratings_count', 'website', 'photos',
            # Pola specyficzne dla uczelni wyższych
            'founding_date', 'students_count', 'faculties', 'courses'
        ]
    
    def validate(self, school_data):
        """
        Walidacja i normalizacja danych szkoły
        
        Args:
            school_data (dict): Dane szkoły do walidacji
            
        Returns:
            dict: Znormalizowane dane szkoły lub None, jeśli dane są nieprawidłowe
        """
        # Sprawdzenie wymaganych pól
        for field in self.required_fields:
            if field not in school_data or not school_data[field]:
                print(f"Brak wymaganego pola: {field}")
                return None
        
        # Normalizacja danych
        normalized_data = {}
        
        # Dodanie wszystkich dostępnych pól
        for field in self.required_fields + self.optional_fields:
            if field in school_data and school_data[field]:
                normalized_data[field] = school_data[field]
        
        # Normalizacja RSPO - upewnienie się, że jest to string
        if 'rspo' in normalized_data:
            normalized_data['rspo'] = str(normalized_data['rspo'])
        
        # Normalizacja typu szkoły
        if 'type' in normalized_data:
            normalized_data['type'] = self._normalize_school_type(normalized_data['type'])
        
        return normalized_data
    
    def _normalize_school_type(self, school_type):
        """
        Normalizacja typu szkoły do standardowego formatu
        
        Args:
            school_type (str): Oryginalny typ szkoły
            
        Returns:
            str: Znormalizowany typ szkoły
        """
        # Mapowanie typów szkół do standardowych wartości
        type_mapping = {
            'szkoła podstawowa': 'primary',
            'liceum ogólnokształcące': 'high_school',
            'technikum': 'technical',
            'branżowa szkoła i stopnia': 'vocational',
            'branżowa szkoła ii stopnia': 'vocational_2',
            'szkoła policealna': 'post_secondary',
            'przedszkole': 'preschool',
            # Typy uczelni wyższych
            'uniwersytet': 'university',
            'politechnika': 'technical_university',
            'akademia': 'academy',
            'wyższa szkoła': 'college',
            'uczelnia': 'university'
        }
        
        # Sprawdzenie, czy typ szkoły pasuje do któregoś z kluczy
        school_type_lower = school_type.lower()
        for key, value in type_mapping.items():
            if key in school_type_lower:
                return value
        
        # Jeśli nie znaleziono dopasowania, zwróć oryginalną wartość
        return school_type