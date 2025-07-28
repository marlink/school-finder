import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkCurrentData() {
  console.log('🔍 Checking current database state...\n');

  try {
    // Check schools table
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, address, contact')
      .limit(10);

    if (schoolsError) {
      console.error('❌ Error fetching schools:', schoolsError);
      return;
    }

    console.log(`📚 Found ${schools?.length || 0} schools in database:`);
    if (schools && schools.length > 0) {
      schools.forEach((school, i) => {
        console.log(`${i + 1}. ${school.name}`);
        if (school.address) {
          console.log(`   📍 ${school.address.city || 'Unknown city'}`);
        }
        if (school.contact) {
          console.log(`   📞 ${school.contact.phone || 'No phone'}`);
        }
        console.log('');
      });
    } else {
      console.log('   No schools found in database');
    }

    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5);

    if (!usersError && users) {
      console.log(`👥 Found ${users.length} users in database`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkCurrentData();