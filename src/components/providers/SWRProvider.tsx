'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';
import { defaultSWRConfig, fetcher } from '@/lib/swr';

interface SWRProviderProps {
  children: ReactNode;
  fallback?: Record<string, any>;
}

export function SWRProvider({ children, fallback = {} }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        ...defaultSWRConfig,
        fetcher,
        fallback,
        onError: (error, key) => {
          console.error('SWR Error:', { error, key });
          
          // Log to analytics service
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'exception', {
              description: `SWR Error: ${error.message}`,
              fatal: false,
            });
          }
        },
        onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
          // Never retry on 404
          if (error.status === 404) return;
          
          // Never retry on 401 (unauthorized)
          if (error.status === 401) return;
          
          // Only retry up to 3 times
          if (retryCount >= 3) return;
          
          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}