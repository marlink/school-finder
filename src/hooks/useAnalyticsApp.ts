'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackSchoolPageView,
  trackSearchResultClick,
  trackFavoriteAdd,
  trackRatingSubmit,
  trackSearchAnalytics,
} from '../lib/analytics';

/**
 * Hook for tracking analytics in React components with App Router
 * 
 * This hook provides methods to track various user interactions
 * and automatically tracks page views for school detail pages.
 * 
 * @param schoolId - Optional school ID if the component is related to a specific school
 */
export function useAnalyticsApp(schoolId?: string) {
  const startTimeRef = useRef<number>(Date.now());
  const pathname = usePathname();
  
  // Track page view when component mounts and unmounts
  useEffect(() => {
    // Reset start time when component mounts
    startTimeRef.current = Date.now();
    
    // Track page view when component unmounts
    return () => {
      if (schoolId) {
        trackSchoolPageView(schoolId, startTimeRef.current);
      }
    };
  }, [schoolId]);
  
  // Track page navigation
  useEffect(() => {
    // When pathname changes, track the page view for the previous page
    if (schoolId) {
      trackSchoolPageView(schoolId, startTimeRef.current);
    }
    
    // Reset start time for the new page
    startTimeRef.current = Date.now();
  }, [pathname, schoolId]);
  
  return {
    /**
     * Track a search query
     * 
     * @param searchTerm - The search term entered by the user
     * @param resultCount - Number of results returned
     */
    trackSearch: (searchTerm: string, resultCount?: number) => {
      trackSearchAnalytics(searchTerm, resultCount);
    },
    
    /**
     * Track when a user clicks on a school from search results
     * 
     * @param clickedSchoolId - The ID of the school that was clicked
     */
    trackSearchClick: (clickedSchoolId: string) => {
      trackSearchResultClick(clickedSchoolId);
    },
    
    /**
     * Track when a user adds a school to favorites
     * 
     * @param favoriteSchoolId - The ID of the school added to favorites
     */
    trackFavorite: (favoriteSchoolId: string) => {
      trackFavoriteAdd(favoriteSchoolId);
    },
    
    /**
     * Track when a user submits a rating for a school
     * 
     * @param ratedSchoolId - The ID of the school being rated
     */
    trackRating: (ratedSchoolId: string) => {
      trackRatingSubmit(ratedSchoolId);
    },
  };
}