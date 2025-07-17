/**
 * Schemat danych dla scrapera
 * 
 * Definicje typów i interfejsów używanych przez scraper
 */

/**
 * Podstawowe informacje o szkole
 */
export interface SchoolBase {
  name: string;
  rspo: string;
  type: string;
  address: string;
  city?: string;
  region?: string;
  url?: string;
}

/**
 * Informacje kontaktowe
 */
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  facebook?: string;
}

/**
 * Lokalizacja geograficzna
 */
export interface Location {
  lat: number;
  lng: number;
}

/**
 * Zdjęcie
 */
export interface Photo {
  url: string;
  width?: number;
  height?: number;
  description?: string;
}

/**
 * Szczegółowe informacje o szkole
 */
export interface SchoolDetails extends SchoolBase {
  description?: string;
  principal?: string;
  contact_info?: ContactInfo;
  location?: Location;
  google_place_id?: string;
  photos?: Photo[];
}

/**
 * Szczegółowe informacje o uczelni wyższej
 */
export interface UniversityDetails extends SchoolDetails {
  founding_date?: string;
  students_count?: number;
  faculties?: string[];
  courses?: string[];
}

/**
 * Status scrapowania
 */
export interface ScrapingStatus {
  id?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  region?: string;
  school_type?: string;
  started_at?: string;
  completed_at?: string;
  total_schools?: number;
  processed_schools?: number;
  new_schools?: number;
  updated_schools?: number;
  failed_schools?: number;
  error_message?: string;
}

/**
 * Statystyki scrapowania
 */
export interface ScrapingStats {
  total: number;
  processed: number;
  new: number;
  updated: number;
  failed: number;
}