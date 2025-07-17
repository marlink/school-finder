/**
 * Bazowy scraper dla School Finder
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { ScraperConfig } from '../index';
import { RateLimiter } from '../utils/rate-limiter';
import { ProxyManager } from '../utils/proxy-manager';

export class BaseScraper {
  protected config: ScraperConfig;
  protected rateLimiter: RateLimiter;
  protected proxyManager: ProxyManager;
  protected headers: Record<string, string>;
  
  constructor(config: ScraperConfig) {
    this.config = config;
    this.rateLimiter = new RateLimiter(config.rateLimit || 10);
    this.proxyManager = new ProxyManager(config.proxies || []);
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
    };
  }
  
  /**
   * Pobieranie danych z wykorzystaniem axios z obsługą proxy i rate limiting
   */
  protected async fetch<T = any>(
    url: string,
    method: string = 'GET',
    params?: any,
    data?: any,
    retryCount: number = 3
  ): Promise<AxiosResponse<T>> {
    await this.rateLimiter.wait();
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        const proxy = this.proxyManager.getNextProxy();
        
        const config: AxiosRequestConfig = {
          method,
          url,
          params,
          data,
          headers: this.headers,
          proxy: proxy ? {
            host: proxy.host,
            port: proxy.port,
            auth: proxy.auth
          } : undefined,
          timeout: 30000
        };
        
        const response = await axios(config);
        
        if (response.status === 200) {
          return response;
        } else if (response.status === 429) { // Too Many Requests
          this.proxyManager.markAsBlocked(proxy);
          await this.sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
        } else {
          await this.sleep(1000);
        }
      } catch (error) {
        if (attempt === retryCount - 1) {
          throw error;
        }
        await this.sleep(Math.pow(2, attempt) * 1000);
      }
    }
    
    throw new Error(`Failed to fetch ${url} after ${retryCount} attempts`);
  }
  
  /**
   * Pomocnicza metoda do wstrzymania wykonania
   */
  protected async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}