#!/bin/bash

# 🚀 Fresh Supabase Project Setup with Branching
# This script sets up a brand new Supabase project with the recommended branching workflow
# Replaces the old project: xhcltxeknhsvxzvvcjlp.supabase.co

set -e

echo "🚀 Setting up Fresh Supabase Project with Branching"
echo "=================================================="
echo "📝 This will replace the old project: xhcltxeknhsvxzvvcjlp.supabase.co"
echo "🎯 Creating a new project with proper production/staging workflow"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Current directory: $(pwd)"

# Step 1: Update Supabase CLI
print_status "Step 1: Updating Supabase CLI..."
echo "Current version: $(supabase --version)"
print_warning "Please update Supabase CLI manually:"
echo "npm install -g supabase@latest"
echo ""
read -p "Press Enter after updating Supabase CLI..."

# Step 2: GitHub CLI Authentication
print_status "Step 2: GitHub CLI Authentication..."
if ! gh auth status >/dev/null 2>&1; then
    print_warning "GitHub CLI not authenticated. Please authenticate:"
    echo "gh auth login"
    echo ""
    read -p "Press Enter after authenticating with GitHub CLI..."
else
    print_success "GitHub CLI already authenticated"
fi

# Step 3: Supabase Authentication
print_status "Step 3: Supabase Authentication..."
echo "Please authenticate with Supabase CLI:"
echo "supabase login"
echo ""
read -p "Press Enter after authenticating with Supabase CLI..."

# Step 4: Create new Supabase project
print_status "Step 4: Creating new Supabase project..."
echo "We'll create a fresh Supabase project with proper branching setup."
echo ""
print_warning "Please go to https://supabase.com/dashboard and:"
echo "1. Click 'New Project'"
echo "2. Choose your organization"
echo "3. Project name: 'school-finder-production'"
echo "4. Database password: [Generate a strong password]"
echo "5. Region: Europe (recommended for your location)"
echo "6. Pricing plan: Choose appropriate plan"
echo ""
echo "After creating the project, you'll get:"
echo "- Project URL: https://[PROJECT_ID].supabase.co"
echo "- API Keys: anon key and service_role key"
echo ""
read -p "Press Enter after creating the new Supabase project..."

echo "Please provide the new Supabase project details:"
read -p "Enter your NEW project ID (from the URL): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    print_error "Project ID cannot be empty"
    exit 1
fi

print_status "Linking to new project: $PROJECT_ID"
supabase link --project-ref "$PROJECT_ID"

# Step 5: Create staging branch
print_status "Step 5: Creating staging branch in Supabase..."
print_warning "This will create a persistent staging branch in your Supabase project"
echo "Creating staging branch..."

# Create the staging branch
supabase branches create --persistent staging

print_success "Staging branch created successfully!"

# Step 6: Set up GitHub integration
print_status "Step 6: Setting up GitHub integration..."
echo "To complete the setup, you need to:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Settings > Integrations"
echo "3. Connect your GitHub repository"
echo "4. Set up branch protection rules"
echo ""
read -p "Press Enter when you've completed the GitHub integration..."

# Step 7: Update environment files
print_status "Step 7: Updating environment configuration..."

# Get branch information
print_status "Getting branch information..."
supabase branches list

echo ""
print_status "Please note the staging branch URL and API keys from the output above"
echo "We'll need to update your .env files with the staging branch credentials"

# Step 8: Create updated environment files
print_status "Step 8: Creating updated environment templates..."

# Create staging environment template
cat > .env.staging.template << 'EOF'
# Staging Environment Configuration
# This connects to the Supabase staging branch

# Environment
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging

# Supabase Staging Branch Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[STAGING_BRANCH_ID].[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[STAGING_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[STAGING_SERVICE_ROLE_KEY]

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[STAGING_BRANCH_ID].[PROJECT_ID].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[GENERATE_RANDOM_SECRET]

