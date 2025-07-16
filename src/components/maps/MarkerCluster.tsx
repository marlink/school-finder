'use client'

import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'

interface School {
  id: string
  name: string
  latitude: number
  longitude: number
  rating?: number
}

interface MarkerClusterProps {
  map: mapboxgl.Map
  schools: School[]
  onMarkerClick?: (schoolId: string) => void
}

export default function MarkerCluster({ map, schools, onMarkerClick }: MarkerClusterProps) {
  const markersRef = useRef<mapboxgl.Marker[]>([])
  
  useEffect(() => {
    if (!map || !schools.length) return
    
    // Clean up any existing markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Check if the source already exists and remove it
    if (map.getSource('schools')) {
      map.removeLayer('clusters')
      map.removeLayer('cluster-count')
      map.removeLayer('unclustered-point')
      map.removeSource('schools')
    }
    
    // Detect if we're on a mobile device by checking screen width
    const isMobile = window.innerWidth < 768
    
    // Add a source for school points
    map.addSource('schools', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: schools.map(school => ({
          type: 'Feature',
          properties: {
            id: school.id,
            name: school.name,
            rating: school.rating || 0
          },
          geometry: {
            type: 'Point',
            coordinates: [school.longitude, school.latitude]
          }
        }))
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })
    
    // Add cluster layer with responsive sizes
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'schools',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#4A80F0', // Blue for small clusters
          10,
          '#3366CC', // Darker blue for medium clusters
          30,
          '#1A4088' // Even darker for large clusters
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          isMobile ? 16 : 20, // Size for small clusters (smaller on mobile)
          10,
          isMobile ? 24 : 30, // Size for medium clusters (smaller on mobile)
          30,
          isMobile ? 32 : 40 // Size for large clusters (smaller on mobile)
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': 'white'
      }
    })
    
    // Add cluster count layer with responsive text size
    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'schools',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': isMobile ? 10 : 12,
        'text-allow-overlap': true
      },
      paint: {
        'text-color': '#ffffff'
      }
    })
    
    // Add unclustered point layer with responsive icon size
    map.addLayer({
      id: 'unclustered-point',
      type: 'symbol',
      source: 'schools',
      filter: ['!', ['has', 'point_count']],
      layout: {
        'icon-image': 'school-marker', // This would require adding an image to the map
        'icon-size': isMobile ? 0.85 : 1, // Smaller icon on mobile
        'icon-allow-overlap': true,
        'icon-anchor': 'bottom'
      }
    })
    
    // Add click event for clusters
    map.on('click', 'clusters', (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      const clusterId = features[0].properties?.cluster_id
      
      if (clusterId) {
        const source = map.getSource('schools') as mapboxgl.GeoJSONSource
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return
          
          const coordinates = (features[0].geometry as any).coordinates.slice()
          
          map.easeTo({
            center: coordinates,
            zoom: zoom
          })
        })
      }
    })
    
    // Add click event for individual points
    map.on('click', 'unclustered-point', (e) => {
      if (!e.features || !e.features[0]) return
      
      const properties = e.features[0].properties
      if (properties && properties.id && onMarkerClick) {
        onMarkerClick(properties.id)
      }
    })
    
    // Change cursor on hover
    map.on('mouseenter', 'clusters', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'clusters', () => {
      map.getCanvas().style.cursor = ''
    })
    map.on('mouseenter', 'unclustered-point', () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', 'unclustered-point', () => {
      map.getCanvas().style.cursor = ''
    })
    
    // Clean up event listeners when component unmounts
    return () => {
      if (map) {
        map.off('click', 'clusters')
        map.off('click', 'unclustered-point')
        map.off('mouseenter', 'clusters')
        map.off('mouseleave', 'clusters')
        map.off('mouseenter', 'unclustered-point')
        map.off('mouseleave', 'unclustered-point')
      }
    }
  }, [map, schools, onMarkerClick])
  
  return null
}