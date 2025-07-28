import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { featureFlagService } from '@/lib/feature-flags';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role || 'user';
    const userId = session.user.id;

    // Get enabled features for the user
    const enabledFeatures = featureFlagService.getEnabledFeatures(userRole, userId);
    
    return NextResponse.json({
      enabledFeatures,
      userRole,
      userId
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { featureName, updates } = body;

    if (!featureName || !updates) {
      return NextResponse.json(
        { error: 'Feature name and updates are required' },
        { status: 400 }
      );
    }

    const success = await featureFlagService.updateFeature(featureName, updates);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Feature '${featureName}' updated successfully`
    });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}