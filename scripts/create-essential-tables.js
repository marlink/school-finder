const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function createEssentialTables() {
  console.log('Creating essential Supabase tables...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }
  
  // Create Supabase client with service role key for admin operations
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // First, let's try to create the profiles table using a simple SQL query
    console.log('Creating profiles table...');
    
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
        email TEXT,
        name TEXT,
        role TEXT DEFAULT 'user',
        subscription_status TEXT DEFAULT 'free',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    // Use the REST API to execute SQL
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({
        sql: createProfilesTable
      })
    });
    
    if (!response.ok) {
      console.log('Direct SQL execution not available, trying alternative approach...');
      
      // Alternative: Try to insert a test record to see if table exists
      const { error: testError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      if (testError && testError.code === '42P01') {
        console.error('Profiles table does not exist and cannot be created via client.');
        console.log('\nTo fix this, you need to:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to the SQL Editor');
        console.log('3. Execute the following SQL:');
        console.log('\n' + createProfilesTable);
        console.log('\nOr use Supabase CLI: npx supabase db push');
        return;
      }
    } else {
      console.log('Profiles table created successfully!');
    }
    
    // Now create the admin profile
    await createAdminProfile();
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nManual setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Execute the schema.sql file content');
  }
}

async function createAdminProfile() {
  console.log('\nCreating admin user profile...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const supabase = createClient(supabaseUrl, anonKey);
  
  try {
    // Sign in the admin user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'design.marceli@gmail.com',
      password: 'admin123'
    });
    
    if (authError) {
      console.error('Error signing in admin user:', authError);
      return;
    }
    
    console.log('Admin user authenticated successfully');
    
    // Try to create/update profile
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'Darth MC',
        role: 'admin',
        subscription_status: 'premium'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();
    
    if (upsertError) {
      console.error('Error creating/updating profile:', upsertError);
      
      if (upsertError.code === '42P01') {
        console.log('\nThe profiles table does not exist.');
        console.log('Please create it manually in your Supabase dashboard.');
      }
    } else {
      console.log('Admin profile created/updated successfully!');
      console.log('Profile:', profile);
    }
    
  } catch (error) {
    console.error('Error in createAdminProfile:', error);
  }
}

createEssentialTables().catch(console.error);