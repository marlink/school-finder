import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Heart, Star, Settings, Bell, Mail, Phone, MapPin, 
  Edit3, Trash2, ExternalLink, Calendar, Clock, Save 
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    location: 'Seattle, WA',
    joinDate: 'January 15, 2024',
    avatar: '/api/placeholder/150/150',
    preferences: {
      notifications: true,
      emailUpdates: true,
      searchRadius: '10 miles',
      schoolTypes: ['Public', 'Private'],
      grades: ['Elementary', 'Middle School']
    }
  };

  const favoriteSchools = [
    {
      id: 'westview-elementary',
      name: 'Westview Elementary School',
      type: 'Public',
      grade: 'Elementary',
      rating: 4.5,
      distance: '2.3 miles',
      address: '1234 Maple Street, Seattle, WA',
      savedDate: '2024-01-20',
      notes: 'Great STEM program, close to home'
    },
    {
      id: 'central-high',
      name: 'Central High School',
      type: 'Public',
      grade: 'High School',
      rating: 4.3,
      distance: '3.1 miles',
      address: '5678 Oak Avenue, Seattle, WA',
      savedDate: '2024-01-18',
      notes: 'Excellent college prep programs'
    },
    {
      id: 'st-mary-academy',
      name: 'St. Mary Academy',
      type: 'Private',
      grade: 'Middle School',
      rating: 4.7,
      distance: '1.8 miles',
      address: '9012 Pine Road, Seattle, WA',
      savedDate: '2024-01-15',
      notes: 'Small class sizes, strong academics'
    }
  ];

  const searchHistory = [
    { query: 'Elementary schools near me', date: '2024-01-22', results: 15 },
    { query: 'Private schools Seattle', date: '2024-01-20', results: 8 },
    { query: 'High schools with robotics', date: '2024-01-18', results: 12 },
    { query: 'STEM programs elementary', date: '2024-01-15', results: 21 }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Member since {user.joinDate}</p>
              </div>
            </div>
            <Button>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="favorites" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Heart className="h-5 w-5 mr-2" />
                    Saved Schools ({favoriteSchools.length})
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {favoriteSchools.map((school) => (
                    <div key={school.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Link 
                              href={`/schools/${school.id}`}
                              className="text-lg font-semibold text-blue-600 hover:underline"
                            >
                              {school.name}
                            </Link>
                            <Badge variant={school.type === 'Public' ? 'default' : 'secondary'}>
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
                          
                          {school.notes && (
                            <p className="text-sm text-gray-700 italic">"{school.notes}"</p>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            Saved on {school.savedDate}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button size="sm" variant="outline">
                            <Edit3 className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {favoriteSchools.length === 0 && (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No saved schools yet</h3>
                      <p className="text-gray-600 mb-4">Start exploring schools and save your favorites to compare later.</p>
                      <Link href="/search">
                        <Button>Find Schools</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Search History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {searchHistory.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{search.query}</div>
                        <div className="text-sm text-gray-600">{search.results} results found</div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{search.date}</span>
                        <Button size="sm" variant="outline">Search Again</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" defaultValue={user.name} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue={user.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" type="tel" defaultValue={user.phone} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue={user.location} />
                  </div>
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Search Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="radius">Search Radius</Label>
                    <Input id="radius" defaultValue={user.preferences.searchRadius} />
                  </div>
                  <div className="space-y-2">
                    <Label>School Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Public', 'Private', 'Charter', 'Magnet'].map((type) => (
                        <Badge 
                          key={type} 
                          variant={user.preferences.schoolTypes.includes(type) ? 'default' : 'outline'}
                          className="cursor-pointer"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade Levels</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Elementary', 'Middle School', 'High School'].map((grade) => (
                        <Badge 
                          key={grade} 
                          variant={user.preferences.grades.includes(grade) ? 'default' : 'outline'}
                          className="cursor-pointer"
                        >
                          {grade}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates about new schools and features</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user.preferences.emailUpdates ? 'Disable' : 'Enable'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified about saved school updates</p>
                  </div>
                  <Button variant="outline" size="sm">
                    {user.preferences.notifications ? 'Disable' : 'Enable'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Weekly Digest</h3>
                    <p className="text-sm text-gray-600">Summary of new schools in your area</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">School Events</h3>
                    <p className="text-sm text-gray-600">Open houses and enrollment deadlines</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
