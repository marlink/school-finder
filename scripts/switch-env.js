#!/usr/bin/env node

/**
 * 🔄 Environment Switching Script
 * Switches between different environment configurations
 * Usage: node scripts/switch-env.js [environment]
 * Environments: local, testing, staging, production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configurations
const environments = {
  local: {
    file: '.env.local',
    template: {
      '# Environment Configuration': 'Local Development',
      'DATABASE_URL': 'postgresql://username:password@localhost:5432/school_finder_dev?sslmode=prefer',
      'NEXT_PUBLIC_STACK_PROJECT_ID': 'your_local_stack_project_id',
      'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'your_local_stack_publishable_key',
      'STACK_SECRET_SERVER_KEY': 'your_local_stack_secret_key',
      'NEXTAUTH_SECRET': 'your_local_nextauth_secret',
      'NEXTAUTH_URL': 'http://localhost:3001',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'your_local_google_maps_api_key',
      'APIFY_API_TOKEN': 'your_local_apify_token',
      'NEXT_PUBLIC_SUPABASE_URL': 'your_local_supabase_url',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your_local_supabase_anon_key',
      'SUPABASE_SERVICE_ROLE_KEY': 'your_local_supabase_service_role_key',
      'MCP_API_KEY': 'your_local_mcp_api_key',
      'QDRANT_URL': 'your_local_qdrant_url',
      'QDRANT_API_KEY': 'your_local_qdrant_api_key',
      'ADMIN_EMAIL': 'admin@localhost',
      'VALID_API_KEYS': 'your_local_api_keys',
      'NODE_ENV': 'development',
      'NEXT_PUBLIC_ENV': 'local',
      'NEXT_PUBLIC_DEBUG': 'true',
      'NEXT_PUBLIC_ENABLE_ANALYTICS': 'false',
      'NEXT_PUBLIC_ENABLE_SENTRY': 'false',
      'NEXT_PUBLIC_ENABLE_HOTJAR': 'false'
    }
  },
  testing: {
    file: '.env.testing',
    template: {
      '# Environment Configuration': 'Testing',
      'DATABASE_URL': 'postgresql://username:password@localhost:5432/school_finder_test?sslmode=prefer',
      'NEXT_PUBLIC_STACK_PROJECT_ID': 'your_test_stack_project_id',
      'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'your_test_stack_publishable_key',
      'STACK_SECRET_SERVER_KEY': 'your_test_stack_secret_key',
      'NEXTAUTH_SECRET': 'your_test_nextauth_secret',
      'NEXTAUTH_URL': 'http://localhost:3001',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'your_test_google_maps_api_key',
      'APIFY_API_TOKEN': 'your_test_apify_token',
      'NEXT_PUBLIC_SUPABASE_URL': 'your_test_supabase_url',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your_test_supabase_anon_key',
      'SUPABASE_SERVICE_ROLE_KEY': 'your_test_supabase_service_role_key',
      'MCP_API_KEY': 'your_test_mcp_api_key',
      'QDRANT_URL': 'your_test_qdrant_url',
      'QDRANT_API_KEY': 'your_test_qdrant_api_key',
      'ADMIN_EMAIL': 'admin@test.com',
      'VALID_API_KEYS': 'your_test_api_keys',
      'NODE_ENV': 'test',
      'NEXT_PUBLIC_ENV': 'testing',
      'NEXT_PUBLIC_DEBUG': 'true',
      'NEXT_PUBLIC_ENABLE_ANALYTICS': 'false',
      'NEXT_PUBLIC_ENABLE_SENTRY': 'false',
      'NEXT_PUBLIC_ENABLE_HOTJAR': 'false'
    }
  },
  staging: {
    file: '.env.staging',
    template: {
      '# Environment Configuration': 'Staging',
      'DATABASE_URL': 'postgresql://neondb_owner:npg_hVazDA37cRgY@ep-lingering-dew-a2chza93-pooler.eu-central-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require',
      'NEXT_PUBLIC_STACK_PROJECT_ID': '4c4f5c4a-56c8-4c5d-bd65-3f58656c1186',
      'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'ypck_kxb127wyv9cnks4rrh5ymg6785nz38fqvxyc3wk3xbcvg',
      'STACK_SECRET_SERVER_KEY': 'ssk_wt6krt2g49jnx5wnw5dwpjwrdpk6dckb5gbav2jw63jv0',
      'NEXTAUTH_SECRET': 'your_staging_nextauth_secret',
      'NEXTAUTH_URL': 'http://localhost:3001',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'YOUR_STAGING_GOOGLE_MAPS_API_KEY_HERE',
      'APIFY_API_TOKEN': 'your_staging_apify_token',
      'NEXT_PUBLIC_SUPABASE_URL': 'your_staging_supabase_url',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your_staging_supabase_anon_key',
      'SUPABASE_SERVICE_ROLE_KEY': 'your_staging_supabase_service_role_key',
      'MCP_API_KEY': 'your_staging_mcp_api_key',
      'QDRANT_URL': 'your_staging_qdrant_url',
      'QDRANT_API_KEY': 'your_staging_qdrant_api_key',
      'ADMIN_EMAIL': 'your_admin_email_here',
      'VALID_API_KEYS': 'your_api_keys_here',
      'NODE_ENV': 'development',
      'NEXT_PUBLIC_ENV': 'staging',
      'NEXT_PUBLIC_DEBUG': 'true',
      'NEXT_PUBLIC_ENABLE_ANALYTICS': 'false',
      'NEXT_PUBLIC_ENABLE_SENTRY': 'false',
      'NEXT_PUBLIC_ENABLE_HOTJAR': 'false'
    }
  },
  production: {
    file: '.env.production',
    template: {
      '# Environment Configuration': 'Production',
      'DATABASE_URL': 'your_production_database_url',
      'NEXT_PUBLIC_STACK_PROJECT_ID': 'your_production_stack_project_id',
      'NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY': 'your_production_stack_publishable_key',
      'STACK_SECRET_SERVER_KEY': 'your_production_stack_secret_key',
      'NEXTAUTH_SECRET': 'your_production_nextauth_secret',
      'NEXTAUTH_URL': 'https://your-production-domain.com',
      'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY': 'your_production_google_maps_api_key',
      'APIFY_API_TOKEN': 'your_production_apify_token',
      'NEXT_PUBLIC_SUPABASE_URL': 'your_production_supabase_url',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your_production_supabase_anon_key',
      'SUPABASE_SERVICE_ROLE_KEY': 'your_production_supabase_service_role_key',
      'MCP_API_KEY': 'your_production_mcp_api_key',
      'QDRANT_URL': 'your_production_qdrant_url',
      'QDRANT_API_KEY': 'your_production_qdrant_api_key',
      'ADMIN_EMAIL': 'admin@yourdomain.com',
      'VALID_API_KEYS': 'your_production_api_keys',
      'NODE_ENV': 'production',
      'NEXT_PUBLIC_ENV': 'production',
      'NEXT_PUBLIC_DEBUG': 'false',
      'NEXT_PUBLIC_ENABLE_ANALYTICS': 'true',
      'NEXT_PUBLIC_ENABLE_SENTRY': 'true',
      'NEXT_PUBLIC_ENABLE_HOTJAR': 'true'
    }
  }
};

function createEnvFile(environment, config) {
  const envPath = path.join(process.cwd(), '.env');
  const sourcePath = path.join(process.cwd(), config.file);
  
  let content = `# ${config.template['# Environment Configuration']} Environment Configuration\n\n`;
  
  // Add all environment variables
  Object.entries(config.template).forEach(([key, value]) => {
    if (key !== '# Environment Configuration') {
      content += `${key}="${value}"\n`;
    }
  });
  
  // Create the environment-specific file if it doesn't exist
  if (!fs.existsSync(sourcePath)) {
    fs.writeFileSync(sourcePath, content);
    console.log(`✅ Created ${config.file}`);
  }
  
  // Copy to .env
  fs.writeFileSync(envPath, content);
  console.log(`✅ Switched to ${environment} environment`);
  console.log(`📁 Active configuration: .env (copied from ${config.file})`);
}

function main() {
  const environment = process.argv[2];
  
  if (!environment) {
    console.error('❌ Error: Environment not specified');
    console.log('Usage: node scripts/switch-env.js [environment]');
    console.log('Available environments: local, testing, staging, production');
    process.exit(1);
  }
  
  if (!environments[environment]) {
    console.error(`❌ Error: Unknown environment "${environment}"`);
    console.log('Available environments: local, testing, staging, production');
    process.exit(1);
  }
  
  console.log(`🔄 Switching to ${environment} environment...`);
  
  try {
    createEnvFile(environment, environments[environment]);
    
    console.log('\n📋 Environment Summary:');
    console.log(`   Environment: ${environment}`);
    console.log(`   NODE_ENV: ${environments[environment].template.NODE_ENV}`);
    console.log(`   NEXT_PUBLIC_ENV: ${environments[environment].template.NEXT_PUBLIC_ENV}`);
    console.log(`   Debug Mode: ${environments[environment].template.NEXT_PUBLIC_DEBUG}`);
    
    console.log('\n🚀 Next steps:');
    console.log('   1. Update placeholder values in .env with real credentials');
    console.log('   2. Run: npm run dev');
    console.log('   3. Test the application');
    
  } catch (error) {
    console.error('❌ Error switching environment:', error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { environments, createEnvFile };