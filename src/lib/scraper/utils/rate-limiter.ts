/**
 * Rate Limiter dla scrapera
 * 
 * Klasa do zarządzania częstotliwością zapytań HTTP
 */

export class RateLimiter {
  private requestsPerMinute: number;
  private interval: number;
  private lastRequestTime: number;
  
  /**
   * Konstruktor
   * @param requestsPerMinute Maksymalna liczba zapytań na minutę
   */
  constructor(requestsPerMinute: number = 10) {
    this.requestsPerMinute = requestsPerMinute;
    this.interval = 60 * 1000 / requestsPerMinute; // Interwał w milisekundach
    this.lastRequestTime = 0;
  }
  
  /**
   * Oczekiwanie na możliwość wykonania kolejnego zapytania
   */
  async wait(): Promise<void> {
    const now = Date.now();
    const timeElapsed = now - this.lastRequestTime;
    
    if (timeElapsed < this.interval) {
      const delay = this.interval - timeElapsed;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }
}