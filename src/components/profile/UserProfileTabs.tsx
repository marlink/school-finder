'use client'

import { useState } from 'react'
import { User, UserStats, UserFavorite, UserViewedSchool } from '@/types/user'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserProfileCard } from './UserProfileCard'
import { UserStatsCard } from './UserStatsCard'
import { UserFavoritesList } from './UserFavoritesList'
import { UserViewedSchoolsList } from './UserViewedSchoolsList'

interface UserProfileTabsProps {
  user: User;
  stats: UserStats;
  favorites: UserFavorite[];
  viewedSchools: UserViewedSchool[];
  onRemoveFavorite?: (favoriteId: number) => void;
}

type TabType = 'profile' | 'favorites' | 'history';

export function UserProfileTabs({ 
  user, 
  stats, 
  favorites, 
  viewedSchools,
  onRemoveFavorite 
}: UserProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 w-full">
        <Button 
          variant={activeTab === 'profile' ? 'default' : 'outline'}
          onClick={() => setActiveTab('profile')}
          className="flex-1 sm:flex-none text-xs sm:text-sm"
        >
          Profile & Stats
        </Button>
        <Button 
          variant={activeTab === 'favorites' ? 'default' : 'outline'}
          onClick={() => setActiveTab('favorites')}
          className="flex-1 sm:flex-none text-xs sm:text-sm"
        >
          Favorites ({favorites.length})
        </Button>
        <Button 
          variant={activeTab === 'history' ? 'default' : 'outline'}
          onClick={() => setActiveTab('history')}
          className="flex-1 sm:flex-none text-xs sm:text-sm"
        >
          Viewed Schools ({viewedSchools.length})
        </Button>
      </div>

      <div>
        {activeTab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-2">
            <UserProfileCard user={user} />
            <UserStatsCard stats={stats} />
          </div>
        )}

        {activeTab === 'favorites' && (
          <UserFavoritesList 
            favorites={favorites} 
            onRemoveFavorite={onRemoveFavorite} 
          />
        )}

        {activeTab === 'history' && (
          <UserViewedSchoolsList viewedSchools={viewedSchools} />
        )}
      </div>
    </div>
  )
}