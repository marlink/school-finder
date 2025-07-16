'use client'

import { useState } from 'react'
import { UserFavorite } from '@/types/user'
import { School } from '@/types/school'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getRatingColor } from '@/utils/mapUtils'
import { getAppPath } from '@/lib/routeUtils'

interface UserFavoritesListProps {
  favorites: UserFavorite[];
  onRemoveFavorite?: (favoriteId: number) => void;
}

export function UserFavoritesList({ favorites, onRemoveFavorite }: UserFavoritesListProps) {
  const [isLoading, setIsLoading] = useState<number | null>(null);

  const handleRemove = async (favoriteId: number) => {
    if (!onRemoveFavorite) return;
    
    setIsLoading(favoriteId);
    try {
      await onRemoveFavorite(favoriteId);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl">Favorite Schools</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Schools you've saved for later
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {favorites.length === 0 ? (
          <div className="text-center py-4 md:py-6">
            <p className="text-muted-foreground text-sm md:text-base mb-4">You haven't added any favorite schools yet</p>
            <Link href={getAppPath('/schools')}>
              <Button className="text-xs sm:text-sm">Browse Schools</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {favorites.map((favorite) => {
              const school = favorite.school as School;
              if (!school) return null;
              
              return (
                <div key={favorite.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1">
                      <Link href={getAppPath(`/schools/${school.id}`)}>
                        <h3 className="font-medium hover:underline text-sm md:text-base">{school.name}</h3>
                      </Link>
                      <p className="text-xs md:text-sm text-muted-foreground break-words">{school.address}</p>
                      
                      {school.rating && (
                        <div className="mt-2 flex items-center">
                          <span 
                            className="inline-block px-2 py-1 text-xs rounded-full text-white" 
                            style={{ backgroundColor: getRatingColor(school.rating) }}
                          >
                            {school.rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {school.reviewCount || 0} reviews
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {onRemoveFavorite && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRemove(favorite.id)}
                        disabled={isLoading === favorite.id}
                        className="w-full sm:w-auto mt-2 sm:mt-0 text-xs"
                      >
                        {isLoading === favorite.id ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}