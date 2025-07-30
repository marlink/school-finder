#!/bin/bash

# 🚀 Pre-Setup: Prepare for Fresh Supabase Project
# This script helps prepare for the new Supabase setup

echo "🚀 Preparing for Fresh Supabase Setup"
echo "====================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
print_info "Current Status Check:"
echo "📍 Current directory: $(pwd)"
echo "🌿 Current git branch: $(git branch --show-current 2>/dev/null || echo 'Not in git repo')"

# Check current environment
if [ -f ".env.local" ]; then
    echo "📄 Current .env.local exists"
    echo "🔍 Current Supabase URL: $(grep NEXT_PUBLIC_SUPABASE_URL .env.local | head -1 || echo 'Not found')"
else
    echo "📄 No .env.local file found"
fi

echo ""
print_warning "🛑 IMPORTANT: We're replacing the old Supabase project"
echo "Old project: xhcltxeknhsvxzvvcjlp.supabase.co"
echo "This project will no longer be used after the new setup."

echo ""
print_info "📋 What you need to prepare:"
echo "1. 🆕 Create a new Supabase project at https://supabase.com/dashboard"
echo "2. 📝 Note down the new project credentials"
echo "3. 🔑 Prepare API keys for staging/production environments"

echo ""
print_info "🔧 Prerequisites check:"

# Check Supabase CLI
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase --version 2>/dev/null | head -1)
    print_success "Supabase CLI installed: $SUPABASE_VERSION"
    
    # Check if it's the latest version
    if [[ "$SUPABASE_VERSION" < "2.30.0" ]]; then
        print_warning "Consider updating Supabase CLI: npm install -g supabase@latest"
    fi
else
    print_warning "Supabase CLI not found. Install with: npm install -g supabase"
fi

# Check GitHub CLI
if command -v gh &> /dev/null; then
    print_success "GitHub CLI installed: $(gh --version | head -1)"
    
    # Check auth status
    if gh auth status &> /dev/null; then
        print_success "GitHub CLI authenticated"
    else
        print_warning "GitHub CLI not authenticated. Run: gh auth login"
    fi
else
    print_warning "GitHub CLI not found. Install from: https://cli.github.com/"
fi

# Check Node.js
if command -v node &> /dev/null; then
    print_success "Node.js installed: $(node --version)"
else
    print_warning "Node.js not found"
fi

# Check npm
if command -v npm &> /dev/null; then
    print_success "npm installed: $(npm --version)"
else
    print_warning "npm not found"
fi

echo ""
print_info "📁 Backup current environment files:"

# Create backup directory
BACKUP_DIR="backups/env-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup existing env files
for env_file in .env.local .env.staging .env.production .env.testing; do
    if [ -f "$env_file" ]; then
        cp "$env_file" "$BACKUP_DIR/"
        print_success "Backed up $env_file to $BACKUP_DIR/"
    fi
done

echo ""
print_info "🎯 Next Steps:"
echo "1. Run: ./scripts/setup-supabase-branching.sh"
echo "2. Follow the interactive prompts"
echo "3. Create your new Supabase project when prompted"
echo "4. Update environment files with new credentials"

echo ""
print_success "✅ Preparation complete!"
echo "🚀 Ready to run the main setup script."