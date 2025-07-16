'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { getRatingColor, getContrastColor } from '@/utils/mapUtils'

interface SchoolMarkerProps {
  map: mapboxgl.Map
  longitude: number
  latitude: number
  schoolName: string
  schoolId: string
  rating?: number
  onClick?: (schoolId: string) => void
}

export default function SchoolMarker({
  map,
  longitude,
  latitude,
  schoolName,
  schoolId,
  rating,
  onClick
}: SchoolMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null)

  useEffect(() => {
    if (!map) return

    // Get color based on rating
    const backgroundColor = getRatingColor(rating);
    const textColor = getContrastColor(backgroundColor);
    
    // Create marker element
    const el = document.createElement('div');
    el.className = 'school-marker';
    
    // Detect if we're on a mobile device by checking screen width
    const isMobile = window.innerWidth < 768;
    const markerSize = isMobile ? '32px' : '36px';
    const fontSize = isMobile ? '12px' : '14px';
    
    el.style.width = markerSize;
    el.style.height = markerSize;
    el.style.borderRadius = '50%';
    el.style.backgroundColor = backgroundColor;
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.color = textColor;
    el.style.fontWeight = 'bold';
    el.style.fontSize = fontSize;
    el.style.touchAction = 'manipulation';
    
    // Add rating text if available
    if (rating) {
      el.textContent = rating.toFixed(1);
    } else {
      el.textContent = 'N/A';
    }

    // Add school name as title (shows on hover)
    el.title = schoolName;

    // Create and add the marker
    markerRef.current = new mapboxgl.Marker(el)
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Add click handler
    el.addEventListener('click', () => {
      if (onClick) onClick(schoolId);
    });

    // Cleanup function
    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
    };
  }, [map, longitude, latitude, schoolName, schoolId, rating]); // Usunięto onClick z zależności

  return null;
}