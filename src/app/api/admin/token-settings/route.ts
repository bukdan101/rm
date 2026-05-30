import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get token settings (single-row wide table)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'
    
    const settings = await db.tokenSetting.findFirst({
      where: activeOnly ? { is_active: true } : {},
      orderBy: { created_at: 'desc' }
    })
    
    // Return defaults if no settings exist
    const result = settings || {
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
    
    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('Error fetching token settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch token settings' },
      { status: 500 }
    )
  }
}

// POST - Create or update token settings (upsert single row)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Token Price
      token_price_base,
      token_price_currency,
      
      // AI Prediction
      ai_prediction_tokens,
      ai_prediction_duration_hours,
      
      // Listing Normal
      listing_normal_tokens,
      listing_normal_duration_days,
      listing_normal_chat_free,
      
      // Listing Dealer
      listing_dealer_tokens,
      listing_dealer_duration_days,
      listing_dealer_multiplier,
      
      // Dealer Contact
      dealer_contact_tokens,
      dealer_contact_multiplier,
      
      // Boost Features
      boost_tokens,
      boost_duration_days,
      highlight_tokens,
      highlight_duration_days,
      featured_tokens,
      featured_duration_days,
      premium_badge_tokens,
      premium_badge_duration_days,
      top_search_tokens,
      top_search_duration_days,
      
      // Inspection
      inspection_tokens,
      inspection_mandatory,
      
      // Auto-move
      auto_move_to_public,
      auto_move_gratis,
      remind_before_expire_days,
      
      is_active
    } = body
    
    // Get existing settings
    const existing = await db.tokenSetting.findFirst()
    
    const settingsData = {
      token_price_base: token_price_base ?? 10000,
      token_price_currency: token_price_currency || 'IDR',
      ai_prediction_tokens: ai_prediction_tokens ?? 5,
      ai_prediction_duration_hours: ai_prediction_duration_hours ?? 24,
      listing_normal_tokens: listing_normal_tokens ?? 3,
      listing_normal_duration_days: listing_normal_duration_days ?? 30,
      listing_normal_chat_free: listing_normal_chat_free ?? true,
      listing_dealer_tokens: listing_dealer_tokens ?? 5,
      listing_dealer_duration_days: listing_dealer_duration_days ?? 30,
      listing_dealer_multiplier: listing_dealer_multiplier ?? 1.0,
      dealer_contact_tokens: dealer_contact_tokens ?? 2,
      dealer_contact_multiplier: dealer_contact_multiplier ?? 1.0,
      boost_tokens: boost_tokens ?? 5,
      boost_duration_days: boost_duration_days ?? 7,
      highlight_tokens: highlight_tokens ?? 3,
      highlight_duration_days: highlight_duration_days ?? 7,
      featured_tokens: featured_tokens ?? 10,
      featured_duration_days: featured_duration_days ?? 7,
      premium_badge_tokens: premium_badge_tokens ?? 8,
      premium_badge_duration_days: premium_badge_duration_days ?? 30,
      top_search_tokens: top_search_tokens ?? 6,
      top_search_duration_days: top_search_duration_days ?? 7,
      inspection_tokens: inspection_tokens ?? 5,
      inspection_mandatory: inspection_mandatory ?? false,
      auto_move_to_public: auto_move_to_public ?? false,
      auto_move_gratis: auto_move_gratis ?? false,
      remind_before_expire_days: remind_before_expire_days ?? 3,
      is_active: is_active ?? true,
    }
    
    let data
    if (existing) {
      // Update existing
      data = await db.tokenSetting.update({
        where: { id: existing.id },
        data: settingsData
      })
    } else {
      // Create new
      data = await db.tokenSetting.create({
        data: settingsData
      })
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Token settings updated successfully'
    })
  } catch (error) {
    console.error('Error creating token settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create token settings' },
      { status: 500 }
    )
  }
}

// PUT - Update token settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      )
    }
    
    const data = await db.tokenSetting.update({
      where: { id },
      data: updates
    })
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Token settings updated successfully'
    })
  } catch (error) {
    console.error('Error updating token settings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update token settings' },
      { status: 500 }
    )
  }
}
