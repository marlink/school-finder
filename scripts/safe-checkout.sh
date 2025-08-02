#!/bin/bash

# Safe Git Checkout Script with Directory Verification
# This script ensures you're in the correct directory before switching branches

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Expected working directory
EXPECTED_DIR="/Users/ciepolml/Projects/school-finder/mc-fullpower-01/school-finder"

# Function to print colored output
print_status() {
    echo -e "${BLUE}🔍${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}💡${NC} $1"
}

# Check if branch name is provided
if [ $# -eq 0 ]; then
    print_error "Please provide a branch name"
    print_info "Usage: $0 <branch-name>"
    echo "📋 Available branches:"
    git branch -a | sed 's/^/  /'
    exit 1
fi

TARGET_BRANCH="$1"

print_status "Pre-checkout verification..."

# Check current directory
CURRENT_DIR=$(pwd)
echo "📍 Current directory: $CURRENT_DIR"
echo "📍 Expected directory: $EXPECTED_DIR"

if [ "$CURRENT_DIR" != "$EXPECTED_DIR" ]; then
    print_error "You are not in the correct working directory!"
    print_info "Please navigate to: $EXPECTED_DIR"
    print_info "Current directory: $CURRENT_DIR"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "🌿 Current branch: $CURRENT_BRANCH"

# Check if target branch exists
if ! git show-ref --verify --quiet refs/heads/"$TARGET_BRANCH"; then
    if git show-ref --verify --quiet refs/remotes/origin/"$TARGET_BRANCH"; then
        print_warning "Branch '$TARGET_BRANCH' exists remotely but not locally. Creating local branch..."
        git checkout -b "$TARGET_BRANCH" origin/"$TARGET_BRANCH"
    else
        print_error "Branch '$TARGET_BRANCH' does not exist locally or remotely"
        echo "📋 Available branches:"
        git branch -a | sed 's/^/  /'
        exit 1
    fi
else
    print_success "Branch '$TARGET_BRANCH' exists locally"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_warning "You have uncommitted changes!"
    echo "📋 Uncommitted changes:"
    git status --porcelain
    echo ""
    read -p "Do you want to stash these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before switching to $TARGET_BRANCH"
        print_success "Changes stashed successfully"
    else
        print_error "Cannot switch branches with uncommitted changes"
        exit 1
    fi
fi

# Switch to the target branch
print_status "Switching to branch: $TARGET_BRANCH"
if git checkout "$TARGET_BRANCH"; then
    print_success "Successfully switched to branch: $TARGET_BRANCH"
else
    print_error "Failed to switch to branch: $TARGET_BRANCH"
    exit 1
fi

# Show current status
echo ""
echo "📊 Current status:"
echo "📍 Directory: $(pwd)"
echo "🌿 Branch: $(git branch --show-current)"
echo "📋 Git status:"
git status --short

# Provide branch-specific suggestions
echo ""
case "$TARGET_BRANCH" in
    "staging")
        print_info "You're now on staging! Suggested next steps:"
        echo "   1. npm run env:staging"
        echo "   2. npm run dev"
        echo "   3. Make your changes and test"
        ;;
    "production-ready")
        print_info "You're now on production-ready! Suggested next steps:"
        echo "   1. npm run env:production"
        echo "   2. npm test"
        echo "   3. npm run build (before deployment)"
        ;;
    "main")
        print_info "You're now on main! This is the stable branch."
        echo "   1. Avoid making direct changes here"
        echo "   2. Use staging → production-ready → main workflow"
        ;;
    *)
        print_info "You're now on $TARGET_BRANCH!"
        echo "   1. Check the branch purpose and follow appropriate workflow"
        ;;
esac