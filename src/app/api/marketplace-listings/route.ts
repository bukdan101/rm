import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  calculateTokenCost, 
  getTokenBalance, 
  deductTokens 
} from '@/lib/token-service'

// Marketplace type definition
type MarketplaceType = 'dealer_only' | 'public_only' | 'both'

interface ActivateListingRequest {
  listing_id: string
  user_id?: string
  dealer_id?: string
  marketplace_type: MarketplaceType
  prediction_id?: string
}

interface ReactivateListingRequest {
  listing_id: string
  user_id?: string
  dealer_id?: string
  marketplace_type: MarketplaceType
}

/**
 * GET /api/marketplace-listings
 * Get listings based on marketplace type
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const marketplace = searchParams.get('marketplace') || 'public' // 'dealer' or 'public'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Additional filters
    const brandId = searchParams.get('brand_id')
    const modelId = searchParams.get('model_id')
    const yearMin = searchParams.get('year_min')
    const yearMax = searchParams.get('year_max')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const provinceId = searchParams.get('province_id')
    const cityId = searchParams.get('city_id')
    const search = searchParams.get('search')

    if (marketplace === 'dealer') {
      // Dealer marketplace - only for dealers
      let query = supabase
        .from('dealer_marketplace_listings')
        .select('*', { count: 'exact' })

      // Apply filters
      if (brandId) query = query.eq('brand_id', brandId)
      if (modelId) query = query.eq('model_id', modelId)
      if (yearMin) query = query.gte('year', parseInt(yearMin))
      if (yearMax) query = query.lte('year', parseInt(yearMax))
      if (priceMin) query = query.gte('price_cash', parseInt(priceMin))
      if (priceMax) query = query.lte('price_cash', parseInt(priceMax))
      if (provinceId) query = query.eq('province_id', provinceId)
      if (cityId) query = query.eq('city_id', cityId)
      if (search) {
        query = query.or(`title.ilike.%${search}%,brand_name.ilike.%${search}%,model_name.ilike.%${search}%`)
      }

      query = query
        .order('dealer_marketplace_expires_at', { ascending: true })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        marketplace: 'dealer',
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    } else {
      // Public marketplace - for all users
      let query = supabase
        .from('public_marketplace_listings')
        .select('*', { count: 'exact' })

      // Apply filters
      if (brandId) query = query.eq('brand_id', brandId)
      if (modelId) query = query.eq('model_id', modelId)
      if (yearMin) query = query.gte('year', parseInt(yearMin))
      if (yearMax) query = query.lte('year', parseInt(yearMax))
      if (priceMin) query = query.gte('price_cash', parseInt(priceMin))
      if (priceMax) query = query.lte('price_cash', parseInt(priceMax))
      if (provinceId) query = query.eq('province_id', provinceId)
      if (cityId) query = query.eq('city_id', cityId)
      if (search) {
        query = query.or(`title.ilike.%${search}%,brand_name.ilike.%${search}%,model_name.ilike.%${search}%`)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return NextResponse.json({
        success: true,
        data,
        marketplace: 'public',
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      })
    }
  } catch (error) {
    console.error('Error fetching marketplace listings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch listings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/marketplace-listings
 * Activate a listing in marketplace(s)
 */
