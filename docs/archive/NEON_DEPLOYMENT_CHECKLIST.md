# 🚀 Neon Database Deployment Checklist

## Overview
This checklist guides you through deploying the School Finder application to Neon PostgreSQL database with proper environment separation and production-ready configuration.

## Prerequisites ✅

- [ ] Neon account created at [neon.tech](https://neon.tech)
- [ ] Vercel account for deployment
- [ ] GitHub repository access
- [ ] All API keys and credentials ready

## Phase 1: Neon Database Setup 🗄️

### 1.1 Create Neon Project
- [ ] Log into Neon Console
- [ ] Create new project named "school-finder"
- [ ] Set database name to "school_finder_db"
- [ ] Choose region closest to your users (recommended: us-east-1)
- [ ] Note down the project ID

### 1.2 Create Database Branches
- [ ] **Main branch** (production) - automatically created
- [ ] **Staging branch** - create from main
- [ ] **Development branch** - create from main

### 1.3 Get Connection Strings
- [ ] Copy connection string for main branch (production)
- [ ] Copy connection string for staging branch
- [ ] Copy connection string for development branch
- [ ] Ensure all connections use SSL (`sslmode=require`)

## Phase 2: Environment Configuration 🔧

### 2.1 Run Preparation Script
```bash
./scripts/prepare-neon-deployment.sh
```

### 2.2 Configure Development Environment
- [ ] Copy `.env.local.neon` to `.env.local`
- [ ] Update `DATABASE_URL` with development branch connection string
- [ ] Update all placeholder values with actual credentials
- [ ] Test connection: `npx prisma db pull`

### 2.3 Configure Staging Environment
- [ ] Copy `.env.staging.neon` to `.env.staging`
- [ ] Update `DATABASE_URL` with staging branch connection string
- [ ] Update all placeholder values with actual staging credentials
- [ ] Configure staging domain URL

### 2.4 Configure Production Environment
- [ ] Copy `.env.production.neon` to `.env.production`
- [ ] Update `DATABASE_URL` with main branch connection string (with pooling)
- [ ] Update all placeholder values with actual production credentials
- [ ] Configure production domain URL

## Phase 3: Database Migration 🗄️

### 3.1 Development Database
```bash
# Switch to development environment
cp .env.local .env

# Push schema to development branch
npx prisma db push

# Generate Prisma client
npx prisma generate

# Optional: Seed database
npx prisma db seed
```

### 3.2 Staging Database
```bash
# Push schema to staging branch
DATABASE_URL="your-staging-connection-string" npx prisma db push

# Verify staging database
DATABASE_URL="your-staging-connection-string" npx prisma db pull
```

### 3.3 Production Database
```bash
# Push schema to production branch
DATABASE_URL="your-production-connection-string" npx prisma db push

# Verify production database
DATABASE_URL="your-production-connection-string" npx prisma db pull
```

## Phase 4: Application Testing 🧪

### 4.1 Local Development Testing
- [ ] Start development server: `npm run dev`
- [ ] Test database connectivity
- [ ] Verify all pages load correctly
- [ ] Test user authentication
- [ ] Test school data display

### 4.2 Build Testing
- [ ] Run production build: `npm run build`
- [ ] Verify no build errors
- [ ] Test static generation
- [ ] Check for TypeScript errors

### 4.3 Staging Testing
- [ ] Deploy to staging environment
- [ ] Test all functionality in staging
- [ ] Verify database operations
- [ ] Test API endpoints

## Phase 5: Production Deployment 🚀

### 5.1 Vercel Configuration
- [ ] Connect GitHub repository to Vercel
- [ ] Configure build settings:
  - Build Command: `npm run build`
  - Output Directory: `.next`
  - Install Command: `npm install`

### 5.2 Environment Variables in Vercel
- [ ] Add all production environment variables
- [ ] Verify `DATABASE_URL` uses pooled connection
- [ ] Set `NODE_ENV=production`
- [ ] Configure domain settings

### 5.3 Deploy to Production
- [ ] Deploy from `production-ready` branch
- [ ] Monitor deployment logs
- [ ] Verify successful deployment
- [ ] Test production application

## Phase 6: Post-Deployment Verification ✅

### 6.1 Database Health Check
- [ ] Verify database connections
- [ ] Check connection pooling status
- [ ] Monitor query performance
- [ ] Verify data integrity

### 6.2 Application Health Check
- [ ] Test all major features
- [ ] Verify authentication flows
- [ ] Check API responses
- [ ] Monitor error logs

### 6.3 Performance Monitoring
- [ ] Set up database monitoring in Neon
- [ ] Configure application monitoring
- [ ] Set up alerts for critical issues
- [ ] Monitor connection pool usage

## Phase 7: Maintenance Setup 🔧

### 7.1 Backup Strategy
- [ ] Configure automated backups in Neon
- [ ] Set backup retention policy
- [ ] Test backup restoration process
- [ ] Document backup procedures

### 7.2 Monitoring and Alerts
- [ ] Set up database performance alerts
- [ ] Configure connection limit alerts
- [ ] Monitor query performance
- [ ] Set up uptime monitoring

### 7.3 Security Configuration
- [ ] Review database access permissions
- [ ] Verify SSL/TLS configuration
- [ ] Check environment variable security
- [ ] Review API key rotation schedule

## Troubleshooting 🔍

### Common Issues and Solutions

#### Database Connection Issues
```bash
# Test connection
npx prisma db pull

# Check connection string format
echo $DATABASE_URL

# Verify SSL configuration
```

#### Build Failures
```bash
# Clear Next.js cache
rm -rf .next

# Regenerate Prisma client
npx prisma generate

# Rebuild application
npm run build
```

#### Environment Variable Issues
```bash
# Verify environment variables
printenv | grep DATABASE_URL

# Check Vercel environment variables
vercel env ls
```

## Support Resources 📚

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

## Emergency Contacts 🆘

- Database Issues: Neon Support
- Deployment Issues: Vercel Support
- Application Issues: Development Team

---

**✅ Deployment Complete!**

Your School Finder application is now running on Neon PostgreSQL with proper environment separation and production-ready configuration.