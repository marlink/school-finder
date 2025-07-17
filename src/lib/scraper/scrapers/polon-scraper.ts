/**
 * Scraper dla danych z POL-on (System Informacji o Nauce i Szkolnictwie Wyższym)
 */

import { BaseScraper } from './base-scraper';
import { ScraperConfig } from '../index';
import { Logger, setupLogger } from '../utils/logger';

interface University {
  name: string;
  rspo: string;
  type: string;
  address: string;
  url?: string;
}

interface UniversityDetails {
  name: string;
  rspo: string;
  type: string;
  address: string;
  description?: string;
  principal?: string;
  contact_info?: any;
  location?: { lat: number; lng: number };
  founding_date?: string;
  students_count?: number;
  faculties?: string[];
  courses?: string[];
}

export class POLonScraper extends BaseScraper {
  private apiUrl: string;
  private apiKey?: string;
  private logger: Logger;
  
  constructor(config: ScraperConfig) {
    super(config);
    this.apiUrl = config.polonApiUrl || 'https://polon.nauka.gov.pl/api';
    this.apiKey = config.polonApiKey;
    this.logger = setupLogger(config.logLevel);
  }
  
  /**
   * Pobieranie listy uczelni z POL-on
   */
  async getUniversityList(region?: string, limit?: number): Promise<University[]> {
    this.logger.info(`Fetching university list from POL-on${region ? ` for region ${region}` : ''}`);
    
    const params: Record<string, any> = {};
    if (region && region !== 'all') {
      params.wojewodztwo = region;
    }
    
    // Dodanie klucza API, jeśli jest dostępny
    if (this.apiKey) {
      params.apiKey = this.apiKey;
    }
    
    try {
      const response = await this.fetch(`${this.apiUrl}/universities`, 'GET', params);
      
      // Parsowanie odpowiedzi JSON
      const universities: University[] = this.parseUniversityList(response.data);
      
      this.logger.info(`Found ${universities.length} universities on POL-on`);
      
      if (limit && limit > 0) {
        return universities.slice(0, limit);
      }
      
      return universities;
    } catch (error) {
      this.logger.error(`Failed to fetch university list from POL-on: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Pobieranie szczegółów uczelni z POL-on
   */
  async getUniversityDetails(rspo: string): Promise<UniversityDetails> {
    this.logger.info(`Fetching university details for RSPO: ${rspo}`);
    
    const params: Record<string, any> = {};
    
    // Dodanie klucza API, jeśli jest dostępny
    if (this.apiKey) {
      params.apiKey = this.apiKey;
    }
    
    try {
      const response = await this.fetch(`${this.apiUrl}/university/${rspo}`, 'GET', params);
      
      // Parsowanie odpowiedzi JSON
      const universityDetails = this.parseUniversityDetails(response.data);
      
      return universityDetails;
    } catch (error) {
      this.logger.error(`Failed to fetch university details for RSPO ${rspo}: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Parsowanie listy uczelni z odpowiedzi JSON
   */
  private parseUniversityList(data: any): University[] {
    // W rzeczywistej implementacji, parsowalibyśmy tutaj odpowiedź JSON
    // Dla uproszczenia, zwracamy przykładowe dane
    return [
      {
        name: 'Uniwersytet Warszawski',
        rspo: 'UW12345',
        type: 'university',
        address: 'ul. Krakowskie Przedmieście 26/28, 00-927 Warszawa'
      },
      {
        name: 'Politechnika Warszawska',
        rspo: 'PW67890',
        type: 'university',
        address: 'Pl. Politechniki 1, 00-661 Warszawa'
      }
    ];
  }
  
  /**
   * Parsowanie szczegółów uczelni z odpowiedzi JSON
   */
  private parseUniversityDetails(data: any): UniversityDetails {
    // W rzeczywistej implementacji, parsowalibyśmy tutaj odpowiedź JSON
    // Dla uproszczenia, zwracamy przykładowe dane
    return {
      name: 'Uniwersytet Warszawski',
      rspo: 'UW12345',
      type: 'university',
      address: this._formatAddress({
        street: 'ul. Krakowskie Przedmieście',
        number: '26/28',
        city: 'Warszawa',
        postalCode: '00-927'
      }),
      description: 'Najstarszy i jeden z największych uniwersytetów w Polsce',
      principal: 'Prof. dr hab. Alojzy Nowak',
      contact_info: {
        phone: '+48 22 552 00 00',
        email: 'sekretariat@uw.edu.pl',
        website: 'https://www.uw.edu.pl'
      },
      location: {
        lat: 52.2394,
        lng: 21.0150
      },
      founding_date: '1816-11-19',
      students_count: 40000,
      faculties: [
        'Wydział Prawa i Administracji',
        'Wydział Historyczny',
        'Wydział Filozofii',
        'Wydział Matematyki, Informatyki i Mechaniki'
      ],
      courses: [
        'Prawo',
        'Historia',
        'Filozofia',
        'Matematyka',
        'Informatyka'
      ]
    };
  }
  
  /**
   * Formatowanie adresu
   */
  private _formatAddress(address: { street: string; number: string; city: string; postalCode: string }): string {
    return `${address.street} ${address.number}, ${address.postalCode} ${address.city}`;
  }
}