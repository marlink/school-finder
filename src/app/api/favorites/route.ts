import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getUser } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id
      },
      include: {
        school: {
          include: {
            images: {
              where: {
                imageType: 'main'
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Favorites API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { schoolId, notes } = await request.json()

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      )
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    })

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_schoolId: {
          userId: user.id,
          schoolId: schoolId
        }
      }
    })

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'School already favorited' },
        { status: 409 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        schoolId: schoolId,
        notes: notes || null
      },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true
          }
        }
      }
    })

    return NextResponse.json(favorite, { status: 201 })
  } catch (error) {
    console.error('Add favorite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      )
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: user.id,
        schoolId: schoolId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
