'use client'

import { UserStats } from '@/types/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface UserStatsCardProps {
  stats: UserStats;
}

export function UserStatsCard({ stats }: UserStatsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl">Your Activity</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Summary of your interactions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold">{stats.schools_viewed}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Schools Viewed</p>
          </div>
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg text-center shadow-sm">
            <p className="text-2xl sm:text-3xl font-bold">{stats.reviews_submitted}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">Reviews</p>
          </div>
        </div>
        
        {stats.last_login && (
          <div className="mt-4 text-xs sm:text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
            <p>Last login: {new Date(stats.last_login).toLocaleDateString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}