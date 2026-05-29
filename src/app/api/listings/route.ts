import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
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
    const yearMin = searchParams.get('year_min')
    const yearMax = searchParams.get('year_max')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const mileageMin = searchParams.get('mileage_min')
    const mileageMax = searchParams.get('mileage_max')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const dealerId = searchParams.get('dealer_id')
    const featured = searchParams.get('featured')

    // Build query - using actual schema columns
    let query = supabase
      .from('car_listings')
      .select(`*, brands(name), car_models(name), profiles(id, full_name, email), car_images(image_url, is_primary)`, { count: 'exact' })

    // Apply status filter
    // Admin mode: show all statuses unless specific status is requested
    // Non-admin mode: only show active listings
    // Note: is_banned column doesn't exist - use status field instead
    if (isAdmin) {
      // If admin and specific status requested, filter by that status
      if (status && status !== 'all') {
        if (status === 'banned') {
          query = query.eq('status', 'banned')
        } else {
          query = query.eq('status', status)
        }
      }
      // Otherwise show all listings (no status filter)
    } else {
      // Non-admin: only show active listings
      query = query.eq('status', status || 'active')
    }
    
    if (brandId) query = query.eq('variant_id', brandId) // filtered by variant which links to brand/model
    if (modelId) query = query.eq('variant_id', modelId)
    if (variantId) query = query.eq('variant_id', variantId)
    if (transactionType) query = query.eq('transaction_type', transactionType)
    if (condition) query = query.eq('vehicle_condition', condition)
    if (fuelType) query = query.eq('transmission', fuelType) // Note: fuel not directly on car_listings per schema
    if (transmission) query = query.eq('transmission', transmission)
    if (yearMin) query = query.gte('year', parseInt(yearMin))
    if (yearMax) query = query.lte('year', parseInt(yearMax))
    if (priceMin) query = query.gte('price', parseInt(priceMin))
    if (priceMax) query = query.lte('price', parseInt(priceMax))
    if (mileageMin) query = query.gte('mileage', parseInt(mileageMin))
    if (mileageMax) query = query.lte('mileage', parseInt(mileageMax))
    if (dealerId) query = query.eq('dealer_id', dealerId)
    
    // Featured listings
    if (featured === 'true') {
      query = query.eq('is_featured', true)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location_city.ilike.%${search}%`)
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
        .eq('is_featured', true)
        .limit(5)
      
      featuredListings = featured
    }

    return successResponse({
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
    return errorResponse('Failed to fetch listings', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = getSupabaseAdmin()
    const body = await request.json()
    
    // Insert car listing
    const { data: listing, error: listingError } = await adminClient
      .from('car_listings')
      .insert({
        seller_id: body.user_id || body.seller_id || null,
        variant_id: body.variant_id || null,
        color_id: body.color_id || body.exterior_color_id || null,
        title: body.title || null,
        description: body.description || null,
        price: body.price || body.price_cash || 0,
        year: body.year,
        mileage: body.mileage || null,
        vehicle_condition: body.condition || body.vehicle_condition || 'bekas',
        transaction_type: body.transaction_type || 'jual',
        status: body.status || 'draft',
        location_city: body.city || body.location_city || null,
        location_province: body.province || body.location_province || null,
        is_featured: body.is_featured || false,
        published_at: body.status === 'active' ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (listingError) throw listingError

    // Insert images if provided - using correct column name (listing_id, not car_listing_id)
    if (body.images && body.images.length > 0) {
      const imagesToInsert = body.images.map((img: { url: string; caption?: string; is_primary?: boolean }, idx: number) => ({
        listing_id: listing.id,
        image_url: img.url,
        is_primary: img.is_primary || idx === 0,
        order_index: idx
      }))

      const { error: imagesError } = await adminClient
        .from('car_images')
        .insert(imagesToInsert)

      if (imagesError) console.error('Error inserting images:', imagesError)
    }

    // Insert documents if provided - using correct column name (listing_id)
    if (body.documents) {
      const { error: docsError } = await adminClient
        .from('car_documents')
        .insert({
          listing_id: listing.id,
          ...body.documents
        })

      if (docsError) console.error('Error inserting documents:', docsError)
    }

    // Insert features if provided - using correct column name (listing_id)
    if (body.features) {
      const { error: featuresError } = await adminClient
        .from('car_features')
        .insert({
          listing_id: listing.id,
          ...body.features
        })

      if (featuresError) console.error('Error inserting features:', featuresError)
    }

    // Insert rental prices if provided - using correct column name (listing_id)
    if (body.rental_prices && body.transaction_type === 'rental') {
      const { error: rentalError } = await adminClient
        .from('car_rental_prices')
        .insert({
          listing_id: listing.id,
          ...body.rental_prices
        })

      if (rentalError) console.error('Error inserting rental prices:', rentalError)
    }

    return successResponse({ data: listing }, 201)
  } catch (error) {
    console.error('Error creating listing:', error)
    return errorResponse('Failed to create listing', 500)
  }
}
