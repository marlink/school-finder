'use client'

import { useState } from 'react'
import { User } from '@/types/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'

interface UserProfileCardProps {
  user: User;
  minimal?: boolean;
}

export function UserProfileCard({ user, minimal = false }: UserProfileCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle>User Profile</CardTitle>
        {!minimal && (
          <CardDescription>
            Your personal information
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted flex-shrink-0 border-2 border-gray-100 shadow-sm">
            {user.avatar_url ? (
              <Image 
                src={user.avatar_url} 
                alt="Profile picture" 
                fill 
                className="object-cover" 
              />
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                <span className="text-2xl sm:text-3xl">👤</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2 text-center sm:text-left w-full">
            <h3 className="font-medium text-lg md:text-xl">{user.name || 'User'}</h3>
            <p className="text-sm md:text-base text-muted-foreground break-words">{user.email}</p>
            {!minimal && (
              <div className="pt-2 w-full">
                <Link href="/profile" className="w-full sm:w-auto inline-block">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}