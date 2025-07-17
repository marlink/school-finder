'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signUp: (email: string, password: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  signIn: (email: string, password: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  updatePassword: (password: string) => Promise<{
    error: Error | null
    success: boolean
  }>
  updateProfile: (data: { name?: string; avatar_url?: string }) => Promise<{
    error: Error | null
    success: boolean
  }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get session from storage
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    // Hardcoded admin credentials
    if (email === 'admin@admin.com' && password === 'admin') {
      // Create a mock user and session for the admin
      const mockUser = {
        id: 'admin-user-id',
        email: 'admin@admin.com',
        role: 'admin',
        app_metadata: { provider: 'hardcoded' },
        user_metadata: { name: 'Admin User' },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as unknown as User

      const mockSession = {
        access_token: 'admin-token',
        refresh_token: 'admin-refresh-token',
        user: mockUser,
        expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      } as unknown as Session

      // Set the user and session in the context
      setUser(mockUser)
      setSession(mockSession)

      // Store the mock session in localStorage to persist across page refreshes
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        currentSession: mockSession,
        expiresAt: mockSession.expires_at
      }))

      return {
        error: null,
        success: true,
      }
    }

    // Regular Supabase authentication for non-admin users
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }
  
  const updateProfile = async (data: { name?: string; avatar_url?: string }) => {
    try {
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id)

      return {
        error,
        success: !error,
      }
    } catch (error) {
      return {
        error: error as Error,
        success: false,
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}