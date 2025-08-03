"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Search, 
  Trash2, 
  X, 
  Settings,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchHistoryDropdownProps {
  onSelectSearch: (query: string) => void;
  currentQuery: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  className?: string;
}

export default function SearchHistoryDropdown({
  onSelectSearch,
  currentQuery,
  isOpen,
  onToggle,
  onClose,
  className = ''
}: SearchHistoryDropdownProps) {
  const { 
    searchHistory, 
    loading, 
    removeSearchQuery, 
    clearSearchHistory,
    getSearchSuggestions 
  } = useSearchHistory();
  
  const [showManagement, setShowManagement] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get filtered suggestions based on current query
  const suggestions = getSearchSuggestions(currentQuery, 5);
  const recentSearches = searchHistory.slice(0, 5);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen && typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [isOpen, onClose]);

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  };

  const handleSelectSearch = (query: string) => {
    onSelectSearch(query);
    onClose();
  };

  const handleRemoveSearch = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeSearchQuery(id);
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setShowManagement(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        "absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {currentQuery.trim() && suggestions.length > 0 
                  ? 'Suggestions' 
                  : 'Recent Searches'
                }
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManagement(!showManagement)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Management Actions */}
          {showManagement && (
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All History
                </Button>
                <span className="text-sm text-gray-500">
                  {searchHistory.length} items
                </span>
              </div>
            </div>
          )}

          {/* Search Items */}
          <div className="max-h-64 overflow-y-auto">
            {currentQuery.trim() && suggestions.length > 0 ? (
              // Show filtered suggestions
              suggestions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectSearch(item.query)}
                >
                  <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {item.query}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRemoveSearch(item.id, e)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : recentSearches.length > 0 ? (
              // Show recent searches
              recentSearches.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelectSearch(item.query)}
                >
                  <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {item.query}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatTimestamp(item.timestamp)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleRemoveSearch(item.id, e)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              // Empty state
              <div className="p-6 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {currentQuery.trim() 
                    ? 'No matching searches found' 
                    : 'No search history yet'
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Your recent searches will appear here
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {searchHistory.length > 5 && (
            <div className="p-3 border-t bg-gray-50">
              <div className="text-xs text-gray-500 text-center">
                Showing {Math.min(5, searchHistory.length)} of {searchHistory.length} recent searches
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
