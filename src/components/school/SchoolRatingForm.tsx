'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';

interface SchoolRatingFormProps {
  schoolId: string;
}

export default function SchoolRatingForm({ schoolId }: SchoolRatingFormProps) {
  const [overallRating, setOverallRating] = useState(0);
  const [teachingQuality, setTeachingQuality] = useState(0);
  const [facilities, setFacilities] = useState(0);
  const [safety, setSafety] = useState(0);
  const [extracurricular, setExtracurricular] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (overallRating === 0) {
      alert('Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/schools/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          overallRating,
          teachingQuality: teachingQuality || null,
          facilities: facilities || null,
          safety: safety || null,
          extracurricular: extracurricular || null,
          comment: comment.trim() || null,
          isAnonymous,
        }),
      });

      if (response.ok) {
        alert('Rating submitted successfully!');
        // Reset form
        setOverallRating(0);
        setTeachingQuality(0);
        setFacilities(0);
        setSafety(0);
        setExtracurricular(0);
        setComment('');
        setIsAnonymous(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (rating: number, setRating: (rating: number) => void, label: string) => (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 ${
                i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? `${rating}/5` : 'Not rated'}
        </span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overall Rating - Required */}
      <div className="space-y-4">
        {renderStarRating(overallRating, setOverallRating, 'Overall Rating *')}
      </div>

      {/* Optional Detailed Ratings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderStarRating(teachingQuality, setTeachingQuality, 'Teaching Quality')}
        {renderStarRating(facilities, setFacilities, 'Facilities')}
        {renderStarRating(safety, setSafety, 'Safety')}
        {renderStarRating(extracurricular, setExtracurricular, 'Extracurricular Activities')}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Comment (Optional)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this school..."
          rows={4}
          maxLength={1000}
        />
        <div className="text-xs text-gray-500 text-right">
          {comment.length}/1000 characters
        </div>
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="rounded border-gray-300"
        />
        <label htmlFor="anonymous" className="text-sm">
          Submit anonymously
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || overallRating === 0}
        className="w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Rating'}
      </Button>

      <p className="text-xs text-gray-500">
        * Overall rating is required. All other ratings are optional.
      </p>
    </form>
  );
}