import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Users, GraduationCap, Search, Star, Heart, ExternalLink, Phone, Mail, Globe } from 'lucide-react';
import Link from 'next/link';

interface RegionPageProps {
  params: Promise<{
    region: string;
  }>;
}

export default async function RegionPage({ params }: RegionPageProps) {
  const { region } = await params;
  
  // Type definitions
  interface RegionData {
    name: string;
    description: string;
    totalSchools: number;
    publicSchools: number;
    privateSchools: number;
    avgRating: number;
    population: string;
    demographics: {
      medianIncome: string;
      homeOwnership: string;
      diversity: string;
    };
    features: string[];
  }

  interface School {
    id: string;
    name: string;
    type: string;
    level: string;
    grades: string;
    enrollment: number;
    rating: number;
    address: string;
    phone: string;
    website: string;
    highlights: string[];
    distance: string;
  }

  // Polish voivodeships data
  const regionsData: Record<string, RegionData> = {
    'mazowieckie': {
      name: 'Mazowieckie',
      description: 'Województwo mazowieckie to największe województwo w Polsce, z Warszawą jako stolicą. Oferuje najszerszą gamę możliwości edukacyjnych, od szkół podstawowych po renomowane uniwersytety.',
      totalSchools: 3247,
      publicSchools: 2890,
      privateSchools: 357,
      avgRating: 4.3,
      population: '5.4M',
      demographics: {
        medianIncome: '6,500 zł',
        homeOwnership: '72%',
        diversity: 'Wysoka'
      },
      features: ['Transport publiczny', 'Muzea', 'Parki', 'Biblioteki', 'Obiekty sportowe', 'Uniwersytety']
    },
    'slaskie': {
      name: 'Śląskie',
      description: 'Województwo śląskie to region o bogatych tradycjach przemysłowych i edukacyjnych. Katowice i okoliczne miasta oferują wysokiej jakości szkolnictwo z naciskiem na nauki techniczne.',
      totalSchools: 2156,
      publicSchools: 1890,
      privateSchools: 266,
      avgRating: 4.2,
      population: '4.5M',
      demographics: {
        medianIncome: '5,800 zł',
        homeOwnership: '68%',
        diversity: 'Średnia'
      },
      features: ['Przemysł', 'Uczelnie techniczne', 'Centra kultury', 'Parki technologiczne']
    },
    'wielkopolskie': {
      name: 'Wielkopolskie',
      description: 'Województwo wielkopolskie z Poznaniem jako centrum oferuje doskonałe możliwości edukacyjne. Region znany z wysokich standardów nauczania i innowacyjnych programów edukacyjnych.',
      totalSchools: 1987,
      publicSchools: 1720,
      privateSchools: 267,
      avgRating: 4.4,
      population: '3.5M',
      demographics: {
        medianIncome: '6,200 zł',
        homeOwnership: '75%',
        diversity: 'Wysoka'
      },
      features: ['Uniwersytety', 'Centra biznesowe', 'Parki', 'Muzea', 'Transport']
    },
    'malopolskie': {
      name: 'Małopolskie',
      description: 'Województwo małopolskie z Krakowem jako stolicą to region o długich tradycjach edukacyjnych. Oferuje szeroką gamę szkół o wysokim standardzie nauczania.',
      totalSchools: 1876,
      publicSchools: 1609,
      privateSchools: 267,
      avgRating: 4.5,
      population: '3.4M',
      demographics: {
        medianIncome: '6,100 zł',
        homeOwnership: '73%',
        diversity: 'Wysoka'
      },
      features: ['Tradycje akademickie', 'Programy humanistyczne', 'Rozwój kulturalny', 'Wysokie standardy']
    },
    'dolnoslaskie': {
      name: 'Dolnośląskie',
      description: 'Województwo dolnośląskie z Wrocławiem jako centrum to dynamicznie rozwijający się region edukacyjny. Oferuje nowoczesne szkoły z naciskiem na innowacje.',
      totalSchools: 1654,
      publicSchools: 1432,
      privateSchools: 222,
      avgRating: 4.3,
      population: '2.9M',
      demographics: {
        medianIncome: '5,900 zł',
        homeOwnership: '70%',
        diversity: 'Średnia'
      },
      features: ['Nowoczesne technologie', 'Programy innowacyjne', 'Rozwój przedsiębiorczości', 'Współpraca z biznesem']
    },
    'pomorskie': {
      name: 'Pomorskie',
      description: 'Województwo pomorskie z Gdańskiem jako stolicą oferuje wysokiej jakości edukację nad Bałtykiem. Region znany z programów morskich i technicznych.',
      totalSchools: 1234,
      publicSchools: 1089,
      privateSchools: 145,
      avgRating: 4.2,
      population: '2.3M',
      demographics: {
        medianIncome: '5,700 zł',
        homeOwnership: '69%',
        diversity: 'Średnia'
      },
      features: ['Programy morskie', 'Edukacja techniczna', 'Współpraca z portami', 'Programy językowe']
    },
    'lodzkie': {
      name: 'Łódzkie',
      description: 'Województwo łódzkie z Łodzią jako centrum to region o bogatych tradycjach przemysłowych i tekstylnych. Oferuje różnorodne możliwości edukacyjne.',
      totalSchools: 1123,
      publicSchools: 987,
      privateSchools: 136,
      avgRating: 4.1,
      population: '2.4M',
      demographics: {
        medianIncome: '5,400 zł',
        homeOwnership: '67%',
        diversity: 'Średnia'
      },
      features: ['Przemysł tekstylny', 'Centra logistyczne', 'Uczelnie techniczne', 'Kultura']
    },
    'lubelskie': {
      name: 'Lubelskie',
      description: 'Województwo lubelskie z Lublinem jako stolicą to region o bogatych tradycjach akademickich. Znane z wysokiej jakości edukacji humanistycznej.',
      totalSchools: 987,
      publicSchools: 876,
      privateSchools: 111,
      avgRating: 4.2,
      population: '2.1M',
      demographics: {
        medianIncome: '5,200 zł',
        homeOwnership: '74%',
        diversity: 'Niska'
      },
      features: ['Tradycje akademickie', 'Programy humanistyczne', 'Kultura', 'Historia']
    },
    'kujawsko-pomorskie': {
      name: 'Kujawsko-Pomorskie',
      description: 'Województwo kujawsko-pomorskie z Bydgoszczą i Toruniem jako głównymi ośrodkami. Region oferuje zrównoważony rozwój edukacyjny.',
      totalSchools: 876,
      publicSchools: 765,
      privateSchools: 111,
      avgRating: 4.0,
      population: '2.0M',
      demographics: {
        medianIncome: '5,100 zł',
        homeOwnership: '71%',
        diversity: 'Średnia'
      },
      features: ['Przemysł spożywczy', 'Uczelnie', 'Transport', 'Kultura']
    },
    'podkarpackie': {
      name: 'Podkarpackie',
      description: 'Województwo podkarpackie z Rzeszowem jako stolicą. Region znany z rozwoju lotnictwa i nowoczesnych technologii.',
      totalSchools: 765,
      publicSchools: 678,
      privateSchools: 87,
      avgRating: 4.1,
      population: '2.1M',
      demographics: {
        medianIncome: '5,000 zł',
        homeOwnership: '76%',
        diversity: 'Niska'
      },
      features: ['Przemysł lotniczy', 'Nowoczesne technologie', 'Tradycje', 'Przyroda']
    },
    'warminsko-mazurskie': {
      name: 'Warmińsko-Mazurskie',
      description: 'Województwo warmińsko-mazurskie z Olsztynem jako stolicą. Region Mazur oferuje edukację w otoczeniu pięknej przyrody.',
      totalSchools: 654,
      publicSchools: 587,
      privateSchools: 67,
      avgRating: 3.9,
      population: '1.4M',
      demographics: {
        medianIncome: '4,900 zł',
        homeOwnership: '73%',
        diversity: 'Niska'
      },
      features: ['Turystyka', 'Przyroda', 'Jeziora', 'Rolnictwo']
    },
    'zachodniopomorskie': {
      name: 'Zachodniopomorskie',
      description: 'Województwo zachodniopomorskie ze Szczecinem jako stolicą. Region nadmorski oferujący edukację z naciskiem na gospodarkę morską.',
      totalSchools: 543,
      publicSchools: 478,
      privateSchools: 65,
      avgRating: 4.0,
      population: '1.7M',
      demographics: {
        medianIncome: '5,300 zł',
        homeOwnership: '68%',
        diversity: 'Średnia'
      },
      features: ['Gospodarka morska', 'Porty', 'Turystyka', 'Przemysł']
    },
    'podlaskie': {
      name: 'Podlaskie',
      description: 'Województwo podlaskie z Białymstokiem jako stolicą. Region znany z różnorodności kulturowej i wysokiej jakości edukacji.',
      totalSchools: 432,
      publicSchools: 387,
      privateSchools: 45,
      avgRating: 4.1,
      population: '1.2M',
      demographics: {
        medianIncome: '4,800 zł',
        homeOwnership: '75%',
        diversity: 'Wysoka'
      },
      features: ['Różnorodność kulturowa', 'Przyroda', 'Tradycje', 'Ekologia']
    },
    'swietokrzyskie': {
      name: 'Świętokrzyskie',
      description: 'Województwo świętokrzyskie z Kielcami jako stolicą. Region o bogatej historii oferujący solidne podstawy edukacyjne.',
      totalSchools: 398,
      publicSchools: 356,
      privateSchools: 42,
      avgRating: 3.9,
      population: '1.2M',
      demographics: {
        medianIncome: '4,700 zł',
        homeOwnership: '74%',
        diversity: 'Niska'
      },
      features: ['Historia', 'Tradycje', 'Przemysł', 'Kultura']
    },
    'lubuskie': {
      name: 'Lubuskie',
      description: 'Województwo lubuskie z Gorzowem Wielkopolskim i Zieloną Górą. Region oferujący edukację w zielonym otoczeniu.',
      totalSchools: 321,
      publicSchools: 287,
      privateSchools: 34,
      avgRating: 3.8,
      population: '1.0M',
      demographics: {
        medianIncome: '4,900 zł',
        homeOwnership: '72%',
        diversity: 'Niska'
      },
      features: ['Zieleń', 'Winnice', 'Przyroda', 'Turystyka']
    },
    'opolskie': {
      name: 'Opolskie',
      description: 'Województwo opolskie z Opolem jako stolicą. Najmniejsze województwo oferujące kameralne warunki edukacyjne.',
      totalSchools: 287,
      publicSchools: 254,
      privateSchools: 33,
      avgRating: 4.0,
      population: '0.9M',
      demographics: {
        medianIncome: '5,000 zł',
        homeOwnership: '73%',
        diversity: 'Średnia'
      },
      features: ['Małe klasy', 'Indywidualne podejście', 'Tradycje', 'Kultura']
    }
  };

  const regionData = regionsData[region] || {
    name: region.charAt(0).toUpperCase() + region.slice(1),
    description: 'Brak danych dla tego województwa.',
    totalSchools: 0,
    publicSchools: 0,
    privateSchools: 0,
    avgRating: 0,
    population: '0',
    demographics: {
      medianIncome: 'Brak danych',
      homeOwnership: 'Brak danych',
      diversity: 'Brak danych'
    },
    features: []
  };

  // Mock schools data for Polish voivodeships
  const schoolsData: Record<string, School[]> = {
    'mazowieckie': [
      {
        id: 'staszic-liceum',
        name: 'XIV Liceum Ogólnokształcące im. Stanisława Staszica',
        type: 'Publiczna',
        level: 'Liceum',
        grades: 'I-III',
        enrollment: 850,
        rating: 4.8,
        address: 'ul. Narbutta 13, 02-541 Warszawa',
        phone: '(22) 849-35-91',
        website: 'staszic.edu.pl',
        highlights: ['Klasy matematyczne', 'Programy IB', 'Olimpiady', 'Języki obce'],
        distance: '2.3 km'
      },
      {
        id: 'sp25-warszawa',
        name: 'Szkoła Podstawowa nr 25',
        type: 'Publiczna',
        level: 'Podstawowa',
        grades: 'I-VIII',
        enrollment: 420,
        rating: 4.5,
        address: 'ul. Kasprzaka 18, 01-211 Warszawa',
        phone: '(22) 632-15-47',
        website: 'sp25.waw.pl',
        highlights: ['Małe klasy', 'Program muzyczny', 'Ogród szkolny', 'Czytanie'],
        distance: '1.8 km'
      },
      {
        id: 'pls-warszawa',
        name: 'Prywatne Liceum Społeczne',
        type: 'Prywatna',
        level: 'Liceum',
        grades: 'I-III',
        enrollment: 180,
        rating: 4.9,
        address: 'ul. Mokotowska 33, 00-560 Warszawa',
        phone: '(22) 621-45-78',
        website: 'pls.edu.pl',
        highlights: ['Nauczanie projektowe', 'Małe klasy', 'Przygotowanie do matury', 'Laboratorium'],
        distance: '3.1 km'
      }
    ],
    'slaskie': [
      {
        id: 'mickiewicz-katowice',
        name: 'III Liceum Ogólnokształcące im. Adama Mickiewicza',
        type: 'Publiczna',
        level: 'Liceum',
        grades: 'I-III',
        enrollment: 720,
        rating: 4.7,
        address: 'ul. Mickiewicza 11, 40-092 Katowice',
        phone: '(32) 251-34-67',
        website: 'mickiewicz.katowice.pl',
        highlights: ['Klasy techniczne', 'Programy zawodowe', 'Współpraca z przemysłem', 'Nowoczesne laboratoria'],
        distance: '1.5 km'
      }
    ],
    'wielkopolskie': [
      {
        id: 'marcinkowski-poznan',
        name: 'I Liceum Ogólnokształcące im. Karola Marcinkowskiego',
        type: 'Publiczna',
        level: 'Liceum',
        grades: 'I-III',
        enrollment: 680,
        rating: 4.6,
        address: 'ul. Marcinkowskiego 12, 61-745 Poznań',
        phone: '(61) 852-34-91',
        website: 'marcinkowski.poznan.pl',
        highlights: ['Programy językowe', 'Wymiana międzynarodowa', 'Klasy humanistyczne', 'Teatr szkolny'],
        distance: '2.1 km'
      }
    ]
  };

  const schools = schoolsData[region] || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Szkoły w województwie {regionData.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              {regionData.description}
            </p>
            
            {/* Region Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{regionData.totalSchools}</div>
                <div className="text-sm text-gray-600">Łączna liczba szkół</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{regionData.avgRating}</div>
                <div className="text-sm text-gray-600">Średnia ocena</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{regionData.population}</div>
                <div className="text-sm text-gray-600">Populacja</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">{regionData.demographics.medianIncome}</div>
                <div className="text-sm text-gray-600">Średni dochód</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Search and Filters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Wyszukaj szkoły</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Wyszukaj szkoły..." className="pl-10" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Typ szkoły</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie typy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Wszystkie typy</SelectItem>
                        <SelectItem value="public">Publiczna</SelectItem>
                        <SelectItem value="private">Prywatna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Poziom nauczania</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Wszystkie poziomy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Wszystkie poziomy</SelectItem>
                        <SelectItem value="elementary">Podstawowa</SelectItem>
                        <SelectItem value="middle">Gimnazjum</SelectItem>
                        <SelectItem value="high">Liceum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimalna ocena</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Dowolna ocena" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Dowolna ocena</SelectItem>
                        <SelectItem value="4">4+ gwiazdek</SelectItem>
                        <SelectItem value="3">3+ gwiazdek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Region Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cechy regionu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {regionData.features.map((feature: string) => (
                      <div key={feature} className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Znaleziono {schools.length} szkół
              </h2>
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sortuj według..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Najwyżej oceniane</SelectItem>
                  <SelectItem value="distance">Najbliższe</SelectItem>
                  <SelectItem value="enrollment">Wielkość szkoły</SelectItem>
                  <SelectItem value="name">Nazwa A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {schools.map((school: School) => (
                <Card key={school.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{school.name}</h3>
                          <Badge variant={school.type === 'Publiczna' ? 'default' : 'secondary'}>
                            {school.type}
                          </Badge>
                          <Badge variant="outline">{school.level}</Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {renderStars(school.rating)}
                            <span className="ml-1 text-sm text-gray-600">
                              {school.rating} ({school.enrollment} uczniów)
                            </span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{school.distance}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Adres</div>
                            <div className="text-sm">{school.address}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600 mb-1">Klasy</div>
                            <div className="text-sm">{school.grades}</div>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <div className="text-sm text-gray-600 mb-2">Wyróżnienia</div>
                          <div className="flex flex-wrap gap-2">
                            {school.highlights.map((highlight: string) => (
                              <Badge key={highlight} variant="outline" className="text-xs">
                                {highlight}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button size="sm" variant="outline">
                          <Heart className="h-4 w-4 mr-1" />
                          Zapisz
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Odwiedź
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {school.phone}
                        </div>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          {school.website}
                        </div>
                      </div>
                      
                      <Link href={`/schools/${school.id}`}>
                        <Button variant="default">
                          Zobacz szczegóły
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" disabled>Poprzednia</Button>
                <Button variant="default">1</Button>
                <Button variant="outline">2</Button>
                <Button variant="outline">3</Button>
                <Button variant="outline">Następna</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
