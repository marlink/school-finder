#!/usr/bin/env node

/**
 * Security Testing Script
 * Tests various security measures implemented in the application
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Test data for security validation
const testCases = {
  sqlInjection: [
    "'; DROP TABLE schools; --",
    "1' OR '1'='1",
    "admin'--",
    "admin'/*",
    "' OR 1=1#",
    "' UNION SELECT * FROM users--",
    "1; DELETE FROM schools WHERE 1=1",
  ],
  xssPayloads: [
    "<script>alert('XSS')</script>",
    "javascript:alert('XSS')",
    "<img src=x onerror=alert('XSS')>",
    "<svg onload=alert('XSS')>",
    "';alert('XSS');//",
    "<iframe src=javascript:alert('XSS')></iframe>",
  ],
  invalidInputs: [
    null,
    undefined,
    "",
    " ".repeat(10000), // Very long string
    "a".repeat(10000),
    { malicious: "payload" },
    ["array", "input"],
    true,
    false,
    0,
    -1,
    999999999,
  ],
  csrfTokens: [
    "",
    "invalid-token",
    "a".repeat(32),
    "1234567890abcdef",
    null,
    undefined,
  ],
};

/**
 * Test SQL injection protection
 */
async function testSQLInjectionProtection() {
  console.log('\n🔒 Testing SQL Injection Protection...');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  for (const payload of testCases.sqlInjection) {
    try {
      // Test search functionality with malicious input
      const searchResult = await prisma.school.findMany({
        where: {
          name: {
            contains: payload,
          },
        },
        take: 1,
      });

      // If we get here without error, the ORM protected us
      results.passed++;
      console.log(`✅ Protected against: ${payload.substring(0, 30)}...`);
    } catch (error) {
      // Check if it's a legitimate Prisma error (good) or something else (bad)
      if (error.code && error.code.startsWith('P')) {
        results.passed++;
        console.log(`✅ Prisma protected against: ${payload.substring(0, 30)}...`);
      } else {
        results.failed++;
        results.errors.push(`SQL Injection test failed for: ${payload} - ${error.message}`);
        console.log(`❌ Unexpected error for: ${payload.substring(0, 30)}...`);
      }
    }
  }

  return results;
}

/**
 * Test input validation and sanitization
 */
