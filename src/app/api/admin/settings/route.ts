import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all settings from different tables
    const [tokenSettings, feeSettings, systemSettings] = await Promise.all([
      supabase.from('token_settings').select('*').single(),
      supabase.from('fee_settings').select('*').single(),
      supabase.from('system_settings').select('*').single(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        tokenSettings: tokenSettings.data || {
          token_per_listing: 5,
          token_per_feature: 10,
          token_per_bump: 15,
          free_tokens_on_signup: 10,
          referral_bonus: 5,
        },
        feeSettings: feeSettings.data || {
          platform_fee_percent: 2.5,
          transaction_fee: 5000,
          withdrawal_fee: 10000,
          min_withdrawal: 50000,
          dealer_subscription_monthly: 100000,
        },
        systemSettings: systemSettings.data || {
          site_name: 'AutoMarket',
          contact_email: 'support@automarket.id',
          maintenance_mode: false,
          allow_registration: true,
          max_listings_per_user: 10,
          max_images_per_listing: 10,
        },
      },
    })
  } catch (error) {
    console.error('Error in admin settings API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { type, settings } = body

    if (!type || !settings) {
      return NextResponse.json({ success: false, error: 'Type and settings required' }, { status: 400 })
    }

    let tableName = ''
    switch (type) {
      case 'token':
        tableName = 'token_settings'
        break
      case 'fee':
        tableName = 'fee_settings'
        break
      case 'system':
        tableName = 'system_settings'
        break
      default:
        return NextResponse.json({ success: false, error: 'Invalid settings type' }, { status: 400 })
    }

    // Try to update, if no row exists, insert
    const { data: existing } = await supabase
      .from(tableName)
      .select('id')
      .single()

    let result
    if (existing) {
      result = await supabase
        .from(tableName)
        .update({ ...settings, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from(tableName)
        .insert({ ...settings, created_at: new Date().toISOString() })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving settings:', result.error)
      return NextResponse.json({ success: false, error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Error in admin settings PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
