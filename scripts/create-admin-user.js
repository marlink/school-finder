const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Debug environment variables
console.log('🔍 Environment check:')
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing')

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // This key has admin privileges
)

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user...')
    
    // User details
    const userData = {
      email: 'design.marceli@gmail.com',
      password: 'superAdmin',
      name: 'Darth MC',
      role: 'admin'
    }
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: userData.name
      }
    })
    
    if (authError) {
      console.error('❌ Error creating auth user:', authError.message)
      return
    }
    
    console.log('✅ Auth user created:', authData.user.id)
    
    // Create/update profile with admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        subscription_status: 'premium', // Give admin premium access
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    
    if (profileError) {
      console.error('❌ Error creating profile:', profileError.message)
      return
    }
    
    console.log('✅ Profile created with admin role')
    
    // Initialize user search tracking
    const { error: searchError } = await supabase
      .from('user_searches')
      .upsert({
        user_id: authData.user.id,
        search_count: 0,
        last_reset: new Date().toISOString()
      })
    
    if (searchError) {
      console.warn('⚠️  Warning: Could not initialize search tracking:', searchError.message)
    } else {
      console.log('✅ User search tracking initialized')
    }
    
    console.log('\n🎉 Admin user created successfully!')
    console.log('📧 Email:', userData.email)
    console.log('🔑 Password:', userData.password)
    console.log('👤 Name:', userData.name)
    console.log('🛡️  Role:', userData.role)
    console.log('🆔 User ID:', authData.user.id)
    
    console.log('\n📝 You can now sign in with these credentials at: http://localhost:3002/auth/signin')
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
createAdminUser()