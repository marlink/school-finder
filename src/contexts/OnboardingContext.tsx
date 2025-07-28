'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@/hooks/useUser';
import { onboardingService, OnboardingStatus } from '@/lib/onboarding';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface OnboardingContextType {
  status: OnboardingStatus | null;
  progress: number;
  isLoading: boolean;
  shouldShowOnboarding: boolean;
  refreshStatus: () => Promise<void>;
  markWelcomeTourCompleted: () => Promise<void>;
  markProfileSetupCompleted: () => Promise<void>;
  markFirstSearchCompleted: () => Promise<void>;
  markFirstFavoriteAdded: () => Promise<void>;
  markEmailPreferencesSet: () => Promise<void>;
  markOnboardingCompleted: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user } = useUser();
  const isOnboardingEnabled = useFeatureFlag('user_onboarding');
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  const refreshStatus = async () => {
    if (!user || !isOnboardingEnabled) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [onboardingStatus, progressPercentage, shouldShow] = await Promise.all([
        onboardingService.getOnboardingStatus(user.id),
        onboardingService.getOnboardingProgress(user.id),
        onboardingService.shouldShowOnboarding(user.id),
      ]);

      setStatus(onboardingStatus);
      setProgress(progressPercentage);
      setShouldShowOnboarding(shouldShow);
    } catch (error) {
      console.error('Error refreshing onboarding status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, [user, isOnboardingEnabled]);

  const markWelcomeTourCompleted = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markWelcomeTourCompleted(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking welcome tour completed:', error);
    }
  };

  const markProfileSetupCompleted = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markProfileSetupCompleted(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking profile setup completed:', error);
    }
  };

  const markFirstSearchCompleted = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markFirstSearchCompleted(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking first search completed:', error);
    }
  };

  const markFirstFavoriteAdded = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markFirstFavoriteAdded(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking first favorite added:', error);
    }
  };

  const markEmailPreferencesSet = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markEmailPreferencesSet(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking email preferences set:', error);
    }
  };

  const markOnboardingCompleted = async () => {
    if (!user) return;
    
    try {
      await onboardingService.markOnboardingCompleted(user.id);
      await refreshStatus();
    } catch (error) {
      console.error('Error marking onboarding completed:', error);
    }
  };

  const value: OnboardingContextType = {
    status,
    progress,
    isLoading,
    shouldShowOnboarding,
    refreshStatus,
    markWelcomeTourCompleted,
    markProfileSetupCompleted,
    markFirstSearchCompleted,
    markFirstFavoriteAdded,
    markEmailPreferencesSet,
    markOnboardingCompleted,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingProvider;