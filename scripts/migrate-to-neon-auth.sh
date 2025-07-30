#!/bin/bash

# ==============================================================================
# Neon Auth Migration Script
# ==============================================================================

echo "🚀 Starting Neon Auth Migration..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: Install Stack Auth
echo "📦 Installing Stack Auth..."
npm install @stackframe/stack

# Step 2: Run Stack Auth setup wizard
echo "🧙‍♂️ Running Stack Auth setup wizard..."
echo "This will set up auth routes, layout wrappers, and handlers automatically"
npx @stackframe/init-stack@latest

# Step 3: Check for environment file
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from Neon template..."
    cp .env.neon.template .env.local
    echo "⚠️  Please update .env.local with your actual Neon Auth credentials"
else
    echo "⚠️  .env.local already exists. Please manually add Neon Auth variables:"
    echo "   NEXT_PUBLIC_STACK_PROJECT_ID=your_neon_auth_project_id"
    echo "   NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_neon_auth_publishable_key"
    echo "   STACK_SECRET_SERVER_KEY=your_neon_auth_secret_key"
    echo "   DATABASE_URL=your_neon_connection_string"
fi

# Step 4: Update Prisma schema for Neon
echo "🗄️  Updating database configuration..."
npx prisma generate

# Step 5: Test connection
echo "🔌 Testing database connection..."
if command -v node &> /dev/null; then
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    prisma.\$connect()
        .then(() => {
            console.log('✅ Database connection successful');
            return prisma.\$disconnect();
        })
        .catch((error) => {
            console.log('❌ Database connection failed:', error.message);
            process.exit(1);
        });
    "
fi

echo ""
echo "🎉 Neon Auth migration setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Get your Stack Auth credentials from Neon Console > Auth > Configuration"
echo "2. Update .env.local with your actual credentials"
echo "3. Run: npm run dev"
echo "4. Test auth at: http://localhost:3000/handler/sign-up"
echo ""
echo "🔗 Useful links:"
echo "- Neon Console: https://console.neon.tech"
echo "- Test signup: http://localhost:3000/handler/sign-up"
echo "- Check users: SELECT * FROM neon_auth.users_sync;"