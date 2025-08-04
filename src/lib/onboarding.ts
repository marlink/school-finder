import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface OnboardingStatus {
  id: string;
  userId: string;
  welcomeTourCompleted: boolean;
  profileSetupCompleted: boolean;
  firstSearchCompleted: boolean;
  firstFavoriteAdded: boolean;
  emailPreferencesSet: boolean;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OnboardingStep {
  id: string;
  title: string;
  intro: string;
  element: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  disableBeacon?: boolean;
  hideCloseButton?: boolean;
  hideFooter?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  spotlightClicks?: boolean;
  styles?: {
    options?: {
      primaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
      overlayColor?: string;
      spotlightShadow?: string;
      zIndex?: number;
    };
  };
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to School Finder! 🎓',
    intro: 'Let\'s take a quick tour to help you find the perfect school for your needs.',
    element: 'body',
    position: 'center',
    disableBeacon: true,
    hideCloseButton: true,
    showProgress: true,
  },
  {
    id: 'search',
    title: 'Start Your Search',
    intro: 'Use our powerful search to find schools by location, type, or specific criteria.',
    element: '[data-tour="search-form"]',
    position: 'bottom',
    showProgress: true,
  },
  {
    id: 'filters',
    title: 'Refine Your Results',
    intro: 'Use filters to narrow down schools based on your preferences like school type, ratings, and more.',
    element: '[data-tour="search-filters"]',
    position: 'right',
    showProgress: true,
  },
  {
    id: 'school-card',
    title: 'Explore School Details',
    intro: 'Click on any school card to view detailed information, photos, and reviews.',
    element: '[data-tour="school-card"]',
    position: 'top',
    showProgress: true,
  },
  {
    id: 'favorites',
    title: 'Save Your Favorites',
    intro: 'Click the heart icon to save schools to your favorites list for easy access later.',
    element: '[data-tour="favorite-button"]',
    position: 'top',
    showProgress: true,
  },
  {
    id: 'profile',
    title: 'Manage Your Profile',
    intro: 'Access your profile to view saved schools, search history, and preferences.',
    element: '[data-tour="profile-menu"]',
    position: 'bottom',
    showProgress: true,
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🎉',
    intro: 'You\'re ready to start finding the perfect school. Happy searching!',
    element: 'body',
    position: 'center',
    disableBeacon: true,
    hideCloseButton: true,
    showProgress: true,
  },
];

export class OnboardingService {
  async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      const status = await prisma.userOnboardingStatus.findUnique({
        where: { userId },
      });

      return status;
    } catch (error) {
      console.error('Error in getOnboardingStatus:', error);
      return null;
    }
  }

  async createOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      const status = await prisma.userOnboardingStatus.create({
        data: {
          userId,
          welcomeTourCompleted: false,
          profileSetupCompleted: false,
          firstSearchCompleted: false,
          firstFavoriteAdded: false,
          emailPreferencesSet: false,
          onboardingCompleted: false,
        },
      });

      return status;
    } catch (error) {
      console.error('Error in createOnboardingStatus:', error);
      return null;
    }
  }

  async updateOnboardingStatus(
    userId: string,
    updates: Partial<Omit<OnboardingStatus, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<OnboardingStatus | null> {
    try {
      const status = await prisma.userOnboardingStatus.upsert({
        where: { userId },
        update: updates,
        create: {
          userId,
          welcomeTourCompleted: false,
          profileSetupCompleted: false,
          firstSearchCompleted: false,
          firstFavoriteAdded: false,
          emailPreferencesSet: false,
          onboardingCompleted: false,
          ...updates,
        },
      });

      return status;
    } catch (error) {
      console.error('Error in updateOnboardingStatus:', error);
      return null;
    }
  }

  async markWelcomeTourCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      welcomeTourCompleted: true,
    });
    return result !== null;
  }

  async markProfileSetupCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      profileSetupCompleted: true,
    });
    return result !== null;
  }

  async markFirstSearchCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      firstSearchCompleted: true,
    });
    return result !== null;
  }

  async markFirstFavoriteAdded(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      firstFavoriteAdded: true,
    });
    return result !== null;
  }

  async markEmailPreferencesSet(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      emailPreferencesSet: true,
    });
    return result !== null;
  }

  async markOnboardingCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      onboardingCompleted: true,
    });
    return result !== null;
  }

  async shouldShowOnboarding(userId: string): Promise<boolean> {
    const status = await this.getOnboardingStatus(userId);
    
    if (!status) {
      // Create initial status for new users
      await this.createOnboardingStatus(userId);
      return true;
    }

    return !status.onboardingCompleted;
  }

  async getOnboardingProgress(userId: string): Promise<number> {
    const status = await this.getOnboardingStatus(userId);
    
    if (!status) {
      return 0;
    }

    const steps = [
      status.welcomeTourCompleted,
      status.profileSetupCompleted,
      status.firstSearchCompleted,
      status.firstFavoriteAdded,
      status.emailPreferencesSet,
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  }
}

export const onboardingService = new OnboardingService();