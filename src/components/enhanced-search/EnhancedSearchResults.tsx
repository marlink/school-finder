"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Users, Clock, Filter, Grid, List, SortAsc, SortDesc, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';

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

interface SearchResultsProps {
  results: School[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
  query?: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  sortBy: string;
  sortOrder: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export default function EnhancedSearchResults({
  results,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  error,
  query,
  onPageChange,
  onSortChange,
  sortBy,
  sortOrder,
  viewMode = 'grid',
  onViewModeChange
}: SearchResultsProps) {
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>(viewMode);

  useEffect(() => {
    setLocalViewMode(viewMode);
  }, [viewMode]);

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setLocalViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    onSortChange(newSortBy, newSortOrder);
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return null;
    return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
  };

  const formatRating = (rating?: number) => {
    if (!rating) return null;
    return rating.toFixed(1);
  };

  const getSchoolImage = (school: School) => {
    if (school.images?.[0]?.imageUrl) {
      return school.images[0].imageUrl;
    }
    
    // Use specific placeholder images based on school type
    switch (school.type?.toLowerCase()) {
      case 'primary':
      case 'podstawowa':
      case 'elementary':
        return '/img/mama.jpeg';
      case 'secondary':
      case 'gimnazjum':
      case 'middle':
        return '/img/mama-2.jpeg';
      case 'high':
      case 'liceum':
      case 'technikum':
      case 'technical':
        return '/img/schkola-1.jpg';
      case 'university':
      case 'uniwersytet':
      case 'college':
        return '/img/uniwerek.jpg';
      default:
        return '/img/podstawowka.jpg';
    }
  };

  const formatAddress = (address: School['address'], city?: string) => {
    if (typeof address === 'string') {
      return address;
    }
    
    const parts = [];
    if (address?.street) parts.push(address.street);
    if (city || address?.city) parts.push(city || address.city);
    
    return parts.join(', ') || 'Address not available';
  };

  const renderSchoolCard = (school: School) => {
    const distance = formatDistance(school.distance);
    const userRating = formatRating(school.averageUserRating);
    const googleRating = formatRating(school.averageGoogleRating);
    const image = getSchoolImage(school);

    if (localViewMode === 'list') {
      return (
        <Card key={school.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <Image
                  src={image}
                  alt={school.name}
                  width={112}
                  height={112}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link href={`/schools/${school.id}`}>
                      <h3 className="text-xl font-bold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1 mb-2 group-hover:text-orange-600">
                        {school.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 text-orange-700 font-medium"
                      >
                        {school.type}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 font-medium"
                      >
                        {school.level}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{formatAddress(school.address, school.city)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 ml-4">
                    {(userRating || googleRating) && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1 rounded-full border border-yellow-200">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-bold text-gray-900">
                          {userRating || googleRating}
                        </span>
                        {school.totalRatings && (
                          <span className="text-xs text-gray-600 ml-1">
                            ({school.totalRatings})
                          </span>
                        )}
                      </div>
                    )}
                    {distance && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        <MapPin className="h-3 w-3" />
                        <span className="font-medium">{distance}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {school.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                    {school.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-xs text-gray-500">
                    {school.studentCount && (
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-700">{school.studentCount} uczniów</span>
                      </div>
                    )}
                    {school.establishedYear && (
                      <div className="flex items-center gap-2 bg-purple-50 px-3 py-1 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-purple-700">Od {school.establishedYear}</span>
                      </div>
                    )}
                  </div>
                  
                  <Link href={`/schools/${school.id}`}>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6"
                    >
                      Zobacz szczegóły
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Grid view
    return (
      <Card key={school.id} className="group hover:shadow-2xl transition-all duration-300 overflow-hidden border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-1">
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={image}
            alt={school.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-medium shadow-lg border-0">
              {school.type}
            </Badge>
            {distance && (
              <Badge className="bg-orange-500/90 backdrop-blur-sm text-white text-xs font-medium shadow-lg border-0">
                {distance}
              </Badge>
            )}
          </div>
          
          {(userRating || googleRating) && (
            <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 shadow-lg">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-gray-900">
                {userRating || googleRating}
              </span>
            </div>
          )}
          
          <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg p-2">
              <div className="flex items-center gap-1 text-xs text-gray-700">
                <MapPin className="h-3 w-3 text-orange-500" />
                <span className="font-medium line-clamp-1">{formatAddress(school.address, school.city)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <CardContent className="p-5">
          <Link href={`/schools/${school.id}`}>
            <h3 className="font-bold text-lg text-gray-900 hover:text-orange-600 transition-colors line-clamp-2 mb-3 group-hover:text-orange-600 leading-tight">
              {school.name}
            </h3>
          </Link>
          
          {school.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
              {school.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs mb-4">
            <div className="flex items-center gap-3">
              {school.studentCount && (
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-lg">
                  <Users className="h-3 w-3 text-blue-500" />
                  <span className="font-medium text-blue-700">{school.studentCount}</span>
                </div>
              )}
              {school.establishedYear && (
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-lg">
                  <Clock className="h-3 w-3 text-purple-500" />
                  <span className="font-medium text-purple-700">{school.establishedYear}</span>
                </div>
              )}
            </div>
          </div>
          
          <Link href={`/schools/${school.id}`}>
            <Button 
              size="sm" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
            >
              Zobacz szczegóły
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(i)}
          disabled={isLoading}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          Previous
        </Button>
        {startPage > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={isLoading}
            >
              1
            </Button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}
        {pages}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={isLoading}
            >
              {totalPages}
            </Button>
          </>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isLoading}
        >
          Next
        </Button>
      </div>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {query ? `Search Results for "${query}"` : 'All Schools'}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {isLoading ? 'Searching...' : `${totalCount} schools found`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={localViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={localViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Sort Options */}
          <Select
            value={`${sortBy}-${sortOrder}`}
            onValueChange={handleSortChange}
            disabled={isLoading}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="rating-asc">Lowest Rated</SelectItem>
              <SelectItem value="distance-asc">Nearest First</SelectItem>
              <SelectItem value="distance-desc">Farthest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="students-desc">Most Students</SelectItem>
              <SelectItem value="students-asc">Fewest Students</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Searching schools...</span>
        </div>
      )}

      {/* No Results */}
      {!isLoading && results.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-600 mb-4">
            {query 
              ? `No schools match your search for "${query}". Try adjusting your filters or search terms.`
              : 'No schools match your current filters. Try adjusting your search criteria.'
            }
          </p>
          <Button variant="outline">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Results Grid/List */}
      {!isLoading && results.length > 0 && (
        <>
          <div className={
            localViewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {results.map(renderSchoolCard)}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}
    </div>
  );
}