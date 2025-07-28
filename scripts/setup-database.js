const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up database schema...')
    
    // Read the schema file
    const schemaSQL = fs.readFileSync('./supabase/schema.sql', 'utf8')
    
    // Split the schema into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.includes('CREATE TABLE') || statement.includes('CREATE POLICY') || 
          statement.includes('CREATE FUNCTION') || statement.includes('CREATE TRIGGER') ||
          statement.includes('CREATE INDEX') || statement.includes('ALTER TABLE') ||
          statement.includes('CREATE SCHEMA')) {
        
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`)
        
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.log(`⚠️  Statement ${i + 1} failed (might already exist):`, error.message)
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      }
    }
    
    console.log('\n🎉 Database setup complete!')
    
    // Now verify the user and create admin profile
    await verifyAndCreateAdminUser()
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message)
  }
}

async function verifyAndCreateAdminUser() {
  try {
    const userEmail = 'design.marceli@gmail.com'
    
    console.log('\n🔍 Verifying admin user...')
    
    // Sign in to verify the user exists
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: 'superAdmin',
    })
    
    if (signInError) {
      console.error('❌ Error signing in:', signInError.message)
      return
    }
    
    console.log('✅ User authenticated successfully')
    console.log('🆔 User ID:', signInData.user.id)
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', signInData.user.id)
      .single()
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError.message)
      return
    }
    
    if (!profileData) {
      console.log('📝 Creating admin profile...')
      
      // Create profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: signInData.user.id,
          email: userEmail,
          name: 'Darth MC',
          role: 'admin',
          subscription_status: 'premium'
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Error creating profile:', createError.message)
        return
      }
      
      console.log('✅ Admin profile created successfully:', newProfile)
    } else {
      console.log('✅ Profile found:', profileData)
      
      // Update to admin role if not already
      if (profileData.role !== 'admin') {
        console.log('🔄 Updating role to admin...')
        
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            name: 'Darth MC',
            subscription_status: 'premium'
          })
          .eq('id', signInData.user.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('❌ Error updating profile:', updateError.message)
          return
        }
        
        console.log('✅ Profile updated to admin:', updatedProfile)
      } else {
        console.log('✅ User is already an admin')
      }
    }
    
    // Initialize user search tracking
    const { error: searchError } = await supabase
      .from('user_searches')
      .upsert({
        user_id: signInData.user.id,
        search_count: 0
      })
    
    if (searchError) {
      console.log('⚠️  Could not initialize search tracking:', searchError.message)
    } else {
      console.log('✅ User search tracking initialized')
    }
    
    // Sign out
    await supabase.auth.signOut()
    
    console.log('\n🎉 Admin user setup complete!')
    console.log('📧 Email: design.marceli@gmail.com')
    console.log('🔑 Password: superAdmin')
    console.log('👤 Name: Darth MC')
    console.log('🛡️  Role: admin')
    console.log('🆔 User ID:', signInData.user.id)
    console.log('\n🌐 You can now sign in at: http://localhost:3000/auth/signin')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
setupDatabase()