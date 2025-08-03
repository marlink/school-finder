'use client';

import React, { useState, useEffect } from 'react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import { useUser } from '@/hooks/useUser';
import { onboardingService, ONBOARDING_STEPS } from '@/lib/onboarding';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface WelcomeTourProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function WelcomeTour({ onComplete, onSkip }: WelcomeTourProps) {
  const { user } = useUser();
  const isOnboardingEnabled = useFeatureFlag('user_onboarding');
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || !isOnboardingEnabled) {
        setLoading(false);
        return;
      }

      try {
        let status = await onboardingService.getOnboardingStatus(user.id);
        if (!status) {
          status = await onboardingService.createOnboardingStatus(user.id);
        }

        if (status && !status.welcome_tour_completed) {
          setRun(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, isOnboardingEnabled]);

    const onExit = () => {
    setRun(false);
    if (user) {
      onboardingService.markWelcomeTourCompleted(user.id);
      onComplete?.();
      onSkip?.();
    }
  };

  if (loading || !isOnboardingEnabled || !user || !isClient) {
    return null;
  }

  return (
    <Steps
      enabled={run}
      steps={ONBOARDING_STEPS}
      initialStep={stepIndex}
      onExit={onExit}
      options={{
        nextLabel: 'Next',
        prevLabel: 'Back',
        skipLabel: 'Skip tour',
        doneLabel: 'Finish',
        tooltipClass: 'custom-tooltip',
        highlightClass: 'custom-highlight',
      }}
    />
  );
}

export default WelcomeTour;