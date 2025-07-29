require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSchools() {
    console.log('🚀 Adding Polish schools to database...');
    
    try {
        // Add a few schools directly
        const schools = [
            {
                name: "Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie",
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
                name: "Uniwersytet Warszawski",
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

        for (const schoolData of schools) {
            const school = await prisma.school.create({
                data: schoolData
            });
            console.log(`✅ Added: ${school.name}`);
        }
        
        const count = await prisma.school.count();
        console.log(`🎉 Successfully added schools! Total in database: ${count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

addSchools();