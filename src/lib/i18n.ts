/**
 * Internationalization utilities for detecting user language preference
 * Based on browser settings and location
 */

export type SupportedLanguage = 'en' | 'pl';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pl';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'pl'];

export const LANGUAGE_NAMES = {
  en: 'English',
  pl: 'Polski'
};

/**
 * Detect user's preferred language based on browser settings
 */
export function detectBrowserLanguage(): SupportedLanguage {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const browserLanguage = navigator.language || (navigator as any).userLanguage;
  
  // Check if browser language matches supported languages
  if (browserLanguage.startsWith('pl')) {
    return 'pl';
  } else if (browserLanguage.startsWith('en')) {
    return 'en';
  }

  // Default to Polish for Polish-speaking countries
  const polishCountries = ['PL'];
  const countryCode = browserLanguage.split('-')[1];
  
  if (countryCode && polishCountries.includes(countryCode.toUpperCase())) {
    return 'pl';
  }

  return DEFAULT_LANGUAGE;
}

/**
 * Get user's timezone to help determine location-based language preference
 */
export function getUserTimezone(): string {
  if (typeof Intl === 'undefined') {
    return 'Europe/Warsaw';
  }
  
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Determine language based on timezone (as a fallback for location detection)
 */
export function getLanguageFromTimezone(timezone: string): SupportedLanguage {
  // Polish timezones
  if (timezone.includes('Europe/Warsaw') || timezone.includes('Poland')) {
    return 'pl';
  }
  
  // Default to English for other timezones
  return 'en';
}

/**
 * Get user's preferred language with multiple fallback methods
 */
export function getUserPreferredLanguage(): SupportedLanguage {
  // Check localStorage first
  if (typeof localStorage !== 'undefined') {
    const savedLanguage = localStorage.getItem('preferredLanguage') as SupportedLanguage;
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      return savedLanguage;
    }
  }

  // Check browser language
  const browserLanguage = detectBrowserLanguage();
  
  // Check timezone as additional context
  const timezone = getUserTimezone();
  const timezoneLanguage = getLanguageFromTimezone(timezone);
  
  // If browser language is Polish or timezone suggests Polish location, use Polish
  if (browserLanguage === 'pl' || timezoneLanguage === 'pl') {
    return 'pl';
  }
  
  // If browser language is English, use English
  if (browserLanguage === 'en') {
    return 'en';
  }
  
  // Default fallback
  return DEFAULT_LANGUAGE;
}

/**
 * Save user's language preference to localStorage
 */
export function saveLanguagePreference(language: SupportedLanguage): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('preferredLanguage', language);
  }
}

/**
 * Format number according to user's language preference
 */
export function formatNumber(number: number, language: SupportedLanguage): string {
  const locale = language === 'pl' ? 'pl-PL' : 'en-US';
  return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format date according to user's language preference
 */
export function formatDate(date: Date, language: SupportedLanguage): string {
  const locale = language === 'pl' ? 'pl-PL' : 'en-US';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Format currency according to user's language preference
 */
export function formatCurrency(amount: number, language: SupportedLanguage): string {
  const locale = language === 'pl' ? 'pl-PL' : 'en-US';
  const currency = language === 'pl' ? 'PLN' : 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}

/**
 * Get direction for text layout (for future RTL support)
 */
export function getTextDirection(language: SupportedLanguage): 'ltr' | 'rtl' {
  // Both Polish and English are left-to-right languages
  return 'ltr';
}

/**
 * Hook for React components to use language detection
 */
export function useLanguageDetection(): {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
} {
  const [language, setLanguageState] = React.useState<SupportedLanguage>(
    getUserPreferredLanguage()
  );

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    saveLanguagePreference(lang);
  };

  return { language, setLanguage };
}

// Import React only if we're in a client environment
let React: any;
if (typeof window !== 'undefined') {
  React = require('react');
}
