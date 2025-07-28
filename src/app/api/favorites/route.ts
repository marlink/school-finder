import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        schools (
          id,
          name,
          type,
          address,
          school_images!inner (
            id,
            image_url,
            alt_text,
            image_type
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('schools.school_images.image_type', 'main')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json(favorites || [])
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

    const supabase = createClient()

    // Check if school exists
    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('id', schoolId)
      .single()

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      )
    }

    // Check if already favorited
    const { data: existingFavorite } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('school_id', schoolId)
      .single()

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'School already favorited' },
        { status: 409 }
      )
    }

    const { data: favorite, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        school_id: schoolId,
        notes: notes || null
      })
      .select(`
        *,
        schools (
          id,
          name,
          type,
          address
        )
      `)
      .single()

    if (error) {
      throw error
    }

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

    const supabase = createClient()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('school_id', schoolId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
