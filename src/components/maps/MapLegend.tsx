'use client'

import { getRatingColor } from '@/utils/mapUtils'

export default function MapLegend() {
  const ratingRanges = [
    { min: 4.5, max: 5.0, label: 'Excellent' },
    { min: 4.0, max: 4.4, label: 'Very Good' },
    { min: 3.5, max: 3.9, label: 'Good' },
    { min: 3.0, max: 3.4, label: 'Average' },
    { min: 2.5, max: 2.9, label: 'Below Average' },
    { min: 2.0, max: 2.4, label: 'Poor' },
    { min: 0, max: 1.9, label: 'Very Poor' },
    { min: undefined, max: undefined, label: 'No Rating' }
  ]

  return (
    <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-white p-2 sm:p-3 rounded-lg shadow-md z-10 max-w-[180px] sm:max-w-none">
      <h3 className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2">School Ratings</h3>
      <div className="space-y-0.5 sm:space-y-1">
        {ratingRanges.map((range, index) => {
          const rating = range.min !== undefined ? range.min : undefined
          return (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-1.5 sm:mr-2 flex-shrink-0" 
                style={{ backgroundColor: getRatingColor(rating) }}
                aria-hidden="true"
              />
              <span className="text-[10px] sm:text-xs truncate">
                {range.min !== undefined 
                  ? `${range.min}-${range.max}: ${range.label}` 
                  : range.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}