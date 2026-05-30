import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }
  return { authorized: true, userId }
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    // Fetch token settings (single-row wide table)
    const tokenSettings = await db.tokenSetting.findFirst()

    // Fetch fee settings
    const feeSettings = await db.feeSetting.findFirst()

    // No system_settings table - use defaults
    const systemSettings = null

    return NextResponse.json({
      success: true,
      data: {
        tokenSettings: tokenSettings || {
          token_price_base: 10000,
          token_price_currency: 'IDR',
          listing_normal_tokens: 3,
          listing_dealer_tokens: 5,
          boost_tokens: 5,
          highlight_tokens: 3,
          featured_tokens: 10,
          ai_prediction_tokens: 5,
          dealer_contact_tokens: 2,
        },
        feeSettings: feeSettings || {
          fee_type: 'platform',
          fee_percentage: 2.5,
          fee_fixed_amount: 5000,
          min_fee_amount: 0,
          applies_to: 'all',
        },
        systemSettings: systemSettings || {
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
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { type, settings } = body

    if (!type || !settings) {
      return NextResponse.json({ success: false, error: 'Type and settings required' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'token': {
        // TokenSetting is a single-row wide table
        const existing = await db.tokenSetting.findFirst()
        if (existing) {
          result = await db.tokenSetting.update({
            where: { id: existing.id },
            data: settings,
          })
        } else {
          result = await db.tokenSetting.create({
            data: settings,
          })
        }
        break
      }
      case 'fee': {
        // FeeSetting is a single-row table
        const existing = await db.feeSetting.findFirst()
        if (existing) {
          result = await db.feeSetting.update({
            where: { id: existing.id },
            data: settings,
          })
        } else {
          result = await db.feeSetting.create({
            data: settings,
          })
        }
        break
      }
      case 'system': {
        // No system_settings table - return the settings as-is
        result = settings
        break
      }
      default:
        return NextResponse.json({ success: false, error: 'Invalid settings type' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('Error in admin settings PATCH:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
