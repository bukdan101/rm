import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabase = getSupabaseAdmin()

// GET - Get count of active offers for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const dealerId = searchParams.get('dealer_id')

    if (!userId && !dealerId) {
      return NextResponse.json({ error: 'user_id or dealer_id required' }, { status: 400 })
    }

    // Check if dealer_offers table exists
    const tableName = userId ? 'user_id' : 'dealer_id'
    const filterValue = userId || dealerId

    // Count active offers (pending, viewed, negotiating)
    const { count, error } = await supabase
      .from('dealer_offers')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'viewed', 'negotiating'])
      .eq(tableName, filterValue)

    if (error) {
      // If table doesn't exist, return 0
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          active_count: 0,
          new_count: 0,
          breakdown: {
            pending: 0,
            viewed: 0,
            negotiating: 0,
            accepted: 0,
            rejected: 0,
            expired: 0,
            withdrawn: 0
          }
        })
      }
      throw error
    }

    // Also get breakdown by status
    const { data: breakdown, error: breakdownError } = await supabase
      .from('dealer_offers')
      .select('status')
      .eq(tableName, filterValue)

    if (breakdownError) {
      throw breakdownError
    }

    // Count by status
    const statusCounts: Record<string, number> = {
      pending: 0,
      viewed: 0,
      negotiating: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      withdrawn: 0
    }

    breakdown?.forEach(offer => {
      if (offer.status && statusCounts[offer.status] !== undefined) {
        statusCounts[offer.status]++
      }
    })

    // Count new offers (not viewed yet) for user
    let newOffersCount = 0
    if (userId) {
      const { count: newCount } = await supabase
        .from('dealer_offers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'pending')
      
      newOffersCount = newCount || 0
    }

    return NextResponse.json({
      success: true,
      active_count: count || 0,
      new_count: newOffersCount,
      breakdown: statusCounts
    })
  } catch (error: any) {
    console.error('Error counting offers:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
