'use client';

import React, { useState, useEffect } from 'react';
import { SectionSwitcher } from '@/components/ui/section-switcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Users, GraduationCap, Award, BookOpen, ArrowUpRight } from 'lucide-react';

export default function SectionDemo() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Section Switcher Demo</h1>
        
        <SectionSwitcher className="mb-8">
          {/* Version 1: Card Layout */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Schools - Card Layout</h2>
              <p className="text-gray-600">Discover top-rated schools in your area</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
                  location: "Warszawa, Mazowieckie",
                  rating: 4.8,
                  students: 850,
                  type: "Publiczne",
                  level: "Liceum"
                },
                {
                  name: "Szkoła Podstawowa nr 15",
                  location: "Kraków, Małopolskie",
                  rating: 4.6,
                  students: 420,
                  type: "Publiczne",
                  level: "Podstawowa"
                },
                {
                  name: "Technikum Informatyczne",
                  location: "Gdańsk, Pomorskie",
                  rating: 4.9,
                  students: 650,
                  type: "Publiczne",
                  level: "Technikum"
                }
              ].map((school, index) => (
                <Card key={index} className="hover:shadow-xl transition-shadow duration-300 relative group cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{school.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {school.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-orange-400 text-orange-400 mr-1" />
                        <span className="font-semibold">{school.rating}</span>
                      </div>
                      <Badge variant="secondary">{school.type}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {school.students} uczniów
                      </div>
                      <div className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {school.level}
                      </div>
                    </div>
                    {/* Arrow in bottom right corner */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Version 2: List Layout */}
          <div className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Schools - List Layout</h2>
              <p className="text-gray-600">Comprehensive school information at a glance</p>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
                  location: "Warszawa, Mazowieckie",
                  rating: 4.8,
                  students: 850,
                  type: "Publiczne",
                  level: "Liceum",
                  description: "Renomowane liceum z tradycjami, oferujące szeroki wybór profili kształcenia."
                },
                {
                  name: "Szkoła Podstawowa nr 15",
                  location: "Kraków, Małopolskie",
                  rating: 4.6,
                  students: 420,
                  type: "Publiczne",
                  level: "Podstawowa",
                  description: "Nowoczesna szkoła podstawowa z programami rozwijającymi talenty uczniów."
                },
                {
                  name: "Technikum Informatyczne",
                  location: "Gdańsk, Pomorskie",
                  rating: 4.9,
                  students: 650,
                  type: "Publiczne",
                  level: "Technikum",
                  description: "Wiodące technikum informatyczne z najnowocześniejszym wyposażeniem."
                }
              ].map((school, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300 relative group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{school.name}</h3>
                      <p className="text-gray-600 mb-3">{school.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {school.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {school.students} uczniów
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-1" />
                          {school.level}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex items-center">
                        <Star className="w-5 h-5 fill-orange-400 text-orange-400 mr-1" />
                        <span className="font-bold text-lg">{school.rating}</span>
                      </div>
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        {school.type}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Arrow in bottom right corner */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version 3: Grid with Stats Layout */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Schools - Stats Grid</h2>
              <p className="text-gray-600">Detailed statistics and achievements</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[
                {
                  name: "Liceum Ogólnokształcące im. Adama Mickiewicza",
                  location: "Warszawa, Mazowieckie",
                  rating: 4.8,
                  students: 850,
                  type: "Publiczne",
                  level: "Liceum",
                  achievements: ["Top 10% w regionie", "Program IB", "Olimpiady matematyczne"],
                  passRate: 98,
                  avgScore: 85
                },
                {
                  name: "Szkoła Podstawowa nr 15",
                  location: "Kraków, Małopolskie",
                  rating: 4.6,
                  students: 420,
                  type: "Publiczne",
                  level: "Podstawowa",
                  achievements: ["Certyfikat Zielonej Szkoły", "Program językowy", "Innowacyjna edukacja"],
                  passRate: 95,
                  avgScore: 82
                },
                {
                  name: "Technikum Informatyczne",
                  location: "Gdańsk, Pomorskie",
                  rating: 4.9,
                  students: 650,
                  type: "Publiczne",
                  level: "Technikum",
                  achievements: ["Najlepsze technikum IT", "Współpraca z firmami", "100% zatrudnialność"],
                  passRate: 99,
                  avgScore: 88
                }
              ].slice(0, 2).map((school, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-orange-300 transition-colors duration-300 relative group cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{school.name}</h3>
                      <div className="flex items-center text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        {school.location}
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 fill-orange-400 text-orange-400 mr-1" />
                          <span className="font-semibold">{school.rating}</span>
                        </div>
                        <Badge variant="secondary">{school.type}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{school.students}</div>
                      <div className="text-xs text-gray-600">Uczniów</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <Award className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{school.passRate}%</div>
                      <div className="text-xs text-gray-600">Zdawalność</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{school.avgScore}</div>
                      <div className="text-xs text-gray-600">Śr. wynik</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Osiągnięcia:</h4>
                    <div className="flex flex-wrap gap-2">
                      {school.achievements.map((achievement, i) => (
                        <Badge key={i} variant="outline" className="text-xs border-orange-200 text-orange-700">
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Arrow in bottom right corner */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowUpRight className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionSwitcher>
        
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use Section Switcher</h3>
          <div className="space-y-2 text-gray-600">
            <p>• Click the numbered buttons (1, 2, 3) in the top-right corner to switch between different section layouts</p>
            <p>• Version 1: Clean card layout with essential information</p>
            <p>• Version 2: Detailed list layout with descriptions</p>
            <p>• Version 3: Statistics-focused grid with achievements and metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}