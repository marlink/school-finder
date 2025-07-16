'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SchoolFilter } from '@/types/school'
import { getAppPath } from '@/lib/routeUtils'

export function HomeSearchBox() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  
  // Mock regions - in a real app, these would come from an API or context
  const regions = [
    'Mazowieckie',
    'Małopolskie',
    'Pomorskie',
    'Wielkopolskie',
    'Dolnośląskie',
    'Łódzkie',
    'Zachodniopomorskie',
    'Kujawsko-Pomorskie'
  ]
  
  const handleSearch = () => {
    // Build query parameters
    const params = new URLSearchParams()
    
    if (searchTerm) {
      params.append('search', searchTerm)
    }
    
    if (selectedRegion) {
      params.append('region', selectedRegion)
    }
    
    // Navigate to schools page with search parameters
    router.push(getAppPath(`/schools?${params.toString()}`))
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
        Znajdź idealną szkołę w Twojej okolicy
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nazwa szkoły
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              placeholder="Wpisz nazwę szkoły..."
              className="w-full pl-10 pr-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Region
          </label>
          <select
            id="region"
            className="w-full py-3 px-4 text-base border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
          >
            <option value="">Wszystkie regiony</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleSearch}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Szukaj szkół
        </button>
      </div>
    </div>
  )
}