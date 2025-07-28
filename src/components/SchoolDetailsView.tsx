"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel";
import { 
  Star, 
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
  CheckCircle,
  Share2,
  Download,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Navigation,
  Car,
  Bus,
  Bike,
  Walking,
  Info,
  AlertCircle,
  Lightbulb,
  Target,
  Activity,
  FileText,
  PlayCircle,
  Camera,
  Video,
  Map as MapIcon,
  Expand,
  Eye
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { GoogleMap } from '@/components/GoogleMap';
import { SentimentAnalysisDisplay } from '@/components/school/sentiment-analysis-display';

interface SchoolDetailsViewProps {
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
      fax?: string;
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
      id: string;
      imageUrl: string;
      altText?: string;
      imageType: 'main' | 'gallery' | 'facility' | 'exterior' | 'interior';
      caption?: string;
      uploadedAt?: string;
    }>;
    description?: string;
    mission?: string;
    vision?: string;
    history?: string;
    achievements?: string[];
    programs?: Array<{
      id: string;
      name: string;
      description: string;
      duration?: string;
      requirements?: string[];
    }>;
    admissionRequirements?: string[];
    fees?: {
      tuition?: number;
      registration?: number;
      other?: Array<{
        name: string;
        amount: number;
        description?: string;
      }>;
    };
    schedule?: {
      startTime: string;
      endTime: string;
      breakTime?: string;
      lunchTime?: string;
    };
    transport?: {
      busRoutes?: string[];
      parking?: boolean;
      bikeStorage?: boolean;
    };
    extracurricular?: string[];
    alumni?: Array<{
      name: string;
      achievement: string;
      year?: string;
    }>;
    reviews?: Array<{
      id: string;
      authorName: string;
      rating: number;
      comment: string;
      date: string;
      verified: boolean;
      helpful: number;
    }>;
    isVerified?: boolean;
    isPremium?: boolean;
    lastUpdated?: string;
    visitCount?: number;
    status: 'active' | 'inactive' | 'pending';
    sentimentAnalysis?: {
      sentiment: number;
      positiveKeywords: string[];
      negativeKeywords: string[];
      lastUpdated: string;
    };
  };
  onFavoriteToggle?: (schoolId: string) => void;
  onShare?: (schoolId: string) => void;
  onReportIssue?: (schoolId: string) => void;
  className?: string;
  language?: 'en' | 'pl';
}

