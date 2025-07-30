#!/bin/bash

# 🚀 Migrate from Supabase to Neon with Branching
# ===============================================

set -e

echo "🚀 Migrating from Supabase to Neon with Branching"
echo "================================================="

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

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_status "✅ Prerequisites check passed"

# Backup current environment
print_step "2. Backing up current environment"
BACKUP_DIR="backups/neon-migration-$(date +%Y%m%d_%H%M%S)"
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

# Install Neon CLI (if not already installed)
print_step "3. Installing Neon CLI"
if ! command -v neonctl &> /dev/null; then
    print_status "Installing Neon CLI..."
    npm install -g neonctl
else
    print_status "✅ Neon CLI already installed"
fi

# Check Neon CLI version
NEON_VERSION=$(neonctl --version 2>/dev/null || echo "unknown")
print_status "Neon CLI version: $NEON_VERSION"

print_step "4. Neon Setup Instructions"
echo ""
print_warning "🔧 MANUAL STEPS REQUIRED:"
echo ""
echo "1. 🌐 Go to https://neon.tech and create an account"
echo "2. 🆕 Create a new project:"
echo "   - Project name: school-finder"
echo "   - Database name: school_finder_db"
echo "   - Region: Choose closest to your users"
echo ""
echo "3. 🔑 Get your connection details:"
echo "   - Go to Dashboard → Connection Details"
echo "   - Copy the connection string"
echo ""
echo "4. 🌿 Create branches:"
echo "   - Main branch (production) - created automatically"
echo "   - Create 'staging' branch from main"
echo "   - Create 'development' branch from main"
echo ""

read -p "Press Enter when you've completed the Neon setup..."

print_step "5. Configure Environment Files"

# Create new environment templates
print_status "Creating new environment templates..."

# .env.production template
cat > .env.production.template << 'EOF'
# Neon Production Database
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/school_finder_db?sslmode=require"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"

# Stripe (Production)
STRIPE_PUBLISHABLE_KEY="pk_live_xxx"
STRIPE_SECRET_KEY="sk_live_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Other APIs
GOOGLE_MAPS_API_KEY="your-production-google-maps-key"
APIFY_API_TOKEN="your-production-apify-token"

# Environment
NODE_ENV="production"
EOF

# .env.staging template
cat > .env.staging.template << 'EOF'
# Neon Staging Database (staging branch)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/school_finder_db?sslmode=require&options=project%3Dep-xxx-xxx%3Astaging"

# NextAuth Configuration
NEXTAUTH_URL="https://your-staging-domain.vercel.app"
NEXTAUTH_SECRET="your-staging-nextauth-secret"

# OAuth Providers (Staging)
GOOGLE_CLIENT_ID="your-staging-google-client-id"
GOOGLE_CLIENT_SECRET="your-staging-google-client-secret"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Other APIs
GOOGLE_MAPS_API_KEY="your-staging-google-maps-key"
APIFY_API_TOKEN="your-staging-apify-token"

# Environment
NODE_ENV="staging"
EOF

# .env.local template
cat > .env.local.template << 'EOF'
# Neon Development Database (development branch)
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/school_finder_db?sslmode=require&options=project%3Dep-xxx-xxx%3Adevelopment"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3001"
NEXTAUTH_SECRET="your-development-nextauth-secret"

# OAuth Providers (Development)
GOOGLE_CLIENT_ID="your-development-google-client-id"
GOOGLE_CLIENT_SECRET="your-development-google-client-secret"

# Stripe (Test Mode)
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Other APIs
GOOGLE_MAPS_API_KEY="your-development-google-maps-key"
APIFY_API_TOKEN="your-development-apify-token"

# Environment
NODE_ENV="development"
EOF

print_status "✅ Created environment templates"

print_step "6. Database Migration Instructions"
echo ""
print_warning "🗄️ DATABASE MIGRATION STEPS:"
echo ""
echo "1. 📋 Export your current Supabase data:"
echo "   - Go to Supabase Dashboard → Settings → Database"
echo "   - Use pg_dump or export via SQL Editor"
echo ""
echo "2. 🔄 Update your environment files:"
echo "   - Copy .env.production.template to .env.production"
echo "   - Copy .env.staging.template to .env.staging"
echo "   - Copy .env.local.template to .env.local"
echo "   - Fill in your actual Neon connection strings"
echo ""
echo "3. 🏗️ Set up database schema:"
echo "   npm run env:staging"
echo "   npx prisma db push"
echo ""
echo "4. 📊 Import your data:"
echo "   - Use psql or your preferred PostgreSQL client"
echo "   - Import the exported data to your Neon database"
echo ""

print_step "7. Vercel Deployment Configuration"
echo ""
print_status "📦 Vercel Environment Variables to Update:"
echo ""
echo "Production:"
echo "- DATABASE_URL (from Neon main branch)"
echo "- All other production environment variables"
echo ""
echo "Preview (Staging):"
echo "- DATABASE_URL (from Neon staging branch)"
echo "- All other staging environment variables"
echo ""

print_step "8. Package.json Scripts Update"

# Check if package.json has the environment scripts
if grep -q "env:staging" package.json; then
    print_status "✅ Environment scripts already exist in package.json"
else
    print_warning "⚠️ You may need to add environment switching scripts to package.json"
    echo ""
    echo "Add these scripts to your package.json:"
    echo '"env:development": "cp .env.local .env",'
    echo '"env:staging": "cp .env.staging .env",'
    echo '"env:production": "cp .env.production .env",'
fi

print_step "9. Next Steps Summary"
echo ""
print_status "🎯 IMMEDIATE NEXT STEPS:"
echo ""
echo "1. ✅ Complete Neon project setup (if not done)"
echo "2. 🔧 Update environment files with real Neon credentials"
echo "3. 🗄️ Migrate your Supabase data to Neon"
echo "4. 🧪 Test the connection: npm run env:staging && npx prisma db push"
echo "5. 🚀 Update Vercel environment variables"
echo "6. 🔄 Deploy and test both staging and production"
echo ""

print_status "✅ Migration script completed!"
print_warning "📋 Don't forget to update your TODO.md with the new plan"

echo ""
echo "🎉 Ready to migrate to Neon with free branching!"
echo "💰 You'll save $25/month compared to Supabase branching"
echo "🚀 Better performance and free database branching"