import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

const supabase = getSupabaseAdmin()

// Default fallback values (used if database fetch fails)
const DEFAULT_MARKETPLACE_COSTS: Record<string, number> = {
  marketplace_umum: 3,
  dealer_marketplace: 5,
  chat_platform: 4,
  public: 3,           // Alias for marketplace_umum (backward compatibility)
  dealer: 5,           // Alias for dealer_marketplace (backward compatibility)
  both: 7              // Combo
}

const DEFAULT_SERVICE_COSTS: Record<string, number> = {
  inspection_160: 10,
  featured: 5,
  extend_listing: 2,
  extend_dealer: 2
}

const DEFAULT_TOKEN_VALUE = 10000

// Types for Supabase results
interface UserCreditRow {
  balance: number
  total_spent: number
}

interface KycRow {
  status: string
}

interface ListingRow {
  id: string
  listing_number: string
  slug: string
  status: string
}

interface TokenSettingRow {
  key: string
  tokens: number
  is_active: boolean
}

// Fetch token settings from database
async function getTokenSettings(): Promise<{
  marketplaceCosts: Record<string, number>
  serviceCosts: Record<string, number>
  tokenValue: number
}> {
  try {
    const { data: settings, error } = await supabase
      .from('token_settings')
      .select('key, tokens, is_active, category')
      .eq('is_active', true)
    
    if (error || !settings) {
      console.log('Using default token settings (DB fetch failed)')
      return {
        marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
        serviceCosts: DEFAULT_SERVICE_COSTS,
        tokenValue: DEFAULT_TOKEN_VALUE
      }
    }

    const rows = settings as TokenSettingRow[]
    const marketplaceCosts: Record<string, number> = { ...DEFAULT_MARKETPLACE_COSTS }
    const serviceCosts: Record<string, number> = { ...DEFAULT_SERVICE_COSTS }
    let tokenValue = DEFAULT_TOKEN_VALUE

    rows.forEach(row => {
      if (row.category === 'listing') {
        marketplaceCosts[row.key] = row.tokens
      } else if (row.category === 'service' || row.category === 'boost' || row.category === 'extension') {
        serviceCosts[row.key] = row.tokens
      } else if (row.key === 'token_value_rupiah') {
        tokenValue = row.tokens
      }
    })

    return { marketplaceCosts, serviceCosts, tokenValue }
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return {
      marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
      serviceCosts: DEFAULT_SERVICE_COSTS,
      tokenValue: DEFAULT_TOKEN_VALUE
    }
  }
}

