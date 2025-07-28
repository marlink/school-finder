import { PrismaClient } from '@prisma/client';
import { ApifyScrapingService } from './services/apify-service';
import { FirecrawlScrapingService } from './services/firecrawl-service';
import { PythonScrapingService } from './services/python-service';

export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  progress: number;
  schoolsProcessed: number;
  totalSchools: number;
  errorMessage?: string;
  config: {
    method: 'apify' | 'firecrawl' | 'python' | 'all';
    schoolCount: number;
    regions: string[];
    testMode: boolean;
    schools?: string[];
    limit?: number;
    preferredMethod?: 'apify' | 'firecrawl' | 'python';
  };
}

export interface ScrapingStats {
  totalJobs: number;
  runningJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalSchoolsProcessed: number;
}

export interface ScrapingResult {
  success: boolean;
  data: any[];
  errors: string[];
  stats: {
    processed: number;
    failed: number;
    duration: number;
  };
}

export class ScrapingOrchestrator {
  private prisma: PrismaClient;
  private apifyService: ApifyScrapingService;
  private firecrawlService: FirecrawlScrapingService;
  private pythonService: PythonScrapingService;
  private jobs: Map<string, ScrapingJob> = new Map();

  constructor() {
    this.prisma = new PrismaClient();
    this.apifyService = new ApifyScrapingService();
    this.firecrawlService = new FirecrawlScrapingService();
    this.pythonService = new PythonScrapingService();
  }

  /**
   * Start a new scraping job
   */
  async startScrapingJob(config: {
    method: 'apify' | 'firecrawl' | 'python' | 'all';
    schoolCount: number;
    regions: string[];
    testMode?: boolean;
    schools?: string[];
    limit?: number;
    preferredMethod?: 'apify' | 'firecrawl' | 'python';
  }): Promise<string> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const job: ScrapingJob = {
      id: jobId,
      status: 'pending',
      startedAt: new Date(),
      progress: 0,
      schoolsProcessed: 0,
      totalSchools: config.schoolCount,
      config: {
        method: config.method,
        schoolCount: config.schoolCount,
        regions: config.regions,
        testMode: config.testMode || false,
        schools: config.schools,
        limit: config.limit,
        preferredMethod: config.preferredMethod
      }
    };

    this.jobs.set(jobId, job);

    // Start job execution asynchronously
    this.executeJob(jobId).catch(error => {
      console.error(`Job ${jobId} failed:`, error);
      const failedJob = this.jobs.get(jobId);
      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.failedAt = new Date();
        failedJob.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
    });

