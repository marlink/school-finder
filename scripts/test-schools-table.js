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

async function createSchoolsTableDirect() {
  console.log('🔧 Creating schools table using direct approach...\n');
  
  try {
    // Try to create a simple schools table first
    const { data, error } = await supabase
      .from('schools')
      .insert([
        {
          name: 'Test School',
          address: 'Test Address',
          city: 'Test City',
          phone: '123-456-789',
          email: 'test@school.com'
        }
      ])
      .select();
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Schools table does not exist');
        console.log('🔧 Creating table manually...');
        
        // Since we can't use exec_sql, let's create a minimal table structure
        // and then use the Supabase dashboard to add columns
        console.log('\n📋 Manual steps needed:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/xhcltxeknhsvxzvvcjlp');
        console.log('2. Navigate to Table Editor');
        console.log('3. Click "Create a new table"');
        console.log('4. Name it "schools"');
        console.log('5. Add these columns:');
        console.log('   - name (text, required)');
        console.log('   - address (text)');
        console.log('   - city (text)');
        console.log('   - postal_code (text)');
        console.log('   - phone (text)');
        console.log('   - email (text)');
        console.log('   - website (text)');
        console.log('   - latitude (numeric)');
        console.log('   - longitude (numeric)');
        console.log('   - student_count (int4)');
        console.log('   - teacher_count (int4)');
        console.log('   - established_year (int4)');
        console.log('   - school_type (text)');
        console.log('   - languages (text[])');
        console.log('   - specializations (text[])');
        console.log('   - facilities (text[])');
        console.log('   - image_url (text)');
        console.log('   - description (text)');
        console.log('\n⏳ After creating the table, run the populate script again.');
        
        return false;
      } else {
        console.error('❌ Error:', error);
        return false;
      }
    } else {
      console.log('✅ Schools table exists and is accessible!');
      
      // Clean up test data
      await supabase
        .from('schools')
        .delete()
        .eq('name', 'Test School');
      
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createSchoolsTableDirect();