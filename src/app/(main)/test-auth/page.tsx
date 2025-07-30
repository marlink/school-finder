'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useUser } from '@/hooks/useUser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default function TestAuthPage() {
  const [isClient, setIsClient] = useState(false)
  const { data: session, status } = useSession()
  const { user, profile, stats, isAuthenticated, isAdmin, isPremium, loading } = useUser()

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">Authentication Test Page</h1>
      
      {/* Session Status */}
      <Card>
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Status:</strong> 
              <Badge variant={status === 'authenticated' ? 'default' : 'secondary'} className="ml-2">
                {status}
              </Badge>
            </p>
            <p><strong>Is Authenticated:</strong> {isAuthenticated ? '✅' : '❌'}</p>
            <p><strong>Is Admin:</strong> {isAdmin ? '✅' : '❌'}</p>
            <p><strong>Is Premium:</strong> {isPremium ? '✅' : '❌'}</p>
            <p><strong>Loading:</strong> {loading ? '⏳' : '✅'}</p>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      {session?.user && (
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Current user session data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {session.user.id}</p>
              <p><strong>Name:</strong> {session.user.name || 'Not provided'}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Role:</strong> 
                <Badge variant={session.user.role === 'admin' ? 'destructive' : 'default'} className="ml-2">
                  {session.user.role}
                </Badge>
              </p>
              <p><strong>Subscription:</strong> 
                <Badge variant={session.user.subscriptionStatus === 'premium' ? 'default' : 'secondary'} className="ml-2">
                  {session.user.subscriptionStatus}
                </Badge>
              </p>
              {session.user.image && (
                <div>
                  <strong>Avatar:</strong>
                  <img 
                    src={session.user.image} 
                    alt="User avatar" 
                    className="w-12 h-12 rounded-full ml-2 inline-block"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Information */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Extended user profile data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Created At:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
              <p><strong>Updated At:</strong> {new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
            <CardDescription>User activity statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.favoritesCount}</p>
                <p className="text-sm text-muted-foreground">Favorites</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.ratingsCount}</p>
                <p className="text-sm text-muted-foreground">Ratings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.searchCount}</p>
                <p className="text-sm text-muted-foreground">Searches</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Authenticated */}
      {!isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>Please sign in to test authentication features</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/auth/signin">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
