"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  GraduationCap, 
  Users, 
  Star,
  ChevronDown,
  ChevronUp,
  Clock
} from "lucide-react";
import SearchSuggestions from './SearchSuggestions';
import SearchHistoryDropdown from './SearchHistoryDropdown';
import { useSearchHistory } from '@/hooks/useSearchHistory';

interface SearchFormProps {
  onSearch: (searchParams: SearchParams) => void;
  variant?: 'hero' | 'compact' | 'full';
  className?: string;
}

export interface SearchParams {
  query: string;
  location: string;
  schoolType: string;
  gradeLevel: string;
  rating: string;
  distance: string;
  enrollment: string;
  specialPrograms: string[];
  languages: string[];
  facilities: string[];
  establishedAfter: string;
  establishedBefore: string;
  hasImages: boolean;
  voivodeship: string;
  district: string;
}

const schoolTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'public', label: 'Public Schools' },
  { value: 'private', label: 'Private Schools' },
  { value: 'charter', label: 'Charter Schools' },
  { value: 'magnet', label: 'Magnet Schools' },
  { value: 'specialized', label: 'Specialized Schools' }
];

const gradeLevels = [
  { value: 'all', label: 'All Grades' },
  { value: 'elementary', label: 'Elementary (K-5)' },
  { value: 'middle', label: 'Middle School (6-8)' },
  { value: 'high', label: 'High School (9-12)' },
  { value: 'k12', label: 'K-12' }
];

const ratings = [
  { value: 'all', label: 'All Ratings' },
  { value: '4+', label: '4+ Stars' },
  { value: '3+', label: '3+ Stars' },
  { value: '2+', label: '2+ Stars' }
];

const distances = [
  { value: 'all', label: 'Any Distance' },
  { value: '1', label: 'Within 1 mile' },
  { value: '5', label: 'Within 5 miles' },
  { value: '10', label: 'Within 10 miles' },
  { value: '25', label: 'Within 25 miles' }
];

const enrollmentRanges = [
  { value: 'all', label: 'Any Size' },
  { value: '0-200', label: 'Small (0-200)' },
  { value: '201-500', label: 'Medium (201-500)' },
  { value: '501-1000', label: 'Large (501-1000)' },
  { value: '1000+', label: 'Very Large (1000+)' }
];

const specialPrograms = [
  'STEM',
  'Arts',
  'Language Immersion',
  'Gifted & Talented',
  'Special Education',
  'Career & Technical',
  'International Baccalaureate',
  'Advanced Placement',
  'Montessori',
  'Waldorf'
];

const languages = [
  'English',
  'Polish',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Russian',
  'Chinese',
  'Japanese',
  'Other'
];

const facilities = [
  'Library',
  'Computer Lab',
  'Science Lab',
  'Art Studio',
  'Music Room',
  'Gymnasium',
  'Cafeteria',
  'Playground',
  'Swimming Pool',
  'Theater',
  'Sports Field',
  'Parking'
];

const establishmentYears = [
  { value: '', label: 'Any Year' },
  { value: '2020', label: '2020 or later' },
  { value: '2010', label: '2010 or later' },
  { value: '2000', label: '2000 or later' },
  { value: '1990', label: '1990 or later' },
  { value: '1980', label: '1980 or later' },
  { value: '1970', label: '1970 or later' }
];

const voivodeships = [
  'Dolnośląskie',
  'Kujawsko-Pomorskie',
  'Lubelskie',
  'Lubuskie',
  'Łódzkie',
  'Małopolskie',
  'Mazowieckie',
  'Opolskie',
  'Podkarpackie',
  'Podlaskie',
  'Pomorskie',
  'Śląskie',
  'Świętokrzyskie',
  'Warmińsko-Mazurskie',
  'Wielkopolskie',
  'Zachodniopomorskie'
];

