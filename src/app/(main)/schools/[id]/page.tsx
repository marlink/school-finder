import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SchoolDetailClient from './SchoolDetailClient';

export default async function SchoolDetailPage({ params }: { params: { id: string } }) {
  const school = await prisma.school.findUnique({
    where: { id: params.id },
    include: {
      userRatings: true,
      googleRatings: true,
      images: true,
    },
  });

  if (!school) {
    notFound();
  }

  return <SchoolDetailClient params={params} school={school} />;
}
