import { NextRequest, NextResponse } from 'next/server'

// Default settings for development/preview
const DEFAULT_SETTINGS = {
  token_cost_public: 1,
  token_cost_dealer_marketplace: 2,
  token_cost_both: 3,
  default_offer_duration_hours: 72,
  inspection_cost: 250000,
  inspection_required_for_dealer_marketplace: false,
  platform_fee_percentage: 0,
  platform_fee_enabled: false
}

// GET - Get dealer marketplace settings
export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        isDefault: true,
        message: 'Using default settings (Supabase not configured)'
      })
    }

    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: true,
        settings: DEFAULT_SETTINGS,
        isDefault: true
      })
    }

    const { data, error } = await supabaseAdmin
      .from('dealer_marketplace_settings')
      .select('*')
      .eq('is_active', true)
      .single()

    if (error) {
      // If table doesn't exist, return default settings
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          settings: DEFAULT_SETTINGS,
          isDefault: true
        })
      }
      throw error
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
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Supabase not configured. Cannot save settings.'
      }, { status: 400 })
    }

    const { supabaseAdmin } = await import('@/lib/supabase')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin not available'
      }, { status: 400 })
    }
    
    const body = await request.json()
    
    const {
      token_cost_public,
      token_cost_dealer_marketplace,
      token_cost_both,
      default_offer_duration_hours,
      inspection_cost,
      inspection_required_for_dealer_marketplace,
      platform_fee_percentage,
      platform_fee_enabled
    } = body

    // Get existing settings
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('dealer_marketplace_settings')
      .select('id')
      .eq('is_active', true)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    let result
    if (existing) {
      // Update existing
      result = await supabaseAdmin
        .from('dealer_marketplace_settings')
        .update({
          token_cost_public,
          token_cost_dealer_marketplace,
          token_cost_both,
          default_offer_duration_hours,
          inspection_cost,
          inspection_required_for_dealer_marketplace,
          platform_fee_percentage,
          platform_fee_enabled,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      // Insert new
      result = await supabaseAdmin
        .from('dealer_marketplace_settings')
        .insert({
          token_cost_public,
          token_cost_dealer_marketplace,
          token_cost_both,
          default_offer_duration_hours,
          inspection_cost,
          inspection_required_for_dealer_marketplace,
          platform_fee_percentage,
          platform_fee_enabled
        })
        .select()
        .single()
    }

    if (result.error) throw result.error

    return NextResponse.json({
      success: true,
      settings: result.data
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
