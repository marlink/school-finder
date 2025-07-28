'use client';

import { useState, useCallback, useEffect } from 'react';

interface MCPSearchFilters {
  location?: string;
  schoolType?: string;
  language?: string;
  radius?: number;
}

interface MCPSearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  source: 'database' | 'vector' | 'hybrid';
}

interface MCPSearchResponse {
  results: MCPSearchResult[];
  totalResults: number;
  processingTime: number;
  suggestions?: string[];
}

interface UseMCPSearchOptions {
  autoSearch?: boolean;
  debounceMs?: number;
  maxResults?: number;
}

export function useMCPSearch(options: UseMCPSearchOptions = {}) {
  const {
    autoSearch = false,
    debounceMs = 300,
    maxResults = 10
  } = options;

  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<MCPSearchFilters>({});
  const [results, setResults] = useState<MCPSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  /**
   * Perform MCP search
   */
  const search = useCallback(async (searchQuery?: string, searchFilters?: MCPSearchFilters) => {
    const finalQuery = searchQuery || query;
    const finalFilters = searchFilters || filters;

    if (!finalQuery.trim()) {
      setResults([]);
      setSuggestions([]);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mcp/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: finalQuery,
          filters: finalFilters,
          limit: maxResults
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: MCPSearchResponse = await response.json();
      
      setResults(data.results);
      setSuggestions(data.suggestions || []);
      setTotalResults(data.totalResults);
      setProcessingTime(data.processingTime);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      console.error('MCP Search Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [query, filters, maxResults]);

  /**
   * Clear search results and state
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setSuggestions([]);
    setError(null);
    setTotalResults(0);
    setProcessingTime(0);
  }, []);

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters: Partial<MCPSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Get search suggestions for a query
   */
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // For now, generate simple suggestions
      // TODO: Implement actual MCP suggestion API
      const mockSuggestions = [
        `${searchQuery} in Warsaw`,
        `${searchQuery} public schools`,
        `${searchQuery} with English programs`
      ];
      
      setSuggestions(mockSuggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, []);

  // Auto-search with debouncing
  useEffect(() => {
    if (!autoSearch || !query.trim()) return;

    const timeoutId = setTimeout(() => {
      search();
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, filters, autoSearch, debounceMs, search]);

  // Get suggestions when query changes
  useEffect(() => {
    if (query.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        getSuggestions(query);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query, debounceMs, getSuggestions]);

  return {
    // State
    query,
    filters,
    results,
    suggestions,
    isLoading,
    error,
    totalResults,
    processingTime,

    // Actions
    setQuery,
    search,
    clearSearch,
    updateFilters,
    getSuggestions,

    // Computed
    hasResults: results.length > 0,
    hasError: !!error,
    isEmpty: !isLoading && results.length === 0 && query.trim().length > 0
  };
}

/**
 * Hook for MCP service health monitoring
 */
export function useMCPHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch('/api/mcp/search');
      setIsHealthy(response.ok);
      setLastCheck(new Date());
    } catch (error) {
      setIsHealthy(false);
      setLastCheck(new Date());
      console.error('MCP Health Check Failed:', error);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkHealth]);

  return {
    isHealthy,
    lastCheck,
    checkHealth
  };
}