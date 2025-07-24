# Internationalization (i18n)

## Overview
The School Finder Portal supports multiple languages to serve a diverse user base. We use `next-intl` for internationalization.

## Setup

### Installation
```bash
npm install next-intl
```

### Configuration
```typescript
// next.config.js
const withNextIntl = require('next-intl/plugin')();

module.exports = withNextIntl({
  // Other Next.js config
});
```

### Message Files
Create translation files for each supported language:

```json
// messages/en.json
{
  "common": {
    "search": "Search",
    "filter": "Filter",
    "login": "Log in",
    "signup": "Sign up"
  },
  "home": {
    "title": "Find the Perfect School",
    "subtitle": "Search through thousands of schools to find the best match"
  },
  "school": {
    "details": "School Details",
    "ratings": "Ratings",
    "location": "Location",
    "contact": "Contact Information"
  }
}
```

```json
// messages/pl.json
{
  "common": {
    "search": "Szukaj",
    "filter": "Filtruj",
    "login": "Zaloguj się",
    "signup": "Zarejestruj się"
  },
  "home": {
    "title": "Znajdź idealną szkołę",
    "subtitle": "Przeszukaj tysiące szkół, aby znaleźć najlepsze dopasowanie"
  },
  "school": {
    "details": "Szczegóły szkoły",
    "ratings": "Oceny",
    "location": "Lokalizacja",
    "contact": "Informacje kontaktowe"
  }
}
```

## Usage

### In Components
```jsx
// components/SearchForm.jsx
'use client';
import { useTranslations } from 'next-intl';

export function SearchForm() {
  const t = useTranslations('common');
  
  return (
    <form>
      <input 
        type="text" 
        placeholder={t('search')} 
        className="p-2 border rounded"
      />
      <button className="p-2 bg-orange-500 text-white rounded">
        {t('search')}
      </button>
    </form>
  );
}
```

### Language Switcher
```jsx
// components/LanguageSwitcher.jsx
'use client';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  
  const changeLanguage = (newLocale) => {
    router.push(`/${newLocale}${window.location.pathname.substring(3)}`);
  };
  
  return (
    <div className="flex gap-2">
      <button 
        onClick={() => changeLanguage('en')}
        className={locale === 'en' ? 'font-bold' : ''}
      >
        EN
      </button>
      <button 
        onClick={() => changeLanguage('pl')}
        className={locale === 'pl' ? 'font-bold' : ''}
      >
        PL
      </button>
    </div>
  );
}
```

## Date and Number Formatting
Use the built-in formatters for dates and numbers:

```jsx
import { useFormatter } from 'next-intl';

export function SchoolLastUpdated({ date }) {
  const format = useFormatter();
  
  return (
    <p>
      Last updated: {format.dateTime(date, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  );
}
```