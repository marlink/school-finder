import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking staging database schema...\n');
  
  try {
    // Check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError);
      return;
    }
    
    console.log('📋 Existing tables:');
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check if schools table exists
    const schoolsTable = tables.find(t => t.table_name === 'schools');
    if (!schoolsTable) {
      console.log('\n❌ Schools table does not exist');
      console.log('🔧 Need to create schools table with proper schema');
    } else {
      console.log('\n✅ Schools table exists');
      
      // Check schools table structure
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'schools')
        .eq('table_schema', 'public');
      
      if (!columnsError && columns) {
        console.log('\n📊 Schools table columns:');
        columns.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();