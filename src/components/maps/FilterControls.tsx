'use client'

import { useState, useEffect } from 'react'
import { SchoolFilter } from '@/types/school'

interface FilterControlsProps {
  regions: string[]
  onFilterChange: (filters: SchoolFilter) => void
}

export default function FilterControls({ regions, onFilterChange }: FilterControlsProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [minRating, setMinRating] = useState<number | null>(null)
  const [maxRating, setMaxRating] = useState<number | null>(null)
  
  // Update parent component when filters change
  useEffect(() => {
    onFilterChange({
      region: selectedRegion,
      minRating,
      maxRating
    })
  }, [selectedRegion, minRating, maxRating]) // Usunięto onFilterChange z zależności
  
  // Reset all filters
  const handleReset = () => {
    setSelectedRegion(null)
    setMinRating(null)
    setMaxRating(null)
  }
  
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-3 sm:mb-4">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Filter Schools</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Region filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <select
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            value={selectedRegion || ''}
            onChange={(e) => setSelectedRegion(e.target.value || null)}
            aria-label="Select region"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        
        {/* Min Rating filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Min Rating
          </label>
          <select
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            value={minRating || ''}
            onChange={(e) => setMinRating(e.target.value ? Number(e.target.value) : null)}
            aria-label="Select minimum rating"
          >
            <option value="">Any</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>
        
        {/* Max Rating filter */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Max Rating
          </label>
          <select
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1.5 sm:py-2"
            value={maxRating || ''}
            onChange={(e) => setMaxRating(e.target.value ? Number(e.target.value) : null)}
            aria-label="Select maximum rating"
          >
            <option value="">Any</option>
            <option value="2">Up to 2</option>
            <option value="3">Up to 3</option>
            <option value="4">Up to 4</option>
            <option value="5">Up to 5</option>
          </select>
        </div>
      </div>
      
      <div className="mt-3 sm:mt-4 flex justify-center sm:justify-end">
        <button
          onClick={handleReset}
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 w-full sm:w-auto"
          aria-label="Reset all filters"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}