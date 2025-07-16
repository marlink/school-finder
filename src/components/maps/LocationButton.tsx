'use client'

import { useState } from 'react'
import mapboxgl from 'mapbox-gl'

interface LocationButtonProps {
  map: mapboxgl.Map
}

export default function LocationButton({ map }: LocationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userMarker, setUserMarker] = useState<mapboxgl.Marker | null>(null)
  
  const handleGetLocation = () => {
    setLoading(true)
    setError(null)
    
    // Check if geolocation is supported by the browser
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }
    
    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        
        // Remove existing marker if any
        if (userMarker) {
          userMarker.remove()
        }
        
        // Inside the handleGetLocation function, replace the marker creation with:
        
        // Create a DOM element for the marker
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.backgroundImage = 'url(/user-location.svg)';
        el.style.width = '24px';
        el.style.height = '24px';
        el.style.backgroundSize = '100%';
        
        // Create a new marker for user location
        const marker = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .addTo(map);
        
        // Save marker reference for later removal
        setUserMarker(marker)
        
        // Fly to user location with animation
        map.flyTo({
          center: [longitude, latitude],
          zoom: 14,
          essential: true
        })
        
        setLoading(false)
      },
      (err) => {
        setError(`Error getting location: ${err.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }
  
  return (
    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
      <button
        onClick={handleGetLocation}
        disabled={loading}
        className="bg-white p-2 sm:p-3 rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
        title="Show my location"
        aria-label="Show my location"
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
      {error && (
        <div className="mt-2 bg-red-100 text-red-700 p-2 rounded-md text-xs max-w-[200px] sm:max-w-none shadow-md">
          {error}
        </div>
      )}
    </div>
  )
}