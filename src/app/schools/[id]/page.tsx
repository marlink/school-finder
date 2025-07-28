import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Star, 
  Users, 
  Calendar,
  Clock,
  Award,
  BookOpen,
  GraduationCap,
  Building,
  Heart,
  Share2,
  ExternalLink,
  ChevronRight,
  Target
} from 'lucide-react';
import PhotoGallery from '@/components/school/PhotoGallery';
import SimilarSchools from '@/components/school/SimilarSchools';
import { GoogleMap } from '@/components/school/GoogleMap';
import RatingForm from '@/components/school/RatingForm';
import RatingDisplay from '@/components/school/RatingDisplay';

interface SchoolPageProps {
  params: Promise<{ id: string }>;
}

async function getSchoolData(id: string) {
  try {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' }
        },
        socialMedia: true,
        userRatings: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        googleRatings: {
          orderBy: { reviewDate: 'desc' }
        },
        publicRatings: {
          orderBy: { year: 'desc' }
        },
        portalRatings: true,
        _count: {
          select: {
            userRatings: true,
            favorites: true
          }
        }
      }
    });

    if (!school) {
      return null;
    }

    // Calculate average user rating
    const avgUserRating = school.userRatings.length > 0
      ? school.userRatings.reduce((sum, rating) => sum + Number(rating.overallRating), 0) / school.userRatings.length
      : 0;

    // Get latest Google rating
    const latestGoogleRating = school.googleRatings[0];

    return {
      ...school,
      avgUserRating,
      reviewCount: school._count.userRatings,
      favoriteCount: school._count.favorites,
      latestGoogleRating: latestGoogleRating ? Number(latestGoogleRating.rating) : null
    };
  } catch (error) {
    console.error('Error fetching school data:', error);
    return null;
  }
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { id } = await params;
  const school = await getSchoolData(id);

  if (!school) {
    notFound();
  }

  // Extract data from JSON fields
  const address = school.address as any;
  const contact = school.contact as any;
  const location = school.location as any;
  const facilities = school.facilities as any;
  const languages = school.languages as any;
  const specializations = school.specializations as any;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: school.name,
          text: `Check out ${school.name} - ${school.type} school in ${address?.city || 'Poland'}`,
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
      } catch (error) {
        // Error sharing functionality
      }
    } else {
      // Fallback to copying URL
      if (typeof window !== 'undefined' && navigator.clipboard) {
          navigator.clipboard.writeText(window.location.href);
        }
    }
  };

  // Transform images for PhotoGallery
  const galleryImages = school.images.map(img => ({
    id: img.id,
    url: img.imageUrl,
    alt: img.altText || `${school.name} - Image`,
    caption: img.caption || undefined
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{school.name}</h1>
                <Badge variant={school.type === 'Public' ? 'default' : 'secondary'}>
                  {school.type}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(school.avgUserRating || school.latestGoogleRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-sm text-gray-600">
                    {(school.avgUserRating || school.latestGoogleRating || 0).toFixed(1)} ({school.reviewCount} reviews)
                  </span>
                </div>
                {address?.district && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{address.district}</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span>
                    {address?.street && `${address.street}, `}
                    {address?.city && `${address.city}, `}
                    {address?.voivodeship}
                  </span>
                </div>
                {contact?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>{contact.phone}</span>
                  </div>
                )}
                {contact?.website && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1 flex-shrink-0" />
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
              
              <p className="text-gray-700 max-w-4xl">
                {school.shortName && `Also known as ${school.shortName}. `}
                A {school.type.toLowerCase()} school established in {school.establishedYear || 'N/A'}.
                {school.studentCount && ` Currently serving ${school.studentCount.toLocaleString()} students.`}
              </p>
            </div>
            
            <div className="flex flex-col gap-3 lg:ml-8">
              <Button size="lg" className="w-full lg:w-auto">
                <Heart className="h-4 w-4 mr-2" />
                Save School
              </Button>
              <Button size="lg" variant="outline" onClick={handleShare} className="w-full lg:w-auto">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {contact?.website && (
                <Button size="lg" variant="outline" asChild className="w-full lg:w-auto">
                  <a href={contact.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </a>
                </Button>
              )}
              {contact?.email && (
                <Button size="lg" variant="outline" asChild className="w-full lg:w-auto">
                  <a href={`mailto:${contact.email}`}>
                    <Mail className="h-4 w-4 mr-2" />
                    Contact School
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="facilities">Facilities</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="rate">Rate</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Quick Stats
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {school.studentCount && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{school.studentCount.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Students</div>
                          </div>
                        )}
                        {school.establishedYear && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{school.establishedYear}</div>
                            <div className="text-sm text-gray-600">Established</div>
                          </div>
                        )}
                        {school.avgUserRating > 0 && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{school.avgUserRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">User Rating</div>
                          </div>
                        )}
                        {school.latestGoogleRating && (
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{school.latestGoogleRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600">Google Rating</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Languages & Specializations */}
                  {(languages || specializations) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <BookOpen className="h-5 w-5 mr-2" />
                          Academic Focus
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {languages && Array.isArray(languages) && languages.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Languages Offered</h4>
                            <div className="flex flex-wrap gap-2">
                              {languages.map((lang: string, index: number) => (
                                <Badge key={index} variant="outline">{lang}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {specializations && Array.isArray(specializations) && specializations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Specializations</h4>
                            <div className="flex flex-wrap gap-2">
                              {specializations.map((spec: string, index: number) => (
                                <Badge key={index} variant="secondary">{spec}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2" />
                      Location & Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Address</h4>
                      <p className="text-gray-600">
                        {address?.street && `${address.street}`}<br />
                        {address?.city && `${address.city} ${address.postal || ''}`}<br />
                        {address?.voivodeship && `${address.voivodeship}, Poland`}
                      </p>
                    </div>
                    
                    {(contact?.phone || contact?.email || contact?.website) && (
                      <div>
                        <h4 className="font-medium mb-2">Contact Information</h4>
                        <div className="space-y-2">
                          {contact?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact?.email && (
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2" />
                              <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                                {contact.email}
                              </a>
                            </div>
                          )}
                          {contact?.website && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Google Maps Integration */}
                    <GoogleMap 
                      address={address || {}}
                      schoolName={school.name}
                      className="mt-4"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>School Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PhotoGallery images={galleryImages} schoolName={school.name} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="facilities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2" />
                      Facilities & Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {facilities && Array.isArray(facilities) && facilities.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {facilities.map((facility: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Award className="h-4 w-4 mr-2 text-green-600" />
                            <span className="text-sm">{facility}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No facility information available.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <RatingDisplay schoolId={school.id} />
              </TabsContent>

              <TabsContent value="rate" className="mt-6">
                <RatingForm schoolId={school.id} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contact?.phone && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`tel:${contact.phone}`}>
                      <Phone className="h-4 w-4 mr-2" />
                      Call School
                    </a>
                  </Button>
                )}
                {contact?.email && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={`mailto:${contact.email}`}>
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                )}
                {contact?.website && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* School Info */}
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{school.type}</span>
                </div>
                {school.establishedYear && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Established:</span>
                    <span className="font-medium">{school.establishedYear}</span>
                  </div>
                )}
                {school.studentCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{school.studentCount.toLocaleString()}</span>
                  </div>
                )}
                {school.teacherCount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teachers:</span>
                    <span className="font-medium">{school.teacherCount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                    {school.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Similar Schools */}
            <SimilarSchools 
              currentSchoolId={school.id}
              currentSchoolType={school.type}
              currentSchoolLocation={address?.city}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
