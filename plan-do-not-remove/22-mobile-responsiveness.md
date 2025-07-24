# Mobile Responsiveness

## Overview
The School Finder Portal is designed to work seamlessly across all device sizes, from mobile phones to desktop computers.

## Responsive Design Approach

### Tailwind CSS Breakpoints
We use Tailwind CSS breakpoints for responsive design:

- `sm`: 640px and up
- `md`: 768px and up
- `lg`: 1024px and up
- `xl`: 1280px and up
- `2xl`: 1536px and up

### Mobile-First Development
Start with mobile layouts and add complexity for larger screens:

```jsx
// components/SchoolCard.jsx
export function SchoolCard({ school }) {
  return (
    <div className="
      p-4 
      border rounded-lg 
      flex flex-col 
      md:flex-row 
      gap-4
    ">
      <div className="
        w-full 
        md:w-1/3
      ">
        <img 
          src={school.image || '/placeholder-school.jpg'} 
          alt={school.name}
          className="w-full h-48 object-cover rounded"
        />
      </div>
      
      <div className="
        w-full 
        md:w-2/3
      ">
        <h2 className="text-xl font-bold">{school.name}</h2>
        <p className="text-gray-600">{school.type} • {school.city}</p>
        <div className="mt-2 flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1">{school.rating || 'No ratings'}</span>
        </div>
        <p className="mt-2 line-clamp-2">{school.description}</p>
        
        <div className="
          mt-4 
          flex 
          flex-col 
          sm:flex-row 
          gap-2
        ">
          <button className="
            px-4 py-2 
            bg-orange-500 text-white 
            rounded
          ">
            View Details
          </button>
          <button className="
            px-4 py-2 
            border border-orange-500 
            text-orange-500 
            rounded
          ">
            Add to Favorites
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Responsive Navigation

### Mobile Menu
```jsx
// components/Navbar.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="School Finder" />
              <span className="ml-2 font-bold text-orange-500">School Finder</span>
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/search" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Search
            </Link>
            <Link href="/about" className="px-3 py-2 rounded-md hover:bg-gray-100">
              About
            </Link>
            <Link href="/pricing" className="px-3 py-2 rounded-md hover:bg-gray-100">
              Pricing
            </Link>
            <Link 
              href="/login" 
              className="ml-4 px-4 py-2 rounded-md bg-orange-500 text-white"
            >
              Log In
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              href="/search" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Search
            </Link>
            <Link 
              href="/about" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/login" 
              className="block px-3 py-2 rounded-md bg-orange-500 text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Log In
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
```

## Responsive Tables
For tables that need to be responsive on mobile:

```jsx
// components/ResponsiveTable.jsx
export function ResponsiveTable({ schools }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table content */}
      </table>
    </div>
  );
}
```

## Testing Responsiveness
- Use browser developer tools to test different screen sizes
- Test on actual mobile devices when possible
- Use Vercel preview deployments to test on various devices