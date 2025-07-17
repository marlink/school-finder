/**
 * Proxy Manager dla scrapera
 * 
 * Klasa do zarządzania i rotacji proxy
 */

interface Proxy {
  host: string;
  port: number;
  auth?: {
    username: string;
    password: string;
  };
  blockedUntil?: number;
}

export class ProxyManager {
  private proxies: Proxy[];
  private currentIndex: number;
  private blockDuration: number; // Czas blokady proxy w milisekundach
  
  /**
   * Konstruktor
   * @param proxyList Lista proxy w formacie ['http://user:pass@host:port']
   */
  constructor(proxyList: string[] = []) {
    this.proxies = this.parseProxyList(proxyList);
    this.currentIndex = 0;
    this.blockDuration = 5 * 60 * 1000; // 5 minut
  }
  
  /**
   * Parsowanie listy proxy z formatu string do obiektu Proxy
   */
  private parseProxyList(proxyList: string[]): Proxy[] {
    return proxyList.map(proxyStr => {
      try {
        const url = new URL(proxyStr);
        const auth = url.username && url.password ? {
          username: url.username,
          password: url.password
        } : undefined;
        
        return {
          host: url.hostname,
          port: parseInt(url.port, 10) || 80,
          auth
        };
      } catch (error) {
        console.error(`Invalid proxy format: ${proxyStr}`);
        return null;
      }
    }).filter(Boolean) as Proxy[];
  }
  
  /**
   * Pobieranie następnego dostępnego proxy
   */
  getNextProxy(): Proxy | null {
    if (this.proxies.length === 0) {
      return null;
    }
    
    const now = Date.now();
    let checkedCount = 0;
    
    while (checkedCount < this.proxies.length) {
      const proxy = this.proxies[this.currentIndex];
      this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
      
      if (!proxy.blockedUntil || proxy.blockedUntil < now) {
        return proxy;
      }
      
      checkedCount++;
    }
    
    // Jeśli wszystkie proxy są zablokowane, zwróć null
    return null;
  }
  
  /**
   * Oznaczenie proxy jako zablokowanego
   */
  markAsBlocked(proxy: Proxy | null): void {
    if (!proxy) return;
    
    const index = this.proxies.findIndex(p => 
      p.host === proxy.host && p.port === proxy.port
    );
    
    if (index !== -1) {
      this.proxies[index].blockedUntil = Date.now() + this.blockDuration;
    }
  }
}