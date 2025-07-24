# Deployment Process

## Overview
This document explains how to deploy the School Finder Portal to production using Vercel.

## Prerequisites
- GitHub account connected to Vercel
- Vercel account with appropriate team permissions
- All environment variables ready for production

## Deployment Steps

### 1. Prepare Environment Variables
Ensure all required environment variables are set in Vercel:

```
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_URL=https://schoolfinder.example.com
NEXTAUTH_SECRET=your-nextauth-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External APIs
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
APIFY_API_TOKEN=your-apify-token

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# Stripe
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Redis
UPSTASH_REDIS_URL=your-upstash-redis-url
UPSTASH_REDIS_TOKEN=your-upstash-redis-token
```

### 2. Configure Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `next build`
   - Install Command: `npm install`
   - Output Directory: .next

### 3. Configure Custom Domain

1. In your project dashboard, go to "Settings" → "Domains"
2. Add your custom domain (e.g., schoolfinder.example.com)
3. Follow the DNS configuration instructions provided by Vercel

### 4. Set Up Database for Production

1. Create a production database (e.g., on Railway, Supabase, or PlanetScale)
2. Run migrations on the production database:

```bash
NODE_ENV=production npx prisma migrate deploy
```

### 5. Deploy from GitHub

Vercel automatically deploys when you push to the main branch. For manual deployment:

1. Go to your project in Vercel dashboard
2. Click "Deployments" tab
3. Click "Deploy" button

## Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    },
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=60, stale-while-revalidate=300"
        }
      ]
    }
  ],
  "crons": [
    {
      "path": "/api/cron/scrape-schools",
      "schedule": "0 0 * * 0"
    },
    {
      "path": "/api/cron/update-search-limits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Deployment Checks

### Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Database migrations are ready to run
- [ ] All tests pass in CI pipeline
- [ ] Build succeeds locally with `npm run build`
- [ ] API endpoints are properly secured
- [ ] Rate limiting is configured for production

### Post-Deployment Verification

1. Check that the site loads correctly
2. Verify authentication flows work
3. Test search functionality
4. Confirm subscription payments process correctly
5. Verify that cron jobs are scheduled

## Rollback Process

If issues are detected after deployment:

1. Go to Vercel dashboard → Deployments
2. Find the last stable deployment
3. Click the three dots menu → "Promote to Production"

## Monitoring

1. Set up Vercel Analytics to monitor performance
2. Configure alerts for deployment failures
3. Set up error tracking with Sentry

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.5,
  environment: process.env.NODE_ENV,
});
```