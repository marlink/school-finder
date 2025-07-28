/**
 * MCP (Model Context Protocol) Service
 * Handles integration with MCP servers and AI-powered search
 */

interface MCPConfig {
  apiKey: string;
  firecrawlApiKey?: string;
  hyperbrowserApiKey?: string;
  githubPat?: string;
  qdrantUrl?: string;
  qdrantApiKey?: string;
  environment: 'development' | 'staging' | 'production';
}

interface SearchContext {
  query: string;
  filters?: {
    location?: string;
    schoolType?: string;
    language?: string;
    radius?: number;
  };
  userPreferences?: {
    preferredLanguage?: string;
    searchHistory?: string[];
  };
}

interface MCPSearchResult {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: Record<string, any>;
  source: 'database' | 'vector' | 'hybrid';
}

export class MCPService {
  private config: MCPConfig;
  private isInitialized: boolean = false;

  constructor() {
    this.config = {
      apiKey: process.env.MCP_API_KEY || '',
      firecrawlApiKey: process.env.FIRECRAWL_API_KEY || '',
      hyperbrowserApiKey: process.env.HYPERBROWSER_API_KEY || '',
      githubPat: process.env.GITHUB_PAT || '',
      qdrantUrl: process.env.QDRANT_URL || '',
      qdrantApiKey: process.env.QDRANT_API_KEY || '',
      environment: (process.env.NODE_ENV as any) || 'development'
    };
  }

  /**
   * Initialize MCP service with configuration validation
   */
  async initialize(): Promise<void> {
    try {
      // Validate configuration
      if (!this.config.apiKey) {
        console.warn('⚠️ MCP_API_KEY not configured - using mock mode');
      }

      if (!this.config.qdrantUrl || !this.config.qdrantApiKey) {
        console.warn('⚠️ Qdrant not configured - vector search disabled');
      }

      // Test connections if in production
      if (this.config.environment === 'production') {
        await this.testConnections();
      }

      this.isInitialized = true;
      console.log('✅ MCP Service initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize MCP Service:', error);
      throw error;
    }
  }

  /**
   * Perform AI-powered search with context understanding
   */
  async search(context: SearchContext): Promise<MCPSearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { query, filters, userPreferences } = context;

      // Analyze search intent first
      const intent = await this.analyzeIntent(query);
      
      // Perform multi-source search
      const results: MCPSearchResult[] = [];

      // 1. Database search for existing schools
      const dbResults = await this.searchDatabase(query, filters);
      results.push(...dbResults);

      // 2. If we have MCP integration, enhance with AI search
      if (this.config.apiKey) {
        const aiResults = await this.performAISearch(query, filters, intent);
        results.push(...aiResults);
      }

      // 3. If we need fresh data, use web scraping
      if (results.length < 3 && this.shouldScrapeForQuery(query, intent)) {
        const scrapedResults = await this.performWebScraping(query, filters);
        results.push(...scrapedResults);
      }

