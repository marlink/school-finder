"use client";

import React, { useState, useEffect } from 'react';
import { Filter, X, MapPin, Star, Users, Calendar, Building, Wifi, Car, Utensils, Dumbbell, Microscope, Music, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

interface AdvancedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

const SCHOOL_TYPES = [
  { value: 'primary', label: 'Primary School' },
  { value: 'secondary', label: 'Secondary School' },
  { value: 'high', label: 'High School' },
  { value: 'technical', label: 'Technical School' },
  { value: 'university', label: 'University' },
  { value: 'college', label: 'College' },
];

const VOIVODESHIPS = [
  'Dolnośląskie', 'Kujawsko-pomorskie', 'Lubelskie', 'Lubuskie',
  'Łódzkie', 'Małopolskie', 'Mazowieckie', 'Opolskie',
  'Podkarpackie', 'Podlaskie', 'Pomorskie', 'Śląskie',
  'Świętokrzyskie', 'Warmińsko-mazurskie', 'Wielkopolskie', 'Zachodniopomorskie'
];

const LANGUAGES = [
  'English', 'German', 'French', 'Spanish', 'Italian', 'Russian', 'Chinese', 'Japanese'
];

const SPECIALIZATIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Engineering', 'Medicine', 'Law', 'Economics', 'Arts', 'Music', 'Sports'
];

