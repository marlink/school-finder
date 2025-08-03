# 🚀 Production Environment Setup Guide

## 📋 Overview
This guide will help you create a clean production environment while preserving your existing staging setup with 18 schools.

## 🎯 Current State Analysis
- **Staging Database**: `xhcltxeknhsvxzvvcjlp.supabase.co` (contains 18 schools)
- **Production Database**: Needs to be created
- **Environment**: Currently on staging branch with staging configuration

## 🔧 Step-by-Step Production Setup

### Step 1: Create New Supabase Production Project

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in to your account

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Project Name: `school-finder-production`
   - Database Password: Generate a strong password (save it securely)
   - Region: Choose closest to your users (Europe for Polish schools)

3. **Wait for Project Creation**
   - This takes 2-3 minutes
   - Note down the new project URL and keys

### Step 2: Configure Production Environment

1. **Get Production Credentials**
   ```
   Project URL: https://[NEW-PROJECT-ID].supabase.co
   Anon Key: [NEW-ANON-KEY]
   Service Role Key: [NEW-SERVICE-ROLE-KEY]
   ```

2. **Update .env.production**
   - Replace placeholder values with real production credentials
   - Ensure all API keys are production-ready

### Step 3: Database Schema Setup

1. **Copy Schema from Staging**
   - Export schema from staging database
   - Import to production database
   - Verify all tables and relationships

2. **Run Database Migrations**
   ```bash
   npm run env:production
   npx prisma db push
   npx prisma generate
   ```

### Step 4: Data Migration Strategy

**Option A: Fresh Start (Recommended)**
- Start with empty production database
- Use scraping system to populate with fresh data
- Ensures clean, up-to-date school information

**Option B: Copy from Staging**
- Export 18 schools from staging
- Import to production
- Verify data integrity

### Step 5: Production Branch Setup

1. **Create Production Branch**
   ```bash
   git checkout -b production
   git push origin production
   ```

2. **Update Environment Configuration**
   - Ensure production environment is properly configured
   - Test database connections
   - Verify all services work

### Step 6: Security Checklist

- [ ] Production database has strong password
- [ ] API keys are production-specific
- [ ] No development/staging credentials in production
- [ ] Environment variables properly secured
- [ ] Database access restricted to necessary IPs

### Step 7: Testing & Validation

1. **Connection Test**
   ```bash
   npm run env:production
   node scripts/test-connection.js
   ```

2. **Schema Validation**
   ```bash
   node scripts/check-database-status.js
   ```

3. **Basic Functionality Test**
   - Test user authentication
   - Test school search
   - Test admin functions

## 🛡️ Security Considerations

### Production-Specific Security
- Use strong, unique passwords
- Enable Row Level Security (RLS) on all tables
- Configure proper database policies
- Set up monitoring and alerts

### Environment Separation
- Production credentials never used in development
- Staging and production completely isolated
- Clear documentation of which environment is which

## 🚀 Deployment Preparation

### Vercel Configuration
1. **Environment Variables**
   - Add production environment variables to Vercel
   - Ensure all required variables are set
   - Test deployment with production settings

2. **Domain Setup**
   - Configure production domain
   - Set up SSL certificates
   - Configure DNS settings

### Monitoring Setup
- Set up error tracking (Sentry)
- Configure performance monitoring
- Set up uptime monitoring
- Configure backup schedules

## 📊 Post-Production Checklist

After production is live:
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features work
- [ ] Test user registration/login
- [ ] Validate school search functionality
- [ ] Confirm admin panel access
- [ ] Test data scraping system

## 🔄 Environment Management

### Daily Development Workflow
```bash
# For development (use staging)
npm run env:staging
npm run dev

# For production testing
npm run env:production
npm run build
```

### Environment Switching
- **Staging**: Safe for development and testing
- **Production**: Only for final testing and deployment
- **Never**: Mix staging and production data

## 📞 Support & Troubleshooting

### Common Issues
1. **Database Connection Errors**
   - Verify credentials in .env.production
   - Check Supabase project status
   - Confirm network connectivity

2. **Schema Mismatches**
   - Run `npx prisma db push`
   - Verify migration files
   - Check table structures

3. **Authentication Issues**
   - Verify OAuth settings
   - Check redirect URLs
   - Confirm API key permissions

### Getting Help
- Check project documentation
- Review error logs
- Test with staging environment first
- Verify environment configuration

---

## 🎯 Next Steps

1. **Create Supabase Production Project**
2. **Update .env.production with real credentials**
3. **Test database connection**
4. **Set up production branch**
5. **Configure Vercel deployment**

**Remember**: Keep staging and production completely separate for safety and reliability.