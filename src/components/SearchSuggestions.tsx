"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { getTestSuggestions, TestSuggestion } from '@/lib/testSuggestions';
import { cn } from '@/lib/utils';
import { Clock, Search, X, Trash2, MapPin, GraduationCap, Building, Globe } from 'lucide-react';

interface SearchSuggestionsProps {
  query: string;
  onSelectSuggestion: (suggestion: string) => void;
  onClearHistory?: () => void;
  className?: string;
  maxSuggestions?: number;
  showClearButton?: boolean;
  onClose?: () => void;
  onAutoSearch?: (suggestion: string) => void;
}

export default function SearchSuggestions({
  query,
  onSelectSuggestion,
  onClearHistory,
  className,
  maxSuggestions = 8,
  showClearButton = true,
  onAutoSearch
}: SearchSuggestionsProps) {
  const { getSearchSuggestions, searchHistory, clearSearchHistory, removeSearchQuery } = useSearchHistory();
  const [historySuggestions, setHistorySuggestions] = useState<Array<{ query: string; timestamp: number; id: string }>>([]);
  const [realTimeSuggestions, setRealTimeSuggestions] = useState<TestSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim()) {
      // Get history-based suggestions
      const matchingHistory = getSearchSuggestions(query, 3);
      setHistorySuggestions(matchingHistory);
      
      // Get real-time suggestions from test data
      const testSuggestions = getTestSuggestions(query, maxSuggestions - matchingHistory.length);
      setRealTimeSuggestions(testSuggestions);
      
      setSelectedIndex(-1);
    } else {
      // Show recent searches when query is empty
      setHistorySuggestions(searchHistory.slice(0, maxSuggestions));
      setRealTimeSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [query, searchHistory, getSearchSuggestions, maxSuggestions]);

  // Calculate total suggestions for keyboard navigation
  const totalSuggestions = historySuggestions.length + realTimeSuggestions.length;

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalSuggestions === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < totalSuggestions - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0) {
            let selectedSuggestion: string;
            if (selectedIndex < historySuggestions.length) {
              selectedSuggestion = historySuggestions[selectedIndex].query;
            } else {
              selectedSuggestion = realTimeSuggestions[selectedIndex - historySuggestions.length].text;
            }
            onSelectSuggestion(selectedSuggestion);
            if (onAutoSearch) {
              onAutoSearch(selectedSuggestion);
            }
          }
          break;
        case 'Escape':
          setSelectedIndex(-1);
          break;
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [totalSuggestions, selectedIndex, onSelectSuggestion, onAutoSearch, historySuggestions, realTimeSuggestions]);

  // Don't render if no suggestions
  if (totalSuggestions === 0) {
    return null;
  }

  const handleClearHistory = () => {
    clearSearchHistory();
    if (onClearHistory) {
      onClearHistory();
    }
  };

  const handleRemoveEntry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeSearchQuery(id);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSelectSuggestion(suggestion);
    if (onAutoSearch) {
      // Small delay to prevent double-triggering with form submission
      setTimeout(() => {
        onAutoSearch(suggestion);
      }, 50);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'school':
        return <GraduationCap className="h-4 w-4 text-blue-500" />;
      case 'city':
        return <MapPin className="h-4 w-4 text-green-500" />;
      case 'region':
        return <Globe className="h-4 w-4 text-purple-500" />;
      case 'schoolType':
        return <Building className="h-4 w-4 text-orange-500" />;
      default:
        return <Search className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        "absolute top-full left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto",
        className
      )}
    >
      <div className="py-2">
        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Search className="h-4 w-4" />
            {query.trim() ? 'Search suggestions' : 'Recent searches'}
          </div>
          {showClearButton && searchHistory.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>

        <div className="max-h-64 overflow-y-auto">
          {historySuggestions.length > 0 && (
            <>
              {query.trim() && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Recent searches
                </div>
              )}
              {historySuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion.query)}
                  className={cn(
                    "px-4 py-3 cursor-pointer transition-colors flex items-center justify-between group",
                    selectedIndex === index
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {query.trim() ? (
                          <HighlightedText text={suggestion.query} highlight={query} />
                        ) : (
                          suggestion.query
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTimestamp(suggestion.timestamp)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <button
                      onClick={(e) => handleRemoveEntry(e, suggestion.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                      title="Remove from history"
                    >
                      <Trash2 className="h-3 w-3 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {realTimeSuggestions.length > 0 && (
            <>
              {(historySuggestions.length > 0 || !query.trim()) && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 bg-gray-50">
                  Suggestions
                </div>
              )}
              {realTimeSuggestions.map((suggestion, index) => {
                const actualIndex = historySuggestions.length + index;
                return (
                  <div
                    key={`${suggestion.type}-${suggestion.text}`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 group",
                      selectedIndex === actualIndex
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50 text-gray-700"
                    )}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        <HighlightedText text={suggestion.text} highlight={query} />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {suggestion.category}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Enter
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {totalSuggestions === 0 && query.trim() && (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No matching suggestions found
          </div>
        )}
      </div>
    </div>
  );
}

function HighlightedText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) return <span>{text}</span>;
  
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, index) => 
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}
