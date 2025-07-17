import logging
import os
import sys
from datetime import datetime

def setup_logger(log_level='INFO'):
    """
    Konfiguracja loggera dla scrapera
    
    Args:
        log_level (str): Poziom logowania (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        
    Returns:
        logging.Logger: Skonfigurowany logger
    """
    # Mapowanie poziomów logowania
    log_levels = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL
    }
    
    # Ustawienie poziomu logowania
    level = log_levels.get(log_level.upper(), logging.INFO)
    
    # Utworzenie katalogu logs, jeśli nie istnieje
    logs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    
    # Nazwa pliku logu z datą
    log_filename = os.path.join(logs_dir, f"scraper_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log")
    
    # Konfiguracja loggera
    logger = logging.getLogger('school_finder_scraper')
    logger.setLevel(level)
    
    # Handler dla konsoli
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(console_format)
    
    # Handler dla pliku
    file_handler = logging.FileHandler(log_filename)
    file_handler.setLevel(level)
    file_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(file_format)
    
    # Dodanie handlerów do loggera
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger