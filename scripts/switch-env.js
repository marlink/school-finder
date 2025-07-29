const fs = require('fs');
const path = require('path');

const envFiles = {
  local: '.env.local',
  testing: '.env.testing',
  staging: '.env.staging', 
  production: '.env.production'
};

const targetEnv = process.argv[2];

if (!targetEnv || !envFiles[targetEnv]) {
  console.log('❌ Usage: node scripts/switch-env.js [local|testing|staging|production]');
  console.log('');
  console.log('Available environments:');
  console.log('  local      - Local development with staging database');
  console.log('  testing    - Isolated testing with mocked services');
  console.log('  staging    - Staging environment for testing');
  console.log('  production - Production environment (live users)');
  process.exit(1);
}

const sourceFile = envFiles[targetEnv];
const targetFile = '.env.local';

if (!fs.existsSync(sourceFile)) {
  console.error(`❌ Environment file ${sourceFile} not found!`);
  console.log('');
  console.log('Please create the environment file first:');
  console.log(`   touch ${sourceFile}`);
  console.log('   # Add your environment variables to the file');
  process.exit(1);
}

// Backup current .env.local if it exists
if (fs.existsSync(targetFile)) {
  const backupFile = `.env.local.backup.${Date.now()}`;
  fs.copyFileSync(targetFile, backupFile);
  console.log(`📦 Backed up current .env.local to ${backupFile}`);
}

// Copy the target environment file
fs.copyFileSync(sourceFile, targetFile);

console.log('');
console.log(`✅ Successfully switched to ${targetEnv.toUpperCase()} environment`);
console.log(`📁 Copied ${sourceFile} → ${targetFile}`);
console.log('');

// Show current environment info
try {
  const envContent = fs.readFileSync(targetFile, 'utf8');
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL="([^"]+)"/)?.[1];
  const nextAuthUrl = envContent.match(/NEXTAUTH_URL="([^"]+)"/)?.[1];
  
  if (supabaseUrl) {
    console.log(`🗄️  Database: ${supabaseUrl}`);
  }
  if (nextAuthUrl) {
    console.log(`🌐 App URL: ${nextAuthUrl}`);
  }
  
  console.log('');
  console.log('🚀 Ready to run:');
  console.log('   npm run dev');
  
} catch (error) {
  console.log('⚠️  Could not read environment details');
}

console.log('');