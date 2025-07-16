'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import mapboxgl from 'mapbox-gl'
import { getRatingColor, getContrastColor } from '@/utils/mapUtils'

interface SchoolPopupProps {
  map: mapboxgl.Map
  school: {
    id: string
    name: string
    latitude: number
    longitude: number
    rating?: number
    address?: string
    type?: string
    description?: string
  }
  onClose?: () => void
}

export default function SchoolPopup({ map, school, onClose }: SchoolPopupProps) {
  const router = useRouter()
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  useEffect(() => {
    if (!map || !school) return

    // Get color for rating badge
    const ratingColor = school.rating ? getRatingColor(school.rating) : '#808080';
    const textColor = getContrastColor(ratingColor);
    
    // Detect if we're on a mobile device by checking screen width
    const isMobile = window.innerWidth < 768;
    
    // Create popup content
    const popupContent = document.createElement('div')
    popupContent.className = 'school-popup'
    popupContent.innerHTML = `
      <div class="p-2 sm:p-3 max-w-sm">
        <h3 class="text-sm sm:text-base font-semibold mb-1 break-words">${school.name}</h3>
        ${school.rating ? `
        <div class="flex items-center mb-2">
          <div style="
            background-color: ${ratingColor}; 
            color: ${textColor}; 
            padding: 2px 6px; 
            border-radius: 10px; 
            font-weight: bold; 
            font-size: ${isMobile ? '10px' : '12px'};
          ">
            ${school.rating.toFixed(1)}
          </div>
          <div class="flex ml-2 text-xs">
            ${Array(Math.floor(school.rating)).fill('★').join('')}${school.rating % 1 >= 0.5 ? '½' : ''}${Array(5 - Math.ceil(school.rating)).fill('☆').join('')}
          </div>
        </div>` : ''}
        ${school.address ? `<p class="text-xs text-gray-600 mb-1 break-words">${school.address}</p>` : ''}
        ${school.type ? `<p class="text-xs text-gray-500 mb-1">${school.type}</p>` : ''}
        ${school.description ? `<p class="text-xs mt-2 line-clamp-2">${school.description}</p>` : ''}
        <div class="mt-2 sm:mt-3">
          <button class="text-xs text-blue-600 hover:underline inline-block px-3 py-1 bg-blue-50 rounded-md">View details</button>
        </div>
      </div>
    `

    // Create and add the popup
    popupRef.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: isMobile ? '250px' : '300px',
      offset: isMobile ? 15 : 10, // Add offset for better positioning on mobile
      className: 'school-popup-container'
    })
      .setLngLat([school.longitude, school.latitude])
      .setDOMContent(popupContent)
      .addTo(map)
      
    // Add click event listener to the "View details" button
    const detailsButton = popupContent.querySelector('button')
    if (detailsButton) {
      detailsButton.addEventListener('click', () => {
        router.push(`/schools/${school.id}`)
      })
    }

    // Add event listener for popup close
    popupRef.current.on('close', () => {
      if (onClose) onClose()
    })

    // Cleanup function
    return () => {
      if (popupRef.current) {
        popupRef.current.remove()
      }
    }
  }, [map, school]) // Usunięto onClose z zależności, ponieważ może powodować nieskończoną pętlę renderowania

  return null
}