'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Star, 
  MapPin, 
  Users, 
  GraduationCap, 
  Calendar,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  XCircle,
  TrendingUp,
  Award,
  Languages,
  Building,
  Car,
  Bus,
  Bike,
  Activity,
  DollarSign,
  Clock,
  Eye,
  Download,
  Share2
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface School {
  id: string;
  name: string;
  shortName?: string;
  type: string;
  address: {
    street: string;
    city: string;
    voivodeship: string;
    postal: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  studentCount?: number;
  teacherCount?: number;
  establishedYear?: number;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
  extracurricular?: string[];
  avgUserRating?: number;
  avgGoogleRating?: number;
  userRatingCount: number;
  googleRatingCount: number;
  distance?: number;
  mainImage?: string;
  fees?: {
    tuition?: number;
    registration?: number;
  };
  schedule?: {
    startTime: string;
    endTime: string;
  };
  transport?: {
    busRoutes?: string[];
    parking?: boolean;
    bikeStorage?: boolean;
  };
  sentimentAnalysis?: {
    sentiment: number;
    positiveKeywords: string[];
    negativeKeywords: string[];
  };
  achievements?: string[];
}

interface SchoolComparisonProps {
  schools: School[];
  onRemoveSchool?: (schoolId: string) => void;
  onClose?: () => void;
  className?: string;
}

export function SchoolComparison({ 
  schools, 
  onRemoveSchool, 
  onClose,
  className 
}: SchoolComparisonProps) {
  const [showAllFeatures, setShowAllFeatures] = useState(false);

  if (schools.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Schools to Compare
          </h3>
          <p className="text-sm text-gray-500 max-w-md">
            Select schools from your search results or favorites to start comparing their features and ratings.
          </p>
        </CardContent>
      </Card>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          "h-3 w-3",
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        )} 
      />
    ));
  };

  const getStudentTeacherRatio = (school: School) => {
    if (school.studentCount && school.teacherCount) {
      return Math.round(school.studentCount / school.teacherCount);
    }
    return 'N/A';
  };

  const getOverallRating = (school: School) => {
    return school.avgUserRating || school.avgGoogleRating || 0;
  };

  const getTotalReviews = (school: School) => {
    return school.userRatingCount + school.googleRatingCount;
  };

  const getSentimentLevel = (sentiment?: number) => {
    if (!sentiment) return { label: 'N/A', color: 'text-gray-500' };
    
    if (sentiment > 0.5) return { label: 'Very Positive', color: 'text-green-600' };
    if (sentiment > 0.1) return { label: 'Positive', color: 'text-green-500' };
    if (sentiment > -0.1) return { label: 'Neutral', color: 'text-gray-600' };
    if (sentiment > -0.5) return { label: 'Negative', color: 'text-orange-500' };
    return { label: 'Very Negative', color: 'text-red-600' };
  };

  const exportComparison = () => {
    // Create a simple CSV export of the comparison
    const headers = ['School Name', 'Type', 'Location', 'Students', 'Teachers', 'Ratio', 'Rating', 'Reviews'];
    const rows = schools.map(school => [
      school.name,
      school.type,
      `${school.address.city}, ${school.address.voivodeship}`,
      school.studentCount?.toString() || 'N/A',
      school.teacherCount?.toString() || 'N/A',
      getStudentTeacherRatio(school).toString(),
      getOverallRating(school).toFixed(1),
      getTotalReviews(school).toString()
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    if (typeof document !== 'undefined') {
      const a = document.createElement('a');
      a.href = url;
      a.download = 'school-comparison.csv';
      a.click();
    }
    
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                School Comparison ({schools.length} schools)
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Compare key features and metrics across selected schools
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={exportComparison}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="min-w-[800px]">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 font-semibold text-gray-900 sticky left-0 bg-gray-50 z-10">
                      School
                    </th>
                    {schools.map((school) => (
                      <th key={school.id} className="text-center p-4 min-w-[250px] relative">
                        <div className="space-y-3">
                          {/* School Image */}
                          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto overflow-hidden">
                            {school.mainImage ? (
                              <img 
                                src={school.mainImage} 
                                alt={school.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* School Name */}
                          <div>
                            <Link 
                              href={`/schools/${school.id}`}
                              className="font-semibold text-blue-600 hover:underline text-sm"
                            >
                              {school.name}
                            </Link>
                            <div className="flex items-center justify-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {school.type}
                              </Badge>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          {onRemoveSchool && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute top-2 right-2 h-6 w-6 p-0"
                              onClick={() => onRemoveSchool(school.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                
                <tbody>
                  {/* Location */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        Location
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center text-sm">
                        <div>
                          {school.address.city}
                          <div className="text-xs text-gray-500">
                            {school.address.voivodeship}
                          </div>
                          {school.distance && (
                            <div className="text-xs text-blue-600 mt-1">
                              {school.distance} km away
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Rating */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        Overall Rating
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="space-y-1">
                          <div className="flex items-center justify-center">
                            {renderStars(getOverallRating(school))}
                          </div>
                          <div className="text-lg font-bold text-yellow-600">
                            {getOverallRating(school).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {getTotalReviews(school)} reviews
                          </div>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Students */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        Students
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {school.studentCount || 'N/A'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Teachers */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-green-500" />
                        Teachers
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {school.teacherCount || 'N/A'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Student-Teacher Ratio */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-purple-500" />
                        Ratio
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="text-lg font-bold text-purple-600">
                          {getStudentTeacherRatio(school)}:1
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Established */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        Established
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="text-lg font-bold text-orange-600">
                          {school.establishedYear || 'N/A'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Sentiment */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        Sentiment
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="space-y-1">
                          <div className={cn(
                            "text-sm font-medium",
                            getSentimentLevel(school.sentimentAnalysis?.sentiment).color
                          )}>
                            {getSentimentLevel(school.sentimentAnalysis?.sentiment).label}
                          </div>
                          {school.sentimentAnalysis?.sentiment && (
                            <div className="text-xs text-gray-500">
                              {school.sentimentAnalysis.sentiment.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Transportation */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-green-500" />
                        Transportation
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          {school.transport?.parking && (
                            <Car className="h-4 w-4 text-blue-500" />
                          )}
                          {school.transport?.bikeStorage && (
                            <Bike className="h-4 w-4 text-green-500" />
                          )}
                          {school.transport?.busRoutes && school.transport.busRoutes.length > 0 && (
                            <Bus className="h-4 w-4 text-orange-500" />
                          )}
                          {!school.transport?.parking && !school.transport?.bikeStorage && !school.transport?.busRoutes?.length && (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Contact Information */}
                  <tr className="border-t">
                    <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        Contact
                      </div>
                    </td>
                    {schools.map((school) => (
                      <td key={school.id} className="p-4 text-center">
                        <div className="space-y-1">
                          {school.contact?.phone && (
                            <div className="flex items-center justify-center gap-1 text-xs">
                              <Phone className="h-3 w-3" />
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          )}
                          {school.contact?.email && (
                            <div className="flex items-center justify-center gap-1 text-xs">
                              <Mail className="h-3 w-3" />
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          )}
                          {school.contact?.website && (
                            <div className="flex items-center justify-center gap-1 text-xs">
                              <Globe className="h-3 w-3" />
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            </div>
                          )}
                          {!school.contact?.phone && !school.contact?.email && !school.contact?.website && (
                            <span className="text-xs text-gray-400">Limited</span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Extended Features (Show/Hide Toggle) */}
                  {showAllFeatures && (
                    <>
                      {/* Languages */}
                      <tr className="border-t">
                        <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-green-500" />
                            Languages
                          </div>
                        </td>
                        {schools.map((school) => (
                          <td key={school.id} className="p-4 text-center">
                            <div className="text-xs">
                              {school.languages?.length ? (
                                <div className="space-y-1">
                                  {school.languages.slice(0, 3).map((lang) => (
                                    <Badge key={lang} variant="outline" className="text-xs">
                                      {lang}
                                    </Badge>
                                  ))}
                                  {school.languages.length > 3 && (
                                    <div className="text-gray-500">
                                      +{school.languages.length - 3} more
                                    </div>
                                  )}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Facilities Count */}
                      <tr className="border-t">
                        <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-blue-500" />
                            Facilities
                          </div>
                        </td>
                        {schools.map((school) => (
                          <td key={school.id} className="p-4 text-center">
                            <div className="text-lg font-bold text-blue-600">
                              {school.facilities?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">facilities</div>
                          </td>
                        ))}
                      </tr>

                      {/* Extracurricular Count */}
                      <tr className="border-t">
                        <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-500" />
                            Activities
                          </div>
                        </td>
                        {schools.map((school) => (
                          <td key={school.id} className="p-4 text-center">
                            <div className="text-lg font-bold text-purple-600">
                              {school.extracurricular?.length || 0}
                            </div>
                            <div className="text-xs text-gray-500">activities</div>
                          </td>
                        ))}
                      </tr>

                      {/* School Hours */}
                      {schools.some(s => s.schedule) && (
                        <tr className="border-t">
                          <td className="p-4 font-medium text-gray-900 bg-gray-50 sticky left-0 z-10">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              Hours
                            </div>
                          </td>
                          {schools.map((school) => (
                            <td key={school.id} className="p-4 text-center text-xs">
                              {school.schedule ? (
                                <div>
                                  {school.schedule.startTime} - {school.schedule.endTime}
                                </div>
                              ) : (
                                'N/A'
                              )}
                            </td>
                          ))}
                        </tr>
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        </CardContent>
        
        {/* Show More/Less Button */}
        <div className="border-t p-4 text-center">
          <Button
            variant="outline"
            onClick={() => setShowAllFeatures(!showAllFeatures)}
          >
            {showAllFeatures ? 'Show Less Details' : 'Show More Details'}
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Comparing {schools.length} schools • Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All Details
              </Button>
              <Button variant="outline" size="sm">
                Print Comparison
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
