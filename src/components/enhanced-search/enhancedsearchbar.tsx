"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Filter, X, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SearchSuggestion {
  id: string;
  text: string;
  type: "school" | "location" | "category";
  icon?: React.ReactNode;
}

interface EnhancedSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "default" | "hero" | "compact";
  showFilters?: boolean;
}

const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  onSearch,
  placeholder = "Wyszukaj szkołę, miasto lub województwo...",
  className,
  variant = "default",
  showFilters = true
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock suggestions data
  const mockSuggestions: SearchSuggestion[] = [
    { id: "1", text: "Liceum Ogólnokształcące", type: "category", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "2", text: "Warszawa", type: "location", icon: <MapPin className="w-4 h-4" /> },
    { id: "3", text: "Szkoła Podstawowa nr 15", type: "school", icon: <Sparkles className="w-4 h-4" /> },
    { id: "4", text: "Kraków", type: "location", icon: <MapPin className="w-4 h-4" /> },
    { id: "5", text: "Technikum Informatyczne", type: "category", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "6", text: "Gdańsk", type: "location", icon: <MapPin className="w-4 h-4" /> },
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
          const filtered = mockSuggestions.filter(suggestion =>
            suggestion.text.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filtered);
          setShowSuggestions(true);
          setIsLoading(false);
        }, 300);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setShowHistory(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem("searchHistory");
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      
      onSearch(searchQuery);
      setShowSuggestions(false);
      setShowHistory(false);
      setIsFocused(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (query.length === 0 && searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    handleSearch(historyItem);
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setShowHistory(false);
    inputRef.current?.focus();
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case "school":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "location":
        return "bg-green-100 text-green-700 border-green-200";
      case "category":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "hero":
        return {
          container: "relative w-full",
          input: "h-16 text-lg pl-16 pr-32 rounded-2xl border-2 border-orange-200 focus:border-orange-400 bg-white/90 backdrop-blur-sm shadow-lg",
          searchIcon: "absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-orange-500",
          button: "absolute right-3 top-1/2 transform -translate-y-1/2 h-10 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg"
        };
      case "compact":
        return {
          container: "relative w-full max-w-md",
          input: "h-10 text-sm pl-10 pr-20 rounded-lg border border-gray-300 focus:border-orange-400",
          searchIcon: "absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400",
          button: "absolute right-2 top-1/2 transform -translate-y-1/2 h-6 px-3 text-xs"
        };
      default:
        return {
          container: "relative w-full",
          input: "h-12 text-base pl-12 pr-24 rounded-xl border border-gray-300 focus:border-orange-400 bg-white shadow-sm",
          searchIcon: "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400",
          button: "absolute right-2 top-1/2 transform -translate-y-1/2 h-8 px-4"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div ref={searchRef} className={cn(styles.container, className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className={styles.searchIcon} />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          className={cn(
            styles.input,
            isFocused && "ring-2 ring-orange-200 ring-offset-2",
            "transition-all duration-200"
          )}
        />
        
        {/* Clear button */}
        {query && (
          <button
            onClick={clearQuery}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
        
        {/* Search button */}
        <Button
          onClick={() => handleSearch()}
          className={styles.button}
          disabled={!query.trim()}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Szukaj"
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {(showSuggestions || showHistory) && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Search History */}
            {showHistory && searchHistory.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center space-x-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Ostatnie wyszukiwania</span>
                </div>
                <div className="space-y-2">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="flex items-center w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <Clock className="w-4 h-4 text-gray-400 mr-3 group-hover:text-orange-500" />
                      <span className="text-sm text-gray-700 group-hover:text-gray-900">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Sparkles className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-600">Sugestie</span>
                </div>
                <div className="space-y-1">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="flex items-center justify-between w-full p-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-orange-500 group-hover:text-orange-600">
                          {suggestion.icon}
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                          {suggestion.text}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getSuggestionTypeColor(suggestion.type))}
                      >
                        {suggestion.type === "school" && "Szkoła"}
                        {suggestion.type === "location" && "Lokalizacja"}
                        {suggestion.type === "category" && "Kategoria"}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {showSuggestions && suggestions.length === 0 && query.length > 1 && !isLoading && (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Brak wyników dla "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Spróbuj użyć innych słów kluczowych</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters (if enabled) */}
      {showFilters && variant !== "compact" && (
        <div className="flex items-center space-x-2 mt-4">
          <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-50">
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </Button>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Wszystkie typy szkół
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Cała Polska
          </Badge>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchBar;