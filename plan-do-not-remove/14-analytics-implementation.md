# Analytics Implementation

## Overview
The School Finder Portal tracks user interactions to improve the platform and provide insights to administrators.

## Key Metrics Tracked
- Search queries (keywords, filters used)
- School profile views
- Time spent on school details
- Favorite actions
- Subscription conversions

## Implementation

### Client-Side Tracking
```typescript
// hooks/useAnalytics.ts
import { useCallback } from 'react';

export function useAnalytics() {
  const trackSchoolView = useCallback(async (schoolId: string) => {
    await fetch('/api/track-school-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId, action: 'view' })
    });
  }, []);

  const trackSearch = useCallback(async (query: string, filters: any) => {
    await fetch('/api/track-search-analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters })
    });
  }, []);

  return { trackSchoolView, trackSearch };
}
```

### Admin Dashboard
The admin dashboard at `/admin/analytics` displays:
- Most viewed schools
- Popular search terms
- User engagement metrics
- Conversion rates

All analytics respect user privacy and comply with GDPR requirements.