# Error Handling

## Overview
Proper error handling ensures a smooth user experience and helps developers debug issues quickly.

## Frontend Error Handling

### React Error Boundaries
```tsx
// components/ErrorBoundary.tsx
import React from 'react';

class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-semibold text-red-700">Something went wrong</h2>
          <p className="text-red-600">Please try again or contact support</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
```

### API Request Error Handling
```tsx
// hooks/useSchools.ts
import useSWR from 'swr';

export function useSchools(query, filters) {
  const { data, error, isLoading } = useSWR(
    `/api/schools?query=${query}&filters=${JSON.stringify(filters)}`,
    async (url) => {
      try {
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || 'Failed to fetch schools');
        }
        
        return res.json();
      } catch (err) {
        console.error('School fetch error:', err);
        throw err;
      }
    }
  );
  
  return { schools: data, isLoading, error };
}
```

## Backend Error Handling

### API Route Error Handler
```typescript
// app/api/error-handler.ts
import { NextResponse } from 'next/server';

export function handleApiError(error: unknown) {
  console.error('API Error:', error);
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}
```

Use this handler in API routes:
```typescript
// app/api/schools/route.ts
import { handleApiError } from '../error-handler';

export async function GET(request) {
  try {
    // Code to fetch schools
  } catch (error) {
    return handleApiError(error);
  }
}
```