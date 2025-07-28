'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUser';
import { onboardingService, OnboardingStatus } from '@/lib/onboarding';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import {
  CheckCircle,
  Circle,
  Play,
  User,
  Search,
  Heart,
  Mail,
  Trophy,
  ArrowRight,
} from 'lucide-react';

interface OnboardingProgressProps {
  onStartTour?: () => void;
  className?: string;
}

export function OnboardingProgress({ onStartTour, className }: OnboardingProgressProps) {
  const { user } = useUser();
  const isOnboardingEnabled = useFeatureFlag('user_onboarding');
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnboardingData = async () => {
      if (!user || !isOnboardingEnabled) {
        setLoading(false);
        return;
      }

      try {
        const [onboardingStatus, progressPercentage] = await Promise.all([
          onboardingService.getOnboardingStatus(user.id),
          onboardingService.getOnboardingProgress(user.id),
        ]);

        setStatus(onboardingStatus);
        setProgress(progressPercentage);
      } catch (error) {
        console.error('Error fetching onboarding data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOnboardingData();
  }, [user, isOnboardingEnabled]);

  if (loading || !isOnboardingEnabled || !user || !status) {
    return null;
  }

  // Don't show if onboarding is completed
  if (status.onboarding_completed) {
    return null;
  }

  const steps = [
    {
      id: 'welcome_tour',
      title: 'Welcome Tour',
      description: 'Learn the basics of School Finder',
      completed: status.welcome_tour_completed,
      icon: Play,
      action: onStartTour,
      actionText: 'Start Tour',
    },
    {
      id: 'profile_setup',
      title: 'Profile Setup',
      description: 'Complete your profile information',
      completed: status.profile_setup_completed,
      icon: User,
      action: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/profile';
        }
      },
      actionText: 'Setup Profile',
    },
    {
      id: 'first_search',
      title: 'First Search',
      description: 'Try searching for schools',
      completed: status.first_search_completed,
      icon: Search,
      action: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/search';
        }
      },
      actionText: 'Start Searching',
    },
    {
      id: 'first_favorite',
      title: 'Save a Favorite',
      description: 'Add a school to your favorites',
      completed: status.first_favorite_added,
      icon: Heart,
      action: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/search';
        }
      },
      actionText: 'Find Schools',
    },
    {
      id: 'email_preferences',
      title: 'Email Preferences',
      description: 'Set up your notification preferences',
      completed: status.email_preferences_set,
      icon: Mail,
      action: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/profile/notifications';
        }
      },
      actionText: 'Set Preferences',
    },
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const nextStep = steps.find(step => !step.completed);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Getting Started</CardTitle>
          <Badge variant={progress === 100 ? 'default' : 'secondary'}>
            {completedSteps}/{steps.length} Complete
          </Badge>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-600">
            {progress === 100 
              ? 'Congratulations! You\'ve completed the onboarding process.' 
              : `${progress}% complete - ${nextStep?.title} is next`
            }
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
              step.completed 
                ? 'bg-green-50 border-green-200' 
                : index === completedSteps 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 ${
                step.completed ? 'text-green-600' : 'text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className={`font-medium ${
                  step.completed ? 'text-green-900' : 'text-gray-900'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm ${
                  step.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>
            </div>

            {!step.completed && step.action && (
              <Button
                size="sm"
                variant={index === completedSteps ? 'default' : 'outline'}
                onClick={step.action}
                className="flex-shrink-0"
              >
                {step.actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}

            {step.completed && (
              <Badge variant="secondary" className="flex-shrink-0">
                <CheckCircle className="w-3 h-3 mr-1" />
                Done
              </Badge>
            )}
          </div>
        ))}

        {progress === 100 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <Trophy className="w-6 h-6 text-yellow-600" />
              <div>
                <h4 className="font-semibold text-gray-900">All Set! 🎉</h4>
                <p className="text-sm text-gray-600">
                  You're ready to make the most of School Finder. Happy searching!
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default OnboardingProgress;