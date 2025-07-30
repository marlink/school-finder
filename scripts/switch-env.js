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

console.log(`✅ Successfully switched to ${targetEnv.toUpperCase()} environment`);
console.log(`📁 Environment file: ${sourceFile} → ${targetFile}`);

// Clear Next.js cache and TypeScript cache
console.log('\n🧹 Clearing caches...');
try {
  // Clear Next.js cache
  const { execSync } = require('child_process');
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next', { stdio: 'inherit' });
    console.log('   ✅ Next.js cache cleared');
  }
  
  // Clear TypeScript cache
  if (fs.existsSync('tsconfig.tsbuildinfo')) {
    fs.unlinkSync('tsconfig.tsbuildinfo');
    console.log('   ✅ TypeScript build cache cleared');
  }
  
  // Clear node_modules/.cache if it exists
  if (fs.existsSync('node_modules/.cache')) {
    execSync('rm -rf node_modules/.cache', { stdio: 'inherit' });
    console.log('   ✅ Node modules cache cleared');
  }
  
} catch (error) {
  console.log('   ⚠️  Cache clearing had some issues (this is usually fine)');
}

console.log('\n💡 Recommended next steps:');
console.log('   1. Restart your IDE/editor for TypeScript to pick up changes');
console.log('   2. Run: npm run dev');
console.log('   3. If you see TypeScript errors, restart the TypeScript server in your IDE');

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