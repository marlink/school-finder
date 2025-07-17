import time
from curl_cffi import requests
from utils.rate_limiter import RateLimiter
from utils.proxy_manager import ProxyManager

class BaseScraper:
    def __init__(self, config):
        self.config = config
        self.rate_limiter = RateLimiter(config.get('rate_limit', 10))
        self.proxy_manager = ProxyManager(config.get('proxies', []))
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
        }
    
    def fetch(self, url, method='GET', params=None, data=None, retry_count=3):
        """Pobieranie danych z wykorzystaniem curl-cffi z obsługą proxy i rate limiting"""
        self.rate_limiter.wait()
        
        for attempt in range(retry_count):
            try:
                proxy = self.proxy_manager.get_next_proxy()
                
                response = requests.request(
                    method=method,
                    url=url,
                    params=params,
                    data=data,
                    headers=self.headers,
                    proxies=proxy,
                    impersonate="chrome110",  # Emulacja przeglądarki
                    timeout=30
                )
                
                if response.status_code == 200:
                    return response
                elif response.status_code == 429:  # Too Many Requests
                    self.proxy_manager.mark_as_blocked(proxy)
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    time.sleep(1)
            except Exception as e:
                if attempt == retry_count - 1:
                    raise e
                time.sleep(2 ** attempt)
        
        raise Exception(f"Failed to fetch {url} after {retry_count} attempts")