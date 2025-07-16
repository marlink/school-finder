'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { getAppPath } from '@/lib/routeUtils'

export default function ProfilePage() {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (data) {
          setName(data.name || '')
          setAvatarUrl(data.avatar_url || '')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }

    fetchProfile()
  }, [user])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      if (!user?.id) throw new Error('User not authenticated')

      // Upload avatar if a new one was selected
      let newAvatarUrl = avatarUrl
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        newAvatarUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/user-avatars/${filePath}`
      }

      // Update user profile in the database
      const { error: updateError } = await supabase
        .from('users')
        .update({ name, avatar_url: newAvatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setAvatarUrl(newAvatarUrl)
      setAvatarFile(null)
      setMessage({ text: 'Profile updated successfully!', type: 'success' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ 
        text: error instanceof Error ? error.message : 'Failed to update profile', 
        type: 'error' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
                <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted">
                  {avatarUrl ? (
                    <Image 
                      src={avatarUrl} 
                      alt="Profile picture" 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full bg-muted text-muted-foreground">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1" htmlFor="avatar">
                    Profile Picture
                  </label>
                  <Input 
                    id="avatar" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleAvatarChange} 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: Square image, max 2MB
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="email">
                    Email
                  </label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your email cannot be changed
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="name">
                    Name
                  </label>
                  <Input 
                    id="name" 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Your name" 
                  />
                </div>
              </div>
              
              {message && (
                <div className={`p-3 rounded ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message.text}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(getAppPath('/dashboard'))}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}