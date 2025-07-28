"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Users, 
  GraduationCap, 
  Heart, 
  ExternalLink, 
  BookOpen, 
  Clock, 
  Phone,
  Mail,
  Globe,
  Calendar,
  Award,
  Languages,
  Building,
  Image as ImageIcon,
  Zap,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/FavoriteButton';
import { StarRatingDisplay } from '@/components/ui/star-rating';

interface SchoolCardProps {
  school: {
    id: string;
    name: string;
    shortName?: string;
    type: string;
    address: {
      street: string;
      city: string;
      voivodeship: string;
      postal: string;
      district?: string;
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
    avgUserRating?: number;
    avgGoogleRating?: number;
    userRatingCount: number;
    googleRatingCount: number;
    distance?: number;
    isFavorite: boolean;
    mainImage?: string;
    images?: Array<{
      imageUrl: string;
      altText?: string;
      imageType: string;
    }>;
    isVerified?: boolean;
    isPremium?: boolean;
    lastUpdated?: string;
  };
  variant?: 'default' | 'compact' | 'detailed' | 'grid';
  showActions?: boolean;
  onFavoriteToggle?: (schoolId: string) => void;
  onViewDetails?: (schoolId: string) => void;
  className?: string;
  language?: 'en' | 'pl';
}

// Translations
const translations = {
  en: {
    students: 'students',
    teachers: 'teachers',
    established: 'Est.',
    ratio: 'ratio',
    kmAway: 'km away',
    programs: 'Programs',
    facilities: 'Facilities',
    languages: 'Languages',
    contactInfo: 'Contact Info',
    viewDetails: 'View Details',
    save: 'Save',
    saved: 'Saved',
    noRatings: 'No ratings yet',
    reviews: 'reviews',
    verified: 'Verified',
    premium: 'Premium',
    updated: 'Updated',
    more: 'more',
    showMore: 'Show More',
    showLess: 'Show Less',
    website: 'Website',
    phone: 'Phone',
    email: 'Email'
  },
  pl: {
    students: 'uczniów',
    teachers: 'nauczycieli',
    established: 'Zał.',
    ratio: 'stosunek',
    kmAway: 'km dalej',
    programs: 'Programy',
    facilities: 'Udogodnienia',
    languages: 'Języki',
    contactInfo: 'Kontakt',
    viewDetails: 'Zobacz Szczegóły',
    save: 'Zapisz',
    saved: 'Zapisano',
    noRatings: 'Brak ocen',
    reviews: 'opinii',
    verified: 'Zweryfikowano',
    premium: 'Premium',
    updated: 'Zaktualizowano',
    more: 'więcej',
    showMore: 'Pokaż Więcej',
    showLess: 'Pokaż Mniej',
    website: 'Strona',
    phone: 'Telefon',
    email: 'Email'
  }
};

export default function SchoolCard({ 
  school, 
  variant = 'default',
  showActions = true,
  onFavoriteToggle,
  onViewDetails,
  className = '',
  language = 'pl'
}: SchoolCardProps) {
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const t = translations[language];

  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(school.id);
    }
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(school.id);
    }
  };


  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getStudentTeacherRatio = () => {
    if (school.studentCount && school.teacherCount) {
      return Math.round(school.studentCount / school.teacherCount);
    }
    return null;
  };

  const getRatingDisplay = () => {
    const rating = school.avgUserRating || school.avgGoogleRating;
    const totalReviews = school.userRatingCount + school.googleRatingCount;
    
    if (!rating) {
      return <span className="text-sm text-gray-500">{t.noRatings}</span>;
    }

    return (
      <StarRatingDisplay 
        rating={rating} 
        totalRatings={totalReviews}
        size="sm"
      />
    );
  };

  // Compact variant for grid layouts
  if (variant === 'compact') {
    return (
      <Card className={cn("hover:shadow-lg transition-shadow cursor-pointer", className)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {school.mainImage && !imageError ? (
                <img 
                  src={school.mainImage} 
                  alt={school.name}
                  className="w-full h-full object-cover rounded-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm truncate">{school.name}</h3>
                {school.isVerified && (
                  <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{school.address.city}</span>
                {school.distance && (
                  <span>• {school.distance} {t.kmAway}</span>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <StarRatingDisplay 
                  rating={school.avgUserRating || school.avgGoogleRating || 0} 
                  size="sm"
                />
                
                <FavoriteButton 
                  schoolId={school.id} 
                  size="sm" 
                  variant="ghost"
                  className="h-6 w-6 p-0"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant for grid layouts
  if (variant === 'grid') {
    return (
      <Card className={cn("hover:shadow-lg transition-shadow", className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header with image and basic info */}
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {school.mainImage && !imageError ? (
                  <img 
                    src={school.mainImage} 
                    alt={school.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base truncate">{school.name}</h3>
                  {school.isVerified && (
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {school.isPremium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {t.premium}
                    </Badge>
                  )}
                </div>
                
                <Badge variant="outline" className="text-xs">
                  {school.type}
                </Badge>
              </div>
            </div>

            {/* Location and distance */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{school.address.city}, {school.address.voivodeship}</span>
              {school.distance && (
                <span className="ml-auto text-xs">
                  {school.distance} {t.kmAway}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {school.studentCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{school.studentCount} {t.students}</span>
                </div>
              )}
              {school.establishedYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{t.established} {school.establishedYear}</span>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              {getRatingDisplay()}
            </div>

            {/* Programs */}
            {school.specializations && school.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {school.specializations.slice(0, 2).map((program) => (
                  <Badge key={program} variant="outline" className="text-xs">
                    {program}
                  </Badge>
                ))}
                {school.specializations.length > 2 && (
                  <Badge variant="outline" className="text-xs">
                    +{school.specializations.length - 2} {t.more}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2">
                <Link href={`/schools/${school.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.viewDetails}
                  </Button>
                </Link>
                <FavoriteButton 
                  schoolId={school.id} 
                  size="sm" 
                  variant="outline"
                  className="px-3"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Detailed variant with extended information
  if (variant === 'detailed') {
    return (
      <Card className={cn("hover:shadow-lg transition-shadow", className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {school.mainImage && !imageError ? (
                  <img 
                    src={school.mainImage} 
                    alt={school.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{school.name}</h3>
                  {school.isVerified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {school.isPremium && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      {t.premium}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary">{school.type}</Badge>
                  {school.lastUpdated && (
                    <span className="text-sm text-gray-500">
                      {t.updated} {formatLastUpdated(school.lastUpdated)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{school.address.street}, {school.address.city} {school.address.postal}</span>
              {school.distance && (
                <span className="ml-auto">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {school.distance} {t.kmAway}
                </span>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {school.studentCount && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="text-sm font-medium">{school.studentCount}</div>
                    <div className="text-xs text-gray-600">{t.students}</div>
                  </div>
                </div>
              )}
              
              {school.teacherCount && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="text-sm font-medium">{school.teacherCount}</div>
                    <div className="text-xs text-gray-600">{t.teachers}</div>
                  </div>
                </div>
              )}
              
              {getStudentTeacherRatio() && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="text-sm font-medium">{getStudentTeacherRatio()}:1</div>
                    <div className="text-xs text-gray-600">{t.ratio}</div>
                  </div>
                </div>
              )}
              
              {school.establishedYear && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="text-sm font-medium">{school.establishedYear}</div>
                    <div className="text-xs text-gray-600">{t.established}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-yellow-600" />
              {getRatingDisplay()}
            </div>

            {/* Programs & Specializations */}
            {school.specializations && school.specializations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{t.programs}:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {school.specializations.slice(0, showMoreInfo ? undefined : 4).map((program) => (
                    <Badge key={program} variant="outline" className="text-xs">
                      {program}
                    </Badge>
                  ))}
                  {school.specializations.length > 4 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                      className="text-xs h-6 px-2"
                    >
                      {showMoreInfo ? t.showLess : `+${school.specializations.length - 4} ${t.more}`}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Languages */}
            {school.languages && school.languages.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{t.languages}:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {school.languages.map((language) => (
                    <Badge key={language} variant="secondary" className="text-xs">
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {school.facilities && school.facilities.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{t.facilities}:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {school.facilities.slice(0, showMoreInfo ? undefined : 6).map((facility) => (
                    <Badge key={facility} variant="outline" className="text-xs">
                      {facility}
                    </Badge>
                  ))}
                  {school.facilities.length > 6 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMoreInfo(!showMoreInfo)}
                      className="text-xs h-6 px-2"
                    >
                      {showMoreInfo ? t.showLess : `+${school.facilities.length - 6} ${t.more}`}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Contact Info */}
            {school.contact && (school.contact.phone || school.contact.email || school.contact.website) && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">{t.contactInfo}:</span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {school.contact.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{school.contact.phone}</span>
                    </div>
                  )}
                  {school.contact.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{school.contact.email}</span>
                    </div>
                  )}
                  {school.contact.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      <Link href={school.contact.website} target="_blank" className="text-blue-600 hover:underline">
                        {t.website}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-3 pt-4 border-t">
                <Link href={`/schools/${school.id}`} className="flex-1">
                  <Button size="sm" className="w-full">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.viewDetails}
                  </Button>
                </Link>
                <FavoriteButton 
                  schoolId={school.id} 
                  size="sm" 
                  variant="outline"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* School Image */}
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            {school.mainImage && !imageError ? (
              <img 
                src={school.mainImage} 
                alt={school.name}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-gray-400" />
            )}
          </div>
          
          {/* School Details */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link 
                href={`/schools/${school.id}`}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
              >
                {school.name}
              </Link>
              <Badge variant="secondary">{school.type}</Badge>
              {school.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
            
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {school.address.city}, {school.address.voivodeship}
              </div>
              {school.studentCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {school.studentCount} {t.students}
                </div>
              )}
              {school.teacherCount && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {getStudentTeacherRatio()}:1 {t.ratio}
                </div>
              )}
              {school.distance && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {school.distance} {t.kmAway}
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              {getRatingDisplay()}
            </div>

            {/* Programs/Specializations */}
            {school.specializations && school.specializations.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-900">{t.programs}:</span>
                {school.specializations.slice(0, 3).map((program) => (
                  <Badge key={program} variant="outline" className="text-xs">
                    {program}
                  </Badge>
                ))}
                {school.specializations.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{school.specializations.length - 3} {t.more}
                  </Badge>
                )}
              </div>
            )}

            {/* Address */}
            <p className="text-sm text-gray-600 mb-4">
              {school.address.street}, {school.address.city} {school.address.postal}
            </p>

            {/* Action Buttons */}
            {showActions && (
              <div className="flex items-center gap-3">
                <Link href={`/schools/${school.id}`}>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.viewDetails}
                  </Button>
                </Link>
                <FavoriteButton 
                  schoolId={school.id} 
                  size="sm" 
                  variant="outline"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
