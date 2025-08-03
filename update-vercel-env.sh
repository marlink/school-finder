#!/bin/bash

# Update Vercel Environment Variables with Correct Stack Auth Credentials

echo "🔧 Updating Vercel Environment Variables..."

# Remove existing variables (if they exist)
echo "Removing existing Stack Auth variables..."
vercel env rm NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production --yes 2>/dev/null || true
vercel env rm STACK_SECRET_SERVER_KEY production --yes 2>/dev/null || true

# Add correct variables
echo "Adding correct Stack Auth variables..."
echo "pck_yr1qxqxhx3dh3qfaj3tw5qaatc3ft4b3epte4c1hgknkg" | vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production
echo "ssk_rvh6zzt5anhqwfawxscf1fw4x8hgr32nmtrt3mv605jv8" | vercel env add STACK_SECRET_SERVER_KEY production

echo "✅ Environment variables updated!"
echo "🚀 Deploying with new variables..."

# Deploy with new environment variables
vercel --prod

echo "🎉 Deployment complete!"