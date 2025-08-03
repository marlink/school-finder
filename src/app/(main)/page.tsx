"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SearchForm, { SearchParams } from "@/components/SearchForm";
import { 
  GraduationCap, 
  MapPin, 
  Star, 
  Users, 
  TrendingUp,
  Award,
  BookOpen,
  Heart,
  ArrowRight,
  Sparkles,
  Target,
  Shield
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const handleSearch = (searchParams: SearchParams) => {
    // Search functionality redirects to search page with parameters
    // This is handled by the SearchForm component internally
  };

  const featuredSchools = [
    {
      id: "1",
      name: "Liceum Ogólnokształcące im. Mikołaja Kopernika",
      location: "Warszawa, Mazowieckie",
      rating: 4.8,
      type: "Liceum",
      students: 850,
      image: "/img/schkola-1.jpg"
    },
    {
      id: "2", 
      name: "Szkoła Podstawowa nr 15",
      location: "Kraków, Małopolskie",
      rating: 4.6,
      type: "Szkoła Podstawowa",
      students: 420,
      image: "/img/mama.jpeg"
    },
    {
      id: "3",
      name: "Technikum Informatyczne",
      location: "Gdańsk, Pomorskie",
      rating: 4.7,
      type: "Technikum",
      students: 650,
      image: "/img/schkola-2.jpg"
    }
  ];

  const popularRegions = [
    { name: "Mazowieckie", schools: 2847, slug: "mazowieckie" },
    { name: "Śląskie", schools: 1923, slug: "slaskie" },
    { name: "Wielkopolskie", schools: 1456, slug: "wielkopolskie" },
    { name: "Małopolskie", schools: 1234, slug: "malopolskie" },
    { name: "Dolnośląskie", schools: 1098, slug: "dolnoslaskie" },
    { name: "Pomorskie", schools: 876, slug: "pomorskie" },
    { name: "Łódzkie", schools: 743, slug: "lodzkie" },
    { name: "Lubelskie", schools: 654, slug: "lubelskie" },
    { name: "Kujawsko-pomorskie", schools: 587, slug: "kujawsko-pomorskie" },
    { name: "Podkarpackie", schools: 523, slug: "podkarpackie" },
    { name: "Warmińsko-mazurskie", schools: 456, slug: "warminsko-mazurskie" },
    { name: "Zachodniopomorskie", schools: 398, slug: "zachodniopomorskie" },
    { name: "Podlaskie", schools: 321, slug: "podlaskie" },
    { name: "Świętokrzyskie", schools: 287, slug: "swietokrzyskie" },
    { name: "Lubuskie", schools: 234, slug: "lubuskie" },
    { name: "Opolskie", schools: 198, slug: "opolskie" }
  ];

  const stats = [
    { icon: GraduationCap, label: "Szkół w bazie", value: "12,847", color: "from-blue-500 to-blue-600" },
    { icon: Users, label: "Aktywnych użytkowników", value: "45,231", color: "from-green-500 to-green-600" },
    { icon: Star, label: "Średnia ocena", value: "4.2", color: "from-yellow-500 to-yellow-600" },
    { icon: MapPin, label: "Miast", value: "2,477", color: "from-purple-500 to-purple-600" }
  ];

  const features = [
    {
      icon: Target,
      title: "Precyzyjne wyszukiwanie",
      description: "Znajdź szkołę idealnie dopasowaną do potrzeb Twojego dziecka"
    },
    {
      icon: Shield,
      title: "Zweryfikowane opinie",
      description: "Prawdziwe recenzje od rodziców i uczniów"
    },
    {
      icon: Sparkles,
      title: "Inteligentne porównania",
      description: "Porównuj szkoły według różnych kryteriów"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-20 md:py-32 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-orange-200 to-red-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full blur-3xl opacity-20"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-orange-200 mb-6">
              <Sparkles className="w-4 h-4 text-orange-500 mr-2" />
              <span className="text-sm font-medium text-orange-700">Najlepszy portal edukacyjny w Polsce</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Znajdź <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">idealną szkołę</span> 
              <br />dla swojego dziecka
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Przeglądaj tysiące szkół w Polsce, czytaj opinie rodziców i uczniów, 
              porównuj placówki i podejmuj świadome decyzje o edukacji.
            </p>

            {/* Feature highlights */}
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center justify-center space-x-3 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="max-w-5xl mx-auto mb-16 relative z-[10000]" data-tour="home-search">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
              <SearchForm onSearch={handleSearch} variant="hero" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/80 transition-all duration-300 group">
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Schools */}
      <section className="py-20 bg-white" data-tour="featured-schools">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 rounded-full mb-6">
              <Award className="w-4 h-4 text-orange-600 mr-2" />
              <span className="text-sm font-medium text-orange-700">Najwyżej oceniane</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Najlepiej oceniane szkoły
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sprawdź placówki, które otrzymały najwyższe oceny od rodziców i uczniów
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredSchools.map((school, index) => (
              <Card key={school.id} className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={school.image}
                    alt={school.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-700 border-0 shadow-lg">
                      {school.type}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-bold text-gray-700">{school.rating}</span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="font-bold text-xl mb-3 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {school.name}
                  </h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                    <span className="text-sm font-medium">{school.location}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600 mb-6">
                    <Users className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm font-medium">{school.students} uczniów</span>
                  </div>
                  
                  <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 border-0 shadow-lg group">
                    <Link href={`/schools/${school.id}`} className="flex items-center justify-center">
                      Zobacz szczegóły
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild variant="outline" size="lg" className="border-2 border-orange-200 hover:bg-orange-50 hover:border-orange-300 px-8 py-3">
              <Link href="/search" className="flex items-center">
                Zobacz wszystkie szkoły
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Regions */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Eksploruj regiony</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Popularne regiony
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Przeglądaj szkoły według województw i odkryj najlepsze placówki w swojej okolicy
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {popularRegions.map((region, index) => (
              <Link 
                key={region.slug}
                href={`/regions/${region.slug}`}
                className="group bg-white rounded-2xl p-4 text-center hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-orange-200 hover:-translate-y-1"
              >
                <div className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                  {region.name}
                </div>
                <div className="text-sm text-gray-500 font-medium">
                  {region.schools.toLocaleString()} szkół
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline" size="lg" className="border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 px-8 py-3">
              <Link href="/regions" className="flex items-center">
                Zobacz wszystkie regiony
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-red-500">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Gotowy na znalezienie idealnej szkoły?
            </h2>
            <p className="text-xl text-orange-100 mb-10 leading-relaxed">
              Dołącz do tysięcy rodziców, którzy już znaleźli najlepszą edukację dla swoich dzieci
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold">
                <Link href="/search" className="flex items-center">
                  Rozpocznij wyszukiwanie
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg font-semibold">
                <Link href="/about">
                  Dowiedz się więcej
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