export async function POST(request: NextRequest) {
  try {
    const body: ActivateListingRequest = await request.json()
    const { listing_id, user_id, dealer_id, marketplace_type, prediction_id } = body

    if (!listing_id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    if (!user_id && !dealer_id) {
      return NextResponse.json(
        { success: false, error: 'User ID or Dealer ID is required' },
        { status: 400 }
      )
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check ownership
    const isOwner = (user_id && listing.user_id === user_id) || 
                    (dealer_id && listing.dealer_id === dealer_id)
    
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: 'You do not have permission to activate this listing' },
        { status: 403 }
      )
    }

    // Calculate token costs
    const dealerTokens = await calculateTokenCost('listing_dealer')
    const publicTokens = await calculateTokenCost('listing_normal')
    
    let totalTokens = 0
    switch (marketplace_type) {
      case 'dealer_only':
        totalTokens = dealerTokens
        break
      case 'public_only':
        totalTokens = publicTokens
        break
      case 'both':
        totalTokens = dealerTokens + publicTokens
        break
    }

    // Check balance
    const balance = await getTokenBalance(user_id, dealer_id)
    
    if (balance < totalTokens) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient token balance',
        required: totalTokens,
        balance,
        shortfall: totalTokens - balance
      }, { status: 400 })
    }

    // Calculate expiration dates
    const now = new Date()
    const dealerExpiresAt = marketplace_type === 'dealer_only' || marketplace_type === 'both'
      ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null
    const publicExpiresAt = marketplace_type === 'public_only' || marketplace_type === 'both'
      ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days
      : null

    // Deduct tokens for dealer marketplace
    if (marketplace_type === 'dealer_only' || marketplace_type === 'both') {
      const deductResult = await deductTokens(
        'listing_dealer',
        user_id,
        dealer_id,
        'listing',
        listing_id,
        `Activate listing in Dealer Marketplace: ${listing.title || listing_id}`
      )

      if (!deductResult.success) {
        return NextResponse.json({
          success: false,
          error: deductResult.error || 'Failed to deduct tokens for dealer marketplace'
        }, { status: 400 })
      }
    }

    // Deduct tokens for public marketplace
    if (marketplace_type === 'public_only' || marketplace_type === 'both') {
      const deductResult = await deductTokens(
        'listing_normal',
        user_id,
        dealer_id,
        'listing',
        listing_id,
        `Activate listing in Public Marketplace: ${listing.title || listing_id}`
      )

      if (!deductResult.success) {
        return NextResponse.json({
          success: false,
          error: deductResult.error || 'Failed to deduct tokens for public marketplace'
        }, { status: 400 })
      }
    }

    // Update listing
    const updateData: Record<string, unknown> = {
      listing_marketplace_type: marketplace_type,
      status: 'active',
      updated_at: now.toISOString()
    }

    if (marketplace_type === 'dealer_only' || marketplace_type === 'both') {
      updateData.dealer_marketplace_active = true
      updateData.dealer_marketplace_expires_at = dealerExpiresAt?.toISOString()
      updateData.dealer_marketplace_tokens_used = dealerTokens
    }

    if (marketplace_type === 'public_only' || marketplace_type === 'both') {
      updateData.public_marketplace_active = true
      updateData.public_marketplace_expires_at = publicExpiresAt?.toISOString()
      updateData.public_marketplace_tokens_used = marketplace_type === 'both' ? publicTokens : totalTokens
    }

    // If reactivating, increment counter
    if (listing.status === 'suspended' || listing.status === 'expired') {
      updateData.reactivate_count = (listing.reactivate_count || 0) + 1
      updateData.last_reactivated_at = now.toISOString()
    }

    const { error: updateError } = await supabase
      .from('car_listings')
      .update(updateData)
      .eq('id', listing_id)

    if (updateError) {
      console.error('Error updating listing:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to activate listing' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Listing activated successfully',
      data: {
        listing_id,
        marketplace_type,
        dealer_expires_at: dealerExpiresAt,
        public_expires_at: publicExpiresAt,
        tokens_used: totalTokens
      }
    })
  } catch (error) {
    console.error('Error activating listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to activate listing' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/marketplace-listings
 * Reactivate a suspended listing
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: ReactivateListingRequest = await request.json()
    const { listing_id, user_id, dealer_id, marketplace_type } = body

    if (!listing_id) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    // Check if listing is suspended
    if (listing.status !== 'suspended' && listing.status !== 'expired') {
      return NextResponse.json(
        { success: false, error: 'Only suspended listings can be reactivated' },
        { status: 400 }
      )
    }

    // Forward to POST handler for activation
    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({
        listing_id,
        user_id,
        dealer_id,
        marketplace_type
      }),
      headers: request.headers
    }))
  } catch (error) {
    console.error('Error reactivating listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to reactivate listing' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/marketplace-listings/my
 * Get user's own listings with marketplace status
 */
export async function getMyListings(userId?: string, dealerId?: string) {
  if (!userId && !dealerId) {
    return { success: false, error: 'User ID or Dealer ID is required' }
  }

  let query = supabase
    .from('my_listings')
    .select('*')

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (dealerId) {
    query = query.eq('dealer_id', dealerId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
