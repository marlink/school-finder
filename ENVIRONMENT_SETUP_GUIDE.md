# 🌍 Environment Setup Guide

## Overview
This project uses a **three-tier environment system** with distinct databases and configurations for each environment:

1. **🧪 TESTING** - Local development with isolated test database
2. **🔧 STAGING** - Safe development environment with real-like data  
3. **🚀 PRODUCTION** - Live environment with real users

---

## 📊 Database Architecture

### Current Setup Status ✅

| Environment | Database | Supabase Project | Port | Purpose |
|-------------|----------|------------------|------|---------|
| **Testing** | `prisma-test-db` | *Local/Mock* | 3000 | Unit tests, isolated development |
| **Staging** | `xhcltxeknhsvxzvvcjlp` | Staging Project | 3001 | Safe testing with real-like data |
| **Production** | `iakvamnayaknanniejjs` | Production Project | 3001 | Live users, real data |

### Database Details

#### 🧪 Testing Environment
- **Purpose**: Unit tests, isolated development, safe experimentation
- **Database**: Uses mocked Prisma client for tests
- **Data**: Mock data, no real school information
- **Safety**: ✅ Completely isolated, no risk to real data
- **Access**: Local only

#### 🔧 Staging Environment  
- **Purpose**: Development with real-like data, feature testing
- **Database**: `postgresql://postgres.xhcltxeknhsvxzvvcjlp:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- **Data**: 5 real Polish schools for testing
- **Safety**: ✅ Separate from production, safe for development
- **Access**: Development team only

#### 🚀 Production Environment
- **Purpose**: Live application with real users
- **Database**: `postgresql://postgres.iakvamnayaknanniejjs:...@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
- **Data**: Full production dataset
- **Safety**: ⚠️ CRITICAL - Real user data, handle with extreme care
- **Access**: Production deployment only

---

## 🔧 Environment Files

### File Structure
```
.env.local      # Currently active environment (copied from target)
.env.staging    # Staging configuration
.env.production # Production configuration
```

### Missing: Testing Environment
**⚠️ ACTION NEEDED**: We need to create `.env.testing` for isolated test environment.

---

## 🚀 Usage Commands

### Switch Environments
```bash
# Switch to staging (safe development)
npm run env:staging
npm run dev

# Switch to production (deployment only)
npm run env:production
npm run build:production

# Testing (needs setup)
npm run env:testing  # ⚠️ TO BE CREATED
npm test
```

### Development Workflow
```bash
# 1. Daily development (recommended)
npm run env:staging
npm run dev

# 2. Run tests
npm test              # Uses mocked database
npm run test:e2e      # End-to-end tests

# 3. Production build (CI/CD only)
npm run build:production
```

---

## 🛡️ Security & Safety

### Environment Separation
- ✅ **Staging** and **Production** use completely different Supabase projects
- ✅ **Different database URLs** prevent accidental cross-environment access
- ✅ **Different API keys** for each environment
- ⚠️ **Testing environment** needs dedicated setup

### Safety Measures
1. **Never use production credentials in development**
2. **Always verify environment before running scripts**
3. **Use staging for all development and testing**
4. **Production access only through CI/CD**

---

## 📋 Current Status & Next Steps

### ✅ Completed
- [x] Staging environment with real Polish school data
- [x] Production environment setup
- [x] Environment switching system
- [x] Prisma ORM integration
- [x] Separate Supabase projects

### ⚠️ Missing - Testing Environment
We need to create a dedicated testing environment:

1. **Create `.env.testing`** with isolated test database
2. **Add testing scripts** to package.json
3. **Configure Jest** to use test environment
4. **Set up test data seeding**

### 🎯 Recommended Next Actions
1. Create isolated testing environment
2. Add test database seeding scripts
3. Update Jest configuration for test environment
4. Document testing workflows

---

## 🔍 Environment Verification

### Check Current Environment
```bash
# View current environment
cat .env.local | grep NEXT_PUBLIC_SUPABASE_URL

# Staging: https://xhcltxeknhsvxzvvcjlp.supabase.co
# Production: https://iakvamnayaknanniejjs.supabase.co
```

### Verify Database Connection
```bash
# Check staging data
npm run env:staging
node scripts/check-staging-data.js

# Check production (careful!)
npm run env:production  
node scripts/check-current-data.js
```

---

## 📞 Emergency Procedures

### If Wrong Environment Used
1. **STOP** all running processes immediately
2. **Check** current .env.local file
3. **Switch** to correct environment
4. **Verify** database URL before proceeding

### Database Recovery
- **Staging**: Can be reset safely
- **Production**: Contact admin immediately if issues occur

---

*Last Updated: January 2025*
*Maintainer: Development Team*