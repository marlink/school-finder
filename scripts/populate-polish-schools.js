require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Sample Polish schools data to populate the database
const polishSchoolsData = [
    {
        name: "Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie",
        shortName: "SP nr 1",
        type: "primary",
        address: {
            street: "ul. Krakowska 15",
            city: "Warszawa",
            postal: "00-001",
            voivodeship: "mazowieckie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 22 123 4567",
            email: "sp1@warszawa.edu.pl",
            website: "https://sp1.warszawa.edu.pl"
        },
        location: {
            latitude: 52.2297,
            longitude: 21.0122
        },
        status: "active",
        studentCount: 450,
        teacherCount: 25,
        establishedYear: 1985,
        languages: ["polish", "english"],
        specializations: ["mathematics", "science"],
        facilities: ["library", "gym", "computer_lab", "playground"]
    },
    {
        name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
        shortName: "LO Mickiewicz",
        type: "high_school",
        address: {
            street: "ul. Floriańska 3",
            city: "Kraków",
            postal: "31-019",
            voivodeship: "małopolskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 12 987 6543",
            email: "lo.mickiewicz@krakow.edu.pl",
            website: "https://lo-mickiewicz.krakow.edu.pl"
        },
        location: {
            latitude: 50.0647,
            longitude: 19.9450
        },
        status: "active",
        studentCount: 680,
        teacherCount: 45,
        establishedYear: 1920,
        languages: ["polish", "english", "german", "french"],
        specializations: ["humanities", "mathematics", "biology"],
        facilities: ["library", "gym", "computer_lab", "chemistry_lab", "physics_lab"]
    },
    {
        name: "Przedszkole Publiczne nr 5 'Słoneczko'",
        shortName: "PP Słoneczko",
        type: "kindergarten",
        address: {
            street: "ul. Gdańska 22",
            city: "Gdańsk",
            postal: "80-001",
            voivodeship: "pomorskie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 58 345 6789",
            email: "sloneczko@gdansk.edu.pl",
            website: "https://pp5.gdansk.edu.pl"
        },
        location: {
            latitude: 54.3520,
            longitude: 18.6466
        },
        status: "active",
        studentCount: 120,
        teacherCount: 8,
        establishedYear: 1995,
        languages: ["polish", "english"],
        specializations: ["early_childhood", "bilingual"],
        facilities: ["playground", "gym", "art_room", "music_room"]
    },
    {
        name: "Technikum Informatyczne",
        shortName: "Technikum IT",
        type: "technical",
        address: {
            street: "ul. Wrocławska 45",
            city: "Wrocław",
            postal: "50-001",
            voivodeship: "dolnośląskie",
            district: "Krzyki"
        },
        contact: {
            phone: "+48 71 234 5678",
            email: "info@technikum.wroclaw.edu.pl",
            website: "https://technikum-informatyczne.wroclaw.edu.pl"
        },
        location: {
            latitude: 51.1079,
            longitude: 17.0385
        },
        status: "active",
        studentCount: 320,
        teacherCount: 22,
        establishedYear: 2005,
        languages: ["polish", "english"],
        specializations: ["programming", "networking", "cybersecurity"],
        facilities: ["computer_lab", "server_room", "library", "cafeteria"]
    },
    {
        name: "Szkoła Podstawowa nr 12",
        shortName: "SP nr 12",
        type: "primary",
        address: {
            street: "ul. Poznańska 8",
            city: "Poznań",
            postal: "60-001",
            voivodeship: "wielkopolskie",
            district: "Stare Miasto"
        },
        contact: {
            phone: "+48 61 456 7890",
            email: "sp12@poznan.edu.pl",
            website: "https://sp12.poznan.edu.pl"
        },
        location: {
            latitude: 52.4064,
            longitude: 16.9252
        },
        status: "active",
        studentCount: 380,
        teacherCount: 20,
        establishedYear: 1978,
        languages: ["polish", "english"],
        specializations: ["sports", "arts"],
        facilities: ["gym", "sports_field", "art_room", "library"]
    },
    {
        name: "Uniwersytet Warszawski",
        shortName: "UW",
        type: "university",
        address: {
            street: "Krakowskie Przedmieście 26/28",
            city: "Warszawa",
            postal: "00-927",
            voivodeship: "mazowieckie",
            district: "Śródmieście"
        },
        contact: {
            phone: "+48 22 552 0000",
            email: "info@uw.edu.pl",
            website: "https://www.uw.edu.pl"
        },
        location: {
            latitude: 52.2395,
            longitude: 21.0170
        },
        status: "active",
        studentCount: 45000,
        teacherCount: 3500,
        establishedYear: 1816,
        languages: ["polish", "english", "german", "french", "spanish"],
        specializations: ["humanities", "sciences", "law", "economics"],
        facilities: ["library", "research_labs", "dormitories", "sports_center", "museum"]
    }
];

