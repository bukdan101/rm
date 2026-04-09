import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabase = getSupabaseAdmin()

// GET - Fetch all listings for admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build base query
    let query = supabase
      .from('car_listings')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: listings, count, error } = await query

    if (error) {
      console.error('Error fetching listings:', error)
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 })
    }

    // Get unique seller IDs
    const sellerIds = [...new Set(listings?.map((l: Record<string, unknown>) => l.seller_id).filter(Boolean))]
    
    // Get sellers
    const { data: sellers } = sellerIds.length > 0 
      ? await supabase.from('profiles').select('id, full_name, email, phone, avatar_url').in('id', sellerIds)
      : { data: [] }

    // Get variant IDs
    const variantIds = [...new Set(listings?.map((l: Record<string, unknown>) => l.variant_id).filter(Boolean))]
    
    // Get variants with models and brands
    const { data: variants } = variantIds.length > 0
      ? await supabase.from('car_variants').select('id, name, year_start, model_id').in('id', variantIds)
      : { data: [] }

    // Get models
    const modelIds = [...new Set(variants?.map((v: Record<string, unknown>) => v.model_id).filter(Boolean))]
    const { data: models } = modelIds.length > 0
      ? await supabase.from('car_models').select('id, name, brand_id').in('id', modelIds)
      : { data: [] }

    // Get brands
    const brandIds = [...new Set(models?.map((m: Record<string, unknown>) => m.brand_id).filter(Boolean))]
    const { data: brands } = brandIds.length > 0
      ? await supabase.from('brands').select('id, name').in('id', brandIds)
      : { data: [] }

    // Get images for listings
    const listingIds = listings?.map((l: Record<string, unknown>) => l.id) || []
    const { data: allImages } = listingIds.length > 0
      ? await supabase.from('car_images').select('listing_id, image_url, is_primary').in('listing_id', listingIds)
      : { data: [] }

    // Create lookup maps
    const sellerMap = Object.fromEntries((sellers || []).map((s: Record<string, unknown>) => [s.id, s]))
    const variantMap = Object.fromEntries((variants || []).map((v: Record<string, unknown>) => [v.id, v]))
    const modelMap = Object.fromEntries((models || []).map((m: Record<string, unknown>) => [m.id, m]))
    const brandMap = Object.fromEntries((brands || []).map((b: Record<string, unknown>) => [b.id, b]))

    // Group images by listing
    const imagesByListing: Record<string, Array<{ image_url: string; is_primary: boolean }>> = {}
    allImages?.forEach((img: Record<string, unknown>) => {
      if (!imagesByListing[img.listing_id as string]) {
        imagesByListing[img.listing_id as string] = []
      }
      imagesByListing[img.listing_id as string].push({
        image_url: img.image_url as string,
        is_primary: img.is_primary as boolean
      })
    })

    // Transform data
    const transformedListings = listings?.map((listing: Record<string, unknown>) => {
      const variant = variantMap[listing.variant_id as string] as Record<string, unknown> | undefined
      const model = variant ? modelMap[variant.model_id as string] as Record<string, unknown> | undefined : undefined
      const brand = model ? brandMap[model.brand_id as string] as Record<string, unknown> | undefined : undefined
      const images = imagesByListing[listing.id as string]
      const primaryImage = images?.find(img => img.is_primary)?.image_url || images?.[0]?.image_url || null

      // Generate placeholder image based on title if no image exists
      const placeholderImage = `https://picsum.photos/seed/${encodeURIComponent(listing.title as string)}/400/300`

      return {
        id: listing.id,
        title: listing.title,
        price: listing.price,
        year: listing.year,
        mileage: listing.mileage,
        status: listing.status,
        vehicle_condition: listing.vehicle_condition,
        transaction_type: listing.transaction_type,
        location_city: listing.location_city,
        location_province: listing.location_province,
        view_count: listing.view_count,
        is_featured: listing.is_featured,
        created_at: listing.created_at,
        published_at: listing.published_at,
        sold_at: listing.sold_at,
        deleted_at: listing.deleted_at,
        brand_name: brand?.name || 'Unknown',
        model_name: model?.name || 'Unknown',
        variant_name: variant?.name || 'Unknown',
        primary_image: primaryImage || placeholderImage,
        seller: sellerMap[listing.seller_id as string] || null,
      }
    }) || []

    // Get stats - use unique variable names to avoid any conflicts
    const [
      statsTotal, 
      statsActive, 
      statsBanned, 
      statsSold
    ] = await Promise.all([
      supabase.from('car_listings').select('id', { count: 'exact', head: true }),
      supabase.from('car_listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('car_listings').select('id', { count: 'exact', head: true }).eq('status', 'banned'),
      supabase.from('car_listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    ])

    return NextResponse.json({
      success: true,
      listings: transformedListings,
      total: count || 0,
      limit,
      offset,
      stats: {
        total: statsTotal.count || 0,
        active: statsActive.count || 0,
        banned: statsBanned.count || 0,
        sold: statsSold.count || 0,
      }
    })
  } catch (error) {
    console.error('Error in admin listings API:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// PUT - Update listing status (ban/unban)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, status, reason } = body

    if (!listing_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'banned') {
      updateData.banned_at = new Date().toISOString()
      updateData.ban_reason = reason
    } else if (status === 'active') {
      updateData.banned_at = null
      updateData.ban_reason = null
    }

    const { data, error } = await supabase
      .from('car_listings')
      .update(updateData)
      .eq('id', listing_id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `Listing ${status} successfully`,
      listing: data,
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update listing status',
    }, { status: 500 })
  }
}

// DELETE - Delete listing permanently
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listing_id = searchParams.get('id')

    if (!listing_id) {
      return NextResponse.json({
        success: false,
        error: 'Listing ID required',
      }, { status: 400 })
    }

    // Soft delete
    const { error } = await supabase
      .from('car_listings')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted'
      })
      .eq('id', listing_id)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete listing',
    }, { status: 500 })
  }
}
