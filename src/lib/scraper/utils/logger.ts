/**
 * Logger dla scrapera
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export class Logger {
  private level: LogLevel;
  private prefix: string;
  
  constructor(level: LogLevel = LogLevel.INFO, prefix: string = 'Scraper') {
    this.level = level;
    this.prefix = prefix;
  }
  
  /**
   * Ustawienie poziomu logowania
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }
  
  /**
   * Logowanie na poziomie DEBUG
   */
  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(`[${this.prefix}] [DEBUG] ${message}`, ...args);
    }
  }
  
  /**
   * Logowanie na poziomie INFO
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(`[${this.prefix}] [INFO] ${message}`, ...args);
    }
  }
  
  /**
   * Logowanie na poziomie WARNING
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARNING)) {
      console.warn(`[${this.prefix}] [WARNING] ${message}`, ...args);
    }
  }
  
  /**
   * Logowanie na poziomie ERROR
   */
  error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`[${this.prefix}] [ERROR] ${message}`, ...args);
    }
  }
  
  /**
   * Sprawdzenie, czy dany poziom logowania powinien być wyświetlany
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARNING]: 2,
      [LogLevel.ERROR]: 3
    };
    
    return levels[level] >= levels[this.level];
  }
}

/**
 * Utworzenie loggera z odpowiednim poziomem logowania
 */
export function setupLogger(level: string = 'INFO'): Logger {
  const logLevel = (level in LogLevel) ? (LogLevel as any)[level] : LogLevel.INFO;
  return new Logger(logLevel);
}