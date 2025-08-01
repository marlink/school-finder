'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  loadGoogleMapsAPI, 
  createMap, 
  createMarker, 
  createInfoWindow,
  getDirectionsUrl,
  type Coordinates 
} from '@/lib/google-maps';
import { type School } from '@/types/school';

interface SchoolsMapProps {
  schools: School[];
  className?: string;
  height?: string;
  showControls?: boolean;
  selectedSchoolId?: string;
  onSchoolSelect?: (school: School) => void;
}

export function SchoolsMap({ 
  schools, 
  className = '', 
  height = '500px',
  showControls = true,
  selectedSchoolId,
  onSchoolSelect 
}: SchoolsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoaded(false);
        await loadGoogleMapsAPI();

        if (!mapRef.current || schools.length === 0) return;

        // Filter schools with valid coordinates
        const validSchools = schools.filter(school => 
          school.location?.latitude && school.location?.longitude
        );

        if (validSchools.length === 0) {
          // Default to Poland center if no coordinates
          const polandCenter: Coordinates = { lat: 52.0693, lng: 19.4803 };
          
          const mapInstance = createMap(mapRef.current, {
            center: polandCenter,
            zoom: 6,
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

          setMap(mapInstance);
          setError('No schools with coordinates found');
          return;
        }

        // Calculate bounds for all schools
        const bounds = new google.maps.LatLngBounds();
        validSchools.forEach(school => {
          if (school.location) {
            bounds.extend(new google.maps.LatLng(
              school.location.latitude,
              school.location.longitude
            ));
          }
        });

        // Create map
        const mapInstance = createMap(mapRef.current, {
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

        // Fit map to bounds
        mapInstance.fitBounds(bounds);

        // Create markers for each school
        const newMarkers: google.maps.Marker[] = [];
        const infoWindow = createInfoWindow();

        validSchools.forEach((school) => {
          if (!school.location) return;

          const position: Coordinates = {
            lat: school.location.latitude,
            lng: school.location.longitude
          };

          // Create marker with custom icon
          const markerIcon = {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="12" fill="${selectedSchoolId === school.id ? '#EF4444' : '#3B82F6'}" stroke="white" stroke-width="2"/>
                <path d="M16 8L20 12H18V20H14V12H12L16 8Z" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(32, 32),
            anchor: new google.maps.Point(16, 16)
          };

          const marker = createMarker({
            position,
            map: mapInstance,
            title: school.name,
            icon: markerIcon
          });

          // Create info window content
          const address = school.address;
          const fullAddress = [
            address?.street,
            address?.city,
            address?.postalCode,
            address?.voivodeship
          ].filter(Boolean).join(', ');

          const googleRating = school.ratings?.google;

          const infoContent = `
            <div style="padding: 12px; max-width: 280px; font-family: system-ui, -apple-system, sans-serif;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #1f2937;">${school.name}</h3>
              <div style="margin-bottom: 8px;">
                <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">${school.type}</span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280; line-height: 1.4;">${fullAddress}</p>
              ${school.studentCount ? `<p style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;"><strong>Uczniowie:</strong> ${school.studentCount}</p>` : ''}
              ${googleRating ? `<p style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;"><strong>Ocena Google:</strong> ${googleRating}/5</p>` : ''}
              <div style="display: flex; gap: 8px; margin-top: 12px;">
                <a href="/schools/${school.id}" style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">Zobacz szczegóły</a>
                <a href="${getDirectionsUrl('', position, 'driving')}" target="_blank" style="background: #f3f4f6; color: #374151; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: 500;">Trasa</a>
              </div>
            </div>
          `;

          // Add click listener to marker
          marker.addListener('click', () => {
            infoWindow.setContent(infoContent);
            infoWindow.open(mapInstance, marker);
            setSelectedSchool(school);
            if (onSchoolSelect) {
              onSchoolSelect(school);
            }
          });

          newMarkers.push(marker);
        });

        setMarkers(newMarkers);
        setMap(mapInstance);
        setIsLoaded(true);

        // If a specific school is selected, open its info window
        if (selectedSchoolId) {
          const selectedIndex = validSchools.findIndex(s => s.id === selectedSchoolId);
          if (selectedIndex >= 0 && newMarkers[selectedIndex]) {
            google.maps.event.trigger(newMarkers[selectedIndex], 'click');
          }
        }

      } catch (err) {
        setError('Error loading map');
        console.error('Map initialization error:', err);
      }
    };

    initializeMap();
  }, [schools, selectedSchoolId, onSchoolSelect]);

  const openInGoogleMaps = () => {
    if (schools.length === 1) {
      const school = schools[0];
      if (school.location) {
        window.open(`https://www.google.com/maps/search/?api=1&query=${school.location.latitude},${school.location.longitude}`, '_blank');
      } else {
        const address = school.address;
        const fullAddress = [
          address?.street,
          address?.city,
          address?.postalCode,
          address?.voivodeship
        ].filter(Boolean).join(', ');
        const encodedAddress = encodeURIComponent(fullAddress);
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
      }
    } else {
      // Open Google Maps with search for schools in the area
      window.open('https://www.google.com/maps/search/szkoły+podstawowe+polska', '_blank');
    }
  };

  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Mapa szkół
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            {showControls && (
              <Button
                variant="outline"
                onClick={openInGoogleMaps}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Otwórz w Google Maps
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Mapa szkół ({schools.length})
          </CardTitle>
          {showControls && (
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
            </div>
          )}
        </div>
        {selectedSchool && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Wybrana: {selectedSchool.name}
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full bg-gray-100"
            style={{ height }}
          />
          
          {!isLoaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Ładowanie mapy...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}