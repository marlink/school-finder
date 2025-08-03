#!/bin/bash

# 🔄 Session Start Script
# Automates the essential checks for starting a development session

echo "🚀 Starting School Finder Development Session..."
echo "=================================================="

# 1. Verify working directory
echo "📍 Current Directory:"
pwd
echo ""

# 2. Check Git status and branch
echo "🌿 Git Status:"
git status --porcelain
echo ""
echo "🌿 Current Branch:"
git branch --show-current
echo ""
echo "🌿 Available Branches:"
git branch -a
echo ""

# 3. Check if we're in the right directory
if [[ ! -f "package.json" ]]; then
    echo "❌ ERROR: Not in project root directory!"
    echo "Expected: /Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder"
    exit 1
fi

# 4. Verify package.json name
PROJECT_NAME=$(node -p "require('./package.json').name")
if [[ "$PROJECT_NAME" != "school-finder-production" ]]; then
    echo "❌ ERROR: Wrong project! Found: $PROJECT_NAME"
    exit 1
fi

echo "✅ Project: $PROJECT_NAME"
echo ""

# 5. Check Node and npm versions
echo "🔧 Environment:"
echo "Node: $(node --version)"
echo "npm: $(npm --version)"
echo ""

# 6. Check if .env exists (without exposing secrets)
if [[ -f ".env" ]]; then
    echo "✅ Environment file exists"
    echo "📋 Environment variables (safe preview):"
    grep -E "^(NODE_ENV|NEXT_PUBLIC_|DATABASE_URL=postgresql)" .env | head -3 | sed 's/=.*/=***/'
else
    echo "⚠️  WARNING: No .env file found!"
fi
echo ""

# 7. Check if dependencies are installed
if [[ -d "node_modules" ]]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  WARNING: node_modules not found. Run: npm install"
fi
echo ""

# 8. Quick build test (optional, can be skipped with --skip-build)
if [[ "$1" != "--skip-build" ]]; then
    echo "🔨 Testing build process..."
    if npm run build > /dev/null 2>&1; then
        echo "✅ Build successful"
    else
        echo "❌ Build failed! Check with: npm run build"
    fi
    echo ""
fi

# 9. Check Vercel status (if available)
if command -v vercel &> /dev/null; then
    echo "🚀 Vercel Status:"
    if vercel whoami > /dev/null 2>&1; then
        echo "✅ Vercel authenticated as: $(vercel whoami)"
        echo "📊 Recent deployments:"
        vercel ls | head -5
    else
        echo "⚠️  Vercel not authenticated. Run: vercel login"
    fi
else
    echo "⚠️  Vercel CLI not installed"
fi
echo ""

# 10. Summary
echo "📋 SESSION CHECKLIST COMPLETE"
echo "================================"
echo "✅ Working directory verified"
echo "✅ Git status checked"
echo "✅ Project configuration verified"
echo "✅ Environment checked"

if [[ "$1" != "--skip-build" ]]; then
    echo "✅ Build process tested"
fi

echo ""
echo "🎯 Ready to start development!"
echo "📚 Documentation: docs/HANDOVER_SESSIONS.md"
echo "🚀 Start dev server: npm run dev"
echo ""