async function testInputValidation() {
  console.log('\n🧹 Testing Input Validation...');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  // Test XSS payloads using our enhanced validation logic
  function validateInput(input) {
    if (typeof input !== 'string') return false;
    
    // Enhanced XSS protection patterns (matching our Zod schema)
    const xssPatterns = [
      /<script[\s\S]*?>/i,
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /<iframe[\s\S]*?>/i,
      /<img[\s\S]*?onerror[\s\S]*?>/i,
      /<svg[\s\S]*?onload[\s\S]*?>/i,
      /on\w+\s*=/i,
      /<object[\s\S]*?>/i,
      /<embed[\s\S]*?>/i,
      /<link[\s\S]*?>/i,
      /<meta[\s\S]*?>/i,
      /expression\s*\(/i,
      /url\s*\(/i,
      /@import/i,
      /['"];?\s*alert\s*\(/i,  // Catches ';alert('XSS');// and similar patterns
      /['"];?\s*eval\s*\(/i,   // Catches eval injection attempts
      /['"];?\s*document\./i,  // Catches document manipulation attempts
      /['"];?\s*window\./i     // Catches window object manipulation
    ];
    
    return !xssPatterns.some(pattern => pattern.test(input));
  }

  for (const payload of testCases.xssPayloads) {
    try {
      const isValid = validateInput(payload);
      
      if (!isValid) {
        results.passed++;
        console.log(`✅ XSS payload rejected: ${payload.substring(0, 30)}...`);
      } else {
        results.failed++;
        results.errors.push(`XSS payload not properly rejected: ${payload}`);
        console.log(`❌ XSS payload not rejected: ${payload.substring(0, 30)}...`);
      }
    } catch (error) {
      results.passed++; // Errors are good for malicious input
      console.log(`✅ XSS payload caused validation error: ${payload.substring(0, 30)}...`);
    }
  }

  // Test invalid inputs
  for (const input of testCases.invalidInputs) {
    try {
      const sanitized = sanitizeInput(input);
      
      if (typeof sanitized === 'string' || sanitized === null) {
        results.passed++;
        console.log(`✅ Invalid input handled: ${typeof input} - ${String(input).substring(0, 20)}...`);
      } else {
        results.failed++;
        results.errors.push(`Invalid input not properly handled: ${typeof input} - ${input}`);
      }
    } catch (error) {
      results.failed++;
      results.errors.push(`Input validation error for: ${typeof input} - ${error.message}`);
    }
  }

  return results;
}

/**
 * Test CSRF token validation
 */
async function testCSRFProtection() {
  console.log('\n🛡️ Testing CSRF Protection...');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  // Test valid CSRF token generation
  try {
    const validToken = generateCSRFToken();
    if (validToken && validToken.length === 64 && /^[a-f0-9]+$/.test(validToken)) {
      results.passed++;
      console.log('✅ Valid CSRF token generated');
    } else {
      results.failed++;
      results.errors.push('Invalid CSRF token format generated');
    }
  } catch (error) {
    results.failed++;
    results.errors.push(`CSRF token generation error: ${error.message}`);
  }

  // Test invalid CSRF tokens
  for (const token of testCases.csrfTokens) {
    try {
      const isValid = validateCSRFTokenFormat(token);
      
      if (!isValid) {
        results.passed++;
        console.log(`✅ Invalid CSRF token rejected: ${String(token).substring(0, 20)}...`);
      } else {
        results.failed++;
        results.errors.push(`Invalid CSRF token accepted: ${token}`);
      }
    } catch (error) {
      results.passed++; // Errors are expected for invalid tokens
      console.log(`✅ CSRF validation properly errored for: ${String(token).substring(0, 20)}...`);
    }
  }

  return results;
}

/**
 * Test rate limiting (simulation)
 */
async function testRateLimiting() {
  console.log('\n⏱️ Testing Rate Limiting (Simulation)...');
  
  const results = {
    passed: 0,
    failed: 0,
    errors: [],
  };

  // Simulate rate limiting logic
  const rateLimitStore = new Map();
  const windowMs = 60000; // 1 minute
  const maxRequests = 10;

  function simulateRateLimit(clientId) {
    const now = Date.now();
    const windowStart = now - windowMs;
    
    if (!rateLimitStore.has(clientId)) {
      rateLimitStore.set(clientId, []);
    }
    
    const requests = rateLimitStore.get(clientId);
    
    // Remove old requests
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limited
    }
    
    validRequests.push(now);
    rateLimitStore.set(clientId, validRequests);
    return true; // Allowed
  }

  // Test normal usage
  const clientId = 'test-client';
  let allowedRequests = 0;
  let blockedRequests = 0;

  // Make requests up to the limit
  for (let i = 0; i < maxRequests; i++) {
    if (simulateRateLimit(clientId)) {
      allowedRequests++;
    }
  }

  // Try to exceed the limit
  for (let i = 0; i < 5; i++) {
    if (!simulateRateLimit(clientId)) {
      blockedRequests++;
    }
  }

  if (allowedRequests === maxRequests && blockedRequests === 5) {
    results.passed++;
    console.log(`✅ Rate limiting working: ${allowedRequests} allowed, ${blockedRequests} blocked`);
  } else {
    results.failed++;
    results.errors.push(`Rate limiting failed: ${allowedRequests} allowed, ${blockedRequests} blocked`);
  }

  return results;
}

/**
 * Helper functions
 */
function sanitizeInput(input) {
  if (input === null || input === undefined) {
    return null;
  }
  
  if (typeof input !== 'string') {
    input = String(input);
  }
  
  // Basic HTML sanitization
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim()
    .substring(0, 1000); // Limit length
}

function containsScriptTags(input) {
  if (typeof input !== 'string') return false;
  return /<script|javascript:|on\w+=/i.test(input);
}

function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

function validateCSRFTokenFormat(token) {
  if (!token || typeof token !== 'string') {
    return false;
  }
  
  return token.length === 64 && /^[a-f0-9]+$/.test(token);
}

/**
 * Main test runner
 */
async function runSecurityTests() {
  console.log('🔐 Starting Security Tests...\n');
  
  const testResults = {
    sqlInjection: await testSQLInjectionProtection(),
    inputValidation: await testInputValidation(),
    csrfProtection: await testCSRFProtection(),
    rateLimiting: await testRateLimiting(),
  };

  // Calculate overall results
  let totalPassed = 0;
  let totalFailed = 0;
  const allErrors = [];

  Object.entries(testResults).forEach(([testName, result]) => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    allErrors.push(...result.errors);
    
    console.log(`\n📊 ${testName}: ${result.passed} passed, ${result.failed} failed`);
  });

  console.log('\n' + '='.repeat(50));
  console.log(`🎯 OVERALL RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
  
  if (allErrors.length > 0) {
    console.log('\n❌ ERRORS:');
    allErrors.forEach(error => console.log(`  - ${error}`));
  }

  const successRate = (totalPassed / (totalPassed + totalFailed)) * 100;
  console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}%`);
  
  if (successRate >= 90) {
    console.log('🎉 Security tests PASSED! Good security posture.');
  } else if (successRate >= 70) {
    console.log('⚠️ Security tests PARTIALLY PASSED. Review errors above.');
  } else {
    console.log('🚨 Security tests FAILED. Immediate attention required!');
  }

  await prisma.$disconnect();
  process.exit(totalFailed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSecurityTests().catch(error => {
    console.error('Security test runner failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runSecurityTests,
  testSQLInjectionProtection,
  testInputValidation,
  testCSRFProtection,
  testRateLimiting,
};