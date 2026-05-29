import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()

    if (error || !profile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's car listings
    const { data: listings, error: listingsError } = await supabase
      .from('car_listings')
      .select(`
        id,
        title,
        slug,
        price_cash,
        price_credit,
        price_negotiable,
        year,
        mileage,
        vehicle_condition,
        transaction_type,
        status,
        city,
        province,
        view_count,
        favorite_count,
        is_featured,
        created_at,
        sold_at,
        brand:brands ( id, name, slug, logo_url ),
        model:car_models ( id, name, slug, body_type ),
        variant:car_variants ( id, name, transmission, fuel_type ),
        exterior_color:car_colors!car_listings_exterior_color_id_fkey ( id, name, hex_code ),
        images:car_images ( id, image_url, is_primary, display_order ),
        inspection:car_inspections ( id, risk_level, overall_score, passed_points, total_points, status )
      `)
      .eq('seller_id', profile.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
    }

    // Calculate stats
    const stats = {
      total_listings: listings?.length || 0,
      active_listings: listings?.filter(l => l.status === 'active').length || 0,
      sold_listings: listings?.filter(l => l.status === 'sold').length || 0,
      total_views: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
      total_favorites: listings?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        listings: listings || [],
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
