"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { cn } from '@/lib/utils';
import SearchSuggestions from './SearchSuggestions';
import SearchHistoryDropdown from './SearchHistoryDropdown';
import { useSearchHistory } from '@/hooks/useSearchHistory';

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

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'school' | 'city' | 'type' | 'recent' | 'trending';
  icon?: React.ReactNode;
  count?: number;
}

interface UnifiedSearchBarProps {
  // Core search functionality
  value?: string;
  onChange?: (value: string) => void;
  onSearch: (query: string | SearchParams) => void;
  
  // Appearance and behavior
  variant?: 'hero' | 'compact' | 'full';
  placeholder?: string;
  className?: string;
  
  // Advanced features
  showAdvancedFilters?: boolean;
  showSuggestions?: boolean;
  onFilterToggle?: () => void;
  filterCount?: number;
  
  // For full SearchForm compatibility
  searchParams?: SearchParams;
  onSearchParamsChange?: (params: SearchParams) => void;
}

// Mock suggestions - in real app, these would come from API
const TRENDING_SEARCHES = [
  { id: '1', text: 'Liceum Ogólnokształcące', type: 'type' as const, count: 156 },
  { id: '2', text: 'Warszawa', type: 'city' as const, count: 89 },
  { id: '3', text: 'Technikum informatyczne', type: 'type' as const, count: 67 },
  { id: '4', text: 'Kraków', type: 'city' as const, count: 45 },
  { id: '5', text: 'Szkoła podstawowa', type: 'type' as const, count: 234 },
];

const defaultSearchParams: SearchParams = {
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
};

