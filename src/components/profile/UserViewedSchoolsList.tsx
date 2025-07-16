'use client'

import { UserViewedSchool } from '@/types/user'
import { School } from '@/types/school'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { getRatingColor } from '@/utils/mapUtils'
import { getAppPath } from '@/lib/routeUtils'

interface UserViewedSchoolsListProps {
  viewedSchools: UserViewedSchool[];
}

export function UserViewedSchoolsList({ viewedSchools }: UserViewedSchoolsListProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg md:text-xl">Recently Viewed Schools</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Schools you've viewed recently
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {viewedSchools.length === 0 ? (
          <div className="text-center py-4 md:py-6">
            <p className="text-muted-foreground text-sm md:text-base">You haven't viewed any schools yet</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {viewedSchools.map((item) => {
              const school = item.school as School;
              if (!school) return null;
              
              return (
                <div key={item.id} className="border rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                        <Link href={getAppPath(`/schools/${school.id}`)}>
                          <h3 className="font-medium hover:underline text-sm md:text-base">{school.name}</h3>
                        </Link>
                        
                        {item.viewed_at && (
                          <span className="text-xs text-muted-foreground mt-1 sm:mt-0">
                            Viewed: {new Date(item.viewed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground break-words mt-1">{school.address}</p>
                      
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