const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const testSchools = [
  // Poznań schools
  {
    name: "Szkoła Podstawowa nr 1 im. Adama Mickiewicza w Poznaniu",
    type: "PODSTAWOWA",
    address: {
      street: "ul. Mickiewicza 15",
      city: "Poznań",
      region: "wielkopolskie",
      postalCode: "61-001",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 852 1234",
      email: "sp1@poznan.edu.pl",
      website: "https://sp1.poznan.pl"
    },
    location: {
      latitude: 52.4064,
      longitude: 16.9252
    },
    studentCount: 450,
    teacherCount: 35,
    establishedYear: 1920,
    languages: ["angielski", "niemiecki"],
    specializations: ["matematyka", "nauki ścisłe"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: true,
      hasComputerLab: true,
      extracurriculars: ["chór", "teatr", "sport", "matematyka"]
    }
  },
  {
    name: "Liceum Ogólnokształcące im. Mikołaja Kopernika w Poznaniu",
    type: "LICEUM",
    address: {
      street: "ul. Kopernika 8",
      city: "Poznań",
      region: "wielkopolskie",
      postalCode: "61-002",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 852 5678",
      email: "lo.kopernik@poznan.edu.pl",
      website: "https://lokopernik.poznan.pl"
    },
    location: {
      latitude: 52.4084,
      longitude: 16.9272
    },
    studentCount: 680,
    teacherCount: 52,
    establishedYear: 1945,
    languages: ["angielski", "niemiecki", "francuski"],
    specializations: ["matematyka-fizyka", "biologia-chemia"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: false,
      hasComputerLab: true,
      extracurriculars: ["olimpiady przedmiotowe", "robotyka", "debaty", "wolontariat"]
    }
  },
  {
    name: "Przedszkole Publiczne nr 5 'Słoneczko' w Poznaniu",
    type: "PRZEDSZKOLE",
    address: {
      street: "ul. Słoneczna 12",
      city: "Poznań",
      region: "wielkopolskie",
      postalCode: "61-003",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 852 9012",
      email: "pp5@poznan.edu.pl",
      website: "https://sloneczko.poznan.pl"
    },
    location: {
      latitude: 52.4044,
      longitude: 16.9232
    },
    studentCount: 120,
    teacherCount: 12,
    establishedYear: 1980,
    languages: ["angielski"],
    specializations: ["wczesna edukacja", "sztuka"],
    facilities: {
      hasCanteen: true,
      hasLibrary: false,
      hasGym: false,
      hasPlayground: true,
      hasComputerLab: false,
      extracurriculars: ["plastyka", "muzyka", "taniec", "sport"]
    }
  },
  
  // Sujchy Llas area (fictional but realistic)
  {
    name: "Szkoła Podstawowa w Sujchach Llas",
    type: "PODSTAWOWA",
    address: {
      street: "ul. Leśna 3",
      city: "Sujchy Llas",
      region: "wielkopolskie",
      postalCode: "62-040",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 123 4567",
      email: "sp@sujchyllas.edu.pl",
      website: "https://sp.sujchyllas.pl"
    },
    location: {
      latitude: 52.3500,
      longitude: 16.8000
    },
    studentCount: 85,
    teacherCount: 8,
    establishedYear: 1965,
    languages: ["angielski"],
    specializations: ["edukacja ekologiczna"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: false,
      hasPlayground: true,
      hasComputerLab: true,
      extracurriculars: ["ekologia", "sport", "koło przyrodnicze"]
    }
  },
  
  // Schools within 40km of Poznań
  {
    name: "Zespół Szkół Ponadpodstawowych w Swarzędzu",
    type: "TECHNIKUM",
    address: {
      street: "ul. Poznańska 45",
      city: "Swarzędz",
      region: "wielkopolskie",
      postalCode: "62-020",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 817 2345",
      email: "zsp@swarzedz.edu.pl",
      website: "https://zsp.swarzedz.pl"
    },
    location: {
      latitude: 52.4167,
      longitude: 17.0833
    },
    studentCount: 520,
    teacherCount: 42,
    establishedYear: 1975,
    languages: ["angielski", "niemiecki"],
    specializations: ["informatyka", "mechanika", "elektronika"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: false,
      hasComputerLab: true,
      extracurriculars: ["robotyka", "programowanie", "sport", "mechanika"]
    }
  },
  {
    name: "Szkoła Podstawowa im. Jana Pawła II w Luboniu",
    type: "PODSTAWOWA",
    address: {
      street: "ul. Kościelna 7",
      city: "Luboń",
      region: "wielkopolskie",
      postalCode: "62-030",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 813 5678",
      email: "sp.jp2@lubon.edu.pl",
      website: "https://sp-jp2.lubon.pl"
    },
    location: {
      latitude: 52.3333,
      longitude: 16.8667
    },
    studentCount: 380,
    teacherCount: 28,
    establishedYear: 1955,
    languages: ["angielski", "niemiecki"],
    specializations: ["humanistyka", "nauki ścisłe"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: true,
      hasComputerLab: true,
      extracurriculars: ["chór", "sport", "plastyka", "matematyka"]
    }
  },
  {
    name: "Liceum Ogólnokształcące w Puszczykowie",
    type: "LICEUM",
    address: {
      street: "ul. Parkowa 22",
      city: "Puszczykowo",
      region: "wielkopolskie",
      postalCode: "62-040",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 814 9012",
      email: "lo@puszczykowo.edu.pl",
      website: "https://lo.puszczykowo.pl"
    },
    location: {
      latitude: 52.2833,
      longitude: 16.8500
    },
    studentCount: 290,
    teacherCount: 24,
    establishedYear: 1990,
    languages: ["angielski", "francuski", "hiszpański"],
    specializations: ["humanistyka", "nauki przyrodnicze"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: false,
      hasComputerLab: true,
      extracurriculars: ["teatr", "debaty", "ekologia", "turystyka"]
    }
  },
  {
    name: "Przedszkole Niepubliczne 'Bajkowy Świat' w Kórniku",
    type: "PRZEDSZKOLE",
    address: {
      street: "ul. Zamkowa 5",
      city: "Kórnik",
      region: "wielkopolskie",
      postalCode: "62-035",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 817 3456",
      email: "bajkowyswiat@kornik.pl",
      website: "https://bajkowyswiat.kornik.pl"
    },
    location: {
      latitude: 52.2500,
      longitude: 17.0833
    },
    studentCount: 60,
    teacherCount: 8,
    establishedYear: 2010,
    languages: ["angielski"],
    specializations: ["Montessori", "wczesna edukacja"],
    facilities: {
      hasCanteen: true,
      hasLibrary: false,
      hasGym: false,
      hasPlayground: true,
      hasComputerLab: false,
      extracurriculars: ["muzyka", "plastyka", "taniec", "joga dla dzieci"]
    }
  },
  {
    name: "Szkoła Podstawowa w Dopiewie",
    type: "PODSTAWOWA",
    address: {
      street: "ul. Szkolna 10",
      city: "Dopiewo",
      region: "wielkopolskie",
      postalCode: "62-070",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 814 7890",
      email: "sp@dopiewo.edu.pl",
      website: "https://sp.dopiewo.pl"
    },
    location: {
      latitude: 52.3167,
      longitude: 16.7500
    },
    studentCount: 420,
    teacherCount: 32,
    establishedYear: 1968,
    languages: ["angielski", "niemiecki"],
    specializations: ["informatyka", "ekologia"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: true,
      hasPlayground: true,
      hasComputerLab: true,
      extracurriculars: ["sport", "informatyka", "ekologia", "samorząd uczniowski"]
    }
  },
  {
    name: "Zespół Szkół w Kostrzynie",
    type: "PODSTAWOWA",
    address: {
      street: "ul. Główna 15",
      city: "Kostrzyn",
      region: "wielkopolskie",
      postalCode: "62-025",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 817 1234",
      email: "zs@kostrzyn.edu.pl",
      website: "https://zs.kostrzyn.pl"
    },
    location: {
      latitude: 52.4500,
      longitude: 17.0500
    },
    studentCount: 180,
    teacherCount: 16,
    establishedYear: 1972,
    languages: ["angielski"],
    specializations: ["rolnictwo", "nauki przyrodnicze"],
    facilities: {
      hasCanteen: true,
      hasLibrary: true,
      hasGym: false,
      hasPlayground: true,
      hasComputerLab: true,
      extracurriculars: ["rolnictwo", "sport", "koło przyrodnicze"]
    }
  }
];

async function createTestData() {
  try {
    console.log('🌱 Creating test data for Poznań area schools...');
    
    // Clear existing test data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing schools...');
    await prisma.school.deleteMany({});
    
    // Create schools
    console.log('🏫 Creating schools...');
    for (const school of testSchools) {
      const created = await prisma.school.create({
        data: school
      });
      console.log(`✅ Created: ${created.name} in ${created.address.city}`);
    }
    
    console.log(`\n🎉 Successfully created ${testSchools.length} test schools!`);
    console.log('\n📍 Test locations include:');
    console.log('- Poznań (city center)');
    console.log('- Sujchy Llas (fictional village)');
    console.log('- Swarzędz, Luboń, Puszczykowo, Kórnik, Dopiewo, Kostrzyn (surrounding areas)');
    console.log('\n🔍 Try searching for:');
    console.log('- "Poznań" - should return multiple results');
    console.log('- "Sujchy Llas" - should return the village school');
    console.log('- "Liceum" - should return high schools');
    console.log('- "Przedszkole" - should return kindergartens');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();