#!/bin/bash

# 🚀 AWS Database Setup with RDS PostgreSQL
# ==========================================

set -e

echo "🚀 Setting up AWS RDS PostgreSQL with Multi-Environment Branching"
echo "================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check prerequisites
print_step "1. Prerequisites Check"

if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

if ! command -v aws &> /dev/null; then
    print_warning "AWS CLI not installed. Install with: brew install awscli"
fi

print_status "✅ Prerequisites check passed"

# Backup current environment
print_step "2. Backing up current environment"
BACKUP_DIR="backups/aws-migration-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

for env_file in .env.local .env.staging .env.production; do
    if [ -f "$env_file" ]; then
        cp "$env_file" "$BACKUP_DIR/"
        print_status "✅ Backed up $env_file"
    fi
done

print_status "✅ Environment files backed up to $BACKUP_DIR"

print_step "3. AWS RDS Setup Instructions"
echo ""
print_warning "🔧 AWS RDS SETUP REQUIRED:"
echo ""
echo "1. 🌐 Go to AWS Console → RDS"
echo "2. 🆕 Create PostgreSQL databases:"
echo ""
echo "   📊 PRODUCTION DATABASE:"
echo "   - Engine: PostgreSQL 15.x"
echo "   - Instance: db.t3.micro (free tier) or db.t3.small"
echo "   - DB Name: school_finder_prod"
echo "   - Username: school_finder_admin"
echo "   - Password: [Generate strong password]"
echo "   - VPC: Default or custom"
echo "   - Security Group: Allow port 5432 from your IPs"
echo ""
echo "   🧪 STAGING DATABASE:"
echo "   - Engine: PostgreSQL 15.x"
echo "   - Instance: db.t3.micro"
echo "   - DB Name: school_finder_staging"
echo "   - Username: school_finder_admin"
echo "   - Password: [Same or different password]"
echo ""
echo "   🔧 DEVELOPMENT DATABASE (Optional):"
echo "   - Use local PostgreSQL or smaller RDS instance"
echo "   - DB Name: school_finder_dev"
echo ""

print_step "4. Environment Configuration Templates"

# Create AWS-optimized environment templates
print_status "Creating AWS environment templates..."

# .env.production template
cat > .env.production.template << 'EOF'
# AWS RDS Production Database
DATABASE_URL="postgresql://school_finder_admin:YOUR_PROD_PASSWORD@your-prod-db.region.rds.amazonaws.com:5432/school_finder_prod?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret-min-32-chars"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# Stripe (Production)
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# Other APIs
GOOGLE_MAPS_API_KEY="your-production-google-maps-key"
APIFY_API_TOKEN="your-production-apify-token"

# Environment
NODE_ENV="production"
EOF

# .env.staging template
cat > .env.staging.template << 'EOF'
# AWS RDS Staging Database
DATABASE_URL="postgresql://school_finder_admin:YOUR_STAGING_PASSWORD@your-staging-db.region.rds.amazonaws.com:5432/school_finder_staging?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://your-staging-domain.vercel.app"
NEXTAUTH_SECRET="your-staging-nextauth-secret-min-32-chars"

# OAuth Providers (Staging)
GOOGLE_CLIENT_ID="your-staging-google-client-id"
GOOGLE_CLIENT_SECRET="your-staging-google-client-secret"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# AWS Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# Other APIs
GOOGLE_MAPS_API_KEY="your-staging-google-maps-key"
APIFY_API_TOKEN="your-staging-apify-token"

# Environment
NODE_ENV="staging"
EOF

# .env.local template
cat > .env.local.template << 'EOF'
# Local Development Database (can be local PostgreSQL or AWS RDS dev instance)
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_finder_dev"
# OR use AWS RDS dev instance:
# DATABASE_URL="postgresql://school_finder_admin:YOUR_DEV_PASSWORD@your-dev-db.region.rds.amazonaws.com:5432/school_finder_dev?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-development-nextauth-secret-min-32-chars"