# OAuth Providers (use test/staging credentials)
GOOGLE_CLIENT_ID=[STAGING_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[STAGING_GOOGLE_CLIENT_SECRET]
GITHUB_CLIENT_ID=[STAGING_GITHUB_CLIENT_ID]
GITHUB_CLIENT_SECRET=[STAGING_GITHUB_CLIENT_SECRET]

# API Keys (use test/staging keys)
GOOGLE_MAPS_API_KEY=[STAGING_GOOGLE_MAPS_KEY]
APIFY_API_TOKEN=[STAGING_APIFY_TOKEN]
FIRECRAWL_API_KEY=[STAGING_FIRECRAWL_KEY]

# Email Configuration (staging)
RESEND_API_KEY=[STAGING_RESEND_KEY]
FROM_EMAIL=staging@yourdomain.com

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=[STAGING_ADMIN_PASSWORD]

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_SUBSCRIPTIONS=false
ENABLE_EMAIL_VERIFICATION=false
EOF

# Create production environment template
cat > .env.production.template << 'EOF'
# Production Environment Configuration
# This connects to the main Supabase project (production branch)

# Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# Supabase Production Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[PRODUCTION_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[PRODUCTION_SERVICE_ROLE_KEY]

# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:5432/postgres

# NextAuth Configuration
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=[GENERATE_STRONG_SECRET]

# OAuth Providers (production credentials)
GOOGLE_CLIENT_ID=[PRODUCTION_GOOGLE_CLIENT_ID]
GOOGLE_CLIENT_SECRET=[PRODUCTION_GOOGLE_CLIENT_SECRET]
GITHUB_CLIENT_ID=[PRODUCTION_GITHUB_CLIENT_ID]
GITHUB_CLIENT_SECRET=[PRODUCTION_GITHUB_CLIENT_SECRET]

# API Keys (production keys)
GOOGLE_MAPS_API_KEY=[PRODUCTION_GOOGLE_MAPS_KEY]
APIFY_API_TOKEN=[PRODUCTION_APIFY_TOKEN]
FIRECRAWL_API_KEY=[PRODUCTION_FIRECRAWL_KEY]

# Email Configuration (production)
RESEND_API_KEY=[PRODUCTION_RESEND_KEY]
FROM_EMAIL=noreply@yourdomain.com

# Admin Configuration
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=[SECURE_ADMIN_PASSWORD]

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_SUBSCRIPTIONS=true
ENABLE_EMAIL_VERIFICATION=true
EOF

print_success "Environment templates created!"

# Step 9: Update package.json scripts
print_status "Step 9: Updating package.json scripts..."

# Create a backup of package.json
cp package.json package.json.backup

# Update package.json with new scripts (this would need to be done manually or with a more complex script)
print_warning "Please manually update your package.json scripts section with:"
echo '"scripts": {'
echo '  "dev": "next dev",'
echo '  "build": "prisma generate && next build",'
echo '  "start": "next start",'
echo '  "lint": "next lint",'
echo '  "env:staging": "cp .env.staging .env.local && echo \"Switched to staging environment\"",'
echo '  "env:production": "cp .env.production .env.local && echo \"Switched to production environment\"",'
echo '  "db:staging": "supabase branches switch staging",'
echo '  "db:production": "supabase branches switch main",'
echo '  "db:migrate": "supabase db diff -f migration_$(date +%Y%m%d_%H%M%S)",'
echo '  "db:push": "supabase db push",'
echo '  "db:reset": "supabase db reset",'
echo '  "setup:staging": "npm run env:staging && npm run db:staging",'
echo '  "setup:production": "npm run env:production && npm run db:production"'
echo '}'

echo ""
print_status "Step 10: Next Steps..."
echo "1. Update your .env.staging file with actual staging branch credentials"
echo "2. Update your .env.production file with actual production credentials"
echo "3. Test the staging environment: npm run setup:staging"
echo "4. Set up your GitHub repository integration in Supabase dashboard"
echo "5. Configure branch protection rules"

print_success "Supabase branching setup completed!"
print_warning "Remember to:"
echo "- Never commit .env.local, .env.staging, or .env.production files"
echo "- Use the templates to create your actual environment files"
echo "- Test thoroughly in staging before deploying to production"

echo ""
echo "🎉 Setup complete! Your new workflow:"
echo "   Production (Main) Branch ← Your existing database with 12-14 tables"
echo "   └── Staging Branch ← New branch for testing"
echo "       └── Feature Branches ← For development"