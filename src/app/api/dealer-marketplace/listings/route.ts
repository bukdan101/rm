import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Get listings for dealer marketplace
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dealerId = searchParams.get('dealer_id')
    const brandId = searchParams.get('brand_id')
    const modelId = searchParams.get('model_id')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const provinceId = searchParams.get('province_id')
    const cityId = searchParams.get('city_id')
    const yearFrom = searchParams.get('year_from')
    const yearTo = searchParams.get('year_to')
    const hasInspection = searchParams.get('has_inspection')
    const sortBy = searchParams.get('sort_by') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build query for dealer marketplace listings
    let query = supabaseAdmin
      .from('car_listings')
      .select(`
        id,
        listing_number,
        title,
        year,
        price_cash,
        mileage,
        city,
        province,
        fuel,
        transmission,
        body_type,
        condition,
        view_count,
        favorite_count,
        published_to_dealer_marketplace_at,
        created_at,
        brands:brand_id (id, name),
        car_models:model_id (id, name),
        car_colors:exterior_color_id (id, name),
        car_images!car_images_car_listing_id_fkey (image_url, is_primary, display_order)
      `, { count: 'exact' })
      .eq('status', 'active')
      .is('deleted_at', null)
      .in('visibility', ['dealer_marketplace', 'both'])

    // Apply filters
    if (brandId) query = query.eq('brand_id', brandId)
    if (modelId) query = query.eq('model_id', modelId)
    if (minPrice) query = query.gte('price_cash', parseInt(minPrice))
    if (maxPrice) query = query.lte('price_cash', parseInt(maxPrice))
    if (provinceId) query = query.eq('province_id', provinceId)
    if (cityId) query = query.eq('city_id', cityId)
    if (yearFrom) query = query.gte('year', parseInt(yearFrom))
    if (yearTo) query = query.lte('year', parseInt(yearTo))

    // Apply sorting
    switch (sortBy) {
      case 'oldest':
        query = query.order('published_to_dealer_marketplace_at', { ascending: true })
        break
      case 'price_asc':
        query = query.order('price_cash', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price_cash', { ascending: false })
        break
      case 'mileage_asc':
        query = query.order('mileage', { ascending: true })
        break
      case 'mileage_desc':
        query = query.order('mileage', { ascending: false })
        break
      default: // newest
        query = query.order('published_to_dealer_marketplace_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: listings, error, count } = await query

    if (error) throw error

    // Get inspection data for each listing
    const listingIds = listings?.map(l => l.id) || []
    const { data: inspections } = await supabaseAdmin
      .from('car_inspections')
      .select('car_listing_id, overall_grade, inspection_score, status')
      .in('car_listing_id', listingIds)
      .eq('status', 'completed')

    // Get offer counts for each listing
    const { data: offerCounts } = await supabaseAdmin
      .from('dealer_offers')
      .select('car_listing_id')
      .in('car_listing_id', listingIds)

    // Get favorite status if dealer_id provided
    let favorites: string[] = []
    if (dealerId) {
      const { data: favData } = await supabaseAdmin
        .from('dealer_marketplace_favorites')
        .select('car_listing_id')
        .eq('dealer_id', dealerId)
      
      favorites = favData?.map(f => f.car_listing_id) || []
    }

    // Transform data
    const transformedListings = listings?.map(listing => {
      const inspection = inspections?.find(i => i.car_listing_id === listing.id)
      const offerCount = offerCounts?.filter(o => o.car_listing_id === listing.id).length || 0
      const primaryImage = (listing.car_images as any[])?.find((img: any) => img.is_primary)?.image_url || 
                          (listing.car_images as any[])?.[0]?.image_url

      return {
        ...listing,
        brand_name: (listing.brands as any)?.name,
        model_name: (listing.car_models as any)?.name,
        exterior_color: (listing.car_colors as any)?.name,
        primary_image_url: primaryImage,
        inspection_grade: inspection?.overall_grade,
        inspection_score: inspection?.inspection_score,
        has_inspection: !!inspection,
        offer_count: offerCount,
        is_favorite: favorites.includes(listing.id)
      }
    })

    return NextResponse.json({
      success: true,
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching dealer marketplace listings:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
