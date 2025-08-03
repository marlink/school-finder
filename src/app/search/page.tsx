"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, X, MapPin, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import EnhancedSearchBar from '@/components/enhanced-search/enhancedsearchbar';
import AdvancedSearchFilters from '@/components/enhanced-search/AdvancedSearchFilters';
import EnhancedSearchResults from '@/components/enhanced-search/EnhancedSearchResults';

interface School {
  id: string;
  name: string;
  type: string;
  level: string;
  address: {
    street?: string;
    city?: string;
    district?: string;
    postalCode?: string;
    voivodeship?: string;
  };
  city: string;
  voivodeship: string;
  district?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  establishedYear?: number;
  studentCount?: number;
  averageUserRating?: number;
  averageGoogleRating?: number;
  totalRatings?: number;
  distance?: number;
  images?: Array<{
    id: string;
    imageUrl: string;
    imageType: string;
  }>;
  location?: {
    latitude: number;
    longitude: number;
  };
  facilities?: string[];
  languages?: string[];
  specializations?: string[];
}

interface SearchFilters {
  type?: string;
  city?: string;
  voivodeship?: string;
  district?: string;
  minRating?: number;
  maxDistance?: number;
  userLat?: number;
  userLng?: number;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
  hasImages?: boolean;
  establishedAfter?: number;
  establishedBefore?: number;
  minStudents?: number;
  maxStudents?: number;
  sortBy?: 'distance' | 'rating' | 'name' | 'students';
  sortOrder?: 'asc' | 'desc';
}

