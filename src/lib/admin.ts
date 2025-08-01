import { getUser } from './auth'
import { prisma } from './prisma'

export async function isAdminUser(userId?: string): Promise<boolean> {
  if (!userId) return false

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    })

    // Check if user is admin role or has admin email
    return user?.role === 'admin' || user?.email === process.env.ADMIN_EMAIL
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const user = await getUser()
  
  if (!user?.id) {
    throw new Error('Unauthorized: No session')
  }

  const isAdmin = await isAdminUser(user.id)
  
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }

  return user
}

export async function getCurrentUser() {
  const user = await getUser()
  
  if (!user?.id) {
    return null
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      subscriptionStatus: true,
      createdAt: true,
      updatedAt: true
    }
  })

  return dbUser
}

export function withAdminAuth(handler: any) {
  return async function adminAuthHandler(req: any, res: any) {
    try {
      await requireAdmin()
      return handler(req, res)
    } catch (error) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: error instanceof Error ? error.message : 'Admin access required'
      })
    }
  }
}
