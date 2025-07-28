'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRatingDisplay } from '@/components/ui/star-rating';
import { Loader2, User, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RatingData {
  userRating: {
    overallRating: number;
    teachingQuality?: number;
    facilities?: number;
    safety?: number;
    extracurricular?: number;
    comment?: string;
    isAnonymous: boolean;
  } | null;
  averages: {
    overall: number;
    teachingQuality: number;
    facilities: number;
    safety: number;
    extracurricular: number;
  };
  totalRatings: number;
  reviews: Array<{
    overallRating: number;
    teachingQuality?: number;
    facilities?: number;
    safety?: number;
    extracurricular?: number;
    comment?: string;
    createdAt: string;
    author: {
      name: string;
      image?: string;
    } | null;
  }>;
}

interface SchoolRatingsDisplayProps {
  schoolId: string;
  refreshTrigger?: number;
}

export function SchoolRatingsDisplay({ schoolId, refreshTrigger }: SchoolRatingsDisplayProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = new URL('/api/ratings', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
      url.searchParams.set('schoolId', schoolId);
      if (session?.user?.id) {
        url.searchParams.set('userId', session.user.id);
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      setRatingData(data);
    } catch (err) {
      console.error('Error fetching ratings:', err);
      setError('Failed to load ratings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [schoolId, session?.user?.id, refreshTrigger]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading ratings...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!ratingData) {
    return null;
  }

  const { averages, totalRatings, reviews } = ratingData;

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            School Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600 mb-2">
                  {averages.overall.toFixed(1)}
                </div>
                <StarRatingDisplay
                  rating={averages.overall}
                  totalRatings={totalRatings}
                  size="lg"
                  className="justify-center"
                />
              </div>
            </div>

            {/* Category Ratings */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">
                Category Ratings
              </h3>
              
              {averages.teachingQuality > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Teaching Quality</span>
                  <StarRatingDisplay rating={averages.teachingQuality} size="sm" />
                </div>
              )}
              
              {averages.facilities > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Facilities</span>
                  <StarRatingDisplay rating={averages.facilities} size="sm" />
                </div>
              )}
              
              {averages.safety > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Safety</span>
                  <StarRatingDisplay rating={averages.safety} size="sm" />
                </div>
              )}
              
              {averages.extracurricular > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">Extracurricular</span>
                  <StarRatingDisplay rating={averages.extracurricular} size="sm" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Reviews */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>User Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <Avatar className="h-10 w-10">
                      {review.author?.image ? (
                        <AvatarImage src={review.author.image} alt={review.author.name} />
                      ) : (
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 space-y-3">
                      {/* User Info & Rating */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">
                            {review.author?.name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                        <StarRatingDisplay rating={Number(review.overallRating)} />
                      </div>

                      {/* Category Ratings */}
                      {(review.teachingQuality || review.facilities || review.safety || review.extracurricular) && (
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {review.teachingQuality && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Teaching:</span>
                              <StarRatingDisplay rating={Number(review.teachingQuality)} size="sm" />
                            </div>
                          )}
                          {review.facilities && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Facilities:</span>
                              <StarRatingDisplay rating={Number(review.facilities)} size="sm" />
                            </div>
                          )}
                          {review.safety && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Safety:</span>
                              <StarRatingDisplay rating={Number(review.safety)} size="sm" />
                            </div>
                          )}
                          {review.extracurricular && (
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">Activities:</span>
                              <StarRatingDisplay rating={Number(review.extracurricular)} size="sm" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Comment */}
                      {review.comment && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Reviews Message */}
      {totalRatings === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No ratings yet</p>
            <p className="text-sm text-gray-400">
              Be the first to rate this school and help other parents!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
