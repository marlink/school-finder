'use client';

import React, { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Search, Database, Zap } from 'lucide-react';
import { MCPSearchBar } from '@/components/search/MCPSearchBar';
import { MCPStatus, MCPBadge } from '@/components/mcp/MCPStatus';
import { useMCPSearch } from '@/hooks/useMCPSearch';

interface MCPSearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  source: 'database' | 'vector' | 'hybrid';
}

export default function MCPSearchPage() {
  const [selectedResult, setSelectedResult] = useState<MCPSearchResult | null>(null);
  const [activeTab, setActiveTab] = useState('search');

  const {
    query,
    results,
    isLoading,
    error,
    totalResults,
    processingTime,
    hasResults
  } = useMCPSearch({
    autoSearch: false,
    maxResults: 10
  });

  const handleResultSelect = useCallback((result: MCPSearchResult) => {
    setSelectedResult(result);
    setActiveTab('details');
  }, []);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'vector':
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case 'database':
        return <Database className="w-4 h-4 text-blue-500" />;
      case 'hybrid':
        return <Zap className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSourceLabel = (source: string) => {
    switch (source) {
      case 'vector':
        return 'AI Vector Search';
      case 'database':
        return 'Database Search';
      case 'hybrid':
        return 'Hybrid AI Search';
      default:
        return 'Standard Search';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">AI-Powered Search</h1>
              <MCPBadge />
            </div>
            <MCPStatus showDetails={false} />
          </div>
          
          <p className="text-gray-600 mb-6">
            Experience next-generation school search powered by AI and semantic understanding.
          </p>

          {/* MCP Search Bar */}
          <MCPSearchBar
            onResultSelect={handleResultSelect}
            placeholder="Ask me anything about schools... (e.g., 'Find international schools in Warsaw with English programs')"
            showFilters={true}
            autoFocus={true}
            className="mb-6"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search" className="flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search Results</span>
            </TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedResult}>
              <span>Result Details</span>
            </TabsTrigger>
            <TabsTrigger value="status">
              <span>System Status</span>
            </TabsTrigger>
          </TabsList>

          {/* Search Results Tab */}
          <TabsContent value="search" className="mt-6">
            {/* Search Stats */}
            {hasResults && (
              <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Found {totalResults} results</span>
                    {processingTime > 0 && (
                      <span>• Processed in {processingTime}ms</span>
                    )}
                    <span>• Query: "{query}"</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-purple-600 font-medium">AI Enhanced</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-purple-500 animate-pulse" />
                </div>
                <p className="text-gray-600">AI is analyzing your query...</p>
                <p className="text-sm text-gray-500 mt-2">
                  Using semantic understanding and vector search
                </p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 text-red-700">
                    <span className="font-medium">Search Error:</span>
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Grid */}
            {!isLoading && hasResults && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result) => (
                  <Card 
                    key={result.id} 
                    className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500"
                    onClick={() => handleResultSelect(result)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getSourceIcon(result.source)}
                          <Badge variant="outline" className="text-xs">
                            {getSourceLabel(result.source)}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">
                            {Math.round(result.relevanceScore * 100)}%
                          </span>
                        </div>
                      </div>
                      <CardTitle className="text-lg leading-tight">
                        {result.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                        {result.content}
                      </p>
                      
                      {/* Metadata */}
                      <div className="space-y-2">
                        {result.metadata.location && (
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium mr-2">Location:</span>
                            <span>{result.metadata.location}</span>
                          </div>
                        )}
                        {result.metadata.searchType && (
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="font-medium mr-2">Type:</span>
                            <span>{result.metadata.searchType}</span>
                          </div>
                        )}
                        <div className="flex items-center text-xs text-gray-500">
                          <span className="font-medium mr-2">Generated:</span>
                          <span>{new Date(result.metadata.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && !hasResults && !error && query && (
              <div className="text-center py-12">
                <div className="mb-4">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search query or filters
                  </p>
                </div>
              </div>
            )}

            {/* Welcome State */}
            {!query && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Sparkles className="w-8 h-8 text-purple-500" />
                    <Search className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    AI-Powered School Search
                  </h3>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Use natural language to find schools. Ask questions like "Find international schools in Warsaw" 
                    or "Show me schools with strong science programs near Krakow".
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <Card className="text-center p-6">
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Semantic Understanding</h4>
                    <p className="text-sm text-gray-600">
                      AI understands context and intent in your queries
                    </p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <Database className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Comprehensive Data</h4>
                    <p className="text-sm text-gray-600">
                      Search across all school information and metadata
                    </p>
                  </Card>
                  
                  <Card className="text-center p-6">
                    <Zap className="w-8 h-8 text-green-500 mx-auto mb-3" />
                    <h4 className="font-medium mb-2">Intelligent Results</h4>
                    <p className="text-sm text-gray-600">
                      Get ranked results based on relevance and context
                    </p>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Result Details Tab */}
          <TabsContent value="details" className="mt-6">
            {selectedResult ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{selectedResult.title}</CardTitle>
                    <div className="flex items-center space-x-2">
                      {getSourceIcon(selectedResult.source)}
                      <Badge variant="outline">
                        {getSourceLabel(selectedResult.source)}
                      </Badge>
                      <Badge variant="secondary">
                        {Math.round(selectedResult.relevanceScore * 100)}% match
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Content</h4>
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {selectedResult.content}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Metadata</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="text-sm text-gray-700 overflow-x-auto">
                        {JSON.stringify(selectedResult.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Result ID:</span>
                      <span className="ml-2 text-gray-600">{selectedResult.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Source:</span>
                      <span className="ml-2 text-gray-600">{selectedResult.source}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Relevance Score:</span>
                      <span className="ml-2 text-gray-600">{selectedResult.relevanceScore.toFixed(3)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Generated:</span>
                      <span className="ml-2 text-gray-600">
                        {new Date(selectedResult.metadata.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Select a search result to view details</p>
              </div>
            )}
          </TabsContent>

          {/* System Status Tab */}
          <TabsContent value="status" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <MCPStatus showDetails={true} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Search Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Results:</span>
                    <span className="font-medium">{totalResults}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">{processingTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Query:</span>
                    <span className="font-medium truncate ml-2">{query || 'None'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Search Status:</span>
                    <span className={`font-medium ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                      {isLoading ? 'Processing' : 'Ready'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}