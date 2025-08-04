#!/usr/bin/env node

/**
 * Production Environment Verification Script
 * Checks if all required production environment variables are configured
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Verifying Production Setup...\n');

// Read .env.production file
const envProductionPath = path.join(__dirname, '..', '.env.production');

if (!fs.existsSync(envProductionPath)) {
  console.error('❌ .env.production file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envProductionPath, 'utf8');

// Required production variables
const requiredVars = {
  'DATABASE_URL': 'Neon PostgreSQL Database',
  'NEXT_PUBLIC_STACK_PROJECT_ID': 'Stack Auth Project ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'Stack Auth Publishable Key',
  'STACK_SECRET_SERVER_KEY': 'Stack Auth Secret Key',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'Google Maps API Key',
  'APIFY_API_TOKEN': 'Apify API Token',
  'NEXTAUTH_URL': 'Production Domain URL'
};

// Check each required variable
let allConfigured = true;
let needsSetup = [];

console.log('📋 Checking Required Environment Variables:\n');

Object.entries(requiredVars).forEach(([varName, description]) => {
  const regex = new RegExp(`${varName}="([^"]*)"`, 'g');
  const match = regex.exec(envContent);
  
  if (match) {
    const value = match[1];
    const isPlaceholder = value.includes('YOUR_') || 
                         value.includes('_HERE') || 
                         value.includes('PLACEHOLDER') ||
                         value === '';
    
    if (isPlaceholder) {
      console.log(`⚠️  ${varName}: ${description} - NEEDS SETUP`);
      needsSetup.push({ varName, description });
      allConfigured = false;
    } else {
      console.log(`✅ ${varName}: ${description} - CONFIGURED`);
    }
  } else {
    console.log(`❌ ${varName}: ${description} - MISSING`);
    needsSetup.push({ varName, description });
    allConfigured = false;
  }
});

console.log('\n' + '='.repeat(60) + '\n');

if (allConfigured) {
  console.log('🎉 SUCCESS: All production environment variables are configured!');
  console.log('✅ Your application is ready for production deployment.');
  console.log('\n🚀 Next steps:');
  console.log('   1. Deploy to Vercel: npm run deploy');
  console.log('   2. Test production functionality');
  console.log('   3. Monitor application performance');
} else {
  console.log('⚠️  SETUP REQUIRED: Some environment variables need configuration.');
  console.log('\n📝 Variables that need setup:');
  
  needsSetup.forEach(({ varName, description }) => {
    console.log(`   • ${varName}: ${description}`);
  });
  
  console.log('\n📖 Setup Instructions:');
  console.log('   1. Read: PRODUCTION_SETUP_GUIDE.md');
  console.log('   2. Follow: PRODUCTION_CHECKLIST.md');
  console.log('   3. Run this script again to verify');
}

console.log('\n' + '='.repeat(60));

// Exit with appropriate code
process.exit(allConfigured ? 0 : 1);