export default function UnifiedSearchBar({
  value,
  onChange,
  onSearch,
  variant = 'compact',
  placeholder,
  className,
  showAdvancedFilters = false,
  showSuggestions = true,
  onFilterToggle,
  filterCount = 0,
  searchParams,
  onSearchParamsChange
}: UnifiedSearchBarProps) {
  // Internal state for search query
  const [internalQuery, setInternalQuery] = useState(value || searchParams?.query || '');
  const [internalSearchParams, setInternalSearchParams] = useState<SearchParams>(
    searchParams || defaultSearchParams
  );
  
  // UI state
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSearchRef = useRef<string>('');
  const isSearchingRef = useRef(false);
  
  // Hooks
  const { addSearchQuery } = useSearchHistory();

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('schoolSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Sync with external value changes
  useEffect(() => {
    if (value !== undefined && value !== internalQuery) {
      setInternalQuery(value);
    }
  }, [value]);

  useEffect(() => {
    if (searchParams && searchParams !== internalSearchParams) {
      setInternalSearchParams(searchParams);
      setInternalQuery(searchParams.query);
    }
  }, [searchParams]);

  // Generate suggestions based on input
  useEffect(() => {
    if (!internalQuery.trim()) {
      // Show trending and quick suggestions when empty
      const trendingSuggestions = TRENDING_SEARCHES.map(item => ({
        ...item,
        icon: item.type === 'city' ? <MapPin className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
      }));
      
      const recentSuggestions = searchHistory.slice(0, 3).map((query, index) => ({
        id: `recent-${index}`,
        text: query,
        type: 'recent' as const,
        icon: <Clock className="h-4 w-4" />
      }));

      setSuggestions([...recentSuggestions, ...trendingSuggestions]);
    } else {
      // Filter suggestions based on input
      const filtered = TRENDING_SEARCHES
        .filter(item => item.text.toLowerCase().includes(internalQuery.toLowerCase()))
        .map(item => ({
          ...item,
          icon: item.type === 'city' ? <MapPin className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
        }));
      
      setSuggestions(filtered);
    }
  }, [internalQuery, searchHistory]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get default placeholder based on variant
  const getDefaultPlaceholder = () => {
    switch (variant) {
      case 'hero':
        return "Search schools, districts, or locations...";
      case 'compact':
        return "Szukaj szkół, miast, typów...";
      case 'full':
        return "Search for schools, locations, or specializations...";
      default:
        return "Search schools...";
    }
  };

  const actualPlaceholder = placeholder || getDefaultPlaceholder();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalQuery(newValue);
    
    // Update external state
    if (onChange) {
      onChange(newValue);
    }
    
    if (onSearchParamsChange) {
      const newParams = { ...internalSearchParams, query: newValue };
      setInternalSearchParams(newParams);
      onSearchParamsChange(newParams);
    }
    
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  // Execute search with debouncing
  const executeSearch = useCallback((query?: string, params?: SearchParams) => {
    // Prevent double submission
    if (isSearchingRef.current) {
      return;
    }
    
    isSearchingRef.current = true;
    
    // Clear any pending search timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    const searchQuery = query || internalQuery;
    const searchParameters = params || internalSearchParams;
    
    // Add search query to history if it's not empty
    if (searchQuery.trim()) {
      addSearchQuery(searchQuery);
      
      // Update search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('schoolSearchHistory', JSON.stringify(newHistory));
    }
    
    // Execute search - pass full params for full variant, just query for others
    if (variant === 'full' && showAdvancedFilters) {
      onSearch({ ...searchParameters, query: searchQuery });
    } else {
      onSearch(searchQuery);
    }
    
    lastSearchRef.current = searchQuery;
    setShowDropdown(false);
    inputRef.current?.blur();
    
    // Reset the searching flag after a short delay
    setTimeout(() => {
      isSearchingRef.current = false;
    }, 300);
  }, [internalQuery, internalSearchParams, onSearch, addSearchQuery, searchHistory, variant, showAdvancedFilters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setInternalQuery(suggestion.text);
    if (onChange) {
      onChange(suggestion.text);
    }
    executeSearch(suggestion.text);
  };

  const clearSearch = () => {
    setInternalQuery('');
    if (onChange) {
      onChange('');
    }
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('schoolSearchHistory');
  };

  // Get variant-specific styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: "max-w-2xl mx-auto",
          input: "h-14 text-lg pl-14 pr-32 border-0 shadow-lg focus:ring-2 focus:ring-blue-300",
          icon: "h-6 w-6 left-4 top-4",
          button: "h-14 w-14 ml-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0 shadow-lg rounded-full",
          historyButton: "absolute right-2 top-3 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        };
      case 'compact':
        return {
          container: "max-w-xl",
          input: "h-11 pl-12 pr-28",
          icon: "h-5 w-5 left-3 top-3",
          button: "h-8 px-4 right-1.5 top-1.5",
          historyButton: "absolute right-10 top-1.5 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        };
      case 'full':
        return {
          container: "w-full",
          input: "h-12 pl-12 pr-32",
          icon: "h-5 w-5 left-3 top-3.5",
          button: "h-9 px-4 right-1.5 top-1.5",
          historyButton: "absolute right-12 top-1.5 h-9 w-8 p-0 text-gray-400 hover:text-gray-600"
        };
      default:
        return {
          container: "max-w-xl",
          input: "h-11 pl-12 pr-28",
          icon: "h-5 w-5 left-3 top-3",
          button: "h-8 px-4 right-1.5 top-1.5",
          historyButton: "absolute right-10 top-1.5 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        };
    }
  };

  const styles = getVariantStyles();

  // Hero variant (for homepage)
  if (variant === 'hero') {
    return (
      <form onSubmit={handleSubmit} className={cn(className)}>
        <div className="flex max-w-2xl mx-auto">
          <div ref={searchRef} className="relative flex-1">
            <Input 
              ref={inputRef}
              placeholder={actualPlaceholder}
              value={internalQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setShowDropdown(false);
                  setIsFocused(false);
                  executeSearch();
                }
                if (e.key === 'Escape') {
                  setShowDropdown(false);
                  setIsFocused(false);
                }
              }}
              className={styles.input}
            />
            <Search className={cn("absolute text-gray-400 pointer-events-none", styles.icon)} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDropdown(!showDropdown)}
              className={styles.historyButton}
            >
              <Clock className="h-5 w-5" />
            </Button>
            
            {/* Search History Dropdown */}
            {showSuggestions && (
              <SearchHistoryDropdown
                currentQuery={internalQuery}
                onSelectSearch={(query) => {
                  setInternalQuery(query);
                  if (onChange) onChange(query);
                }}
                isOpen={showDropdown}
                onToggle={() => setShowDropdown(!showDropdown)}
                onClose={() => setShowDropdown(false)}
              />
            )}
            
            {/* Search Suggestions */}
            {showSuggestions && internalQuery && isFocused && (
              <SearchSuggestions 
                query={internalQuery} 
                onSelectSuggestion={(suggestion) => {
                  setInternalQuery(suggestion);
                  if (onChange) onChange(suggestion);
                  setShowDropdown(false);
                  setIsFocused(false);
                }}
                onAutoSearch={(suggestion) => {
                  setInternalQuery(suggestion);
                  if (onChange) onChange(suggestion);
                  executeSearch(suggestion);
                }}
                className="mt-1"
              />
            )}
          </div>
          <Button 
            type="submit"
            className={styles.button}
          >
            <Search className="h-6 w-6" />
          </Button>
        </div>
      </form>
    );
  }

  // Compact variant (for search page)
  return (
    <div ref={searchRef} className={cn("relative w-full", styles.container, className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className={cn("absolute text-gray-400 pointer-events-none", styles.icon)} />
          <Input
            ref={inputRef}
            type="text"
            value={internalQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                executeSearch();
              }
              if (e.key === 'Escape') {
                setShowDropdown(false);
                setIsFocused(false);
              }
            }}
            placeholder={actualPlaceholder}
            className={cn(styles.input, "rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200")}
          />
          
          {/* Clear button */}
          {internalQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-20 top-1.5 h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* History button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            className={styles.historyButton}
          >
            <Clock className="h-4 w-4" />
          </Button>
          
          {/* Search button */}
          <Button
            type="submit"
            size="sm"
            className={cn(styles.button, "bg-blue-600 hover:bg-blue-700 text-white")}
          >
            <Search className="h-4 w-4 mr-1" />
            Szukaj
          </Button>
          
          {/* Filter toggle button */}
          {onFilterToggle && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFilterToggle}
              className="absolute -right-16 top-1.5 h-8 px-3"
            >
              <Filter className="h-4 w-4 mr-1" />
              {filterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                  {filterCount}
                </Badge>
              )}
            </Button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && (isFocused || suggestions.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border border-gray-200">
          <CardContent className="p-0">
            {/* Recent searches */}
            {searchHistory.length > 0 && !internalQuery && (
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Recent searches</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="space-y-1">
                  {searchHistory.slice(0, 5).map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({ id: `recent-${index}`, text: query, type: 'recent' })}
                      className="flex items-center w-full px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded"
                    >
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Trending suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  {internalQuery ? 'Suggestions' : 'Trending searches'}
                </span>
                <div className="space-y-1">
                  {suggestions.slice(0, 5).map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center justify-between w-full px-2 py-1.5 text-sm text-left hover:bg-gray-50 rounded"
                    >
                      <div className="flex items-center">
                        {suggestion.icon}
                        <span className="ml-2">{suggestion.text}</span>
                      </div>
                      {suggestion.count && (
                        <span className="text-xs text-gray-400">{suggestion.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}