// Translations
const translations = {
  en: {
    overview: 'Overview',
    programs: 'Programs',
    facilities: 'Facilities',
    reviews: 'Reviews',
    contact: 'Contact',
    photos: 'Photos',
    location: 'Location',
    admissions: 'Admissions',
    
    // Overview
    description: 'Description',
    mission: 'Mission',
    vision: 'Vision',
    history: 'History',
    achievements: 'Achievements',
    keyStats: 'Key Statistics',
    students: 'Students',
    teachers: 'Teachers',
    established: 'Established',
    ratio: 'Student-Teacher Ratio',
    
    // Programs
    academicPrograms: 'Academic Programs',
    extracurricular: 'Extracurricular Activities',
    languages: 'Languages Taught',
    specializations: 'Specializations',
    duration: 'Duration',
    requirements: 'Requirements',
    
    // Facilities
    schoolFacilities: 'School Facilities',
    transport: 'Transportation',
    parking: 'Parking Available',
    bikeStorage: 'Bike Storage',
    busRoutes: 'Bus Routes',
    
    // Reviews
    userReviews: 'User Reviews',
    googleReviews: 'Google Reviews',
    writeReview: 'Write a Review',
    rating: 'Rating',
    helpful: 'Helpful',
    verified: 'Verified',
    sentimentAnalysis: 'Sentiment Analysis',
    positiveKeywords: 'Positive Keywords',
    negativeKeywords: 'Negative Keywords',
    overallSentiment: 'Overall Sentiment',
    veryPositive: 'Very Positive',
    positive: 'Positive',
    neutral: 'Neutral',
    negative: 'Negative',
    veryNegative: 'Very Negative',
    
    // Contact
    contactInfo: 'Contact Information',
    phone: 'Phone',
    email: 'Email',
    website: 'Website',
    fax: 'Fax',
    address: 'Address',
    schedule: 'School Hours',
    
    // Actions
    save: 'Save',
    saved: 'Saved',
    share: 'Share',
    getDirections: 'Get Directions',
    visitWebsite: 'Visit Website',
    callSchool: 'Call School',
    sendEmail: 'Send Email',
    reportIssue: 'Report Issue',
    
    // Stats
    views: 'Views',
    kmAway: 'km away',
    noRatings: 'No ratings yet',
    reviews: 'reviews',
    verified: 'Verified',
    premium: 'Premium',
    updated: 'Updated',
    
    // Misc
    showMore: 'Show More',
    showLess: 'Show Less',
    viewAll: 'View All',
    loading: 'Loading...',
    error: 'Error loading data',
    unavailable: 'Information not available'
  },
  pl: {
    overview: 'Przegląd',
    programs: 'Programy',
    facilities: 'Udogodnienia',
    reviews: 'Opinie',
    contact: 'Kontakt',
    photos: 'Zdjęcia',
    location: 'Lokalizacja',
    admissions: 'Rekrutacja',
    
    // Overview
    description: 'Opis',
    mission: 'Misja',
    vision: 'Wizja',
    history: 'Historia',
    achievements: 'Osiągnięcia',
    keyStats: 'Kluczowe Statystyki',
    students: 'Uczniowie',
    teachers: 'Nauczyciele',
    established: 'Założona',
    ratio: 'Stosunek Uczeń-Nauczyciel',
    
    // Programs
    academicPrograms: 'Programy Nauczania',
    extracurricular: 'Zajęcia Pozalekcyjne',
    languages: 'Nauczane Języki',
    specializations: 'Specjalizacje',
    duration: 'Czas Trwania',
    requirements: 'Wymagania',
    
    // Facilities
    schoolFacilities: 'Udogodnienia Szkoły',
    transport: 'Transport',
    parking: 'Parking Dostępny',
    bikeStorage: 'Przechowalnia Rowerów',
    busRoutes: 'Linie Autobusowe',
    
    // Reviews
    userReviews: 'Opinie Użytkowników',
    googleReviews: 'Opinie Google',
    writeReview: 'Napisz Opinię',
    rating: 'Ocena',
    helpful: 'Pomocne',
    verified: 'Zweryfikowane',
    sentimentAnalysis: 'Analiza Sentymentu',
    positiveKeywords: 'Pozytywne Słowa Kluczowe',
    negativeKeywords: 'Negatywne Słowa Kluczowe',
    overallSentiment: 'Ogólny Sentyment',
    veryPositive: 'Bardzo Pozytywny',
    positive: 'Pozytywny',
    neutral: 'Neutralny',
    negative: 'Negatywny',
    veryNegative: 'Bardzo Negatywny',
    
    // Contact
    contactInfo: 'Informacje Kontaktowe',
    phone: 'Telefon',
    email: 'Email',
    website: 'Strona WWW',
    fax: 'Faks',
    address: 'Adres',
    schedule: 'Godziny Pracy',
    
    // Actions
    save: 'Zapisz',
    saved: 'Zapisano',
    share: 'Udostępnij',
    getDirections: 'Wyznacz Trasę',
    visitWebsite: 'Odwiedź Stronę',
    callSchool: 'Zadzwoń',
    sendEmail: 'Wyślij Email',
    reportIssue: 'Zgłoś Problem',
    
    // Stats
    views: 'Wyświetlenia',
    kmAway: 'km stąd',
    noRatings: 'Brak ocen',
    reviews: 'opinii',
    verified: 'Zweryfikowane',
    premium: 'Premium',
    updated: 'Zaktualizowano',
    
    // Misc
    showMore: 'Pokaż Więcej',
    showLess: 'Pokaż Mniej',
    viewAll: 'Zobacz Wszystkie',
    loading: 'Ładowanie...',
    error: 'Błąd ładowania danych',
    unavailable: 'Informacje niedostępne'
  }
};

