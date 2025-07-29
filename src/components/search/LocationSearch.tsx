'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Loader2, 
  AlertCircle,
  Target,
  X
} from 'lucide-react';
import { 
  loadGoogleMapsAPI,
  getCurrentLocation,
  geocodeAddress,
  reverseGeocode,
  searchPlaces,
  formatDistance,
  type Coordinates,
  type PlaceResult
} from '@/lib/google-maps';
import { type SchoolSearchFilters } from '@/types/school';

interface LocationSearchProps {
  onFiltersChange: (filters: Partial<SchoolSearchFilters>) => void;
  currentFilters: SchoolSearchFilters;
  className?: string;
}

export function LocationSearch({ 
  onFiltersChange, 
  currentFilters, 
  className = '' 
}: LocationSearchProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('');
  const [maxDistance, setMaxDistance] = useState<number[]>([currentFilters.maxDistance || 10]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Google Maps API
    loadGoogleMapsAPI().catch(err => {
      console.error('Failed to load Google Maps API:', err);
      setError('Failed to load location services');
    });
  }, []);

  useEffect(() => {
    // Update local state when filters change externally
    if (currentFilters.maxDistance !== undefined) {
      setMaxDistance([currentFilters.maxDistance]);
    }
    if (currentFilters.userLocation) {
      setCurrentLocation(currentFilters.userLocation);
      if (currentFilters.userLocation.address) {
        setCurrentAddress(currentFilters.userLocation.address);
        setLocationInput(currentFilters.userLocation.address);
      }
    }
  }, [currentFilters]);

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getCurrentLocation();
      const addressObj = await reverseGeocode(location);
      const addressString = addressObj?.formatted || '';
      
      setCurrentLocation(location);
      setCurrentAddress(addressString);
      setLocationInput(addressString);
      
      onFiltersChange({
        userLocation: { ...location, address: addressString || undefined },
        maxDistance: maxDistance[0]
      });
    } catch (err) {
      setError('Unable to get your current location. Please enter an address manually.');
      console.error('Geolocation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationInputChange = async (value: string) => {
    setLocationInput(value);
    
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const places = await searchPlaces(value, {
        types: ['geocode'],
        componentRestrictions: { country: 'pl' }
      });
      
      setSuggestions(places.slice(0, 5));
      setShowSuggestions(true);
    } catch (err) {
      console.error('Places search error:', err);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = async (place: PlaceResult) => {
    setLocationInput(place.formatted_address);
    setShowSuggestions(false);
    setIsLoading(true);

    try {
      let coordinates: Coordinates;
      
      if (place.geometry?.location) {
        coordinates = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
      } else {
        coordinates = await geocodeAddress(place.formatted_address);
      }

      setCurrentLocation(coordinates);
      setCurrentAddress(place.formatted_address);
      
      onFiltersChange({
        userLocation: { ...coordinates, address: place.formatted_address },
        maxDistance: maxDistance[0]
      });
    } catch (err) {
      setError('Unable to get coordinates for this location');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationInput.trim()) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const coordinates = await geocodeAddress(locationInput);
      setCurrentLocation(coordinates);
      setCurrentAddress(locationInput);
      
      onFiltersChange({
        userLocation: { ...coordinates, address: locationInput },
        maxDistance: maxDistance[0]
      });
    } catch (err) {
      setError('Unable to find this location. Please try a different address.');
      console.error('Geocoding error:', err);
    } finally {
      setIsLoading(false);
      setShowSuggestions(false);
    }
  };

  const handleDistanceChange = (value: number[]) => {
    setMaxDistance(value);
    if (currentLocation) {
      onFiltersChange({
        userLocation: { ...currentLocation, address: currentAddress },
        maxDistance: value[0]
      });
    }
  };

  const clearLocation = () => {
    setLocationInput('');
    setCurrentLocation(null);
    setCurrentAddress('');
    setSuggestions([]);
    setShowSuggestions(false);
    
    onFiltersChange({
      userLocation: undefined,
      maxDistance: undefined
    });
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Wyszukiwanie według lokalizacji
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location">Twoja lokalizacja</Label>
          <div className="relative">
            <form onSubmit={handleLocationSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  id="location"
                  type="text"
                  placeholder="Wpisz adres, miasto lub kod pocztowy..."
                  value={locationInput}
                  onChange={(e) => handleLocationInputChange(e.target.value)}
                  className="pr-8"
                />
                {locationInput && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={clearLocation}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Target className="h-4 w-4" />
                )}
                Moja lokalizacja
              </Button>
              
              <Button
                type="submit"
                size="sm"
                disabled={isLoading || !locationInput.trim()}
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Szukaj
              </Button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((place, index) => (
                  <button
                    key={index}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 text-sm"
                    onClick={() => handleSuggestionSelect(place)}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{place.formatted_address}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Location Display */}
        {currentLocation && currentAddress && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Navigation className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900">Wybrana lokalizacja:</p>
                <p className="text-sm text-blue-700 truncate">{currentAddress}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLocation}
                className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Distance Slider */}
        {currentLocation && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Maksymalny promień wyszukiwania</Label>
              <Badge variant="secondary">
                {formatDistance(maxDistance[0] * 1000)}
              </Badge>
            </div>
            <Slider
              value={maxDistance}
              onValueChange={handleDistanceChange}
              max={50}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>1 km</span>
              <span>25 km</span>
              <span>50 km</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!currentLocation && !error && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Użyj przycisku &quot;Moja lokalizacja&quot; aby automatycznie wykryć swoją pozycję</p>
            <p>• Lub wpisz adres, nazwę miasta lub kod pocztowy</p>
            <p>• Wyszukiwanie będzie pokazywać szkoły w wybranym promieniu</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}