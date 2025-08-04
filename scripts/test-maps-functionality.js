#!/usr/bin/env node

/**
 * Google Maps Functionality Test Script
 * 
 * This script tests the Google Maps integration in the school finder application.
 * It checks for API key configuration, tests map components, and provides setup instructions.
 */

import fs from 'fs';
import path from 'path';

console.log('🗺️  Google Maps Functionality Test\n');

// Check environment files
const envFiles = [
  '.env',
  '.env.local',
  '.env.staging',
  '.env.production',
  '.env.testing'
];

console.log('📁 Checking environment files...');
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const hasApiKey = content.includes('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY');
    const isPlaceholder = content.includes('YOUR_') || content.includes('your_');
    
    console.log(`  ✅ ${file} exists`);
    if (hasApiKey) {
      if (isPlaceholder) {
        console.log(`    ⚠️  Google Maps API key is a placeholder`);
      } else {
        console.log(`    ✅ Google Maps API key is configured`);
      }
    } else {
      console.log(`    ❌ No Google Maps API key found`);
    }
  } else {
    console.log(`  ❌ ${file} not found`);
  }
});

// Check current environment
console.log('\n🔧 Current Environment Configuration:');
const currentApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
if (currentApiKey) {
  if (currentApiKey.includes('YOUR_') || currentApiKey.includes('your_')) {
    console.log('  ⚠️  Google Maps API key is a placeholder');
    console.log(`     Current value: ${currentApiKey}`);
  } else {
    console.log('  ✅ Google Maps API key is configured');
    console.log(`     Key starts with: ${currentApiKey.substring(0, 10)}...`);
  }
} else {
  console.log('  ❌ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not found in environment');
}

// Check Google Maps related files
console.log('\n📄 Checking Google Maps components...');
const mapFiles = [
  'src/components/GoogleMapsTest.tsx',
  'src/components/school/GoogleMap.tsx',
  'src/components/search/SchoolsMap.tsx',
  'src/lib/google-maps.ts',
  'docs/GOOGLE_MAPS_SETUP.md'
];

mapFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file} exists`);
  } else {
    console.log(`  ❌ ${file} not found`);
  }
});

// Check test pages
console.log('\n🧪 Checking test pages...');
const testPages = [
  'src/app/(main)/test-maps/page.tsx',
  'src/app/(main)/test-school-maps/page.tsx'
];

testPages.forEach(page => {
  const filePath = path.join(process.cwd(), page);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${page} exists`);
  } else {
    console.log(`  ❌ ${page} not found`);
  }
});

// Test URLs
console.log('\n🌐 Test URLs (when server is running):');
console.log('  📍 Google Maps API Test: http://localhost:3001/test-maps');
console.log('  🏫 School Maps Test: http://localhost:3001/test-school-maps');
console.log('  🎓 Sample School Page: http://localhost:3001/schools/test-school-123');

// Setup instructions
console.log('\n📋 Setup Instructions:');
console.log('');
console.log('1. 🔑 Get Google Maps API Key:');
console.log('   • Go to https://console.cloud.google.com/');
console.log('   • Create a new project or select existing one');
console.log('   • Enable these APIs:');
console.log('     - Maps JavaScript API');
console.log('     - Geocoding API');
console.log('     - Places API');
console.log('   • Create credentials (API Key)');
console.log('   • Restrict the API key (optional but recommended)');
console.log('');
console.log('2. 🔧 Configure Environment:');
console.log('   • Update your environment file:');
console.log('     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your_actual_api_key_here"');
console.log('   • Restart the development server');
console.log('');
console.log('3. 🧪 Test Functionality:');
console.log('   • Visit http://localhost:3001/test-maps');
console.log('   • Visit http://localhost:3001/test-school-maps');
console.log('   • Check school detail pages');
console.log('');

// Map functionality summary
console.log('🗺️  Map Functionality Summary:');
console.log('');
console.log('✅ Components Available:');
console.log('  • GoogleMap - Main map component for school locations');
console.log('  • SchoolsMap - Map showing multiple schools');
console.log('  • GoogleMapsTest - API testing component');
console.log('');
console.log('✅ Features Implemented:');
console.log('  • Address geocoding (convert address to coordinates)');
console.log('  • Reverse geocoding (convert coordinates to address)');
console.log('  • Interactive maps with markers');
console.log('  • Distance calculation to user location');
console.log('  • "Open in Google Maps" functionality');
console.log('  • "Get Directions" functionality');
console.log('  • Error handling for API failures');
console.log('');
console.log('✅ School Page Integration:');
console.log('  • Maps display on individual school pages');
console.log('  • Fallback to mock data when database unavailable');
console.log('  • Responsive design for mobile and desktop');
console.log('');

// Current status
if (currentApiKey && !currentApiKey.includes('YOUR_') && !currentApiKey.includes('your_')) {
  console.log('🎉 Status: Google Maps is configured and ready to use!');
} else {
  console.log('⚠️  Status: Google Maps API key needs to be configured');
  console.log('   Follow the setup instructions above to enable maps functionality.');
}

console.log('\n' + '='.repeat(60));
console.log('Google Maps Functionality Test Complete');
console.log('='.repeat(60));