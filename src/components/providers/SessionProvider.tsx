'use client'

interface SessionProviderProps {
  children: React.ReactNode
}

export function SessionProvider({ children }: SessionProviderProps) {
  // Stack Auth provider is already configured in layout.tsx
  // This component now just passes through children
  return <>{children}</>
}
