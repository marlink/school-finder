#!/bin/bash

# Complete Neon Setup Script
# Run this after you have your Neon connection strings

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 Completing Neon Database Setup"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_step "1. Collecting Neon Connection Information"

echo ""
print_warning "Please provide your Neon connection strings:"
echo ""

# Get connection strings from user
read -p "📍 Production (main branch) DATABASE_URL: " PROD_DB_URL
read -p "📍 Staging DATABASE_URL: " STAGING_DB_URL  
read -p "📍 Development DATABASE_URL: " DEV_DB_URL

# Validate URLs
if [[ ! $PROD_DB_URL =~ ^postgresql:// ]]; then
    print_error "Production URL must start with postgresql://"
    exit 1
fi

if [[ ! $STAGING_DB_URL =~ ^postgresql:// ]]; then
    print_error "Staging URL must start with postgresql://"
    exit 1
fi

if [[ ! $DEV_DB_URL =~ ^postgresql:// ]]; then
    print_error "Development URL must start with postgresql://"
    exit 1
fi

print_step "2. Creating Environment Files"

# Create .env.local (development)
cat > .env.local << EOF
# Neon Development Environment
# Generated: $(date)

# Database Configuration (Development Branch)
DATABASE_URL="$DEV_DB_URL"

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

# Email Configuration (Development)
EMAIL_FROM="noreply@localhost"
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""

# Environment Settings
NODE_ENV="development"
NEXT_PUBLIC_APP_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3002"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="false"
NEXT_PUBLIC_ENABLE_MONITORING="false"
EOF

# Create .env.staging
cat > .env.staging << EOF
# Neon Staging Environment
# Generated: $(date)

# Database Configuration (Staging Branch)
DATABASE_URL="$STAGING_DB_URL"

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

# Email Configuration (Staging)
EMAIL_FROM="noreply@your-staging-domain.com"
EMAIL_SERVER_HOST="smtp.your-provider.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-staging-email@domain.com"
EMAIL_SERVER_PASSWORD="your-staging-email-password"

# Environment Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="staging"
NEXT_PUBLIC_APP_URL="https://your-staging-domain.vercel.app"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_MONITORING="true"
EOF

# Create .env.production
cat > .env.production << EOF
# Neon Production Environment
# Generated: $(date)

# Database Configuration (Production Branch with Pooling)
DATABASE_URL="$PROD_DB_URL"

# NextAuth Configuration
NEXTAUTH_URL="https://your-production-domain.com"
NEXTAUTH_SECRET="your-production-nextauth-secret"

# Stack Authentication (Production)
NEXT_PUBLIC_STACK_PROJECT_ID="your-production-stack-project-id"
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY="your-production-stack-publishable-key"
STACK_SECRET_SERVER_KEY="your-production-stack-secret-key"

# Google Maps API (Production)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="YOUR_PRODUCTION_GOOGLE_MAPS_API_KEY_HERE"

# Apify API (Production)
APIFY_API_TOKEN="YOUR_PRODUCTION_APIFY_API_TOKEN_HERE"

# OAuth Providers (Production)
GOOGLE_CLIENT_ID="YOUR_PRODUCTION_GOOGLE_CLIENT_ID_HERE"
GOOGLE_CLIENT_SECRET="YOUR_PRODUCTION_GOOGLE_CLIENT_SECRET_HERE"

# Email Configuration (Production)
EMAIL_FROM="noreply@your-production-domain.com"
EMAIL_SERVER_HOST="smtp.your-provider.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-production-email@domain.com"
EMAIL_SERVER_PASSWORD="your-production-email-password"

# Environment Settings
NODE_ENV="production"
NEXT_PUBLIC_APP_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_MONITORING="true"
EOF

print_status "✅ Created .env.local (development)"
print_status "✅ Created .env.staging"
print_status "✅ Created .env.production"

print_step "3. Testing Database Connection"

# Test development database connection
if npx prisma db pull --schema=prisma/schema.prisma > /dev/null 2>&1; then
    print_status "✅ Development database connection successful"
else
    print_warning "⚠️  Development database connection failed - please check your DATABASE_URL"
fi

print_step "4. Generating Prisma Client"
npx prisma generate
print_status "✅ Prisma client generated"

print_step "5. Next Steps"
echo ""
print_status "🎉 Neon setup completed successfully!"
echo ""
print_warning "📋 TODO: Update placeholder values in environment files:"
echo "   - Replace 'your-*' placeholders with actual values"
echo "   - Configure Stack Auth credentials"
echo "   - Set up Google Maps API keys"
echo "   - Configure OAuth providers"
echo ""
print_warning "🔐 GitHub Secrets Required:"
echo "   - NEON_API_KEY (in GitHub repository secrets)"
echo "   - NEON_PROJECT_ID (in GitHub repository variables)"
echo ""
print_status "🚀 Ready to deploy:"
echo "   - Development: npm run dev"
echo "   - Staging: Deploy to Vercel with .env.staging"
echo "   - Production: Deploy to Vercel with .env.production"