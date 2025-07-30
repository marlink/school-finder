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

async function checkDatabaseStatus() {
  console.log('🔍 Checking database status...\n');
  
  try {
    // Test basic connection
    console.log('📡 Testing connection...');
    const { data, error } = await supabase.from('schools').select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST204') {
        console.log('❌ Schools table does not exist');
        console.log('📝 You need to create the database schema manually in Supabase dashboard');
        console.log('\n🔗 Go to your Supabase project dashboard:');
        console.log(`   https://supabase.com/dashboard/project/xhcltxeknhsvxzvvcjlp`);
        console.log('\n📋 Steps to create the schema:');
        console.log('   1. Go to SQL Editor');
        console.log('   2. Copy the contents of supabase/schema.sql');
        console.log('   3. Paste and run the SQL');
        console.log('   4. Come back and run this script again');
        return false;
      } else {
        console.error('❌ Database error:', error);
        return false;
      }
    } else {
      console.log('✅ Schools table exists');
      console.log(`📊 Current school count: ${data?.[0]?.count || 0}`);
      
      // Check other tables
      const tables = ['profiles', 'school_images', 'favorites', 'user_searches'];
      for (const table of tables) {
        try {
          const { data: tableData, error: tableError } = await supabase
            .from(table)
            .select('count', { count: 'exact', head: true });
          
          if (tableError) {
            console.log(`❌ ${table} table: ${tableError.message}`);
          } else {
            console.log(`✅ ${table} table: ${tableData?.[0]?.count || 0} records`);
          }
        } catch (err) {
          console.log(`❌ ${table} table: Error checking`);
        }
      }
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error);
    return false;
  }
}

checkDatabaseStatus();