'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import LocationButton from './LocationButton'

// Initialize mapbox with your access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string

interface MapProps {
  initialCenter?: [number, number] // [longitude, latitude]
  initialZoom?: number
  className?: string
  children?: React.ReactNode
  controls?: React.ReactNode // New prop for map controls
}

export default function Map({
  initialCenter = [19.134422, 52.215933], // Default center of Poland
  initialZoom = 6,
  className = 'h-[500px] w-full',
  children,
  controls
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map only once
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: initialCenter,
        zoom: initialZoom
      })

      map.current.on('load', () => {
        // Load school marker image
        map.current?.loadImage('/school-marker.svg', (error, image) => {
          if (error) throw error;
          
          if (image && !map.current?.hasImage('school-marker')) {
            map.current?.addImage('school-marker', image);
          }
          
          setMapLoaded(true);
        });
      })
    }

    // Cleanup function to remove map when component unmounts
    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, []) // Usunięto initialCenter i initialZoom z zależności, ponieważ są używane tylko przy inicjalizacji

  return (
    <div ref={mapContainer} className={className}>
      {mapLoaded && map.current && (
        <>
          <LocationButton map={map.current} />
          {controls && (
            <div id="map-controls">
              {React.Children.map(controls, (control) => {
                if (React.isValidElement(control)) {
                  return React.cloneElement(control as React.ReactElement<any>, {
                    map: map.current,
                  })
                }
                return control
              })}
            </div>
          )}
          {children && (
            <div id="map-children">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  return React.cloneElement(child as React.ReactElement<any>, {
                    map: map.current,
                  })
                }
                return child
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}