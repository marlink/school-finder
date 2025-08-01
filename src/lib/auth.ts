import { stackServerApp } from '@/stack'
import { redirect } from 'next/navigation'

export async function getUser() {
  const user = await stackServerApp.getUser()
  return user
}

export async function getUserProfile() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    return null
  }

  // Get subscription status from user metadata or default to free
  const subscriptionStatus = user.clientMetadata?.subscriptionStatus || 'free'
  
  // Check admin permission
  const isAdmin = await user.hasPermission('admin')

  // Get user profile data from Stack Auth
  const profile = {
    id: user.id,
    email: user.primaryEmail,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    role: isAdmin ? 'admin' : 'user',
    subscriptionStatus: subscriptionStatus as 'free' | 'premium' | 'enterprise',
    createdAt: new Date(), // Use current date as Stack Auth doesn't expose createdAt directly
  }
  
  return { user, profile }
}

export async function requireAuth() {
  const user = await stackServerApp.getUser()
  
  if (!user) {
    redirect('/handler/signin')
  }
  
  return user
}

export async function requireAdmin() {
  const user = await stackServerApp.getUser()
  
  if (!user || !user.hasPermission('admin')) {
    redirect('/handler/signin')
  }
  
  return user
}

// Helper function to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await stackServerApp.getUser()
  return !!user
}

// Helper function to check if user is admin
export async function isAdmin(): Promise<boolean> {
  const user = await stackServerApp.getUser()
  return !!user && user.hasPermission('admin')
}
