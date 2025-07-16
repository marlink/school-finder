'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { getAppPath } from '@/lib/routeUtils'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const { updatePassword, user } = useAuth()
  const router = useRouter()

  // If user is not authenticated with a recovery token, redirect to login
  useEffect(() => {
    // This is a simple check - in a real app you might want to verify
    // that the user came from a password reset flow
    if (!user) {
      // We don't redirect immediately to allow the auth state to load
      const timer = setTimeout(() => {
        if (!user) {
          router.push(getAppPath('/login'))
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsLoading(true)

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error, success } = await updatePassword(password)

      if (error) {
        setError(error.message)
        return
      }

      if (success) {
        setSuccessMessage('Your password has been successfully reset.')
        // Clear the form
        setPassword('')
        setConfirmPassword('')
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push(getAppPath('/login'))
        }, 2000)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Set New Password</h1>
          <p className="text-muted-foreground">
            Please enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-sm rounded-md">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-green-100 border border-green-400 text-green-700 text-sm rounded-md">
              {successMessage}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium leading-none">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Reset Password'}
          </Button>
        </form>

        <div className="text-center text-sm">
          <Link href={getAppPath('/login')} className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}