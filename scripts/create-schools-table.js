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

async function createSchoolsTable() {
  console.log('🔧 Creating schools table with proper schema...\n');
  
  try {
    // Create schools table with all necessary columns for real data
    const { error } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.schools (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT,
          city VARCHAR(100),
          postal_code VARCHAR(20),
          phone VARCHAR(50),
          email VARCHAR(255),
          website VARCHAR(255),
          latitude DECIMAL(10, 8),
          longitude DECIMAL(11, 8),
          student_count INTEGER,
          teacher_count INTEGER,
          established_year INTEGER,
          school_type VARCHAR(100),
          languages TEXT[],
          specializations TEXT[],
          facilities TEXT[],
          image_url VARCHAR(500),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_schools_city ON public.schools(city);
        CREATE INDEX IF NOT EXISTS idx_schools_school_type ON public.schools(school_type);
        CREATE INDEX IF NOT EXISTS idx_schools_location ON public.schools(latitude, longitude);
      `
    });
    
    if (error) {
      console.error('❌ Error creating schools table:', error);
      
      // Fallback: try direct table creation
      console.log('🔄 Trying direct table creation...');
      
      const { error: directError } = await supabase
        .from('schools')
        .select('id')
        .limit(1);
      
      if (directError && directError.code === '42P01') {
        // Table doesn't exist, create it using SQL
        console.log('📝 Creating table using direct SQL...');
        
        // Use the SQL editor approach
        const createTableSQL = `
          CREATE TABLE public.schools (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address TEXT,
            city VARCHAR(100),
            postal_code VARCHAR(20),
            phone VARCHAR(50),
            email VARCHAR(255),
            website VARCHAR(255),
            latitude DECIMAL(10, 8),
            longitude DECIMAL(11, 8),
            student_count INTEGER,
            teacher_count INTEGER,
            established_year INTEGER,
            school_type VARCHAR(100),
            languages TEXT[],
            specializations TEXT[],
            facilities TEXT[],
            image_url VARCHAR(500),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        console.log('⚠️ Please run this SQL in your Supabase SQL editor:');
        console.log('🔗 Go to your Supabase dashboard SQL Editor to verify the table creation');
        console.log('\n📋 SQL to execute:');
        console.log('=' .repeat(50));
        console.log(createTableSQL);
        console.log('=' .repeat(50));
        
        return false;
      }
    } else {
      console.log('✅ Schools table created successfully!');
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

createSchoolsTable();