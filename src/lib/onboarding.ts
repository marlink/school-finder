import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export interface OnboardingStatus {
  id: string;
  user_id: string;
  welcome_tour_completed: boolean;
  profile_setup_completed: boolean;
  first_search_completed: boolean;
  first_favorite_added: boolean;
  email_preferences_set: boolean;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
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
  private supabase = createClient();

  async getOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_onboarding_status')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching onboarding status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getOnboardingStatus:', error);
      return null;
    }
  }

  async createOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_onboarding_status')
        .insert({
          user_id: userId,
          welcome_tour_completed: false,
          profile_setup_completed: false,
          first_search_completed: false,
          first_favorite_added: false,
          email_preferences_set: false,
          onboarding_completed: false,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating onboarding status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createOnboardingStatus:', error);
      return null;
    }
  }

  async updateOnboardingStatus(
    userId: string,
    updates: Partial<Omit<OnboardingStatus, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<OnboardingStatus | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_onboarding_status')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating onboarding status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateOnboardingStatus:', error);
      return null;
    }
  }

  async markWelcomeTourCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      welcome_tour_completed: true,
    });
    return result !== null;
  }

  async markProfileSetupCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      profile_setup_completed: true,
    });
    return result !== null;
  }

  async markFirstSearchCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      first_search_completed: true,
    });
    return result !== null;
  }

  async markFirstFavoriteAdded(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      first_favorite_added: true,
    });
    return result !== null;
  }

  async markEmailPreferencesSet(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      email_preferences_set: true,
    });
    return result !== null;
  }

  async markOnboardingCompleted(userId: string): Promise<boolean> {
    const result = await this.updateOnboardingStatus(userId, {
      onboarding_completed: true,
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

    return !status.onboarding_completed;
  }

  async getOnboardingProgress(userId: string): Promise<number> {
    const status = await this.getOnboardingStatus(userId);
    
    if (!status) {
      return 0;
    }

    const steps = [
      status.welcome_tour_completed,
      status.profile_setup_completed,
      status.first_search_completed,
      status.first_favorite_added,
      status.email_preferences_set,
    ];

    const completedSteps = steps.filter(Boolean).length;
    return Math.round((completedSteps / steps.length) * 100);
  }
}

export const onboardingService = new OnboardingService();