export default function SchoolDetailsView({
  school,
  onFavoriteToggle,
  onShare,
  onReportIssue,
  className = '',
  language = 'pl'
}: SchoolDetailsViewProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const t = translations[language];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        )} 
      />
    ));
  };

  const getRatingDisplay = () => {
    const rating = school.avgUserRating || school.avgGoogleRating;
    const totalReviews = school.userRatingCount + school.googleRatingCount;
    
    if (!rating) {
      return <span className="text-sm text-gray-500">{t.noRatings}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center">
          {renderStars(rating)}
          <span className="ml-1 text-sm text-gray-600">
            {rating.toFixed(1)}
          </span>
        </div>
        <span className="text-sm text-gray-500">
          ({totalReviews} {t.reviews})
        </span>
      </div>
    );
  };

  const getStudentTeacherRatio = () => {
    if (school.studentCount && school.teacherCount) {
      return Math.round(school.studentCount / school.teacherCount);
    }
    return null;
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

  const renderImageGallery = () => {
    if (!school.images || school.images.length === 0) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">{t.unavailable}</p>
        </div>
      );
    }

    return (
      <Carousel className="w-full">
        <CarouselContent>
          {school.images.map((image) => (
            <CarouselItem key={image.id} className="basis-1/3">
              <div className="p-1">
                <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div 
                    className="aspect-video relative"
                    onClick={() => setSelectedImage(image.imageUrl)}
                  >
                    <img 
                      src={image.imageUrl} 
                      alt={image.altText || school.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <Expand className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {image.caption && (
                    <CardContent className="p-3">
                      <p className="text-sm text-gray-600 truncate">{image.caption}</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    );
  };

  return (
    <TooltipProvider>
      <div className={cn("max-w-6xl mx-auto space-y-6", className)}>
        {/* Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* Main Image */}
              <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                {school.mainImage ? (
                  <img 
                    src={school.mainImage} 
                    alt={school.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-400" />
                )}
              </div>
              
              {/* School Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
                  {school.isVerified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t.verified}</p>
                      </TooltipContent>
                    </Tooltip>
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
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    {school.address.city}, {school.address.voivodeship}
                  </div>
                  {school.distance && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        {school.distance} {t.kmAway}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {getRatingDisplay()}
                  {school.visitCount && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="h-4 w-4" />
                      {school.visitCount} {t.views}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => onFavoriteToggle?.(school.id)}
                  >
                    <Heart className={cn(
                      "h-4 w-4 mr-2",
                      school.isFavorite ? "fill-red-500 text-red-500" : ""
                    )} />
                    {school.isFavorite ? t.saved : t.save}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => onShare?.(school.id)}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t.share}
                  </Button>
                  
                  {school.location && (
                    <Button variant="outline">
                      <Navigation className="h-4 w-4 mr-2" />
                      {t.getDirections}
                    </Button>
                  )}
                  
                  {school.contact?.website && (
                    <Button variant="outline" asChild>
                      <Link href={school.contact.website} target="_blank">
                        <Globe className="h-4 w-4 mr-2" />
                        {t.visitWebsite}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">{t.overview}</TabsTrigger>
            <TabsTrigger value="programs">{t.programs}</TabsTrigger>
            <TabsTrigger value="facilities">{t.facilities}</TabsTrigger>
            <TabsTrigger value="reviews">{t.reviews}</TabsTrigger>
            <TabsTrigger value="photos">{t.photos}</TabsTrigger>
            <TabsTrigger value="contact">{t.contact}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{t.keyStats}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {school.studentCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{school.studentCount}</div>
                      <div className="text-sm text-gray-600">{t.students}</div>
                    </div>
                  )}
                  {school.teacherCount && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{school.teacherCount}</div>
                      <div className="text-sm text-gray-600">{t.teachers}</div>
                    </div>
                  )}
                  {getStudentTeacherRatio() && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{getStudentTeacherRatio()}:1</div>
                      <div className="text-sm text-gray-600">{t.ratio}</div>
                    </div>
                  )}
                  {school.establishedYear && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{school.establishedYear}</div>
                      <div className="text-sm text-gray-600">{t.established}</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {school.description && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {showMoreDescription ? school.description : `${school.description.substring(0, 300)}...`}
                    </p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowMoreDescription(!showMoreDescription)}
                      className="p-0 h-auto text-blue-600"
                    >
                      {showMoreDescription ? t.showLess : t.showMore}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {school.mission && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      {t.mission}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{school.mission}</p>
                  </CardContent>
                </Card>
              )}

              {school.vision && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      {t.vision}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700">{school.vision}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Achievements */}
            {school.achievements && school.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    {t.achievements}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {school.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Programs Tab */}
          <TabsContent value="programs" className="space-y-6">
            {/* Academic Programs */}
            {school.programs && school.programs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.academicPrograms}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {school.programs.map((program) => (
                      <div key={program.id} className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-2">{program.name}</h3>
                        <p className="text-gray-700 mb-3">{program.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          {program.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <span>{t.duration}: {program.duration}</span>
                            </div>
                          )}
                          {program.requirements && program.requirements.length > 0 && (
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span>{t.requirements}: {program.requirements.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Specializations */}
            {school.specializations && school.specializations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.specializations}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {school.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-sm">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {school.languages && school.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-green-600" />
                    {t.languages}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {school.languages.map((language) => (
                      <Badge key={language} variant="secondary" className="text-sm">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Extracurricular */}
            {school.extracurricular && school.extracurricular.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    {t.extracurricular}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {school.extracurricular.map((activity, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Facilities Tab */}
          <TabsContent value="facilities" className="space-y-6">
            {/* School Facilities */}
            {school.facilities && school.facilities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    {t.schoolFacilities}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {school.facilities.map((facility) => (
                      <div key={facility} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-gray-700">{facility}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {school.transport && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-green-600" />
                    {t.transport}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {school.transport.parking && (
                      <div className="flex items-center gap-3">
                        <Car className="h-5 w-5 text-blue-600" />
                        <span className="text-gray-700">{t.parking}</span>
                      </div>
                    )}
                    {school.transport.bikeStorage && (
                      <div className="flex items-center gap-3">
                        <Bike className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700">{t.bikeStorage}</span>
                      </div>
                    )}
                    {school.transport.busRoutes && school.transport.busRoutes.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">{t.busRoutes}:</h4>
                        <div className="flex flex-wrap gap-2">
                          {school.transport.busRoutes.map((route) => (
                            <Badge key={route} variant="outline">{route}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
{/* Rating Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{t.rating}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {(school.avgUserRating || school.avgGoogleRating || 0).toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mb-2">
                      {renderStars(school.avgUserRating || school.avgGoogleRating || 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {school.userRatingCount + school.googleRatingCount} {t.reviews}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {t.writeReview}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Analysis */}
            <SentimentAnalysisDisplay 
              sentimentData={school.sentimentAnalysis}
              showKeywords={true}
              compact={false}
            />

            {/* Reviews List */}
            {school.reviews && school.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t.userReviews}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {school.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{review.authorName}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  {t.verified}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-600">{review.date}</span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{review.comment}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <button className="flex items-center gap-1 text-gray-600 hover:text-blue-600">
                              <ThumbsUp className="h-4 w-4" />
                              {t.helpful} ({review.helpful})
                            </button>
                            <button className="flex items-center gap-1 text-gray-600 hover:text-red-600">
                              <Flag className="h-4 w-4" />
                              {t.reportIssue}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Photos Tab */}
          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.photos}</CardTitle>
              </CardHeader>
              <CardContent>
                {renderImageGallery()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.contactInfo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">{t.address}</div>
                      <div className="text-sm text-gray-600">
                        {school.address.street}<br />
                        {school.address.city} {school.address.postal}<br />
                        {school.address.voivodeship}
                      </div>
                    </div>
                  </div>

                  {school.contact?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.phone}</div>
                        <div className="text-sm text-gray-600">{school.contact.phone}</div>
                      </div>
                    </div>
                  )}

                  {school.contact?.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.email}</div>
                        <div className="text-sm text-gray-600">{school.contact.email}</div>
                      </div>
                    </div>
                  )}

                  {school.contact?.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.website}</div>
                        <Link href={school.contact.website} target="_blank" className="text-sm text-blue-600 hover:underline">
                          {school.contact.website}
                        </Link>
                      </div>
                    </div>
                  )}

                  {school.schedule && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium">{t.schedule}</div>
                        <div className="text-sm text-gray-600">
                          {school.schedule.startTime} - {school.schedule.endTime}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.location}</CardTitle>
                </CardHeader>
                <CardContent>
                  {school.location ? (
                    <div className="rounded-lg overflow-hidden">
                      <GoogleMap
                        school={school}
                        width="100%"
                        height="400px"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-100 rounded-lg p-8 text-center">
                      <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Location not available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
