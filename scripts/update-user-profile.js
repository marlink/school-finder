const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkAndUpdateUser() {
  try {
    const userEmail = 'design.marceli@gmail.com'
    const userId = '34782722-c030-4491-9a48-9ef5b9450ed0'
    
    console.log('🔍 Checking user profile...')
    
    // Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .single()
    
    if (profileError) {
      console.log('❌ Profile not found, creating one...')
      
      // Create profile manually
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
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
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            role: 'admin',
            name: 'Darth MC',
            subscription_status: 'premium'
          })
          .eq('id', userId)
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
    
    console.log('\n🎉 Admin user setup complete!')
    console.log('📧 Email: design.marceli@gmail.com')
    console.log('🔑 Password: superAdmin')
    console.log('👤 Name: Darth MC')
    console.log('🛡️  Role: admin')
    console.log('🆔 User ID:', userId)
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
  }
}

// Run the script
checkAndUpdateUser()