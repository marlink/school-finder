'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Target, Users, Award, BookOpen, Shield, Heart, 
  Mail, Phone, MapPin, Globe, Linkedin, Twitter,
  CheckCircle, Star, TrendingUp, Clock
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      bio: 'Former education policy advisor with 15+ years in K-12 education reform.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/sarahchen'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Product',
      bio: 'Product designer focused on creating intuitive educational tools for families.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/marcusrodriguez'
    },
    {
      name: 'Dr. Emily Watson',
      role: 'Head of Research',
      bio: 'PhD in Educational Psychology, specializing in school effectiveness research.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/emilywatson'
    },
    {
      name: 'James Park',
      role: 'Engineering Lead',
      bio: 'Full-stack developer with expertise in education technology platforms.',
      image: '/api/placeholder/150/150',
      linkedin: 'https://linkedin.com/in/jamespark'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Company Founded',
      description: 'SchoolFinder launched with mission to simplify school search for families.',
      icon: Target
    },
    {
      year: '2023',
      title: 'First 10,000 Schools',
      description: 'Reached comprehensive coverage of schools across 5 major metropolitan areas.',
      icon: BookOpen
    },
    {
      year: '2024',
      title: 'National Expansion',
      description: 'Expanded to cover 50+ cities with over 100,000 schools in our database.',
      icon: TrendingUp
    },
    {
      year: '2024',
      title: 'Community Features',
      description: 'Launched parent reviews, school ratings, and community discussions.',
      icon: Users
    }
  ];

  const stats = [
    { label: 'Schools Listed', value: '120,000+', icon: BookOpen },
    { label: 'Cities Covered', value: '50+', icon: MapPin },
    { label: 'Families Served', value: '250,000+', icon: Users },
    { label: 'School Reviews', value: '85,000+', icon: Star }
  ];

  const values = [
    {
      title: 'Transparency',
      description: 'We provide clear, unbiased information to help families make informed decisions.',
      icon: Shield
    },
    {
      title: 'Accessibility',
      description: 'Every family deserves access to quality education information, regardless of background.',
      icon: Heart
    },
    {
      title: 'Community',
      description: 'We foster connections between families and schools to strengthen communities.',
      icon: Users
    },
    {
      title: 'Innovation',
      description: 'We continuously improve our platform with the latest technology and insights.',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Families to Find the Perfect School
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              We believe every child deserves access to quality education. Our mission is to make 
              school search simple, transparent, and accessible for all families.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary">
                <Mail className="h-5 w-5 mr-2" />
                Contact Us
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Globe className="h-5 w-5 mr-2" />
                Join Our Mission
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission & Values</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              We&apos;re driven by the belief that finding the right school shouldn&apos;t be a privilege—it should be a right.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value) => (
              <Card key={value.title} className="border-l-4 border-l-blue-600">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <value.icon className="h-6 w-6 mr-3 text-blue-600" />
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-lg text-gray-600">Key milestones in our mission to transform school search</p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-blue-200"></div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className={`flex items-center ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right md:pr-8' : 'md:text-left md:pl-8'}`}>
                    <Card className="max-w-md ml-auto mr-auto">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{milestone.year}</Badge>
                          <milestone.icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <CardTitle className="text-lg">{milestone.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center z-10 mx-4">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">Passionate educators and technologists working to improve education access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="text-center">
                <CardHeader>
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <p className="text-blue-600 font-medium">{member.role}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={member.linkedin} target="_blank">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-600">Have questions? We'd love to hear from you.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Mail className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">General inquiries and support</p>
                <Link href="mailto:hello@schoolfinder.com" className="text-blue-600 hover:underline">
                  hello@schoolfinder.com
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>Call Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Monday - Friday, 9AM - 6PM EST</p>
                <Link href="tel:+1-555-SCHOOL" className="text-blue-600 hover:underline">
                  +1 (555) SCHOOL
                </Link>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MapPin className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <CardTitle>Visit Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Our headquarters in San Francisco</p>
                <address className="text-blue-600 not-italic">
                  123 Education Street<br />
                  San Francisco, CA 94102
                </address>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect School?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of families who have found their ideal school using our platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/search">Start Your Search</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600" asChild>
              <Link href="/regions">Browse by Region</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
