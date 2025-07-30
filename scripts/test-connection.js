import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Environment Check:');
console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);
console.log('Key length:', supabaseKey?.length);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n🔍 Testing Supabase connection...\n');
  
  try {
    // Try to get the current user (should work with service role)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('Auth test:', userError ? 'Failed' : 'Success');
    
    // Try to access a simple query that should work
    const { data, error } = await supabase
      .rpc('version'); // This should return PostgreSQL version
    
    if (error) {
      console.log('❌ RPC Error:', error);
      
      // Try a different approach - check if we can access any table
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);
      
      if (tablesError) {
        console.log('❌ Tables Error:', tablesError);
        
        // Last resort - try to create a simple table
        console.log('\n🔧 Attempting to create a test table...');
        const { data: createData, error: createError } = await supabase
          .from('test_table')
          .select('*')
          .limit(1);
        
        console.log('Create test result:', createError ? createError.message : 'Success');
        
      } else {
        console.log('✅ Available tables:', tablesData?.map(t => t.table_name));
      }
      
    } else {
      console.log('✅ Database version:', data);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testConnection();