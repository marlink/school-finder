#!/usr/bin/env node

/**
 * 🧪 Environment Switcher Test Script
 * Tests all environment switching functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const environments = ['local', 'testing', 'staging', 'production'];
const testResults = [];

console.log('🧪 Testing Environment Switcher...\n');

function runTest(testName, testFn) {
  try {
    const result = testFn();
    console.log(`✅ ${testName}: PASSED`);
    testResults.push({ test: testName, status: 'PASSED', result });
    return true;
  } catch (error) {
    console.log(`❌ ${testName}: FAILED - ${error.message}`);
    testResults.push({ test: testName, status: 'FAILED', error: error.message });
    return false;
  }
}

function testEnvironmentSwitch(env) {
  return runTest(`Switch to ${env} environment`, () => {
    // Run the switch command
    const output = execSync(`node scripts/switch-env.js ${env}`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    
    // Check if .env file exists and has correct content
    const envPath = path.join(__dirname, '..', '.env');
    if (!fs.existsSync(envPath)) {
      throw new Error('.env file not created');
    }
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Check for environment-specific markers
    const expectedMarkers = {
      local: 'NEXT_PUBLIC_ENV="local"',
      testing: 'NEXT_PUBLIC_ENV="testing"',
      staging: 'NEXT_PUBLIC_ENV="staging"',
      production: 'NEXT_PUBLIC_ENV="production"'
    };
    
    if (!envContent.includes(expectedMarkers[env])) {
      throw new Error(`Environment marker not found: ${expectedMarkers[env]}`);
    }
    
    return { output, envContent: envContent.substring(0, 200) + '...' };
  });
}

function testEnvironmentFiles() {
  return runTest('Environment files creation', () => {
    const envFiles = environments.map(env => {
      const fileName = env === 'local' ? '.env.local' : 
                     env === 'testing' ? '.env.testing' :
                     env === 'staging' ? '.env.staging' : '.env.production';
      const filePath = path.join(__dirname, '..', fileName);
      return { env, fileName, exists: fs.existsSync(filePath) };
    });
    
    const missingFiles = envFiles.filter(f => !f.exists);
    if (missingFiles.length > 0) {
      throw new Error(`Missing environment files: ${missingFiles.map(f => f.fileName).join(', ')}`);
    }
    
    return envFiles;
  });
}

function testNpmScripts() {
  return runTest('NPM scripts functionality', () => {
    const scripts = ['env:local', 'env:staging', 'env:production'];
    const results = [];
    
    for (const script of scripts) {
      try {
        const output = execSync(`npm run ${script}`, { 
          encoding: 'utf8',
          cwd: path.join(__dirname, '..')
        });
        results.push({ script, status: 'SUCCESS' });
      } catch (error) {
        results.push({ script, status: 'FAILED', error: error.message });
      }
    }
    
    const failed = results.filter(r => r.status === 'FAILED');
    if (failed.length > 0) {
      throw new Error(`Failed scripts: ${failed.map(f => f.script).join(', ')}`);
    }
    
    return results;
  });
}

function testEnvironmentVariables() {
  return runTest('Environment variables validation', () => {
    // Switch to staging for testing
    execSync('node scripts/switch-env.js staging', { 
      cwd: path.join(__dirname, '..')
    });
    
    const envPath = path.join(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const requiredVars = [
      'DATABASE_URL',
      'NEXT_PUBLIC_STACK_PROJECT_ID',
      'NODE_ENV',
      'NEXT_PUBLIC_ENV'
    ];
    
    const missingVars = requiredVars.filter(varName => 
      !envContent.includes(`${varName}=`)
    );
    
    if (missingVars.length > 0) {
      throw new Error(`Missing required variables: ${missingVars.join(', ')}`);
    }
    
    return { requiredVars, found: requiredVars.length };
  });
}

// Run all tests
console.log('🔄 Testing environment switching for all environments...\n');

// Test each environment switch
for (const env of environments) {
  testEnvironmentSwitch(env);
}

console.log('\n📁 Testing environment files...\n');
testEnvironmentFiles();

console.log('\n📦 Testing NPM scripts...\n');
testNpmScripts();

console.log('\n🔧 Testing environment variables...\n');
testEnvironmentVariables();

// Summary
console.log('\n📊 TEST SUMMARY:');
console.log('================');

const passed = testResults.filter(r => r.status === 'PASSED').length;
const failed = testResults.filter(r => r.status === 'FAILED').length;

console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / testResults.length) * 100)}%`);

if (failed > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.filter(r => r.status === 'FAILED').forEach(test => {
    console.log(`   - ${test.test}: ${test.error}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! Environment switcher is working correctly.');
  
  // Switch back to staging
  execSync('node scripts/switch-env.js staging', { 
    cwd: path.join(__dirname, '..')
  });
  console.log('🔄 Switched back to staging environment.');
}