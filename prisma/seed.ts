import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Sample school data for demonstration
  const schools = [
    {
      name: 'Szkoła Podstawowa im. Jana Pawła II',
      type: 'primary',
      address: {
        street: 'ul. Główna 15',
        city: 'Warszawa',
        postal: '00-001',
        voivodeship: 'mazowieckie',
        district: 'Śródmieście'
      },
      contact: {
        phone: '+48 22 123 45 67',
        email: 'sekretariat@sp-jpii.edu.pl',
        website: 'www.sp-jpii.edu.pl',
        fax: '+48 22 123 45 68'
      },
      location: {
        latitude: 52.2297,
        longitude: 21.0122
      },
      studentCount: 485,
      teacherCount: 27,
      establishedYear: 1985,
      languages: ['polish', 'english'],
      specializations: ['STEM Program', 'Arts Integration', 'Dual Language'],
      facilities: ['Library/Media Center', 'Computer Lab', 'Science Labs', 'Art Studio', 'Music Room', 'Gymnasium', 'Cafeteria', 'Playground', 'Garden Area']
    },
    {
      name: 'Liceum Ogólnokształcące im. Marii Curie-Skłodowskiej',
      type: 'high_school',
      address: {
        street: 'ul. Szkolna 8',
        city: 'Kraków',
        postal: '30-001',
        voivodeship: 'małopolskie',
        district: 'Stare Miasto'
      },
      contact: {
        phone: '+48 12 234 56 78',
        email: 'biuro@lo-mcs.edu.pl',
        website: 'www.lo-mcs.edu.pl',
        fax: '+48 12 234 56 79'
      },
      location: {
        latitude: 50.0647,
        longitude: 19.9450
      },
      studentCount: 1250,
      teacherCount: 78,
      establishedYear: 1952,
      languages: ['polish', 'english', 'german', 'french'],
      specializations: ['AP Programs', 'Robotics Club', 'College Prep', 'Championship Sports', 'Performing Arts'],
      facilities: ['Library/Media Center', 'Computer Lab', 'Science Labs', 'Art Studio', 'Music Room', 'Gymnasium', 'Cafeteria', 'Auditorium', 'Athletic Fields', 'Tennis Courts']
    },
    {
      name: 'Technikum Informatyczne im. Alana Turinga',
      type: 'technical',
      address: {
        street: 'ul. Technologiczna 42',
        city: 'Gdańsk',
        postal: '80-001',
        voivodeship: 'pomorskie',
        district: 'Wrzeszcz'
      },
      contact: {
        phone: '+48 58 345 67 89',
        email: 'sekretariat@ti-turing.edu.pl',
        website: 'www.ti-turing.edu.pl',
        fax: '+48 58 345 67 90'
      },
      location: {
        latitude: 54.3520,
        longitude: 18.6466
      },
      studentCount: 890,
      teacherCount: 45,
      establishedYear: 1995,
      languages: ['polish', 'english'],
      specializations: ['Computer Science', 'Robotics', 'AI & Machine Learning', 'Cybersecurity', 'Web Development'],
      facilities: ['Computer Labs', 'Server Room', 'Maker Space', 'Library', 'Cafeteria', 'Sports Hall', 'Conference Room']
    },
    {
      name: 'Przedszkole Montessori "Słoneczko"',
      type: 'kindergarten',
      address: {
        street: 'ul. Kwiatowa 23',
        city: 'Wrocław',
        postal: '50-001',
        voivodeship: 'dolnośląskie',
        district: 'Krzyki'
      },
      contact: {
        phone: '+48 71 456 78 90',
        email: 'kontakt@sloneczko-montessori.pl',
        website: 'www.sloneczko-montessori.pl',
        fax: null
      },
      location: {
        latitude: 51.1079,
        longitude: 17.0385
      },
      studentCount: 95,
      teacherCount: 12,
      establishedYear: 2010,
      languages: ['polish', 'english'],
      specializations: ['Montessori Method', 'Bilingual Education', 'Nature-based Learning', 'Creative Arts'],
      facilities: ['Classrooms', 'Play Areas', 'Garden', 'Kitchen', 'Art Studio', 'Music Room', 'Library Corner']
    },
    {
      name: 'Gimnazjum im. Mikołaja Kopernika',
      type: 'middle_school',
      address: {
        street: 'ul. Astronomiczna 17',
        city: 'Poznań',
        postal: '60-001',
        voivodeship: 'wielkopolskie',
        district: 'Stare Miasto'
      },
      contact: {
        phone: '+48 61 567 89 01',
        email: 'sekretariat@gim-kopernik.edu.pl',
        website: 'www.gim-kopernik.edu.pl',
        fax: '+48 61 567 89 02'
      },
      location: {
        latitude: 52.4064,
        longitude: 16.9252
      },
      studentCount: 675,
      teacherCount: 42,
      establishedYear: 1975,
      languages: ['polish', 'english', 'german'],
      specializations: ['Science Focus', 'Mathematics Olympiad', 'History & Geography', 'Sports Excellence'],
      facilities: ['Science Labs', 'Library', 'Computer Room', 'Sports Hall', 'Cafeteria', 'Assembly Hall', 'Art Room']
    }
  ];

  console.log('📚 Creating schools...');
  
  for (const schoolData of schools) {
    const school = await prisma.school.create({
      data: schoolData
    });

    // Add some sample images for each school
    await prisma.schoolImage.createMany({
      data: [
        {
          schoolId: school.id,
          imageUrl: '/api/placeholder/800/600',
          imageType: 'main',
          altText: `${school.name} - main building`,
          source: 'admin',
          isVerified: true,
          displayOrder: 1
        },
        {
          schoolId: school.id,
          imageUrl: '/api/placeholder/600/400',
          imageType: 'classroom',
          altText: `${school.name} - classroom`,
          source: 'admin',
          isVerified: true,
          displayOrder: 2
        },
        {
          schoolId: school.id,
          imageUrl: '/api/placeholder/600/400',
          imageType: 'playground',
          altText: `${school.name} - playground`,
          source: 'admin',
          isVerified: true,
          displayOrder: 3
        }
      ]
    });

    // Add some sample Google ratings
    const ratingCount = Math.floor(Math.random() * 15) + 5; // 5-20 ratings
    for (let i = 0; i < ratingCount; i++) {
      await prisma.ratingsGoogle.create({
        data: {
          schoolId: school.id,
          googleReviewId: `google_review_${school.id}_${i}`,
          rating: Math.random() * 2 + 3, // Rating between 3-5
          reviewText: `Great school with excellent teachers and facilities. My child loves attending here.`,
          authorName: `Parent ${i + 1}`,
          reviewDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000) // Random date within last year
        }
      });
    }

    // Add some portal sentiment analysis
    await prisma.ratingsPortal.create({
      data: {
        schoolId: school.id,
        sentiment: Math.random() * 0.6 + 0.2, // Sentiment between 0.2-0.8
        keywords: {
          positive: ['excellent teachers', 'great facilities', 'caring staff', 'good education'],
          negative: ['parking issues', 'old building'],
          neutral: ['average class size', 'standard curriculum']
        }
      }
    });

    console.log(`✅ Created school: ${school.name}`);
  }

  // Create a sample admin user (you'll need to sign in with Google/GitHub first)
  console.log('👤 Sample schools created successfully!');
  console.log('');
  console.log('📝 To create an admin user:');
  console.log('1. Start the app: npm run dev');
  console.log('2. Sign in with Google/GitHub');
  console.log('3. Update your user role to "admin" in the database');
  console.log('4. Access admin features at /admin');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log(`📊 Created ${schools.length} schools with sample data`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
