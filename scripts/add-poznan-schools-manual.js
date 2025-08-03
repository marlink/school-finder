const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const poznanSchools = [
  {
    name: "Szkoła Podstawowa nr 1 im. Karola Marcinkowskiego",
    type: "Szkoła podstawowa",
    address: {
      street: "ul. Fredry 9",
      city: "Poznań",
      postalCode: "61-701",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 852 28 42",
      email: "sp1@poznan.edu.pl",
      website: "https://sp1.poznan.pl"
    },
    location: {
      latitude: 52.4064,
      longitude: 16.9252
    }
  },
  {
    name: "Liceum Ogólnokształcące im. Karola Marcinkowskiego",
    type: "Liceum ogólnokształcące",
    address: {
      street: "ul. Fredry 9",
      city: "Poznań",
      postalCode: "61-701",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 852 28 42",
      email: "lo1@poznan.edu.pl",
      website: "https://lo1.poznan.pl"
    },
    location: {
      latitude: 52.4064,
      longitude: 16.9252
    }
  },
  {
    name: "Szkoła Podstawowa nr 2 im. Adama Mickiewicza",
    type: "Szkoła podstawowa",
    address: {
      street: "ul. Mickiewicza 15",
      city: "Poznań",
      postalCode: "61-806",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 847 12 34",
      email: "sp2@poznan.edu.pl",
      website: "https://sp2.poznan.pl"
    },
    location: {
      latitude: 52.4098,
      longitude: 16.9318
    }
  },
  {
    name: "Technikum Elektroniczne",
    type: "Technikum",
    address: {
      street: "ul. Kościuszki 88",
      city: "Poznań",
      postalCode: "61-715",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 866 45 67",
      email: "te@poznan.edu.pl",
      website: "https://te.poznan.pl"
    },
    location: {
      latitude: 52.4025,
      longitude: 16.9195
    }
  },
  {
    name: "Przedszkole Publiczne nr 5 'Słoneczko'",
    type: "Przedszkole",
    address: {
      street: "ul. Słowackiego 22",
      city: "Poznań",
      postalCode: "61-853",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 847 89 12",
      email: "pp5@poznan.edu.pl",
      website: "https://pp5.poznan.pl"
    },
    location: {
      latitude: 52.4156,
      longitude: 16.9267
    }
  },
  {
    name: "Szkoła Podstawowa nr 10 im. Henryka Sienkiewicza",
    type: "Szkoła podstawowa",
    address: {
      street: "ul. Sienkiewicza 30",
      city: "Poznań",
      postalCode: "61-846",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 847 56 78",
      email: "sp10@poznan.edu.pl",
      website: "https://sp10.poznan.pl"
    },
    location: {
      latitude: 52.4123,
      longitude: 16.9345
    }
  },
  {
    name: "Liceum Ogólnokształcące nr 3 im. Adama Mickiewicza",
    type: "Liceum ogólnokształcące",
    address: {
      street: "ul. Mickiewicza 45",
      city: "Poznań",
      postalCode: "61-806",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 847 23 45",
      email: "lo3@poznan.edu.pl",
      website: "https://lo3.poznan.pl"
    },
    location: {
      latitude: 52.4089,
      longitude: 16.9298
    }
  },
  {
    name: "Zespół Szkół Technicznych",
    type: "Zespół szkół",
    address: {
      street: "ul. Przemysłowa 12",
      city: "Poznań",
      postalCode: "61-541",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 876 34 56",
      email: "zst@poznan.edu.pl",
      website: "https://zst.poznan.pl"
    },
    location: {
      latitude: 52.3987,
      longitude: 16.9156
    }
  },
  {
    name: "Szkoła Podstawowa nr 15 im. Janusza Korczaka",
    type: "Szkoła podstawowa",
    address: {
      street: "ul. Korczaka 8",
      city: "Poznań",
      postalCode: "61-672",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 847 67 89",
      email: "sp15@poznan.edu.pl",
      website: "https://sp15.poznan.pl"
    },
    location: {
      latitude: 52.4178,
      longitude: 16.9234
    }
  },
  {
    name: "Przedszkole Niepubliczne 'Akademia Malucha'",
    type: "Przedszkole",
    address: {
      street: "ul. Grunwaldzka 55",
      city: "Poznań",
      postalCode: "60-311",
      region: "wielkopolskie",
      country: "Polska"
    },
    contact: {
      phone: "+48 61 866 78 90",
      email: "akademia@poznan.edu.pl",
      website: "https://akademiamalucha.poznan.pl"
    },
    location: {
      latitude: 52.4045,
      longitude: 16.9123
    }
  }
];

async function addPoznanSchools() {
  try {
    console.log('🏫 Adding Poznań schools to database...');
    
    // Clear existing Poznań schools
    const deletedCount = await prisma.school.deleteMany({
      where: {
        address: {
          path: ['city'],
          string_contains: 'Poznań'
        }
      }
    });
    
    console.log(`🗑️ Removed ${deletedCount.count} existing Poznań schools`);
    
    // Add new schools
    let addedCount = 0;
    
    for (const school of poznanSchools) {
      try {
        await prisma.school.create({
          data: school
        });
        addedCount++;
        console.log(`✅ Added: ${school.name}`);
      } catch (error) {
        console.error(`❌ Failed to add ${school.name}:`, error.message);
      }
    }
    
    console.log(`\n🎉 Successfully added ${addedCount} Poznań schools!`);
    
  } catch (error) {
    console.error('❌ Error adding Poznań schools:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPoznanSchools();