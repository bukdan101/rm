import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {}
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's favorites with listing details from car_favorites table
    const { data: favorites, error } = await supabase
      .from('car_favorites')
      .select(`
        id,
        car_listing_id,
        notes,
        created_at,
        listing:car_listings(
          id,
          title,
          year,
          price_cash,
          mileage,
          city,
          province,
          status,
          brand:brands(name),
          model:car_models(name),
          images:car_images(image_url, is_primary),
          inspection:car_inspections(inspection_score, overall_grade)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      return NextResponse.json({ success: true, favorites: [] })
    }

    // Transform data to match expected format
    const transformedFavorites = favorites?.map(fav => ({
      id: fav.id,
      listing_id: fav.car_listing_id,
      created_at: fav.created_at,
      listing: fav.listing
    })) || []

    return NextResponse.json({
      success: true,
      favorites: transformedFavorites,
    })
  } catch (error) {
    console.error('My favorites error:', error)
    return NextResponse.json({ success: true, favorites: [] })
  }
}
