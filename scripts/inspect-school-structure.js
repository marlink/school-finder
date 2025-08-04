const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function inspectSchoolStructure() {
    try {
        console.log('🔍 Inspecting school structure...');
        
        // Get one school to see the structure
        const school = await prisma.school.findFirst();
        
        if (school) {
            console.log('📚 Sample school structure:');
            console.log('Name:', school.name);
            console.log('Address:', JSON.stringify(school.address, null, 2));
            console.log('Contact:', JSON.stringify(school.contact, null, 2));
            console.log('Location:', JSON.stringify(school.location, null, 2));
        } else {
            console.log('❌ No school found');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

inspectSchoolStructure();