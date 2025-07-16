'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { UserProfileTabs } from '@/components/profile/UserProfileTabs'
import { UserStats, UserFavorite, UserViewedSchool } from '@/types/user'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [viewedSchools, setViewedSchools] = useState<UserViewedSchool[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return
      setIsLoading(true)

      try {
        // Fetch user stats
        const { data: statsData, error: statsError } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (statsData) {
          setStats(statsData)
        } else if (statsError && statsError.code === 'PGRST116') {
          // No stats yet, create default stats
          setStats({
            id: 0,
            user_id: user.id,
            schools_viewed: 0,
            reviews_submitted: 0
          })
        }

        // Fetch favorites with school details
        const { data: favoritesData } = await supabase
          .from('user_favorites')
          .select(`
            id,
            user_id,
            school_id,
            created_at,
            school:school_id(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (favoritesData) {
          setFavorites(favoritesData)
        }

        // Fetch viewed schools with school details
        const { data: viewedData } = await supabase
          .from('user_viewed_schools')
          .select(`
            id,
            user_id,
            school_id,
            viewed_at,
            school:school_id(*)
          `)
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(10)

        if (viewedData) {
          setViewedSchools(viewedData)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const handleRemoveFavorite = async (favoriteId: number) => {
    try {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('id', favoriteId)
        .eq('user_id', user?.id)

      if (!error) {
        setFavorites(favorites.filter(fav => fav.id !== favoriteId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : stats ? (
          <UserProfileTabs
            user={user!}
            stats={stats}
            favorites={favorites}
            viewedSchools={viewedSchools}
            onRemoveFavorite={handleRemoveFavorite}
          />
        ) : (
          <div className="bg-card rounded-lg shadow p-6">
            <p>Failed to load user data. Please try again later.</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}