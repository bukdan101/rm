import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch dealer by slug or id
    const { data: dealer, error } = await supabase
      .from('dealers')
      .select(`
        *,
        owner:profiles!dealers_owner_id_fkey (
          id,
          email,
          full_name,
          phone,
          avatar_url,
          is_verified
        )
      `)
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq('is_active', true)
      .single()

    if (error || !dealer) {
      return NextResponse.json(
        { success: false, error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Fetch dealer's car listings
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
      .eq('dealer_id', dealer.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(20)

    if (listingsError) {
      console.error('Error fetching listings:', listingsError)
    }

    // Fetch location details
    let locationDetails = null
    if (dealer.city_id || dealer.province_id) {
      const [cityResult, provinceResult] = await Promise.all([
        dealer.city_id
          ? supabase.from('cities').select('*').eq('id', dealer.city_id).single()
          : { data: null },
        dealer.province_id
          ? supabase.from('provinces').select('*').eq('id', dealer.province_id).single()
          : { data: null }
      ])

      locationDetails = {
        city: cityResult.data,
        province: provinceResult.data
      }
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
        dealer,
        listings: listings || [],
        locationDetails,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching dealer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealer' },
      { status: 500 }
    )
  }
}