# OAuth Providers (Development)
GOOGLE_CLIENT_ID="your-development-google-client-id"
GOOGLE_CLIENT_SECRET="your-development-google-client-secret"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# AWS Configuration (optional for local dev)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"

# Other APIs
GOOGLE_MAPS_API_KEY="your-development-google-maps-key"
APIFY_API_TOKEN="your-development-apify-token"

# Environment
NODE_ENV="development"
EOF

print_status "✅ Created AWS environment templates"

print_step "5. Git Branch to AWS Environment Mapping"
echo ""
print_status "🌿 BRANCH → AWS ENVIRONMENT MAPPING:"
echo ""
echo "📦 main branch → AWS Production Environment"
echo "   - RDS: school_finder_prod"
echo "   - Domain: your-production-domain.com"
echo "   - Auto-deploy via GitHub Actions"
echo ""
echo "🧪 production-ready branch → AWS Pre-Production"
echo "   - RDS: school_finder_staging (or separate pre-prod DB)"
echo "   - Domain: preprod.your-domain.com"
echo "   - Manual deploy for final testing"
echo ""
echo "🔧 staging branch → AWS Staging Environment"
echo "   - RDS: school_finder_staging"
echo "   - Domain: staging.your-domain.com"
echo "   - Auto-deploy for integration testing"
echo ""

print_step "6. Database Schema Deployment"
echo ""
print_status "📊 SCHEMA DEPLOYMENT COMMANDS:"
echo ""
echo "Deploy to Staging:"
echo "git checkout staging"
echo "npm run env:staging"
echo "npx prisma db push"
echo ""
echo "Deploy to Production-Ready:"
echo "git checkout production-ready"
echo "npm run env:production"
echo "npx prisma db push"
echo ""
echo "Deploy to Production:"
echo "git checkout main"
echo "npm run env:production"
echo "npx prisma migrate deploy"
echo ""

print_step "7. AWS Deployment Configuration"

# Create GitHub Actions workflow for AWS
mkdir -p .github/workflows

cat > .github/workflows/aws-deploy.yml << 'EOF'
name: AWS Multi-Environment Deployment

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, production-ready ]

jobs:
  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma Client
      run: npx prisma generate
      env:
        DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.STAGING_DATABASE_URL }}
        NEXTAUTH_SECRET: ${{ secrets.STAGING_NEXTAUTH_SECRET }}
        NEXTAUTH_URL: ${{ secrets.STAGING_NEXTAUTH_URL }}
    
    - name: Deploy to Vercel Staging
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        working-directory: ./

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma Client
      run: npx prisma generate
      env:
        DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build
      env:
        DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
        NEXTAUTH_SECRET: ${{ secrets.PRODUCTION_NEXTAUTH_SECRET }}
        NEXTAUTH_URL: ${{ secrets.PRODUCTION_NEXTAUTH_URL }}
    
    - name: Deploy to Vercel Production
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
        working-directory: ./
EOF

print_status "✅ Created GitHub Actions workflow for AWS deployment"

print_step "8. Next Steps Summary"
echo ""
print_status "🎯 IMMEDIATE NEXT STEPS:"
echo ""
echo "1. ✅ Keep your current 3-branch setup (perfect for AWS)"
echo "2. 🗄️ Create AWS RDS PostgreSQL databases (prod + staging)"
echo "3. 🔧 Update environment files with AWS RDS connection strings"
echo "4. 🧪 Test database connections: npm run env:staging && npx prisma db push"
echo "5. 🚀 Configure Vercel with AWS environment variables"
echo "6. 🔄 Set up GitHub Actions for automated deployments"
echo ""

print_status "✅ AWS setup script completed!"
print_warning "💰 AWS RDS costs: ~$15-30/month for both databases (much cheaper than Supabase branching)"

echo ""
echo "🎉 Your 3-branch setup is perfect for AWS!"
echo "📊 main → production, production-ready → pre-prod, staging → staging"
echo "🚀 More stable, faster, and cost-effective than Supabase"