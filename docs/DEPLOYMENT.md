# 🚀 DEPLOYMENT GUIDE

*School Finder Production Deployment Guide - Updated for Stack Auth*

## 📊 Current Status

### ✅ Build Status
- ✅ Local build: **SUCCESSFUL**
- ✅ TypeScript compilation: **PASSED**
- ✅ ESLint: **PASSED**
- ✅ Production bundle: **OPTIMIZED**

### 🔧 Technical Stack
- **Framework**: Next.js 15.4.1 (App Router)
- **Frontend**: React 19.1.0, Tailwind CSS, Radix UI
- **Backend**: API routes, Prisma ORM
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: Stack Auth (OAuth2 with Google/GitHub)
- **Storage**: Supabase (file uploads)
- **Deployment**: Vercel-ready configuration

## 🔧 Environment Setup

### Required Environment Variables

#### Production
```bash
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID="your_stack_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_stack_publishable_key"
STACK_SECRET_SERVER_KEY="your_stack_secret_key"

# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"

# Supabase Configuration (for file storage)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_key"

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# MCP Service Configuration
MCP_API_KEY="your_mcp_api_key"
FIRECRAWL_API_KEY="your_firecrawl_api_key"
HYPERBROWSER_API_KEY="your_hyperbrowser_api_key"

# Apify Configuration
APIFY_API_TOKEN="your_apify_token"

# Environment
NODE_ENV="production"
NEXT_PUBLIC_ENV="production"
```

#### Staging
```bash
# Stack Auth Configuration (Staging)
NEXT_PUBLIC_STACK_PROJECT_ID="your_staging_stack_project_id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your_staging_stack_publishable_key"
STACK_SECRET_SERVER_KEY="your_staging_stack_secret_key"

# Database Configuration (Staging)
DATABASE_URL="postgresql://staging_user:password@staging_host:port/staging_database?sslmode=require"

# Staging API Keys (use test/staging keys)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_STAGING_GOOGLE_MAPS_API_KEY_HERE"
MCP_API_KEY="your_staging_mcp_api_key"
APIFY_API_TOKEN="your_staging_apify_token"

# Environment
NODE_ENV="development"
NEXT_PUBLIC_ENV="staging"
```

## Deployment Options

### Option 1: Vercel (Recommended)
1. **Environment Variables Setup**:
   - Configure all required variables in Vercel dashboard
   - Set Node.js version to 18.x or 20.x
   - Enable build cache

2. **Vercel Configuration**:
   - Increase build timeout if needed
   - Ensure `vercel.json` is properly configured
   - Monitor build logs for issues

### Option 2: Alternative Platforms
1. **Netlify**: Good for static exports
2. **Railway**: Excellent for full-stack applications
3. **DigitalOcean App Platform**: Reliable and cost-effective

## Pre-Deployment Checklist

### Environment Setup
- [ ] Create staging Supabase project
- [ ] Configure staging environment variables
- [ ] Test local development with staging database
- [ ] Verify no production database pollution

### Build Verification
- [ ] Run `npm run build` successfully
- [ ] Test all pages load without errors
- [ ] Verify TypeScript compilation
- [ ] Check for console errors

### Database & Authentication
- [ ] Set up production/staging database (Supabase)
- [ ] Configure OAuth providers (Google, GitHub)
- [ ] Test authentication flow
- [ ] Verify database migrations

### Production Readiness
- [ ] Set up monitoring and analytics
- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Test all features in production
- [ ] Set up backup strategy

## Troubleshooting

### Common Build Issues
1. **Prisma Generation**: Ensure `prisma generate` runs before build
2. **Environment Variables**: Verify all required variables are set
3. **TypeScript Errors**: Check for type mismatches
4. **Import Errors**: Verify all imports use correct case

### Deployment Failures
1. **Memory Limits**: Increase build memory in platform settings
2. **Timeout Issues**: Increase build timeout
3. **Dependency Conflicts**: Check for version mismatches
4. **API Route Issues**: Verify all routes are properly configured

## Environment Switching

Use the provided scripts for easy environment switching:

```bash
# Switch to staging
npm run env:staging

# Switch to production
npm run env:production

# Switch to local
npm run env:local

# Run with specific environment
npm run dev:staging
npm run dev:production
npm run build:staging
npm run build:production
```

## Monitoring & Maintenance

### Post-Deployment
- Monitor application performance
- Check error logs regularly
- Monitor database usage
- Track user analytics

### Regular Maintenance
- Update dependencies regularly
- Monitor security vulnerabilities
- Backup database regularly
- Review and optimize performance

---

**Next Action**: Complete environment setup and choose deployment strategy.