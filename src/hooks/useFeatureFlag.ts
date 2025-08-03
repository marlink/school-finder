import { useFeatureFlag as useFeatureFlagContext, useFeatureFlags } from '@/contexts/FeatureFlagContext';

/**
 * Hook to check if a specific feature is enabled
 * @param featureName - The name of the feature to check
 * @returns boolean indicating if the feature is enabled
 */
export function useFeatureFlag(featureName: string): boolean {
  return useFeatureFlagContext(featureName);
}

/**
 * Hook to get all feature flag utilities
 * @returns Object with feature flag utilities
 */
export function useFeatureFlagUtils() {
  return useFeatureFlags();
}

/**
 * Hook to check multiple features at once
 * @param featureNames - Array of feature names to check
 * @returns Object with feature names as keys and boolean values
 */
export function useMultipleFeatureFlags(featureNames: string[]): Record<string, boolean> {
  const { isFeatureEnabled } = useFeatureFlags();
  
  return featureNames.reduce((acc, featureName) => {
    acc[featureName] = isFeatureEnabled(featureName);
    return acc;
  }, {} as Record<string, boolean>);
}

/**
 * Hook to get enabled features list
 * @returns Array of enabled feature names
 */
export function useEnabledFeatures(): string[] {
  const { getEnabledFeatures } = useFeatureFlags();
  return getEnabledFeatures();
}