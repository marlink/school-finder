'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { mockSchools } from '@/data/mockSchools'
import Link from 'next/link'
import Map from '@/components/maps/Map'
import SchoolMarker from '@/components/maps/SchoolMarker'
import { School } from '@/types/school'
import { getRatingColor, getContrastColor } from '@/utils/mapUtils'
import { getAppPath } from '@/lib/routeUtils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

// Funkcja generateStaticParams jest wymagana dla konfiguracji "output: export"
export function generateStaticParams() {
  return mockSchools.map((school) => ({
    id: school.id,
  }))
}

export default function SchoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  
  // Stan dla ładowania i danych szkoły
  const [loading, setLoading] = useState(true)
  const [school, setSchool] = useState<School | undefined>(undefined)
  
  // Pobierz dane szkoły na podstawie ID z parametrów
  useEffect(() => {
    if (params?.id) {
      // Symulacja ładowania danych
      setLoading(true)
      
      // Znajdź szkołę w danych mockowych
      const foundSchool = mockSchools.find(s => s.id === params.id)
      setSchool(foundSchool)
      setLoading(false)
    }
  }, [params?.id])
  
  // Handle case where school is not found
  if (!loading && !school) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">School Not Found</h1>
          <p className="mb-4 text-sm md:text-base">The school you are looking for does not exist or has been removed.</p>
          <Link href={getAppPath('/schools')} className="text-blue-600 hover:underline text-sm md:text-base">
            Return to Schools Directory
          </Link>
        </div>
      </div>
    )
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    )
  }
  
  // Get color for rating badge
  const ratingColor = getRatingColor(school?.rating)
  const textColor = getContrastColor(ratingColor)
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-blue-600 hover:underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Schools
        </button>
      </div>
      
      {/* School header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div className="w-full">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2">{school?.name}</h1>
          <div className="flex items-center gap-2 mb-2">
            {school?.rating !== undefined ? (
              <>
                <span 
                  className="px-2 py-1 rounded text-xs md:text-sm font-bold" 
                  style={{ backgroundColor: ratingColor, color: textColor }}
                >
                  {school.rating.toFixed(1)}
                </span>
                <span className="text-gray-600 text-xs md:text-sm">
                  {school.reviewCount} reviews
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-xs md:text-sm">No ratings yet</span>
            )}
          </div>
          <p className="text-gray-600 text-sm md:text-base">{school?.type}</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
          <Link 
            href={getAppPath(`/schools/${school?.id}/reviews`)}
            className="flex-1 md:flex-none text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs md:text-sm"
          >
            Write a Review
          </Link>
          <button className="flex-1 md:flex-none text-center px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-xs md:text-sm">
            Save to Favorites
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left column - School details */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl lg:text-2xl">About {school?.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm md:text-base">{school?.description}</p>
              
              <h3 className="font-semibold mb-3 text-base md:text-lg">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Address:</p>
                  <p className="text-sm md:text-base break-words">{school?.address}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Region:</p>
                  <p className="text-sm md:text-base">{school?.region}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Phone:</p>
                  <p className="text-sm md:text-base">{school?.phone || 'Not available'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Email:</p>
                  <p className="text-sm md:text-base break-words">{school?.email || 'Not available'}</p>
                </div>
                {school?.website && (
                  <div className="sm:col-span-2 bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Website:</p>
                    <a 
                      href={school.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm md:text-base break-words inline-block"
                    >
                      {school.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg md:text-xl">Reviews</CardTitle>
              <CardDescription className="text-xs md:text-sm">
                What parents and students are saying
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* This would be populated with actual reviews in a real app */}
              <div className="text-center py-4 md:py-6">
                <p className="text-gray-500 mb-3 md:mb-4 text-sm md:text-base">No reviews yet</p>
                <Link 
                  href={getAppPath(`/schools/${school?.id}/reviews`)}
                  className="text-blue-600 hover:underline text-sm md:text-base inline-block px-4 py-2 bg-blue-50 rounded-lg"
                >
                  Be the first to write a review
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column - Map and additional info */}
        <div>
          <Card className="mb-6">
            <CardContent className="p-0 overflow-hidden">
              {/* Map showing school location */}
              <div className="h-[250px] sm:h-[300px] w-full">
                {school && (
                  <Map 
                    initialCenter={[school.longitude, school.latitude]}
                    initialZoom={15}
                    className="h-[250px] sm:h-[300px] w-full"
                  >
                    <SchoolMarker
                      longitude={school.longitude}
                      latitude={school.latitude}
                      schoolName={school.name}
                      schoolId={school.id}
                      rating={school.rating}
                    />
                  </Map>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 text-base">Location</h3>
                <p className="text-sm break-words">{school?.address}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">School Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Type:</p>
                  <p className="text-sm md:text-base">{school?.type || 'Not specified'}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 mb-1 font-medium">Region:</p>
                  <p className="text-sm md:text-base">{school?.region || 'Not specified'}</p>
                </div>
                {/* Additional details would go here */}
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-gray-500">
                Last updated: {school?.updatedAt || 'Unknown'}
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}