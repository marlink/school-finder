'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUser';
import { onboardingService } from '@/lib/onboarding';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  GraduationCap,
  Search,
  Heart,
  MapPin,
  Star,
  Users,
  BookOpen,
  Award,
  CheckCircle,
} from 'lucide-react';

interface FirstTimeModalProps {
  onComplete?: () => void;
  onStartTour?: () => void;
}

export function FirstTimeModal({ onComplete, onStartTour }: FirstTimeModalProps) {
  const { user } = useUser();
  const isOnboardingEnabled = useFeatureFlag('user_onboarding');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFirstTime = async () => {
      if (!user || !isOnboardingEnabled) {
        setLoading(false);
        return;
      }

      try {
        const status = await onboardingService.getOnboardingStatus(user.id);
        
        // Show modal if user is new (no onboarding status) or hasn't completed welcome tour
        if (!status || !status.welcomeTourCompleted) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkFirstTime();
  }, [user, isOnboardingEnabled]);

  const handleStartTour = () => {
    setIsOpen(false);
    onStartTour?.();
  };

  const handleSkip = async () => {
    setIsOpen(false);
    
    if (user) {
      try {
        await onboardingService.markWelcomeTourCompleted(user.id);
      } catch (error) {
        console.error('Error marking tour as skipped:', error);
      }
    }
    
    onComplete?.();
  };

  if (loading || !isOnboardingEnabled) {
    return null;
  }

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find schools by location, type, ratings, and more',
    },
    {
      icon: MapPin,
      title: 'Interactive Maps',
      description: 'Explore schools on detailed maps with directions',
    },
    {
      icon: Heart,
      title: 'Save Favorites',
      description: 'Keep track of schools you\'re interested in',
    },
    {
      icon: Star,
      title: 'Reviews & Ratings',
      description: 'Read authentic reviews from parents and students',
    },
    {
      icon: Users,
      title: 'Community Insights',
      description: 'Connect with other parents in your area',
    },
    {
      icon: Award,
      title: 'School Rankings',
      description: 'Compare schools with comprehensive rankings',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <GraduationCap className="w-8 h-8 text-blue-600" />
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Welcome to School Finder! 🎓
          </DialogTitle>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your journey to finding the perfect school starts here. We've built powerful tools 
            to help you discover, compare, and choose the best educational opportunities for your needs.
          </p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:border-blue-300 transition-colors">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Schools Listed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">50,000+</div>
                <div className="text-sm text-gray-600">Parent Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              What's Next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Take a quick tour to learn the key features
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Set up your search preferences
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 mr-3 text-green-500" />
                Start exploring schools in your area
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={handleStartTour}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              Start the Tour
            </Button>
            <Button 
              onClick={handleSkip}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              Skip for Now
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can always access the tour later from your profile settings
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FirstTimeModal;