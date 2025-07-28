const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  console.log('Setting up Supabase database tables...');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables:');
    console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.error('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
    process.exit(1);
  }
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Schema file loaded successfully');
    
    // Split the schema into individual statements
    const statements = schemaContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error);
            // Continue with other statements
          } else {
            console.log(`Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Exception executing statement ${i + 1}:`, err);
          // Continue with other statements
        }
      }
    }
    
    console.log('Database setup completed!');
    
    // Now create the admin user profile
    await createAdminProfile();
    
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

async function createAdminProfile() {
  console.log('\nCreating admin user profile...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // Use anon key for auth operations
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
    
    console.log('Admin user signed in successfully');
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return;
    }
    
    if (existingProfile) {
      console.log('Profile already exists, updating...');
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'admin',
          name: 'Darth MC',
          subscription_status: 'premium'
        })
        .eq('id', authData.user.id);
      
      if (updateError) {
        console.error('Error updating profile:', updateError);
      } else {
        console.log('Admin profile updated successfully!');
      }
    } else {
      console.log('Creating new profile...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          name: 'Darth MC',
          role: 'admin',
          subscription_status: 'premium'
        });
      
      if (insertError) {
        console.error('Error creating profile:', insertError);
      } else {
        console.log('Admin profile created successfully!');
      }
    }
    
  } catch (error) {
    console.error('Error in createAdminProfile:', error);
  }
}

// Run the setup
setupDatabase().catch(console.error);