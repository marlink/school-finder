import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/profile
 * Get user profile and stats
 */
export async function GET() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile from database
    let profile = await prisma.user.findUnique({
      where: { id: user.id }
    })

    // If profile doesn't exist, create it
    if (!profile) {
      profile = await prisma.user.create({
        data: {
          id: user.id,
          email: user.primaryEmail || '',
          name: user.displayName || '',
          role: 'user',
          subscriptionStatus: 'free'
        }
      })
    }

    // Get user stats
    const [favoritesCount, ratingsCount, searchCount] = await Promise.all([
      prisma.favorite.count({ where: { userId: user.id } }),
      prisma.ratingsUsers.count({ where: { userId: user.id } }),
      prisma.searchHistory.count({ where: { userId: user.id } })
    ])

    const stats = {
      favoritesCount,
      ratingsCount,
      searchCount
    }

    return NextResponse.json({
      profile: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: user.profileImageUrl,
        role: profile.role,
        subscriptionStatus: profile.subscriptionStatus,
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString()
      },
      stats
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/user/profile
 * Update user profile
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const updates = await request.json()
    
    // Only allow certain fields to be updated
    const allowedFields = ['name', 'email']
    const filteredUpdates: Record<string, string> = {}
    
    for (const key of Object.keys(updates)) {
      if (allowedFields.includes(key)) {
        filteredUpdates[key] = updates[key]
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: filteredUpdates
    })

    return NextResponse.json({
      profile: {
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        image: user.profileImageUrl,
        role: updatedProfile.role,
        subscriptionStatus: updatedProfile.subscriptionStatus,
        createdAt: updatedProfile.createdAt.toISOString(),
        updatedAt: updatedProfile.updatedAt.toISOString()
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/profile
 * Delete user account and all associated data
 */
export async function DELETE() {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete user's favorites
      await tx.favorite.deleteMany({ where: { userId: user.id } })
      
      // Delete user's ratings
      await tx.ratingsUsers.deleteMany({ where: { userId: user.id } })
      
      // Delete user's search history
      await tx.searchHistory.deleteMany({ where: { userId: user.id } })
      
      // Delete user's profile
      await tx.user.delete({ where: { id: user.id } })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}