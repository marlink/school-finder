const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function verifyAndUpdateUser() {
  try {
    const userEmail = 'design.marceli@gmail.com'
    
    console.log('🔍 Checking user in auth.users...')
    
    // First, let's try to sign in to verify the user exists and is confirmed
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: 'admin@schoolfinder.pl',
    password: process.env.ADMIN_PASSWORD || 'defaultPassword123',
  });
    
    if (signInError) {
      console.error('❌ Error signing in:', signInError.message)
      return
    }
    
    console.log('✅ User authenticated successfully')
    console.log('🆔 User ID:', signInData.user.id)
    console.log('📧 Email confirmed:', signInData.user.email_confirmed_at ? 'Yes' : 'No')
    
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
      console.log('📝 Creating profile...')
      
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
      
      console.log('✅ Profile created successfully:', newProfile)
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
    
    // Sign out
    await supabase.auth.signOut()
    
    console.log('\n🎉 Admin user verification complete!')
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
verifyAndUpdateUser()