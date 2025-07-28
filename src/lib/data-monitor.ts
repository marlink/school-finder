import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DataQualityMetrics {
  totalSchools: number;
  schoolsWithCompleteData: number;
  schoolsWithMissingData: number;
  completenessPercentage: number;
  dataFields: {
    [key: string]: {
      total: number;
      filled: number;
      missing: number;
      percentage: number;
    };
  };
  lastUpdated: Date;
}

export interface ScrapingStats {
  googleRatings: {
    total: number;
    lastScraped: Date | null;
    successRate: number;
    avgRating: number;
    recentlyScraped: number; // last 24h
  };
  socialMedia: {
    total: number;
    platforms: {
      [platform: string]: {
        count: number;
        lastScraped: Date | null;
        verified: number;
      };
    };
  };
  images: {
    total: number;
    byType: {
      [type: string]: number;
    };
    verified: number;
  };
  publicRatings: {
    total: number;
    bySources: {
      [source: string]: number;
    };
    latestYear: number;
  };
}

export interface DataMonitorReport {
  timestamp: Date;
  quality: DataQualityMetrics;
  scraping: ScrapingStats;
  alerts: Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    count?: number;
    percentage?: number;
  }>;
  recommendations: string[];
}

export class DataMonitor {
  constructor() {}

  async generateReport(): Promise<DataMonitorReport> {
    const [quality, scraping] = await Promise.all([
      this.getDataQuality(),
      this.getScrapingStats(),
    ]);

    const alerts = this.generateAlerts(quality, scraping);
    const recommendations = this.generateRecommendations(quality, scraping);

    return {
      timestamp: new Date(),
      quality,
      scraping,
      alerts,
      recommendations,
    };
  }

  private async getDataQuality(): Promise<DataQualityMetrics> {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        shortName: true,
        type: true,
        address: true,
        contact: true,
        location: true,
        googlePlaceId: true,
        officialId: true,
        studentCount: true,
        teacherCount: true,
        establishedYear: true,
        languages: true,
        specializations: true,
        facilities: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalSchools = schools.length;
    const dataFields = {
      name: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      shortName: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      type: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      address: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      contact: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      location: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      googlePlaceId: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      officialId: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      studentCount: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      teacherCount: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      establishedYear: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      languages: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      specializations: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
      facilities: { total: totalSchools, filled: 0, missing: 0, percentage: 0 },
    };

    schools.forEach(school => {
      // Check each field for completeness
      Object.keys(dataFields).forEach(field => {
        const value = school[field as keyof typeof school];
        if (value !== null && value !== undefined && value !== '') {
          // For JSON fields, check if they have meaningful data
          if (typeof value === 'object' && value !== null) {
            const hasData = Array.isArray(value) 
              ? value.length > 0
              : Object.keys(value).length > 0;
            if (hasData) {
              dataFields[field].filled++;
            } else {
              dataFields[field].missing++;
            }
          } else {
            dataFields[field].filled++;
          }
        } else {
          dataFields[field].missing++;
        }
      });
    });

    // Calculate percentages
    Object.keys(dataFields).forEach(field => {
      dataFields[field].percentage = Math.round(
        (dataFields[field].filled / dataFields[field].total) * 100
      );
    });

    // Calculate overall completeness
    const totalFields = Object.keys(dataFields).length;
    const totalFilled = Object.values(dataFields).reduce(
      (sum, field) => sum + field.filled,
      0
    );
    const totalPossible = totalSchools * totalFields;
    const completenessPercentage = Math.round((totalFilled / totalPossible) * 100);

    // Count schools with complete vs incomplete data
    const schoolsWithCompleteData = schools.filter(school => {
      return Object.keys(dataFields).every(field => {
        const value = school[field as keyof typeof school];
        if (value === null || value === undefined || value === '') return false;
        if (typeof value === 'object' && value !== null) {
          return Array.isArray(value) ? value.length > 0 : Object.keys(value).length > 0;
        }
        return true;
      });
    }).length;

    return {
      totalSchools,
      schoolsWithCompleteData,
      schoolsWithMissingData: totalSchools - schoolsWithCompleteData,
      completenessPercentage,
      dataFields,
      lastUpdated: new Date(),
    };
  }

  private async getScrapingStats(): Promise<ScrapingStats> {
    const [googleRatings, socialMedia, images, publicRatings] = await Promise.all([
      this.getGoogleRatingsStats(),
      this.getSocialMediaStats(),
      this.getImageStats(),
      this.getPublicRatingsStats(),
    ]);

    return {
      googleRatings,
      socialMedia,
      images,
      publicRatings,
    };
  }

