/**
 * Scraper dla danych z MEN (Ministerstwo Edukacji Narodowej)
 */

import { BaseScraper } from './base-scraper';
import { ScraperConfig } from '../index';
import { Logger, setupLogger } from '../utils/logger';

interface School {
  name: string;
  rspo: string;
  type: string;
  address: string;
  url?: string;
}

export class MENScraper extends BaseScraper {
  private baseUrl: string;
  private searchUrl: string;
  private logger: Logger;
  
  constructor(config: ScraperConfig) {
    super(config);
    this.baseUrl = config.menBaseUrl || 'https://rspo.gov.pl';
    this.searchUrl = config.menSearchUrl || 'https://rspo.gov.pl/szkoly-i-placowki/wyszukiwarka';
    this.logger = setupLogger(config.logLevel);
  }
  
  /**
   * Pobieranie listy szkół z MEN
   */
  async getSchoolList(region?: string, schoolType?: string, limit?: number): Promise<School[]> {
    this.logger.info(`Fetching school list from MEN${region ? ` for region ${region}` : ''}`);
    
    const params: Record<string, any> = {};
    if (region && region !== 'all') {
      params.wojewodztwo = region;
    }
    if (schoolType && schoolType !== 'all') {
      params.typ = schoolType;
    }
    
    try {
      const response = await this.fetch(this.searchUrl, 'GET', params);
      
      // W rzeczywistej implementacji, parsowalibyśmy tutaj HTML
      // Dla uproszczenia, zwracamy przykładowe dane
      const schools: School[] = this.parseSchoolList(response.data);
      
      this.logger.info(`Found ${schools.length} schools on MEN website`);
      
      if (limit && limit > 0) {
        return schools.slice(0, limit);
      }
      
      return schools;
    } catch (error) {
      this.logger.error(`Failed to fetch school list from MEN: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Pobieranie szczegółów szkoły z MEN
   */
  async getSchoolDetails(rspo: string): Promise<any> {
    this.logger.info(`Fetching school details for RSPO: ${rspo}`);
    
    try {
      const response = await this.fetch(`${this.baseUrl}/szkola/${rspo}`);
      
      // W rzeczywistej implementacji, parsowalibyśmy tutaj HTML
      // Dla uproszczenia, zwracamy przykładowe dane
      const schoolDetails = this.parseSchoolDetails(response.data, rspo);
      
      return schoolDetails;
    } catch (error) {
      this.logger.error(`Failed to fetch school details for RSPO ${rspo}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Parsowanie listy szkół z HTML
   */
  private parseSchoolList(html: string): School[] {
    // W rzeczywistej implementacji, parsowalibyśmy tutaj HTML
    // Dla uproszczenia, zwracamy przykładowe dane
    return [
      {
        name: 'Szkoła Podstawowa nr 1',
        rspo: '12345',
        type: 'primary',
        address: 'ul. Szkolna 1, 00-001 Warszawa'
      },
      {
        name: 'Liceum Ogólnokształcące nr 1',
        rspo: '67890',
        type: 'secondary',
        address: 'ul. Licealna 1, 00-002 Warszawa'
      }
    ];
  }
  
  /**
   * Parsowanie szczegółów szkoły z HTML
   */
  private parseSchoolDetails(html: string, rspo: string): any {
    // W rzeczywistej implementacji, parsowalibyśmy tutaj HTML
    // Dla uproszczenia, zwracamy przykładowe dane
    return {
      name: 'Szkoła Podstawowa nr 1',
      rspo: rspo,
      type: 'primary',
      address: 'ul. Szkolna 1, 00-001 Warszawa',
      description: 'Szkoła podstawowa z oddziałami integracyjnymi',
      principal: 'Jan Kowalski',
      contact: {
        phone: '123-456-789',
        email: 'sp1@example.com',
        website: 'https://sp1.example.com'
      },
      location: {
        lat: 52.2297,
        lng: 21.0122
      }
    };
  }
}