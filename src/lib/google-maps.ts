/**
 * Google Maps API Utilities
 * Centralized utilities for Google Maps integration
 */

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  formatted?: string;
}

export interface PlaceResult {
  place_id: string;
  formatted_address: string;
  name?: string;
  geometry?: {
    location: google.maps.LatLng;
  };
  types: string[];
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  address: Address;
  coordinates: Coordinates;
  rating?: number;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  steps: google.maps.DirectionsStep[];
}

/**
 * Load Google Maps API
 */
export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.google?.maps) {
      resolve();
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      reject(new Error('Google Maps API key not found'));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps API'));
    
    document.head.appendChild(script);
  });
};

/**
 * Check if Google Maps API is loaded
 */
export const isGoogleMapsLoaded = (): boolean => {
  return typeof window !== 'undefined' && !!window.google?.maps;
};

/**
 * Geocode an address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve, reject) => {
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng()
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (coordinates: Coordinates): Promise<Address | null> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve) => {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(coordinates.lat, coordinates.lng);
    
    geocoder.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const result = results[0];
        const components = result.address_components;
        
        const address: Address = {
          formatted: result.formatted_address
        };

        components?.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number') || types.includes('route')) {
            address.street = (address.street || '') + ' ' + component.long_name;
          } else if (types.includes('locality')) {
            address.city = component.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            address.state = component.long_name;
          } else if (types.includes('postal_code')) {
            address.postalCode = component.long_name;
          } else if (types.includes('country')) {
            address.country = component.long_name;
          }
        });

        resolve(address);
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Calculate distance between two coordinates
 */
export const calculateDistance = (
  from: Coordinates,
  to: Coordinates,
  unit: 'km' | 'miles' = 'km'
): number => {
  const R = unit === 'km' ? 6371 : 3959; // Earth's radius
  const dLat = (to.lat - from.lat) * Math.PI / 180;
  const dLng = (to.lng - from.lng) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get directions between two points
 */
export const getDirections = async (
  origin: Coordinates | string,
  destination: Coordinates | string,
  travelMode: google.maps.TravelMode = google.maps.TravelMode.DRIVING
): Promise<DirectionsResult | null> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve) => {
    const directionsService = new google.maps.DirectionsService();
    
    directionsService.route({
      origin: typeof origin === 'string' ? origin : new google.maps.LatLng(origin.lat, origin.lng),
      destination: typeof destination === 'string' ? destination : new google.maps.LatLng(destination.lat, destination.lng),
      travelMode
    }, (result, status) => {
      if (status === 'OK' && result) {
        const route = result.routes[0];
        const leg = route.legs[0];
        
        resolve({
          distance: leg.distance?.text || '',
          duration: leg.duration?.text || '',
          steps: leg.steps || []
        });
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Search for places using Google Places API
 */
export const searchPlaces = async (
  query: string,
  options?: {
    types?: string[];
    componentRestrictions?: google.maps.places.ComponentRestrictions;
    location?: Coordinates;
    radius?: number;
  }
): Promise<PlaceResult[]> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve) => {
    const service = new google.maps.places.AutocompleteService();
    
    const request: google.maps.places.AutocompletionRequest = {
      input: query
    };

    if (options?.types) {
      request.types = options.types;
    }

    if (options?.componentRestrictions) {
      request.componentRestrictions = options.componentRestrictions;
    }

    if (options?.location) {
      request.location = new google.maps.LatLng(options.location.lat, options.location.lng);
      request.radius = options.radius || 50000;
    }

    service.getPlacePredictions(request, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        const places: PlaceResult[] = predictions.map(prediction => ({
          place_id: prediction.place_id,
          formatted_address: prediction.description,
          name: prediction.structured_formatting?.main_text,
          types: prediction.types
        }));
        resolve(places);
      } else {
        resolve([]);
      }
    });
  });
};

/**
 * Search for places using text search (legacy function)
 */
export const searchPlacesText = async (
  query: string,
  location?: Coordinates,
  radius?: number
): Promise<PlaceDetails[]> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve) => {
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);
    
    const request: google.maps.places.TextSearchRequest = {
      query
    };

    if (location) {
      request.location = new google.maps.LatLng(location.lat, location.lng);
      request.radius = radius || 50000; // 50km default
    }

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const places: PlaceDetails[] = results.map(place => ({
          placeId: place.place_id || '',
          name: place.name || '',
          address: {
            formatted: place.formatted_address
          },
          coordinates: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          },
          rating: place.rating
        }));
        resolve(places);
      } else {
        resolve([]);
      }
    });
  });
};

/**
 * Get place details by place ID
 */
export const getPlaceDetails = async (placeId: string): Promise<PlaceDetails | null> => {
  if (!isGoogleMapsLoaded()) {
    await loadGoogleMapsAPI();
  }

  return new Promise((resolve) => {
    const map = new google.maps.Map(document.createElement('div'));
    const service = new google.maps.places.PlacesService(map);
    
    service.getDetails({
      placeId,
      fields: ['name', 'formatted_address', 'geometry', 'rating', 'formatted_phone_number', 'website', 'opening_hours']
    }, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place) {
        resolve({
          placeId,
          name: place.name || '',
          address: {
            formatted: place.formatted_address
          },
          coordinates: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          },
          rating: place.rating,
          phoneNumber: place.formatted_phone_number,
          website: place.website,
          openingHours: place.opening_hours?.weekday_text
        });
      } else {
        resolve(null);
      }
    });
  });
};

/**
 * Create a map instance
 */
export const createMap = (
  element: HTMLElement,
  options: google.maps.MapOptions
): google.maps.Map => {
  return new google.maps.Map(element, options);
};

/**
 * Create a marker
 */
export const createMarker = (
  options: google.maps.MarkerOptions
): google.maps.Marker => {
  return new google.maps.Marker(options);
};

/**
 * Create an info window
 */
export const createInfoWindow = (
  options?: google.maps.InfoWindowOptions
): google.maps.InfoWindow => {
  return new google.maps.InfoWindow(options);
};

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

/**
 * Format distance for display
 */
export const formatDistance = (distance: number, unit: 'km' | 'miles' = 'km'): string => {
  if (distance < 1) {
    return unit === 'km' 
      ? `${Math.round(distance * 1000)}m`
      : `${Math.round(distance * 5280)}ft`;
  }
  return `${distance.toFixed(1)} ${unit}`;
};

/**
 * Get bounds for multiple coordinates
 */
export const getBounds = (coordinates: Coordinates[]): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();
  coordinates.forEach(coord => {
    bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
  });
  return bounds;
};

/**
 * Generate Google Maps URL for directions
 */
export const getDirectionsUrl = (
  origin: Coordinates | string,
  destination: Coordinates | string,
  travelMode: 'driving' | 'walking' | 'transit' | 'bicycling' = 'driving'
): string => {
  const originStr = typeof origin === 'string' 
    ? encodeURIComponent(origin)
    : `${origin.lat},${origin.lng}`;
  
  const destinationStr = typeof destination === 'string'
    ? encodeURIComponent(destination)
    : `${destination.lat},${destination.lng}`;

  return `https://www.google.com/maps/dir/${originStr}/${destinationStr}/@${destinationStr},15z/data=!3m1!4b1!4m2!4m1!3e${
    travelMode === 'driving' ? '0' :
    travelMode === 'walking' ? '2' :
    travelMode === 'transit' ? '3' :
    travelMode === 'bicycling' ? '1' : '0'
  }`;
};