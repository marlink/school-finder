#!/bin/bash

# 🚀 Vercel Environment Variables Setup Script
# This script configures all required environment variables for Vercel deployment

echo "🔧 Setting up Vercel environment variables..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Ensuring Vercel authentication..."
vercel whoami || vercel login

# Set environment variables for production
echo "📝 Setting production environment variables..."

vercel env add NEXT_PUBLIC_STACK_PROJECT_ID production <<< "4c4f5c4a-56c8-4c5d-bd65-3f58656c1186"
vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY production <<< "pck_yr1qxqxhx3dh3qfaj3tw5qaatc3ft4b3epte4c1hgknkg"
vercel env add STACK_SECRET_SERVER_KEY production <<< "ssk_rvh6zzt5anhqwfawxscf1fw4x8hgr32nmtrt3mv605jv8"

vercel env add DATABASE_URL production <<< "postgresql://neondb_owner:npg_hVazDA37cRgY@ep-lingering-dew-a2chza93-pooler.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"

vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "https://zsmerzvhrosbhjkoobgl.supabase.co"
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbWVyenZocm9zYmhqa29vYmdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODY2MTEsImV4cCI6MjA2ODA2MjYxMX0.U0fzbDG9ETRIiaCTBVYTN_HSKaURROCzj3XoSLuUGcA"
vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzbWVyenZocm9zYmhqa29vYmdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ4NjYxMSwiZXhwIjoyMDY4MDYyNjExfQ.jXgHit7yzSNDrBtj7fFv8puE0A1rTj-FjMyB8bHGZzw"

vercel env add NEXTAUTH_URL production <<< "https://vercel-schools-6hr9oul1p-mcs-projects-f4243afd.vercel.app"
vercel env add NODE_ENV production <<< "production"
vercel env add NEXT_PUBLIC_ENV production <<< "production"

# Optional environment variables (with placeholders)
vercel env add NEXTAUTH_SECRET production <<< "your-production-nextauth-secret-here"
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production <<< "your-google-maps-api-key-here"
vercel env add APIFY_API_TOKEN production <<< "your-apify-api-token-here"

echo "✅ Environment variables configured!"
echo "🚀 Deploying to production..."

# Deploy to production
vercel --prod

echo "🎉 Deployment complete!"
echo "📱 Your app should be live at: https://vercel-schools-6hr9oul1p-mcs-projects-f4243afd.vercel.app"
echo ""
echo "🔧 Next steps:"
echo "1. Test your live application"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring (optional)"
echo "4. Add Google Maps API key for full functionality"