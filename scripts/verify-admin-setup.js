require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdminProfile() {
  try {
    console.log('🔍 Checking admin profile...');
    
    // First, let's check if the user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const adminUser = authUsers.users.find(user => user.email === 'design.marceli@gmail.com');
    
    if (!adminUser) {
      console.log('❌ Admin user not found in auth.users');
      console.log('📝 Please sign up first at: http://localhost:3000/auth/signin');
      return;
    }
    
    console.log('✅ Admin user found in auth.users:', adminUser.id);
    
    // Check if profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'design.marceli@gmail.com')
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Error checking profile:', profileError);
      return;
    }
    
    if (!profile) {
      console.log('📝 Profile not found, creating admin profile...');
      
      // Create the profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: adminUser.id,
          email: 'design.marceli@gmail.com',
          name: 'Darth',
          surname: 'MC',
          role: 'admin',
          subscription_status: 'premium'
        })
        .select()
        .single();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return;
      }
      
      console.log('✅ Admin profile created successfully:', newProfile);
    } else {
      console.log('✅ Profile found:', profile);
      
      // Update profile to ensure correct values
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles')
        .update({
          name: 'Darth',
          surname: 'MC',
          role: 'admin',
          subscription_status: 'premium'
        })
        .eq('id', adminUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return;
      }
      
      console.log('✅ Admin profile updated successfully:', updatedProfile);
    }
    
    // Final verification
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'design.marceli@gmail.com')
      .single();
    
    if (finalError) {
      console.error('❌ Error in final verification:', finalError);
      return;
    }
    
    console.log('\n🎉 FINAL VERIFICATION:');
    console.log('📧 Email:', finalProfile.email);
    console.log('👤 Name:', finalProfile.name);
    console.log('👤 Surname:', finalProfile.surname);
    console.log('🔑 Role:', finalProfile.role);
    console.log('💎 Subscription:', finalProfile.subscription_status);
    
    if (finalProfile.name === 'Darth' && finalProfile.surname === 'MC' && finalProfile.role === 'admin') {
      console.log('\n✅ SUCCESS! Admin profile is correctly configured.');
      console.log('🚀 You can now access the admin panel at: http://localhost:3000/admin');
    } else {
      console.log('\n⚠️  Profile exists but values may not be correct. Please run the update-admin-profile.sql script.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyAdminProfile();