import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

const supabase = getSupabaseAdmin()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealerId = searchParams.get('dealer_id')
    const userId = searchParams.get('user_id')

    // Build query based on context
    let baseQuery = supabase
      .from('car_listings')
      .select('id, status, view_count, favorite_count, inquiry_count, price_cash', { count: 'exact' })

    if (dealerId) {
      baseQuery = baseQuery.eq('dealer_id', dealerId)
    } else if (userId) {
      baseQuery = baseQuery.eq('user_id', userId)
    }

    // Get all listings for the user/dealer
    const { data: listings, error, count } = await baseQuery

    if (error) throw error

    // Calculate statistics
    const stats = {
      total_listings: count || 0,
      active_listings: listings?.filter(l => l.status === 'active').length || 0,
      sold_listings: listings?.filter(l => l.status === 'sold').length || 0,
      pending_listings: listings?.filter(l => l.status === 'pending').length || 0,
      draft_listings: listings?.filter(l => l.status === 'draft').length || 0,
      expired_listings: listings?.filter(l => l.status === 'expired').length || 0,
      total_views: listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0,
      total_favorites: listings?.reduce((sum, l) => sum + (l.favorite_count || 0), 0) || 0,
      total_inquiries: listings?.reduce((sum, l) => sum + (l.inquiry_count || 0), 0) || 0,
      estimated_value: listings
        ?.filter(l => l.status === 'active')
        .reduce((sum, l) => sum + (l.price_cash || 0), 0) || 0,
      conversion_rate: count && count > 0 
        ? Math.round((listings?.filter(l => l.status === 'sold').length || 0) / count * 100)
        : 0,
    }

    // Get comparison data (previous month)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    const { count: lastMonthListings } = await supabase
      .from('car_listings')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', oneMonthAgo.toISOString())
      .eq(dealerId ? 'dealer_id' : 'user_id', dealerId || userId)

    // Calculate trend percentages (mock for now, would need historical data)
    const trends = {
      listings_trend: {
        value: lastMonthListings && count ? Math.round(((count - lastMonthListings) / Math.max(lastMonthListings, 1)) * 100) : 0,
        isPositive: (count || 0) >= (lastMonthListings || 0),
        label: 'dari bulan lalu'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        ...trends
      }
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch statistics',
    }, { status: 500 })
  }
}
