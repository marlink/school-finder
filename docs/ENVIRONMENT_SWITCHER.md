# 🔄 Environment Switcher Documentation

## Overview

The environment switcher allows seamless switching between different deployment environments (local, testing, staging, production) with proper configuration management.

## ✅ Status: FULLY FUNCTIONAL

All environment switching functionality has been implemented and tested successfully.

## 🚀 Quick Start

### Switch Environments
```bash
# Switch to local development
npm run env:local

# Switch to testing environment  
npm run env:testing

# Switch to staging environment
npm run env:staging

# Switch to production environment
npm run env:production
```

### Direct Script Usage
```bash
# Alternative direct usage
node scripts/switch-env.js [environment]
```

## 📁 Environment Files

The switcher creates and manages these environment files:

- `.env.local` - Local development configuration
- `.env.testing` - Testing environment configuration  
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration
- `.env` - Active environment (copied from selected environment)

## 🔧 Environment Configurations

### Local Environment
- **NODE_ENV**: `development`
- **NEXT_PUBLIC_ENV**: `local`
- **Database**: Local PostgreSQL
- **Debug**: Enabled
- **Analytics**: Disabled

### Testing Environment  
- **NODE_ENV**: `test`
- **NEXT_PUBLIC_ENV**: `testing`
- **Database**: Local test database
- **Debug**: Enabled
- **Analytics**: Disabled

### Staging Environment
- **NODE_ENV**: `development`
- **NEXT_PUBLIC_ENV**: `staging`
- **Database**: Neon PostgreSQL (staging)
- **Debug**: Enabled
- **Analytics**: Disabled

### Production Environment
- **NODE_ENV**: `production`
- **NEXT_PUBLIC_ENV**: `production`
- **Database**: Production database
- **Debug**: Disabled
- **Analytics**: Enabled

## 📋 Environment Variables

### Required Variables
- `DATABASE_URL` - Database connection string
- `NEXT_PUBLIC_STACK_PROJECT_ID` - Stack Auth project ID
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth client key
- `STACK_SECRET_SERVER_KEY` - Stack Auth server key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
- `NODE_ENV` - Node environment
- `NEXT_PUBLIC_ENV` - Application environment

### Optional Variables
- `APIFY_API_TOKEN` - Apify scraping service
- `MCP_API_KEY` - MCP integration
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXTAUTH_URL` - NextAuth URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key

## 🧪 Testing

### Run Environment Switcher Tests
```bash
node scripts/test-env-switcher.js
```

### Debug Current Environment
```bash
node scripts/debug-current-env.js
```

## 📊 Test Results

✅ **All Tests Passing (100% Success Rate)**

- ✅ Switch to local environment: PASSED
- ✅ Switch to testing environment: PASSED  
- ✅ Switch to staging environment: PASSED
- ✅ Switch to production environment: PASSED
- ✅ Environment files creation: PASSED
- ✅ NPM scripts functionality: PASSED
- ✅ Environment variables validation: PASSED

## 🔍 Verification Commands

### Check Current Environment
```bash
# View current environment variables
node scripts/debug-current-env.js

# Check .env file
cat .env | head -10

# Verify environment in application
echo $NEXT_PUBLIC_ENV
```

### Test Database Connection
```bash
# Test Prisma connection
npx prisma db push --accept-data-loss

# Generate Prisma client
npx prisma generate
```

## 🚨 Known Issues

### Module Type Warning
```
Warning: Module type of file:///path/to/switch-env.js is not specified
```

**Solution**: Add `"type": "module"` to `package.json` (optional - doesn't affect functionality)

### Database Authentication
Some environment database credentials may need updating. Check with:
```bash
npx prisma db pull --print
```

## 🔄 Workflow

1. **Switch Environment**: `npm run env:[environment]`
2. **Verify Switch**: `node scripts/debug-current-env.js`
3. **Start Development**: `npm run dev`
4. **Test Application**: Open `http://localhost:3001`

## 📝 Configuration Updates

To update environment-specific values:

1. Edit the appropriate `.env.[environment]` file
2. Run the switch command to apply changes
3. Restart the development server

## 🎯 Next Steps

1. ✅ Environment switcher implemented and tested
2. ✅ All environments working correctly
3. ⚠️ Update database credentials if needed
4. ⚠️ Configure missing API keys for full functionality
5. ✅ Development server running successfully

## 🔗 Related Files

- `scripts/switch-env.js` - Main switcher script
- `scripts/test-env-switcher.js` - Test suite
- `scripts/debug-current-env.js` - Debug utility
- `package.json` - NPM scripts configuration