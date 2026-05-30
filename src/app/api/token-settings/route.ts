import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse, successResponse } from '@/lib/api-utils'

// Default token settings values (for single-row wide table)
const DEFAULT_TOKEN_SETTINGS = {
  token_price_base: 10000,
  token_price_currency: 'IDR',
  ai_prediction_tokens: 5,
  ai_prediction_duration_hours: 24,
  listing_normal_tokens: 3,
  listing_normal_duration_days: 30,
  listing_normal_chat_free: true,
  listing_dealer_tokens: 5,
  listing_dealer_duration_days: 30,
  listing_dealer_multiplier: 1.0,
  dealer_contact_tokens: 2,
  dealer_contact_multiplier: 1.0,
  boost_tokens: 5,
  boost_duration_days: 7,
  highlight_tokens: 3,
  highlight_duration_days: 7,
  featured_tokens: 10,
  featured_duration_days: 7,
  premium_badge_tokens: 8,
  premium_badge_duration_days: 30,
  top_search_tokens: 6,
  top_search_duration_days: 7,
  inspection_tokens: 5,
  inspection_mandatory: false,
  auto_move_to_public: false,
  auto_move_gratis: false,
  remind_before_expire_days: 3,
  is_active: true,
}

// GET: Fetch token settings (public) - reads single-row wide table
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('active_only') === 'true'
    
    const where: any = activeOnly ? { is_active: true } : {}
    
    const settings = await db.tokenSetting.findFirst({
      where,
      orderBy: { created_at: 'desc' }
    })
    
    // If no data, return defaults
    if (!settings) {
      return successResponse({ 
        settings: { ...DEFAULT_TOKEN_SETTINGS, id: 'default' },
        seeded: false 
      })
    }
    
    return successResponse({ settings, seeded: false })
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return successResponse({ 
      settings: { ...DEFAULT_TOKEN_SETTINGS, id: 'default' },
      seeded: false 
    })
  }
}

// POST: Create or update token settings (admin only) - upsert single-row wide table
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get existing settings
    const existing = await db.tokenSetting.findFirst()
    
    const settingsData = {
      token_price_base: body.token_price_base ?? DEFAULT_TOKEN_SETTINGS.token_price_base,
      token_price_currency: body.token_price_currency ?? DEFAULT_TOKEN_SETTINGS.token_price_currency,
      ai_prediction_tokens: body.ai_prediction_tokens ?? DEFAULT_TOKEN_SETTINGS.ai_prediction_tokens,
      ai_prediction_duration_hours: body.ai_prediction_duration_hours ?? DEFAULT_TOKEN_SETTINGS.ai_prediction_duration_hours,
      listing_normal_tokens: body.listing_normal_tokens ?? DEFAULT_TOKEN_SETTINGS.listing_normal_tokens,
      listing_normal_duration_days: body.listing_normal_duration_days ?? DEFAULT_TOKEN_SETTINGS.listing_normal_duration_days,
      listing_normal_chat_free: body.listing_normal_chat_free ?? DEFAULT_TOKEN_SETTINGS.listing_normal_chat_free,
      listing_dealer_tokens: body.listing_dealer_tokens ?? DEFAULT_TOKEN_SETTINGS.listing_dealer_tokens,
      listing_dealer_duration_days: body.listing_dealer_duration_days ?? DEFAULT_TOKEN_SETTINGS.listing_dealer_duration_days,
      listing_dealer_multiplier: body.listing_dealer_multiplier ?? DEFAULT_TOKEN_SETTINGS.listing_dealer_multiplier,
      dealer_contact_tokens: body.dealer_contact_tokens ?? DEFAULT_TOKEN_SETTINGS.dealer_contact_tokens,
      dealer_contact_multiplier: body.dealer_contact_multiplier ?? DEFAULT_TOKEN_SETTINGS.dealer_contact_multiplier,
      boost_tokens: body.boost_tokens ?? DEFAULT_TOKEN_SETTINGS.boost_tokens,
      boost_duration_days: body.boost_duration_days ?? DEFAULT_TOKEN_SETTINGS.boost_duration_days,
      highlight_tokens: body.highlight_tokens ?? DEFAULT_TOKEN_SETTINGS.highlight_tokens,
      highlight_duration_days: body.highlight_duration_days ?? DEFAULT_TOKEN_SETTINGS.highlight_duration_days,
      featured_tokens: body.featured_tokens ?? DEFAULT_TOKEN_SETTINGS.featured_tokens,
      featured_duration_days: body.featured_duration_days ?? DEFAULT_TOKEN_SETTINGS.featured_duration_days,
      premium_badge_tokens: body.premium_badge_tokens ?? DEFAULT_TOKEN_SETTINGS.premium_badge_tokens,
      premium_badge_duration_days: body.premium_badge_duration_days ?? DEFAULT_TOKEN_SETTINGS.premium_badge_duration_days,
      top_search_tokens: body.top_search_tokens ?? DEFAULT_TOKEN_SETTINGS.top_search_tokens,
      top_search_duration_days: body.top_search_duration_days ?? DEFAULT_TOKEN_SETTINGS.top_search_duration_days,
      inspection_tokens: body.inspection_tokens ?? DEFAULT_TOKEN_SETTINGS.inspection_tokens,
      inspection_mandatory: body.inspection_mandatory ?? DEFAULT_TOKEN_SETTINGS.inspection_mandatory,
      auto_move_to_public: body.auto_move_to_public ?? DEFAULT_TOKEN_SETTINGS.auto_move_to_public,
      auto_move_gratis: body.auto_move_gratis ?? DEFAULT_TOKEN_SETTINGS.auto_move_gratis,
      remind_before_expire_days: body.remind_before_expire_days ?? DEFAULT_TOKEN_SETTINGS.remind_before_expire_days,
      is_active: body.is_active ?? true,
    }
    
    let setting
    if (existing) {
      setting = await db.tokenSetting.update({
        where: { id: existing.id },
        data: settingsData
      })
    } else {
      setting = await db.tokenSetting.create({
        data: settingsData
      })
    }
    
    return successResponse({ setting })
  } catch (error) {
    console.error('Error creating/updating token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}

// PUT: Update token setting (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return errorResponse('Setting ID is required', 400)
    }
    
    const setting = await db.tokenSetting.update({
      where: { id },
      data: updates
    })
    
    return successResponse({ setting })
  } catch (error) {
    console.error('Error updating token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}

// DELETE: Delete token setting (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    
    if (!id) {
      return errorResponse('Setting ID is required', 400)
    }
    
    await db.tokenSetting.delete({
      where: { id }
    })
    
    return successResponse({ deleted: true })
  } catch (error) {
    console.error('Error deleting token setting:', error)
    return errorResponse('Internal server error', 500)
  }
}
