const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const polishSchools = [
  {
    name: "Szkoła Podstawowa nr 1 im. Marii Skłodowskiej-Curie",
    type: "primary",
    address: {
      street: "ul. Krakowska 15",
      city: "Warszawa",
      postalCode: "00-001",
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
    studentCount: 420,
    teacherCount: 32,
    establishedYear: 1965
  },
  {
    name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
    type: "high_school",
    address: {
      street: "ul. Mickiewicza 30",
      city: "Kraków",
      postalCode: "31-120",
      voivodeship: "małopolskie",
      district: "Stare Miasto"
    },
    contact: {
      phone: "+48 12 234 5678",
      email: "lo@mickiewicz.krakow.pl",
      website: "https://lomickiewicz.krakow.pl"
    },
    location: {
      latitude: 50.0647,
      longitude: 19.9450
    },
    studentCount: 680,
    teacherCount: 52,
    establishedYear: 1923
  },
  {
    name: "Przedszkole Publiczne nr 8 'Bajka'",
    type: "kindergarten",
    address: {
      street: "ul. Bajkowa 5",
      city: "Gdańsk",
      postalCode: "80-233",
      voivodeship: "pomorskie",
      district: "Wrzeszcz"
    },
    contact: {
      phone: "+48 58 345 6789",
      email: "bajka@przedszkole.gdansk.pl",
      website: "https://pp8.gdansk.pl"
    },
    location: {
      latitude: 54.3520,
      longitude: 18.6466
    },
    studentCount: 95,
    teacherCount: 9,
    establishedYear: 1982
  },
  {
    name: "Technikum Informatyczne nr 2",
    type: "technical",
    address: {
      street: "ul. Technologiczna 10",
      city: "Wrocław",
      postalCode: "50-370",
      voivodeship: "dolnośląskie",
      district: "Krzyki"
    },
    contact: {
      phone: "+48 71 456 7890",
      email: "ti2@wroclaw.edu.pl",
      website: "https://ti2.wroclaw.pl"
    },
    location: {
      latitude: 51.1079,
      longitude: 17.0385
    },
    studentCount: 380,
    teacherCount: 28,
    establishedYear: 1995
  },
  {
    name: "Szkoła Podstawowa nr 12 im. Janusza Korczaka",
    type: "primary",
    address: {
      street: "ul. Korczaka 8",
      city: "Poznań",
      postalCode: "61-704",
      voivodeship: "wielkopolskie",
      district: "Jeżyce"
    },
    contact: {
      phone: "+48 61 567 8901",
      email: "sp12@poznan.edu.pl",
      website: "https://sp12.poznan.pl"
    },
    location: {
      latitude: 52.4064,
      longitude: 16.9252
    },
    studentCount: 350,
    teacherCount: 28,
    establishedYear: 1978
  },
  {
    name: "Liceum Ogólnokształcące im. Stefana Batorego",
    type: "high_school",
    address: {
      street: "ul. Batorego 45",
      city: "Łódź",
      postalCode: "91-480",
      voivodeship: "łódzkie",
      district: "Bałuty"
    },
    contact: {
      phone: "+48 42 678 9012",
      email: "lo.batory@lodz.edu.pl",
      website: "https://lobatory.lodz.pl"
    },
    location: {
      latitude: 51.7765,
      longitude: 19.4712
    },
    studentCount: 520,
    teacherCount: 42,
    establishedYear: 1945
  },
  {
    name: "Przedszkole Niepubliczne 'Kraina Marzeń'",
    type: "kindergarten",
    address: {
      street: "ul. Wałbrzyska 56",
      city: "Wałbrzych",
      postalCode: "58-001",
      voivodeship: "dolnośląskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 74 789 0123",
      email: "kraina@marzen.pl",
      website: "https://krainamarzen.pl"
    },
    location: {
      latitude: 50.7841,
      longitude: 16.2844
    },
    studentCount: 75,
    teacherCount: 8,
    establishedYear: 2005
  },
  {
    name: "Szkoła Podstawowa nr 21 im. Bolesława Prusa",
    type: "primary",
    address: {
      street: "ul. Grudziądzka 78",
      city: "Grudziądz",
      postalCode: "86-001",
      voivodeship: "kujawsko-pomorskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 56 890 1234",
      email: "sp21@grudziadz.edu.pl",
      website: "https://sp21.grudziadz.pl"
    },
    location: {
      latitude: 53.4839,
      longitude: 18.7536
    },
    studentCount: 290,
    teacherCount: 24,
    establishedYear: 1962
  },
  {
    name: "Liceum Ogólnokształcące im. Stanisława Staszica",
    type: "high_school",
    address: {
      street: "ul. Słupska 23",
      city: "Słupsk",
      postalCode: "76-200",
      voivodeship: "pomorskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 59 901 2345",
      email: "lo.staszic@slupsk.edu.pl",
      website: "https://lostaszic.slupsk.pl"
    },
    location: {
      latitude: 54.4641,
      longitude: 17.0286
    },
    studentCount: 480,
    teacherCount: 38,
    establishedYear: 1950
  },
  {
    name: "Technikum Mechaniczne nr 1",
    type: "technical",
    address: {
      street: "ul. Przemysłowa 15",
      city: "Katowice",
      postalCode: "40-020",
      voivodeship: "śląskie",
      district: "Śródmieście"
    },
    contact: {
      phone: "+48 32 012 3456",
      email: "tm1@katowice.edu.pl",
      website: "https://tm1.katowice.pl"
    },
    location: {
      latitude: 50.2649,
      longitude: 19.0238
    },
    studentCount: 420,
    teacherCount: 35,
    establishedYear: 1968
  },
  {
    name: "Szkoła Podstawowa nr 5 im. Henryka Sienkiewicza",
    type: "primary",
    address: {
      street: "ul. Sienkiewicza 12",
      city: "Lublin",
      postalCode: "20-109",
      voivodeship: "lubelskie",
      district: "Śródmieście"
    },
    contact: {
      phone: "+48 81 123 4567",
      email: "sp5@lublin.edu.pl",
      website: "https://sp5.lublin.pl"
    },
    location: {
      latitude: 51.2465,
      longitude: 22.5684
    },
    studentCount: 340,
    teacherCount: 27,
    establishedYear: 1955
  },
  {
    name: "Przedszkole Publiczne nr 15 'Słoneczko'",
    type: "kindergarten",
    address: {
      street: "ul. Słoneczna 33",
      city: "Rzeszów",
      postalCode: "35-001",
      voivodeship: "podkarpackie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 17 234 5678",
      email: "sloneczko@rzeszow.pl",
      website: "https://pp15.rzeszow.pl"
    },
    location: {
      latitude: 50.0412,
      longitude: 21.9991
    },
    studentCount: 120,
    teacherCount: 12,
    establishedYear: 1985
  },
  {
    name: "Liceum Ogólnokształcące im. Tadeusza Kościuszki",
    type: "high_school",
    address: {
      street: "ul. Kościuszki 67",
      city: "Białystok",
      postalCode: "15-001",
      voivodeship: "podlaskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 85 345 6789",
      email: "lo.kosciuszko@bialystok.edu.pl",
      website: "https://lokosciuszko.bialystok.pl"
    },
    location: {
      latitude: 53.1325,
      longitude: 23.1688
    },
    studentCount: 560,
    teacherCount: 45,
    establishedYear: 1935
  },
  {
    name: "Szkoła Podstawowa nr 8 im. Mikołaja Kopernika",
    type: "primary",
    address: {
      street: "ul. Kopernika 19",
      city: "Toruń",
      postalCode: "87-100",
      voivodeship: "kujawsko-pomorskie",
      district: "Stare Miasto"
    },
    contact: {
      phone: "+48 56 456 7890",
      email: "sp8@torun.edu.pl",
      website: "https://sp8.torun.pl"
    },
    location: {
      latitude: 53.0138,
      longitude: 18.5984
    },
    studentCount: 310,
    teacherCount: 25,
    establishedYear: 1973
  },
  {
    name: "Technikum Budowlane nr 3",
    type: "technical",
    address: {
      street: "ul. Budowlana 88",
      city: "Szczecin",
      postalCode: "70-001",
      voivodeship: "zachodniopomorskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 91 567 8901",
      email: "tb3@szczecin.edu.pl",
      website: "https://tb3.szczecin.pl"
    },
    location: {
      latitude: 53.4285,
      longitude: 14.5528
    },
    studentCount: 360,
    teacherCount: 30,
    establishedYear: 1980
  },
  {
    name: "Przedszkole Niepubliczne 'Akademia Malucha'",
    type: "kindergarten",
    address: {
      street: "ul. Dziecięca 7",
      city: "Kielce",
      postalCode: "25-001",
      voivodeship: "świętokrzyskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 41 678 9012",
      email: "akademia@malucha.pl",
      website: "https://akademiamalucha.pl"
    },
    location: {
      latitude: 50.8661,
      longitude: 20.6286
    },
    studentCount: 85,
    teacherCount: 9,
    establishedYear: 2010
  },
  {
    name: "Szkoła Podstawowa nr 18 im. Władysława Reymonta",
    type: "primary",
    address: {
      street: "ul. Reymonta 44",
      city: "Olsztyn",
      postalCode: "10-117",
      voivodeship: "warmińsko-mazurskie",
      district: "Jaroty"
    },
    contact: {
      phone: "+48 89 789 0123",
      email: "sp18@olsztyn.edu.pl",
      website: "https://sp18.olsztyn.pl"
    },
    location: {
      latitude: 53.7784,
      longitude: 20.4801
    },
    studentCount: 280,
    teacherCount: 22,
    establishedYear: 1988
  },
  {
    name: "Liceum Ogólnokształcące im. Juliusza Słowackiego",
    type: "high_school",
    address: {
      street: "ul. Słowackiego 91",
      city: "Opole",
      postalCode: "45-001",
      voivodeship: "opolskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 77 890 1234",
      email: "lo.slowacki@opole.edu.pl",
      website: "https://loslowacki.opole.pl"
    },
    location: {
      latitude: 50.6751,
      longitude: 17.9213
    },
    studentCount: 440,
    teacherCount: 36,
    establishedYear: 1948
  },
  {
    name: "Technikum Elektroniczne nr 4",
    type: "technical",
    address: {
      street: "ul. Elektroniczna 22",
      city: "Gorzów Wielkopolski",
      postalCode: "66-400",
      voivodeship: "lubuskie",
      district: "Centrum"
    },
    contact: {
      phone: "+48 95 901 2345",
      email: "te4@gorzow.edu.pl",
      website: "https://te4.gorzow.pl"
    },
    location: {
      latitude: 52.7325,
      longitude: 15.2369
    },
    studentCount: 320,
    teacherCount: 26,
    establishedYear: 1992
  },
  {
    name: "Szkoła Podstawowa nr 25 im. Marii Konopnickiej",
    type: "primary",
    address: {
      street: "ul. Konopnickiej 16",
      city: "Radom",
      postalCode: "26-600",
      voivodeship: "mazowieckie",
      district: "Gołębiów"
    },
    contact: {
      phone: "+48 48 012 3456",
      email: "sp25@radom.edu.pl",
      website: "https://sp25.radom.pl"
    },
    location: {
      latitude: 51.4027,
      longitude: 21.1471
    },
    studentCount: 390,
    teacherCount: 31,
    establishedYear: 1970
  }
];

async function addPolishSchools() {
  console.log('🇵🇱 Adding realistic Polish school data...\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  
  for (const schoolData of polishSchools) {
    try {
      // Check if school already exists
      const existingSchool = await prisma.school.findFirst({
        where: {
          name: schoolData.name,
          address: {
            path: ['city'],
            equals: schoolData.address.city
          }
        }
      });
      
      if (existingSchool) {
        console.log(`⚠️ School already exists: ${schoolData.name}`);
        skippedCount++;
        continue;
      }
      
      // Create the school
      const school = await prisma.school.create({
        data: {
          name: schoolData.name,
          type: schoolData.type,
          address: schoolData.address,
          contact: schoolData.contact,
          location: schoolData.location,
          studentCount: schoolData.studentCount,
          teacherCount: schoolData.teacherCount,
          establishedYear: schoolData.establishedYear,
          status: 'active'
        }
      });
      
      // Add sample images
      await prisma.schoolImage.createMany({
        data: [
          {
            schoolId: school.id,
            imageUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&h=600&fit=crop",
            imageType: "exterior",
            altText: `${school.name} - widok zewnętrzny`,
            source: "unsplash",
            isVerified: true,
            displayOrder: 1
          },
          {
            schoolId: school.id,
            imageUrl: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800&h=600&fit=crop",
            imageType: "interior",
            altText: `${school.name} - wnętrze`,
            source: "unsplash",
            isVerified: true,
            displayOrder: 2
          }
        ]
      });
      
      console.log(`✅ Added: ${schoolData.name} in ${schoolData.address.city}`);
      addedCount++;
      
    } catch (error) {
      console.error(`❌ Error adding school ${schoolData.name}:`, error.message);
    }
  }
  
  console.log(`\n📊 Summary:`);
  console.log(`✅ Added: ${addedCount} schools`);
  console.log(`⚠️ Skipped: ${skippedCount} schools (already exist)`);
  console.log(`📚 Total processed: ${polishSchools.length} schools`);
  console.log('✅ Polish schools added successfully!');
}

addPolishSchools()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });