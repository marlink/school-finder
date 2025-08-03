#!/usr/bin/env node

/**
 * 🔍 Production Environment Verification Script
 * This script verifies that all required environment variables are configured
 * Run with: node scripts/verify-production-env.js
 */

const requiredEnvVars = [
  // Stack Auth
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY',
  
  // Database
  'DATABASE_URL',
  
  // Google Maps
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  
  // MCP Integration
  'MCP_API_KEY',
  'FIRECRAWL_API_KEY',
  'HYPERBROWSER_API_KEY',
  
  // Apify
  'APIFY_API_TOKEN',
  
  // Admin
  'ADMIN_EMAIL',
  
  // Environment
  'NODE_ENV',
  'NEXT_PUBLIC_ENV'
];

const optionalEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_GA_ID'
];

console.log('🔍 Verifying Production Environment Configuration...\n');

let missingRequired = [];
let missingOptional = [];
let configuredRequired = [];
let configuredOptional = [];

// Check required variables
requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    configuredRequired.push(varName);
  } else {
    missingRequired.push(varName);
  }
});

// Check optional variables
optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    configuredOptional.push(varName);
  } else {
    missingOptional.push(varName);
  }
});

// Report results
console.log('✅ CONFIGURED REQUIRED VARIABLES:');
configuredRequired.forEach(varName => {
  console.log(`   ✓ ${varName}`);
});

if (configuredOptional.length > 0) {
  console.log('\n✅ CONFIGURED OPTIONAL VARIABLES:');
  configuredOptional.forEach(varName => {
    console.log(`   ✓ ${varName}`);
  });
}

if (missingRequired.length > 0) {
  console.log('\n❌ MISSING REQUIRED VARIABLES:');
  missingRequired.forEach(varName => {
    console.log(`   ✗ ${varName}`);
  });
}

if (missingOptional.length > 0) {
  console.log('\n⚠️  MISSING OPTIONAL VARIABLES:');
  missingOptional.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

// Summary
console.log('\n📊 SUMMARY:');
console.log(`   Required: ${configuredRequired.length}/${requiredEnvVars.length} configured`);
console.log(`   Optional: ${configuredOptional.length}/${optionalEnvVars.length} configured`);

if (missingRequired.length === 0) {
  console.log('\n🎉 All required environment variables are configured!');
  console.log('   Your production environment is ready to go.');
  process.exit(0);
} else {
  console.log('\n🚨 Missing required environment variables!');
  console.log('   Please configure the missing variables before deploying.');
  process.exit(1);
}