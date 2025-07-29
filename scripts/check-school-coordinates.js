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

async function checkSchoolCoordinates() {
  console.log('🗺️ Checking school coordinates for Google Maps integration...\n');
  
  try {
    // Get all schools with coordinate data
    const { data: schools, error } = await supabase
      .from('schools')
      .select('id, name, city, latitude, longitude, address, postal_code')
      .limit(10);
    
    if (error) {
      console.error('❌ Error accessing schools table:', error);
      return false;
    }
    
    console.log(`✅ Found ${schools.length} schools in database`);
    
    if (schools.length > 0) {
      console.log('\n📍 School locations for Google Maps:');
      schools.forEach((school, index) => {
        const hasCoords = school.latitude && school.longitude;
        const coordsDisplay = hasCoords 
          ? `${school.latitude}, ${school.longitude}` 
          : 'No coordinates';
        
        console.log(`  ${index + 1}. ${school.name}`);
        console.log(`     📍 ${school.city} - ${coordsDisplay}`);
        console.log(`     🏠 ${school.address || 'No address'}`);
        console.log(`     📮 ${school.postal_code || 'No postal code'}`);
        console.log('');
      });
      
      // Count schools with coordinates
      const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude);
      console.log(`📊 Summary:`);
      console.log(`   • Total schools: ${schools.length}`);
      console.log(`   • With coordinates: ${schoolsWithCoords.length}`);
      console.log(`   • Missing coordinates: ${schools.length - schoolsWithCoords.length}`);
      
      if (schoolsWithCoords.length > 0) {
        console.log('\n✅ Ready for Google Maps integration!');
        console.log('🗺️ Schools with coordinates can be displayed on map');
      } else {
        console.log('\n⚠️ No schools have coordinates yet');
        console.log('📝 Need to populate coordinate data for map display');
      }
    } else {
      console.log('📝 No schools found in database');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

checkSchoolCoordinates();