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

async function checkStagingData() {
  console.log('🔍 Checking staging database...\n');
  
  try {
    // Test if schools table exists and get data
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name, city, student_count')
      .limit(5);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Schools table does not exist yet');
        console.log('📋 Please follow the instructions in STAGING_SETUP_INSTRUCTIONS.md');
        console.log('🔗 Create the table first, then run this script again');
        return false;
      } else {
        console.error('❌ Error accessing schools table:', error);
        return false;
      }
    }
    
    console.log('✅ Schools table exists!');
    console.log(`📊 Current schools count: ${schools.length}`);
    
    if (schools.length > 0) {
      console.log('\n📋 Sample schools:');
      schools.forEach((school, index) => {
        console.log(`  ${index + 1}. ${school.name} (${school.city}) - ${school.student_count || 'N/A'} students`);
      });
    } else {
      console.log('📝 Table is empty - ready for data population');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

checkStagingData();