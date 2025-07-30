'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, Eye, Database, Cookie, Mail, Phone, 
  FileText, Calendar, Clock, CheckCircle, 
  AlertCircle, Info, Lock, Globe, User, MapPin
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic'

export default function PrivacyPage() {
  const [isClient, setIsClient] = useState(false)
  const lastUpdated = 'December 15, 2024';

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }
  
  const dataTypes = [
    {
      category: 'Personal Information',
      icon: User,
      description: 'Name, email address, phone number, and location',
      examples: ['Full name', 'Email address', 'Phone number', 'City and state']
    },
    {
      category: 'Account Information',
      icon: Lock,
      description: 'Account credentials and preferences',
      examples: ['Login credentials', 'Profile settings', 'Notification preferences', 'Saved searches']
    },
    {
      category: 'Usage Data',
      icon: Eye,
      description: 'Information about how you use our service',
      examples: ['Pages visited', 'Search queries', 'Time spent on site', 'Device information']
    },
    {
      category: 'School Data',
      icon: Database,
      description: 'Information about schools you view or save',
      examples: ['School searches', 'Saved schools', 'Reviews written', 'Comparison lists']
    }
  ];

  const dataUsage = [
    {
      title: 'Service Provision',
      description: 'To provide and improve our school search services',
      icon: Globe
    },
    {
      title: 'Personalization',
      description: 'To customize your experience and provide relevant recommendations',
      icon: User
    },
    {
      title: 'Communication',
      description: 'To send you important updates and respond to your inquiries',
      icon: Mail
    },
    {
      title: 'Analytics',
      description: 'To understand how our service is used and improve performance',
      icon: Eye
    }
  ];

  const userRights = [
    {
      right: 'Access',
      description: 'Request a copy of your personal data',
      icon: FileText
    },
    {
      right: 'Correction',
      description: 'Update or correct your personal information',
      icon: CheckCircle
    },
    {
      right: 'Deletion',
      description: 'Request deletion of your personal data',
      icon: AlertCircle
    },
    {
      right: 'Portability',
      description: 'Export your data in a machine-readable format',
      icon: Database
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">
                Last updated: <span className="font-medium">{lastUpdated}</span>
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              <Shield className="h-4 w-4 mr-1" />
              GDPR Compliant
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            At SchoolFinder, we are committed to protecting your privacy and ensuring transparency 
            about how we collect, use, and protect your personal information. This policy explains 
            our practices in detail.
          </AlertDescription>
        </Alert>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Link href="#information-collection" className="text-blue-600 hover:underline py-1">
                1. Information We Collect
              </Link>
              <Link href="#how-we-use" className="text-blue-600 hover:underline py-1">
                2. How We Use Information
              </Link>
              <Link href="#information-sharing" className="text-blue-600 hover:underline py-1">
                3. Information Sharing
              </Link>
              <Link href="#data-security" className="text-blue-600 hover:underline py-1">
                4. Data Security
              </Link>
              <Link href="#cookies" className="text-blue-600 hover:underline py-1">
                5. Cookies and Tracking
              </Link>
              <Link href="#your-rights" className="text-blue-600 hover:underline py-1">
                6. Your Rights
              </Link>
              <Link href="#children" className="text-blue-600 hover:underline py-1">
                7. Children's Privacy
              </Link>
              <Link href="#contact" className="text-blue-600 hover:underline py-1">
                8. Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <section id="information-collection" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {dataTypes.map((type) => (
              <Card key={type.category}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <type.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {type.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{type.description}</p>
                  <div className="space-y-1">
                    {type.examples.map((example, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-500">
                        <CheckCircle className="h-3 w-3 mr-2 text-green-500" />
                        {example}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Automatic Data Collection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We automatically collect certain information when you visit our website, including:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-500">
                <li>• IP address and location data</li>
                <li>• Browser type and version</li>
                <li>• Device information</li>
                <li>• Pages visited and time spent</li>
                <li>• Referring websites</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* How We Use Information */}
        <section id="how-we-use" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dataUsage.map((usage) => (
              <Card key={usage.title}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <usage.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {usage.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{usage.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Information Sharing */}
        <section id="information-sharing" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Information Sharing</h2>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                We Do Not Sell Your Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We do not sell, rent, or trade your personal information to third parties for marketing purposes.
              </p>
              <p className="text-gray-600">
                We may share your information only in the following limited circumstances:
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>• <strong>Service Providers:</strong> Third-party companies that help us operate our service</li>
                <li>• <strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li>• <strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
                <li>• <strong>With Your Consent:</strong> When you explicitly agree to share information</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Data Security */}
        <section id="data-security" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Data Security</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-blue-600" />
                Security Measures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Technical Safeguards</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• SSL/TLS encryption</li>
                    <li>• Secure data centers</li>
                    <li>• Regular security audits</li>
                    <li>• Access controls</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Operational Safeguards</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Employee training</li>
                    <li>• Limited access policies</li>
                    <li>• Regular updates</li>
                    <li>• Incident response plan</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cookies */}
        <section id="cookies" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">5. Cookies and Tracking</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cookie className="h-5 w-5 mr-2 text-blue-600" />
                Cookie Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <div className="space-y-3">
                <div className="border-l-4 border-l-green-500 pl-4">
                  <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                  <p className="text-sm text-gray-600">Required for basic website functionality</p>
                </div>
                <div className="border-l-4 border-l-blue-500 pl-4">
                  <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                  <p className="text-sm text-gray-600">Help us understand how you use our site</p>
                </div>
                <div className="border-l-4 border-l-purple-500 pl-4">
                  <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                  <p className="text-sm text-gray-600">Remember your settings and preferences</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Your Rights */}
        <section id="your-rights" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">6. Your Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {userRights.map((right) => (
              <Card key={right.right}>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <right.icon className="h-5 w-5 mr-2 text-blue-600" />
                    {right.right}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{right.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How to Exercise Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                To exercise any of these rights, please contact us at:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" asChild>
                  <Link href="mailto:privacy@schoolfinder.com">
                    <Mail className="h-4 w-4 mr-2" />
                    privacy@schoolfinder.com
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Children's Privacy */}
        <section id="children" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">7. Children's Privacy</h2>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>COPPA Compliance:</strong> Our service is not intended for children under 13. 
              We do not knowingly collect personal information from children under 13. If you believe 
              we have collected information from a child under 13, please contact us immediately.
            </AlertDescription>
          </Alert>
        </section>

        {/* Contact */}
        <section id="contact" className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">8. Contact Us</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Privacy Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-gray-600">privacy@schoolfinder.com</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-gray-500" />
                  <span className="text-gray-600">+1 (555) PRIVACY</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-3 text-gray-500 mt-1" />
                  <div className="text-gray-600">
                    <div>SchoolFinder Privacy Office</div>
                    <div>123 Education Street</div>
                    <div>San Francisco, CA 94102</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <div className="bg-gray-100 rounded-lg p-6 text-center">
          <p className="text-gray-600 mb-4">
            This privacy policy may be updated from time to time. We will notify you of any significant changes.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href="/about">About Us</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Contact</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
