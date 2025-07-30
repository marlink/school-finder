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

  // Get user profile data from Stack Auth
  const profile = {
    id: user.id,
    email: user.primaryEmail,
    displayName: user.displayName,
    profileImageUrl: user.profileImageUrl,
    role: user.hasPermission('admin') ? 'admin' : 'user',
    subscriptionStatus: 'free', // TODO: Implement subscription logic with Stack Auth
    createdAt: user.createdAtMillis ? new Date(user.createdAtMillis) : new Date(),
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