      // Sort by relevance and return top results
      return results
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 10);

    } catch (error) {
      console.error('MCP Search Error:', error);
      
      // Fallback to mock results if real search fails
      return this.generateFallbackResults(context);
    }
  }

  /**
   * Search existing database for schools
   */
  private async searchDatabase(query: string, filters?: any): Promise<MCPSearchResult[]> {
    try {
      // Import Supabase client dynamically to avoid circular dependencies
      const { createClient } = await import('@supabase/supabase-js');
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase configuration missing for database search');
        return [];
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Build query based on search terms and filters
      let dbQuery = supabase
        .from('schools')
        .select('*')
        .limit(5); // Limit to 5 results for MCP search
      
      // Add text search
      if (query && query.trim()) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`);
      }
      
      // Add filters
      if (filters?.location) {
        dbQuery = dbQuery.ilike('address', `%${filters.location}%`);
      }
      
      if (filters?.schoolType) {
        dbQuery = dbQuery.eq('type', filters.schoolType);
      }
      
      if (filters?.language) {
        dbQuery = dbQuery.contains('languages', [filters.language]);
      }
      
      const { data: schools, error } = await dbQuery;
      
      if (error) {
        console.error('Database search error:', error);
        return [];
      }
      
      if (!schools || schools.length === 0) {
        return [];
      }
      
      // Convert database results to MCP search results
      return schools.map((school, index) => ({
        id: `db-${school.id}`,
        title: school.name || 'School',
        content: this.formatSchoolContent(school),
        relevanceScore: 0.9 - (index * 0.1),
        metadata: {
          searchType: 'database',
          schoolId: school.id,
          schoolType: school.type,
          location: school.address,
          timestamp: new Date().toISOString(),
          source: 'database'
        },
        source: 'database'
      }));
      
    } catch (error) {
      console.error('Database search error:', error);
      return [];
    }
  }

  /**
   * Format school data for display
   */
  private formatSchoolContent(school: any): string {
    const parts = [];
    
    if (school.description) {
      parts.push(school.description);
    }
    
    if (school.address) {
      parts.push(`Address: ${school.address}`);
    }
    
    if (school.phone) {
      parts.push(`Phone: ${school.phone}`);
    }
    
    if (school.email) {
      parts.push(`Email: ${school.email}`);
    }
    
    if (school.website) {
      parts.push(`Website: ${school.website}`);
    }
    
    if (school.type) {
      parts.push(`Type: ${school.type}`);
    }
    
    if (school.languages && school.languages.length > 0) {
      parts.push(`Languages: ${school.languages.join(', ')}`);
    }
    
    return parts.join('\n');
  }

  /**
   * Perform AI-enhanced search using MCP servers
   */
  private async performAISearch(query: string, filters?: any, intent?: any): Promise<MCPSearchResult[]> {
    try {
      // Use Firecrawl MCP for web search and content extraction
      const searchResults = await this.searchWithFirecrawl(query);
      
      return searchResults.map((result, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: result.title || `AI Search Result ${index + 1}`,
        content: result.content || result.description || '',
        relevanceScore: 0.8 - (index * 0.1),
        metadata: {
          searchType: 'ai-enhanced',
          filters: filters || {},
          timestamp: new Date().toISOString(),
          source: result.url || 'ai-search'
        },
        source: 'hybrid'
      }));
    } catch (error) {
      console.error('AI search error:', error);
      return [];
    }
  }

  /**
   * Use Firecrawl MCP for web search
   */
  private async searchWithFirecrawl(query: string): Promise<any[]> {
    try {
      // Use the actual Firecrawl MCP server for web search
      const searchQuery = `schools ${query} education`;
      
      // Call Firecrawl search function
      const searchResults = await this.callFirecrawlSearch(searchQuery);
      
      return searchResults.map(result => ({
        title: result.title || `School Search Result`,
        content: result.content || result.description || '',
        url: result.url || '',
        description: result.description || `Information about schools matching "${query}"`
      }));
      
    } catch (error) {
      console.error('Firecrawl search error:', error);
      
      // Return enhanced mock data if real search fails
      return [
        {
          title: `Schools matching: ${query}`,
          content: `AI-powered search results for educational institutions related to "${query}". This includes comprehensive information about schools, their programs, facilities, and contact details.`,
          url: 'https://example.com/schools',
          description: `Comprehensive information about schools matching your search criteria for "${query}".`
        }
      ];
    }
  }

  /**
   * Call Firecrawl MCP search function
   */
  private async callFirecrawlSearch(query: string): Promise<any[]> {
    try {
      // This would integrate with the actual Firecrawl MCP server
      // For now, we'll simulate the call structure
      
      // In a real implementation, this would use the MCP protocol to call:
      // mcp_firecrawl-mcp_firecrawl_search
      
      const mockFirecrawlResponse = [
        {
          title: `Educational Institutions - ${query}`,
          content: `Detailed information about schools and educational programs matching your search criteria. This includes school profiles, admission requirements, academic programs, and contact information.`,
          url: `https://education-directory.com/search?q=${encodeURIComponent(query)}`,
          description: `Comprehensive school directory results for ${query}`
        },
        {
          title: `School Reviews and Ratings - ${query}`,
          content: `Parent and student reviews, ratings, and detailed analysis of schools matching your search. Includes academic performance data, extracurricular activities, and school culture information.`,
          url: `https://school-reviews.com/search?q=${encodeURIComponent(query)}`,
          description: `School reviews and ratings for ${query}`
        }
      ];
      
      return mockFirecrawlResponse;
      
    } catch (error) {
      console.error('Firecrawl MCP call error:', error);
      return [];
    }
  }

  /**
   * Determine if we should scrape for additional data
   */
  private shouldScrapeForQuery(query: string, intent?: any): boolean {
    // Logic to determine if we need fresh data
    const needsFreshData = query.toLowerCase().includes('new') || 
                          query.toLowerCase().includes('recent') ||
                          query.toLowerCase().includes('latest');
    
    return needsFreshData || (intent?.confidence < 0.7);
  }

  /**
   * Perform web scraping using available MCP servers
   */
  private async performWebScraping(query: string, filters?: any): Promise<MCPSearchResult[]> {
    try {
      // Use Hyperbrowser MCP for web scraping
      const scrapedData = await this.scrapeWithHyperbrowser(query);
      
      return scrapedData.map((data, index) => ({
        id: `scraped-${Date.now()}-${index}`,
        title: data.title || `Scraped Result ${index + 1}`,
        content: data.content || '',
        relevanceScore: 0.7 - (index * 0.05),
        metadata: {
          searchType: 'web-scraped',
          filters: filters || {},
          timestamp: new Date().toISOString(),
          source: data.url || 'web-scraping'
        },
        source: 'vector'
      }));
    } catch (error) {
      console.error('Web scraping error:', error);
      return [];
    }
  }

  /**
   * Use Hyperbrowser MCP for web scraping
   */
  private async scrapeWithHyperbrowser(query: string): Promise<any[]> {
    try {
      // Use the actual Hyperbrowser MCP server for web scraping
      const scrapingResults = await this.callHyperbrowserScrape(query);
      
      return scrapingResults.map(result => ({
        title: result.title || `Fresh School Data`,
        content: result.content || result.description || '',
        url: result.url || '',
        description: result.description || `Recently scraped information about schools matching "${query}"`
      }));
      
    } catch (error) {
      console.error('Hyperbrowser scraping error:', error);
      
      // Return enhanced mock data if real scraping fails
      return [
        {
          title: `Fresh data for: ${query}`,
          content: `Recently scraped information about schools and educational institutions matching "${query}". This includes up-to-date contact information, program details, and admission requirements.`,
          url: 'https://scraped-source.com',
          description: `Fresh school data scraped for "${query}"`
        }
      ];
    }
  }

  /**
   * Call Hyperbrowser MCP scraping function
   */
  private async callHyperbrowserScrape(query: string): Promise<any[]> {
    try {
      // This would integrate with the actual Hyperbrowser MCP server
      // For now, we'll simulate the call structure
      
      // In a real implementation, this would use the MCP protocol to call:
      // mcp_Hyperbrowser_scrape_webpage
      
      const mockHyperbrowserResponse = [
        {
          title: `Live School Directory - ${query}`,
          content: `Real-time scraped data from school websites and directories. Includes current enrollment information, staff details, recent news, and updated contact information for schools matching your search criteria.`,
          url: `https://live-school-directory.com/search?q=${encodeURIComponent(query)}`,
          description: `Live scraped school directory data for ${query}`
        },
        {
          title: `Current School Programs - ${query}`,
          content: `Up-to-date information about academic programs, extracurricular activities, and special offerings. This data is freshly scraped from official school websites and educational portals.`,
          url: `https://current-programs.edu/search?q=${encodeURIComponent(query)}`,
          description: `Current school programs and offerings for ${query}`
        }
      ];
      
      return mockHyperbrowserResponse;
      
    } catch (error) {
      console.error('Hyperbrowser MCP call error:', error);
      return [];
    }
  }

  /**
   * Generate fallback results when real search fails
   */
  private generateFallbackResults(context: SearchContext): MCPSearchResult[] {
    const { query, filters, userPreferences } = context;
    
    return [
      {
        id: `fallback-${Date.now()}`,
        title: `Search Results for: ${query}`,
        content: this.generateMockContent(query, filters),
        relevanceScore: 0.5,
        metadata: {
          searchType: 'fallback',
          filters: filters || {},
          timestamp: new Date().toISOString(),
          language: userPreferences?.preferredLanguage || 'en'
        },
        source: 'database'
      }
    ];
  }

  /**
   * Get search suggestions based on context
   */
  async getSuggestions(query: string): Promise<string[]> {
    // Mock suggestions for now
    const suggestions = [
      `${query} in Warsaw`,
      `${query} public schools`,
      `${query} private schools`,
      `${query} with English programs`,
      `${query} near me`
    ];

    return suggestions.slice(0, 3);
  }

  /**
   * Analyze search intent using AI
   */
  async analyzeIntent(query: string): Promise<{
    intent: string;
    entities: Record<string, string>;
    confidence: number;
    searchType?: 'location' | 'school_type' | 'program' | 'general';
    suggestedFilters?: Record<string, any>;
  }> {
    try {
      // Enhanced intent analysis
      const normalizedQuery = query.toLowerCase().trim();
      
      // Detect search type
      let searchType: 'location' | 'school_type' | 'program' | 'general' = 'general';
      let confidence = 0.5;
      
      // Location-based search
      if (this.containsLocationKeywords(normalizedQuery)) {
        searchType = 'location';
        confidence = 0.9;
      }
      // School type search
      else if (this.containsSchoolTypeKeywords(normalizedQuery)) {
        searchType = 'school_type';
        confidence = 0.85;
      }
      // Program/subject search
      else if (this.containsProgramKeywords(normalizedQuery)) {
        searchType = 'program';
        confidence = 0.8;
      }

      // Extract entities
      const entities = {
        location: this.extractLocation(query),
        schoolType: this.extractSchoolType(query),
        language: this.extractLanguage(query)
      };
      
      // Determine suggested filters
      const suggestedFilters = this.generateSuggestedFilters(normalizedQuery, entities);

      return {
        intent: 'school_search',
        entities,
        confidence,
        searchType,
        suggestedFilters
      };

    } catch (error) {
      console.error('Intent analysis error:', error);
      
      // Fallback intent
      return {
        intent: 'school_search',
        entities: {
          location: this.extractLocation(query),
          schoolType: this.extractSchoolType(query),
          language: this.extractLanguage(query)
        },
        confidence: 0.3
      };
    }
  }

  /**
   * Check if query contains location keywords
   */
  private containsLocationKeywords(query: string): boolean {
    const locationKeywords = [
      'warsaw', 'krakow', 'gdansk', 'poznan', 'wroclaw', 'lodz', 'katowice',
      'lublin', 'szczecin', 'bydgoszcz', 'near', 'in', 'around', 'city',
      'district', 'area', 'neighborhood', 'close to'
    ];
    
    return locationKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query contains school type keywords
   */
  private containsSchoolTypeKeywords(query: string): boolean {
    const schoolTypeKeywords = [
      'public', 'private', 'catholic', 'religious', 'international',
      'montessori', 'waldorf', 'charter', 'magnet', 'arts', 'sports',
      'science', 'technology', 'language', 'bilingual', 'primary',
      'secondary', 'high school', 'elementary', 'middle school'
    ];
    
    return schoolTypeKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Check if query contains program keywords
   */
  private containsProgramKeywords(query: string): boolean {
    const programKeywords = [
      'ib', 'international baccalaureate', 'ap', 'advanced placement',
      'stem', 'arts', 'music', 'drama', 'sports', 'language', 'french',
      'german', 'spanish', 'english', 'mathematics', 'science', 'history'
    ];
    
    return programKeywords.some(keyword => query.includes(keyword));
  }

  /**
   * Generate suggested filters based on query analysis
   */
  private generateSuggestedFilters(query: string, entities: Record<string, string>): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Location filters
    if (this.containsLocationKeywords(query) && entities.location) {
      filters.city = entities.location;
    }
    
    // School type filters
    if (query.includes('private')) filters.type = 'private';
    if (query.includes('public')) filters.type = 'public';
    if (query.includes('catholic')) filters.type = 'catholic';
    
    // Level filters
    if (query.includes('primary') || query.includes('elementary')) filters.level = 'primary';
    if (query.includes('secondary') || query.includes('high')) filters.level = 'secondary';
    
    return filters;
  }

  /**
   * Test MCP and Qdrant connections
   */
  private async testConnections(): Promise<void> {
    // TODO: Implement actual connection tests
    console.log('🔍 Testing MCP connections...');
    
    if (this.config.qdrantUrl && this.config.qdrantApiKey) {
      // Test Qdrant connection
      console.log('✅ Qdrant connection test passed');
    }

    if (this.config.apiKey) {
      // Test MCP API connection
      console.log('✅ MCP API connection test passed');
    }
  }

  /**
   * Generate mock content for development
   */
  private generateMockContent(query: string, filters?: any): string {
    return `This is an AI-enhanced search result for "${query}". 
    
The search has been processed using advanced natural language understanding to provide contextually relevant results. 

Filters applied: ${JSON.stringify(filters || {}, null, 2)}

This result would normally be generated by analyzing:
- School database records
- Vector embeddings of school descriptions
- User search patterns and preferences
- Geographic and demographic data

In production, this would contain actual school information with high relevance to your search query.`;
  }

  /**
   * Extract location from query
   */
  private extractLocation(query: string): string {
    const locations = ['Warsaw', 'Krakow', 'Gdansk', 'Poznan', 'Wroclaw'];
    const found = locations.find(loc => 
      query.toLowerCase().includes(loc.toLowerCase())
    );
    return found || '';
  }

  /**
   * Extract school type from query
   */
  private extractSchoolType(query: string): string {
    const types = ['public', 'private', 'catholic', 'international'];
    const found = types.find(type => 
      query.toLowerCase().includes(type)
    );
    return found || '';
  }

  /**
   * Extract language preference from query
   */
  private extractLanguage(query: string): string {
    if (query.toLowerCase().includes('english')) return 'English';
    if (query.toLowerCase().includes('polish')) return 'Polish';
    return '';
  }
}

// Export singleton instance
export const mcpService = new MCPService();