const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

async function migrateToSupabase() {
  try {
    console.log('🚀 Starting MySQL to Supabase migration...');
    
    // Check Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase credentials');
      console.log('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return;
    }
    
    if (supabaseUrl.includes('your-project-ref') || supabaseKey.includes('your-service-role-key')) {
      console.log('❌ Using placeholder credentials');
      console.log('Please update .env.local with actual Supabase credentials');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Migrate Schools
    console.log('📚 Migrating schools...');
    const schools = await prisma.school.findMany({
      include: {
        images: true,
        socialMedia: true,
        googleRatings: true,
        userRatings: true
      }
    });
    
    console.log(`Found ${schools.length} schools to migrate`);
    
    for (const school of schools) {
      // Insert school
      const { data: insertedSchool, error: schoolError } = await supabase
        .from('schools')
        .insert({
          id: school.id,
          name: school.name,
          short_name: school.shortName,
          type: school.type,
          address: school.address,
          contact: school.contact,
          location: school.location,
          student_count: school.studentCount,
          teacher_count: school.teacherCount,
          established_year: school.establishedYear,
          languages: school.languages,
          specializations: school.specializations,
          facilities: school.facilities,
          description: school.description,
          website_url: school.websiteUrl,
          status: school.status,
          verification_status: school.verificationStatus,
          last_updated: school.lastUpdated,
          created_at: school.createdAt,
          updated_at: school.updatedAt
        })
        .select()
        .single();
        
      if (schoolError) {
        console.log(`❌ Error migrating school ${school.name}:`, schoolError.message);
        continue;
      }
      
      console.log(`✅ Migrated school: ${school.name}`);
      
      // Migrate school images
      if (school.images.length > 0) {
        const { error: imagesError } = await supabase
          .from('school_images')
          .insert(
            school.images.map(img => ({
              id: img.id,
              school_id: img.schoolId,
              url: img.url,
              type: img.type,
              alt_text: img.altText,
              caption: img.caption,
              source: img.source,
              is_primary: img.isPrimary,
              is_verified: img.isVerified,
              created_at: img.createdAt,
              updated_at: img.updatedAt
            }))
          );
          
        if (imagesError) {
          console.log(`⚠️  Error migrating images for ${school.name}:`, imagesError.message);
        } else {
          console.log(`  📸 Migrated ${school.images.length} images`);
        }
      }
    }
    
    // 2. Migrate Users (if any)
    console.log('👥 Migrating users...');
    const users = await prisma.user.findMany({
      include: {
        favorites: true,
        searches: true,
        ratings: true
      }
    });
    
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      // Note: User profiles will be created automatically by Supabase Auth
      // We only need to migrate the additional profile data
      
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: 'user', // Default role
          preferences: {}, // Default preferences
          created_at: user.createdAt,
          updated_at: user.updatedAt
        });
        
      if (profileError) {
        console.log(`❌ Error migrating user ${user.email}:`, profileError.message);
        continue;
      }
      
      console.log(`✅ Migrated user: ${user.email}`);
      
      // Migrate favorites
      if (user.favorites.length > 0) {
        const { error: favoritesError } = await supabase
          .from('favorites')
          .insert(
            user.favorites.map(fav => ({
              id: fav.id,
              user_id: fav.userId,
              school_id: fav.schoolId,
              notes: fav.notes,
              created_at: fav.createdAt
            }))
          );
          
        if (favoritesError) {
          console.log(`⚠️  Error migrating favorites for ${user.email}:`, favoritesError.message);
        } else {
          console.log(`  ⭐ Migrated ${user.favorites.length} favorites`);
        }
      }
      
      // Migrate search history
      if (user.searches.length > 0) {
        const { error: searchesError } = await supabase
          .from('user_searches')
          .insert(
            user.searches.map(search => ({
              id: search.id,
              user_id: search.userId,
              query: search.query,
              filters: search.filters,
              results_count: search.resultsCount,
              created_at: search.createdAt
            }))
          );
          
        if (searchesError) {
          console.log(`⚠️  Error migrating searches for ${user.email}:`, searchesError.message);
        } else {
          console.log(`  🔍 Migrated ${user.searches.length} searches`);
        }
      }
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`  • Schools: ${schools.length}`);
    console.log(`  • Users: ${users.length}`);
    console.log(`  • Images: ${schools.reduce((sum, s) => sum + s.images.length, 0)}`);
    console.log(`  • Favorites: ${users.reduce((sum, u) => sum + u.favorites.length, 0)}`);
    console.log(`  • Searches: ${users.reduce((sum, u) => sum + u.searches.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToSupabase();
}

module.exports = { migrateToSupabase };