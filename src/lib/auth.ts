import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextAuthOptions } from 'next-auth'

// Minimal authOptions to satisfy NextAuth imports while using Supabase
export const authOptions: NextAuthOptions = {
  providers: [],
  callbacks: {
    async session({ session }) {
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
}

export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserProfile() {
  const supabase = createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return null
  }
  
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    return null
  }
  
  return { user, profile }
}

export async function requireAuth() {
  const user = await getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }
  
  return user
}

export async function requireAdmin() {
  const userProfile = await getUserProfile()
  
  if (!userProfile || userProfile.profile.role !== 'admin') {
    redirect('/auth/signin')
  }
  
  return userProfile
}
