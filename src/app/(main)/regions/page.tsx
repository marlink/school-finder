import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Users, GraduationCap, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegionsPage() {
  // Polish voivodeships data
  const regions = [
    {
      id: 'mazowieckie',
      name: 'Mazowieckie',
      capital: 'Warszawa',
      totalSchools: 2850,
      publicSchools: 2450,
      privateSchools: 400,
      avgRating: 4.3,
      population: '5,400,000',
      description: 'Największe województwo Polski z Warszawą jako stolicą. Centrum biznesu i edukacji.',
      featured: true
    },
    {
      id: 'slaskie',
      name: 'Śląskie',
      capital: 'Katowice',
      totalSchools: 2100,
      publicSchools: 1800,
      privateSchools: 300,
      avgRating: 4.2,
      population: '4,500,000',
      description: 'Przemysłowy region z silną tradycją edukacyjną i nowoczesnymi szkołami.',
      featured: true
    },
    {
      id: 'wielkopolskie',
      name: 'Wielkopolskie',
      capital: 'Poznań',
      totalSchools: 1650,
      publicSchools: 1400,
      privateSchools: 250,
      avgRating: 4.4,
      population: '3,500,000',
      description: 'Region z bogatą historią i wysokim poziomem edukacji, szczególnie w Poznaniu.',
      featured: true
    },
    {
      id: 'malopolskie',
      name: 'Małopolskie',
      capital: 'Kraków',
      totalSchools: 1580,
      publicSchools: 1350,
      privateSchools: 230,
      avgRating: 4.5,
      population: '3,400,000',
      description: 'Historyczne centrum Polski z Krakowem - miastem uniwersyteckim o światowej renomie.',
      featured: true
    },
    {
      id: 'dolnoslaskie',
      name: 'Dolnośląskie',
      capital: 'Wrocław',
      totalSchools: 1420,
      publicSchools: 1200,
      privateSchools: 220,
      avgRating: 4.3,
      population: '2,900,000',
      description: 'Dynamicznie rozwijający się region z Wrocławiem jako centrum edukacyjnym.',
      featured: false
    },
    {
      id: 'pomorskie',
      name: 'Pomorskie',
      capital: 'Gdańsk',
      totalSchools: 1180,
      publicSchools: 1000,
      privateSchools: 180,
      avgRating: 4.2,
      population: '2,300,000',
      description: 'Nadmorski region z Trójmiastem oferującym wysokiej jakości edukację.',
      featured: false
    },
    {
      id: 'lubelskie',
      name: 'Lubelskie',
      capital: 'Lublin',
      totalSchools: 980,
      publicSchools: 850,
      privateSchools: 130,
      avgRating: 4.1,
      population: '2,100,000',
      description: 'Wschodni region Polski z silną tradycją akademicką w Lublinie.',
      featured: false
    },
    {
      id: 'zachodniopomorskie',
      name: 'Zachodniopomorskie',
      capital: 'Szczecin',
      totalSchools: 850,
      publicSchools: 720,
      privateSchools: 130,
      avgRating: 4.0,
      population: '1,700,000',
      description: 'Nadmorski region zachodni z rozwijającym się sektorem edukacyjnym.',
      featured: false
    },
    {
      id: 'lodzkie',
      name: 'Łódzkie',
      capital: 'Łódź',
      totalSchools: 1200,
      publicSchools: 1050,
      privateSchools: 150,
      avgRating: 4.1,
      population: '2,450,000',
      description: 'Centralny region z Łodzią jako ważnym ośrodkiem edukacyjnym i kulturalnym.',
      featured: false
    },
    {
      id: 'kujawsko-pomorskie',
      name: 'Kujawsko-Pomorskie',
      capital: 'Bydgoszcz/Toruń',
      totalSchools: 980,
      publicSchools: 850,
      privateSchools: 130,
      avgRating: 4.0,
      population: '2,070,000',
      description: 'Region z dwoma stolicami oferującymi różnorodne możliwości edukacyjne.',
      featured: false
    },
    {
      id: 'podlaskie',
      name: 'Podlaskie',
      capital: 'Białystok',
      totalSchools: 650,
      publicSchools: 580,
      privateSchools: 70,
      avgRating: 4.0,
      population: '1,180,000',
      description: 'Północno-wschodni region z Białymstokiem jako centrum edukacyjnym.',
      featured: false
    },
    {
      id: 'warminsko-mazurskie',
      name: 'Warmińsko-Mazurskie',
      capital: 'Olsztyn',
      totalSchools: 720,
      publicSchools: 620,
      privateSchools: 100,
      avgRating: 3.9,
      population: '1,430,000',
      description: 'Kraina Tysiąca Jezior z Olsztynem jako głównym ośrodkiem edukacyjnym.',
      featured: false
    },
    {
      id: 'lubuskie',
      name: 'Lubuskie',
      capital: 'Gorzów Wlkp./Zielona Góra',
      totalSchools: 520,
      publicSchools: 450,
      privateSchools: 70,
      avgRating: 3.9,
      population: '1,010,000',
      description: 'Zachodni region z dwoma stolicami i rozwijającym się systemem edukacji.',
      featured: false
    },
    {
      id: 'podkarpackie',
      name: 'Podkarpackie',
      capital: 'Rzeszów',
      totalSchools: 980,
      publicSchools: 850,
      privateSchools: 130,
      avgRating: 4.1,
      population: '2,130,000',
      description: 'Południowo-wschodni region z Rzeszowem jako dynamicznie rozwijającym się centrum.',
      featured: false
    },
    {
      id: 'swietokrzyskie',
      name: 'Świętokrzyskie',
      capital: 'Kielce',
      totalSchools: 620,
      publicSchools: 540,
      privateSchools: 80,
      avgRating: 4.0,
      population: '1,240,000',
      description: 'Centralny region z Kielcami jako głównym ośrodkiem edukacyjnym.',
      featured: false
    },
    {
      id: 'opolskie',
      name: 'Opolskie',
      capital: 'Opole',
      totalSchools: 480,
      publicSchools: 420,
      privateSchools: 60,
      avgRating: 4.0,
      population: '990,000',
      description: 'Najmniejsze województwo z Opolem oferującym wysokiej jakości edukację.',
      featured: false
    }
  ];

  const featuredRegions = regions.filter(region => region.featured);
  const allRegions = regions.sort((a, b) => b.totalSchools - a.totalSchools);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Województwa Polski</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Odkryj szkoły w swoim regionie. Przeglądaj województwa, aby znaleźć idealne możliwości edukacyjne.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <div className="mb-12">
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Szukaj województw..." 
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Featured Regions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popularne Województwa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredRegions.map((region) => (
              <Card key={region.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <div className="w-full h-48 bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                    <MapPin className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{region.name}</h3>
                      <p className="text-gray-600">Stolica: {region.capital}</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Popularne
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{region.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{region.totalSchools}</div>
                      <div className="text-sm text-gray-600">Szkół</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{region.avgRating}</div>
                      <div className="text-sm text-gray-600">Średnia ocena</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>Publiczne: {region.publicSchools}</span>
                    <span>Prywatne: {region.privateSchools}</span>
                    <span>Ludność: {region.population}</span>
                  </div>
                  
                  <Link href={`/regions/${region.id}`}>
                    <Button className="w-full bg-orange-600 hover:bg-orange-700" onClick={() => window.location.href = '/search'}>
                      <Search className="h-4 w-4 mr-2" />
                      Explore Schools
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Regions */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Wszystkie Województwa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allRegions.map((region) => (
              <Card key={region.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{region.name}</h3>
                      <p className="text-gray-600">{region.capital}</p>
                    </div>
                    {region.featured && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Popularne
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-orange-600">{region.totalSchools}</div>
                      <div className="text-xs text-gray-600">Szkół</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{region.avgRating}</div>
                      <div className="text-xs text-gray-600">Ocena</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{region.population}</div>
                      <div className="text-xs text-gray-600">Ludność</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{region.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-4">
                    <span>Publiczne: {region.publicSchools}</span>
                    <span>Prywatne: {region.privateSchools}</span>
                  </div>
                  
                  <Link href={`/regions/${region.id}`}>
                    <Button variant="outline" className="w-full">
                      Zobacz szkoły
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
