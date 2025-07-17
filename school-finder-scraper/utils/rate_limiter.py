import time

class RateLimiter:
    """
    Klasa do ograniczania liczby zapytań w jednostce czasu
    """
    def __init__(self, requests_per_minute):
        """
        Inicjalizacja limitera
        
        Args:
            requests_per_minute (int): Maksymalna liczba zapytań na minutę
        """
        self.requests_per_minute = max(1, requests_per_minute)
        self.interval = 60.0 / self.requests_per_minute  # Interwał w sekundach
        self.last_request_time = 0
    
    def wait(self):
        """
        Oczekiwanie na możliwość wykonania kolejnego zapytania
        zgodnie z ustawionym limitem
        """
        current_time = time.time()
        elapsed = current_time - self.last_request_time
        
        # Jeśli od ostatniego zapytania minęło mniej czasu niż interwał,
        # czekamy na upłynięcie interwału
        if elapsed < self.interval:
            sleep_time = self.interval - elapsed
            time.sleep(sleep_time)
        
        # Aktualizacja czasu ostatniego zapytania
        self.last_request_time = time.time()