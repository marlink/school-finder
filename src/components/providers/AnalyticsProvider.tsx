import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

// Custom analytics events
export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event, properties);
    }
  },
  
  page: (path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: path,
      });
    }
  },

  // School-specific events
  schoolView: (schoolId: string, schoolName: string) => {
    analytics.track('school_view', {
      school_id: schoolId,
      school_name: schoolName,
    });
  },

  schoolSearch: (query: string, resultsCount: number) => {
    analytics.track('school_search', {
      search_query: query,
      results_count: resultsCount,
    });
  },

  reviewSubmit: (schoolId: string, rating: number) => {
    analytics.track('review_submit', {
      school_id: schoolId,
      rating: rating,
    });
  },

  userRegistration: (method: string) => {
    analytics.track('user_registration', {
      method: method,
    });
  },

  userLogin: (method: string) => {
    analytics.track('user_login', {
      method: method,
    });
  },

  filterApply: (filters: Record<string, any>) => {
    analytics.track('filter_apply', filters);
  },

  contactSubmit: (type: string) => {
    analytics.track('contact_submit', {
      form_type: type,
    });
  },

  // Performance tracking
  performanceMetric: (metric: string, value: number, unit: string) => {
    analytics.track('performance_metric', {
      metric_name: metric,
      value: value,
      unit: unit,
    });
  },

  // Error tracking
  error: (error: string, context?: Record<string, any>) => {
    analytics.track('error', {
      error_message: error,
      ...context,
    });
  },
};

// Type declaration for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}