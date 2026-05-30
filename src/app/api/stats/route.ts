import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const dealerId = searchParams.get('dealer_id')
    const userId = searchParams.get('user_id')

    // Build where clause
    const where: any = {}
    if (dealerId) {
      where.dealer_id = dealerId
    } else if (userId) {
      where.user_id = userId
    }

    // Get all listings for the user/dealer
    const listings = await db.carListing.findMany({
      where,
      select: {
        id: true,
        status: true,
        view_count: true,
        favorite_count: true,
        inquiry_count: true,
        price_cash: true
      }
    })

    const count = listings.length

    // Calculate statistics
    const stats = {
      total_listings: count,
      active_listings: listings.filter(l => l.status === 'active').length,
      sold_listings: listings.filter(l => l.status === 'sold').length,
      pending_listings: listings.filter(l => l.status === 'pending').length,
      draft_listings: listings.filter(l => l.status === 'draft').length,
      expired_listings: listings.filter(l => l.status === 'expired').length,
      total_views: listings.reduce((sum, l) => sum + (l.view_count || 0), 0),
      total_favorites: listings.reduce((sum, l) => sum + (l.favorite_count || 0), 0),
      total_inquiries: listings.reduce((sum, l) => sum + (l.inquiry_count || 0), 0),
      estimated_value: listings
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + (l.price_cash || 0), 0),
      conversion_rate: count > 0
        ? Math.round((listings.filter(l => l.status === 'sold').length / count) * 100)
        : 0,
    }

    // Get comparison data (previous month)
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)

    const lastMonthListings = await db.carListing.count({
      where: {
        created_at: { lt: oneMonthAgo },
        ...(dealerId ? { dealer_id: dealerId } : {}),
        ...(userId ? { user_id: userId } : {})
      }
    })

    // Calculate trend percentages
    const trends = {
      listings_trend: {
        value: lastMonthListings && count ? Math.round(((count - lastMonthListings) / Math.max(lastMonthListings, 1)) * 100) : 0,
        isPositive: count >= (lastMonthListings || 0),
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
