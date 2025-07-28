'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FirstTimeModal } from './FirstTimeModal';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

// Dynamically import WelcomeTour to prevent SSR issues with intro.js
const WelcomeTour = dynamic(() => import('./WelcomeTour'), {
  ssr: false,
});

export function OnboardingManager() {
  const isOnboardingEnabled = useFeatureFlag('user_onboarding');
  const { shouldShowOnboarding } = useOnboarding();
  const [showTour, setShowTour] = useState(false);
  const [showModal, setShowModal] = useState(true);

  if (!isOnboardingEnabled || !shouldShowOnboarding) {
    return null;
  }

  const handleStartTour = () => {
    setShowModal(false);
    setShowTour(true);
  };

  const handleModalComplete = () => {
    setShowModal(false);
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const handleTourSkip = () => {
    setShowTour(false);
  };

  return (
    <>
      {showModal && (
        <FirstTimeModal
          onStartTour={handleStartTour}
          onComplete={handleModalComplete}
        />
      )}
      
      {showTour && (
        <WelcomeTour
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </>
  );
}

export default OnboardingManager;