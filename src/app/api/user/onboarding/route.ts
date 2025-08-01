import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { onboardingService } from '@/lib/onboarding';

export async function GET(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await onboardingService.getOnboardingStatus(user.id);
    const progress = await onboardingService.getOnboardingProgress(user.id);
    const shouldShow = await onboardingService.shouldShowOnboarding(user.id);

    return NextResponse.json({
      status,
      progress,
      shouldShowOnboarding: shouldShow,
    });
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...updates } = body;

    let result;

    switch (action) {
      case 'mark_welcome_tour_completed':
        result = await onboardingService.markWelcomeTourCompleted(user.id);
        break;
      case 'mark_profile_setup_completed':
        result = await onboardingService.markProfileSetupCompleted(user.id);
        break;
      case 'mark_first_search_completed':
        result = await onboardingService.markFirstSearchCompleted(user.id);
        break;
      case 'mark_first_favorite_added':
        result = await onboardingService.markFirstFavoriteAdded(user.id);
        break;
      case 'mark_email_preferences_set':
        result = await onboardingService.markEmailPreferencesSet(user.id);
        break;
      case 'mark_onboarding_completed':
        result = await onboardingService.markOnboardingCompleted(user.id);
        break;
      case 'update_status':
        result = await onboardingService.updateOnboardingStatus(user.id, updates);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      );
    }

    // Return updated status and progress
    const status = await onboardingService.getOnboardingStatus(user.id);
    const progress = await onboardingService.getOnboardingProgress(user.id);

    return NextResponse.json({
      success: true,
      status,
      progress,
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    
    const result = await onboardingService.updateOnboardingStatus(user.id, updates);

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to update onboarding status' },
        { status: 500 }
      );
    }

    const progress = await onboardingService.getOnboardingProgress(user.id);

    return NextResponse.json({
      success: true,
      status: result,
      progress,
    });
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}