const FACILITIES = [
  { value: 'library', label: 'Library', icon: Building },
  { value: 'gym', label: 'Gymnasium', icon: Dumbbell },
  { value: 'lab', label: 'Laboratory', icon: Microscope },
  { value: 'cafeteria', label: 'Cafeteria', icon: Utensils },
  { value: 'parking', label: 'Parking', icon: Car },
  { value: 'wifi', label: 'WiFi', icon: Wifi },
  { value: 'music_room', label: 'Music Room', icon: Music },
  { value: 'art_studio', label: 'Art Studio', icon: Palette },
];

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  isOpen,
  onToggle,
  className = ""
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(localFilters).reduce((acc, [key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return acc;
      if (Array.isArray(value) && value.length > 0) return acc + 1;
      if (typeof value === 'string' && value) return acc + 1;
      if (typeof value === 'number' && value > 0) return acc + 1;
      if (typeof value === 'boolean' && value) return acc + 1;
      return acc;
    }, 0);
    setActiveFiltersCount(count);
  }, [localFilters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleArrayFilter = (key: keyof SearchFilters, value: string, checked: boolean) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const updated = checked
      ? [...currentArray, value]
      : currentArray.filter(item => item !== value);
    updateFilter(key, updated);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onApplyFilters();
  };

  const handleClearFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: localFilters.sortBy || 'rating',
      sortOrder: localFilters.sortOrder || 'desc'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={onToggle}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Advanced Filters
        {activeFiltersCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFiltersCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <Card className="mt-4 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Advanced Search Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* School Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>School Type</Label>
                <Select
                  value={localFilters.type || ''}
                  onValueChange={(value) => updateFilter('type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any type</SelectItem>
                    {SCHOOL_TYPES.map((type: { value: string; label: string }) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Voivodeship</Label>
                <Select
                  value={localFilters.voivodeship || ''}
                  onValueChange={(value) => updateFilter('voivodeship', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any voivodeship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any voivodeship</SelectItem>
                    {VOIVODESHIPS.map((voivodeship: string) => (
                      <SelectItem key={voivodeship} value={voivodeship}>
                        {voivodeship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>City</Label>
                <Input
                  placeholder="Enter city name"
                  value={localFilters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>
            </div>

            <Separator />

            {/* Rating & Distance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Minimum Rating</Label>
                <div className="px-2">
                  <Slider
                    value={[localFilters.minRating || 0]}
                    onValueChange={([value]) => updateFilter('minRating', value || undefined)}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>0</span>
                    <span className="font-medium">
                      {localFilters.minRating ? `${localFilters.minRating.toFixed(1)}+` : 'Any'}
                    </span>
                    <span>5</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Maximum Distance (km)</Label>
                <div className="px-2">
                  <Slider
                    value={[localFilters.maxDistance || 50]}
                    onValueChange={([value]) => updateFilter('maxDistance', value)}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>1km</span>
                    <span className="font-medium">
                      {localFilters.maxDistance || 50}km
                    </span>
                    <span>100km</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Student Count Range */}
            <div className="space-y-3">
              <Label>Student Count Range</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="Min students"
                    value={localFilters.minStudents || ''}
                    onChange={(e) => updateFilter('minStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="Max students"
                    value={localFilters.maxStudents || ''}
                    onChange={(e) => updateFilter('maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Establishment Year Range */}
            <div className="space-y-3">
              <Label>Establishment Year</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    placeholder="From year"
                    value={localFilters.establishedAfter || ''}
                    onChange={(e) => updateFilter('establishedAfter', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    placeholder="To year"
                    value={localFilters.establishedBefore || ''}
                    onChange={(e) => updateFilter('establishedBefore', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Languages */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <Label className="cursor-pointer">Languages Offered</Label>
                  <div className="flex items-center gap-2">
                    {(localFilters.languages?.length || 0) > 0 && (
                      <Badge variant="secondary">
                        {localFilters.languages?.length} selected
                      </Badge>
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LANGUAGES.map((language: string) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={`lang-${language}`}
                        checked={(localFilters.languages || []).includes(language)}
                        onCheckedChange={(checked: boolean) => 
                          handleArrayFilter('languages', language, checked)
                        }
                      />
                      <Label htmlFor={`lang-${language}`} className="text-sm">
                        {language}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Specializations */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <Label className="cursor-pointer">Specializations</Label>
                  <div className="flex items-center gap-2">
                    {(localFilters.specializations?.length || 0) > 0 && (
                      <Badge variant="secondary">
                        {localFilters.specializations?.length} selected
                      </Badge>
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {SPECIALIZATIONS.map((spec: string) => (
                    <div key={spec} className="flex items-center space-x-2">
                      <Checkbox
                        id={`spec-${spec}`}
                        checked={(localFilters.specializations || []).includes(spec)}
                        onCheckedChange={(checked: boolean) => 
                          handleArrayFilter('specializations', spec, checked)
                        }
                      />
                      <Label htmlFor={`spec-${spec}`} className="text-sm">
                        {spec}
                      </Label>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Facilities */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <Label className="cursor-pointer">Facilities</Label>
                  <div className="flex items-center gap-2">
                    {(localFilters.facilities?.length || 0) > 0 && (
                      <Badge variant="secondary">
                        {localFilters.facilities?.length} selected
                      </Badge>
                    )}
                  </div>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FACILITIES.map((facility: { value: string; label: string; icon: any }) => {
                    const Icon = facility.icon;
                    return (
                      <div key={facility.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`facility-${facility.value}`}
                          checked={(localFilters.facilities || []).includes(facility.value)}
                          onCheckedChange={(checked: boolean) => 
                            handleArrayFilter('facilities', facility.value, checked)
                          }
                        />
                        <Label htmlFor={`facility-${facility.value}`} className="text-sm flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {facility.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Additional Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasImages"
                  checked={localFilters.hasImages || false}
                  onCheckedChange={(checked: boolean) => updateFilter('hasImages', checked)}
                />
                <Label htmlFor="hasImages">Only schools with photos</Label>
              </div>
            </div>

            <Separator />

            {/* Sort Options */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select
                  value={localFilters.sortBy || 'rating'}
                  onValueChange={(value) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="students">Student Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Select
                  value={localFilters.sortOrder || 'desc'}
                  onValueChange={(value) => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Descending</SelectItem>
                    <SelectItem value="asc">Ascending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleApplyFilters} className="flex-1">
                Apply Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}