"use client";

import { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Clock, TrendingUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'location' | 'school_type' | 'suggestion';
  count?: number;
  metadata?: {
    city?: string;
    voivodeship?: string;
    schoolType?: string;
  };
}

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  onClearHistory?: () => void;
  className?: string;
}

export default function SearchSuggestions({
  query,
  onSuggestionClick,
  onClearHistory,
  className = ""
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('school-search-history');
    if (stored) {
      try {
        const history = JSON.parse(stored);
        setRecentSearches(history.slice(0, 5)); // Keep only last 5
      } catch (error) {
        console.error('Error loading search history:', error);
      }
    }
  }, []);

  // Fetch suggestions from API
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced suggestion fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Save search to history
  const saveToHistory = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const newHistory = [searchTerm, ...recentSearches.filter(item => item !== searchTerm)].slice(0, 5);
    setRecentSearches(newHistory);
    localStorage.setItem('school-search-history', JSON.stringify(newHistory));
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    saveToHistory(suggestion);
    onSuggestionClick(suggestion);
  };

  // Clear search history
  const handleClearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('school-search-history');
    onClearHistory?.();
  };

  // Get trending searches (mock data - in real app this would come from API)
  const trendingSearches = [
    'Liceum w Warszawie',
    'Szkoła podstawowa Kraków',
    'Technikum informatyczne',
    'Szkoła z językiem angielskim',
    'Przedszkole Wrocław'
  ];

  // Popular locations
  const popularLocations = [
    { name: 'Warszawa', count: 1250 },
    { name: 'Kraków', count: 890 },
    { name: 'Gdańsk', count: 650 },
    { name: 'Wrocław', count: 580 },
    { name: 'Poznań', count: 520 }
  ];

  // School types
  const schoolTypes = [
    { name: 'Szkoła podstawowa', count: 2100 },
    { name: 'Liceum', count: 850 },
    { name: 'Technikum', count: 720 },
    { name: 'Przedszkole', count: 1800 },
    { name: 'Szkoła zawodowa', count: 450 }
  ];

  const renderSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'location':
        return <MapPin className="w-4 h-4 text-blue-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const showSuggestions = query.length >= 2 && suggestions.length > 0;
  const showRecentSearches = query.length === 0 && recentSearches.length > 0;
  const showDefaultSuggestions = query.length === 0;

  if (!showSuggestions && !showRecentSearches && !showDefaultSuggestions) {
    return null;
  }

  return (
    <Card className={`absolute top-full left-0 right-0 z-50 mt-2 shadow-xl border-0 bg-white/95 backdrop-blur-sm ${className}`}>
      <CardContent className="p-0">
        {/* API Suggestions */}
        {showSuggestions && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Suggestions</h4>
              {loading && (
                <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
            <div className="space-y-1">
              {suggestions.slice(0, 6).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.text)}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  {renderSuggestionIcon(suggestion.type)}
                  <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                    {suggestion.text}
                  </span>
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

        {/* Recent Searches */}
        {showRecentSearches && (
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Recent Searches</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Clear
              </Button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full flex items-center gap-3 p-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 text-sm text-gray-700 group-hover:text-gray-900">
                    {search}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Default Suggestions */}
        {showDefaultSuggestions && (
          <div className="p-4 space-y-6">
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <h4 className="text-sm font-semibold text-gray-700">Trending Searches</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.map((search, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition-colors"
                    onClick={() => handleSuggestionClick(search)}
                  >
                    {search}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Popular Locations */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-blue-500" />
                <h4 className="text-sm font-semibold text-gray-700">Popular Locations</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {popularLocations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(location.name)}
                    className="flex items-center justify-between p-2 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-blue-700">
                      {location.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {location.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* School Types */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-4 h-4 text-green-500" />
                <h4 className="text-sm font-semibold text-gray-700">School Types</h4>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {schoolTypes.map((type, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(type.name)}
                    className="flex items-center justify-between p-2 text-left hover:bg-green-50 rounded-lg transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-green-700">
                      {type.name}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {type.count}
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}