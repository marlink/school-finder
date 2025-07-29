"use client";

import { useState } from 'react';
import { 
  Grid, 
  List, 
  Map, 
  Star, 
  MapPin, 
  Users, 
  Calendar,
  ExternalLink,
  Heart,
  Share2,
  Filter,
  SortAsc,
  SortDesc,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import Link from 'next/link';

interface School {
  id: string;
  name: string;
  type: string;
  city: string;
  voivodeship: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  studentCount?: number;
  establishedYear?: number;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
  images?: string[];
  latitude?: number;
  longitude?: number;
  distance?: number;
}

interface EnhancedSearchResultsProps {
  results: School[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error?: string;
  query: string;
  onPageChange: (page: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  className?: string;
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
  viewMode,
  onViewModeChange,
  className = ""
}: EnhancedSearchResultsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (schoolId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(schoolId)) {
      newFavorites.delete(schoolId);
    } else {
      newFavorites.add(schoolId);
    }
    setFavorites(newFavorites);
  };

  const shareSchool = async (school: School) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: school.name,
          text: `Check out ${school.name} - ${school.type} in ${school.city}`,
          url: window.location.href + `?school=${school.id}`
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href + `?school=${school.id}`);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) 
            ? 'fill-yellow-400 text-yellow-400' 
            : i < rating 
            ? 'fill-yellow-200 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const renderSchoolCard = (school: School, index: number) => {
    const isGridView = viewMode === 'grid';
    
    return (
      <Card 
        key={school.id} 
        className={`group hover:shadow-lg transition-all duration-200 ${
          isGridView ? 'h-full' : 'mb-4'
        }`}
      >
        <div className={`${isGridView ? 'flex flex-col h-full' : 'flex flex-row'}`}>
          {/* Image */}
          <div className={`relative ${
            isGridView 
              ? 'w-full h-48' 
              : 'w-48 h-32 flex-shrink-0'
          }`}>
            {school.images && school.images.length > 0 ? (
              <Image
                src={school.images[0]}
                alt={school.name}
                fill
                className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-blue-600 font-bold text-lg">
                      {school.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">No Image</span>
                </div>
              </div>
            )}
            
            {/* Overlay actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={() => toggleFavorite(school.id)}
              >
                <Heart 
                  className={`w-4 h-4 ${
                    favorites.has(school.id) 
                      ? 'fill-red-500 text-red-500' 
                      : 'text-gray-600'
                  }`} 
                />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={() => shareSchool(school)}
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </div>

            {/* Distance badge */}
            {school.distance && (
              <Badge className="absolute bottom-2 left-2 bg-white/90 text-gray-700">
                {school.distance.toFixed(1)} km
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className={`${isGridView ? 'flex-1 p-4' : 'flex-1 p-4'}`}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="mb-3">
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/schools/${school.id}`} className="hover:underline">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
                      {school.name}
                    </h3>
                  </Link>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Badge variant="outline" className="text-xs">
                    {school.type}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{school.city}, {school.voivodeship}</span>
                  </div>
                </div>

                {/* Rating */}
                {school.rating && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {renderStars(school.rating)}
                    </div>
                    <span className="text-sm font-medium">{school.rating.toFixed(1)}</span>
                    {school.reviewCount && (
                      <span className="text-sm text-gray-500">
                        ({school.reviewCount} reviews)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              {school.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {school.description}
                </p>
              )}

              {/* Details */}
              <div className="space-y-2 mb-3 text-sm">
                {school.studentCount && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{school.studentCount.toLocaleString()} students</span>
                  </div>
                )}
                
                {school.establishedYear && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Established {school.establishedYear}</span>
                  </div>
                )}
              </div>

              {/* Languages & Specializations */}
              <div className="space-y-2 mb-4">
                {school.languages && school.languages.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {school.languages.slice(0, 3).map(lang => (
                        <Badge key={lang} variant="secondary" className="text-xs">
                          {lang}
                        </Badge>
                      ))}
                      {school.languages.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{school.languages.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {school.specializations && school.specializations.length > 0 && (
                  <div>
                    <span className="text-xs text-gray-500 block mb-1">Specializations:</span>
                    <div className="flex flex-wrap gap-1">
                      {school.specializations.slice(0, 2).map(spec => (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {school.specializations.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{school.specializations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto flex items-center justify-between">
                <Link href={`/schools/${school.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
                
                {school.website && (
                  <Button variant="ghost" size="sm" asChild>
                    <a href={school.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderLoadingSkeleton = () => {
    const skeletonCount = viewMode === 'grid' ? 6 : 3;
    
    return Array.from({ length: skeletonCount }, (_, i) => (
      <Card key={i} className={viewMode === 'grid' ? 'h-full' : 'mb-4'}>
        <div className={viewMode === 'grid' ? 'flex flex-col h-full' : 'flex flex-row'}>
          <Skeleton className={viewMode === 'grid' ? 'w-full h-48' : 'w-48 h-32'} />
          <div className="flex-1 p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </Card>
    ));
  };

  if (error) {
    return (
      <Alert className={className}>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {isLoading ? 'Searching...' : `${totalCount.toLocaleString()} schools found`}
          </h2>
          {query && (
            <p className="text-sm text-gray-600 mt-1">
              Results for "{query}"
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [newSortBy, newSortOrder] = value.split('-') as [string, 'asc' | 'desc'];
            onSortChange(newSortBy, newSortOrder);
          }}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance-desc">Most Relevant</SelectItem>
              <SelectItem value="rating-desc">Highest Rated</SelectItem>
              <SelectItem value="distance-asc">Nearest First</SelectItem>
              <SelectItem value="name-asc">Name A-Z</SelectItem>
              <SelectItem value="name-desc">Name Z-A</SelectItem>
              <SelectItem value="students-desc">Most Students</SelectItem>
              <SelectItem value="students-asc">Fewest Students</SelectItem>
            </SelectContent>
          </Select>

          {/* View Mode */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="px-3"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="px-3"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {renderLoadingSkeleton()}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-600 mb-4">
            Try adjusting your search criteria or filters to find more results.
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
        }>
          {results.map((school, index) => renderSchoolCard(school, index))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1;
              const isCurrentPage = page === currentPage;
              
              return (
                <Button
                  key={page}
                  variant={isCurrentPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              );
            })}
            
            {totalPages > 5 && (
              <>
                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(totalPages)}
                  className="w-10"
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}