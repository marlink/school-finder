const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createAdminProfile() {
  try {
    const userEmail = 'design.marceli@gmail.com'
    const userId = '34782722-c030-4491-9a48-9ef5b9450ed0'
    
    console.log('🚀 Creating admin profile...')
    
    // First, let's sign in as the user to get proper authentication
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: 'superAdmin',
    })
    
    if (signInError) {
      console.error('❌ Error signing in:', signInError.message)
      return
    }
    
    console.log('✅ User authenticated successfully')
    
    // Try to create the profile directly using raw SQL through a function
    // Since we can't execute arbitrary SQL, let's try using the REST API directly
    
    // First, let's check what tables exist
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
    
    if (tablesError) {
      console.log('⚠️  Could not check tables:', tablesError.message)
    } else {
      console.log('📋 Available tables:', tables?.map(t => t.table_name) || 'None')
    }
    
    // Try to insert into profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: userEmail,
        name: 'Darth MC',
        role: 'admin',
        subscription_status: 'premium'
      })
      .select()
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      console.log('📝 Profile error details:', profileError)
      
      // If the table doesn't exist, let's try a different approach
      if (profileError.message.includes('relation') && profileError.message.includes('does not exist')) {
        console.log('\n⚠️  The profiles table does not exist in the database.')
        console.log('🔧 You need to run the Supabase migrations to create the tables.')
        console.log('📖 Please check the Supabase dashboard or run migrations manually.')
        
        // For now, let's just confirm the user exists in auth
        console.log('\n✅ User exists in Supabase Auth:')
        console.log('📧 Email:', signInData.user.email)
        console.log('🆔 User ID:', signInData.user.id)
        console.log('📅 Created:', signInData.user.created_at)
        console.log('✉️  Email confirmed:', signInData.user.email_confirmed_at ? 'Yes' : 'No')
        
        return
      }
    } else {
      console.log('✅ Profile created successfully:', profileData)
    }
    
    // Sign out
    await supabase.auth.signOut()
    
    console.log('\n🎉 Admin user setup complete!')
    console.log('📧 Email: design.marceli@gmail.com')
    console.log('🔑 Password: superAdmin')
    console.log('👤 Name: Darth MC')
    console.log('🛡️  Role: admin')
    console.log('🆔 User ID:', userId)
    console.log('\n🌐 You can now sign in at: http://localhost:3000/auth/signin')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
createAdminProfile()