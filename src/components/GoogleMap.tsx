"use client";

import React, { useCallback, memo, useEffect, useState } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { isGoogleMapsLoaded } from '@/lib/google-maps';

interface GoogleMapComponentProps {
  school: {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      voivodeship: string;
      postal?: string;
      postalCode?: string;
    };
    location?: {
      latitude: number;
      longitude: number;
    };
  };
  width?: string;
  height?: string;
  className?: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px'
};

const defaultOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Custom LoadScript component that checks if API is already loaded
const ConditionalLoadScript: React.FC<{ children: React.ReactNode; apiKey: string }> = ({ children, apiKey }) => {
  const [isApiLoaded, setIsApiLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (isGoogleMapsLoaded()) {
      setIsApiLoaded(true);
    } else {
      // If not loaded, we'll load it manually to avoid conflicts
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => setIsApiLoaded(true);
      script.onerror = () => console.error('Failed to load Google Maps API');
      
      // Only add script if it doesn't already exist
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        // If script exists but API not loaded, wait for it
        const checkLoaded = setInterval(() => {
          if (isGoogleMapsLoaded()) {
            setIsApiLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
      }
    }
  }, [apiKey]);

  if (!isApiLoaded) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-600">Loading map...</p>
      </div>
    );
  }

  return <>{children}</>;
};

const GoogleMapComponent: React.FC<GoogleMapComponentProps> = ({ 
  school, 
  width = '100%', 
  height = '400px',
  className = ''
}) => {
  const [showInfoWindow, setShowInfoWindow] = React.useState(false);
  const [isLoaded, setIsLoaded] = React.useState(false);

  const center = {
    lat: school.location?.latitude || 52.2297, // Default to Warsaw if no location
    lng: school.location?.longitude || 21.0122
  };

  const mapOptions = {
    ...defaultOptions,
    zoom: 15,
    center
  };

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setIsLoaded(true);
  }, []);

  const onMarkerClick = useCallback(() => {
    setShowInfoWindow(true);
  }, []);

  const onInfoWindowClose = useCallback(() => {
    setShowInfoWindow(false);
  }, []);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 text-center ${className}`}>
        <p className="text-red-600">Google Maps API key is not configured</p>
      </div>
    );
  }

  if (!school.location) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 text-center ${className}`}>
        <p className="text-gray-600">Location information not available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ConditionalLoadScript apiKey={apiKey}>
        <GoogleMap
          mapContainerStyle={{ ...mapContainerStyle, width, height }}
          options={mapOptions}
          onLoad={onMapLoad}
        >
          <Marker
            position={center}
            onClick={onMarkerClick}
            title={school.name}
          />
          
          {showInfoWindow && (
            <InfoWindow
              position={center}
              onCloseClick={onInfoWindowClose}
            >
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{school.name}</h3>
                <p className="text-xs text-gray-600">
                  {school.address.street}<br />
                  {school.address.city} {school.address.postal || school.address.postalCode}<br />
                  {school.address.voivodeship}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </ConditionalLoadScript>
    </div>
  );
};

export default memo(GoogleMapComponent);
