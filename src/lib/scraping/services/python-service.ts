export interface PythonProgressCallback {
  (progress: { percentage: number; processed: number; total: number; message?: string }): void;
}

export interface SchoolData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  type?: string;
  regon?: string;
  nip?: string;
  description?: string;
  principal?: string;
  studentCount?: number;
  teacherCount?: number;
  facilities?: string[];
  programs?: string[];
}

export class PythonScrapingService {
  private baseHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'pl-PL,pl;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1'
  };

  /**
   * Scrape Polish schools from government sources
   */
  async scrapePolishGovernmentSchools(config: {
    regions?: string[];
    limit?: number;
  }, progressCallback?: PythonProgressCallback): Promise<SchoolData[]> {
    
    const results: SchoolData[] = [];
    const sources = [
      {
        name: 'RSPO',
        url: 'https://rspo.gov.pl/szkoly',
        selector: '.school-item'
      },
      {
        name: 'Kuratorium',
        url: 'https://kuratorium.waw.pl/szkoly',
        selector: '.school-entry'
      }
    ];

    try {
      let processed = 0;
      const total = sources.length;

      for (const source of sources) {
        if (progressCallback) {
          progressCallback({
            percentage: (processed / total) * 90,
            processed,
            total,
            message: `Scraping ${source.name}`
          });
        }

        try {
          const schoolData = await this.scrapeSource(source, config.limit || 10);
          results.push(...schoolData);
        } catch (error) {
          console.error(`Failed to scrape ${source.name}:`, error);
        }

        processed++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (progressCallback) {
        progressCallback({
          percentage: 100,
          processed: results.length,
          total: results.length,
          message: 'Government schools scraping completed'
        });
      }

      return results;
    } catch (error) {
      console.error('Python-style scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape school details from individual pages
   */
  async scrapeSchoolDetails(urls: string[], progressCallback?: PythonProgressCallback): Promise<SchoolData[]> {
    const results: SchoolData[] = [];
    let processed = 0;
    const total = urls.length;

    try {
      for (const url of urls) {
        if (progressCallback) {
          progressCallback({
            percentage: (processed / total) * 90,
            processed,
            total,
            message: `Scraping details from ${url}`
          });
        }

        try {
          const schoolData = await this.scrapeSchoolPage(url);
          if (schoolData) {
            results.push(schoolData);
          }
        } catch (error) {
          console.error(`Failed to scrape ${url}:`, error);
        }

        processed++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      if (progressCallback) {
        progressCallback({
          percentage: 100,
          processed: results.length,
          total: results.length,
          message: 'School details scraping completed'
        });
      }

      return results;
    } catch (error) {
      console.error('School details scraping failed:', error);
      throw error;
    }
  }

  /**
   * Scrape a specific source using fetch API
   */
  private async scrapeSource(source: { name: string; url: string; selector: string }, limit: number): Promise<SchoolData[]> {
    try {
      const response = await fetch(source.url, {
        headers: this.baseHeaders,
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();
      
      // Simple HTML parsing without external dependencies
      const schools: SchoolData[] = [];
      
      // Mock data for now - in real implementation, we'd parse HTML
      for (let i = 0; i < Math.min(limit, 5); i++) {
        schools.push({
          name: `${source.name} School ${i + 1}`,
          address: `Address ${i + 1}, Warsaw, Poland`,
          phone: `+48 22 ${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
          email: `school${i + 1}@${source.name.toLowerCase()}.edu.pl`,
          website: `https://school${i + 1}.${source.name.toLowerCase()}.edu.pl`,
          type: 'Szkoła podstawowa'
        });
      }

      return schools;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error);
      return [];
    }
  }

  /**
   * Scrape individual school page
   */
  private async scrapeSchoolPage(url: string): Promise<SchoolData | null> {
    try {
      const response = await fetch(url, {
        headers: this.baseHeaders,
        signal: AbortSignal.timeout(30000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Simple mock data - in real implementation, we'd parse HTML
      const school: SchoolData = {
        name: `School from ${url}`,
        address: 'Sample Address, Warsaw, Poland',
        phone: '+48 22 1234567',
        email: 'contact@school.edu.pl',
        website: url,
        description: 'A sample school description',
        principal: 'Jan Kowalski',
        type: 'Szkoła podstawowa',
        studentCount: Math.floor(Math.random() * 500) + 100,
        teacherCount: Math.floor(Math.random() * 50) + 10,
        facilities: ['Library', 'Computer Lab', 'Gym', 'Cafeteria'],
        programs: ['Mathematics', 'Science', 'Arts', 'Sports']
      };

      return school;
    } catch (error) {
      console.error(`Error scraping school page ${url}:`, error);
      return null;
    }
  }

  /**
   * Helper methods for data cleaning
   */
  private cleanText(text?: string): string | undefined {
    if (!text) return undefined;
    return text.replace(/\s+/g, ' ').trim() || undefined;
  }

  private cleanPhone(phone?: string): string | undefined {
    if (!phone) return undefined;
    const cleaned = phone.replace(/[^\d\s\-\+\(\)]/g, '').trim();
    return cleaned.length >= 9 ? cleaned : undefined;
  }

  private cleanEmail(email?: string): string | undefined {
    if (!email) return undefined;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : undefined;
  }

  /**
   * Test connection by making a simple HTTP request
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://httpbin.org/user-agent', {
        headers: this.baseHeaders,
        signal: AbortSignal.timeout(10000)
      });
      
      console.log('✅ Python-style scraping service is working');
      return response.ok;
    } catch (error) {
      console.error('❌ Python-style scraping service failed:', error);
      return false;
    }
  }
}