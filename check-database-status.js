const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@supabase/supabase-js');

const prisma = new PrismaClient();

async function checkDatabaseStatus() {
  console.log('🔍 School Finder Database Status Report');
  console.log('=====================================\n');
  
  // Check MySQL/Prisma Database
  console.log('📊 MySQL Database (Current Active)');
  console.log('----------------------------------');
  
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connection: Active');
    
    // Count records
    const schoolCount = await prisma.school.count();
    const userCount = await prisma.user.count();
    const imageCount = await prisma.schoolImage.count();
    const favoriteCount = await prisma.favorite.count();
    const searchCount = await prisma.userSearches.count();
    const ratingCount = await prisma.ratingsUsers.count();
    
    console.log(`📚 Schools: ${schoolCount}`);
    console.log(`👥 Users: ${userCount}`);
    console.log(`📸 Images: ${imageCount}`);
    console.log(`⭐ Favorites: ${favoriteCount}`);
    console.log(`🔍 Searches: ${searchCount}`);
    console.log(`⭐ User Ratings: ${ratingCount}`);
    
    // Show sample schools
    if (schoolCount > 0) {
      console.log('\n📋 Sample Schools:');
      const sampleSchools = await prisma.school.findMany({
        take: 3,
        select: {
          name: true,
          type: true,
          address: true,
          studentCount: true
        }
      });
      
      sampleSchools.forEach((school, index) => {
        const city = school.address?.city || 'Unknown';
        console.log(`${index + 1}. ${school.name} (${school.type}) - ${city} - ${school.studentCount} students`);
      });
    }
    
  } catch (error) {
    console.log('❌ Connection: Failed');
    console.log(`Error: ${error.message}`);
  }
  
  console.log('\n🌐 Supabase Database (Ready for Setup)');
  console.log('-------------------------------------');
  
  // Check Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('❌ Configuration: Missing environment variables');
    console.log('📖 See SUPABASE_SETUP.md for setup instructions');
  } else if (supabaseUrl.includes('your-project-ref')) {
    console.log('⚠️  Configuration: Using placeholder values');
    console.log('📖 Update .env.local with actual Supabase credentials');
  } else {
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      console.log('✅ Configuration: Valid credentials detected');
      console.log(`📍 Project URL: ${supabaseUrl}`);
      
      // Test basic connection
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error && error.message !== 'Invalid JWT') {
        console.log(`⚠️  Connection: ${error.message}`);
      } else {
        console.log('✅ Connection: Accessible');
      }
      
      // Test database access
      try {
        const { data, error: dbError } = await supabase
          .from('schools')
          .select('count', { count: 'exact', head: true });
          
        if (dbError) {
          console.log('⚠️  Database: Schema not set up yet');
          console.log('💡 Run schema from supabase/schema.sql');
        } else {
          console.log(`📚 Schools in Supabase: ${data?.length || 0}`);
        }
      } catch (dbError) {
        console.log('⚠️  Database: Not accessible');
      }
      
    } catch (error) {
      console.log('❌ Connection: Failed');
      console.log(`Error: ${error.message}`);
    }
  }
  
  console.log('\n🔧 Environment Configuration');
  console.log('----------------------------');
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing'}`);
  console.log(`GOOGLE_MAPS_API_KEY: ${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  
  console.log('\n📋 Next Steps');
  console.log('-------------');
  
  if (!supabaseUrl || supabaseUrl.includes('your-project-ref')) {
    console.log('1. 🌐 Create Supabase project at supabase.com');
    console.log('2. 🔑 Update .env.local with Supabase credentials');
    console.log('3. 🗄️  Run schema setup in Supabase dashboard');
    console.log('4. 🚀 (Optional) Migrate data from MySQL to Supabase');
  } else {
    console.log('1. ✅ Supabase configured - ready to use!');
    console.log('2. 🗄️  Set up database schema if not done yet');
    console.log('3. 🚀 (Optional) Migrate data from MySQL');
  }
  
  console.log('\n📖 Documentation');
  console.log('----------------');
  console.log('• Setup Guide: SUPABASE_SETUP.md');
  console.log('• Test MySQL: node test-db.js');
  console.log('• Test Supabase: node test-supabase.js');
  console.log('• Migrate Data: node scripts/migrate-to-supabase.js');
  
  await prisma.$disconnect();
}

checkDatabaseStatus().catch(console.error);