  private async getGoogleRatingsStats() {
    const ratings = await prisma.ratingsGoogle.findMany({
      select: {
        rating: true,
        scrapedAt: true,
      },
    });

    const total = ratings.length;
    const lastScraped = ratings.length > 0 
      ? ratings.reduce((latest, rating) => 
          rating.scrapedAt > latest ? rating.scrapedAt : latest, 
          ratings[0].scrapedAt
        )
      : null;

    // Calculate success rate (assuming ratings with valid data are successful)
    const successRate = total > 0 ? Math.round((ratings.filter(r => r.rating > 0).length / total) * 100) : 0;

    // Calculate average rating
    const avgRating = total > 0 
      ? ratings.reduce((sum, r) => sum + parseFloat(r.rating.toString()), 0) / total
      : 0;

    // Count recently scraped (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentlyScraped = ratings.filter(r => r.scrapedAt > twentyFourHoursAgo).length;

    return {
      total,
      lastScraped,
      successRate,
      avgRating: Math.round(avgRating * 10) / 10,
      recentlyScraped,
    };
  }

  private async getSocialMediaStats() {
    const socialMediaData = await prisma.schoolSocialMedia.findMany({
      select: {
        platform: true,
        isVerified: true,
        lastScraped: true,
      },
    });

    const platforms: { [platform: string]: { count: number; lastScraped: Date | null; verified: number } } = {};

    socialMediaData.forEach(item => {
      if (!platforms[item.platform]) {
        platforms[item.platform] = {
          count: 0,
          lastScraped: null,
          verified: 0,
        };
      }
      platforms[item.platform].count++;
      if (item.isVerified) {
        platforms[item.platform].verified++;
      }
      if (item.lastScraped && (!platforms[item.platform].lastScraped || item.lastScraped > platforms[item.platform].lastScraped!)) {
        platforms[item.platform].lastScraped = item.lastScraped;
      }
    });

    return {
      total: socialMediaData.length,
      platforms,
    };
  }

  private async getImageStats() {
    const images = await prisma.schoolImage.findMany({
      select: {
        imageType: true,
        isVerified: true,
      },
    });

    const byType: { [type: string]: number } = {};
    let verified = 0;

    images.forEach(image => {
      byType[image.imageType] = (byType[image.imageType] || 0) + 1;
      if (image.isVerified) {
        verified++;
      }
    });

    return {
      total: images.length,
      byType,
      verified,
    };
  }

  private async getPublicRatingsStats() {
    const publicRatings = await prisma.ratingsPublicPoland.findMany({
      select: {
        source: true,
        year: true,
      },
    });

    const bySources: { [source: string]: number } = {};
    let latestYear = 0;

    publicRatings.forEach(rating => {
      bySources[rating.source] = (bySources[rating.source] || 0) + 1;
      if (rating.year > latestYear) {
        latestYear = rating.year;
      }
    });

    return {
      total: publicRatings.length,
      bySources,
      latestYear,
    };
  }

  private generateAlerts(quality: DataQualityMetrics, scraping: ScrapingStats): Array<{
    type: 'warning' | 'error' | 'info';
    message: string;
    count?: number;
    percentage?: number;
  }> {
    const alerts: Array<{
      type: 'warning' | 'error' | 'info';
      message: string;
      count?: number;
      percentage?: number;
    }> = [];

    // Data quality alerts
    if (quality.completenessPercentage < 50) {
      alerts.push({
        type: 'error',
        message: 'Overall data completeness is critically low',
        percentage: quality.completenessPercentage,
      });
    } else if (quality.completenessPercentage < 70) {
      alerts.push({
        type: 'warning',
        message: 'Overall data completeness could be improved',
        percentage: quality.completenessPercentage,
      });
    }

    // Check for critical missing fields
    Object.entries(quality.dataFields).forEach(([field, data]) => {
      if (data.percentage < 30) {
        alerts.push({
          type: 'error',
          message: `${field} field is missing in most schools`,
          percentage: data.percentage,
        });
      } else if (data.percentage < 60) {
        alerts.push({
          type: 'warning',
          message: `${field} field has low completion rate`,
          percentage: data.percentage,
        });
      }
    });

    // Scraping alerts
    if (scraping.googleRatings.total < quality.totalSchools * 0.3) {
      alerts.push({
        type: 'warning',
        message: 'Low Google ratings coverage',
        count: scraping.googleRatings.total,
        percentage: Math.round((scraping.googleRatings.total / quality.totalSchools) * 100),
      });
    }

    if (scraping.socialMedia.total < quality.totalSchools * 0.2) {
      alerts.push({
        type: 'warning',
        message: 'Low social media coverage',
        count: scraping.socialMedia.total,
        percentage: Math.round((scraping.socialMedia.total / quality.totalSchools) * 100),
      });
    }

    if (scraping.images.total < quality.totalSchools * 0.5) {
      alerts.push({
        type: 'warning',
        message: 'Low image coverage',
        count: scraping.images.total,
        percentage: Math.round((scraping.images.total / quality.totalSchools) * 100),
      });
    }

    // Recent activity alerts
    if (scraping.googleRatings.recentlyScraped === 0) {
      alerts.push({
        type: 'info',
        message: 'No Google ratings scraped in the last 24 hours',
      });
    }

    return alerts;
  }

