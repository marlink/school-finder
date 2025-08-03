#!/bin/bash

# 🚀 Neon Deployment Preparation Script
# =====================================

set -e

echo "🚀 Preparing for Neon Database Deployment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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
print_step "1. Checking Prerequisites"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Neon CLI is available
if ! npx neonctl --version &> /dev/null; then
    print_error "Neon CLI is not available. Installing..."
    npm install neonctl
fi

NEON_VERSION=$(npx neonctl --version 2>/dev/null || echo "unknown")
print_status "✅ Neon CLI version: $NEON_VERSION"

# Backup current environment
print_step "2. Backing up current environment"
BACKUP_DIR="backups/neon-deployment-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f ".env.local" ]; then
    cp .env.local "$BACKUP_DIR/"
    print_status "✅ Backed up .env.local"
fi

if [ -f ".env.staging" ]; then
    cp .env.staging "$BACKUP_DIR/"
    print_status "✅ Backed up .env.staging"
fi

if [ -f ".env.production" ]; then
    cp .env.production "$BACKUP_DIR/"
    print_status "✅ Backed up .env.production"
fi

print_status "✅ Environment files backed up to $BACKUP_DIR"

print_step "3. Neon Setup Instructions"
echo ""
print_warning "🔧 MANUAL STEPS REQUIRED:"
echo ""
echo "1. 🌐 Go to https://neon.tech and create an account"
echo "2. 🆕 Create a new project:"
echo "   - Project name: school-finder"
echo "   - Database name: school_finder_db"
echo "   - Region: Choose closest to your users (e.g., us-east-1)"
echo ""
echo "3. 🌿 Create branches for different environments:"
echo "   - Main branch (production) - created automatically"
echo "   - Create 'staging' branch from main"
echo "   - Create 'development' branch from main"
echo ""
echo "4. 🔑 Get your connection strings:"
echo "   - Go to Dashboard → Connection Details"
echo "   - Copy connection strings for each branch"
echo "   - Make sure to use pooled connections for production"
echo ""

read -p "Press Enter when you've completed the Neon setup..."

print_step "4. Creating Environment Templates"

# Create .env.local template for development
cat > .env.local.neon << 'EOF'
# 🔧 DEVELOPMENT ENVIRONMENT - Neon Database
# This file contains development environment variables for Neon

# Neon Database Configuration (Development Branch)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/school_finder_db?sslmode=require&options=project%3Dep-xxx-xxx%3Adevelopment"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-development-nextauth-secret"

# Stack Authentication (Development)
NEXT_PUBLIC_STACK_PROJECT_ID="your-dev-stack-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-dev-stack-publishable-key"
STACK_SECRET_SERVER_KEY="your-dev-stack-secret-key"

# Google Maps API (Development)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_DEV_GOOGLE_MAPS_API_KEY_HERE"

# Apify API (Development)
APIFY_API_TOKEN="YOUR_DEV_APIFY_API_TOKEN_HERE"

# OAuth Providers (Development)
GOOGLE_CLIENT_ID="YOUR_DEV_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_DEV_GOOGLE_CLIENT_SECRET_HERE"

# Environment Flags
NODE_ENV="development"
NEXT_PUBLIC_ENV="development"
NEXT_PUBLIC_DEBUG="true"

# Feature Flags (Development)
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_SENTRY="false"
NEXT_PUBLIC_ENABLE_HOTJAR="false"
EOF

# Create .env.staging template
cat > .env.staging.neon << 'EOF'
# 🔧 STAGING ENVIRONMENT - Neon Database
# This file contains staging environment variables for Neon

# Neon Database Configuration (Staging Branch)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/school_finder_db?sslmode=require&options=project%3Dep-xxx-xxx%3Astaging"

# NextAuth Configuration
NEXTAUTH_URL="https://your-staging-domain.vercel.app"
NEXTAUTH_SECRET="your-staging-nextauth-secret"

