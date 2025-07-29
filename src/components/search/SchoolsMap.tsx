"use client";

import { useEffect, useRef, useState } from 'react';
import { MapPin, Star, Users, ExternalLink, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { loadGoogleMapsAPI } from '@/lib/google-maps';

interface School {
  id: string;
  name: string;
  type: string;
  city: string;
  voivodeship: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  establishedYear?: number;
  description?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface SchoolsMapProps {
  schools: School[];
  center?: { lat: number; lng: number };
  zoom?: number;
  className?: string;
  onSchoolSelect?: (school: School) => void;
}

export default function SchoolsMap({
  schools,
  center = { lat: 52.2297, lng: 21.0122 }, // Warsaw default
  zoom = 10,
  className = "",
  onSchoolSelect
}: SchoolsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const initMap = () => {
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center,
        zoom,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      setMap(mapInstance);

      // Create info window
      infoWindowRef.current = new google.maps.InfoWindow();
    };

    // Load Google Maps API using centralized function
    loadGoogleMapsAPI().then(() => {
      initMap();
    }).catch((error) => {
      console.error('Failed to load Google Maps API:', error);
    });
  }, [center, zoom, map]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.log('Error getting user location:', error);
        }
      );
    }
  }, []);

  // Add user location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    const userMarker = new google.maps.Marker({
      position: userLocation,
      map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      }
    });

    return () => {
      userMarker.setMap(null);
    };
  }, [map, userLocation]);

  // Add school markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add new markers
    schools.forEach(school => {
      if (!school.latitude || !school.longitude) return;

      const marker = new google.maps.Marker({
        position: { lat: school.latitude, lng: school.longitude },
        map,
        title: school.name,
        icon: {
          path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: getMarkerColor(school.type),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1,
          rotation: 180
        }
      });

      marker.addListener('click', () => {
        setSelectedSchool(school);
        onSchoolSelect?.(school);
        
        // Show info window
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(createInfoWindowContent(school));
          infoWindowRef.current.open(map, marker);
        }
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (schools.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      schools.forEach(school => {
        if (school.latitude && school.longitude) {
          bounds.extend({ lat: school.latitude, lng: school.longitude });
        }
      });
      
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
      map.fitBounds(bounds);
    }
  }, [map, schools, onSchoolSelect, userLocation]);

  const getMarkerColor = (schoolType: string): string => {
    const colors: { [key: string]: string } = {
      'Przedszkole': '#FF6B6B',
      'Szkoła podstawowa': '#4ECDC4',
      'Gimnazjum': '#45B7D1',
      'Liceum': '#96CEB4',
      'Technikum': '#FFEAA7',
      'Szkoła zawodowa': '#DDA0DD',
      'Szkoła policealna': '#98D8C8',
      'Uniwersytet': '#F7DC6F'
    };
    return colors[schoolType] || '#6C5CE7';
  };

  const createInfoWindowContent = (school: School): string => {
    return `
      <div style="max-width: 300px; padding: 8px;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${school.name}</h3>
        <div style="margin-bottom: 8px;">
          <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${school.type}</span>
        </div>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${school.address}</p>
        ${school.rating ? `
          <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
            <span style="color: #fbbf24;">★</span>
            <span style="font-size: 14px; font-weight: 500;">${school.rating.toFixed(1)}</span>
            ${school.reviewCount ? `<span style="font-size: 12px; color: #666;">(${school.reviewCount} reviews)</span>` : ''}
          </div>
        ` : ''}
        ${school.studentCount ? `
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
            👥 ${school.studentCount.toLocaleString()} students
          </p>
        ` : ''}
        <div style="display: flex; gap: 8px; margin-top: 12px;">
          <a href="/schools/${school.id}" style="background: #3b82f6; color: white; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">View Details</a>
          ${school.website ? `<a href="${school.website}" target="_blank" style="background: #6b7280; color: white; padding: 4px 12px; border-radius: 4px; text-decoration: none; font-size: 12px;">Website</a>` : ''}
        </div>
      </div>
    `;
  };

  const centerOnUserLocation = () => {
    if (map && userLocation) {
      map.setCenter(userLocation);
      map.setZoom(12);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-200 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Map */}
      <div ref={mapRef} className="w-full h-96 rounded-lg" />

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        {userLocation && (
          <Button
            size="sm"
            variant="secondary"
            onClick={centerOnUserLocation}
            className="bg-white shadow-md hover:bg-gray-50"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h4 className="font-medium text-sm mb-2">School Types</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {Object.entries({
            'Przedszkole': '#FF6B6B',
            'Szkoła podstawowa': '#4ECDC4',
            'Gimnazjum': '#45B7D1',
            'Liceum': '#96CEB4',
            'Technikum': '#FFEAA7',
            'Szkoła zawodowa': '#DDA0DD',
            'Szkoła policealna': '#98D8C8',
            'Uniwersytet': '#F7DC6F'
          }).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-gray-600">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected School Card */}
      {selectedSchool && (
        <div className="absolute top-4 left-4 max-w-sm">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{selectedSchool.name}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSchool(null)}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedSchool.type}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedSchool.city}</span>
                  </div>
                </div>

                {selectedSchool.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {renderStars(selectedSchool.rating)}
                    </div>
                    <span className="text-sm font-medium">{selectedSchool.rating.toFixed(1)}</span>
                    {selectedSchool.reviewCount && (
                      <span className="text-xs text-gray-500">
                        ({selectedSchool.reviewCount})
                      </span>
                    )}
                  </div>
                )}

                {selectedSchool.studentCount && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{selectedSchool.studentCount.toLocaleString()} students</span>
                  </div>
                )}

                {selectedSchool.distance && (
                  <div className="text-sm text-gray-600">
                    Distance: {selectedSchool.distance.toFixed(1)} km
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Link href={`/schools/${selectedSchool.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                  {selectedSchool.website && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={selectedSchool.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stats */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3">
        <div className="text-sm">
          <div className="font-medium">{schools.length} schools</div>
          <div className="text-gray-600 text-xs">
            {schools.filter(s => s.latitude && s.longitude).length} with location
          </div>
        </div>
      </div>
    </div>
  );
}