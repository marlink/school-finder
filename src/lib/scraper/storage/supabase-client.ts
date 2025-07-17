/**
 * Klient Supabase dla scrapera
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';
import { ScraperConfig, ScrapingStatus } from '../index';

export class SupabaseClient {
  private client;
  
  constructor(config: ScraperConfig) {
    this.client = createClient<Database>(config.supabaseUrl, config.supabaseKey);
  }
  
  /**
   * Dodawanie lub aktualizacja szkół w bazie danych
   */
  async upsertSchools(schools: any[]): Promise<any> {
    // Konwersja danych do formatu zgodnego z bazą danych
    const formattedSchools = schools.map(school => ({
      name: school.name,
      address: school.address,
      type: school.type,
      rspo: school.rspo,
      description: school.description || '',
      principal: school.principal || '',
      contact_info: JSON.stringify(school.contact || {}),
      location: JSON.stringify(school.location || {}),
      google_place_id: school.google_place_id || '',
      rating: school.rating,
      ratings_count: school.ratings_count || 0,
      website: school.website || '',
      photos: JSON.stringify(school.photos || []),
      // Pola specyficzne dla uczelni wyższych
      founding_date: school.founding_date,
      students_count: school.students_count,
      faculties: JSON.stringify(school.faculties || []),
      courses: JSON.stringify(school.courses || []),
    }));
    
    // Upsert do tabeli schools
    const { data, error } = await this.client
      .from('schools')
      .upsert(formattedSchools, { onConflict: 'rspo' });
    
    if (error) {
      throw new Error(`Failed to upsert schools: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Pobieranie istniejących szkół z bazy danych
   */
  async getExistingSchools(): Promise<any[]> {
    const { data, error } = await this.client
      .from('schools')
      .select('rspo, name, address, last_updated');
    
    if (error) {
      throw new Error(`Failed to get existing schools: ${error.message}`);
    }
    
    return data || [];
  }
  
  /**
   * Aktualizacja statusu scrapowania
   */
  async updateScrapingStatus(
    status: 'running' | 'completed' | 'failed',
    details?: any
  ): Promise<ScrapingStatus> {
    // Sprawdzenie, czy istnieje już wpis o statusie 'running'
    if (status === 'running') {
      const { data: runningStatus } = await this.client
        .from('scraping_status')
        .select('*')
        .eq('status', 'running')
        .limit(1);
      
      if (runningStatus && runningStatus.length > 0) {
        throw new Error('A scraping process is already running');
      }
    }
    
    // Tworzenie nowego wpisu lub aktualizacja istniejącego
    const { data, error } = await this.client
      .from('scraping_status')
      .insert({
        status,
        details: details || {}
      })
      .select()
      .single();
    
    if (error) {
      throw new Error(`Failed to update scraping status: ${error.message}`);
    }
    
    return data;
  }
  
  /**
   * Pobieranie statusu scrapowania
   */
  async getScrapingStatus(): Promise<ScrapingStatus | null> {
    const { data, error } = await this.client
      .from('scraping_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      throw new Error(`Failed to get scraping status: ${error.message}`);
    }
    
    return data.length > 0 ? data[0] : null;
  }
}