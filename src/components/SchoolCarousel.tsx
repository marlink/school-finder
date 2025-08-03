"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import SchoolCard from './SchoolCard';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Grid, 
  List, 
  TrendingUp,
  Star,
  MapPin,
  Users,
  RefreshCw,
  Eye
} from "lucide-react";
import { cn } from '@/lib/utils';

interface School {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  address: {
    street: string;
    city: string;
    voivodeship: string;
    postal: string;
    district?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  studentCount?: number;
  teacherCount?: number;
  establishedYear?: number;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
  avgUserRating?: number;
  avgGoogleRating?: number;
  userRatingCount: number;
  googleRatingCount: number;
  distance?: number;
  isFavorite: boolean;
  mainImage?: string;
  images?: Array<{
    imageUrl: string;
    altText?: string;
    imageType: string;
  }>;
  isVerified?: boolean;
  isPremium?: boolean;
  lastUpdated?: string;
}

interface SchoolCarouselProps {
  schools: School[];
  title?: string;
  description?: string;
  variant?: 'default' | 'featured' | 'compact' | 'detailed';
  cardVariant?: 'default' | 'compact' | 'detailed' | 'grid';
  itemsPerView?: 'auto' | 1 | 2 | 3 | 4 | 5;
  showControls?: boolean;
  showViewToggle?: boolean;
  showFilter?: boolean;
  onFavoriteToggle?: (schoolId: string) => void;
  onViewAll?: () => void;
  className?: string;
  loading?: boolean;
  language?: 'en' | 'pl';
  autoplay?: boolean;
  loop?: boolean;
}

// Translations
const translations = {
  en: {
    featured: 'Featured Schools',
    recommended: 'Recommended for You',
    nearby: 'Schools Near You',
    popular: 'Popular Schools',
    viewAll: 'View All',
    loading: 'Loading schools...',
    noSchools: 'No schools found',
    refresh: 'Refresh',
    gridView: 'Grid View',
    listView: 'List View',
    filter: 'Filter',
    showingResults: 'Showing {count} of {total} schools',
    previousSlide: 'Previous slide',
    nextSlide: 'Next slide'
  },
  pl: {
    featured: 'Polecane Szkoły',
    recommended: 'Polecane dla Ciebie',
    nearby: 'Szkoły w Pobliżu',
    popular: 'Popularne Szkoły',
    viewAll: 'Zobacz Wszystkie',
    loading: 'Ładowanie szkół...',
    noSchools: 'Nie znaleziono szkół',
    refresh: 'Odśwież',
    gridView: 'Widok Siatki',
    listView: 'Widok Listy',
    filter: 'Filtruj',
    showingResults: 'Pokazuje {count} z {total} szkół',
    previousSlide: 'Poprzedni slajd',
    nextSlide: 'Następny slajd'
  }
};

export default function SchoolCarousel({
  schools,
  title,
  description,
  variant = 'default',
  cardVariant = 'default',
  itemsPerView = 'auto',
  showControls = true,
  showViewToggle = false,
  showFilter = false,
  onFavoriteToggle,
  onViewAll,
  className = '',
  loading = false,
  language = 'pl',
  autoplay = false,
  loop = false
}: SchoolCarouselProps) {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoplay);
  const t = translations[language];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || schools.length <= 1) return;

    const interval = setInterval(() => {
      // Auto-scroll logic would go here
      // This would integrate with the Embla carousel API
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, schools.length]);

  const getCarouselOptions = () => {
    const baseOptions = {
      loop,
      align: 'start' as const,
      skipSnaps: false,
      dragFree: true,
    };

    if (itemsPerView === 'auto') {
      return {
        ...baseOptions,
        containScroll: 'trimSnaps' as const,
      };
    }

    return {
      ...baseOptions,
      slidesToScroll: 1,
    };
  };

  const getItemBasisClass = () => {
    if (itemsPerView === 'auto') return 'basis-auto';
    if (itemsPerView === 1) return 'basis-full';
    if (itemsPerView === 2) return 'basis-1/2';
    if (itemsPerView === 3) return 'basis-1/3';
    if (itemsPerView === 4) return 'basis-1/4';
    if (itemsPerView === 5) return 'basis-1/5';
    return 'basis-auto';
  };

  const getResponsiveItemClass = () => {
    if (itemsPerView === 'auto') {
      return 'basis-80 sm:basis-72 md:basis-80 lg:basis-96';
    }
    return cn(
      'basis-full',
      'sm:basis-1/2',
      itemsPerView >= 3 && 'md:basis-1/3',
      itemsPerView >= 4 && 'lg:basis-1/4',
      itemsPerView >= 5 && 'xl:basis-1/5'
    );
  };

  const renderLoadingSkeletons = () => (
    <div className="flex gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-80">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="max-w-sm mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{t.noSchools}</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your search criteria or check back later.
        </p>
        <Button variant="outline" onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.reload();
                  }
                }}>
          <RefreshCw className="h-4 w-4 mr-2" />
          {t.refresh}
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {title && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
        )}
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <RefreshCw className="h-5 w-5 animate-spin" />
            {t.loading}
          </div>
        </div>
        {renderLoadingSkeletons()}
      </div>
    );
  }

  if (!schools || schools.length === 0) {
    return (
      <div className={cn("space-y-6", className)}>
        {title && (
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {description && (
                <p className="text-gray-600 mt-1">{description}</p>
              )}
            </div>
          </div>
        )}
        {renderEmptyState()}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && (
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          )}
          {description && (
            <p className="text-gray-600 mt-1">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          {showViewToggle && (
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={currentView === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('grid')}
                className="h-8 px-3"
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">{t.gridView}</span>
              </Button>
              <Button
                variant={currentView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView('list')}
                className="h-8 px-3"
              >
                <List className="h-4 w-4" />
                <span className="sr-only">{t.listView}</span>
              </Button>
            </div>
          )}

          {/* Filter Button */}
          {showFilter && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              {t.filter}
            </Button>
          )}

          {/* View All Button */}
          {onViewAll && (
            <Button variant="outline" size="sm" onClick={onViewAll}>
              <Eye className="h-4 w-4 mr-2" />
              {t.viewAll}
            </Button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {t.showingResults.replace('{count}', schools.length.toString()).replace('{total}', schools.length.toString())}
      </div>

      {/* Carousel */}
      <Carousel 
        opts={getCarouselOptions()}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {schools.map((school) => (
            <CarouselItem 
              key={school.id} 
              className={cn(
                "pl-2 md:pl-4",
                getResponsiveItemClass()
              )}
            >
              <SchoolCard
                school={school}
                variant={cardVariant}
                onFavoriteToggle={onFavoriteToggle}
                language={language}
                className="h-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Custom Controls */}
        {showControls && schools.length > (itemsPerView === 'auto' ? 1 : itemsPerView) && (
          <>
            <CarouselPrevious 
              className="left-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border hover:bg-gray-50"
              aria-label={t.previousSlide}
            />
            <CarouselNext 
              className="right-4 top-1/2 -translate-y-1/2 bg-white shadow-lg border hover:bg-gray-50"
              aria-label={t.nextSlide}
            />
          </>
        )}
      </Carousel>

      {/* Featured Variant Additional Content */}
      {variant === 'featured' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {language === 'en' ? 'Why These Schools?' : 'Dlaczego Te Szkoły?'}
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-700">
                {language === 'en' ? 'Highest rated in your area' : 'Najwyżej oceniane w Twojej okolicy'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">
                {language === 'en' ? 'Proven track record' : 'Sprawdzona historia'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span className="text-gray-700">
                {language === 'en' ? 'Convenient location' : 'Dogodna lokalizacja'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
