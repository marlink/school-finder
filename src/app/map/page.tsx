'use client'

import { useState, useMemo } from 'react'
import Map from '@/components/maps/Map'
import SchoolMarker from '@/components/maps/SchoolMarker'
import SchoolPopup from '@/components/maps/SchoolPopup'
import MapLegend from '@/components/maps/MapLegend'
import FilterControls from '@/components/maps/FilterControls'
import MapboxGeocoderControl from '@/components/maps/MapboxGeocoder'
import { School, SchoolFilter } from '@/types/school'
import { filterSchools } from '@/utils/filterUtils'
import { mockSchools } from '@/data/mockSchools'

export default function MapPage() {
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [filters, setFilters] = useState<SchoolFilter>({
    region: null,
    minRating: null,
    maxRating: null,
    searchTerm: null
  })
  
  // Extract unique regions for the filter dropdown
  const regions = useMemo(() => {
    const uniqueRegions = new Set(mockSchools.map(school => school.region))
    return Array.from(uniqueRegions).filter(Boolean).sort()
  }, [mockSchools]) // Dodano mockSchools jako zależność
  
  // Apply filters to schools using the utility function
  const filteredSchools = useMemo(() => {
    return filterSchools(mockSchools, filters)
  }, [mockSchools, filters]) // Dodano mockSchools jako zależność
  
  const handleMarkerClick = (schoolId: string) => {
    setSelectedSchool(schoolId)
  }
  
  const handlePopupClose = () => {
    setSelectedSchool(null)
  }
  
  const handleFilterChange = (newFilters: SchoolFilter) => {
    // Użyj funkcyjnej formy setState, aby uniknąć nieskończonej pętli renderowania
    setFilters(prev => {
      // Sprawdź, czy faktycznie są zmiany, aby uniknąć niepotrzebnych renderowań
      const hasChanges = Object.entries(newFilters).some(
        ([key, value]) => prev[key as keyof SchoolFilter] !== value
      );
      
      if (!hasChanges) return prev;
      
      return {
        ...prev,
        ...newFilters
      };
    });
    
    // Close any open popup when filters change
    setSelectedSchool(null);
  }
  
  const handleSearch = (searchTerm: string | null) => {
    // Użyj funkcyjnej formy setState, aby uniknąć nieskończonej pętli renderowania
    setFilters(prev => {
      // Sprawdź, czy faktycznie są zmiany, aby uniknąć niepotrzebnych renderowań
      if (prev.searchTerm === searchTerm) return prev;
      
      return {
        ...prev,
        searchTerm
      };
    });
    
    // Close any open popup when search changes
    setSelectedSchool(null);
  }
  
  const selectedSchoolData = mockSchools.find(s => s.id === selectedSchool)
  
  return (
    <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <h1 className="mb-4 sm:mb-6 text-2xl sm:text-3xl font-bold text-center sm:text-left">School Map</h1>
      
      {/* Filter Controls */}
      <FilterControls 
        regions={regions} 
        onFilterChange={handleFilterChange} 
      />
      
      {/* Filter Summary */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Showing {filteredSchools.length} of {mockSchools.length} schools
          {filters.region ? ` in ${filters.region}` : ''}
          {filters.minRating !== null ? ` with rating ${filters.minRating}+` : ''}
          {filters.maxRating !== null ? ` with rating up to ${filters.maxRating}` : ''}
          {filters.searchTerm ? ` matching "${filters.searchTerm}"` : ''}
        </p>
      </div>
      
      <div className="relative">
        <Map 
          className="h-[400px] sm:h-[500px] md:h-[600px] w-full rounded-lg shadow-lg"
          controls={[
            <MapboxGeocoderControl 
              key="geocoder"
              onSearch={handleSearch}
              position="top-left"
            />
          ]}
        >
          {filteredSchools.map(school => (
            <SchoolMarker
              key={school.id}
              longitude={school.longitude}
              latitude={school.latitude}
              schoolName={school.name}
              schoolId={school.id}
              rating={school.rating}
              onClick={handleMarkerClick}
            />
          ))}
          
          {selectedSchoolData && (
            <SchoolPopup
              school={selectedSchoolData}
              onClose={handlePopupClose}
            />
          )}
        </Map>
        <MapLegend />
      </div>
    </div>
  )
}