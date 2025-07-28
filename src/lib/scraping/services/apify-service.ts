import { ApifyClient } from 'apify-client';

export interface ApifyProgressCallback {
  (progress: { percentage: number; processed: number; total: number; message?: string }): void;
}

export class ApifyScrapingService {
  private client: ApifyClient;

  constructor() {
    this.client = new ApifyClient({
      token: process.env.APIFY_API_TOKEN,
    });
  }

  /**
   * Scrape Google Places data using Apify
   */
  async scrapeGooglePlaces(config: {
    searchTerms?: string[];
    locations?: string[];
    limit?: number;
  }, progressCallback?: ApifyProgressCallback): Promise<any[]> {
    
    if (!process.env.APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is not configured');
    }

    try {
      // Use the Google Maps scraper actor
      const run = await this.client.actor('compass/crawler-google-places').call({
        searchStringsArray: config.searchTerms || ['szkoła podstawowa Warszawa'],
        locationQuery: config.locations?.[0] || 'Poland',
        maxCrawledPlacesPerSearch: config.limit || 10,
        language: 'pl',
        includeImages: true,
        includeReviews: false, // We'll scrape reviews separately
        exportPlaceUrls: true,
        additionalInfo: true
      });

      // Monitor progress
      let attempts = 0;
      const maxAttempts = 60; // 10 minutes max
      
      while (attempts < maxAttempts) {
        const runInfo = await this.client.run(run.id).get();
        
        if (!runInfo) {
          throw new Error('Failed to get run information from Apify');
        }
        
        if (progressCallback) {
          progressCallback({
            percentage: Math.min(95, (attempts / maxAttempts) * 100),
            processed: 0,
            total: config.limit || 10,
            message: `Status: ${runInfo.status}`
          });
        }

        if (runInfo.status === 'SUCCEEDED') {
          // Get results
          const { items } = await this.client.dataset(runInfo.defaultDatasetId).listItems();
          
          if (progressCallback) {
            progressCallback({
              percentage: 100,
              processed: items.length,
              total: items.length,
              message: 'Completed successfully'
            });
          }

          return items;
        } else if (runInfo.status === 'FAILED') {
          throw new Error(`Apify run failed: ${runInfo.statusMessage}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      }

      throw new Error('Apify run timeout');
    } catch (error) {
      console.error('Apify Google Places scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape Google Reviews using Apify
   */
  async scrapeGoogleReviews(config: {
    placeUrls: string[];
    maxReviews?: number;
  }, progressCallback?: ApifyProgressCallback): Promise<any[]> {
    
    if (!process.env.APIFY_API_TOKEN) {
      throw new Error('APIFY_API_TOKEN is not configured');
    }

    try {
      // Use the Google Reviews scraper actor
      const run = await this.client.actor('compass/Google-Maps-Reviews-Scraper').call({
        startUrls: config.placeUrls.map(url => ({ url })),
        maxReviews: config.maxReviews || 50,
        language: 'pl',
        sort: 'newest'
      });

      // Monitor progress
      let attempts = 0;
      const maxAttempts = 60;
      
      while (attempts < maxAttempts) {
        const runInfo = await this.client.run(run.id).get();
        
        if (!runInfo) {
          throw new Error('Failed to get run information from Apify');
        }
        
        if (progressCallback) {
          progressCallback({
            percentage: Math.min(95, (attempts / maxAttempts) * 100),
            processed: 0,
            total: config.placeUrls.length,
            message: `Status: ${runInfo.status}`
          });
        }

        if (runInfo.status === 'SUCCEEDED') {
          const { items } = await this.client.dataset(runInfo.defaultDatasetId).listItems();
          
          if (progressCallback) {
            progressCallback({
              percentage: 100,
              processed: items.length,
              total: items.length,
              message: 'Reviews scraped successfully'
            });
          }

          return items;
        } else if (runInfo.status === 'FAILED') {
          throw new Error(`Apify reviews run failed: ${runInfo.statusMessage}`);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 10000));
      }

      throw new Error('Apify reviews run timeout');
    } catch (error) {
      console.error('Apify Google Reviews scraping failed:', error);
      throw error;
    }
  }

  /**
   * Test Apify connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!process.env.APIFY_API_TOKEN) {
        return false;
      }
      
      const user = await this.client.user().get();
      console.log(`✅ Connected to Apify as: ${user.username}`);
      return true;
    } catch (error) {
      console.error('❌ Apify connection failed:', error);
      return false;
    }
  }
}