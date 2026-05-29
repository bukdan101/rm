import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Fix existing listings to have visibility for dealer marketplace
 * Run this once after seed to make listings visible in dealer marketplace
 */
export async function GET() {
  try {
    console.log('🔧 Fixing listings visibility...')

    // Update all active listings that don't have visibility set
    const { data: listings, error: updateError } = await supabaseAdmin
      .from('car_listings')
      .update({
        visibility: 'both',
        published_to_dealer_marketplace_at: new Date().toISOString(),
      })
      .eq('status', 'active')
      .is('visibility', null)
      .select('id, title')

    if (updateError) {
      throw updateError
    }

    // Also update listings that have visibility but not published_to_dealer_marketplace_at
    const { data: listings2, error: updateError2 } = await supabaseAdmin
      .from('car_listings')
      .update({
        published_to_dealer_marketplace_at: new Date().toISOString(),
      })
      .eq('status', 'active')
      .in('visibility', ['dealer_marketplace', 'both'])
      .is('published_to_dealer_marketplace_at', null)
      .select('id, title')

    if (updateError2) {
      throw updateError2
    }

    // Count listings now visible in dealer marketplace
    const { count, error: countError } = await supabaseAdmin
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .in('visibility', ['dealer_marketplace', 'both'])

    if (countError) {
      throw countError
    }

    return NextResponse.json({
      success: true,
      message: 'Listings visibility fixed!',
      updated_visibility: listings?.length || 0,
      updated_published_at: listings2?.length || 0,
      total_visible_in_dealer_marketplace: count || 0,
    })
  } catch (error: any) {
    console.error('Error fixing listings:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