export default function SearchForm({ onSearch, variant = 'full', className = '' }: SearchFormProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    query: '',
    location: '',
    schoolType: 'all',
    gradeLevel: 'all',
    rating: 'all',
    distance: 'all',
    enrollment: 'all',
    specialPrograms: [],
    languages: [],
    facilities: [],
    establishedAfter: '',
    establishedBefore: '',
    hasImages: false,
    voivodeship: '',
    district: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const { addSearchQuery } = useSearchHistory();
  
  // Debounce and prevent double submission
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');
  const isSearchingRef = useRef(false);

  const handleInputChange = (field: keyof SearchParams, value: string) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSpecialProgramToggle = (program: string) => {
    setSearchParams(prev => ({
      ...prev,
      specialPrograms: prev.specialPrograms.includes(program)
        ? prev.specialPrograms.filter(p => p !== program)
        : [...prev.specialPrograms, program]
    }));
  };

  const executeSearch = useCallback((params: SearchParams) => {
    // Prevent double submission
    if (isSearchingRef.current) {
      return;
    }
    
    isSearchingRef.current = true;
    
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Add search query to history if it's not empty
    if (params.query.trim()) {
      addSearchQuery(params.query);
    }
    
    // Execute search
    onSearch(params);
    lastSearchRef.current = params.query;
    
    // Reset the searching flag after a short delay
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 300);
  }, [onSearch, addSearchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchParams);
  };

  const handleAutoSearch = (suggestion: string) => {
    // Prevent duplicate searches
    if (suggestion === lastSearchRef.current) {
      return;
    }
    
    const updatedParams = { ...searchParams, query: suggestion };
    setSearchParams(updatedParams);
    executeSearch(updatedParams);
  };

  const clearFilters = () => {
    setSearchParams({
      query: '',
      location: '',
      schoolType: 'all',
      gradeLevel: 'all',
      rating: 'all',
      distance: 'all',
      enrollment: 'all',
      specialPrograms: []
    });
  };

  const hasActiveFilters = () => {
    return searchParams.schoolType !== 'all' || 
           searchParams.gradeLevel !== 'all' || 
           searchParams.rating !== 'all' || 
           searchParams.distance !== 'all' || 
           searchParams.enrollment !== 'all' || 
           searchParams.specialPrograms.length > 0;
  };

  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={`${className}`}>
        <div className="flex max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Input 
              placeholder="Search schools, districts, or locations..."
              value={searchParams.query}
              onChange={(e) => handleInputChange('query', e.target.value)}
              onFocus={() => setShowHistoryDropdown(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setShowHistoryDropdown(false);
                  executeSearch(searchParams);
                }
              }}
              className="h-14 pl-12 pr-16 text-lg border-0 shadow-lg focus:ring-2 focus:ring-blue-300"
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
              className="absolute right-2 top-3 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <Clock className="h-5 w-5" />
            </Button>
            
            {/* Search History Dropdown */}
            <SearchHistoryDropdown
              currentQuery={searchParams.query}
              onSelectSearch={(query) => handleInputChange('query', query)}
              isOpen={showHistoryDropdown}
              onToggle={() => setShowHistoryDropdown(!showHistoryDropdown)}
              onClose={() => setShowHistoryDropdown(false)}
            />
            
            {searchParams.query && (
              <SearchSuggestions 
                query={searchParams.query} 
                onSelectSuggestion={(suggestion) => {
                  handleInputChange('query', suggestion);
                  setShowHistoryDropdown(false);
                }}
                onAutoSearch={handleAutoSearch}
                className="mt-1"
              />
            )}
          </div>
          <Button 
            type="submit"
            className="h-14 w-14 ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg rounded-full"
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </form>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  placeholder="Search schools..."
                  value={searchParams.query}
                  onChange={(e) => handleInputChange('query', e.target.value)}
                  onFocus={() => setShowHistoryDropdown(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setShowHistoryDropdown(false);
                      executeSearch(searchParams);
                    }
                  }}
                  className="pl-10 pr-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <Clock className="h-4 w-4" />
                </Button>
                
                {/* Search History Dropdown */}
                <SearchHistoryDropdown
                  currentQuery={searchParams.query}
                  onSelectSearch={(query) => handleInputChange('query', query)}
                  isOpen={showHistoryDropdown}
                  onToggle={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  onClose={() => setShowHistoryDropdown(false)}
                />
                
                {searchParams.query && (
                  <SearchSuggestions 
                    query={searchParams.query} 
                    onSelectSuggestion={(suggestion) => {
                      handleInputChange('query', suggestion);
                      setShowHistoryDropdown(false);
                    }}
                    onAutoSearch={handleAutoSearch}
                    className="mt-1"
                  />
                )}
              </div>
              <div className="relative flex-1">
                <Input 
                  placeholder="Location"
                  value={searchParams.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                />
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              </div>
              <Button type="submit" className="px-6">
                Search
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Select value={searchParams.schoolType} onValueChange={(value) => handleInputChange('schoolType', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="School Type" />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={searchParams.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
                {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <Select value={searchParams.rating} onValueChange={(value) => handleInputChange('rating', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {ratings.map(rating => (
                      <SelectItem key={rating.value} value={rating.value}>
                        {rating.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={searchParams.distance} onValueChange={(value) => handleInputChange('distance', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distance" />
                  </SelectTrigger>
                  <SelectContent>
                    {distances.map(distance => (
                      <SelectItem key={distance.value} value={distance.value}>
                        {distance.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={searchParams.enrollment} onValueChange={(value) => handleInputChange('enrollment', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="School Size" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrollmentRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="md:col-span-3">
                  <label className="text-sm font-medium mb-2 block">Special Programs</label>
                  <div className="flex flex-wrap gap-2">
                    {specialPrograms.map(program => (
                      <Badge
                        key={program}
                        variant={searchParams.specialPrograms.includes(program) ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleSpecialProgramToggle(program)}
                      >
                        {program}
                        {searchParams.specialPrograms.includes(program) && (
                          <X className="h-3 w-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {hasActiveFilters() && (
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm text-gray-600">
                  {Object.values(searchParams).filter(v => v !== 'all' && v !== '').length + searchParams.specialPrograms.length} filters applied
                </span>
                <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={`${className}`}>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Input 
                placeholder="Search schools, districts, or locations..."
                value={searchParams.query}
                onChange={(e) => handleInputChange('query', e.target.value)}
                onFocus={() => setShowHistoryDropdown(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setShowHistoryDropdown(false);
                    executeSearch(searchParams);
                  }
                }}
                className="pl-12 pr-12 h-12"
              />
              <Search className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
              >
                <Clock className="h-4 w-4" />
              </Button>
              
              {/* Search History Dropdown */}
              <SearchHistoryDropdown
                currentQuery={searchParams.query}
                onSelectSearch={(query) => handleInputChange('query', query)}
                isOpen={showHistoryDropdown}
                onToggle={() => setShowHistoryDropdown(!showHistoryDropdown)}
                onClose={() => setShowHistoryDropdown(false)}
              />
              
              {searchParams.query && (
                <SearchSuggestions 
                  query={searchParams.query} 
                  onSelectSuggestion={(suggestion) => {
                    handleInputChange('query', suggestion);
                    setShowHistoryDropdown(false);
                  }}
                  onAutoSearch={handleAutoSearch}
                  className="mt-1"
                />
              )}
            </div>
            <div className="relative">
              <Input 
                placeholder="Enter city, state, or zip code"
                value={searchParams.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="pl-12 h-12"
              />
              <MapPin className="absolute left-4 top-4 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">School Type</label>
              <Select value={searchParams.schoolType} onValueChange={(value) => handleInputChange('schoolType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Grade Level</label>
              <Select value={searchParams.gradeLevel} onValueChange={(value) => handleInputChange('gradeLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(grade => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <Select value={searchParams.rating} onValueChange={(value) => handleInputChange('rating', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  {ratings.map(rating => (
                    <SelectItem key={rating.value} value={rating.value}>
                      {rating.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Distance</label>
              <Select value={searchParams.distance} onValueChange={(value) => handleInputChange('distance', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Any Distance" />
                </SelectTrigger>
                <SelectContent>
                  {distances.map(distance => (
                    <SelectItem key={distance.value} value={distance.value}>
                      {distance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">School Size</label>
            <Select value={searchParams.enrollment} onValueChange={(value) => handleInputChange('enrollment', value)}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Any Size" />
              </SelectTrigger>
              <SelectContent>
                {enrollmentRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Special Programs</label>
            <div className="flex flex-wrap gap-2">
              {specialPrograms.map(program => (
                <Badge
                  key={program}
                  variant={searchParams.specialPrograms.includes(program) ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => handleSpecialProgramToggle(program)}
                >
                  {program}
                  {searchParams.specialPrograms.includes(program) && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Filter className="h-4 w-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
              {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {/* Advanced Filters Section */}
          {showAdvanced && (
            <div className="space-y-6 pt-6 border-t">
              {/* Location Filters */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Location Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Voivodeship</label>
                    <Select value={searchParams.voivodeship} onValueChange={(value) => handleInputChange('voivodeship', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Voivodeships" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Voivodeships</SelectItem>
                        {voivodeships.map(voivodeship => (
                          <SelectItem key={voivodeship} value={voivodeship}>
                            {voivodeship}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">District</label>
                    <Input
                      placeholder="Enter district name"
                      value={searchParams.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Languages Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {languages.map(language => (
                    <Badge
                      key={language}
                      variant={searchParams.languages.includes(language) ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setSearchParams(prev => ({
                          ...prev,
                          languages: prev.languages.includes(language)
                            ? prev.languages.filter(l => l !== language)
                            : [...prev.languages, language]
                        }));
                      }}
                    >
                      {language}
                      {searchParams.languages.includes(language) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Facilities</h3>
                <div className="flex flex-wrap gap-2">
                  {facilities.map(facility => (
                    <Badge
                      key={facility}
                      variant={searchParams.facilities.includes(facility) ? "default" : "secondary"}
                      className="cursor-pointer hover:bg-blue-100"
                      onClick={() => {
                        setSearchParams(prev => ({
                          ...prev,
                          facilities: prev.facilities.includes(facility)
                            ? prev.facilities.filter(f => f !== facility)
                            : [...prev.facilities, facility]
                        }));
                      }}
                    >
                      {facility}
                      {searchParams.facilities.includes(facility) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Establishment Year */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Establishment Year</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Established After</label>
                    <Select value={searchParams.establishedAfter} onValueChange={(value) => handleInputChange('establishedAfter', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        {establishmentYears.map(year => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Established Before</label>
                    <Input
                      type="number"
                      placeholder="e.g., 2000"
                      value={searchParams.establishedBefore}
                      onChange={(e) => handleInputChange('establishedBefore', e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={searchParams.hasImages}
                      onChange={(e) => {
                        setSearchParams(prev => ({
                          ...prev,
                          hasImages: e.target.checked
                        }));
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium">Schools with photos only</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="flex items-center gap-4">
              <Button type="submit" className="px-8">
                <Search className="h-4 w-4 mr-2" />
                Search Schools
              </Button>
              {hasActiveFilters() && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
            {hasActiveFilters() && (
              <span className="text-sm text-gray-600">
                {Object.values(searchParams).filter(v => v !== 'all' && v !== '').length + searchParams.specialPrograms.length} filters applied
              </span>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