async function populateDatabase() {
    console.log('🚀 Starting database population with Polish schools...');
    
    try {
        // Clear existing data
        console.log('🗑️ Clearing existing data...');
        await prisma.schoolImage.deleteMany({});
        await prisma.school.deleteMany({});
        
        console.log('📚 Adding Polish schools to database...');
        
        let savedCount = 0;
        for (const schoolData of polishSchoolsData) {
            try {
                // Create school record
                const school = await prisma.school.create({
                    data: {
                        ...schoolData,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                
                // Add sample images for each school
                const sampleImages = [
                    {
                        imageUrl: `https://picsum.photos/800/600?random=${school.id}1`,
                        imageType: 'main',
                        altText: `${school.name} - Main building`,
                        source: 'admin',
                        isVerified: true,
                        displayOrder: 1
                    },
                    {
                        imageUrl: `https://picsum.photos/800/600?random=${school.id}2`,
                        imageType: 'classroom',
                        altText: `${school.name} - Classroom`,
                        source: 'admin',
                        isVerified: true,
                        displayOrder: 2
                    },
                    {
                        imageUrl: `https://picsum.photos/800/600?random=${school.id}3`,
                        imageType: 'playground',
                        altText: `${school.name} - Playground`,
                        source: 'admin',
                        isVerified: true,
                        displayOrder: 3
                    }
                ];
                
                for (const imageData of sampleImages) {
                    await prisma.schoolImage.create({
                        data: {
                            schoolId: school.id,
                            ...imageData,
                            uploadedAt: new Date()
                        }
                    });
                }
                
                savedCount++;
                console.log(`✅ Saved school ${savedCount}/${polishSchoolsData.length}: ${school.name}`);
                
            } catch (error) {
                console.error(`❌ Error saving school ${schoolData.name}:`, error.message);
            }
        }
        
        console.log(`🎉 Successfully populated database with ${savedCount} Polish schools!`);
        
        // Show summary
        const totalSchools = await prisma.school.count();
        const totalImages = await prisma.schoolImage.count();
        
        console.log('\n📊 Database Summary:');
        console.log(`   Schools: ${totalSchools}`);
        console.log(`   Images: ${totalImages}`);
        
        // Get school types summary
        const schoolsByType = await prisma.school.findMany({
            select: { type: true }
        });
        const typeCounts = schoolsByType.reduce((acc, school) => {
            acc[school.type] = (acc[school.type] || 0) + 1;
            return acc;
        }, {});
        console.log(`   School Types: ${Object.entries(typeCounts).map(([type, count]) => `${type}: ${count}`).join(', ')}`);
        
        // Get cities summary
        const schoolsByCity = await prisma.school.findMany({
            select: { address: true }
        });
        const cityCounts = schoolsByCity.reduce((acc, school) => {
            const city = school.address.city;
            acc[city] = (acc[city] || 0) + 1;
            return acc;
        }, {});
        console.log(`   Cities: ${Object.entries(cityCounts).map(([city, count]) => `${city}: ${count}`).join(', ')}`);
        
    } catch (error) {
        console.error('❌ Error populating database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the population script
if (require.main === module) {
    console.log('🎓 School Finder - Database Population');
    console.log('=====================================');
    populateDatabase()
        .then(() => {
            console.log('✅ Database population completed successfully!');
            console.log('🔗 View your data at: http://localhost:5555 (Prisma Studio)');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database population failed:', error);
            process.exit(1);
        });
}

module.exports = { populateDatabase };