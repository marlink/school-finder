'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink, Clock, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  loadGoogleMapsAPI, 
  geocodeAddress, 
  createMap, 
  createMarker, 
  createInfoWindow, 
  getCurrentLocation, 
  calculateDistance,
  formatDistance,
  getDirectionsUrl,
  type Coordinates 
} from '@/lib/google-maps';
import { type SchoolAddress } from '@/types/school';

interface GoogleMapProps {
  address: SchoolAddress;
  schoolName: string;
  location?: Coordinates;
  placeId?: string;
  className?: string;
}

export function GoogleMap({ address, schoolName, location, placeId, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  const fullAddress = [
    address.street,
    address.city,
    address.postalCode,
    address.voivodeship,
    address.country || 'Poland'
  ].filter(Boolean).join(', ');

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoaded(false);
        await loadGoogleMapsAPI();

        if (!mapRef.current) return;

        let coordinates: Coordinates | null = null;

        // Use provided location or geocode address
        if (location) {
          coordinates = location;
        } else {
          coordinates = await geocodeAddress(fullAddress);
        }

        if (!coordinates) {
          setError('Could not find location on map');
          return;
        }

        // Create map instance
        const mapInstance = createMap(mapRef.current, {
          center: coordinates,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Create custom marker icon
        const markerIcon = {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
              <path d="M16 8L20 12H18V20H14V12H12L16 8Z" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(32, 32),
          anchor: new google.maps.Point(16, 16)
        };

        // Create marker
        const marker = createMarker({
          position: coordinates,
          map: mapInstance,
          title: schoolName,
          icon: markerIcon
        });

        // Create info window with enhanced content
        const infoWindow = createInfoWindow({
          content: `
            <div style="padding: 12px; max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${schoolName}</h3>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">${fullAddress}</p>
              ${distance ? `<p style="margin: 0; font-size: 12px; color: #3b82f6; font-weight: 500;">📍 ${distance} od Twojej lokalizacji</p>` : ''}
            </div>
          `
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          infoWindow.open(mapInstance, marker);
        });

        setMap(mapInstance);
        setIsLoaded(true);

        // Try to get user location for distance calculation
        try {
          const userCoords = await getCurrentLocation();
          setUserLocation(userCoords);
          
          const distanceKm = calculateDistance(userCoords, coordinates);
          setDistance(formatDistance(distanceKm));
        } catch (err) {
          // User location not available, continue without it
          console.log('User location not available:', err);
        }

      } catch (err) {
        setError('Error loading map');
        console.error('Map initialization error:', err);
      }
    };

    initializeMap();
  }, [fullAddress, schoolName, location]);

  const openInGoogleMaps = () => {
    if (location) {
      window.open(`https://www.google.com/maps/place/${location.lat},${location.lng}`, '_blank');
    } else {
      const encodedAddress = encodeURIComponent(fullAddress);
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  };

  const getDirections = () => {
    const destination = location ? location : fullAddress;
    const directionsUrl = getDirectionsUrl('', destination, 'driving');
    window.open(directionsUrl, '_blank');
  };

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <MapPin className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Lokalizacja</h3>
        </div>
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium">{fullAddress}</p>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={openInGoogleMaps}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Otwórz w Google Maps
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={getDirections}
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                Wyznacz trasę
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold">Lokalizacja</h3>
              {distance && (
                <p className="text-sm text-blue-600 font-medium">{distance} od Ciebie</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openInGoogleMaps}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Google Maps
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={getDirections}
              className="flex items-center gap-2"
            >
              <Navigation className="h-4 w-4" />
              Trasa
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{fullAddress}</p>
      </div>
      
      <div className="relative">
        <div
          ref={mapRef}
          className="w-full h-64 bg-gray-100"
          style={{ minHeight: '256px' }}
        />
        
        {!isLoaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Ładowanie mapy...</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}