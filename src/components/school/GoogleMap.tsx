'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GoogleMapProps {
  address: {
    street?: string;
    city?: string;
    postalCode?: string;
    voivodeship?: string;
  };
  schoolName: string;
  className?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMap({ address, schoolName, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullAddress = [
    address.street,
    address.city,
    address.postalCode,
    address.voivodeship
  ].filter(Boolean).join(', ');

  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if Google Maps API key is available
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        setError('Google Maps API key not configured');
        return;
      }

      // Check if Google Maps is already loaded
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Load Google Maps script
      if (typeof document !== 'undefined') {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setIsLoaded(true);
          initializeMap();
        };
        
        script.onerror = () => {
          setError('Failed to load Google Maps');
        };

        document.head.appendChild(script);

        return () => {
          // Cleanup script if component unmounts
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }
    };

    const initializeMap = () => {
      if (!mapRef.current || !window.google) return;

      try {
        // Create geocoder
        const geocoder = new window.google.maps.Geocoder();
        
        // Geocode the address
        geocoder.geocode(
          { address: fullAddress + ', Poland' },
          (results: any[], status: string) => {
            if (status === 'OK' && results[0]) {
              const location = results[0].geometry.location;
              
              // Create map
              const mapInstance = new window.google.maps.Map(mapRef.current, {
                center: location,
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

              // Create marker
              const marker = new window.google.maps.Marker({
                position: location,
                map: mapInstance,
                title: schoolName,
                icon: {
                  url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="16" cy="16" r="12" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <path d="M16 8L20 12H18V20H14V12H12L16 8Z" fill="white"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(32, 32),
                  anchor: new window.google.maps.Point(16, 16)
                }
              });

              // Create info window
              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div style="padding: 8px; max-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${schoolName}</h3>
                    <p style="margin: 0; font-size: 12px; color: #666;">${fullAddress}</p>
                  </div>
                `
              });

              // Add click listener to marker
              marker.addListener('click', () => {
                infoWindow.open(mapInstance, marker);
              });

              setMap(mapInstance);
            } else {
              setError('Could not find location on map');
            }
          }
        );
      } catch (err) {
        setError('Error initializing map');
        console.error('Map initialization error:', err);
      }
    };

    loadGoogleMaps();
  }, [fullAddress, schoolName]);

  const openInGoogleMaps = () => {
    const encodedAddress = encodeURIComponent(fullAddress + ', Poland');
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  const getDirections = () => {
    const encodedAddress = encodeURIComponent(fullAddress + ', Poland');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
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
            <h3 className="text-lg font-semibold">Lokalizacja</h3>
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