#!/bin/bash

# 🚀 Quick Production Setup Script
# This script helps you get started with production environment setup

echo "🚀 School Finder - Production Environment Setup"
echo "=============================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📍 Current directory: $(pwd)"
echo "🌿 Current branch: $(git branch --show-current)"
echo ""

# Check current environment
echo "🔍 Checking current environment..."
if [ -f ".env.local" ]; then
    current_env=$(head -2 .env.local | grep -o "STAGING\|PRODUCTION\|TESTING" | head -1)
    echo "   Current environment: $current_env"
else
    echo "   No .env.local found"
fi
echo ""

# Production setup options
echo "🎯 Production Setup Options:"
echo ""
echo "1. 📋 View Production Setup Guide"
echo "2. 🔧 Create Production Branch"
echo "3. ⚙️  Switch to Production Environment"
echo "4. ✅ Validate Production Setup"
echo "5. 🏗️  Build for Production"
echo "6. 📊 View Deployment Checklist"
echo "7. 🆘 Help & Documentation"
echo ""

read -p "Choose an option (1-7): " choice

case $choice in
    1)
        echo ""
        echo "📋 Opening Production Setup Guide..."
        if command -v code &> /dev/null; then
            code docs/PRODUCTION_SETUP_GUIDE.md
        else
            echo "📖 Please open: docs/PRODUCTION_SETUP_GUIDE.md"
        fi
        ;;
    2)
        echo ""
        echo "🔧 Creating production branch..."
        git checkout -b production 2>/dev/null || git checkout production
        echo "✅ Now on production branch"
        echo "💡 Next: Update .env.production with your production credentials"
        ;;
    3)
        echo ""
        echo "⚙️  Switching to production environment..."
        npm run env:production
        echo "✅ Switched to production environment"
        echo "⚠️  Warning: You are now using production configuration!"
        ;;
    4)
        echo ""
        echo "✅ Validating production setup..."
        npm run validate:production
        ;;
    5)
        echo ""
        echo "🏗️  Building for production..."
        echo "⚠️  This will use production environment settings"
        read -p "Continue? (y/N): " confirm
        if [[ $confirm =~ ^[Yy]$ ]]; then
            npm run build:production
        else
            echo "Build cancelled"
        fi
        ;;
    6)
        echo ""
        echo "📊 Opening Deployment Checklist..."
        if command -v code &> /dev/null; then
            code docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md
        else
            echo "📖 Please open: docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md"
        fi
        ;;
    7)
        echo ""
        echo "🆘 Help & Documentation:"
        echo ""
        echo "📚 Available Documentation:"
        echo "   • docs/PRODUCTION_SETUP_GUIDE.md - Complete setup guide"
        echo "   • docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md - Deployment checklist"
        echo "   • docs/DEPLOYMENT.md - General deployment info"
        echo "   • ENVIRONMENT_CONFIGURATION_SUMMARY.md - Environment overview"
        echo ""
        echo "🔧 Available Commands:"
        echo "   • npm run env:production - Switch to production environment"
        echo "   • npm run validate:production - Validate production setup"
        echo "   • npm run build:production - Build for production"
        echo "   • npm run setup:production - Run production setup script"
        echo ""
        echo "🌐 Next Steps:"
        echo "   1. Create new Supabase production project"
        echo "   2. Update .env.production with real credentials"
        echo "   3. Run validation script"
        echo "   4. Deploy to Vercel"
        echo ""
        ;;
    *)
        echo ""
        echo "❌ Invalid option. Please choose 1-7."
        exit 1
        ;;
esac

echo ""
echo "🎯 Production Setup Resources:"
echo "   📖 Setup Guide: docs/PRODUCTION_SETUP_GUIDE.md"
echo "   ✅ Checklist: docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md"
echo "   🔧 Validation: npm run validate:production"
echo ""
echo "🚀 Ready to launch your School Finder production environment!"