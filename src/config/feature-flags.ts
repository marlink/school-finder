export const featureFlags = {
  newSearchExperience: {
    name: 'New Search Experience',
    description: 'Enables a new, more interactive search interface.',
    isEnabled: false, // Default to false
    rolloutPercentage: 0, // 0% of users will see this
  },
  schoolSubscriptions: {
    name: 'School Subscriptions',
    description: 'Allows schools to subscribe to premium features.',
    isEnabled: false,
    rolloutPercentage: 0,
  },
  teacherProfiles: {
    name: 'Teacher Profiles',
    description: 'Enables public profiles for teachers.',
    isEnabled: false,
    rolloutPercentage: 0,
  },
};

export type FeatureFlag = keyof typeof featureFlags;

export const isFeatureEnabled = (flag: FeatureFlag, userId?: string): boolean => {
  const feature = featureFlags[flag];
  if (!feature || !feature.isEnabled) {
    return false;
  }

  if (feature.rolloutPercentage === 100) {
    return true;
  }

  if (feature.rolloutPercentage === 0) {
    return false;
  }

  // A simple hashing function to determine if the user is in the rollout
  if (userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const percentage = (Math.abs(hash) % 100) + 1; // 1-100
    return percentage <= feature.rolloutPercentage;
  }

  return false;
};