"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X, Sparkles, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'school' | 'city' | 'type' | 'recent' | 'trending';
  icon?: React.ReactNode;
  count?: number;
}

interface EnhancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  variant?: 'hero' | 'compact' | 'default';
  className?: string;
  showSuggestions?: boolean;
  onFilterToggle?: () => void;
  filterCount?: number;
}

// Mock suggestions - in real app, these would come from API
const TRENDING_SEARCHES = [
  { id: '1', text: 'Liceum Ogólnokształcące', type: 'type' as const, count: 156 },
  { id: '2', text: 'Warszawa', type: 'city' as const, count: 89 },
  { id: '3', text: 'Technikum informatyczne', type: 'type' as const, count: 67 },
  { id: '4', text: 'Kraków', type: 'city' as const, count: 45 },
  { id: '5', text: 'Szkoła podstawowa', type: 'type' as const, count: 234 },
];

const QUICK_SUGGESTIONS = [
  { id: 'q1', text: 'Najlepiej oceniane szkoły', type: 'trending' as const },
  { id: 'q2', text: 'Szkoły w mojej okolicy', type: 'trending' as const },
  { id: 'q3', text: 'Licea z rozszerzonym angielskim', type: 'trending' as const },
  { id: 'q4', text: 'Technika informatyczne', type: 'trending' as const },
];

export default function EnhancedSearchBar({
  value,
  onChange,
  onSearch,
  placeholder = "Szukaj szkół, miast, typów...",
  variant = 'default',
  className,
  showSuggestions = true,
  onFilterToggle,
  filterCount = 0
}: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('schoolSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Generate suggestions based on input
  useEffect(() => {
    if (!value.trim()) {
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
        .filter(item => item.text.toLowerCase().includes(value.toLowerCase()))
        .map(item => ({
          ...item,
          icon: item.type === 'city' ? <MapPin className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
        }));
      
      setSuggestions(filtered);
    }
  }, [value, searchHistory]);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowDropdown(true);
  };

  const handleSearch = (query?: string) => {
    const searchQuery = query || value;
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('schoolSearchHistory', JSON.stringify(newHistory));
      
      onSearch(searchQuery);
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    handleSearch(suggestion.text);
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('schoolSearchHistory');
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'hero':
        return {
          container: "max-w-2xl mx-auto",
          input: "h-14 text-lg pl-14 pr-32",
          icon: "h-6 w-6 left-4",
          button: "h-10 px-6 right-2 top-2"
        };
      case 'compact':
        return {
          container: "max-w-md",
          input: "h-9 text-sm pl-10 pr-24",
          icon: "h-4 w-4 left-3",
          button: "h-7 px-3 right-1 top-1 text-xs"
        };
      default:
        return {
          container: "max-w-xl",
          input: "h-11 pl-12 pr-28",
          icon: "h-5 w-5 left-3",
          button: "h-8 px-4 right-1.5 top-1.5"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div ref={searchRef} className={cn("relative w-full", styles.container, className)}>
      {/* Main Search Input */}
      <div className="relative">
        <Search className={cn("absolute text-gray-400 pointer-events-none", styles.icon)} />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setShowDropdown(false);
              inputRef.current?.blur();
            }
          }}
          placeholder={placeholder}
          className={cn(
            "w-full border-2 transition-all duration-200",
            styles.input,
            isFocused 
              ? "border-orange-300 ring-2 ring-orange-100 shadow-lg" 
              : "border-gray-200 hover:border-gray-300"
          )}
        />
        
        {/* Clear button */}
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-20 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Filter toggle button */}
        {onFilterToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFilterToggle}
            className={cn(
              "absolute top-1/2 -translate-y-1/2 h-8 px-2 hover:bg-gray-100",
              variant === 'compact' ? "right-8" : "right-12"
            )}
          >
            <Filter className="h-4 w-4" />
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
                {filterCount}
              </Badge>
            )}
          </Button>
        )}
        
        {/* Search button */}
        <Button
          onClick={() => handleSearch()}
          className={cn("absolute", styles.button)}
          size={variant === 'compact' ? 'sm' : 'default'}
        >
          {variant === 'compact' ? 'Szukaj' : 'Szukaj'}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && showDropdown && (
        <Card className="absolute top-full left-0 right-0 mt-2 shadow-xl border-2 border-gray-100 z-[9999] max-h-96 overflow-hidden">
          <CardContent className="p-0">
            {/* Quick suggestions when empty */}
            {!value.trim() && (
              <>
                {searchHistory.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Ostatnie wyszukiwania
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearHistory}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Wyczyść
                      </Button>
                    </div>
                    <div className="space-y-1">
                      {searchHistory.slice(0, 3).map((query, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick({ id: `recent-${index}`, text: query, type: 'recent' })}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Szybkie wyszukiwania
                  </h4>
                  <div className="space-y-1">
                    {QUICK_SUGGESTIONS.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-3"
                      >
                        <Sparkles className="h-4 w-4 text-orange-500" />
                        <span className="text-sm">{suggestion.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popularne wyszukiwania
                  </h4>
                  <div className="space-y-1">
                    {TRENDING_SEARCHES.slice(0, 5).map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          {suggestion.type === 'city' ? (
                            <MapPin className="h-4 w-4 text-blue-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          )}
                          <span className="text-sm">{suggestion.text}</span>
                        </div>
                        {suggestion.count && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Filtered suggestions when typing */}
            {value.trim() && suggestions.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Sugestie dla "{value}"
                </h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        {suggestion.icon}
                        <span className="text-sm">
                          {suggestion.text.split(new RegExp(`(${value})`, 'gi')).map((part, index) =>
                            part.toLowerCase() === value.toLowerCase() ? (
                              <mark key={index} className="bg-yellow-200 px-0">
                                {part}
                              </mark>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      </div>
                      {suggestion.count && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.count}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No suggestions */}
            {value.trim() && suggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Brak sugestii dla "{value}"</p>
                <p className="text-xs text-gray-400 mt-1">Spróbuj wpisać nazwę szkoły, miasta lub typu</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}