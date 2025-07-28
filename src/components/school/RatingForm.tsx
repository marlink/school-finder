'use client';

import React, { useState } from 'react';
import { Star, Send, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface RatingFormProps {
  schoolId: string;
  onRatingSubmitted?: () => void;
}

interface RatingData {
  overallRating: number;
  teachingQuality: number;
  facilities: number;
  safety: number;
  extracurricular: number;
  comment: string;
  isAnonymous: boolean;
}

const RatingForm: React.FC<RatingFormProps> = ({ schoolId, onRatingSubmitted }) => {
  const [ratings, setRatings] = useState<RatingData>({
    overallRating: 0,
    teachingQuality: 0,
    facilities: 0,
    safety: 0,
    extracurricular: 0,
    comment: '',
    isAnonymous: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<{ [key: string]: number }>({});

  const ratingCategories = [
    { key: 'overallRating', label: 'Ogólna ocena', description: 'Jak oceniasz szkołę ogólnie?' },
    { key: 'teachingQuality', label: 'Jakość nauczania', description: 'Poziom i metody nauczania' },
    { key: 'facilities', label: 'Infrastruktura', description: 'Stan budynków i wyposażenia' },
    { key: 'safety', label: 'Bezpieczeństwo', description: 'Poczucie bezpieczeństwa w szkole' },
    { key: 'extracurricular', label: 'Zajęcia dodatkowe', description: 'Oferta pozalekcyjna' }
  ];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (ratings.overallRating === 0) {
      toast.error('Proszę podać ogólną ocenę szkoły');
      return;
    }
    
    if (ratings.comment.trim().length < 10) {
      toast.error('Komentarz musi mieć co najmniej 10 znaków');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/schools/${schoolId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ratings),
      });

      if (!response.ok) {
        throw new Error('Błąd podczas wysyłania oceny');
      }

      toast.success('Ocena została pomyślnie dodana!');
      
      // Reset form
      setRatings({
        overallRating: 0,
        teachingQuality: 0,
        facilities: 0,
        safety: 0,
        extracurricular: 0,
        comment: '',
        isAnonymous: false
      });
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
      
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Wystąpił błąd podczas dodawania oceny');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (category: string, currentRating: number) => {
    const hovered = hoveredRating[category] || 0;
    const displayRating = hovered || currentRating;

    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-colors"
            onMouseEnter={() => setHoveredRating(prev => ({ ...prev, [category]: star }))}
            onMouseLeave={() => setHoveredRating(prev => ({ ...prev, [category]: 0 }))}
            onClick={() => handleRatingChange(category, star)}
          >
            <Star
              className={`w-6 h-6 ${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 hover:text-yellow-300'
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}/5` : 'Nie oceniono'}
        </span>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5 text-yellow-500" />
          <span>Oceń szkołę</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Categories */}
          <div className="space-y-4">
            {ratingCategories.map((category) => (
              <div key={category.key} className="space-y-2">
                <div>
                  <Label className="text-sm font-medium">{category.label}</Label>
                  <p className="text-xs text-gray-500">{category.description}</p>
                </div>
                {renderStarRating(category.key, ratings[category.key as keyof RatingData] as number)}
              </div>
            ))}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Komentarz</Label>
            <Textarea
              id="comment"
              placeholder="Podziel się swoimi doświadczeniami z tą szkołą..."
              value={ratings.comment}
              onChange={(e) => setRatings(prev => ({ ...prev, comment: e.target.value }))}
              className="min-h-[100px]"
              maxLength={1000}
            />
            <div className="text-xs text-gray-500 text-right">
              {ratings.comment.length}/1000 znaków
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {ratings.isAnonymous ? (
                <EyeOff className="w-5 h-5 text-gray-500" />
              ) : (
                <User className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <Label htmlFor="anonymous" className="text-sm font-medium">
                  Anonimowa ocena
                </Label>
                <p className="text-xs text-gray-500">
                  Twoje dane nie będą widoczne publicznie
                </p>
              </div>
            </div>
            <Switch
              id="anonymous"
              checked={ratings.isAnonymous}
              onCheckedChange={(checked: boolean) => 
                setRatings(prev => ({ ...prev, isAnonymous: checked }))
              }
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || ratings.overallRating === 0}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Wysyłanie...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Send className="w-4 h-4" />
                <span>Wyślij ocenę</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RatingForm;