import featureFlags from '@/config/feature-flags.json';

export interface FeatureFlag {
  enabled: boolean;
  description: string;
  rollout_percentage: number;
  allowed_roles: string[];
  environments: string[];
}

export interface FeatureFlagsConfig {
  features: Record<string, FeatureFlag>;
  metadata: {
    version: string;
    last_updated: string;
    environment: string;
  };
}

export class FeatureFlagService {
  private config: FeatureFlagsConfig;
  private environment: string;

  constructor() {
    this.config = featureFlags as FeatureFlagsConfig;
    this.environment = process.env.NODE_ENV || 'development';
  }

  /**
   * Check if a feature is enabled for a user
   */
  isFeatureEnabled(
    featureName: string,
    userRole?: string,
    userId?: string
  ): boolean {
    const feature = this.config.features[featureName];
    
    if (!feature) {
      console.warn(`Feature flag '${featureName}' not found`);
      return false;
    }

    // Check if feature is enabled
    if (!feature.enabled) {
      return false;
    }

    // Check environment
    if (!feature.environments.includes(this.environment)) {
      return false;
    }

    // Check role-based access
    if (userRole && !feature.allowed_roles.includes(userRole)) {
      return false;
    }

    // Check percentage rollout
    if (feature.rollout_percentage < 100) {
      if (!userId) {
        return false;
      }
      
      // Use user ID to determine if they're in the rollout percentage
      const hash = this.hashUserId(userId);
      const userPercentage = hash % 100;
      
      if (userPercentage >= feature.rollout_percentage) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get all enabled features for a user
   */
  getEnabledFeatures(userRole?: string, userId?: string): string[] {
    return Object.keys(this.config.features).filter(featureName =>
      this.isFeatureEnabled(featureName, userRole, userId)
    );
  }

  /**
   * Get feature configuration
   */
  getFeature(featureName: string): FeatureFlag | null {
    return this.config.features[featureName] || null;
  }

  /**
   * Get all features (admin only)
   */
  getAllFeatures(): Record<string, FeatureFlag> {
    return this.config.features;
  }

  /**
   * Update feature flag (admin only)
   */
  async updateFeature(
    featureName: string,
    updates: Partial<FeatureFlag>
  ): Promise<boolean> {
    // In a real implementation, this would update the database or external service
    // For now, we'll just update the in-memory config
    if (this.config.features[featureName]) {
      this.config.features[featureName] = {
        ...this.config.features[featureName],
        ...updates
      };
      return true;
    }
    return false;
  }

  /**
   * Simple hash function for user ID
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get metadata about feature flags
   */
  getMetadata() {
    return this.config.metadata;
  }
}

// Singleton instance
export const featureFlagService = new FeatureFlagService();