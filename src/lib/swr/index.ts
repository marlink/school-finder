import useSWR, { SWRConfiguration, mutate } from 'swr';
import { useCallback } from 'react';

// Default SWR configuration
export const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 0,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
  loadingTimeout: 3000,
  focusThrottleInterval: 5000,
};

// API fetcher function
export const fetcher = async (url: string) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = new Error('An error occurred while fetching the data.');
    // Attach extra info to the error object
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

// Authenticated fetcher
export const authenticatedFetcher = async (url: string) => {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Handle unauthorized access
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('token');
      }
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      return;
    }
    
    const error = new Error('An error occurred while fetching the data.');
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

// Custom hooks for common data fetching patterns

// Schools data
export function useSchools(searchParams?: Record<string, any>) {
  const queryString = searchParams ? new URLSearchParams(searchParams).toString() : '';
  const url = `/api/schools${queryString ? `?${queryString}` : ''}`;
  
  return useSWR(url, fetcher, {
    ...defaultSWRConfig,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

export function useSchool(schoolId: string) {
  return useSWR(
    schoolId ? `/api/schools/${schoolId}` : null,
    fetcher,
    defaultSWRConfig
  );
}

// User data
export function useUser() {
  return useSWR('/api/user/profile', authenticatedFetcher, {
    ...defaultSWRConfig,
    revalidateOnFocus: true,
  });
}

export function useUserReviews(userId?: string) {
  return useSWR(
    userId ? `/api/user/${userId}/reviews` : null,
    authenticatedFetcher,
    defaultSWRConfig
  );
}

// Reviews data
export function useSchoolReviews(schoolId: string, page: number = 1) {
  return useSWR(
    schoolId ? `/api/schools/${schoolId}/reviews?page=${page}` : null,
    fetcher,
    defaultSWRConfig
  );
}

// Admin data
export function useAdminStats() {
  return useSWR('/api/admin/stats', authenticatedFetcher, {
    ...defaultSWRConfig,
    refreshInterval: 60000, // Refresh every minute
  });
}

export function useAdminUsers(page: number = 1, filters?: Record<string, any>) {
  const queryString = new URLSearchParams({ page: page.toString(), ...filters }).toString();
  
  return useSWR(
    `/api/admin/users?${queryString}`,
    authenticatedFetcher,
    defaultSWRConfig
  );
}

// Analytics data
export function useAnalytics(timeRange: string = '7d') {
  return useSWR(
    `/api/analytics?range=${timeRange}`,
    authenticatedFetcher,
    {
      ...defaultSWRConfig,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );
}

// Search suggestions
export function useSearchSuggestions(query: string) {
  return useSWR(
    query.length > 2 ? `/api/search/suggestions?q=${encodeURIComponent(query)}` : null,
    fetcher,
    {
      ...defaultSWRConfig,
      dedupingInterval: 500,
      refreshInterval: 0,
    }
  );
}

// Feature flags
export function useFeatureFlags() {
  return useSWR('/api/feature-flags', fetcher, {
    ...defaultSWRConfig,
    refreshInterval: 300000, // Refresh every 5 minutes
  });
}

// Notifications
export function useNotifications() {
  return useSWR('/api/notifications', authenticatedFetcher, {
    ...defaultSWRConfig,
    refreshInterval: 30000, // Refresh every 30 seconds
  });
}

// Custom mutation hooks
export function useSchoolMutations() {
  const updateSchool = useCallback(async (schoolId: string, data: any) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`/api/schools/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update school');
    }

    // Revalidate related data
    mutate(`/api/schools/${schoolId}`);
    mutate('/api/schools');
    
    return response.json();
  }, []);

  const deleteSchool = useCallback(async (schoolId: string) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`/api/schools/${schoolId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete school');
    }

    // Revalidate schools list
    mutate('/api/schools');
    
    return response.json();
  }, []);

  return { updateSchool, deleteSchool };
}

export function useReviewMutations() {
  const createReview = useCallback(async (reviewData: any) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (!response.ok) {
      throw new Error('Failed to create review');
    }

    // Revalidate related data
    mutate(`/api/schools/${reviewData.schoolId}/reviews`);
    mutate(`/api/schools/${reviewData.schoolId}`);
    mutate('/api/user/profile');
    
    return response.json();
  }, []);

  const updateReview = useCallback(async (reviewId: string, data: any) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update review');
    }

    // Revalidate related data
    mutate(`/api/reviews/${reviewId}`);
    mutate('/api/user/profile');
    
    return response.json();
  }, []);

  const deleteReview = useCallback(async (reviewId: string, schoolId: string) => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete review');
    }

    // Revalidate related data
    mutate(`/api/schools/${schoolId}/reviews`);
    mutate(`/api/schools/${schoolId}`);
    mutate('/api/user/profile');
    
    return response.json();
  }, []);

  return { createReview, updateReview, deleteReview };
}

// Cache management utilities
export const cacheUtils = {
  // Clear all cache
  clearAll: () => {
    mutate(() => true, undefined, { revalidate: false });
  },
  
  // Clear user-specific cache
  clearUserCache: () => {
    mutate(key => typeof key === 'string' && key.includes('/user'), undefined, { revalidate: false });
  },
  
  // Clear school-specific cache
  clearSchoolCache: (schoolId?: string) => {
    if (schoolId) {
      mutate(key => typeof key === 'string' && key.includes(`/schools/${schoolId}`), undefined, { revalidate: false });
    } else {
      mutate(key => typeof key === 'string' && key.includes('/schools'), undefined, { revalidate: false });
    }
  },
  
  // Preload data
  preload: (url: string) => {
    mutate(url, fetcher(url), { revalidate: false });
  },
};