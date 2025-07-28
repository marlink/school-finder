"use client";

import React, { useState, useEffect } from 'react';
import { Filter, X, MapPin, Star, Users, Calendar, Building, Languages, Award, Image, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
  onClearFilters: () => void;
  className?: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Quick filter presets
const QUICK_FILTERS = [
  { label: 'Najlepiej oceniane', filters: { minRating: 4.0, sortBy: 'rating' as const, sortOrder: 'desc' as const } },
  { label: 'Blisko mnie', filters: { maxDistance: 5, sortBy: 'distance' as const, sortOrder: 'asc' as const } },
  { label: 'Duże szkoły', filters: { minStudents: 500, sortBy: 'students' as const, sortOrder: 'desc' as const } },
  { label: 'Licea', filters: { type: 'Liceum Ogólnokształcące' } },
  { label: 'Technika', filters: { type: 'Technikum' } },
  { label: 'Podstawówki', filters: { type: 'Szkoła Podstawowa' } },
];

// Polish voivodeships
const VOIVODESHIPS = [
  'Dolnośląskie', 'Kujawsko-pomorskie', 'Lubelskie', 'Lubuskie', 'Łódzkie',
  'Małopolskie', 'Mazowieckie', 'Opolskie', 'Podkarpackie', 'Podlaskie',
  'Pomorskie', 'Śląskie', 'Świętokrzyskie', 'Warmińsko-mazurskie',
  'Wielkopolskie', 'Zachodniopomorskie'
];

// School types
const SCHOOL_TYPES = [
  'Szkoła Podstawowa',
  'Liceum Ogólnokształcące',
  'Technikum',
  'Szkoła Branżowa',
  'Gimnazjum',
  'Przedszkole'
];

// Common languages
const LANGUAGES = [
  'Angielski', 'Niemiecki', 'Francuski', 'Hiszpański', 'Włoski', 'Rosyjski', 'Chiński', 'Japoński'
];

// Common specializations
const SPECIALIZATIONS = [
  'Informatyka', 'Matematyka', 'Biologia', 'Chemia', 'Fizyka', 'Geografia',
  'Historia', 'Język polski', 'Języki obce', 'Sztuka', 'Muzyka', 'Sport'
];

// Common facilities
const FACILITIES = [
  'Biblioteka', 'Sala gimnastyczna', 'Boisko', 'Laboratorium', 'Pracownia komputerowa',
  'Stołówka', 'Parking', 'Sala konferencyjna', 'Aula', 'Basen'
];

export default function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
  isOpen = false,
  onToggle
}: AdvancedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    type: true,
    rating: false,
    academic: false,
    facilities: false,
    other: false
  });

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const toggleArrayFilter = (key: 'languages' | 'specializations' | 'facilities', value: string) => {
    const currentArray = localFilters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  const applyQuickFilter = (quickFilter: typeof QUICK_FILTERS[0]) => {
    const newFilters = { ...localFilters, ...quickFilter.filters };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters: SearchFilters = {
      sortBy: 'rating',
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.type) count++;
    if (localFilters.city) count++;
    if (localFilters.voivodeship) count++;
    if (localFilters.minRating) count++;
    if (localFilters.maxDistance) count++;
    if (localFilters.languages?.length) count++;
    if (localFilters.specializations?.length) count++;
    if (localFilters.facilities?.length) count++;
    if (localFilters.hasImages) count++;
    if (localFilters.establishedAfter || localFilters.establishedBefore) count++;
    if (localFilters.minStudents || localFilters.maxStudents) count++;
    return count;
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-orange-500" />
            Filtry wyszukiwania
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Wyczyść
              </Button>
            )}
            {onToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="lg:hidden"
              >
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        {/* Quick Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Szybkie filtry</Label>
          <div className="flex flex-wrap gap-2">
            {QUICK_FILTERS.map((quickFilter, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyQuickFilter(quickFilter)}
                className="text-xs hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700"
              >
                {quickFilter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("space-y-6", !isOpen && "hidden lg:block")}>
        {/* Location Filters */}
        <Collapsible
          open={expandedSections.location}
          onOpenChange={() => toggleSection('location')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Lokalizacja</span>
            </div>
            {expandedSections.location ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="voivodeship">Województwo</Label>
                <Select
                  value={localFilters.voivodeship || ''}
                  onValueChange={(value) => updateFilter('voivodeship', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz województwo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Wszystkie</SelectItem>
                    {VOIVODESHIPS.map(voivodeship => (
                      <SelectItem key={voivodeship} value={voivodeship}>
                        {voivodeship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Miasto</Label>
                <Input
                  id="city"
                  placeholder="Wpisz nazwę miasta"
                  value={localFilters.city || ''}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Maksymalna odległość: {localFilters.maxDistance || 50} km</Label>
              <Slider
                value={[localFilters.maxDistance || 50]}
                onValueChange={([value]) => updateFilter('maxDistance', value)}
                max={100}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* School Type Filters */}
        <Collapsible
          open={expandedSections.type}
          onOpenChange={() => toggleSection('type')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-green-500" />
              <span className="font-medium">Typ szkoły</span>
            </div>
            {expandedSections.type ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <Select
              value={localFilters.type || ''}
              onValueChange={(value) => updateFilter('type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ szkoły" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Wszystkie typy</SelectItem>
                {SCHOOL_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Rating & Quality Filters */}
        <Collapsible
          open={expandedSections.rating}
          onOpenChange={() => toggleSection('rating')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Oceny i jakość</span>
            </div>
            {expandedSections.rating ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Minimalna ocena: {localFilters.minRating || 0}/5</Label>
              <Slider
                value={[localFilters.minRating || 0]}
                onValueChange={([value]) => updateFilter('minRating', value)}
                max={5}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="hasImages"
                checked={localFilters.hasImages || false}
                onCheckedChange={(checked) => updateFilter('hasImages', checked || undefined)}
              />
              <Label htmlFor="hasImages" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                Tylko szkoły ze zdjęciami
              </Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Academic Filters */}
        <Collapsible
          open={expandedSections.academic}
          onOpenChange={() => toggleSection('academic')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Languages className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Oferta edukacyjna</span>
            </div>
            {expandedSections.academic ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>Języki obce</Label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map(language => (
                  <Button
                    key={language}
                    variant={localFilters.languages?.includes(language) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('languages', language)}
                    className="text-xs"
                  >
                    {language}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Specjalizacje</Label>
              <div className="flex flex-wrap gap-2">
                {SPECIALIZATIONS.map(spec => (
                  <Button
                    key={spec}
                    variant={localFilters.specializations?.includes(spec) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('specializations', spec)}
                    className="text-xs"
                  >
                    {spec}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Facilities Filters */}
        <Collapsible
          open={expandedSections.facilities}
          onOpenChange={() => toggleSection('facilities')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-500" />
              <span className="font-medium">Udogodnienia</span>
            </div>
            {expandedSections.facilities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-3">
              <Label>Dostępne udogodnienia</Label>
              <div className="flex flex-wrap gap-2">
                {FACILITIES.map(facility => (
                  <Button
                    key={facility}
                    variant={localFilters.facilities?.includes(facility) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleArrayFilter('facilities', facility)}
                    className="text-xs"
                  >
                    {facility}
                  </Button>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Other Filters */}
        <Collapsible
          open={expandedSections.other}
          onOpenChange={() => toggleSection('other')}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Inne kryteria</span>
            </div>
            {expandedSections.other ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="establishedAfter">Założona po roku</Label>
                <Input
                  id="establishedAfter"
                  type="number"
                  placeholder="np. 2000"
                  value={localFilters.establishedAfter || ''}
                  onChange={(e) => updateFilter('establishedAfter', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="establishedBefore">Założona przed rokiem</Label>
                <Input
                  id="establishedBefore"
                  type="number"
                  placeholder="np. 2020"
                  value={localFilters.establishedBefore || ''}
                  onChange={(e) => updateFilter('establishedBefore', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStudents">Minimalna liczba uczniów</Label>
                <Input
                  id="minStudents"
                  type="number"
                  placeholder="np. 100"
                  value={localFilters.minStudents || ''}
                  onChange={(e) => updateFilter('minStudents', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxStudents">Maksymalna liczba uczniów</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="np. 1000"
                  value={localFilters.maxStudents || ''}
                  onChange={(e) => updateFilter('maxStudents', e.target.value ? Number(e.target.value) : undefined)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}