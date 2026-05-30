import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

// Default fallback values (used if database fetch fails)
const DEFAULT_MARKETPLACE_COSTS: Record<string, number> = {
  marketplace_umum: 3,
  dealer_marketplace: 5,
  chat_platform: 4,
  public: 3,
  dealer: 5,
  both: 7,
}

const DEFAULT_TOKEN_VALUE = 10000

// Fetch token settings from database (single-row wide table)
async function getTokenSettings(): Promise<{
  marketplaceCosts: Record<string, number>
  tokenValue: number
}> {
  try {
    const settings = await db.tokenSetting.findFirst({
      where: { is_active: true },
    })

    if (!settings) {
      console.log('Using default token settings (DB fetch failed)')
      return {
        marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
        tokenValue: DEFAULT_TOKEN_VALUE,
      }
    }

    const marketplaceCosts: Record<string, number> = { ...DEFAULT_MARKETPLACE_COSTS }

    // Map TokenSetting columns to costs
    marketplaceCosts['marketplace_umum'] = settings.listing_normal_tokens
    marketplaceCosts['public'] = settings.listing_normal_tokens
    marketplaceCosts['dealer_marketplace'] = settings.listing_dealer_tokens
    marketplaceCosts['dealer'] = settings.listing_dealer_tokens
    marketplaceCosts['both'] = settings.listing_normal_tokens + settings.listing_dealer_tokens

    const tokenValue = settings.token_price_base

    return { marketplaceCosts, tokenValue }
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return {
      marketplaceCosts: DEFAULT_MARKETPLACE_COSTS,
      tokenValue: DEFAULT_TOKEN_VALUE,
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
      marketplace_type = 'marketplace_umum',
    } = body

    if (!user_id || !brand_id || !model_id || !year || !title || !condition || !price_cash || !province_id || !city_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate images
    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one image is required' },
        { status: 400 }
      )
    }

    // Fetch token settings from database
    const { marketplaceCosts, tokenValue } = await getTokenSettings()

    // Get visibility from body
    const visibility = body.visibility || marketplace_type

    // Calculate token cost based on visibility
    let tokenCost: number
    if (visibility === 'both') {
      tokenCost = (marketplaceCosts['marketplace_umum'] || 3) + (marketplaceCosts['dealer_marketplace'] || 5)
    } else if (visibility === 'public') {
      tokenCost = marketplaceCosts['marketplace_umum'] || marketplaceCosts['public'] || 3
    } else if (visibility === 'dealer_marketplace') {
      tokenCost = marketplaceCosts['dealer_marketplace'] || marketplaceCosts['dealer'] || 5
    } else {
      tokenCost = marketplaceCosts[marketplace_type] || marketplaceCosts['marketplace_umum'] || 3
    }

    // Check user's credit balance
    const userCredits = await db.userCredit.findFirst({
      where: { user_id },
    })

    const currentBalance = userCredits?.balance || 0

    if (currentBalance < tokenCost) {
      return NextResponse.json(
        {
          success: false,
          error: 'Insufficient token balance',
          required: tokenCost,
          required_rupiah: tokenCost * tokenValue,
          available: currentBalance,
          available_rupiah: currentBalance * tokenValue,
        },
        { status: 400 }
      )
    }

    // Check KYC status
    const kycData = await db.kycVerification.findUnique({
      where: { user_id },
      select: { status: true },
    })

    // KYC required for dealer marketplace (including 'both' visibility)
    const requiresKyc = visibility === 'dealer_marketplace' || visibility === 'both' || marketplace_type === 'dealer_marketplace'
    if (requiresKyc && (!kycData || kycData.status !== 'approved')) {
      return NextResponse.json(
        {
          success: false,
          error: 'KYC verification required for Dealer Marketplace',
          kyc_required: true,
        },
        { status: 400 }
      )
    }

    // Generate listing number and slug
    const listingNumber = `CL-${Date.now().toString(36).toUpperCase()}`
    const slug = `${title.toLowerCase().replace(/\s+/g, '-')}-${listingNumber}`.toLowerCase()

    // Determine duration
    const isDealerOnly = visibility === 'dealer_marketplace'
    const durationDays = isDealerOnly ? 7 : 30

    // Create listing
    const listingResult = await db.carListing.create({
      data: {
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
        expired_at: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      },
    })

    // Insert images
    if (images && images.length > 0) {
      const imagesToInsert = images.map((img: { url: string; caption?: string; is_primary?: boolean }, idx: number) => ({
        id: uuidv4(),
        car_listing_id: listingResult.id,
        image_url: img.url,
        caption: img.caption || null,
        is_primary: img.is_primary || idx === 0,
        display_order: idx,
      }))

      await db.carImage.createMany({
        data: imagesToInsert,
      })
    }

    // Deduct tokens
    let newBalance = currentBalance

    if (userCredits) {
      await db.userCredit.update({
        where: { id: userCredits.id },
        data: {
          balance: currentBalance - tokenCost,
          total_spent: (userCredits.total_spent || 0) + tokenCost,
          last_usage_at: new Date(),
        },
      })
      newBalance = currentBalance - tokenCost
    } else {
      throw new Error('No credit record found')
    }

    // Record transaction
    await db.creditTransaction.create({
      data: {
        id: uuidv4(),
        user_id,
        type: 'spend',
        amount: -tokenCost,
        balance_after: newBalance,
        description: `Created listing (${visibility}) - ${title}`,
        reference_type: 'listing',
        reference_id: listingResult.id,
      },
    })

    // Log usage
    try {
      await db.creditUsageLog.create({
        data: {
          id: uuidv4(),
          user_id,
          listing_id: listingResult.id,
          marketplace_type,
          tokens_used: tokenCost,
          duration_days: durationDays,
        },
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
      marketplace_type,
    })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create listing',
      },
      { status: 500 }
    )
  }
}
