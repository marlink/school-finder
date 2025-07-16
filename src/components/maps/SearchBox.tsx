'use client'

import { useState, useEffect } from 'react'

interface SearchBoxProps {
  onSearch: (searchTerm: string | null) => void
}

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [searchTerm, setSearchTerm] = useState<string>('')
  
  // Debounce search to avoid too many updates while typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm || null)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])
  
  const handleClear = () => {
    setSearchTerm('')
    onSearch(null)
  }
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          placeholder="Search schools..."
          className="w-full pl-9 pr-9 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search schools"
        />
        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 pr-2.5 flex items-center touch-manipulation"
            onClick={handleClear}
            aria-label="Clear search"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}