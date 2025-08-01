'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Heart, Star, Search, Filter, Grid, List, MapPin, Calendar, 
  Edit3, Trash2, ExternalLink, Download, Share2, GitCompare,
  SortAsc, SortDesc, Eye, BookOpen, Users, Trophy, Clock, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { useUser } from '@/hooks/useUser';
import { FavoriteButton } from '@/components/FavoriteButton';

export default function FavoritesPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  const { user, isAuthenticated } = useUser();

  if (!isClient) {
    return null;
  }
  const { favorites, loading, error, removeFavorite } = useFavorites();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterType, setFilterType] = useState('all');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const getSchoolTypeImage = (schoolType?: string) => {
    if (!schoolType) return '/img/podstawowka.jpg';
    
    switch (schoolType.toLowerCase()) {
      case 'primary':
      case 'podstawowa':
      case 'elementary':
        return '/img/mama.jpeg';
      case 'secondary':
      case 'gimnazjum':
      case 'middle':
        return '/img/mama-2.jpeg';
      case 'high':
      case 'liceum':
      case 'technikum':
      case 'technical':
        return '/img/schkola-1.jpg';
      case 'university':
      case 'uniwersytet':
      case 'college':
        return '/img/uniwerek.jpg';
      default:
        return '/img/podstawowka.jpg';
    }
  };

  // If not logged in, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Sign in to view favorites
            </h3>
            <p className="text-gray-600 mb-4">
              You need to be logged in to save and view favorite schools.
            </p>
            <Button onClick={() => window.location.href = '/handler/signin'}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorite schools...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Heart className="h-12 w-12 text-red-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading favorites
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform favorites data for display
  const favoriteSchools = favorites.map(fav => ({
    id: fav.schoolId,
    name: fav.school.name,
    type: fav.school.type,
    grade: fav.school.type, // Using type as grade for now
    rating: 4.5, // Default rating, should be from school data
    distance: '-- km',
    address: `${fav.school.address.street || ''}, ${fav.school.address.city}, ${fav.school.address.voivodeship}`,
    savedDate: new Date(fav.createdAt).toLocaleDateString(),
    notes: fav.notes || '',
    enrollment: 0, // Default, should be from school data
    studentTeacherRatio: '--',
    specialPrograms: [],
    image: fav.school.images?.[0]?.imageUrl || getSchoolTypeImage(fav.school.type)
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const filteredAndSortedSchools = favoriteSchools
    .filter(school => {
      const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           school.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || school.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'distance':
          aValue = parseFloat(a.distance);
          bValue = parseFloat(b.distance);
          break;
        case 'savedDate':
          aValue = new Date(a.savedDate);
          bValue = new Date(b.savedDate);
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const handleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const SchoolCard = ({ school }: { school: any }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video bg-gray-200 relative">
        <img 
          src={school.image} 
          alt={school.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            size="sm"
            variant={selectedSchools.includes(school.id) ? "default" : "outline"}
            onClick={() => handleSchoolSelection(school.id)}
          >
            <GitCompare className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          </Button>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link 
            href={`/schools/${school.id}`}
            className="text-lg font-semibold text-blue-600 hover:underline flex-1"
          >
            {school.name}
          </Link>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={school.type === 'Public' ? 'default' : school.type === 'Private' ? 'secondary' : 'outline'}>
            {school.type}
          </Badge>
          <Badge variant="outline">{school.grade}</Badge>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            {renderStars(school.rating)}
            <span className="ml-1 text-sm text-gray-600">{school.rating}</span>
          </div>
          <span className="text-gray-400">•</span>
          <span className="text-sm text-gray-600">{school.distance}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="h-4 w-4 mr-1" />
          {school.address}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {school.enrollment} students
          </div>
          <div className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1" />
            {school.studentTeacherRatio}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {school.specialPrograms.slice(0, 2).map((program: string) => (
            <Badge key={program} variant="outline" className="text-xs">
              {program}
            </Badge>
          ))}
          {school.specialPrograms.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{school.specialPrograms.length - 2} more
            </Badge>
          )}
        </div>
        
        {school.notes && (
          <p className="text-sm text-gray-700 italic mb-3">"{school.notes}"</p>
        )}
        
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Calendar className="h-3 w-3 mr-1" />
          Saved on {school.savedDate}
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline">
            <Edit3 className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const SchoolListItem = ({ school }: { school: any }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
            <img 
              src={school.image} 
              alt={school.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <Link 
                  href={`/schools/${school.id}`}
                  className="text-lg font-semibold text-blue-600 hover:underline"
                >
                  {school.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={school.type === 'Public' ? 'default' : school.type === 'Private' ? 'secondary' : 'outline'}>
                    {school.type}
                  </Badge>
                  <Badge variant="outline">{school.grade}</Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={selectedSchools.includes(school.id) ? "default" : "outline"}
                  onClick={() => handleSchoolSelection(school.id)}
                >
                  <GitCompare className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center">
                {renderStars(school.rating)}
                <span className="ml-1 text-sm text-gray-600">{school.rating}</span>
              </div>
              <span className="text-sm text-gray-600">{school.distance}</span>
              <span className="text-sm text-gray-600">{school.enrollment} students</span>
              <span className="text-sm text-gray-600">{school.studentTeacherRatio}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {school.address}
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              {school.specialPrograms.slice(0, 3).map((program: string) => (
                <Badge key={program} variant="outline" className="text-xs">
                  {program}
                </Badge>
              ))}
              {school.specialPrograms.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{school.specialPrograms.length - 3} more
                </Badge>
              )}
            </div>
            
            {school.notes && (
              <p className="text-sm text-gray-700 italic mb-2">"{school.notes}"</p>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                Saved on {school.savedDate}
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/'}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert('Edit functionality coming soon!')}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => alert('Delete functionality coming soon!')}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Heart className="h-8 w-8 mr-3 text-red-500" />
                My Favorite Schools
              </h1>
              <p className="mt-2 text-gray-600">
                Manage and compare your saved schools ({favoriteSchools.length} schools)
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {selectedSchools.length > 0 && (
                <Button onClick={() => window.location.href = '/compare'}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Compare ({selectedSchools.length})
                </Button>
              )}
              <Button variant="outline" onClick={() => alert('Export functionality coming soon!')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => alert('Share functionality coming soon!')}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search schools or addresses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              {/* Filters */}
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="School Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Public">Public</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                    <SelectItem value="Charter">Charter</SelectItem>
                  </SelectContent>
                </Select>
                
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                    <SelectItem value="savedDate">Date Saved</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
                
                <div className="flex rounded-md border">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {filteredAndSortedSchools.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedSchools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          ) : (
            <div>
              {filteredAndSortedSchools.map((school) => (
                <SchoolListItem key={school.id} school={school} />
              ))}
            </div>
          )
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterType !== 'all' 
                  ? 'No schools match your filters' 
                  : 'No saved schools yet'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your search or filters to see more results.'
                  : 'Start exploring schools and save your favorites to compare later.'
                }
              </p>
              <Link href="/search">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Find Schools
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
