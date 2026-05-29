import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Admin mode - show all listings regardless of status
    const isAdmin = searchParams.get('admin') === 'true'

    // Filters
    const brandId = searchParams.get('brand_id')
    const modelId = searchParams.get('model_id')
    const variantId = searchParams.get('variant_id')
    const transactionType = searchParams.get('transaction_type')
    const condition = searchParams.get('condition')
    const fuelType = searchParams.get('fuel')
    const transmission = searchParams.get('transmission')
    const bodyType = searchParams.get('body_type')
    const cityId = searchParams.get('city_id')
    const provinceId = searchParams.get('province_id')
    const yearMin = searchParams.get('year_min')
    const yearMax = searchParams.get('year_max')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const mileageMin = searchParams.get('mileage_min')
    const mileageMax = searchParams.get('mileage_max')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const marketplaceType = searchParams.get('marketplace_type')
    const dealerId = searchParams.get('dealer_id')
    const featured = searchParams.get('featured')
    const inspectionOnly = searchParams.get('inspection_only')

    // Build query - simple version that works with existing schema
    let query = supabase
      .from('car_listings')
      .select(`*, brands(name), car_models(name), profiles(id, full_name, email), car_images(image_url, is_primary)`, { count: 'exact' })

    // Apply status filter
    // Admin mode: show all statuses unless specific status is requested
    // Non-admin mode: only show active listings
    if (isAdmin) {
      // If admin and specific status requested, filter by that status
      if (status && status !== 'all') {
        if (status === 'banned') {
          query = query.eq('is_banned', true)
        } else {
          query = query.eq('status', status).eq('is_banned', false)
        }
      }
      // Otherwise show all listings (no status filter)
    } else {
      // Non-admin: only show active, non-banned listings
      query = query.eq('status', status || 'active').eq('is_banned', false)
    }
    
    // Marketplace type filter
    if (marketplaceType && marketplaceType !== 'all') {
      query = query.eq('marketplace_type', marketplaceType)
    }
    
    if (brandId) query = query.eq('brand_id', brandId)
    if (modelId) query = query.eq('model_id', modelId)
    if (variantId) query = query.eq('variant_id', variantId)
    if (transactionType) query = query.eq('transaction_type', transactionType)
    if (condition) query = query.eq('condition', condition)
    if (fuelType) query = query.eq('fuel', fuelType)
    if (transmission) query = query.eq('transmission', transmission)
    if (bodyType) query = query.eq('body_type', bodyType)
    if (cityId) query = query.eq('city_id', cityId)
    if (provinceId) query = query.eq('province_id', provinceId)
    if (yearMin) query = query.gte('year', parseInt(yearMin))
    if (yearMax) query = query.lte('year', parseInt(yearMax))
    if (priceMin) query = query.gte('price_cash', parseInt(priceMin))
    if (priceMax) query = query.lte('price_cash', parseInt(priceMax))
    if (mileageMin) query = query.gte('mileage', parseInt(mileageMin))
    if (mileageMax) query = query.lte('mileage', parseInt(mileageMax))
    if (dealerId) query = query.eq('dealer_id', dealerId)
    
    // Featured listings
    if (featured === 'true') {
      query = query.gte('featured_until', new Date().toISOString())
    }
    
    // Inspection only
    if (inspectionOnly === 'true') {
      query = query.not('inspection', 'is', null)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,city.ilike.%${search}%`)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Get featured listings for banner
    let featuredListings = null
    if (page === 1 && !isAdmin) {
      const { data: featured } = await supabase
        .from('car_listings')
        .select('*')
        .eq('status', 'active')
        .limit(5)
      
      featuredListings = featured
    }

    return NextResponse.json({
      success: true,
      listings: data,
      featured: featuredListings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Generate listing number
    const listingNumber = `CL-${Date.now().toString(36).toUpperCase()}`
    
    // Generate slug
    const slug = `${body.brand_name || 'car'}-${body.model_name || 'model'}-${body.year || '2024'}-${listingNumber}`.toLowerCase().replace(/\s+/g, '-')

    // Insert car listing
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .insert({
        listing_number: listingNumber,
        user_id: body.user_id || null,
        dealer_id: body.dealer_id || null,
        brand_id: body.brand_id,
        model_id: body.model_id,
        variant_id: body.variant_id || null,
        generation_id: body.generation_id || null,
        year: body.year,
        exterior_color_id: body.exterior_color_id || null,
        interior_color_id: body.interior_color_id || null,
        fuel: body.fuel || 'bensin',
        transmission: body.transmission || 'automatic',
        body_type: body.body_type || 'sedan',
        engine_capacity: body.engine_capacity || null,
        seat_count: body.seat_count || null,
        mileage: body.mileage || null,
        vin_number: body.vin_number || null,
        plate_number: body.plate_number || null,
        transaction_type: body.transaction_type || 'jual',
        condition: body.condition || 'bekas',
        price_cash: body.price_cash || null,
        price_credit: body.price_credit || null,
        price_negotiable: body.price_negotiable ?? true,
        city: body.city || null,
        province: body.province || null,
        city_id: body.city_id || null,
        province_id: body.province_id || null,
        title: body.title || null,
        description: body.description || null,
        slug: slug,
        status: 'draft',
        expired_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days
      })
      .select()
      .single()

    if (listingError) throw listingError

    // Insert images if provided
    if (body.images && body.images.length > 0) {
      const imagesToInsert = body.images.map((img: { url: string; caption?: string; is_primary?: boolean }, idx: number) => ({
        car_listing_id: listing.id,
        image_url: img.url,
        caption: img.caption || null,
        is_primary: img.is_primary || idx === 0,
        display_order: idx
      }))

      const { error: imagesError } = await supabase
        .from('car_images')
        .insert(imagesToInsert)

      if (imagesError) console.error('Error inserting images:', imagesError)
    }

    // Insert videos if provided
    if (body.videos && body.videos.length > 0) {
      const videosToInsert = body.videos.map((vid: { url: string; title?: string }) => ({
        car_listing_id: listing.id,
        video_url: vid.url,
        title: vid.title || null
      }))

      const { error: videosError } = await supabase
        .from('car_videos')
        .insert(videosToInsert)

      if (videosError) console.error('Error inserting videos:', videosError)
    }

    // Insert documents if provided
    if (body.documents) {
      const { error: docsError } = await supabase
        .from('car_documents')
        .insert({
          car_listing_id: listing.id,
          ...body.documents
        })

      if (docsError) console.error('Error inserting documents:', docsError)
    }

    // Insert features if provided
    if (body.features) {
      const { error: featuresError } = await supabase
        .from('car_features')
        .insert({
          car_listing_id: listing.id,
          ...body.features
        })

      if (featuresError) console.error('Error inserting features:', featuresError)
    }

    // Insert rental prices if provided
    if (body.rental_prices && body.transaction_type === 'rental') {
      const { error: rentalError } = await supabase
        .from('car_rental_prices')
        .insert({
          car_listing_id: listing.id,
          ...body.rental_prices
        })

      if (rentalError) console.error('Error inserting rental prices:', rentalError)
    }

    return NextResponse.json({ success: true, data: listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create listing' },
      { status: 500 }
    )
  }
}
