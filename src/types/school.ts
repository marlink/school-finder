/**
 * Unified School Type Definitions
 * Central type definitions for school-related data structures
 */

export interface SchoolLocation {
  latitude: number;
  longitude: number;
}

export interface SchoolAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  voivodeship?: string;
  district?: string;
  country?: string;
  formatted?: string;
}

export interface SchoolRatings {
  users?: number;
  google?: number;
  publicPoland?: number;
  portal?: number;
  average?: number;
}

export interface SchoolImage {
  id: string;
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface SchoolSocialMedia {
  platform: string;
  url: string;
}

export interface SchoolFacility {
  name: string;
  category?: string;
}

export interface School {
  id: string;
  name: string;
  type: string;
  address: SchoolAddress;
  location?: SchoolLocation;
  googlePlaceId?: string;
  
  // Basic info
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  established?: number;
  establishedYear?: number; // Alternative name for established
  studentCount?: number;
  teacherCount?: number;
  
  // Educational details
  languages?: string[];
  specializations?: string[];
  academicFocus?: string[];
  
  // Ratings and reviews
  ratings?: SchoolRatings;
  reviewCount?: number;
  avgUserRating?: number;
  avgGoogleRating?: number;
  userRatingCount?: number;
  googleRatingCount?: number;
  
  // Media and facilities
  images?: SchoolImage[];
  mainImage?: string;
  socialMedia?: SchoolSocialMedia[];
  facilities?: SchoolFacility[] | string[]; // Support both formats
  
  // Metadata
  verified?: boolean;
  featured?: boolean;
  lastUpdated?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Computed fields (for search results)
  distance?: number;
  distanceText?: string;
  isFavorite?: boolean;
  
  // Legacy properties for backward compatibility
  city?: string;
  voivodeship?: string;
  averageGoogleRating?: number;
  totalRatings?: number;
}

export interface SchoolSearchFilters {
  query?: string;
  type?: string;
  city?: string;
  voivodeship?: string;
  district?: string;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
  minRating?: number;
  maxDistance?: number;
  userLat?: number;
  userLng?: number;
  userLocation?: { lat: number; lng: number; address?: string };
  hasImages?: boolean;
  establishedAfter?: number;
  establishedBefore?: number;
  minStudentCount?: number;
  maxStudentCount?: number;
  minStudents?: number;
  maxStudents?: number;
  verified?: boolean;
  featured?: boolean;
  sortBy?: 'distance' | 'rating' | 'name' | 'students';
  sortOrder?: 'asc' | 'desc';
}

export interface SchoolSearchResult {
  schools: School[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  filters: SchoolSearchFilters;
}

export interface SchoolComparison {
  schools: School[];
  criteria: string[];
}

// Google Maps integration types
export interface SchoolMapMarker {
  school: School;
  position: SchoolLocation;
  infoWindow?: string;
}

export interface SchoolMapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface SchoolMapOptions {
  center?: SchoolLocation;
  zoom?: number;
  bounds?: SchoolMapBounds;
  markers?: SchoolMapMarker[];
  showUserLocation?: boolean;
  enableClustering?: boolean;
}

// Analytics and tracking
export interface SchoolAnalytics {
  views: number;
  clicks: number;
  favorites: number;
  lastViewed?: Date;
}

export interface SchoolInteraction {
  schoolId: string;
  userId?: string;
  type: 'view' | 'click' | 'favorite' | 'share' | 'contact';
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Favorites and user preferences
export interface SchoolFavorite {
  id: string;
  schoolId: string;
  userId: string;
  createdAt: Date;
  notes?: string;
}

export interface UserPreferences {
  favoriteSchools: string[];
  searchHistory: SchoolSearchFilters[];
  preferredLanguages: string[];
  preferredLocation?: SchoolLocation;
  maxDistance?: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export type SchoolApiResponse = ApiResponse<School>;
export type SchoolsApiResponse = ApiResponse<SchoolSearchResult>;
export type SchoolFavoritesApiResponse = ApiResponse<SchoolFavorite[]>;

// Form and validation types
export interface SchoolFormData {
  name: string;
  type: string;
  address: SchoolAddress;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  languages?: string[];
  specializations?: string[];
  facilities?: string[];
}

export interface SchoolValidationError {
  field: string;
  message: string;
}

export interface SchoolFormErrors {
  [key: string]: SchoolValidationError[];
}