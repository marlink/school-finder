# Feature Flags

## Overview
Feature flags allow us to enable or disable features in the School Finder Portal without deploying new code. This helps with gradual rollouts, A/B testing, and quick feature disabling if issues arise.

## Implementation

### Feature Flag Configuration

```typescript
// lib/feature-flags/config.ts
export type FeatureFlag = 
  | 'ENABLE_NEW_SEARCH'
  | 'SHOW_SCHOOL_RATINGS'
  | 'ENABLE_SOCIAL_SHARING'
  | 'ENABLE_COMPARE_SCHOOLS'
  | 'SHOW_BETA_FEATURES';

export type FeatureFlagConfig = {
  [key in FeatureFlag]: {
    enabled: boolean;
    enabledForRoles?: ('USER' | 'PREMIUM' | 'ADMIN')[];
    enabledForPercentage?: number; // 0-100
    description: string;
  };
};

export const defaultFeatureFlags: FeatureFlagConfig = {
  ENABLE_NEW_SEARCH: {
    enabled: false,
    enabledForRoles: ['ADMIN'],
    description: 'Enables the new search experience with filters',
  },
  SHOW_SCHOOL_RATINGS: {
    enabled: true,
    description: 'Shows school ratings on school cards and details',
  },
  ENABLE_SOCIAL_SHARING: {
    enabled: true,
    description: 'Enables social sharing buttons for schools',
  },
  ENABLE_COMPARE_SCHOOLS: {
    enabled: false,
    enabledForRoles: ['PREMIUM', 'ADMIN'],
    description: 'Enables the school comparison feature',
  },
  SHOW_BETA_FEATURES: {
    enabled: false,
    enabledForRoles: ['ADMIN'],
    enabledForPercentage: 10,
    description: 'Shows beta features to a percentage of users',
  },
};
```

### Feature Flag Service

```typescript
// lib/feature-flags/service.ts
import { FeatureFlag, defaultFeatureFlags } from './config';
import { prisma } from '../prisma';

export async function getFeatureFlags() {
  try {
    // Try to get flags from database
    const dbFlags = await prisma.featureFlag.findMany();
    
    // Convert to config format
    const flagsFromDb = dbFlags.reduce((acc, flag) => {
      acc[flag.name as FeatureFlag] = {
        enabled: flag.enabled,
        enabledForRoles: flag.enabledForRoles as any,
        enabledForPercentage: flag.enabledForPercentage,
        description: flag.description,
      };
      return acc;
    }, {} as typeof defaultFeatureFlags);
    
    // Merge with defaults (for any new flags not in DB yet)
    return { ...defaultFeatureFlags, ...flagsFromDb };
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    // Fallback to default flags if DB fetch fails
    return defaultFeatureFlags;
  }
}

export async function isFeatureEnabled(
  flagName: FeatureFlag,
  userRole?: string | null,
  userId?: string | null
) {
  const flags = await getFeatureFlags();
  const flag = flags[flagName];
  
  if (!flag) return false;
  if (!flag.enabled) return false;
  
  // Check role-based access
  if (flag.enabledForRoles && userRole) {
    if (!flag.enabledForRoles.includes(userRole as any)) {
      return false;
    }
  }
  
  // Check percentage rollout
  if (flag.enabledForPercentage !== undefined && userId) {
    // Use userId to deterministically assign user to percentage group
    const hash = hashString(userId);
    const userPercentile = hash % 100;
    
    if (userPercentile >= flag.enabledForPercentage) {
      return false;
    }
  }
  
  return true;
}

// Simple string hash function for deterministic percentage assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
```

### React Context for Feature Flags

```tsx
// contexts/FeatureFlagContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { FeatureFlag } from '@/lib/feature-flags/config';

type FeatureFlagContextType = {
  flags: Record<FeatureFlag, boolean>;
  isEnabled: (flag: FeatureFlag) => boolean;
};

const FeatureFlagContext = createContext<FeatureFlagContextType | null>(null);

export function FeatureFlagProvider({
  children,
  initialFlags,
}: {
  children: ReactNode;
  initialFlags: Record<FeatureFlag, boolean>;
}) {
  const isEnabled = (flag: FeatureFlag) => {
    return initialFlags[flag] || false;
  };

  return (
    <FeatureFlagContext.Provider value={{ flags: initialFlags, isEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
```

### Server-Side Integration

