/**
 * Scraper dla danych z Google Places API
 */

import { BaseScraper } from './base-scraper';
import { ScraperConfig } from '../index';
import { Logger, setupLogger } from '../utils/logger';

interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  photos?: Array<{
    photo_reference: string;
    width: number;
    height: number;
  }>;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  opening_hours?: {
    weekday_text: string[];
  };
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export class GooglePlacesScraper extends BaseScraper {
  private apiKey: string;
  private baseUrl: string;
  private logger: Logger;
  
  constructor(config: ScraperConfig) {
    super(config);
    this.apiKey = config.googlePlacesApiKey || 'AIzaSyDj30XbCo6I3tEBy2VwbMrhN_Xrp-uB4KY';
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.logger = setupLogger(config.logLevel);
    
    if (!this.apiKey) {
      this.logger.warn('Google Places API key not provided. Google Places scraper will not work.');
    }
  }
  
  /**
   * Wyszukiwanie miejsca na podstawie nazwy i adresu
   */
  async findPlace(name: string, address: string): Promise<string | null> {
    if (!this.apiKey) {
      this.logger.error('Google Places API key not provided');
      return null;
    }
    
    this.logger.info(`Searching for place: ${name}, ${address}`);
    
    const query = `${name} ${address}`;
    const params = {
      input: query,
      inputtype: 'textquery',
      fields: 'place_id,name,formatted_address',
      key: this.apiKey
    };
    
    try {
      const response = await this.fetch(`${this.baseUrl}/findplacefromtext/json`, 'GET', params);
      
      if (response.data.status === 'OK' && response.data.candidates && response.data.candidates.length > 0) {
        const placeId = response.data.candidates[0].place_id;
        this.logger.info(`Found place ID: ${placeId}`);
        return placeId;
      } else {
        this.logger.warn(`No places found for: ${name}, ${address}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to find place: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  /**
   * Pobieranie szczegółów miejsca na podstawie place_id
   */
  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    if (!this.apiKey) {
      this.logger.error('Google Places API key not provided');
      return null;
    }
    
    if (!placeId) {
      this.logger.error('Place ID not provided');
      return null;
    }
    
    this.logger.info(`Fetching place details for ID: ${placeId}`);
    
    const params = {
      place_id: placeId,
      fields: 'name,formatted_address,formatted_phone_number,website,rating,photos,geometry,opening_hours,reviews',
      key: this.apiKey
    };
    
    try {
      const response = await this.fetch(`${this.baseUrl}/details/json`, 'GET', params);
      
      if (response.data.status === 'OK' && response.data.result) {
        this.logger.info(`Successfully fetched details for place ID: ${placeId}`);
        return response.data.result;
      } else {
        this.logger.warn(`No details found for place ID: ${placeId}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Failed to get place details: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }
  
  /**
   * Pobieranie URL zdjęcia na podstawie photo_reference
   */
  getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
    if (!this.apiKey) {
      this.logger.error('Google Places API key not provided');
      return '';
    }
    
    return `${this.baseUrl}/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${this.apiKey}`;
  }
  
  /**
   * Wzbogacanie danych szkoły o informacje z Google Places
   */
  async enrichSchoolData(school: any): Promise<any> {
    if (!this.apiKey) {
      this.logger.warn('Google Places API key not provided. Skipping enrichment.');
      return school;
    }
    
    try {
      // Jeśli szkoła ma już place_id, użyj go
      let placeId = school.google_place_id;
      
      // W przeciwnym razie wyszukaj miejsce
      if (!placeId) {
        placeId = await this.findPlace(school.name, school.address);
        if (!placeId) {
          this.logger.warn(`Could not find Google Place ID for school: ${school.name}`);
          return school;
        }
      }
      
      // Pobierz szczegóły miejsca
      const placeDetails = await this.getPlaceDetails(placeId);
      if (!placeDetails) {
        this.logger.warn(`Could not fetch Google Place details for school: ${school.name}`);
        return school;
      }
      
      // Wzbogać dane szkoły
      const enrichedSchool = {
        ...school,
        google_place_id: placeId,
        website: placeDetails.website || school.website,
        phone: placeDetails.formatted_phone_number || school.phone,
        location: placeDetails.geometry?.location || school.location,
        rating: placeDetails.rating,
        photos: placeDetails.photos?.map(photo => this.getPhotoUrl(photo.photo_reference)) || []
      };
      
      this.logger.info(`Successfully enriched data for school: ${school.name}`);
      return enrichedSchool;
    } catch (error) {
      this.logger.error(`Failed to enrich school data: ${error instanceof Error ? error.message : String(error)}`);
      return school;
    }
  }
}