    return jobId;
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): ScrapingJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get overall scraping statistics
   */
  getStats(): ScrapingStats {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      runningJobs: jobs.filter(j => j.status === 'running').length,
      completedJobs: jobs.filter(j => j.status === 'completed').length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      totalSchoolsProcessed: jobs.reduce((sum, j) => sum + j.schoolsProcessed, 0)
    };
  }

  /**
   * Test all service connections
   */
  async testAllConnections(): Promise<{
    apify: boolean;
    firecrawl: boolean;
    python: boolean;
  }> {
    const [apify, firecrawl, python] = await Promise.all([
      this.apifyService.testConnection().catch(() => false),
      this.firecrawlService.testConnection().catch(() => false),
      this.pythonService.testConnection().catch(() => false)
    ]);

    return { apify, firecrawl, python };
  }

  /**
   * Stop a running job
   */
  async stopJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId);
    if (!job || job.status !== 'running') {
      return false;
    }

    job.status = 'cancelled';
    job.completedAt = new Date();
    return true;
  }

  /**
   * Execute a scraping job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    try {
      job.status = 'running';
      
      let results: any[] = [];
      
      if (job.config.method === 'apify' || job.config.method === 'all') {
        console.log(`🔄 Executing Apify scraping for job ${jobId}`);
        
        // First get places data
        const placesResults = await this.apifyService.scrapeGooglePlaces({
          searchTerms: job.config.regions.map(region => `szkoła podstawowa ${region}`),
          locations: job.config.regions,
          limit: job.config.schoolCount
        }, (progress) => {
          job.progress = Math.min(50, progress.percentage);
        });
        
        // Extract place URLs from results for reviews
        const placeUrls = placesResults
          .filter(result => result.url)
          .map(result => result.url)
          .slice(0, 5); // Limit to first 5 for testing
        
        if (placeUrls.length > 0) {
          const reviewsResults = await this.apifyService.scrapeGoogleReviews({
            placeUrls: placeUrls,
            maxReviews: 10
          }, (progress) => {
            job.progress = 50 + Math.min(25, progress.percentage);
          });
          
          results = [...results, ...placesResults, ...reviewsResults];
        } else {
          results = [...results, ...placesResults];
        }
      }

      if (job.config.method === 'firecrawl' || job.config.method === 'all') {
        console.log(`🔥 Executing Firecrawl scraping for job ${jobId}`);
        
        const governmentResults = await this.firecrawlService.scrapePolishSchools({
          regions: job.config.regions,
          limit: job.config.schoolCount
        }, (progress) => {
          job.progress = Math.max(job.progress, 25 + Math.min(25, progress.percentage));
        });
        
        const detailsResults = await this.firecrawlService.scrapeSchoolDetails({
          schoolUrls: governmentResults.slice(0, 3).map(school => school.website || '').filter(Boolean)
        }, (progress) => {
          job.progress = Math.max(job.progress, 50 + Math.min(25, progress.percentage));
        });
        
        results = [...results, ...governmentResults, ...detailsResults];
      }

      if (job.config.method === 'python' || job.config.method === 'all') {
        console.log(`🐍 Executing Python-style scraping for job ${jobId}`);
        
        const pythonResults = await this.pythonService.scrapePolishGovernmentSchools({
          regions: job.config.regions,
          limit: job.config.schoolCount
        }, (progress) => {
          job.progress = Math.max(job.progress, 75 + Math.min(25, progress.percentage));
        });
        
        results = [...results, ...pythonResults];
      }

      // Save results to database
      if (!job.config.testMode) {
        await this.saveResults(results);
      }

      job.status = 'completed';
      job.completedAt = new Date();
      job.progress = 100;
      job.schoolsProcessed = results.length;

      console.log(`✅ Job ${jobId} completed successfully with ${results.length} results`);

    } catch (error) {
      console.error(`❌ Job ${jobId} failed:`, error);
      job.status = 'failed';
      job.failedAt = new Date();
      job.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Save scraping results to database
   */
  private async saveResults(results: any[]): Promise<void> {
    console.log(`💾 Saving ${results.length} results to database...`);
    
    for (const result of results) {
      try {
        // Skip if no googlePlaceId
        if (!result.googlePlaceId) {
          continue;
        }

        // Check if school already exists
        const existingSchool = await this.prisma.school.findFirst({
          where: { 
            OR: [
              { googlePlaceId: result.googlePlaceId },
              { name: result.name, address: result.address }
            ]
          }
        });

        const locationData = result.latitude && result.longitude ? {
          latitude: result.latitude,
          longitude: result.longitude
        } : undefined;

        const schoolData = {
          name: result.name,
          address: result.address,
          contact: result.contact || {},
          location: locationData,
          googlePlaceId: result.googlePlaceId
        };

        if (existingSchool) {
          // Update existing school
          await this.prisma.school.update({
            where: { id: existingSchool.id },
            data: schoolData
          });
        } else {
          // Create new school
          await this.prisma.school.create({
            data: {
              ...schoolData,
              id: `school_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              type: result.type || 'podstawowa'
            }
          });
        }

        // Save Google ratings if available
         if (result.googleRating && existingSchool) {
           // Create a simple review entry for the overall rating
           const reviewId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
           
           await this.prisma.ratingsGoogle.upsert({
             where: { 
               schoolId_googleReviewId: {
                 schoolId: existingSchool.id,
                 googleReviewId: reviewId
               }
             },
             update: {
               rating: result.googleRating,
               reviewText: `Overall rating: ${result.googleRating}/5`,
               authorName: 'Google Places',
               reviewDate: new Date(),
               scrapedAt: new Date()
             },
             create: {
               schoolId: existingSchool.id,
               googleReviewId: reviewId,
               rating: result.googleRating,
               reviewText: `Overall rating: ${result.googleRating}/5`,
               authorName: 'Google Places',
               reviewDate: new Date(),
               scrapedAt: new Date()
             }
           });
         }

      } catch (error) {
        console.error('Error saving school result:', error);
        // Continue with next result
      }
    }

    console.log(`✅ Successfully saved results to database`);
  }
}