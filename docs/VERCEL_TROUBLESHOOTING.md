# 🚀 Vercel Deployment Troubleshooting Guide

*Comprehensive guide for resolving Vercel deployment issues*

## 🚨 Current Issue Status

### ⚠️ **Multiple Failed Deployments Detected**
- **Recent Failures**: Multiple deployments showing "Error" status
- **Last Successful**: 2 days ago - `vercel-schools-5wd4p3c42`
- **Pattern**: Recent deployments (3h, 6h, 7h ago) all failing
- **Environment**: Both Production and Preview deployments affected

## 🔍 Diagnosis

### ✅ **What's Working**
- **Local Build**: ✅ Compiles successfully in ~37s
- **Vercel Authentication**: ✅ Authenticated as expected user
- **Environment Variables**: ✅ All required env vars configured
- **Project Linking**: ✅ Project properly linked to Vercel

### ❌ **What's Failing**
- **Deployment Process**: Multiple recent deployments failing
- **Build on Vercel**: Likely failing during build or runtime

## 🛠️ Resolution Steps

### 1. **Immediate Diagnostics**
```bash
# Check current status
./scripts/session-start.sh

# Verify local build works
npm run build

# Check Vercel authentication
vercel whoami

# List recent deployments
vercel ls | head -10
```

### 2. **Environment Variable Audit**
```bash
# Check local environment
cat .env | grep -v "SECRET\|KEY\|PASSWORD" | head -5

# Check Vercel environment variables
vercel env ls

# Compare critical variables
echo "Checking DATABASE_URL..."
echo "Checking STACK keys..."
echo "Checking API keys..."
```

### 3. **Clean Deployment Process**
```bash
# Step 1: Ensure clean local state
git status
git stash  # if needed

# Step 2: Test local build thoroughly
npm run build
npm run start  # Test production build locally

# Step 3: Deploy with verbose logging
vercel --debug

# Step 4: Monitor deployment
vercel ls | head -5
```

### 4. **Environment-Specific Deployment**
```bash
# Deploy to staging first
npm run build:staging
vercel --target staging

# If staging works, deploy to production
npm run build:production
vercel --target production
```

## 🔧 Common Issues & Solutions

### **Issue 1: Build Failures**
**Symptoms**: Deployment fails during build phase
**Causes**:
- Missing environment variables
- TypeScript compilation errors
- Dependency issues
- Prisma generation failures

**Solutions**:
```bash
# Check build locally first
npm run build

# Check for TypeScript errors
npm run lint

# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run build
```

### **Issue 2: Runtime Errors**
**Symptoms**: Build succeeds but app crashes at runtime
**Causes**:
- Database connection issues
- Missing API keys
- Stack Auth configuration problems
- MCP service connection failures

**Solutions**:
```bash
# Test production build locally
npm run build
npm run start

# Check database connection
npx prisma db push --preview-feature

# Verify Stack Auth configuration
# Check STACK_PROJECT_ID, STACK_PUBLISHABLE_CLIENT_KEY, STACK_SECRET_SERVER_KEY

# Test MCP services
# Check HYPERBROWSER_API_KEY, FIRECRAWL_API_KEY, MCP_API_KEY
```

### **Issue 3: Environment Variable Issues**
**Symptoms**: App works locally but fails on Vercel
**Causes**:
- Missing environment variables on Vercel
- Incorrect variable names
- Wrong environment targeting (dev/preview/production)

**Solutions**:
```bash
# Audit environment variables
vercel env ls

# Add missing variables
vercel env add VARIABLE_NAME

# Remove outdated variables
vercel env rm VARIABLE_NAME

# Pull environment variables locally for testing
vercel env pull .env.vercel
```

### **Issue 4: Permissions/Authentication Issues**
**Symptoms**: Vercel CLI authentication problems
**Causes**:
- macOS profile changes
- Expired authentication tokens
- Wrong team/scope

**Solutions**:
```bash
# Re-authenticate
vercel logout
vercel login

# Check current user and scope
vercel whoami
vercel teams ls

# Switch to correct team if needed
vercel switch [team-name]

# Re-link project
vercel link
```

