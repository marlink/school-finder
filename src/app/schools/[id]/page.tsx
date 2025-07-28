import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star, 
  Users, 
  Calendar,
  GraduationCap,
  Languages,
  Award,
  Building,
  Heart,
  Share2,
  Navigation,
  Clock,
  BookOpen,
  Wifi,
  Car,
  Utensils,
  Activity,
  Shield,
  Camera
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Calculate average user rating
  const avgUserRating = school.userRatings.length > 0 
    ? school.userRatings.reduce((sum, rating) => sum + Number(rating.overallRating), 0) / school.userRatings.length 
    : null;

  // Get latest Google rating
  const latestGoogleRating = school.googleRatings.length > 0 
    ? Number(school.googleRatings[0].rating) 
    : null;

  // Extract data from JSON fields
  const address = school.address as any;
  const contact = school.contact as any;
  const facilitiesArray = school.facilities ? (school.facilities as string[]) : [];
  const languagesArray = school.languages ? (school.languages as string[]) : [];
  const specializationsArray = school.specializations ? (school.specializations as string[]) : [];

  // Mock data for enhanced features
  const photos = [
    { id: 1, url: '/api/placeholder/400/300', alt: 'Budynek główny' },
    { id: 2, url: '/api/placeholder/400/300', alt: 'Sala gimnastyczna' },
    { id: 3, url: '/api/placeholder/400/300', alt: 'Biblioteka' },
    { id: 4, url: '/api/placeholder/400/300', alt: 'Laboratorium' },
  ];

  const facilityIcons: Record<string, React.ReactNode> = {
    'Biblioteka': <BookOpen className="h-4 w-4" />,
    'Sala gimnastyczna': <Activity className="h-4 w-4" />,
    'Laboratorium komputerowe': <Wifi className="h-4 w-4" />,
    'Parking': <Car className="h-4 w-4" />,
    'Stołówka': <Utensils className="h-4 w-4" />,
    'Boisko sportowe': <Activity className="h-4 w-4" />,
    'Sala konferencyjna': <Building className="h-4 w-4" />,
    'Ochrona': <Shield className="h-4 w-4" />,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {school.name}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {school.type}
                    </Badge>
                    {school.isPublic !== null && (
                      <Badge variant={school.isPublic ? "default" : "outline"}>
                        {school.isPublic ? 'Publiczna' : 'Prywatna'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {school.address}, {school.city}
                    {school.postalCode && `, ${school.postalCode}`}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {school.studentCount && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Uczniowie</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{school.studentCount}</p>
                  </div>
                )}
                
                {school.establishedYear && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Założona</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{school.establishedYear}</p>
                  </div>
                )}

                {avgUserRating && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ocena użytkowników</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{avgUserRating.toFixed(1)}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= avgUserRating ? "text-yellow-400 fill-current" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {school.googleRating && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Google</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{school.googleRating}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= school.googleRating! ? "text-blue-400 fill-current" : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 lg:w-48">
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg">
                <Heart className="h-4 w-4 mr-2" />
                Dodaj do ulubionych
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Navigation className="h-4 w-4 mr-2" />
                Nawigacja
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Photo Gallery */}
            <Card className="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-orange-500" />
                  Galeria zdjęć
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo, index) => (
                    <div 
                      key={photo.id} 
                      className={cn(
                        "relative rounded-lg overflow-hidden group cursor-pointer",
                        index === 0 ? "col-span-2 aspect-video" : "aspect-square"
                      )}
                    >
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                      <div className="absolute bottom-2 left-2 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {photo.alt}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Academic Focus */}
            {(languagesArray.length > 0 || specializationsArray.length > 0) && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" />
                    Profil edukacyjny
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {languagesArray.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Languages className="h-4 w-4 text-green-500" />
                        Języki obce
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {languagesArray.map((language, index) => (
                          <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {language}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {specializationsArray.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-purple-500" />
                        Specjalizacje
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {specializationsArray.map((spec, index) => (
                          <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Facilities */}
            {facilitiesArray.length > 0 && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-500" />
                    Infrastruktura i udogodnienia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {facilitiesArray.map((facility, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {facilityIcons[facility] || <Building className="h-4 w-4 text-gray-500" />}
                        </div>
                        <span className="text-sm font-medium text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews Section */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Opinie i oceny
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Brak opinii użytkowników</p>
                  <Button variant="outline" className="border-orange-300 text-orange-600 hover:bg-orange-50">
                    Dodaj pierwszą opinię
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Kontakt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900">Adres</p>
                    <p className="text-sm text-gray-600">
                      {school.address}<br />
                      {school.postalCode} {school.city}
                    </p>
                  </div>
                </div>

                {contact?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Telefon</p>
                      <a href={`tel:${contact.phone}`} className="text-sm text-blue-600 hover:text-blue-800">
                        {contact.phone}
                      </a>
                    </div>
                  </div>
                )}

                {contact?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:text-blue-800 break-all">
                        {contact.email}
                      </a>
                    </div>
                  </div>
                )}

                {contact?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Strona internetowa</p>
                      <a 
                        href={contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm text-blue-600 hover:text-blue-800 break-all"
                      >
                        {contact.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-3">
                  {contact?.phone && (
                    <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                      <Phone className="h-4 w-4 mr-2" />
                      Zadzwoń
                    </Button>
                  )}
                  {contact?.email && (
                    <Button variant="outline" className="w-full border-blue-300 text-blue-600 hover:bg-blue-50">
                      <Mail className="h-4 w-4 mr-2" />
                      Wyślij email
                    </Button>
                  )}
                  <Button variant="outline" className="w-full border-gray-300">
                    <Navigation className="h-4 w-4 mr-2" />
                    Pokaż na mapie
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
              <CardHeader>
                <CardTitle className="text-lg">Szybkie akcje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50">
                  <Clock className="h-4 w-4 mr-2" />
                  Godziny otwarcia
                </Button>
                <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50">
                  <Users className="h-4 w-4 mr-2" />
                  Porównaj szkoły
                </Button>
                <Button variant="outline" className="w-full justify-start border-orange-200 hover:bg-orange-50">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Program nauczania
                </Button>
              </CardContent>
            </Card>

            {/* Similar Schools */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Podobne szkoły</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-3">Wkrótce pokażemy podobne szkoły w okolicy</p>
                  <Button variant="outline" size="sm" className="border-gray-300">
                    Szukaj podobnych
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
