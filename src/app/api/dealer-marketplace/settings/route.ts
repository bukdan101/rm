import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Default settings for development/preview
const DEFAULT_SETTINGS = {
  token_cost_public: 1,
  token_cost_dealer_marketplace: 2,
  token_cost_both: 3,
  default_offer_duration_hours: 72,
  max_counter_offers: 5,
  auto_reject_hours: 48,
  inspection_cost: 250000,
  inspection_required_for_dealer_marketplace: false,
  platform_fee_percentage: 0,
  platform_fee_enabled: false
}

// GET - Get dealer marketplace settings
export async function GET() {
  try {
    const data = await db.dealerMarketplaceSettings.findFirst({
      where: { is_active: true }
    })

    if (!data) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        isDefault: true,
        message: 'Using default settings (no active settings found)'
      })
    }

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({
      success: true,
      settings: DEFAULT_SETTINGS,
      isDefault: true,
      error: error.message
    })
  }
}

// PUT - Update dealer marketplace settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      token_cost_public,
      token_cost_dealer_marketplace,
      token_cost_both,
      default_offer_duration_hours,
      max_counter_offers,
      auto_reject_hours,
      inspection_cost,
      inspection_required_for_dealer_marketplace,
      platform_fee_percentage,
      platform_fee_enabled
    } = body

    // Get existing settings
    const existing = await db.dealerMarketplaceSettings.findFirst({
      where: { is_active: true }
    })

    const settingsData = {
      token_cost_public: token_cost_public ?? DEFAULT_SETTINGS.token_cost_public,
      token_cost_dealer_marketplace: token_cost_dealer_marketplace ?? DEFAULT_SETTINGS.token_cost_dealer_marketplace,
      token_cost_both: token_cost_both ?? DEFAULT_SETTINGS.token_cost_both,
      default_offer_duration_hours: default_offer_duration_hours ?? DEFAULT_SETTINGS.default_offer_duration_hours,
      max_counter_offers: max_counter_offers ?? DEFAULT_SETTINGS.max_counter_offers,
      auto_reject_hours: auto_reject_hours ?? DEFAULT_SETTINGS.auto_reject_hours,
      inspection_cost: inspection_cost ?? DEFAULT_SETTINGS.inspection_cost,
      inspection_required_for_dealer_marketplace: inspection_required_for_dealer_marketplace ?? DEFAULT_SETTINGS.inspection_required_for_dealer_marketplace,
      platform_fee_percentage: platform_fee_percentage ?? DEFAULT_SETTINGS.platform_fee_percentage,
      platform_fee_enabled: platform_fee_enabled ?? DEFAULT_SETTINGS.platform_fee_enabled
    }

    let result
    if (existing) {
      // Update existing
      result = await db.dealerMarketplaceSettings.update({
        where: { id: existing.id },
        data: settingsData
      })
    } else {
      // Insert new
      result = await db.dealerMarketplaceSettings.create({
        data: settingsData
      })
    }

    return NextResponse.json({
      success: true,
      settings: result
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
