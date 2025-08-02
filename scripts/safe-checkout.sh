#!/bin/bash

# Safe Git Checkout Script with Directory Verification
# Usage: ./scripts/safe-checkout.sh <branch-name>

# Check if branch name is provided
if [ $# -eq 0 ]; then
    echo "❌ Error: Please provide a branch name"
    echo "💡 Usage: ./scripts/safe-checkout.sh <branch-name>"
    echo "📋 Available branches:"
    git branch -a
    exit 1
fi

BRANCH_NAME="$1"

echo "🔍 Pre-checkout verification..."

# Get current working directory
CURRENT_DIR=$(pwd)
EXPECTED_DIR="/Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder"

echo "📍 Current directory: $CURRENT_DIR"
echo "📍 Expected directory: $EXPECTED_DIR"

# Check if we're in the correct directory
if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    echo "❌ ERROR: You're not in the correct directory!"
    echo "   Current: $CURRENT_DIR"
    echo "   Expected: $EXPECTED_DIR"
    echo ""
    echo "💡 Please run: cd $EXPECTED_DIR"
    echo "   Then try the checkout again."
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $CURRENT_BRANCH"

# Check if working tree is clean
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  WARNING: You have uncommitted changes!"
    echo "📋 Uncommitted files:"
    git status --porcelain
    echo ""
    echo "💡 Options:"
    echo "   1. Commit your changes: git add . && git commit -m 'Your message'"
    echo "   2. Stash your changes: git stash"
    echo "   3. Force checkout (will lose changes): add --force flag"
    echo ""
    echo "❓ Do you want to stash your changes and continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "📦 Stashing changes..."
        git stash push -m "Auto-stash before checkout to $BRANCH_NAME"
    else
        echo "❌ Checkout cancelled. Please handle your changes first."
        exit 1
    fi
fi

# Check if branch exists
if git show-ref --verify --quiet refs/heads/"$BRANCH_NAME"; then
    echo "✅ Branch '$BRANCH_NAME' exists locally"
elif git show-ref --verify --quiet refs/remotes/origin/"$BRANCH_NAME"; then
    echo "🌐 Branch '$BRANCH_NAME' exists on remote, creating local tracking branch"
else
    echo "❓ Branch '$BRANCH_NAME' doesn't exist. Create it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ Checkout cancelled."
        exit 1
    fi
fi

echo "🔄 Switching to branch: $BRANCH_NAME"

# Perform the checkout
if git checkout "$BRANCH_NAME"; then
    echo "✅ Successfully switched to branch: $BRANCH_NAME"
    
    # Show current status
    echo ""
    echo "📊 Current status:"
    echo "📍 Directory: $(pwd)"
    echo "🌿 Branch: $(git branch --show-current)"
    echo "📋 Git status:"
    git status --short
    
    # Suggest next steps based on branch
    case "$BRANCH_NAME" in
        "staging")
            echo ""
            echo "💡 You're now on staging! Suggested next steps:"
            echo "   1. npm run env:staging"
            echo "   2. npm run dev"
            ;;
        "production-ready")
            echo ""
            echo "💡 You're now on production-ready! Suggested next steps:"
            echo "   1. npm run env:production"
            echo "   2. npm test"
            echo "   3. npm run build (before deployment)"
            ;;
        "main")
            echo ""
            echo "⚠️  You're on main branch - typically for stable releases only"
            ;;
    esac
else
    echo "❌ Failed to switch to branch: $BRANCH_NAME"
    exit 1
fi