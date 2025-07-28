# School Finder - Scraping System

This document describes the comprehensive scraping system implemented for collecting school data from multiple sources.

## Overview

The scraping system supports three different methods for collecting school data:

1. **Apify Actors** - Primary method for Google Places and Reviews
2. **Firecrawl** - Secondary method for web scraping
3. **Python-style** - Backup method using native Node.js

## Data Collection Goals

### Primary Data Sources:
- **Google Places API** - School basic information, location, contact details
- **Google Reviews** - User reviews and ratings for schools
- **Polish Government Pages** - Official school lists and data
- **School Websites** - Additional details and information

### Data Structure:
```typescript
interface SchoolData {
  // Basic Information
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode?: string;
  
  // Contact Information
  phone?: string;
  email?: string;
  website?: string;
  
  // Google Places Data
  googlePlaceId?: string;
  googleRating?: number;
  googleReviewsCount?: number;
  
  // Location
  latitude?: number;
  longitude?: number;
  
  // Additional Data
  schoolType?: string;
  publicPrivate?: string;
  description?: string;
}
```

## Implementation

### 1. Apify Service (`src/lib/scraping/services/apify-service.ts`)

**Purpose**: Primary scraping method using Apify actors for Google Places and Reviews.

**Actors Used**:
- `compass/crawler-google-places` - For school basic data
- `compass/Google-Maps-Reviews-Scraper` - For reviews

**Configuration**:
```typescript
// Google Places scraping
const placesConfig = {
  searchTerms: ['szkoła podstawowa Warszawa'],
  locations: ['Poland'],
  limit: 10
};

// Reviews scraping
const reviewsConfig = {
  placeUrls: ['https://maps.google.com/place/...'],
  maxReviews: 50
};
```

### 2. Firecrawl Service (`src/lib/scraping/services/firecrawl-service.ts`)

**Purpose**: Secondary method for scraping Polish government school data and school websites.

**Features**:
- Schema-based data extraction
- Structured data parsing
- Rate limiting and error handling

### 3. Python-style Service (`src/lib/scraping/services/python-service.ts`)

**Purpose**: Backup method using native Node.js fetch for basic web scraping.

**Features**:
- Native fetch API
- Mock data generation for testing
- Rate limiting

### 4. Orchestrator (`src/lib/scraping/scraping-orchestrator.ts`)

**Purpose**: Manages and coordinates all scraping methods.

**Features**:
- Job queue management
- Progress tracking
- Error handling and retry logic
- Database integration

## API Endpoints

### Test Endpoint: `/api/admin/scraping/test`

**POST** - Run scraping tests
```json
{
  "method": "all|apify|firecrawl|python",
  "schoolCount": 10,
  "testMode": true,
  "regions": ["mazowieckie"]
}
```

**GET** - Get API status
```json
{
  "success": true,
  "message": "Scraping test API is ready",
  "availableMethods": ["apify", "firecrawl", "python", "all"]
}
```

## Admin Interface

### Test Page: `/admin/scraping/test`

A comprehensive admin interface for testing the scraping system:

- **Method Selection**: Choose between Apify, Firecrawl, Python-style, or all methods
- **Configuration**: Set school count and region
- **Connection Testing**: Verify API connections
- **Results Display**: View scraping results and sample data
- **Progress Monitoring**: Real-time progress updates

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Apify Configuration
APIFY_API_TOKEN=your_apify_api_token_here

# Firecrawl Configuration  
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### 2. Install Dependencies

```bash
npm install apify-client
```

### 3. Database Schema

Ensure your database has the required tables (see `prisma/schema.prisma`):
- `School`
- `SchoolImage`
- `RatingsGoogle`
- `RatingsPortal`
- `Favorite`

### 4. API Keys Setup

#### Apify Setup:
1. Create account at [Apify Console](https://console.apify.com)
2. Go to Account → Integrations
3. Generate API token
4. Add to `.env.local` as `APIFY_API_TOKEN`

#### Firecrawl Setup:
1. Create account at [Firecrawl](https://firecrawl.dev)
2. Get API key from dashboard
3. Add to `.env.local` as `FIRECRAWL_API_KEY`

## Testing Strategy

### 1. Local Development Testing

```bash
# Start development server
npm run dev

# Navigate to admin interface
http://localhost:3000/admin/scraping/test

# Test individual methods
curl -X POST http://localhost:3000/api/admin/scraping/test \
  -H "Content-Type: application/json" \
  -d '{"method": "apify", "schoolCount": 5, "regions": ["mazowieckie"]}'
```

### 2. Progressive Testing Plan

**Phase 1**: Test with 10 schools
- Verify data collection
- Check API connections
- Validate data structure

**Phase 2**: Test with another 10 schools
- Performance testing
- Error handling validation
- Data quality assessment

**Phase 3**: Scale testing
- Larger datasets (50-100 schools)
- Rate limiting validation
- Database performance

### 3. Monitoring and Logging

All scraping operations include:
- Progress callbacks
- Error logging
- Performance metrics
- Data validation

## Cost Considerations

### Apify Pricing:
- Google Places: ~$0.2-$0.6 per 1000 results
- Google Reviews: ~$0.2-$0.6 per 1000 reviews

### Firecrawl Pricing:
- Web scraping: Variable based on usage

### Recommendations:
- Start with small batches (10-20 schools)
- Monitor costs during testing
- Implement rate limiting
- Use caching where possible

## Error Handling

The system includes comprehensive error handling:

1. **Connection Errors**: Retry logic with exponential backoff
2. **Rate Limiting**: Automatic throttling and queuing
3. **Data Validation**: Schema validation for all scraped data
4. **Timeout Handling**: Configurable timeouts for all operations
5. **Logging**: Detailed logging for debugging and monitoring

## Future Enhancements

1. **Real-time Monitoring**: Dashboard for live scraping status
2. **Scheduled Jobs**: Automated periodic data updates
3. **Data Quality Metrics**: Automated data validation and scoring
4. **Advanced Filtering**: More sophisticated school filtering options
5. **Export Features**: Data export in various formats

## Troubleshooting

### Common Issues:

1. **API Key Errors**: Verify environment variables are set correctly
2. **Rate Limiting**: Reduce batch sizes or increase delays
3. **Timeout Errors**: Increase timeout values in service configurations
4. **Data Validation Errors**: Check schema compatibility

### Debug Mode:

Enable detailed logging by setting:
```bash
NODE_ENV=development
```

This will provide verbose console output for all scraping operations.