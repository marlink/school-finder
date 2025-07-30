// Stack Auth type definitions
// These types extend the Stack Auth user types for our application

export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  profileImageUrl: string | null
  role: 'admin' | 'user'
  subscriptionStatus: string
  createdAt: Date
}

export interface AuthUser {
  id: string
  primaryEmail: string | null
  displayName: string | null
  profileImageUrl: string | null
  hasPermission: (permission: string) => boolean
  createdAtMillis: number | null
}

// Legacy compatibility types for gradual migration
export interface LegacySession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    subscriptionStatus: string
  }
}

export interface LegacyUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  subscriptionStatus: string
}
