'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

interface SimilarSchool {
  id: string;
  name: string;
  type: string;
  address: string;
  averageRating?: number;
  totalRatings?: number;
  studentCount?: number;
  establishedYear?: number;
  distance?: number;
}

interface SimilarSchoolsProps {
  currentSchoolId: string;
  currentSchoolType?: string;
  currentSchoolLocation?: string;
  limit?: number;
}

export default function SimilarSchools({ 
  currentSchoolId, 
  currentSchoolType, 
  currentSchoolLocation,
  limit = 4 
}: SimilarSchoolsProps) {
  const [schools, setSchools] = React.useState<SimilarSchool[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSimilarSchools = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          currentSchoolId,
          limit: limit.toString(),
        });

        if (currentSchoolType) {
          params.append('type', currentSchoolType);
        }
        if (currentSchoolLocation) {
          params.append('location', currentSchoolLocation);
        }

        const response = await fetch(`/api/schools/similar?${params}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch similar schools');
        }

        const data = await response.json();
        setSchools(data.schools || []);
      } catch (err) {
        console.error('Error fetching similar schools:', err);
        setError('Failed to load similar schools');
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarSchools();
  }, [currentSchoolId, currentSchoolType, currentSchoolLocation, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (schools.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Similar Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No similar schools found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Similar Schools</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schools.map((school) => (
          <div key={school.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
            <div className="space-y-2">
              <div>
                <Link 
                  href={`/schools/${school.id}`}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {school.name}
                </Link>
                <Badge variant="secondary" className="ml-2 text-xs">
                  {school.type}
                </Badge>
              </div>

              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">{school.address}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  {school.averageRating && (
                    <div className="flex items-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{school.averageRating.toFixed(1)}</span>
                      {school.totalRatings && (
                        <span className="ml-1">({school.totalRatings})</span>
                      )}
                    </div>
                  )}

                  {school.studentCount && (
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      <span>{school.studentCount.toLocaleString()}</span>
                    </div>
                  )}

                  {school.establishedYear && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{school.establishedYear}</span>
                    </div>
                  )}
                </div>

                {school.distance && (
                  <div className="text-blue-600">
                    {school.distance.toFixed(1)} km away
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2">
          <Link href="/search">
            <Button variant="outline" className="w-full">
              Find More Schools
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}