'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Camera,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleMap } from '@/components/school/GoogleMap';

interface SchoolDetailClientProps {
  params: { id: string };
  school: any;
}

export default function SchoolDetailClient({ params, school }: SchoolDetailClientProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const router = useRouter();

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // Here you would typically make an API call to save the favorite status
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: school.name,
        text: `Sprawdź informacje o ${school.name}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link skopiowany do schowka!');
    }
  };

  const handleNavigation = () => {
    const address = school.address as any;
    const query = encodeURIComponent(`${address?.street}, ${address?.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCall = () => {
    const contact = school.contact as any;
    if (contact?.phone) {
      window.location.href = `tel:${contact.phone}`;
    }
  };

  const handleEmail = () => {
    const contact = school.contact as any;
    if (contact?.email) {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  const handleCompareSchools = () => {
    router.push('/compare');
  };

  const handleAddReview = () => {
    router.push(`/schools/${params.id}/review`);
  };

  // Calculate average user rating
  const avgUserRating = school.userRatings.length > 0 
    ? school.userRatings.reduce((sum: any, rating: any) => sum + Number(rating.overallRating), 0) / school.userRatings.length 
    : null;

  // Extract data from JSON fields
  const address = school.address as any;
  const contact = school.contact as any;
  const location = school.location as any;
  const facilitiesArray = school.facilities ? (school.facilities as string[]) : [];
  const languagesArray = school.languages ? (school.languages as string[]) : [];
  const specializationsArray = school.specializations ? (school.specializations as string[]) : [];

  // Get latest Google rating
  const latestGoogleRating = school.googleRatings.length > 0 
    ? Number(school.googleRatings[0].rating) 
    : null;

  // Mock data for enhanced features
  const photos = [
    { id: 1, url: '/api/placeholder/400/300', alt: 'Budynek główny' },
    { id: 2, url: '/api/placeholder/400/300', alt: 'Sala gimnastyczna' },
    { id: 3, url: '/api/placeholder/400/300', alt: 'Biblioteka' },
    { id: 4, url: '/api/placeholder/400/300', alt: 'Laboratorium' },
  ];

  // Generate random teacher profiles for this school
  const generateTeacherProfiles = () => {
    const teacherNames = [
      'Dr Anna Kowalska', 'Mgr Piotr Nowak', 'Dr hab. Maria Wiśniewska', 
      'Mgr Tomasz Wójcik', 'Dr Katarzyna Kamińska', 'Mgr Jan Lewandowski',
      'Dr Agnieszka Zielińska', 'Mgr Michał Szymański', 'Dr Magdalena Dąbrowska'
    ];
    
    const subjects = [
      'Matematyka', 'Język polski', 'Historia', 'Biologia', 'Chemia', 
      'Fizyka', 'Geografia', 'Język angielski', 'Informatyka', 'Plastyka',
      'Wychowanie fizyczne', 'Muzyka', 'Język niemiecki'
    ];
    
    const descriptions = [
      'Pasjonatka nauczania z wieloletnim doświadczeniem w pracy z młodzieżą. Specjalizuje się w nowoczesnych metodach nauczania i wykorzystaniu technologii w edukacji. Absolwentka studiów pedagogicznych na Uniwersytecie Warszawskim, autorka licznych publikacji naukowych.',
      'Doświadczony pedagog z ponad 15-letnim stażem. Prowadzi zajęcia dodatkowe i koła zainteresowań. Laureat konkursu "Nauczyciel Roku" w województwie. Aktywnie uczestniczy w projektach edukacyjnych i współpracy międzynarodowej.',
      'Młody, energiczny nauczyciel z nowatorskim podejściem do edukacji. Organizuje projekty interdyscyplinarne i warsztaty dla uczniów. Absolwent prestiżowej uczelni, kontynuuje studia doktoranckie. Popularyzator nauki wśród młodzieży.',
      'Doświadczona nauczycielka z pasją do swojego przedmiotu. Prowadzi zajęcia wyrównawcze i przygotowuje uczniów do olimpiad przedmiotowych. Mentorka młodych pedagogów, aktywna w organizacjach zawodowych. Autorka podręczników i materiałów dydaktycznych.',
      'Specjalista w dziedzinie edukacji włączającej i pracy z uczniami o specjalnych potrzebach edukacyjnych. Ukończyła liczne kursy i szkolenia z zakresu pedagogiki specjalnej. Współpracuje z poradniami psychologiczno-pedagogicznymi.'
    ];

    const numTeachers = Math.floor(Math.random() * 2) + 2; // 2-3 teachers
    const selectedTeachers = [];
    const usedNames = new Set();
    const usedSubjects = new Set();

    for (let i = 0; i < numTeachers; i++) {
      let name, subject;
      
      do {
        name = teacherNames[Math.floor(Math.random() * teacherNames.length)];
      } while (usedNames.has(name));
      
      do {
        subject = subjects[Math.floor(Math.random() * subjects.length)];
      } while (usedSubjects.has(subject));
      
      usedNames.add(name);
      usedSubjects.add(subject);
      
      selectedTeachers.push({
        id: i + 1,
        name,
        subject,
        description: descriptions[Math.floor(Math.random() * descriptions.length)],
        experience: Math.floor(Math.random() * 20) + 5 + ' lat',
        education: Math.random() > 0.5 ? 'Magister' : 'Doktor'
      });
    }

    return selectedTeachers;
  };

  const teacherProfiles = generateTeacherProfiles();

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
                    <Badge variant="outline">
                      Szkoła publiczna
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">
                    {address?.street}, {address?.city}
                    {address?.postal && `, ${address.postal}`}
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

                {latestGoogleRating && (
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Google</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-gray-900">{latestGoogleRating}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= latestGoogleRating! ? "text-blue-400 fill-current" : "text-gray-300"
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
              <Button 
                onClick={handleFavoriteToggle}
                className={cn(
                  "shadow-lg transition-all duration-200",
                  isFavorite 
                    ? "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white" 
                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                )}
              >
                <Heart className={cn("h-4 w-4 mr-2", isFavorite && "fill-current")} />
                {isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
              </Button>
              <Button onClick={handleShare} variant="outline" className="border-gray-300">
                <Share2 className="h-4 w-4 mr-2" />
                Udostępnij
              </Button>
              <Button onClick={handleNavigation} variant="outline" className="border-gray-300">
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

            {/* Google Map */}
            <GoogleMap 
              address={{
                street: address?.street,
                city: address?.city,
                postalCode: address?.postal,
                voivodeship: address?.voivodeship
              }}
              schoolName={school.name}
              className="shadow-lg border-0 bg-white/80 backdrop-blur-sm"
            />

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

            {/* Teacher Profiles */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-500" />
                  Kadra nauczycielska
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {teacherProfiles.map((teacher) => (
                    <div key={teacher.id} className="border border-gray-100 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full text-white flex-shrink-0">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">{teacher.name}</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                {teacher.subject}
                              </Badge>
                              <Badge variant="outline" className="border-gray-300">
                                {teacher.education}
                              </Badge>
                              <Badge variant="outline" className="border-gray-300">
                                {teacher.experience}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700 leading-relaxed text-sm">
                            {teacher.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Ratings Section */}
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
                  <Button 
                    onClick={handleAddReview}
                    variant="outline" 
                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                  >
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
                      {address?.street}<br />
                      {address?.postal} {address?.city}
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
                    <Button 
                      onClick={handleCall}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Zadzwoń
                    </Button>
                  )}
                  {contact?.email && (
                    <Button 
                      onClick={handleEmail}
                      variant="outline" 
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Wyślij email
                    </Button>
                  )}
                  <Button 
                    onClick={handleNavigation}
                    variant="outline" 
                    className="w-full border-gray-300"
                  >
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
                <Button 
                  onClick={() => alert('Funkcja godzin otwarcia będzie dostępna wkrótce')}
                  variant="outline" 
                  className="w-full justify-start border-orange-200 hover:bg-orange-50"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Godziny otwarcia
                </Button>
                <Button 
                  onClick={handleCompareSchools}
                  variant="outline" 
                  className="w-full justify-start border-orange-200 hover:bg-orange-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Porównaj szkoły
                </Button>
                <Button 
                  onClick={() => alert('Program nauczania będzie dostępny wkrótce')}
                  variant="outline" 
                  className="w-full justify-start border-orange-200 hover:bg-orange-50"
                >
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
                  <Button 
                    onClick={() => router.push('/schools')}
                    variant="outline" 
                    size="sm" 
                    className="border-gray-300"
                  >
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