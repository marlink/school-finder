"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Filter, 
  X, 
  MapPin, 
  GraduationCap, 
  Users, 
  Star,
  Calendar,
  Languages,
  Building,
  Wifi,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from "lucide-react";

interface FilterOptions {
  types: Array<{ value: string; label: string; count: number }>;
  locations: {
    voivodeships: Array<{ value: string; label: string; count: number }>;
    cities: Array<{ value: string; label: string; count: number; voivodeship: string }>;
    districts: Array<{ value: string; label: string; count: number; voivodeship: string }>;
  };
  languages: Array<{ value: string; label: string; count: number }>;
  specializations: Array<{ value: string; label: string; count: number }>;
  facilities: Array<{ value: string; label: string; count: number }>;
  studentRanges: {
    min: number;
    max: number;
    ranges: Array<{ value: string; label: string; min: number; max: number }>;
  };
  yearRanges: {
    min: number;
    max: number;
    ranges: Array<{ value: string; label: string; min: number; max: number }>;
  };
  ratingRanges: {
    min: number;
    max: number;
    ranges: Array<{ value: string; label: string; min: number; max: number }>;
  };
  distanceRanges: {
    ranges: Array<{ value: string; label: string; max: number }>;
  };
}

export interface FilterValues {
  query: string;
  location: string;
  schoolType: string;
  voivodeship: string;
  district: string;
  languages: string[];
  specializations: string[];
  facilities: string[];
  studentCountRange: [number, number];
  establishedYearRange: [number, number];
  ratingRange: [number, number];
  maxDistance: number;
  hasImages: boolean;
  hasSpecialNeeds: boolean;
  hasTransport: boolean;
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  layout?: 'horizontal' | 'vertical' | 'mixed';
  className?: string;
  language?: 'en' | 'pl';
}

// Translations
const translations = {
  en: {
    searchPlaceholder: "Search schools, districts, or locations...",
    locationPlaceholder: "Enter city, voivodeship, or district...",
    schoolType: "School Type",
    allTypes: "All Types",
    location: "Location",
    voivodeship: "Voivodeship",
    allVoivodeships: "All Voivodeships",
    district: "District",
    districtPlaceholder: "Enter district name",
    languages: "Languages",
    specializations: "Specializations",
    facilities: "Facilities",
    studentCount: "Student Count",
    establishedYear: "Established Year",
    rating: "Minimum Rating",
    distance: "Maximum Distance",
    additionalOptions: "Additional Options",
    hasImages: "Schools with photos only",
    hasSpecialNeeds: "Special needs support",
    hasTransport: "School transport available",
    clearFilters: "Clear All Filters",
    applyFilters: "Apply Filters",
    filtersApplied: "filters applied",
    km: "km",
    students: "students",
    basicFilters: "Basic Filters",
    advancedFilters: "Advanced Filters",
    showMore: "Show More",
    showLess: "Show Less",
    or: "or",
    after: "After",
    before: "Before",
    within: "Within"
  },
  pl: {
    searchPlaceholder: "Szukaj szkół, dzielnic lub lokalizacji...",
    locationPlaceholder: "Wpisz miasto, województwo lub dzielnicę...",
    schoolType: "Typ Szkoły",
    allTypes: "Wszystkie Typy",
    location: "Lokalizacja",
    voivodeship: "Województwo",
    allVoivodeships: "Wszystkie Województwa",
    district: "Dzielnica",
    districtPlaceholder: "Wpisz nazwę dzielnicy",
    languages: "Języki",
    specializations: "Specjalizacje",
    facilities: "Udogodnienia",
    studentCount: "Liczba Uczniów",
    establishedYear: "Rok Założenia",
    rating: "Minimalna Ocena",
    distance: "Maksymalna Odległość",
    additionalOptions: "Dodatkowe Opcje",
    hasImages: "Tylko szkoły ze zdjęciami",
    hasSpecialNeeds: "Wsparcie specjalne",
    hasTransport: "Transport szkolny dostępny",
    clearFilters: "Wyczyść Wszystkie Filtry",
    applyFilters: "Zastosuj Filtry",
    filtersApplied: "zastosowanych filtrów",
    km: "km",
    students: "uczniów",
    basicFilters: "Podstawowe Filtry",
    advancedFilters: "Zaawansowane Filtry",
    showMore: "Pokaż Więcej",
    showLess: "Pokaż Mniej",
    or: "lub",
    after: "Po",
    before: "Przed",
    within: "W promieniu"
  }
};