```tsx
// app/layout.tsx
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { getFeatureFlags, isFeatureEnabled } from '@/lib/feature-flags/service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || null;
  const userId = session?.user?.id || null;
  
  // Get all feature flags
  const flags = await getFeatureFlags();
  
  // Evaluate each flag for the current user
  const evaluatedFlags = Object.keys(flags).reduce((acc, flagName) => {
    acc[flagName as FeatureFlag] = await isFeatureEnabled(
      flagName as FeatureFlag,
      userRole,
      userId
    );
    return acc;
  }, {} as Record<FeatureFlag, boolean>);
  
  return (
    <html lang="en">
      <body>
        <FeatureFlagProvider initialFlags={evaluatedFlags}>
          {children}
        </FeatureFlagProvider>
      </body>
    </html>
  );
}
```

## Using Feature Flags

### In React Components

```tsx
// components/SchoolCard.tsx
'use client';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';

export function SchoolCard({ school }) {
  const { isEnabled } = useFeatureFlags();
  
  return (
    <div className="p-4 border rounded-lg">
      <h3>{school.name}</h3>
      
      {isEnabled('SHOW_SCHOOL_RATINGS') && (
        <div className="flex items-center mt-2">
          <span>Rating: {school.rating}/5</span>
        </div>
      )}
      
      {isEnabled('ENABLE_SOCIAL_SHARING') && (
        <div className="mt-4">
          <button>Share</button>
        </div>
      )}
    </div>
  );
}
```

### In API Routes

```typescript
// app/api/schools/compare/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isFeatureEnabled } from '@/lib/feature-flags/service';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  const userRole = session?.user?.role || null;
  const userId = session?.user?.id || null;
  
  // Check if feature is enabled for this user
  const isCompareEnabled = await isFeatureEnabled(
    'ENABLE_COMPARE_SCHOOLS',
    userRole,
    userId
  );
  
  if (!isCompareEnabled) {
    return NextResponse.json(
      { error: 'Feature not available' },
      { status: 403 }
    );
  }
  
  // Feature is enabled, proceed with comparison logic
  // ...
  
  return NextResponse.json({ comparison: {} });
}
```

## Admin Interface for Feature Flags

```tsx
// app/admin/feature-flags/page.tsx
import { getFeatureFlags } from '@/lib/feature-flags/service';
import { prisma } from '@/lib/prisma';

export default async function FeatureFlagsPage() {
  const flags = await getFeatureFlags();
  
  async function updateFlag(formData: FormData) {
    'use server';
    
    const flagName = formData.get('name') as string;
    const enabled = formData.get('enabled') === 'true';
    const enabledForRoles = formData.getAll('roles') as string[];
    const enabledForPercentage = Number(formData.get('percentage') || 0);
    
    await prisma.featureFlag.upsert({
      where: { name: flagName },
      update: {
        enabled,
        enabledForRoles,
        enabledForPercentage,
      },
      create: {
        name: flagName,
        enabled,
        enabledForRoles,
        enabledForPercentage,
        description: flags[flagName as any]?.description || '',
      },
    });
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Feature Flags</h1>
      
      <div className="grid gap-6">
        {Object.entries(flags).map(([name, flag]) => (
          <div key={name} className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{name}</h2>
            <p className="text-sm text-gray-500">{flag.description}</p>
            
            <form action={updateFlag} className="mt-4 space-y-4">
              <input type="hidden" name="name" value={name} />
              
              <div>
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="enabled" 
                    value="true"
                    defaultChecked={flag.enabled} 
                  />
                  <span className="ml-2">Enabled</span>
                </label>
              </div>
              
              <div>
                <p className="mb-2">Enabled for roles:</p>
                {['USER', 'PREMIUM', 'ADMIN'].map(role => (
                  <label key={role} className="flex items-center mt-1">
                    <input 
                      type="checkbox" 
                      name="roles" 
                      value={role}
                      defaultChecked={flag.enabledForRoles?.includes(role as any)} 
                    />
                    <span className="ml-2">{role}</span>
                  </label>
                ))}
              </div>
              
              <div>
                <label>
                  <span>Percentage rollout (0-100):</span>
                  <input 
                    type="number" 
                    name="percentage" 
                    min="0" 
                    max="100"
                    defaultValue={flag.enabledForPercentage || 0}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" 
                  />
                </label>
              </div>
              
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md"
              >
                Save Changes
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
```