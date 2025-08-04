const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPoznanSchools() {
  try {
    console.log('🔍 Checking Poznań schools in database...\n');
    
    const poznanSchools = await prisma.school.findMany({
      where: {
        address: {
          path: ['city'],
          string_contains: 'Poznań'
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📚 Found ${poznanSchools.length} schools in Poznań:\n`);
    
    poznanSchools.forEach((school, index) => {
      console.log(`${index + 1}. ${school.name}`);
      console.log(`   📍 ${school.address.street}, ${school.address.city} ${school.address.postalCode}`);
      console.log(`   📞 ${school.contact.phone}`);
      console.log(`   🌐 ${school.contact.website}`);
      console.log(`   📧 ${school.contact.email}`);
      console.log(`   🏫 Type: ${school.type}`);
      console.log(`   📍 Location: ${school.location?.latitude}, ${school.location?.longitude}\n`);
    });
    
    // Also check total count
    const totalSchools = await prisma.school.count();
    console.log(`📊 Total schools in database: ${totalSchools}`);
    
  } catch (error) {
    console.error('❌ Error checking Poznań schools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPoznanSchools();