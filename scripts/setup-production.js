#!/usr/bin/env node

/**
 * 🚀 Production Environment Setup Script
 * 
 * This script helps set up the production environment by:
 * 1. Validating production credentials
 * 2. Testing database connection
 * 3. Setting up database schema
 * 4. Verifying all services
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load production environment
dotenv.config({ path: '.env.production' });

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

async function validateEnvironment() {
  console.log('🔍 Validating production environment variables...\n');
  
  const missing = [];
  const placeholder = [];
  
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar];
    
    if (!value) {
      missing.push(envVar);
    } else if (value.includes('YOUR_') || value.includes('PLACEHOLDER')) {
      placeholder.push(envVar);
    } else {
      console.log(`✅ ${envVar}: Set`);
    }
  }
  
  if (missing.length > 0) {
    console.log('\n❌ Missing environment variables:');
    missing.forEach(env => console.log(`   - ${env}`));
    return false;
  }
  
  if (placeholder.length > 0) {
    console.log('\n⚠️  Placeholder values detected:');
    placeholder.forEach(env => console.log(`   - ${env}`));
    return false;
  }
  
  console.log('\n✅ All environment variables are properly set!');
  return true;
}

async function testDatabaseConnection() {
  console.log('\n🔗 Testing database connection...\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Test basic connection
    const { data, error } = await supabase
      .from('schools')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    return true;
    
  } catch (error) {
    console.log('❌ Database connection error:', error.message);
    return false;
  }
}

async function checkDatabaseSchema() {
  console.log('\n📋 Checking database schema...\n');
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    // Check for required tables
    const requiredTables = ['schools', 'users', 'favorites', 'user_profiles'];
    const tableChecks = [];
    
    for (const table of requiredTables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error && error.code === '42P01') {
          console.log(`❌ Table '${table}' does not exist`);
          tableChecks.push(false);
        } else {
          console.log(`✅ Table '${table}' exists`);
          tableChecks.push(true);
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err.message);
        tableChecks.push(false);
      }
    }
    
    const allTablesExist = tableChecks.every(check => check);
    
    if (!allTablesExist) {
      console.log('\n⚠️  Some tables are missing. Run database setup:');
      console.log('   npx prisma db push');
      console.log('   npx prisma generate');
    }
    
    return allTablesExist;
    
  } catch (error) {
    console.log('❌ Schema check error:', error.message);
    return false;
  }
}

async function verifyProductionReadiness() {
  console.log('\n🎯 Verifying production readiness...\n');
  
  const checks = [
    {
      name: 'Environment Variables',
      test: validateEnvironment
    },
    {
      name: 'Database Connection',
      test: testDatabaseConnection
    },
    {
      name: 'Database Schema',
      test: checkDatabaseSchema
    }
  ];
  
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await check.test();
      results.push({ name: check.name, passed: result });
    } catch (error) {
      console.log(`❌ ${check.name} check failed:`, error.message);
      results.push({ name: check.name, passed: false });
    }
  }
  
  console.log('\n📊 Production Readiness Report:');
  console.log('================================');
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${result.name}`);
  });
  
  const allPassed = results.every(result => result.passed);
  
  if (allPassed) {
    console.log('\n🎉 Production environment is ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. Deploy to Vercel with production environment variables');
    console.log('2. Configure custom domain');
    console.log('3. Set up monitoring and alerts');
    console.log('4. Run final end-to-end tests');
  } else {
    console.log('\n⚠️  Production environment needs attention before deployment.');
    console.log('\nPlease fix the failing checks and run this script again.');
  }
  
  return allPassed;
}

async function main() {
  console.log('🚀 Production Environment Setup & Validation');
  console.log('===========================================\n');
  
  // Check if .env.production exists
  if (!fs.existsSync('.env.production')) {
    console.log('❌ .env.production file not found!');
    console.log('\nPlease create .env.production with your production credentials.');
    console.log('Use .env.example as a template.');
    process.exit(1);
  }
  
  try {
    await verifyProductionReadiness();
  } catch (error) {
    console.log('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validateEnvironment, testDatabaseConnection, checkDatabaseSchema };