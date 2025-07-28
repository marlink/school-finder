"use client";

import React, { useCallback, memo } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { School } from '@/types/school';

interface GoogleMapComponentProps {
  school: School;
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
      <LoadScript googleMapsApiKey={apiKey}>
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
                  {school.address.city} {school.address.postal}<br />
                  {school.address.voivodeship}
                </p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default memo(GoogleMapComponent);
