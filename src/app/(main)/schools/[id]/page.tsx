import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SchoolDetailClient from './SchoolDetailClient';

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  try {
    const school = await prisma.school.findUnique({
      where: { id: resolvedParams.id },
      include: {
        userRatings: true,
        googleRatings: true,
        images: true,
      },
    });

    if (!school) {
      notFound();
    }

    return <SchoolDetailClient params={resolvedParams} school={school} />;
  } catch (error) {
    console.error('Database connection error:', error);
    
    // Return mock data for testing when database is not available
    const mockSchool = {
      id: resolvedParams.id,
      name: "Przykładowa Szkoła Podstawowa",
      type: "PODSTAWOWA",
      address: {
        street: "ul. Przykładowa 123",
        city: "Katowice",
        postalCode: "40-001",
        region: "śląskie"
      },
      contact: {
        phone: "+48 32 123 45 67",
        email: "kontakt@przykladowa-szkola.edu.pl",
        website: "https://przykladowa-szkola.edu.pl"
      },
      location: {
        latitude: 50.2649,
        longitude: 19.0238
      },
      facilities: ["Biblioteka", "Sala gimnastyczna", "Laboratorium komputerowe"],
      languages: ["Polski", "Angielski", "Niemiecki"],
      specializations: ["Matematyka", "Informatyka"],
      userRatings: [],
      googleRatings: [],
      images: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return <SchoolDetailClient params={resolvedParams} school={mockSchool} />;
  }
}
