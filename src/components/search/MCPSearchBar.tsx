'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Filter, X, MapPin, School, Globe } from 'lucide-react';
import { useMCPSearch } from '@/hooks/useMCPSearch';

interface MCPSearchBarProps {
  onResultSelect?: (result: any) => void;
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  autoFocus?: boolean;
}

export function MCPSearchBar({
  onResultSelect,
  placeholder = "Search schools with AI assistance...",
  className = "",
  showFilters = true,
  autoFocus = false
}: MCPSearchBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    query,
    setQuery,
    results,
    suggestions,
    isLoading,
    error,
    filters,
    updateFilters,
    search,
    clearSearch,
    hasResults,
    processingTime
  } = useMCPSearch({
    autoSearch: false,
    debounceMs: 300,
    maxResults: 5
  });

  // Handle click outside to close suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsExpanded(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSearch = async () => {
    if (query.trim()) {
      setShowSuggestions(false);
      await search();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setIsExpanded(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setIsExpanded(value.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    search(suggestion);
  };

  const handleResultClick = (result: any) => {
    setShowSuggestions(false);
    setIsExpanded(false);
    onResultSelect?.(result);
  };

  const handleClear = () => {
    clearSearch();
    setShowSuggestions(false);
    setIsExpanded(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl mx-auto ${className}`}>
      {/* Main Search Input */}
      <div className={`
        relative bg-white rounded-xl border-2 transition-all duration-200
        ${isExpanded ? 'border-blue-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
        ${error ? 'border-red-300' : ''}
      `}>
        <div className="flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-gray-400 mr-3" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsExpanded(true);
              if (query.length > 0) setShowSuggestions(true);
            }}
            placeholder={placeholder}
            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
          />

          {/* AI Badge */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
              <Sparkles className="w-3 h-3 text-purple-600 mr-1" />
              <span className="text-xs font-medium text-purple-700">AI</span>
            </div>

            {query && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filters Row */}
        {showFilters && isExpanded && (
          <div className="px-4 pb-3 border-t border-gray-100">
            <div className="flex items-center space-x-3 mt-3">
              <Filter className="w-4 h-4 text-gray-400" />
              
              <select
                value={filters.location || ''}
                onChange={(e) => updateFilters({ location: e.target.value || undefined })}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="">All locations</option>
                <option value="Warsaw">Warsaw</option>
                <option value="Krakow">Krakow</option>
                <option value="Gdansk">Gdansk</option>
                <option value="Poznan">Poznan</option>
                <option value="Wroclaw">Wroclaw</option>
              </select>

              <select
                value={filters.schoolType || ''}
                onChange={(e) => updateFilters({ schoolType: e.target.value || undefined })}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="">All types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="catholic">Catholic</option>
                <option value="international">International</option>
              </select>

              <select
                value={filters.language || ''}
                onChange={(e) => updateFilters({ language: e.target.value || undefined })}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="">Any language</option>
                <option value="English">English</option>
                <option value="Polish">Polish</option>
                <option value="German">German</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions and Results Dropdown */}
      {(showSuggestions || hasResults) && isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
          
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">AI is searching...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 text-center">
              <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
                {error}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && suggestions.length > 0 && !hasResults && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Search Results */}
          {!isLoading && hasResults && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <div className="text-xs font-medium text-gray-500">
                  AI-Enhanced Results
                </div>
                {processingTime > 0 && (
                  <div className="text-xs text-gray-400">
                    {processingTime}ms
                  </div>
                )}
              </div>
              
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border-l-4 border-transparent hover:border-blue-500"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {result.source === 'vector' && <Sparkles className="w-4 h-4 text-purple-500" />}
                      {result.source === 'database' && <School className="w-4 h-4 text-blue-500" />}
                      {result.source === 'hybrid' && <Globe className="w-4 h-4 text-green-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        <div className="flex-shrink-0 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                          {Math.round(result.relevanceScore * 100)}%
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.content}
                      </p>
                      
                      {result.metadata.location && (
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3 mr-1" />
                          {result.metadata.location}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && !hasResults && query.trim() && suggestions.length === 0 && (
            <div className="p-4 text-center">
              <div className="text-sm text-gray-500">
                No results found for "{query}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}