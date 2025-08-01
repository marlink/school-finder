// Test data for search suggestions - Poznań area
export const testSchoolNames = [
  "Liceum Ogólnokształcące im. Adama Mickiewicza",
  "Szkoła Podstawowa nr 42 im. Janusza Korczaka", 
  "Technikum Informatyczne",
  "Liceum Ogólnokształcące w Swarzędzu",
  "Szkoła Podstawowa w Luboniu",
  "Zespół Szkół w Kostrzynie",
  "Liceum w Puszczykowie",
  "Szkoła Podstawowa w Murowanej Goślinie",
  "Technikum Mechaniczne w Kórniku",
  "Szkoła Podstawowa w Dopiewie",
  "Gimnazjum nr 15 w Poznaniu",
  "Liceum Sportowe w Poznaniu",
  "Szkoła Muzyczna w Poznaniu",
  "Technikum Gastronomiczne",
  "Liceum Plastyczne"
];

export const testCities = [
  "Poznań",
  "Swarzędz", 
  "Luboń",
  "Kostrzyn",
  "Puszczykowo",
  "Murowana Goślina",
  "Kórnik",
  "Dopiewo",
  "Tarnowo Podgórne",
  "Czerwonak",
  "Suchy Las",
  "Rokietnica",
  "Stęszew",
  "Mosina",
  "Komorniki"
];

export const testRegions = [
  "Wielkopolskie",
  "Mazowieckie", 
  "Śląskie",
  "Małopolskie",
  "Dolnośląskie",
  "Pomorskie",
  "Łódzkie",
  "Lubelskie",
  "Podkarpackie",
  "Warmińsko-Mazurskie",
  "Zachodniopomorskie",
  "Lubuskie",
  "Kujawsko-Pomorskie",
  "Podlaskie",
  "Opolskie",
  "Świętokrzyskie"
];

export const testSchoolTypes = [
  "Liceum Ogólnokształcące",
  "Szkoła Podstawowa",
  "Technikum",
  "Gimnazjum", 
  "Zespół Szkół",
  "Liceum Sportowe",
  "Szkoła Muzyczna",
  "Liceum Plastyczne",
  "Technikum Gastronomiczne",
  "Szkoła Zawodowa"
];

// Types for suggestions
export interface TestSuggestion {
  text: string;
  type: 'school' | 'city' | 'region' | 'schoolType';
  category: string;
}

// Function to get suggestions based on query
export function getTestSuggestions(query: string, maxResults: number = 8): TestSuggestion[] {
  if (!query || query.length < 1) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  const suggestions: TestSuggestion[] = [];
  
  // Search in school names
  testSchoolNames.forEach(name => {
    if (name.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        text: name,
        type: 'school',
        category: 'Schools'
      });
    }
  });
  
  // Search in cities
  testCities.forEach(city => {
    if (city.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        text: city,
        type: 'city',
        category: 'Cities'
      });
    }
  });
  
  // Search in regions
  testRegions.forEach(region => {
    if (region.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        text: region,
        type: 'region', 
        category: 'Regions'
      });
    }
  });
  
  // Search in school types
  testSchoolTypes.forEach(type => {
    if (type.toLowerCase().includes(normalizedQuery)) {
      suggestions.push({
        text: type,
        type: 'schoolType',
        category: 'School Types'
      });
    }
  });
  
  // Remove duplicates and limit results
  const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
    index === self.findIndex(s => s.text === suggestion.text)
  );
  
  return uniqueSuggestions.slice(0, maxResults);
}