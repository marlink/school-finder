import { useState, useEffect, useCallback } from 'react';

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  id: string;
}

const STORAGE_KEY = 'search-history';
const MAX_HISTORY_ITEMS = 15;

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load search history from localStorage
  const loadSearchHistory = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as SearchHistoryItem[];
          // Sort by timestamp (most recent first) and ensure we don't exceed the limit
          const sortedHistory = parsed
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, MAX_HISTORY_ITEMS);
          setSearchHistory(sortedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading search history:', error);
      setSearchHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = useCallback((history: SearchHistoryItem[]) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
      }
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }, []);

  // Add a new search query to history
  const addSearchQuery = useCallback((query: string) => {
    if (!query.trim()) return;

    const trimmedQuery = query.trim();
    
    setSearchHistory(prev => {
      // Remove any existing entry with the same query
      const filteredHistory = prev.filter(item => 
        item.query.toLowerCase() !== trimmedQuery.toLowerCase()
      );

      // Create new search item
      const newItem: SearchHistoryItem = {
        query: trimmedQuery,
        timestamp: Date.now(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      // Add to beginning and limit to MAX_HISTORY_ITEMS
      const updatedHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      saveSearchHistory(updatedHistory);
      
      return updatedHistory;
    });
  }, [saveSearchHistory]);

  // Remove a specific search query from history
  const removeSearchQuery = useCallback((id: string) => {
    setSearchHistory(prev => {
      const updatedHistory = prev.filter(item => item.id !== id);
      saveSearchHistory(updatedHistory);
      return updatedHistory;
    });
  }, [saveSearchHistory]);

  // Clear all search history
  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }, []);

  // Get recent searches (optionally limited)
  const getRecentSearches = useCallback((limit?: number) => {
    return limit ? searchHistory.slice(0, limit) : searchHistory;
  }, [searchHistory]);

  // Check if a query exists in history
  const hasQuery = useCallback((query: string) => {
    return searchHistory.some(item => 
      item.query.toLowerCase() === query.toLowerCase()
    );
  }, [searchHistory]);

  // Get search suggestions based on input
  const getSearchSuggestions = useCallback((input: string, limit = 5) => {
    if (!input.trim()) return [];
    
    const inputLower = input.toLowerCase();
    return searchHistory
      .filter(item => 
        item.query.toLowerCase().includes(inputLower) && 
        item.query.toLowerCase() !== inputLower
      )
      .slice(0, limit);
  }, [searchHistory]);

  // Load history on component mount
  useEffect(() => {
    loadSearchHistory();
  }, [loadSearchHistory]);

  return {
    searchHistory,
    loading,
    addSearchQuery,
    removeSearchQuery,
    clearSearchHistory,
    getRecentSearches,
    hasQuery,
    getSearchSuggestions,
    refreshHistory: loadSearchHistory,
  };
}
