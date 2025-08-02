import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCurrentData() {
  console.log('🔍 Checking current database state...\n');

  try {
    // Check schools table
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        contact: true,
      },
      take: 10,
    });

    console.log(`📚 Found ${schools?.length || 0} schools in database:`);
    if (schools && schools.length > 0) {
      schools.forEach((school, i) => {
        console.log(`${i + 1}. ${school.name}`);
        if (school.address && typeof school.address === 'object') {
          console.log(`   📍 ${school.address.city || 'Unknown city'}`);
        }
        if (school.contact && typeof school.contact === 'object') {
          console.log(`   📞 ${school.contact.phone || 'No phone'}`);
        }
        console.log('');
      });
    } else {
      console.log('   No schools found in database');
    }

    // Check users table
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        // Note: User model might not have 'role' field, check schema
      },
      take: 5,
    });

    console.log(`👥 Found ${users.length} users in database`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCurrentData();