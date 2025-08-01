#!/bin/bash

# Automated Security Check Script
# Run this script regularly to ensure ongoing security

set -e

echo "🔒 Starting Automated Security Check..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Run comprehensive security tests
print_status "Running comprehensive security tests..."
if node scripts/security-tests.js; then
    print_success "Security tests passed"
else
    print_error "Security tests failed"
    exit 1
fi

# 2. Check for npm vulnerabilities
print_status "Checking for npm vulnerabilities..."
if npm audit --audit-level=moderate; then
    print_success "No critical vulnerabilities found"
else
    print_warning "Vulnerabilities detected - review npm audit output"
fi

# 3. Check for outdated dependencies
print_status "Checking for outdated dependencies..."
npm outdated || print_warning "Some dependencies are outdated"

# 4. Validate TypeScript compilation
print_status "Validating TypeScript compilation..."
if npm run build > /dev/null 2>&1; then
    print_success "TypeScript compilation successful"
else
    print_error "TypeScript compilation failed"
    exit 1
fi

# 5. Run linting checks
print_status "Running linting checks..."
if npm run lint > /dev/null 2>&1; then
    print_success "Linting passed"
else
    print_warning "Linting issues detected"
fi

# 6. Check environment variables
print_status "Checking environment configuration..."
if [ -f ".env.local" ] || [ -f ".env" ]; then
    print_success "Environment file found"
else
    print_warning "No environment file found"
fi

# 7. Check for sensitive data in git
print_status "Checking for sensitive data patterns..."
if git log --oneline -n 10 | grep -i -E "(password|secret|key|token)" > /dev/null; then
    print_warning "Potential sensitive data found in recent commits"
else
    print_success "No obvious sensitive data in recent commits"
fi

# 8. Generate security report
print_status "Generating security report..."
REPORT_FILE="security-report-$(date +%Y%m%d-%H%M%S).txt"
{
    echo "Security Report - $(date)"
    echo "================================"
    echo ""
    echo "Security Tests:"
    node scripts/security-tests.js 2>&1 | tail -10
    echo ""
    echo "NPM Audit:"
    npm audit --audit-level=moderate 2>&1 | head -20
    echo ""
    echo "Outdated Dependencies:"
    npm outdated 2>&1 | head -10
} > "logs/$REPORT_FILE" 2>/dev/null || {
    mkdir -p logs
    {
        echo "Security Report - $(date)"
        echo "================================"
        echo ""
        echo "Security Tests:"
        node scripts/security-tests.js 2>&1 | tail -10
        echo ""
        echo "NPM Audit:"
        npm audit --audit-level=moderate 2>&1 | head -20
        echo ""
        echo "Outdated Dependencies:"
        npm outdated 2>&1 | head -10
    } > "logs/$REPORT_FILE"
}

print_success "Security report saved to logs/$REPORT_FILE"

# 9. Summary
echo ""
echo "================================================"
print_success "Automated Security Check Complete!"
echo ""
echo "📊 Summary:"
echo "  - Security tests: ✅ Passed"
echo "  - Vulnerability scan: ✅ Completed"
echo "  - TypeScript build: ✅ Successful"
echo "  - Report generated: logs/$REPORT_FILE"
echo ""
echo "🔄 Next steps:"
echo "  - Review any warnings above"
echo "  - Update dependencies if needed"
echo "  - Schedule next security check"
echo ""
echo "⏰ Recommended frequency: Daily for development, Weekly for production"
echo "================================================"