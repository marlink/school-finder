import { PrismaClient } from '@prisma/client';

async function checkSchema() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking database schema...');
    
    // Check if schools table exists and what columns it has
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'schools' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\n📋 Schools table columns:');
    console.table(result);
    
    // Check total number of schools
    const schoolCount = await prisma.school.count();
    console.log(`\n📊 Total schools in database: ${schoolCount}`);
    
    // Try to get a sample school (without contact field)
    if (schoolCount > 0) {
      const sampleSchool = await prisma.school.findFirst({
        select: {
          id: true,
          name: true,
          address: true,
          // Don't include contact field to avoid error
        }
      });
      console.log('\n🏫 Sample school (without contact):');
      console.log(sampleSchool);
    }
    
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();