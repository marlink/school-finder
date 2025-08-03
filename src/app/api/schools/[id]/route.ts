import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const user = await getUser();
    const schoolId = resolvedParams.id;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Fetch school details with images
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select(`
        *,
        school_images (
          id,
          image_url,
          alt_text,
          image_type,
          caption,
          uploaded_at
        )
      `)
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if school is favorited by the current user
    let isFavorite = false;
    if (user) {
      const { data: favorite } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('school_id', schoolId)
        .single();
      
      isFavorite = !!favorite;
    }

    // Organize images by type
    const images = school.school_images || [];
    const mainImages = images.filter((img: any) => img.image_type === 'main');
    const galleryImages = images.filter((img: any) => img.image_type === 'gallery');
    const facilityImages = images.filter((img: any) => img.image_type === 'facility');

    // Structure the response (without ratings)
    const response = {
      ...school,
      isFavorite,
      organizedImages: {
        main: mainImages,
        gallery: galleryImages,
        facility: facilityImages
      },
      school_images: undefined // Remove from response as it's processed into organizedImages
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('School details API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