# Stack Authentication (Staging)
NEXT_PUBLIC_STACK_PROJECT_ID="your-staging-stack-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-staging-stack-publishable-key"
STACK_SECRET_SERVER_KEY="your-staging-stack-secret-key"

# Google Maps API (Staging)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_STAGING_GOOGLE_MAPS_API_KEY_HERE"

# Apify API (Staging)
APIFY_API_TOKEN="YOUR_STAGING_APIFY_API_TOKEN_HERE"

# OAuth Providers (Staging)
GOOGLE_CLIENT_ID="YOUR_STAGING_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_STAGING_GOOGLE_CLIENT_SECRET_HERE"

# Environment Flags
NODE_ENV="staging"
NEXT_PUBLIC_ENV="staging"
NEXT_PUBLIC_DEBUG="true"

# Feature Flags (Staging)
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_SENTRY="false"
NEXT_PUBLIC_ENABLE_HOTJAR="false"
EOF

# Create .env.production template
cat > .env.production.neon << 'EOF'
# 🔧 PRODUCTION ENVIRONMENT - Neon Database
# This file contains production environment variables for Neon

# Neon Database Configuration (Main Branch with Pooling)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/school_finder_db?sslmode=require&pgbouncer=true&connect_timeout=10"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# Stack Authentication (Production)
NEXT_PUBLIC_STACK_PROJECT_ID="your-prod-stack-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-prod-stack-publishable-key"
STACK_SECRET_SERVER_KEY="your-prod-stack-secret-key"

# Google Maps API (Production)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_PROD_GOOGLE_MAPS_API_KEY_HERE"

# Apify API (Production)
APIFY_API_TOKEN="YOUR_PROD_APIFY_API_TOKEN_HERE"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="YOUR_PROD_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_PROD_GOOGLE_CLIENT_SECRET_HERE"

# Environment Flags
NODE_ENV="production"
NEXT_PUBLIC_ENV="production"
NEXT_PUBLIC_DEBUG="false"

# Feature Flags (Production)
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_SENTRY="true"
NEXT_PUBLIC_ENABLE_HOTJAR="true"
EOF

print_status "✅ Created Neon environment templates:"
print_status "   - .env.local.neon (development)"
print_status "   - .env.staging.neon (staging)"
print_status "   - .env.production.neon (production)"

print_step "5. Database Migration Preparation"

# Check if Prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
    print_status "✅ Prisma schema found"
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    print_status "✅ Prisma client generated"
else
    print_error "Prisma schema not found. Please ensure prisma/schema.prisma exists."
    exit 1
fi

print_step "6. Next Steps"
echo ""
print_warning "🔧 MANUAL CONFIGURATION REQUIRED:"
echo ""
echo "1. 📝 Update the environment templates with your actual Neon connection strings:"
echo "   - Copy .env.local.neon to .env.local and update DATABASE_URL"
echo "   - Copy .env.staging.neon to .env.staging and update DATABASE_URL"
echo "   - Copy .env.production.neon to .env.production and update DATABASE_URL"
echo ""
echo "2. 🗄️ Run database migrations:"
echo "   - For development: npx prisma db push"
echo "   - For staging: DATABASE_URL=\$STAGING_URL npx prisma db push"
echo "   - For production: DATABASE_URL=\$PRODUCTION_URL npx prisma db push"
echo ""
echo "3. 🌱 Seed the database (optional):"
echo "   - npx prisma db seed"
echo ""
echo "4. 🚀 Deploy to Vercel:"
echo "   - Configure environment variables in Vercel dashboard"
echo "   - Deploy from production-ready branch"
echo ""

print_step "7. Verification Commands"
echo ""
echo "After updating your environment files, run these commands to verify:"
echo ""
echo "# Test database connection"
echo "npx prisma db pull"
echo ""
echo "# Test application startup"
echo "npm run dev"
echo ""
echo "# Run build test"
echo "npm run build"
echo ""

print_status "✅ Neon deployment preparation complete!"
print_warning "Remember to update the environment templates with your actual Neon credentials before proceeding."