export default function AdvancedFilters({ 
  onFilterChange, 
  layout = 'mixed', 
  className = '',
  language = 'pl'
}: AdvancedFiltersProps) {
  const t = translations[language];
  
  const [filters, setFilters] = useState<FilterValues>({
    query: '',
    location: '',
    schoolType: '',
    voivodeship: '',
    district: '',
    languages: [],
    specializations: [],
    facilities: [],
    studentCountRange: [0, 3000],
    establishedYearRange: [1900, new Date().getFullYear()],
    ratingRange: [0, 5],
    maxDistance: 50,
    hasImages: false,
    hasSpecialNeeds: false,
    hasTransport: false
  });

  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  // Load filter options
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/search/filters');
      if (response.ok) {
        const data = await response.json();
        setFilterOptions(data.filters);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleArrayToggle = (key: 'languages' | 'specializations' | 'facilities', value: string) => {
    const currentArray = filters[key];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    handleFilterChange(key, newArray);
  };

  const clearAllFilters = () => {
    const clearedFilters: FilterValues = {
      query: '',
      location: '',
      schoolType: '',
      voivodeship: '',
      district: '',
      languages: [],
      specializations: [],
      facilities: [],
      studentCountRange: [0, 3000],
      establishedYearRange: [1900, new Date().getFullYear()],
      ratingRange: [0, 5],
      maxDistance: 50,
      hasImages: false,
      hasSpecialNeeds: false,
      hasTransport: false
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.location) count++;
    if (filters.schoolType) count++;
    if (filters.voivodeship) count++;
    if (filters.district) count++;
    if (filters.languages.length > 0) count++;
    if (filters.specializations.length > 0) count++;
    if (filters.facilities.length > 0) count++;
    if (filters.studentCountRange[0] > 0 || filters.studentCountRange[1] < 3000) count++;
    if (filters.establishedYearRange[0] > 1900 || filters.establishedYearRange[1] < new Date().getFullYear()) count++;
    if (filters.ratingRange[0] > 0) count++;
    if (filters.maxDistance < 50) count++;
    if (filters.hasImages) count++;
    if (filters.hasSpecialNeeds) count++;
    if (filters.hasTransport) count++;
    return count;
  };

  const renderBadgeList = (
    items: Array<{ value: string; label: string; count?: number }>,
    selectedItems: string[],
    onToggle: (value: string) => void,
    maxVisible: number = 10
  ) => {
    const [showAll, setShowAll] = useState(false);
    const visibleItems = showAll ? items : items.slice(0, maxVisible);

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {visibleItems.map(item => (
            <Badge
              key={item.value}
              variant={selectedItems.includes(item.value) ? "default" : "secondary"}
              className="cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => onToggle(item.value)}
            >
              {item.label}
              {item.count && ` (${item.count})`}
              {selectedItems.includes(item.value) && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
        {items.length > maxVisible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-700"
          >
            {showAll ? t.showLess : t.showMore}
            {showAll ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
          </Button>
        )}
      </div>
    );
  };

  if (loading || !filterOptions) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (layout === 'horizontal') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder={t.searchPlaceholder}
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                className="h-10"
              />
            </div>
            <div>
              <Select value={filters.schoolType} onValueChange={(value) => handleFilterChange('schoolType', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.schoolType} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.allTypes}</SelectItem>
                  {filterOptions.types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filters.voivodeship} onValueChange={(value) => handleFilterChange('voivodeship', value)}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={t.voivodeship} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t.allVoivodeships}</SelectItem>
                  {filterOptions.locations.voivodeships.map(voivodeship => (
                    <SelectItem key={voivodeship.value} value={voivodeship.value}>
                      {voivodeship.label} ({voivodeship.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <Slider
                  value={[filters.ratingRange[0]]}
                  onValueChange={(value) => handleFilterChange('ratingRange', [value[0], filters.ratingRange[1]])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{filters.ratingRange[0]}+</span>
              </div>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="h-10 w-full"
              >
                <Filter className="h-4 w-4 mr-2" />
                {t.advancedFilters}
              </Button>
            </div>
          </div>
          
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.languages}</Label>
                  {renderBadgeList(
                    filterOptions.languages,
                    filters.languages,
                    (value) => handleArrayToggle('languages', value),
                    6
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.specializations}</Label>
                  {renderBadgeList(
                    filterOptions.specializations,
                    filters.specializations,
                    (value) => handleArrayToggle('specializations', value),
                    6
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.facilities}</Label>
                  {renderBadgeList(
                    filterOptions.facilities,
                    filters.facilities,
                    (value) => handleArrayToggle('facilities', value),
                    6
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={clearAllFilters}
                disabled={getActiveFiltersCount() === 0}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {t.clearFilters}
              </Button>
              {getActiveFiltersCount() > 0 && (
                <span className="text-sm text-gray-600">
                  {getActiveFiltersCount()} {t.filtersApplied}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (layout === 'vertical') {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.advancedFilters}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
            <AccordionItem value="basic">
              <AccordionTrigger>{t.basicFilters}</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.searchPlaceholder}</Label>
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={filters.query}
                    onChange={(e) => handleFilterChange('query', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.schoolType}</Label>
                  <Select value={filters.schoolType} onValueChange={(value) => handleFilterChange('schoolType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.allTypes} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t.allTypes}</SelectItem>
                      {filterOptions.types.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label} ({type.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">{t.voivodeship}</Label>
                  <Select value={filters.voivodeship} onValueChange={(value) => handleFilterChange('voivodeship', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.allVoivodeships} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t.allVoivodeships}</SelectItem>
                      {filterOptions.locations.voivodeships.map(voivodeship => (
                        <SelectItem key={voivodeship.value} value={voivodeship.value}>
                          {voivodeship.label} ({voivodeship.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="languages">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  {t.languages}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderBadgeList(
                  filterOptions.languages,
                  filters.languages,
                  (value) => handleArrayToggle('languages', value)
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="specializations">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  {t.specializations}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderBadgeList(
                  filterOptions.specializations,
                  filters.specializations,
                  (value) => handleArrayToggle('specializations', value)
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="facilities">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  {t.facilities}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {renderBadgeList(
                  filterOptions.facilities,
                  filters.facilities,
                  (value) => handleArrayToggle('facilities', value)
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ranges">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  {t.studentCount} & {t.rating}
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t.studentCount}: {filters.studentCountRange[0]} - {filters.studentCountRange[1]} {t.students}
                  </Label>
                  <Slider
                    value={filters.studentCountRange}
                    onValueChange={(value) => handleFilterChange('studentCountRange', value)}
                    max={3000}
                    min={0}
                    step={50}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t.rating}: {filters.ratingRange[0]}+ {t.or} {filters.ratingRange[1]}
                  </Label>
                  <Slider
                    value={[filters.ratingRange[0]]}
                    onValueChange={(value) => handleFilterChange('ratingRange', [value[0], 5])}
                    max={5}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    {t.distance}: {t.within} {filters.maxDistance} {t.km}
                  </Label>
                  <Slider
                    value={[filters.maxDistance]}
                    onValueChange={(value) => handleFilterChange('maxDistance', value[0])}
                    max={100}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="additional">
              <AccordionTrigger>{t.additionalOptions}</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasImages"
                    checked={filters.hasImages}
                    onCheckedChange={(checked) => handleFilterChange('hasImages', checked)}
                  />
                  <Label htmlFor="hasImages" className="text-sm">
                    {t.hasImages}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSpecialNeeds"
                    checked={filters.hasSpecialNeeds}
                    onCheckedChange={(checked) => handleFilterChange('hasSpecialNeeds', checked)}
                  />
                  <Label htmlFor="hasSpecialNeeds" className="text-sm">
                    {t.hasSpecialNeeds}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTransport"
                    checked={filters.hasTransport}
                    onCheckedChange={(checked) => handleFilterChange('hasTransport', checked)}
                  />
                  <Label htmlFor="hasTransport" className="text-sm">
                    {t.hasTransport}
                  </Label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex flex-col space-y-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t.clearFilters}
            </Button>
            {getActiveFiltersCount() > 0 && (
              <div className="text-center text-sm text-gray-600">
                {getActiveFiltersCount()} {t.filtersApplied}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mixed layout (default)
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">{t.basicFilters}</TabsTrigger>
            <TabsTrigger value="advanced">{t.advancedFilters}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">{t.searchPlaceholder}</Label>
                <Input
                  placeholder={t.searchPlaceholder}
                  value={filters.query}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">{t.location}</Label>
                <Input
                  placeholder={t.locationPlaceholder}
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">{t.schoolType}</Label>
                <Select value={filters.schoolType} onValueChange={(value) => handleFilterChange('schoolType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.allTypes} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.allTypes}</SelectItem>
                    {filterOptions.types.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} ({type.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">{t.voivodeship}</Label>
                <Select value={filters.voivodeship} onValueChange={(value) => handleFilterChange('voivodeship', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.allVoivodeships} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t.allVoivodeships}</SelectItem>
                    {filterOptions.locations.voivodeships.map(voivodeship => (
                      <SelectItem key={voivodeship.value} value={voivodeship.value}>
                        {voivodeship.label} ({voivodeship.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t.rating}: {filters.ratingRange[0]}+
                </Label>
                <Slider
                  value={[filters.ratingRange[0]]}
                  onValueChange={(value) => handleFilterChange('ratingRange', [value[0], 5])}
                  max={5}
                  min={0}
                  step={0.5}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  {t.distance}: {filters.maxDistance} {t.km}
                </Label>
                <Slider
                  value={[filters.maxDistance]}
                  onValueChange={(value) => handleFilterChange('maxDistance', value[0])}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-6">
            <div>
              <Label className="text-sm font-medium mb-3 block">{t.languages}</Label>
              {renderBadgeList(
                filterOptions.languages,
                filters.languages,
                (value) => handleArrayToggle('languages', value)
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">{t.specializations}</Label>
              {renderBadgeList(
                filterOptions.specializations,
                filters.specializations,
                (value) => handleArrayToggle('specializations', value)
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-3 block">{t.facilities}</Label>
              {renderBadgeList(
                filterOptions.facilities,
                filters.facilities,
                (value) => handleArrayToggle('facilities', value)
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t.studentCount}: {filters.studentCountRange[0]} - {filters.studentCountRange[1]} {t.students}
              </Label>
              <Slider
                value={filters.studentCountRange}
                onValueChange={(value) => handleFilterChange('studentCountRange', value)}
                max={3000}
                min={0}
                step={50}
                className="w-full"
              />
            </div>
            
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t.establishedYear}: {filters.establishedYearRange[0]} - {filters.establishedYearRange[1]}
              </Label>
              <Slider
                value={filters.establishedYearRange}
                onValueChange={(value) => handleFilterChange('establishedYearRange', value)}
                max={new Date().getFullYear()}
                min={1900}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t.additionalOptions}</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasImages"
                    checked={filters.hasImages}
                    onCheckedChange={(checked) => handleFilterChange('hasImages', checked)}
                  />
                  <Label htmlFor="hasImages" className="text-sm">
                    {t.hasImages}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasSpecialNeeds"
                    checked={filters.hasSpecialNeeds}
                    onCheckedChange={(checked) => handleFilterChange('hasSpecialNeeds', checked)}
                  />
                  <Label htmlFor="hasSpecialNeeds" className="text-sm">
                    {t.hasSpecialNeeds}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTransport"
                    checked={filters.hasTransport}
                    onCheckedChange={(checked) => handleFilterChange('hasTransport', checked)}
                  />
                  <Label htmlFor="hasTransport" className="text-sm">
                    {t.hasTransport}
                  </Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={clearAllFilters}
            disabled={getActiveFiltersCount() === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {t.clearFilters}
          </Button>
          {getActiveFiltersCount() > 0 && (
            <span className="text-sm text-gray-600">
              {getActiveFiltersCount()} {t.filtersApplied}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
