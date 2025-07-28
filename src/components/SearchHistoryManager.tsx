"use client";

import React, { useState, useEffect } from 'react';
import { useSearchHistory } from '@/hooks/useSearchHistory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc,
  Calendar,
  X,
  CheckSquare,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchHistoryManagerProps {
  className?: string;
  onSelectSearch?: (query: string) => void;
  maxItems?: number;
}

export default function SearchHistoryManager({ 
  className, 
  onSelectSearch,
  maxItems = 50 
}: SearchHistoryManagerProps) {
  const { 
    searchHistory, 
    loading, 
    clearSearchHistory, 
    removeSearchQuery,
    getRecentSearches 
  } = useSearchHistory();

  const [filteredHistory, setFilteredHistory] = useState(searchHistory);
  const [filterQuery, setFilterQuery] = useState('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'query'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Filter and sort history
  useEffect(() => {
    let filtered = searchHistory;

    // Apply search filter
    if (filterQuery.trim()) {
      filtered = filtered.filter(item => 
        item.query.toLowerCase().includes(filterQuery.toLowerCase())
      );
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'timestamp') {
        return sortOrder === 'asc' 
          ? a.timestamp - b.timestamp 
          : b.timestamp - a.timestamp;
      } else {
        return sortOrder === 'asc' 
          ? a.query.localeCompare(b.query)
          : b.query.localeCompare(a.query);
      }
    });

    // Apply limit
    filtered = filtered.slice(0, maxItems);

    setFilteredHistory(filtered);
  }, [searchHistory, filterQuery, sortBy, sortOrder, maxItems]);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString();
  };

  const toggleSort = () => {
    if (sortBy === 'timestamp') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('timestamp');
      setSortOrder('desc');
    }
  };

  const toggleSortByQuery = () => {
    if (sortBy === 'query') {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy('query');
      setSortOrder('asc');
    }
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedItems(filteredHistory.map(item => item.id));
  };

  const deselectAll = () => {
    setSelectedItems([]);
  };

  const handleBulkDelete = () => {
    selectedItems.forEach(id => removeSearchQuery(id));
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  const handleClearAll = () => {
    clearSearchHistory();
    setSelectedItems([]);
    setShowBulkActions(false);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search History
          {searchHistory.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {searchHistory.length} items
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Filter search history..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSort}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Date
              {sortBy === 'timestamp' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSortByQuery}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              A-Z
              {sortBy === 'query' && (
                sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
            >
              {showBulkActions ? 'Cancel' : 'Select Multiple'}
            </Button>
            
            {showBulkActions && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
                {selectedItems.length > 0 && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleBulkDelete}
                  >
                    Delete Selected ({selectedItems.length})
                  </Button>
                )}
              </div>
            )}
          </div>
          
          {searchHistory.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* History List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchHistory.length === 0 ? (
                <div>
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No search history</p>
                  <p className="text-sm">Your search queries will appear here</p>
                </div>
              ) : (
                <div>
                  <Filter className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p>No results match your filter</p>
                </div>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors",
                  selectedItems.includes(item.id) && "bg-blue-50 border-blue-200"
                )}
              >
                {showBulkActions && (
                  <button
                    onClick={() => toggleItemSelection(item.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {selectedItems.includes(item.id) ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectSearch?.(item.query)}
                      className="font-medium text-left hover:text-blue-600 truncate"
                    >
                      {item.query}
                    </button>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {formatTimestamp(item.timestamp)}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSearchQuery(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Summary */}
        {filteredHistory.length > 0 && (
          <div className="text-sm text-gray-500 pt-2 border-t">
            Showing {filteredHistory.length} of {searchHistory.length} searches
            {filterQuery && ` matching "${filterQuery}"`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
