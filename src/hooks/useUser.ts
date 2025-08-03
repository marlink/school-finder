'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

interface UserProfile {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  subscriptionStatus: string
  createdAt: string
  updatedAt: string
}

interface UserStats {
  favoritesCount: number
  ratingsCount: number
  searchCount: number
}

export function useUser() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(false)

  const isAuthenticated = status === 'authenticated'
  const isAdmin = profile?.role === 'admin'
  const isPremium = profile?.subscriptionStatus === 'premium'

  const fetchProfile = async () => {
    if (!session?.user?.id) return

    setLoading(true)
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await fetchProfile() // Refresh profile data
        return true
      }
      return false
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const deleteAccount = async () => {
    if (!session?.user?.id) return false

    try {
      const response = await fetch('/api/user/profile', {
        method: 'DELETE',
      })

      return response.ok
    } catch (error) {
      console.error('Error deleting account:', error)
      return false
    }
  }

  useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      fetchProfile()
    }
  }, [isAuthenticated, session?.user?.id])

  return {
    user: session?.user,
    profile,
    stats,
    loading,
    isAuthenticated,
    isAdmin,
    isPremium,
    updateProfile,
    deleteAccount,
    refetch: fetchProfile,
  }
}