  private generateRecommendations(quality: DataQualityMetrics, scraping: ScrapingStats): string[] {
    const recommendations: string[] = [];

    // Data quality recommendations
    if (quality.completenessPercentage < 70) {
      recommendations.push('Focus on improving data completeness across all fields');
    }

    // Field-specific recommendations
    Object.entries(quality.dataFields).forEach(([field, data]) => {
      if (data.percentage < 50) {
        recommendations.push(`Prioritize collecting ${field} data - currently only ${data.percentage}% complete`);
      }
    });

    // Scraping recommendations
    if (scraping.googleRatings.total < quality.totalSchools * 0.5) {
      recommendations.push('Increase Google ratings scraping coverage');
    }

    if (scraping.socialMedia.total < quality.totalSchools * 0.3) {
      recommendations.push('Expand social media profile discovery and scraping');
    }

    if (scraping.images.total < quality.totalSchools * 0.7) {
      recommendations.push('Implement more comprehensive image collection');
    }

    if (scraping.publicRatings.latestYear < new Date().getFullYear() - 1) {
      recommendations.push('Update public ratings with more recent data');
    }

    // Success rate recommendations
    if (scraping.googleRatings.successRate < 80) {
      recommendations.push('Investigate and improve Google ratings scraping reliability');
    }

    return recommendations;
  }

  async exportReport(format: 'json' | 'csv' = 'json'): Promise<string> {
    const report = await this.generateReport();
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    } else {
      // Generate CSV format
      const csvLines = [
        'Category,Metric,Value,Percentage',
        `Data Quality,Total Schools,${report.quality.totalSchools},`,
        `Data Quality,Schools with Complete Data,${report.quality.schoolsWithCompleteData},${Math.round((report.quality.schoolsWithCompleteData / report.quality.totalSchools) * 100)}%`,
        `Data Quality,Overall Completeness,${report.quality.completenessPercentage}%,`,
        '',
        'Field Completeness,,,',
      ];

      Object.entries(report.quality.dataFields).forEach(([field, data]) => {
        csvLines.push(`${field},${data.filled},${data.total},${data.percentage}%`);
      });

      csvLines.push('');
      csvLines.push('Scraping Stats,,,');
      csvLines.push(`Google Ratings,${report.scraping.googleRatings.total},,`);
      csvLines.push(`Social Media,${report.scraping.socialMedia.total},,`);
      csvLines.push(`Images,${report.scraping.images.total},,`);
      csvLines.push(`Public Ratings,${report.scraping.publicRatings.total},,`);

      return csvLines.join('\n');
    }
  }

  async saveReport(filePath?: string): Promise<void> {
    const report = await this.exportReport('json');
    const fileName = filePath || `data-monitor-report-${new Date().toISOString().split('T')[0]}.json`;
    
    // In a real implementation, you'd save to filesystem
    // For now, we'll just log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Report saved to:', fileName);
      console.log('Report data:', report);
    }
  }
}

// Utility function to get a quick overview
export async function getDataOverview(): Promise<{
  totalSchools: number;
  completenessPercentage: number;
  topMissingFields: string[];
  scrapingCoverage: {
    googleRatings: number;
    socialMedia: number;
    images: number;
  };
}> {
  const monitor = new DataMonitor();
  const report = await monitor.generateReport();

  // Get top 3 missing fields
  const topMissingFields = Object.entries(report.quality.dataFields)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .slice(0, 3)
    .map(([field]) => field);

  return {
    totalSchools: report.quality.totalSchools,
    completenessPercentage: report.quality.completenessPercentage,
    topMissingFields,
    scrapingCoverage: {
      googleRatings: Math.round((report.scraping.googleRatings.total / report.quality.totalSchools) * 100),
      socialMedia: Math.round((report.scraping.socialMedia.total / report.quality.totalSchools) * 100),
      images: Math.round((report.scraping.images.total / report.quality.totalSchools) * 100),
    },
  };
}
