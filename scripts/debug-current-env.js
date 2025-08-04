#!/usr/bin/env node

/**
 * 🔍 Debug Current Environment Variables
 * Shows what environment variables are currently loaded
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('🔍 Current Environment Variables:');
console.log('================================\n');

const requiredVars = [
  'DATABASE_URL',
  'NEXT_PUBLIC_STACK_PROJECT_ID',
  'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY',
  'STACK_SECRET_SERVER_KEY',
  'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY',
  'NODE_ENV',
  'NEXT_PUBLIC_ENV'
];

const optionalVars = [
  'APIFY_API_TOKEN',
  'MCP_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

console.log('✅ REQUIRED VARIABLES:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value && !value.includes('your_') && !value.includes('YOUR_') ? '✅' : '❌';
  const displayValue = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'NOT SET';
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('\n⚠️  OPTIONAL VARIABLES:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value && !value.includes('your_') && !value.includes('YOUR_') ? '✅' : '⚠️';
  const displayValue = value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : 'NOT SET';
  console.log(`   ${status} ${varName}: ${displayValue}`);
});

console.log('\n📊 ENVIRONMENT SUMMARY:');
console.log(`   Current Environment: ${process.env.NEXT_PUBLIC_ENV || 'NOT SET'}`);
console.log(`   Node Environment: ${process.env.NODE_ENV || 'NOT SET'}`);
console.log(`   Debug Mode: ${process.env.NEXT_PUBLIC_DEBUG || 'NOT SET'}`);