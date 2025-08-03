/**
 * Client-side analytics utility functions
 * 
 * This module provides functions to track various analytics events
 * related to school engagement and search behavior.
 */

/**
 * Track a school-related analytics event
 * 
 * @param schoolId - The ID of the school
 * @param metricType - Type of metric to track ('favorite_add', 'rating_submit', 'page_view', 'search_click')
 * @param data - Additional data for the metric (timeOnPage, clickThrough)
 */
export async function trackSchoolAnalytics(
  schoolId: string,
  metricType: 'favorite_add' | 'rating_submit' | 'page_view' | 'search_click',
  data?: { timeOnPage?: number; clickThrough?: boolean }
): Promise<void> {
  try {
    const response = await fetch('/api/track-school-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        schoolId,
        metricType,
        ...(data?.timeOnPage !== undefined && { timeOnPage: data.timeOnPage }),
        ...(data?.clickThrough !== undefined && { clickThrough: data.clickThrough }),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track school analytics:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking school analytics:', error);
  }
}

/**
 * Track a search-related analytics event
 * 
 * @param searchTerm - The search term entered by the user
 * @param resultCount - Number of results returned for this search
 */
export async function trackSearchAnalytics(
  searchTerm: string,
  resultCount?: number
): Promise<void> {
  try {
    const response = await fetch('/api/track-search-analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchTerm,
        ...(resultCount !== undefined && { resultCount }),
      }),
    });

    if (!response.ok) {
      console.error('Failed to track search analytics:', await response.text());
    }
  } catch (error) {
    console.error('Error tracking search analytics:', error);
  }
}

/**
 * Track time spent on a school page
 * 
 * This function should be called when the user leaves the page
 * or when the component unmounts.
 * 
 * @param schoolId - The ID of the school being viewed
 * @param startTime - The timestamp when the user started viewing the page
 */
export function trackSchoolPageView(schoolId: string, startTime: number): void {
  const timeOnPage = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
  
  // Only track if the user spent at least 5 seconds on the page
  if (timeOnPage >= 5) {
    trackSchoolAnalytics(schoolId, 'page_view', { timeOnPage });
  }
}

/**
 * Track a click on a school from search results
 * 
 * @param schoolId - The ID of the school that was clicked
 */
export function trackSearchResultClick(schoolId: string): void {
  trackSchoolAnalytics(schoolId, 'search_click', { clickThrough: true });
}

/**
 * Track when a user adds a school to favorites
 * 
 * @param schoolId - The ID of the school added to favorites
 */
export function trackFavoriteAdd(schoolId: string): void {
  trackSchoolAnalytics(schoolId, 'favorite_add');
}

/**
 * Track when a user submits a rating for a school
 * 
 * @param schoolId - The ID of the school being rated
 */
export function trackRatingSubmit(schoolId: string): void {
  trackSchoolAnalytics(schoolId, 'rating_submit');
}