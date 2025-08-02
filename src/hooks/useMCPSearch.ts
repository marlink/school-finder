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
      // Call the actual MCP suggestion API
      const response = await fetch('/api/mcp/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error(`Suggestion API error: ${response.status}`);
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      
      // Fallback to intelligent mock suggestions based on query analysis
      const fallbackSuggestions = generateIntelligentSuggestions(searchQuery);
      setSuggestions(fallbackSuggestions.slice(0, 5));
    }
  }, []);

  // Helper function for intelligent fallback suggestions
  const generateIntelligentSuggestions = (query: string): string[] => {
    const lowerQuery = query.toLowerCase();
    const suggestions: string[] = [];

    // Location-based suggestions
    if (lowerQuery.includes('london') || lowerQuery.includes('uk')) {
      suggestions.push(
        `${query} international schools`,
        `${query} independent schools`,
        `${query} grammar schools`
      );
    } else if (lowerQuery.includes('paris') || lowerQuery.includes('france')) {
      suggestions.push(
        `${query} international schools`,
        `${query} bilingual schools`,
        `${query} lycée international`
      );
    } else if (lowerQuery.includes('berlin') || lowerQuery.includes('germany')) {
      suggestions.push(
        `${query} international schools`,
        `${query} deutsche schulen`,
        `${query} bilingual education`
      );
    }

    // Subject/program-based suggestions
    if (lowerQuery.includes('stem') || lowerQuery.includes('science')) {
      suggestions.push(
        `${query} STEM programs`,
        `${query} science schools`,
        `${query} technology education`
      );
    } else if (lowerQuery.includes('art') || lowerQuery.includes('music')) {
      suggestions.push(
        `${query} arts schools`,
        `${query} creative programs`,
        `${query} performing arts`
      );
    } else if (lowerQuery.includes('language') || lowerQuery.includes('bilingual')) {
      suggestions.push(
        `${query} bilingual schools`,
        `${query} language immersion`,
        `${query} multilingual education`
      );
    }

    // School type suggestions
    if (!lowerQuery.includes('international')) {
      suggestions.push(`${query} international schools`);
    }
    if (!lowerQuery.includes('private')) {
      suggestions.push(`${query} private schools`);
    }
    if (!lowerQuery.includes('public')) {
      suggestions.push(`${query} public schools`);
    }

    // Age/level-based suggestions
    if (lowerQuery.includes('primary') || lowerQuery.includes('elementary')) {
      suggestions.push(
        `${query} primary education`,
        `${query} elementary schools`
      );
    } else if (lowerQuery.includes('secondary') || lowerQuery.includes('high')) {
      suggestions.push(
        `${query} secondary schools`,
        `${query} high schools`
      );
    }

    // Remove duplicates and filter out exact matches
    return [...new Set(suggestions)].filter(suggestion => 
      suggestion.toLowerCase() !== query.toLowerCase()
    );
  };

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