## 📋 Pre-Deployment Checklist

### ✅ **Before Every Deployment**
- [ ] Local build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Git changes committed and pushed

### ✅ **Environment Variables Required**
- [ ] `DATABASE_URL` - Neon PostgreSQL connection
- [ ] `DATABASE_URL_UNPOOLED` - Direct database connection
- [ ] `STACK_PROJECT_ID` - Stack Auth project ID
- [ ] `STACK_PUBLISHABLE_CLIENT_KEY` - Stack Auth public key
- [ ] `STACK_SECRET_SERVER_KEY` - Stack Auth secret key
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API
- [ ] `HYPERBROWSER_API_KEY` - Hyperbrowser service
- [ ] `FIRECRAWL_API_KEY` - Firecrawl service
- [ ] `MCP_API_KEY` - MCP service
- [ ] `APIFY_API_TOKEN` - Apify scraping service
- [ ] `ADMIN_EMAIL` - Admin user email
- [ ] `NODE_ENV` - Environment setting
- [ ] `NEXT_PUBLIC_ENV` - Public environment setting

## 🚀 Deployment Commands

### **Standard Deployment**
```bash
# Deploy current branch
vercel

# Deploy with specific target
vercel --target production
vercel --target preview
```

### **Debug Deployment**
```bash
# Deploy with verbose logging
vercel --debug

# Deploy specific branch
git checkout staging
vercel --target preview

git checkout main
vercel --target production
```

### **Environment-Specific Deployment**
```bash
# Staging deployment
npm run env:staging
npm run build:staging
vercel --target preview

# Production deployment
npm run env:production
npm run build:production
vercel --target production
```

## 📊 Monitoring & Verification

### **Post-Deployment Checks**
```bash
# Check deployment status
vercel ls | head -5

# Get deployment URL
vercel ls --json | jq -r '.[0].url'

# Check logs (replace with actual deployment URL)
vercel logs [deployment-url]

# Test the deployed application
curl -I https://[deployment-url]
```

### **Health Check Endpoints**
- **API Health**: `https://[deployment-url]/api/health`
- **Database**: `https://[deployment-url]/api/health/database`
- **MCP Services**: `https://[deployment-url]/api/health/mcp`

## 🆘 Emergency Recovery

### **If All Deployments Fail**
```bash
# 1. Reset to last known good state
git checkout main
git pull origin main

# 2. Clean everything
rm -rf .next node_modules package-lock.json
npm install

# 3. Test locally
npm run build
npm run start

# 4. Re-authenticate with Vercel
vercel logout
vercel login
vercel link

# 5. Deploy clean
vercel --debug
```

### **Rollback Strategy**
```bash
# Find last successful deployment
vercel ls | grep "Ready"

# Promote previous deployment
vercel promote [deployment-url]
```

## 📞 Support Resources

### **Vercel Documentation**
- [Deployment Issues](https://vercel.com/docs/concepts/deployments/troubleshoot)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Build Errors](https://vercel.com/docs/concepts/deployments/build-step)

### **Project-Specific Help**
- **Development Guide**: `docs/DEVELOPMENT.md`
- **Deployment Guide**: `docs/DEPLOYMENT.md`
- **Security Guide**: `docs/SECURITY.md`
- **Handover Sessions**: `docs/HANDOVER_SESSIONS.md`

---

## 🎯 Next Steps for Current Issue

### **Immediate Actions Required**
1. **Test Local Build**: Verify `npm run build` works completely
2. **Check Environment Variables**: Ensure all required vars are set on Vercel
3. **Deploy with Debug**: Use `vercel --debug` to get detailed error logs
4. **Monitor Logs**: Check deployment logs for specific error messages
5. **Test Incrementally**: Deploy to preview first, then production

### **Investigation Priority**
1. **Build Process**: Most likely cause of recent failures
2. **Environment Variables**: Check for missing or incorrect values
3. **Database Connection**: Verify Neon PostgreSQL connectivity
4. **Stack Auth**: Ensure authentication configuration is correct
5. **MCP Services**: Check API key validity and service availability

---

*Last Updated: January 2025*
*Status: Active troubleshooting required*