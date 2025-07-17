import random
import time

class ProxyManager:
    """
    Klasa do zarządzania listą proxy i rotacji między nimi
    """
    def __init__(self, proxies=None):
        """
        Inicjalizacja menedżera proxy
        
        Args:
            proxies (list, optional): Lista proxy w formacie {'http': 'http://user:pass@host:port'}
        """
        self.proxies = proxies or []
        self.blocked_proxies = {}
        self.current_index = 0
    
    def get_next_proxy(self):
        """
        Pobieranie następnego dostępnego proxy z listy
        
        Returns:
            dict: Proxy w formacie {'http': 'http://user:pass@host:port'} lub pusty słownik
        """
        # Jeśli lista proxy jest pusta, zwracamy pusty słownik
        if not self.proxies:
            return {}
        
        # Sprawdzenie, czy są dostępne proxy (nie zablokowane)
        available_proxies = [p for p in self.proxies if p not in self.blocked_proxies or 
                            time.time() - self.blocked_proxies[p] > 300]  # 5 minut blokady
        
        if not available_proxies:
            # Jeśli wszystkie proxy są zablokowane, resetujemy blokady dla najstarszych
            if self.blocked_proxies:
                oldest_blocked = min(self.blocked_proxies.items(), key=lambda x: x[1])[0]
                del self.blocked_proxies[oldest_blocked]
                available_proxies = [oldest_blocked]
            else:
                return {}
        
        # Wybieramy losowe proxy z dostępnych
        proxy = random.choice(available_proxies)
        return proxy
    
    def mark_as_blocked(self, proxy):
        """
        Oznaczenie proxy jako zablokowanego
        
        Args:
            proxy (dict): Proxy do oznaczenia jako zablokowane
        """
        if proxy and proxy in self.proxies:
            self.blocked_proxies[proxy] = time.time()
    
    def add_proxy(self, proxy):
        """
        Dodanie nowego proxy do listy
        
        Args:
            proxy (dict): Proxy do dodania
        """
        if proxy and proxy not in self.proxies:
            self.proxies.append(proxy)
    
    def remove_proxy(self, proxy):
        """
        Usunięcie proxy z listy
        
        Args:
            proxy (dict): Proxy do usunięcia
        """
        if proxy in self.proxies:
            self.proxies.remove(proxy)
            if proxy in self.blocked_proxies:
                del self.blocked_proxies[proxy]