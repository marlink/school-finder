"use client";

import { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  MapPin, 
  Star, 
  Users, 
  Calendar, 
  Languages, 
  GraduationCap,
  Building,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
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

interface ImprovedSearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export default function ImprovedSearchFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle,
  className = ""
}: ImprovedSearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [expandedSections, setExpandedSections] = useState({
    location: true,
    rating: false,
    details: false,
    features: false
  });

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Apply filters
  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  // Update local filter
  const updateFilter = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    // Auto-apply for immediate feedback
    onFiltersChange(newFilters);
  };

  // Toggle array filter
  const toggleArrayFilter = (key: 'languages' | 'specializations' | 'facilities', value: string) => {
    const currentArray = localFilters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray);
  };

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.type) count++;
    if (filters.city) count++;
    if (filters.voivodeship) count++;
    if (filters.minRating) count++;
    if (filters.maxDistance) count++;
    if (filters.languages?.length) count++;
    if (filters.specializations?.length) count++;
    if (filters.facilities?.length) count++;
    if (filters.hasImages) count++;
    if (filters.establishedAfter || filters.establishedBefore) count++;
    if (filters.minStudents || filters.maxStudents) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Data for dropdowns
  const voivodeships = [
    'dolnośląskie', 'kujawsko-pomorskie', 'lubelskie', 'lubuskie', 'łódzkie',
    'małopolskie', 'mazowieckie', 'opolskie', 'podkarpackie', 'podlaskie',
    'pomorskie', 'śląskie', 'świętokrzyskie', 'warmińsko-mazurskie',
    'wielkopolskie', 'zachodniopomorskie'
  ];

  const schoolTypes = [
    'Przedszkole', 'Szkoła podstawowa', 'Gimnazjum', 'Liceum', 
    'Technikum', 'Szkoła zawodowa', 'Szkoła policealna', 'Uniwersytet'
  ];

  const languages = [
    'Angielski', 'Niemiecki', 'Francuski', 'Hiszpański', 'Włoski', 
    'Rosyjski', 'Chiński', 'Japoński'
  ];

  const specializations = [
    'Informatyka', 'Matematyka', 'Biologia', 'Chemia', 'Fizyka',
    'Historia', 'Geografia', 'Języki obce', 'Sztuka', 'Muzyka',
    'Sport', 'Ekonomia', 'Prawo'
  ];

  const facilities = [
    'Biblioteka', 'Laboratorium', 'Sala gimnastyczna', 'Boisko',
    'Stołówka', 'Internat', 'Parking', 'Sala komputerowa',
    'Pracownia językowa', 'Sala konferencyjna'
  ];

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className={`flex items-center gap-2 ${className}`}
      >
        <Filter className="w-4 h-4" />
        Filters
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Search Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Location Filters */}
        <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Location</span>
              </div>
              {expandedSections.location ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voivodeship">Voivodeship</Label>
                <Select value={localFilters.voivodeship || ""} onValueChange={(value) => updateFilter('voivodeship', value || undefined)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voivodeship" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All voivodeships</SelectItem>
                    {voivodeships.map(voivodeship => (
                      <SelectItem key={voivodeship} value={voivodeship}>
                        {voivodeship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city name"
                  value={localFilters.city || ""}
                  onChange={(e) => updateFilter('city', e.target.value || undefined)}
                />
              </div>
            </div>

            {/* Distance Filter */}
            <div>
              <Label>Maximum Distance: {localFilters.maxDistance || 50} km</Label>
              <Slider
                value={[localFilters.maxDistance || 50]}
                onValueChange={([value]) => updateFilter('maxDistance', value)}
                max={100}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* School Type & Rating */}
        <Collapsible open={expandedSections.rating} onOpenChange={() => toggleSection('rating')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">Type & Rating</span>
              </div>
              {expandedSections.rating ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div>
              <Label htmlFor="type">School Type</Label>
              <Select value={localFilters.type || ""} onValueChange={(value) => updateFilter('type', value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  {schoolTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Minimum Rating: {localFilters.minRating || 0}</Label>
              <Slider
                value={[localFilters.minRating || 0]}
                onValueChange={([value]) => updateFilter('minRating', value)}
                max={5}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* School Details */}
        <Collapsible open={expandedSections.details} onOpenChange={() => toggleSection('details')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-green-500" />
                <span className="font-medium">School Details</span>
              </div>
              {expandedSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="establishedAfter">Established After</Label>
                <Input
                  id="establishedAfter"
                  type="number"
                  placeholder="e.g., 2000"
                  value={localFilters.establishedAfter || ""}
                  onChange={(e) => updateFilter('establishedAfter', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="establishedBefore">Established Before</Label>
                <Input
                  id="establishedBefore"
                  type="number"
                  placeholder="e.g., 2020"
                  value={localFilters.establishedBefore || ""}
                  onChange={(e) => updateFilter('establishedBefore', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minStudents">Min Students</Label>
                <Input
                  id="minStudents"
                  type="number"
                  placeholder="e.g., 100"
                  value={localFilters.minStudents || ""}
                  onChange={(e) => updateFilter('minStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="e.g., 1000"
                  value={localFilters.maxStudents || ""}
                  onChange={(e) => updateFilter('maxStudents', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasImages"
                checked={localFilters.hasImages || false}
                onCheckedChange={(checked) => updateFilter('hasImages', checked || undefined)}
              />
              <Label htmlFor="hasImages">Has Images</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Features */}
        <Collapsible open={expandedSections.features} onOpenChange={() => toggleSection('features')}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-purple-500" />
                <span className="font-medium">Languages & Features</span>
              </div>
              {expandedSections.features ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Languages */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Languages</Label>
              <div className="flex flex-wrap gap-2">
                {languages.map(language => (
                  <Badge
                    key={language}
                    variant={localFilters.languages?.includes(language) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => toggleArrayFilter('languages', language)}
                  >
                    {language}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Specializations */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Specializations</Label>
              <div className="flex flex-wrap gap-2">
                {specializations.map(spec => (
                  <Badge
                    key={spec}
                    variant={localFilters.specializations?.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => toggleArrayFilter('specializations', spec)}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Facilities */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Facilities</Label>
              <div className="flex flex-wrap gap-2">
                {facilities.map(facility => (
                  <Badge
                    key={facility}
                    variant={localFilters.facilities?.includes(facility) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-purple-50 transition-colors"
                    onClick={() => toggleArrayFilter('facilities', facility)}
                  >
                    {facility}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}