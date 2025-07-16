import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  
  // Verify the token and get the user
  const { data: { user }, error } = await supabase.auth.getUser(token)
  
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 })
  }
  
  // Check if user has admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (profileError || !profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }
  
  return NextResponse.json({ isAdmin: true })
}