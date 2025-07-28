#!/usr/bin/env tsx

import { DataMonitor, getDataOverview } from '../src/lib/data-monitor';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

interface CliArgs {
  type: 'full' | 'overview' | 'export';
  format: 'json' | 'csv';
  output?: string;
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: CliArgs = {
    type: 'full',
    format: 'json',
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--type' || arg === '-t') {
      parsed.type = args[i + 1] as 'full' | 'overview' | 'export';
      i++;
    } else if (arg === '--format' || arg === '-f') {
      parsed.format = args[i + 1] as 'json' | 'csv';
      i++;
    } else if (arg === '--output' || arg === '-o') {
      parsed.output = args[i + 1];
      i++;
    }
  }

  return parsed;
}

function showHelp() {
  console.log(`
Data Monitor CLI - School Finder

Usage: npm run data-monitor [options]

Options:
  -t, --type [full|overview|export]  Type of report to generate (default: full)
  -f, --format [json|csv]            Output format (default: json)
  -o, --output <filename>            Output file path
  -h, --help                         Show this help message

Examples:
  npm run data-monitor                          # Generate full report
  npm run data-monitor -t overview             # Generate overview
  npm run data-monitor -t export -f csv        # Export as CSV
  npm run data-monitor -t full -o report.json  # Save full report to file

Report Types:
  full     - Complete data quality and scraping statistics
  overview - Quick summary of key metrics
  export   - Formatted export suitable for external analysis
  `);
}

function formatOverview(overview: any) {
  console.log('\n=== DATA QUALITY OVERVIEW ===');
  console.log(`Total Schools: ${overview.totalSchools}`);
  console.log(`Data Completeness: ${overview.completenessPercentage}%`);
  console.log(`\nTop Missing Fields:`);
  overview.topMissingFields.forEach((field: string, index: number) => {
    console.log(`  ${index + 1}. ${field}`);
  });
  console.log(`\nScraping Coverage:`);
  console.log(`  Google Ratings: ${overview.scrapingCoverage.googleRatings}%`);
  console.log(`  Social Media: ${overview.scrapingCoverage.socialMedia}%`);
  console.log(`  Images: ${overview.scrapingCoverage.images}%`);
}

function formatFullReport(report: any) {
  console.log('\n=== DATA MONITOR REPORT ===');
  console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
  
  console.log('\n--- DATA QUALITY ---');
  console.log(`Total Schools: ${report.quality.totalSchools}`);
  console.log(`Schools with Complete Data: ${report.quality.schoolsWithCompleteData}`);
  console.log(`Schools with Missing Data: ${report.quality.schoolsWithMissingData}`);
  console.log(`Overall Completeness: ${report.quality.completenessPercentage}%`);
  
  console.log('\n--- FIELD COMPLETENESS ---');
  const sortedFields = Object.entries(report.quality.dataFields)
    .sort((a: any, b: any) => b[1].percentage - a[1].percentage);
  
  sortedFields.forEach(([field, data]: [string, any]) => {
    const status = data.percentage >= 80 ? '✓' : data.percentage >= 60 ? '!' : '✗';
    console.log(`  ${status} ${field}: ${data.percentage}% (${data.filled}/${data.total})`);
  });
  
  console.log('\n--- SCRAPING STATISTICS ---');
  console.log(`Google Ratings: ${report.scraping.googleRatings.total}`);
  console.log(`  Success Rate: ${report.scraping.googleRatings.successRate}%`);
  console.log(`  Average Rating: ${report.scraping.googleRatings.avgRating}`);
  console.log(`  Recently Scraped: ${report.scraping.googleRatings.recentlyScraped}`);
  
  console.log(`\nSocial Media: ${report.scraping.socialMedia.total}`);
  Object.entries(report.scraping.socialMedia.platforms).forEach(([platform, data]: [string, any]) => {
    console.log(`  ${platform}: ${data.count} (${data.verified} verified)`);
  });
  
  console.log(`\nImages: ${report.scraping.images.total}`);
  console.log(`  Verified: ${report.scraping.images.verified}`);
  Object.entries(report.scraping.images.byType).forEach(([type, count]: [string, any]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log(`\nPublic Ratings: ${report.scraping.publicRatings.total}`);
  console.log(`  Latest Year: ${report.scraping.publicRatings.latestYear}`);
  Object.entries(report.scraping.publicRatings.bySources).forEach(([source, count]: [string, any]) => {
    console.log(`  ${source}: ${count}`);
  });
  
  if (report.alerts.length > 0) {
    console.log('\n--- ALERTS ---');
    report.alerts.forEach((alert: any) => {
      const icon = alert.type === 'error' ? '❌' : alert.type === 'warning' ? '⚠️' : 'ℹ️';
      console.log(`  ${icon} ${alert.message}`);
      if (alert.percentage !== undefined) {
        console.log(`     (${alert.percentage}%)`);
      }
    });
  }
  
  if (report.recommendations.length > 0) {
    console.log('\n--- RECOMMENDATIONS ---');
    report.recommendations.forEach((rec: string, index: number) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
}

async function main() {
  const args = parseArgs();
  
  if (args.help) {
    showHelp();
    return;
  }
  
  console.log('🔍 Generating data monitor report...');
  
  try {
    const monitor = new DataMonitor();
    
    if (args.type === 'overview') {
      const overview = await getDataOverview();
      formatOverview(overview);
      
      if (args.output) {
        writeFileSync(args.output, JSON.stringify(overview, null, 2));
        console.log(`\n📄 Report saved to: ${args.output}`);
      }
    } else if (args.type === 'export') {
      const exportData = await monitor.exportReport(args.format);
      
      if (args.output) {
        writeFileSync(args.output, exportData);
        console.log(`\n📄 Export saved to: ${args.output}`);
      } else {
        console.log('\n--- EXPORT DATA ---');
        console.log(exportData);
      }
    } else {
      // Full report
      const report = await monitor.generateReport();
      formatFullReport(report);
      
      if (args.output) {
        const outputData = args.format === 'csv' 
          ? await monitor.exportReport('csv')
          : JSON.stringify(report, null, 2);
        writeFileSync(args.output, outputData);
        console.log(`\n📄 Report saved to: ${args.output}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error generating report:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
