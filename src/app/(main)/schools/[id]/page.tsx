import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SchoolDetailClient from './SchoolDetailClient';

export default async function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
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
}
