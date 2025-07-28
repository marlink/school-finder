import { NextRequest, NextResponse } from 'next/server';
import { ApifyScrapingService } from '@/lib/scraping/services/apify-service';
import { FirecrawlScrapingService } from '@/lib/scraping/services/firecrawl-service';
import { PythonScrapingService } from '@/lib/scraping/services/python-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      method = 'all', 
      schoolCount = 10, 
      testMode = true,
      regions = ['mazowieckie'] 
    } = body;

    console.log(`🚀 Starting scraping test with method: ${method}, schools: ${schoolCount}`);

    // Initialize services
    const apifyService = new ApifyScrapingService();
    const firecrawlService = new FirecrawlScrapingService();
    const pythonService = new PythonScrapingService();
    
    // Test connection to all services first
    const connectionTests = await Promise.all([
      apifyService.testConnection().then(result => ({ apify: result })).catch(() => ({ apify: false })),
      firecrawlService.testConnection().then(result => ({ firecrawl: result })).catch(() => ({ firecrawl: false })),
      pythonService.testConnection().then(result => ({ python: result })).catch(() => ({ python: false }))
    ]);

    const connections = Object.assign({}, ...connectionTests);
    console.log('📡 Connection test results:', connections);

    let results: any = {};

    if (method === 'all' || method === 'apify') {
      console.log('🔍 Testing Apify scraping...');
      try {
        const apifyResults = await apifyService.scrapeGooglePlaces({
          searchTerms: [`szkoła podstawowa ${regions[0]}`],
          locations: [regions[0]],
          limit: schoolCount
        }, (progress) => {
          console.log(`Apify progress: ${progress.percentage}% - ${progress.message}`);
        });

        results.apify = {
          status: 'completed',
          message: 'Apify scraping completed',
          resultsCount: apifyResults.length,
          sampleData: apifyResults.slice(0, 2)
        };
      } catch (error) {
        results.apify = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (method === 'all' || method === 'firecrawl') {
      console.log('🔥 Testing Firecrawl scraping...');
      try {
        const firecrawlResults = await firecrawlService.scrapePolishSchools({
          regions,
          limit: schoolCount
        }, (progress) => {
          console.log(`Firecrawl progress: ${progress.percentage}%`);
        });

        results.firecrawl = {
          status: 'completed',
          message: 'Firecrawl scraping completed',
          resultsCount: firecrawlResults.length,
          sampleData: firecrawlResults.slice(0, 2)
        };
      } catch (error) {
        results.firecrawl = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    if (method === 'all' || method === 'python') {
      console.log('🐍 Testing Python-style scraping...');
      try {
        const pythonResults = await pythonService.scrapePolishGovernmentSchools({
          regions,
          limit: schoolCount
        }, (progress) => {
          console.log(`Python progress: ${progress.percentage}%`);
        });

        results.python = {
          status: 'completed',
          message: 'Python-style scraping completed',
          resultsCount: pythonResults.length,
          sampleData: pythonResults.slice(0, 2)
        };
      } catch (error) {
        results.python = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      message: `Scraping test completed for ${method} method(s)`,
      connectionTests: connections,
      results,
      config: {
        method,
        schoolCount,
        testMode,
        regions
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Scraping test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Simple status endpoint
    return NextResponse.json({
      success: true,
      message: 'Scraping test API is ready',
      availableMethods: ['apify', 'firecrawl', 'python', 'all'],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Failed to get scraping status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}