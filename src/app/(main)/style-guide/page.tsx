'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Heart, 
  Download, 
  Search, 
  Settings, 
  User, 
  Mail, 
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function StyleGuidePage() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            School Finder Style Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A comprehensive design system featuring clean layouts, light colors with white and orange shades, 
            subtle shadows, and beautiful components that work on both light and dark backgrounds.
          </p>
        </div>

        {/* Color Palette */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Color Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Primary Colors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-600 shadow-sm"></div>
                      <div>
                        <div className="font-medium">Purple Primary</div>
                        <div className="text-sm text-gray-500">#6200ee</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-800 shadow-sm"></div>
                      <div>
                        <div className="font-medium">Black Secondary</div>
                        <div className="text-sm text-gray-500">#333333</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Orange Shades */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Orange Shades</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'Orange 50', color: 'bg-orange-50', hex: '#fff8f1' },
                      { name: 'Orange 100', color: 'bg-orange-100', hex: '#fff3e6' },
                      { name: 'Orange 200', color: 'bg-orange-200', hex: '#ffd9b3' },
                      { name: 'Orange 300', color: 'bg-orange-300', hex: '#ffb366' },
                      { name: 'Orange 400', color: 'bg-orange-400', hex: '#ff8c1a' },
                      { name: 'Orange 500', color: 'bg-orange-500', hex: '#ff6600' },
                    ].map((color) => (
                      <div key={color.name} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded ${color.color} shadow-sm border`}></div>
                        <div className="text-sm">
                          <div className="font-medium">{color.name}</div>
                          <div className="text-gray-500">{color.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Neutral Colors */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Neutral Colors</h3>
                  <div className="space-y-2">
                    {[
                      { name: 'White', color: 'bg-white border', hex: '#ffffff' },
                      { name: 'Gray 100', color: 'bg-gray-100', hex: '#f5f5f5' },
                      { name: 'Gray 200', color: 'bg-gray-200', hex: '#e0e0e0' },
                      { name: 'Gray 400', color: 'bg-gray-400', hex: '#a0a0a0' },
                      { name: 'Gray 600', color: 'bg-gray-600', hex: '#606060' },
                      { name: 'Gray 800', color: 'bg-gray-800', hex: '#333333' },
                    ].map((color) => (
                      <div key={color.name} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded ${color.color} shadow-sm`}></div>
                        <div className="text-sm">
                          <div className="font-medium">{color.name}</div>
                          <div className="text-gray-500">{color.hex}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Typography */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Typography</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900">Heading 1 - Extra Bold</h1>
                  <p className="text-sm text-gray-500 mt-1">text-4xl font-extrabold</p>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Heading 2 - Bold</h2>
                  <p className="text-sm text-gray-500 mt-1">text-3xl font-bold</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">Heading 3 - Semibold</h3>
                  <p className="text-sm text-gray-500 mt-1">text-2xl font-semibold</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">Heading 4 - Semibold</h4>
                  <p className="text-sm text-gray-500 mt-1">text-xl font-semibold</p>
                </div>
                <div>
                  <p className="text-base text-gray-900">
                    Body text - This is regular paragraph text with normal weight and comfortable line height 
                    for optimal readability across different screen sizes and devices.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">text-base font-normal</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Small text - Used for captions, labels, and secondary information.
                  </p>
                  <p className="text-sm text-gray-500 mt-1">text-sm text-gray-600</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Buttons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Primary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Primary (Purple)</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Download className="w-4 h-4 mr-2" />
                      Primary Button
                    </Button>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Small Primary
                    </Button>
                    <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                      Large Primary
                    </Button>
                  </div>
                </div>

                {/* Secondary Buttons */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Secondary (Black)</h3>
                  <div className="space-y-3">
                    <Button variant="secondary" className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                      <Settings className="w-4 h-4 mr-2" />
                      Secondary Button
                    </Button>
                    <Button variant="secondary" size="sm" className="bg-gray-800 hover:bg-gray-700 text-white">
                      Small Secondary
                    </Button>
                    <Button variant="secondary" size="lg" className="bg-gray-800 hover:bg-gray-700 text-white">
                      Large Secondary
                    </Button>
                  </div>
                </div>

                {/* Outline & Ghost */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Outline & Ghost</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Outline Button
                    </Button>
                    <Button variant="ghost" className="w-full">
                      Ghost Button
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Destructive
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Forms */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Form Elements</CardTitle>
              <p className="text-gray-600">Orange outline and strokes for selected states</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400">
                      <option>Select school type</option>
                      <option>Primary School</option>
                      <option>Secondary School</option>
                      <option>University</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Schools
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Search for schools..."
                        className="pl-10 focus:ring-orange-400 focus:border-orange-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Enter your message"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="newsletter"
                      className="w-4 h-4 text-orange-400 border-gray-300 rounded focus:ring-orange-400"
                    />
                    <label htmlFor="newsletter" className="text-sm text-gray-700">
                      Subscribe to newsletter
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Rounded Cards</CardTitle>
              <p className="text-gray-600">Beautiful cards with subtle shadows and hover effects</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Basic Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Star className="w-5 h-5 mr-2 text-orange-400" />
                      Featured School
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      This is a beautiful card with rounded corners and subtle shadows.
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-800">Primary</Badge>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* School Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle>Warsaw International School</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.8</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Mazowieckie, Warsaw
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        1,200 students
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Stats Card */}
                <Card className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader>
                    <CardTitle className="text-center">School Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div>
                        <div className="text-3xl font-bold text-purple-600">3,247</div>
                        <div className="text-sm text-gray-600">Total Schools</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-orange-500">4.3</div>
                          <div className="text-xs text-gray-600">Avg Rating</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-500">89%</div>
                          <div className="text-xs text-gray-600">Active</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Beautiful Tiles */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Beautiful Tiles</CardTitle>
              <p className="text-gray-600">Interactive tiles with hover effects and icons</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { icon: Search, title: 'Search', description: 'Find schools' },
                  { icon: Star, title: 'Favorites', description: 'Saved schools' },
                  { icon: MapPin, title: 'Locations', description: 'Browse regions' },
                  { icon: User, title: 'Profile', description: 'Your account' },
                  { icon: Settings, title: 'Settings', description: 'Preferences' },
                  { icon: Heart, title: 'Wishlist', description: 'Dream schools' },
                ].map((tile, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center mb-3 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-200">
                      <tile.icon className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{tile.title}</h3>
                    <p className="text-xs text-gray-600">{tile.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Tables */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Beautiful Table Headings</CardTitle>
              <p className="text-gray-600">Tables with gradient headers and hover effects</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-orange-50 to-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-orange-200">
                        School Name
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-orange-200">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-orange-200">
                        Location
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-orange-200">
                        Rating
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b-2 border-orange-200">
                        Students
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {[
                      { name: 'Warsaw International School', type: 'International', location: 'Warsaw', rating: 4.8, students: 1200 },
                      { name: 'Krakow Academy', type: 'Private', location: 'Krakow', rating: 4.6, students: 800 },
                      { name: 'Gdansk Technical School', type: 'Technical', location: 'Gdansk', rating: 4.4, students: 1500 },
                      { name: 'Poznan Language School', type: 'Language', location: 'Poznan', rating: 4.7, students: 600 },
                    ].map((school, index) => (
                      <tr key={index} className="hover:bg-orange-50 transition-colors duration-150">
                        <td className="px-6 py-4 text-sm text-gray-900 border-b border-gray-200">
                          {school.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200">
                          <Badge className="bg-purple-100 text-purple-800">{school.type}</Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200">
                          {school.location}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            {school.rating}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 border-b border-gray-200">
                          {school.students.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges and Alerts */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Badges & Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Badges */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Badges</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-600 text-white">Primary</Badge>
                    <Badge className="bg-gray-800 text-white">Secondary</Badge>
                    <Badge className="bg-orange-500 text-white">Orange</Badge>
                    <Badge className="bg-green-500 text-white">Success</Badge>
                    <Badge className="bg-yellow-500 text-white">Warning</Badge>
                    <Badge className="bg-red-500 text-white">Error</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="secondary">Gray</Badge>
                  </div>
                </div>

                {/* Alerts */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Alerts</h3>
                  <div className="space-y-3">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                      <span className="text-green-800">Success message</span>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                      <span className="text-yellow-800">Warning message</span>
                    </div>
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                      <XCircle className="w-5 h-5 text-red-500 mr-3" />
                      <span className="text-red-800">Error message</span>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                      <Info className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-blue-800">Info message</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Shadows */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Subtle Shadows</CardTitle>
              <p className="text-gray-600">Different shadow levels for depth and hierarchy</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Small', class: 'shadow-sm' },
                  { name: 'Medium', class: 'shadow-md' },
                  { name: 'Large', class: 'shadow-lg' },
                  { name: 'Extra Large', class: 'shadow-xl' },
                ].map((shadow) => (
                  <div key={shadow.name} className="text-center">
                    <div className={`w-24 h-24 bg-white rounded-lg ${shadow.class} mx-auto mb-3 flex items-center justify-center border`}>
                      <span className="text-sm font-medium text-gray-600">{shadow.name}</span>
                    </div>
                    <p className="text-sm text-gray-500">{shadow.class}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dark Mode Preview */}
        <section className="mb-16">
          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-white">Dark Mode Support</CardTitle>
              <p className="text-gray-300">Components work beautifully on dark backgrounds</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    Primary Button
                  </Button>
                  <Button variant="secondary" className="w-full bg-gray-700 hover:bg-gray-600">
                    Secondary Button
                  </Button>
                  <Input 
                    placeholder="Search in dark mode..." 
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                  />
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <h4 className="font-semibold text-white mb-2">Dark Card</h4>
                    <p className="text-gray-300 text-sm">
                      This card demonstrates how components adapt to dark backgrounds
                      while maintaining readability and visual hierarchy.
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Badge className="bg-orange-600 text-white">Orange</Badge>
                    <Badge className="bg-purple-600 text-white">Purple</Badge>
                    <Badge className="bg-gray-600 text-white">Gray</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-gray-600">
            This style guide showcases the design system for the School Finder application.
            All components are designed to be accessible, responsive, and beautiful.
          </p>
        </div>
      </div>
    </div>
  );
}