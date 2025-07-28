'use client';

import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, User, Calendar, Filter, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Rating {
  id: string;
  overallRating: number;
  teachingQuality: number;
  facilities: number;
  safety: number;
  extracurricular: number;
  comment: string;
  isAnonymous: boolean;
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
  userId?: string;
}

interface RatingDisplayProps {
  schoolId: string;
  refreshTrigger?: number;
}

interface RatingSummary {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
  categoryAverages: {
    teachingQuality: number;
    facilities: number;
    safety: number;
    extracurricular: number;
  };
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({ schoolId, refreshTrigger = 0 }) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest');
  const [filterBy, setFilterBy] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [schoolId, refreshTrigger, sortBy, filterBy]);

  const fetchRatings = async (pageNum = 1) => {
    try {
      setLoading(pageNum === 1);
      
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '10',
        sortBy,
        ...(filterBy !== 'all' && { rating: filterBy })
      });

      const response = await fetch(`/api/schools/${schoolId}/ratings?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch ratings');
      }

      const data = await response.json();
      
      if (pageNum === 1) {
        setRatings(data.ratings);
        setSummary(data.summary);
      } else {
        setRatings(prev => [...prev, ...data.ratings]);
      }
      
      setHasMore(data.hasMore);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchRatings(page + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!summary) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = summary.ratingDistribution[stars] || 0;
          const percentage = summary.totalRatings > 0 ? (count / summary.totalRatings) * 100 : 0;
          
          return (
            <div key={stars} className="flex items-center space-x-2 text-sm">
              <span className="w-8">{stars}★</span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderCategoryAverages = () => {
    if (!summary) return null;

    const categories = [
      { key: 'teachingQuality', label: 'Nauczanie', value: summary.categoryAverages.teachingQuality },
      { key: 'facilities', label: 'Infrastruktura', value: summary.categoryAverages.facilities },
      { key: 'safety', label: 'Bezpieczeństwo', value: summary.categoryAverages.safety },
      { key: 'extracurricular', label: 'Zajęcia dodatkowe', value: summary.categoryAverages.extracurricular }
    ];

    return (
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <div key={category.key} className="text-center">
            <div className="text-sm text-gray-600 mb-1">{category.label}</div>
            {renderStars(category.value)}
          </div>
        ))}
      </div>
    );
  };

  if (loading && ratings.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Podsumowanie ocen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Overall Rating */}
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">{summary.averageRating.toFixed(1)}</div>
                {renderStars(summary.averageRating, 'lg')}
                <div className="text-sm text-gray-600 mt-1">
                  {summary.totalRatings} {summary.totalRatings === 1 ? 'ocena' : 'ocen'}
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="font-medium mb-3">Rozkład ocen</h4>
                {renderRatingDistribution()}
              </div>

              {/* Category Averages */}
              <div>
                <h4 className="font-medium mb-3">Średnie w kategoriach</h4>
                {renderCategoryAverages()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Sorting */}
      <div className="flex flex-wrap gap-4 items-center">
        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sortuj według" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze</SelectItem>
            <SelectItem value="oldest">Najstarsze</SelectItem>
            <SelectItem value="highest">Najwyższe oceny</SelectItem>
            <SelectItem value="lowest">Najniższe oceny</SelectItem>
            <SelectItem value="helpful">Najbardziej pomocne</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtruj według oceny" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie oceny</SelectItem>
            <SelectItem value="5">5 gwiazdek</SelectItem>
            <SelectItem value="4">4 gwiazdki</SelectItem>
            <SelectItem value="3">3 gwiazdki</SelectItem>
            <SelectItem value="2">2 gwiazdki</SelectItem>
            <SelectItem value="1">1 gwiazdka</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Ratings List */}
      <div className="space-y-4">
        {ratings.map((rating) => (
          <Card key={rating.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {rating.isAnonymous ? 'Użytkownik anonimowy' : 'Użytkownik'}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(rating.createdAt)}</span>
                      {rating.isVerified && (
                        <Badge variant="secondary" className="text-xs">
                          Zweryfikowany
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {renderStars(rating.overallRating)}
              </div>

              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-gray-600">Nauczanie:</span>
                  <div className="flex items-center mt-1">
                    {renderStars(rating.teachingQuality)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Infrastruktura:</span>
                  <div className="flex items-center mt-1">
                    {renderStars(rating.facilities)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Bezpieczeństwo:</span>
                  <div className="flex items-center mt-1">
                    {renderStars(rating.safety)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Zajęcia dodatkowe:</span>
                  <div className="flex items-center mt-1">
                    {renderStars(rating.extracurricular)}
                  </div>
                </div>
              </div>

              {/* Comment */}
              {rating.comment && (
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
                </div>
              )}

              {/* Helpful Votes */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Pomocne ({rating.helpfulVotes})
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Ładowanie...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <ChevronDown className="w-4 h-4" />
                <span>Pokaż więcej ocen</span>
              </div>
            )}
          </Button>
        </div>
      )}

      {/* No Ratings */}
      {!loading && ratings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak ocen
            </h3>
            <p className="text-gray-500">
              Ta szkoła nie ma jeszcze żadnych ocen. Bądź pierwszy i podziel się swoją opinią!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RatingDisplay;