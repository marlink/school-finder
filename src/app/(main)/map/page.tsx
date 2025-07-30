import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { SchoolsMap } from '@/components/school/SchoolsMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, School, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

async function getSchoolsWithCoordinates() {
  try {
    const schools = await prisma.school.findMany({
      where: {
        status: 'active',
        location: {
          not: null
        }
      },
      include: {
        googleRatings: {
          orderBy: {
            scrapedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    return [];
  }
}

function SchoolsList({ schools }: { schools: any[] }) {
  return (
    <div className="space-y-4">
      {schools.map((school) => {
        const address = school.address as any;
        const location = school.location as any;
        const googleRating = school.googleRatings && school.googleRatings.length > 0 
          ? Number(school.googleRatings[0].rating) 
          : null;

        return (
          <Card key={school.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Link 
                      href={`/schools/${school.id}`}
                      className="text-lg font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {school.name}
                    </Link>
                    <Badge variant="secondary" className="text-xs">
                      {school.type}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    {address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {[address.street, address.city, address.postal]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {school.studentCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{school.studentCount} uczniów</span>
                      </div>
                    )}
                    
                    {googleRating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{googleRating}/5 (Google)</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <Link
                    href={`/schools/${school.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Zobacz szczegóły →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function LoadingMap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Mapa szkół
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Ładowanie mapy...</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function MapPage() {
  const schools = await getSchoolsWithCoordinates();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mapa szkół podstawowych
        </h1>
        <p className="text-gray-600">
          Znajdź szkoły podstawowe w Twojej okolicy na interaktywnej mapie
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Suspense fallback={<LoadingMap />}>
            <SchoolsMap 
              schools={schools} 
              height="600px"
              showControls={true}
            />
          </Suspense>
        </div>

        {/* Schools List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-blue-600" />
                Lista szkół ({schools.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              {schools.length > 0 ? (
                <SchoolsList schools={schools} />
              ) : (
                <div className="text-center py-8">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Brak szkół do wyświetlenia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <School className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{schools.length}</div>
            <div className="text-sm text-gray-600">Szkół na mapie</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {schools.reduce((sum, school) => sum + (school.studentCount || 0), 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Łączna liczba uczniów</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {schools.filter(s => s.googleRatings?.length > 0).length}
            </div>
            <div className="text-sm text-gray-600">Szkół z ocenami Google</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}