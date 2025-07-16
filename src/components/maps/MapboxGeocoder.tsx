'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'
import './mapbox-geocoder-responsive.css'

interface MapboxGeocoderProps {
  map: mapboxgl.Map
  onSearch: (searchTerm: string | null) => void
  placeholder?: string
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}

export default function MapboxGeocoderControl({
  map,
  onSearch,
  placeholder = 'Search for schools, addresses, or places...',
  position = 'top-left'
}: MapboxGeocoderProps) {
  const geocoderRef = useRef<MapboxGeocoder | null>(null)

  useEffect(() => {
    if (!map || geocoderRef.current) return

    // Initialize the geocoder
    geocoderRef.current = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false, // Don't add a marker when a result is selected
      placeholder: placeholder,
      countries: 'pl', // Limit results to Poland
      language: 'pl', // Use Polish language
      bbox: [14.12, 49.0, 24.15, 55.0], // Bounding box for Poland
      proximity: { longitude: 19.134422, latitude: 52.215933 }, // Center of Poland for better local results
    })

    // Add the geocoder to the map
    map.addControl(geocoderRef.current, position)

    // Zapisz referencję do funkcji onSearch, aby uniknąć nieskończonej pętli renderowania
    const currentOnSearch = onSearch;

    // Listen for the result event
    geocoderRef.current.on('result', (event) => {
      const result = event.result
      // Pass the place name or address to the onSearch callback
      currentOnSearch(result.place_name || result.text || null)
    })

    // Listen for the clear event
    geocoderRef.current.on('clear', () => {
      currentOnSearch(null)
    })

    return () => {
      if (geocoderRef.current && map) {
        map.removeControl(geocoderRef.current)
        geocoderRef.current = null
      }
    }
  }, [map, placeholder, position]) // Usunięto onSearch z zależności

  return null // This component doesn't render anything directly
}