interface SearchResponse {
  schools: School[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  searchInfo: {
    query: string;
    filters: any;
    sort: any;
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading search...</p>
      </div>
    </div>}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    type: searchParams.get('type') || undefined,
    city: searchParams.get('city') || undefined,
    voivodeship: searchParams.get('voivodeship') || undefined,
    district: searchParams.get('district') || undefined,
    minRating: searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined,
    maxDistance: searchParams.get('maxDistance') ? Number(searchParams.get('maxDistance')) : undefined,
    languages: searchParams.get('languages')?.split(',').filter(Boolean) || [],
    specializations: searchParams.get('specializations')?.split(',').filter(Boolean) || [],
    facilities: searchParams.get('facilities')?.split(',').filter(Boolean) || [],
    hasImages: searchParams.get('hasImages') === 'true' || undefined,
    establishedAfter: searchParams.get('establishedAfter') ? Number(searchParams.get('establishedAfter')) : undefined,
    establishedBefore: searchParams.get('establishedBefore') ? Number(searchParams.get('establishedBefore')) : undefined,
    minStudents: searchParams.get('minStudents') ? Number(searchParams.get('minStudents')) : undefined,
    maxStudents: searchParams.get('maxStudents') ? Number(searchParams.get('maxStudents')) : undefined,
    sortBy: (searchParams.get('sortBy') as 'distance' | 'rating' | 'name' | 'students') || 'rating',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  });
  
  const [results, setResults] = useState<School[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  }, []);

  // Update URL when filters change
  const updateURL = useCallback((newQuery: string, newFilters: SearchFilters, page: number = 1) => {
    const params = new URLSearchParams();
    
    if (newQuery) params.set('q', newQuery);
    if (newFilters.type) params.set('type', newFilters.type);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.voivodeship) params.set('voivodeship', newFilters.voivodeship);
    if (newFilters.district) params.set('district', newFilters.district);
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString());
    if (newFilters.maxDistance) params.set('maxDistance', newFilters.maxDistance.toString());
    if (newFilters.languages?.length) params.set('languages', newFilters.languages.join(','));
    if (newFilters.specializations?.length) params.set('specializations', newFilters.specializations.join(','));
    if (newFilters.facilities?.length) params.set('facilities', newFilters.facilities.join(','));
    if (newFilters.hasImages) params.set('hasImages', 'true');
    if (newFilters.establishedAfter) params.set('establishedAfter', newFilters.establishedAfter.toString());
    if (newFilters.establishedBefore) params.set('establishedBefore', newFilters.establishedBefore.toString());
    if (newFilters.minStudents) params.set('minStudents', newFilters.minStudents.toString());
    if (newFilters.maxStudents) params.set('maxStudents', newFilters.maxStudents.toString());
    if (newFilters.sortBy && newFilters.sortBy !== 'rating') params.set('sortBy', newFilters.sortBy);
    if (newFilters.sortOrder && newFilters.sortOrder !== 'desc') params.set('sortOrder', newFilters.sortOrder);
    if (page > 1) params.set('page', page.toString());

    router.push(`/search?${params.toString()}`);
  }, [router]);

  // Perform search
  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, page: number = 1) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (searchFilters.type) params.set('type', searchFilters.type);
      if (searchFilters.city) params.set('city', searchFilters.city);
      if (searchFilters.voivodeship) params.set('voivodeship', searchFilters.voivodeship);
      if (searchFilters.district) params.set('district', searchFilters.district);
      if (searchFilters.minRating) params.set('minRating', searchFilters.minRating.toString());
      if (searchFilters.maxDistance) params.set('maxDistance', searchFilters.maxDistance.toString());
      if (userLocation) {
        params.set('userLat', userLocation.lat.toString());
        params.set('userLng', userLocation.lng.toString());
      }
      if (searchFilters.languages?.length) params.set('languages', searchFilters.languages.join(','));
      if (searchFilters.specializations?.length) params.set('specializations', searchFilters.specializations.join(','));
      if (searchFilters.facilities?.length) params.set('facilities', searchFilters.facilities.join(','));
      if (searchFilters.hasImages) params.set('hasImages', 'true');
      if (searchFilters.establishedAfter) params.set('establishedAfter', searchFilters.establishedAfter.toString());
      if (searchFilters.establishedBefore) params.set('establishedBefore', searchFilters.establishedBefore.toString());
      if (searchFilters.minStudents) params.set('minStudents', searchFilters.minStudents.toString());
      if (searchFilters.maxStudents) params.set('maxStudents', searchFilters.maxStudents.toString());
      if (searchFilters.sortBy) params.set('sortBy', searchFilters.sortBy);
      if (searchFilters.sortOrder) params.set('sortOrder', searchFilters.sortOrder);
      params.set('page', page.toString());
      params.set('limit', '12');

      const response = await fetch(`/api/search/schools?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data: SearchResponse = await response.json();
      
      setResults(data.schools);
      setTotalCount(data.pagination.totalCount);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(data.pagination.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [userLocation]);

  // Handle search
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
    updateURL(newQuery, filters, 1);
    performSearch(newQuery, filters, 1);
  }, [filters, updateURL, performSearch]);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(query, newFilters, 1);
    performSearch(query, newFilters, 1);
  }, [query, updateURL, performSearch]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    updateURL(query, filters, page);
    performSearch(query, filters, page);
  }, [query, filters, updateURL, performSearch]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string, sortOrder: string) => {
    const newFilters = { 
      ...filters, 
      sortBy: sortBy as 'distance' | 'rating' | 'name' | 'students', 
      sortOrder: sortOrder as 'asc' | 'desc' 
    };
    setFilters(newFilters);
    setCurrentPage(1);
    updateURL(query, newFilters, 1);
    performSearch(query, newFilters, 1);
  }, [query, filters, updateURL, performSearch]);

  // Initial search on mount
  useEffect(() => {
    if (query || Object.keys(filters).some(key => filters[key as keyof SearchFilters])) {
      performSearch(query, filters, currentPage);
    }
  }, []); // Only run on mount

  // Get active filters for display
  const getActiveFilters = () => {
    const active: Array<{ key: string; value: string; label: string }> = [];
    
    if (filters.type) active.push({ key: 'type', value: filters.type, label: `Type: ${filters.type}` });
    if (filters.city) active.push({ key: 'city', value: filters.city, label: `City: ${filters.city}` });
    if (filters.voivodeship) active.push({ key: 'voivodeship', value: filters.voivodeship, label: `Voivodeship: ${filters.voivodeship}` });
    if (filters.minRating) active.push({ key: 'minRating', value: filters.minRating.toString(), label: `Min Rating: ${filters.minRating}` });
    if (filters.maxDistance) active.push({ key: 'maxDistance', value: filters.maxDistance.toString(), label: `Max Distance: ${filters.maxDistance}km` });
    if (filters.languages?.length) active.push({ key: 'languages', value: filters.languages.join(','), label: `Languages: ${filters.languages.join(', ')}` });
    if (filters.specializations?.length) active.push({ key: 'specializations', value: filters.specializations.join(','), label: `Specializations: ${filters.specializations.join(', ')}` });
    if (filters.facilities?.length) active.push({ key: 'facilities', value: filters.facilities.join(','), label: `Facilities: ${filters.facilities.join(', ')}` });
    if (filters.hasImages) active.push({ key: 'hasImages', value: 'true', label: 'Has Images' });
    
    return active;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...filters };
    if (key === 'languages' || key === 'specializations' || key === 'facilities') {
      newFilters[key] = [];
    } else {
      delete newFilters[key as keyof SearchFilters];
    }
    handleFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: 'rating',
      sortOrder: 'desc'
    };
    handleFiltersChange(clearedFilters);
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Schools</h1>
          
          {/* Search Bar */}
          <div className="mb-6" data-tour="search-bar">
            <EnhancedSearchBar
              onSearch={handleSearch}
              placeholder="Search for schools, locations, or specializations..."
              className="w-full"
            />
          </div>

          {/* Filters Toggle and Active Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between" data-tour="filters">
            <AdvancedSearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onApplyFilters={() => {}}
              onClearFilters={clearAllFilters}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
            />

            {/* Active Filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {filter.label}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeFilter(filter.key)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div data-tour="results">
          <EnhancedSearchResults
            results={results}
            totalCount={totalCount}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={isLoading}
            error={error}
            query={query}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            sortBy={filters.sortBy || 'rating'}
            sortOrder={filters.sortOrder || 'desc'}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>
      </div>
    </div>
  );
}