// POST - Create listing with token deduction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const {
      user_id,
      dealer_id,
      brand_id,
      model_id,
      year,
      title,
      condition,
      price_cash,
      province_id,
      city_id,
      images,
      marketplace_type = 'marketplace_umum'
    } = body

    if (!user_id || !brand_id || !model_id || !year || !title || !condition || !price_cash || !province_id || !city_id) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Validate images
    if (!images || images.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one image is required'
      }, { status: 400 })
    }

    // Fetch token settings from database
    const { marketplaceCosts, tokenValue } = await getTokenSettings()
    
    // Get visibility from body
    const visibility = body.visibility || marketplace_type
    
    // Calculate token cost based on visibility
    // For 'both', sum the costs of marketplace_umum and dealer_marketplace
    let tokenCost: number
    if (visibility === 'both') {
      tokenCost = (marketplaceCosts['marketplace_umum'] || 3) + (marketplaceCosts['dealer_marketplace'] || 5)
    } else if (visibility === 'public') {
      tokenCost = marketplaceCosts['marketplace_umum'] || marketplaceCosts['public'] || 3
    } else if (visibility === 'dealer_marketplace') {
      tokenCost = marketplaceCosts['dealer_marketplace'] || marketplaceCosts['dealer'] || 5
    } else {
      // Fallback to marketplace_type
      tokenCost = marketplaceCosts[marketplace_type] || marketplaceCosts['marketplace_umum'] || 3
    }

    // Check user's credit balance
    const { data: userCreditsData, error: creditsError } = await supabase
      .from('user_credits')
      .select('balance, total_spent')
      .eq('user_id', user_id)
      .single()

    if (creditsError && creditsError.code !== 'PGRST116') {
      throw creditsError
    }

    const userCredits = userCreditsData as UserCreditRow | null
    const currentBalance = userCredits?.balance || 0

    if (currentBalance < tokenCost) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient token balance',
        required: tokenCost,
        required_rupiah: tokenCost * tokenValue,
        available: currentBalance,
        available_rupiah: currentBalance * tokenValue
      }, { status: 400 })
    }

    // Check KYC status
    const { data: kycDataResult, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', user_id)
      .single()

    if (kycError && kycError.code !== 'PGRST116') {
      throw kycError
    }

    const kycData = kycDataResult as KycRow | null

    // KYC required for dealer marketplace (including 'both' visibility)
    const requiresKyc = visibility === 'dealer_marketplace' || visibility === 'both' || marketplace_type === 'dealer_marketplace'
    if (requiresKyc && (!kycData || kycData.status !== 'approved')) {
      return NextResponse.json({
        success: false,
        error: 'KYC verification required for Dealer Marketplace',
        kyc_required: true
      }, { status: 400 })
    }

    // Generate listing number and slug
    const listingNumber = `CL-${Date.now().toString(36).toUpperCase()}`
    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${listingNumber}`.toLowerCase()

    // Determine duration based on marketplace type / visibility
    const isDealerOnly = visibility === 'dealer_marketplace'
    const isPublicOnly = visibility === 'public'
    const isBoth = visibility === 'both'
    
    // Calculate duration: dealer marketplace = 7 days, public = 30 days
    // If both, use the longer duration (30 days)
    const durationDays = isDealerOnly ? 7 : 30

    // Start transaction by creating the listing
    const listingData = {
      id: uuidv4(),
      listing_number: listingNumber,
      user_id,
      dealer_id: dealer_id || null,
      brand_id,
      model_id,
      variant_id: body.variant_id || null,
      generation_id: body.generation_id || null,
      year,
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
      condition,
      price_cash,
      price_credit: body.price_credit || null,
      price_negotiable: body.price_negotiable ?? true,
      city: body.city || null,
      province: body.province || null,
      city_id,
      province_id,
      title,
      description: body.description || null,
      slug,
      status: isDealerOnly ? 'pending_inspection' : 'pending',
      marketplace_type,
      visibility,
      expired_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
    }

    const { data: listingResult, error: listingError } = await supabase
      .from('car_listings')
      .insert(listingData)
      .select()
      .single()

    if (listingError) {
      throw listingError
    }

    const listing = listingResult as ListingRow

    // Insert images
    if (images && images.length > 0) {
      const imagesToInsert = images.map((img: { url: string; caption?: string; is_primary?: boolean }, idx: number) => ({
        id: uuidv4(),
        car_listing_id: listing.id,
        image_url: img.url,
        caption: img.caption || null,
        is_primary: img.is_primary || idx === 0,
        display_order: idx
      }))

      const { error: imagesError } = await supabase
        .from('car_images')
        .insert(imagesToInsert)

      if (imagesError) {
        console.error('Error inserting images:', imagesError)
      }
    }

    // Deduct tokens
    let newBalance = currentBalance
    
    if (userCredits) {
      const { error: updateError } = await supabase
        .from('user_credits')
        .update({
          balance: currentBalance - tokenCost,
          total_spent: (userCredits.total_spent || 0) + tokenCost,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)

      if (updateError) {
        console.error('Error updating credits:', updateError)
        await supabase.from('car_listings').delete().eq('id', listing.id)
        throw new Error('Failed to deduct tokens')
      }
      newBalance = currentBalance - tokenCost
    } else {
      throw new Error('No credit record found')
    }

    // Record transaction
    await supabase
      .from('credit_transactions')
      .insert({
        id: uuidv4(),
        user_id,
        type: 'spend',
        amount: -tokenCost,
        balance_after: newBalance,
        description: `Created listing (${visibility}) - ${title}`,
        reference_type: 'listing',
        reference_id: listing.id
      })

    // Log usage
    try {
      await supabase
        .from('credit_usage_log')
        .insert({
          id: uuidv4(),
          user_id,
          listing_id: listing.id,
          marketplace_type,
          tokens_used: tokenCost,
          duration_days: durationDays
        })
    } catch (logError) {
      console.error('Error logging usage:', logError)
    }

    return NextResponse.json({
      success: true,
      message: 'Listing created successfully',
      data: listingResult,
      tokens_spent: tokenCost,
      tokens_spent_rupiah: tokenCost * tokenValue,
      new_balance: newBalance,
      new_balance_rupiah: newBalance * tokenValue,
      duration_days: durationDays,
      marketplace_type
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create listing'
    }, { status: 500 })
  }
}
