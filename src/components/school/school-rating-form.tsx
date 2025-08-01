'use client';

import { useState } from 'react';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { StarRating } from '@/components/ui/star-rating';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SchoolRatingFormProps {
  schoolId: string;
  existingRating?: {
    overallRating: number;
    teachingQuality?: number;
    facilities?: number;
    safety?: number;
    extracurricular?: number;
    comment?: string;
    isAnonymous: boolean;
  };
  onRatingSubmitted?: () => void;
}

export function SchoolRatingForm({
  schoolId,
  existingRating,
  onRatingSubmitted
}: SchoolRatingFormProps) {
  const { user, isAuthenticated } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    overallRating: existingRating?.overallRating || 0,
    teachingQuality: existingRating?.teachingQuality || 0,
    facilities: existingRating?.facilities || 0,
    safety: existingRating?.safety || 0,
    extracurricular: existingRating?.extracurricular || 0,
    comment: existingRating?.comment || '',
    isAnonymous: existingRating?.isAnonymous || false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      setErrorMessage('Please sign in to rate schools');
      setSubmitStatus('error');
      return;
    }

    if (formData.overallRating === 0) {
      setErrorMessage('Please provide an overall rating');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          ...formData,
          // Only send non-zero optional ratings
          teachingQuality: formData.teachingQuality || undefined,
          facilities: formData.facilities || undefined,
          safety: formData.safety || undefined,
          extracurricular: formData.extracurricular || undefined,
          comment: formData.comment.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit rating');
      }

      setSubmitStatus('success');
      onRatingSubmitted?.();

      // Reset form if it was a new rating
      if (!existingRating) {
        setFormData({
          overallRating: 0,
          teachingQuality: 0,
          facilities: 0,
          safety: 0,
          extracurricular: 0,
          comment: '',
          isAnonymous: false
        });
      }

    } catch (error) {
      console.error('Rating submission error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit rating');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rate this School</CardTitle>
          <CardDescription>
            Please sign in to rate and review schools
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingRating ? 'Update Your Rating' : 'Rate this School'}
        </CardTitle>
        <CardDescription>
          Share your experience to help other parents make informed decisions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label htmlFor="overall-rating" className="text-base font-medium">
              Overall Rating *
            </Label>
            <StarRating
              value={formData.overallRating}
              onChange={(value) => setFormData(prev => ({ ...prev, overallRating: value }))}
              size="lg"
              showValue
            />
          </div>

          {/* Category Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Teaching Quality</Label>
              <StarRating
                value={formData.teachingQuality}
                onChange={(value) => setFormData(prev => ({ ...prev, teachingQuality: value }))}
                showValue
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Facilities</Label>
              <StarRating
                value={formData.facilities}
                onChange={(value) => setFormData(prev => ({ ...prev, facilities: value }))}
                showValue
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Safety</Label>
              <StarRating
                value={formData.safety}
                onChange={(value) => setFormData(prev => ({ ...prev, safety: value }))}
                showValue
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Extracurricular</Label>
              <StarRating
                value={formData.extracurricular}
                onChange={(value) => setFormData(prev => ({ ...prev, extracurricular: value }))}
                showValue
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-medium">
              Comment (optional)
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about this school..."
              value={formData.comment}
              onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, isAnonymous: Boolean(checked) }))
              }
            />
            <Label htmlFor="anonymous" className="text-sm">
              Submit anonymously
            </Label>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {existingRating ? 'Your rating has been updated!' : 'Thank you for your rating!'}
              </AlertDescription>
            </Alert>
          )}

          {submitStatus === 'error' && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {errorMessage}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || formData.overallRating === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              existingRating ? 'Update Rating' : 'Submit Rating'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
