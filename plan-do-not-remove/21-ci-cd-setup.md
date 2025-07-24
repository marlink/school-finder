# CI/CD Setup

## Overview
The School Finder Portal uses GitHub Actions for Continuous Integration (CI) and Vercel for Continuous Deployment (CD).

## GitHub Actions Workflow

### Main Workflow File
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, development]
  pull_request:
    branches: [main, development]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.TEST_NEXTAUTH_SECRET }}
      
      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.TEST_NEXTAUTH_SECRET }}
          NEXTAUTH_URL: http://localhost:3000
          GOOGLE_CLIENT_ID: ${{ secrets.TEST_GOOGLE_CLIENT_ID }}
          GOOGLE_CLIENT_SECRET: ${{ secrets.TEST_GOOGLE_CLIENT_SECRET }}
          GITHUB_ID: ${{ secrets.TEST_GITHUB_ID }}
          GITHUB_SECRET: ${{ secrets.TEST_GITHUB_SECRET }}
          GOOGLE_MAPS_API_KEY: ${{ secrets.TEST_GOOGLE_MAPS_API_KEY }}
          APIFY_API_TOKEN: ${{ secrets.TEST_APIFY_API_TOKEN }}
          STRIPE_SECRET_KEY: ${{ secrets.TEST_STRIPE_SECRET_KEY }}
          STRIPE_PRICE_ID: ${{ secrets.TEST_STRIPE_PRICE_ID }}
          STRIPE_WEBHOOK_SECRET: ${{ secrets.TEST_STRIPE_WEBHOOK_SECRET }}
```

## Vercel Deployment

### Automatic Deployments
Vercel automatically deploys:
- Production branch (main) to production environment
- Development branch to staging environment
- Pull request previews for all PRs

### vercel.json Configuration
```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "development": true,
      "feature/*": false
    }
  },
  "crons": [
    {
      "path": "/api/cron/scrape-schools",
      "schedule": "0 0 * * 0"
    },
    {
      "path": "/api/cron/reset-search-limits",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## Database Migrations

### Migration in CI/CD Pipeline
```yaml
# .github/workflows/database-migration.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'prisma/schema.prisma'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Apply database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Environment Variables

### Vercel Environment Variables
Set up the following environment variables in Vercel:

- `DATABASE_URL`: Connection string for PlanetScale/DynamoDB
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `NEXTAUTH_URL`: URL of the deployed application
- `GOOGLE_CLIENT_ID`: OAuth client ID for Google
- `GOOGLE_CLIENT_SECRET`: OAuth client secret for Google
- `GITHUB_ID`: OAuth client ID for GitHub
- `GITHUB_SECRET`: OAuth client secret for GitHub
- `GOOGLE_MAPS_API_KEY`: API key for Google Maps
- `APIFY_API_TOKEN`: API token for Apify
- `STRIPE_SECRET_KEY`: Secret key for Stripe
- `STRIPE_PRICE_ID`: Price ID for subscription
- `STRIPE_WEBHOOK_SECRET`: Secret for Stripe webhooks

### Environment Variable Groups
Create environment variable groups in Vercel for different environments (production, preview, development).