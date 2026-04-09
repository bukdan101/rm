import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get token settings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active_only') === 'true'
    
    let query = supabase
      .from('token_settings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (activeOnly) {
      query = query.eq('is_active', true)
        .or('valid_until.is.null,valid_until.gt.' + new Date().toISOString())
    }
    
    const { data, error } = await query.limit(1)
    
    if (error) throw error
    
    // Return single object if active_only
    const result = activeOnly ? data[0] : data
    
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

// POST - Create new token settings
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
      
      // Valid until
      valid_from,
      valid_until,
      created_by
    } = body
    
    // Deactivate previous settings
    await supabase
      .from('token_settings')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('is_active', true)
    
    // Create new settings
    const { data, error } = await supabase
      .from('token_settings')
      .insert({
        token_price_base: token_price_base || 1000,
        token_price_currency: token_price_currency || 'IDR',
        ai_prediction_tokens: ai_prediction_tokens ?? 5,
        ai_prediction_duration_hours: ai_prediction_duration_hours || 24,
        listing_normal_tokens: listing_normal_tokens ?? 10,
        listing_normal_duration_days: listing_normal_duration_days || 30,
        listing_normal_chat_free: listing_normal_chat_free ?? true,
        listing_dealer_tokens: listing_dealer_tokens ?? 20,
        listing_dealer_duration_days: listing_dealer_duration_days || 7,
        listing_dealer_multiplier: listing_dealer_multiplier || 2.00,
        dealer_contact_tokens: dealer_contact_tokens ?? 5,
        dealer_contact_multiplier: dealer_contact_multiplier || 0.50,
        boost_tokens: boost_tokens ?? 3,
        boost_duration_days: boost_duration_days || 7,
        highlight_tokens: highlight_tokens ?? 2,
        highlight_duration_days: highlight_duration_days || 7,
        featured_tokens: featured_tokens ?? 5,
        featured_duration_days: featured_duration_days || 7,
        premium_badge_tokens: premium_badge_tokens ?? 10,
        premium_badge_duration_days: premium_badge_duration_days || 30,
        top_search_tokens: top_search_tokens ?? 5,
        top_search_duration_days: top_search_duration_days || 7,
        inspection_tokens: inspection_tokens ?? 0,
        inspection_mandatory: inspection_mandatory ?? true,
        auto_move_to_public: auto_move_to_public ?? true,
        auto_move_gratis: auto_move_gratis ?? true,
        remind_before_expire_days: remind_before_expire_days || 2,
        valid_from: valid_from || new Date().toISOString(),
        valid_until: valid_until || null,
        created_by
      })
      .select()
      .single()
    
    if (error) throw error
    
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
    
    const { data, error } = await supabase
      .from('token_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
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
