# User Onboarding

## Overview
The School Finder Portal implements a smooth onboarding process to help new users understand the platform and get the most value from it.

## Onboarding Flow

### Welcome Tour
New users are guided through a brief tour highlighting key features:

```jsx
// components/WelcomeTour.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Joyride, { STATUS } from 'react-joyride';

export function WelcomeTour() {
  const { data: session } = useSession();
  const [runTour, setRunTour] = useState(false);
  
  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (session?.user && !hasSeenTour) {
      setRunTour(true);
    }
  }, [session]);
  
  const handleTourEnd = (data) => {
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status)) {
      localStorage.setItem('hasSeenTour', 'true');
      setRunTour(false);
    }
  };
  
  const steps = [
    {
      target: '.search-component',
      content: 'Start by searching for schools in your area',
      disableBeacon: true,
    },
    {
      target: '.filter-component',
      content: 'Use filters to narrow down your search results',
    },
    {
      target: '.school-card',
      content: 'Click on a school to see detailed information',
    },
    {
      target: '.favorite-button',
      content: 'Save schools to your favorites for easy access later',
    },
    {
      target: '.user-profile',
      content: 'View your profile to manage your account and see your saved schools',
    },
  ];
  
  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showSkipButton
      callback={handleTourEnd}
      styles={{
        options: {
          primaryColor: '#f97316', // orange-500
        },
      }}
    />
  );
}
```

### First-Time User Modal
```jsx
// components/FirstTimeModal.jsx
'use client';
import { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';

export function FirstTimeModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    const hasSeenModal = localStorage.getItem('hasSeenWelcomeModal');
    if (!hasSeenModal) {
      setIsOpen(true);
    }
  }, []);
  
  const handleClose = () => {
    localStorage.setItem('hasSeenWelcomeModal', 'true');
    setIsOpen(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <Dialog.Title>Welcome to School Finder!</Dialog.Title>
          <Dialog.Description>
            Your journey to finding the perfect school starts here.
          </Dialog.Description>
        </Dialog.Header>
        
        <div className="space-y-4 py-4">
          <p>With School Finder, you can:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Search through thousands of schools</li>
            <li>Filter by location, type, and ratings</li>
            <li>Save your favorite schools</li>
            <li>Get detailed information about each school</li>
          </ul>
          <p>Ready to get started?</p>
        </div>
        
        <Dialog.Footer>
          <button 
            onClick={handleClose}
            className="w-full px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Let's Go!
          </button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
```

## Email Onboarding

### Welcome Email Template
```jsx
// emails/WelcomeEmail.jsx
import { 
  Body, Container, Head, Heading, Html, 
  Link, Preview, Text 
} from '@react-email/components';

export function WelcomeEmail({ name, loginLink }) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to School Finder Portal!</Preview>
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container>
          <Heading>
            Welcome to School Finder, {name}!
          </Heading>
          
          <Text>
            Thank you for joining School Finder Portal. We're excited to help you
            find the perfect school for your needs.
          </Text>
          
          <Text>
            Here's what you can do with your new account:
          </Text>
          
          <ul>
            <li>Search for schools in your area</li>
            <li>Save your favorite schools</li>
            <li>Get detailed information about each school</li>
            <li>Read and write reviews</li>
          </ul>
          
          <Text>
            Click the button below to log in and start exploring:
          </Text>
          
          <Link 
            href={loginLink}
            style={{
              display: 'inline-block',
              padding: '12px 20px',
              backgroundColor: '#f97316',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              marginTop: '16px',
            }}
          >
            Log In to School Finder
          </Link>
          
          <Text style={{ marginTop: '32px', fontSize: '14px', color: '#666' }}>
            If you have any questions, please contact our support team at
            support@schoolfinder.example.com
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Progress Tracking

### User Completion Status
Track user progress through key actions:

```typescript
// lib/onboarding.ts
import { prisma } from './prisma';

export async function updateUserOnboardingStatus(userId: string, action: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { onboardingStatus: true },
  });
  
  if (!user) return null;
  
  // Create onboarding status if it doesn't exist
  if (!user.onboardingStatus) {
    return prisma.onboardingStatus.create({
      data: {
        userId,
        [action]: true,
      },
    });
  }
  
  // Update existing onboarding status
  return prisma.onboardingStatus.update({
    where: { userId },
    data: {
      [action]: true,
    },
  });
}
```