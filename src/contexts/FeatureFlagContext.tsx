'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { featureFlagService, FeatureFlag } from '@/lib/feature-flags';
import { useUser } from '@/hooks/useUser';

interface FeatureFlagContextType {
  isFeatureEnabled: (featureName: string) => boolean;
  getEnabledFeatures: () => string[];
  getFeature: (featureName: string) => FeatureFlag | null;
  loading: boolean;
  refreshFlags: () => void;
}

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

interface FeatureFlagProviderProps {
  children: React.ReactNode;
}

export function FeatureFlagProvider({ children }: FeatureFlagProviderProps) {
  const { user, loading: userLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);

  const refreshFlags = React.useCallback(() => {
    if (!userLoading) {
      const userRole = user?.role || 'user';
      const userId = user?.id;
      
      const enabled = featureFlagService.getEnabledFeatures(userRole, userId);
      setEnabledFeatures(enabled);
      setLoading(false);
    }
  }, [user, userLoading]);

  useEffect(() => {
    refreshFlags();
  }, [refreshFlags]);

  const isFeatureEnabled = React.useCallback((featureName: string): boolean => {
    if (loading) return false;
    return enabledFeatures.includes(featureName);
  }, [enabledFeatures, loading]);

  const getEnabledFeatures = React.useCallback((): string[] => {
    return enabledFeatures;
  }, [enabledFeatures]);

  const getFeature = React.useCallback((featureName: string): FeatureFlag | null => {
    return featureFlagService.getFeature(featureName);
  }, []);

  const value: FeatureFlagContextType = {
    isFeatureEnabled,
    getEnabledFeatures,
    getFeature,
    loading,
    refreshFlags,
  };

  return (
    <FeatureFlagContext.Provider value={value}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlag(featureName: string): boolean {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlag must be used within a FeatureFlagProvider');
  }

  return context.isFeatureEnabled(featureName);
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }

  return context;
}