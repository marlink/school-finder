'use client';

import { useState, useEffect } from 'react';
import { SchoolComparison } from '@/components/school/school-comparison';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  TrendingUp, 
  Star, 
  MapPin,
  X,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';

export const dynamic = 'force-dynamic';

// Mock school data - in real app this would come from API
const MOCK_SCHOOLS = [
  {
    id: '1',
    name: 'International School of Warsaw',
    type: 'Private',
    address: {
      street: 'ul. Wiertnicza 9',
      city: 'Warsaw',
      voivodeship: 'Mazovian',
      postal: '02-952'
    },
    contact: {
      phone: '+48 22 123 456',
      email: 'info@isw.edu.pl',
      website: 'https://isw.edu.pl'
    },
    studentCount: 850,
    teacherCount: 68,
    establishedYear: 1992,
    languages: ['English', 'Polish', 'French', 'German'],
    specializations: ['IB Programme', 'STEM', 'Arts'],
    facilities: ['Science Labs', 'Library', 'Sports Hall', 'Swimming Pool'],
    extracurricular: ['Drama Club', 'Robotics', 'Football', 'Debate Team'],
    avgUserRating: 4.5,
    avgGoogleRating: 4.3,
    userRatingCount: 45,
    googleRatingCount: 128,
    distance: 5.2,
    mainImage: '/api/placeholder/300/200',
    fees: {
      tuition: 45000,
      registration: 2500
    },
    schedule: {
      startTime: '08:00',
      endTime: '15:30'
    },
    transport: {
      busRoutes: ['Route A', 'Route B'],
      parking: true,
      bikeStorage: true
    },
    sentimentAnalysis: {
      sentiment: 0.75,
      positiveKeywords: ['excellent teachers', 'great facilities'],
      negativeKeywords: ['expensive']
    }
  },
  {
    id: '2',
    name: 'Warsaw Academy of Sciences',
    type: 'Public',
    address: {
      street: 'ul. Naukowa 15',
      city: 'Warsaw',
      voivodeship: 'Mazovian',
      postal: '01-234'
    },
    contact: {
      phone: '+48 22 987 654',
      email: 'contact@was.edu.pl'
    },
    studentCount: 1200,
    teacherCount: 85,
    establishedYear: 1985,
    languages: ['Polish', 'English', 'Russian'],
    specializations: ['Mathematics', 'Physics', 'Chemistry'],
    facilities: ['Advanced Labs', 'Library', 'Auditorium'],
    extracurricular: ['Math Olympiad', 'Science Fair', 'Chess Club'],
    avgUserRating: 4.1,
    avgGoogleRating: 4.0,
    userRatingCount: 67,
    googleRatingCount: 89,
    distance: 3.8,
    mainImage: '/api/placeholder/300/200',
    schedule: {
      startTime: '08:00',
      endTime: '14:30'
    },
    transport: {
      busRoutes: ['Route 1', 'Route 3', 'Route 7'],
      parking: false,
      bikeStorage: true
    },
    sentimentAnalysis: {
      sentiment: 0.45,
      positiveKeywords: ['strong academics', 'dedicated teachers'],
      negativeKeywords: ['limited resources', 'old building']
    }
  }
];

export default function ComparePage() {
  const { user, isAuthenticated } = useUser();
  const [selectedSchools, setSelectedSchools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableSchools, setAvailableSchools] = useState(MOCK_SCHOOLS);

  // Load comparison from localStorage on mount
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('school-comparison');
      if (saved) {
        try {
          const schoolIds = JSON.parse(saved);
          const schools = MOCK_SCHOOLS.filter(school => schoolIds.includes(school.id));
          setSelectedSchools(schools);
        } catch (error) {
          console.error('Error loading comparison from localStorage:', error);
        }
      }
    }
  }, []);

  // Save comparison to localStorage when selectedSchools changes
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const schoolIds = selectedSchools.map(school => school.id);
      localStorage.setItem('school-comparison', JSON.stringify(schoolIds));
    }
  }, [selectedSchools]);

  const addSchoolToComparison = (school: any) => {
    if (selectedSchools.length >= 4) {
      alert('You can compare up to 4 schools at a time.');
      return;
    }
    
    if (!selectedSchools.find(s => s.id === school.id)) {
      setSelectedSchools(prev => [...prev, school]);
    }
  };

  const removeSchoolFromComparison = (schoolId: string) => {
    setSelectedSchools(prev => prev.filter(school => school.id !== schoolId));
  };

  const clearComparison = () => {
    setSelectedSchools([]);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('school-comparison');
    }
  };

  const filteredSchools = availableSchools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.address.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    school.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                School Comparison
              </h1>
              <p className="mt-2 text-gray-600">
                Compare schools side by side to make informed decisions
              </p>
            </div>
            
            {selectedSchools.length > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  {selectedSchools.length}/4 schools selected
                </Badge>
                <Button variant="outline" onClick={clearComparison}>
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* School Selection */}
        {selectedSchools.length < 4 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Add Schools to Compare
              </CardTitle>
              <p className="text-sm text-gray-600">
                Search and select schools to add to your comparison (up to 4 schools)
              </p>
            </CardHeader>
            <CardContent>
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search schools by name, city, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Available Schools */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSchools
                  .filter(school => !selectedSchools.find(s => s.id === school.id))
                  .map((school) => (
                    <Card key={school.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* School Name & Type */}
                          <div>
                            <h3 className="font-semibold text-gray-900 line-clamp-2">
                              {school.name}
                            </h3>
                            <Badge variant="secondary" className="text-xs mt-1">
                              {school.type}
                            </Badge>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {school.address.city}, {school.address.voivodeship}
                            {school.distance && (
                              <span className="text-blue-600 ml-1">
                                • {school.distance} km
                              </span>
                            )}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {renderStars(school.avgUserRating || school.avgGoogleRating || 0)}
                            </div>
                            <span className="text-sm text-gray-600">
                              {(school.avgUserRating || school.avgGoogleRating || 0).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({school.userRatingCount + school.googleRatingCount} reviews)
                            </span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{school.studentCount} students</span>
                            <span>{school.teacherCount} teachers</span>
                          </div>

                          {/* Add Button */}
                          <Button
                            size="sm"
                            onClick={() => addSchoolToComparison(school)}
                            className="w-full"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Compare
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              {filteredSchools.filter(school => !selectedSchools.find(s => s.id === school.id)).length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    {searchQuery ? 'No schools found matching your search.' : 'All available schools are already selected.'}
                  </p>
                  {searchQuery && (
                    <Button 
                      variant="link" 
                      onClick={() => setSearchQuery('')}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        <SchoolComparison
          schools={selectedSchools}
          onRemoveSchool={removeSchoolFromComparison}
        />

        {/* Empty State Actions */}
        {selectedSchools.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Start Comparing Schools
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Add schools from your favorites, search results, or browse available schools to start comparing their features, ratings, and key information.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/search">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Schools to Compare
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => alert('Export functionality coming soon!')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Comparison
                </Button>
                {isAuthenticated && (
                  <Link href="/favorites">
                    <Button variant="outline">
                      View Favorites
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
