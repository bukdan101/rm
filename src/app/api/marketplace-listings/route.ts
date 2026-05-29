import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { 
  calculateTokenCost, 
  getTokenBalance, 
  deductTokens 
} from '@/lib/token-service'
import { errorResponse, successResponse } from '@/lib/api-utils'

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
    const supabase = await createClient()
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
        .from('car_listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active')

      // Apply filters
      if (brandId) query = query.eq('variant_id', brandId) // use appropriate column
      if (modelId) query = query.eq('variant_id', modelId) // use appropriate column
      if (yearMin) query = query.gte('year', parseInt(yearMin))
      if (yearMax) query = query.lte('year', parseInt(yearMax))
      if (priceMin) query = query.gte('price', parseInt(priceMin))
      if (priceMax) query = query.lte('price', parseInt(priceMax))
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return successResponse({
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
        .from('car_listings')
        .select('*', { count: 'exact' })
        .eq('status', 'active')

      // Apply filters
      if (brandId) query = query.eq('variant_id', brandId) // use appropriate column
      if (modelId) query = query.eq('variant_id', modelId) // use appropriate column
      if (yearMin) query = query.gte('year', parseInt(yearMin))
      if (yearMax) query = query.lte('year', parseInt(yearMax))
      if (priceMin) query = query.gte('price', parseInt(priceMin))
      if (priceMax) query = query.lte('price', parseInt(priceMax))
      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      return successResponse({
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
    return errorResponse('Failed to fetch listings', 500)
  }
}

/**
 * POST /api/marketplace-listings
 * Activate a listing in marketplace(s)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = getSupabaseAdmin()
    const body: ActivateListingRequest = await request.json()
    const { listing_id, user_id, dealer_id, marketplace_type, prediction_id } = body

    if (!listing_id) {
      return errorResponse('Listing ID is required', 400)
    }

    if (!user_id && !dealer_id) {
      return errorResponse('User ID or Dealer ID is required', 400)
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return errorResponse('Listing not found', 404)
    }

    // Check ownership
    const isOwner = (user_id && listing.seller_id === user_id) || 
                    (dealer_id && listing.dealer_id === dealer_id)
    
    if (!isOwner) {
      return errorResponse('You do not have permission to activate this listing', 403)
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

    // Update listing using admin client for elevated access
    const updateData: Record<string, unknown> = {
      status: 'active',
      updated_at: now.toISOString()
    }

    if (listing.status === 'suspended' || listing.status === 'expired') {
      updateData.updated_at = now.toISOString()
    }

    const { error: updateError } = await adminClient
      .from('car_listings')
      .update(updateData)
      .eq('id', listing_id)

    if (updateError) {
      console.error('Error updating listing:', updateError)
      return errorResponse('Failed to activate listing', 500)
    }

    return successResponse({
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
    return errorResponse('Failed to activate listing', 500)
  }
}

/**
 * PATCH /api/marketplace-listings
 * Reactivate a suspended listing
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body: ReactivateListingRequest = await request.json()
    const { listing_id, user_id, dealer_id, marketplace_type } = body

    if (!listing_id) {
      return errorResponse('Listing ID is required', 400)
    }

    // Get listing
    const { data: listing, error: listingError } = await supabase
      .from('car_listings')
      .select('*')
      .eq('id', listing_id)
      .single()

    if (listingError || !listing) {
      return errorResponse('Listing not found', 404)
    }

    // Check if listing is suspended
    if (listing.status !== 'suspended' && listing.status !== 'expired') {
      return errorResponse('Only suspended listings can be reactivated', 400)
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
    return errorResponse('Failed to reactivate listing', 500)
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

  const supabase = await createClient()
  let query = supabase
    .from('car_listings')
    .select('*')

  if (userId) {
    query = query.eq('seller_id', userId)
  } else if (dealerId) {
    query = query.eq('dealer_id', dealerId)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, data }
}
