import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get count of active offers for a user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('user_id')
    const dealerId = searchParams.get('dealer_id')

    if (!userId && !dealerId) {
      return NextResponse.json({ error: 'user_id or dealer_id required' }, { status: 400 })
    }

    const activeStatuses = ['pending', 'viewed', 'negotiating']

    // Count active offers
    const activeWhere: Record<string, unknown> = {
      status: { in: activeStatuses },
    }
    if (userId) activeWhere.user_id = userId
    if (dealerId) activeWhere.dealer_id = dealerId

    const count = await db.dealerOffer.count({ where: activeWhere })

    // Also get breakdown by status
    const allWhere: Record<string, unknown> = {}
    if (userId) allWhere.user_id = userId
    if (dealerId) allWhere.dealer_id = dealerId

    const allOffers = await db.dealerOffer.findMany({
      where: allWhere,
      select: { status: true },
    })

    // Count by status
    const statusCounts: Record<string, number> = {
      pending: 0,
      viewed: 0,
      negotiating: 0,
      accepted: 0,
      rejected: 0,
      expired: 0,
      withdrawn: 0,
    }

    allOffers.forEach(offer => {
      if (offer.status && statusCounts[offer.status] !== undefined) {
        statusCounts[offer.status]++
      }
    })

    // Count new offers (not viewed yet) for user
    let newOffersCount = 0
    if (userId) {
      newOffersCount = await db.dealerOffer.count({
        where: { user_id: userId, status: 'pending' },
      })
    }

    return NextResponse.json({
      success: true,
      active_count: count,
      new_count: newOffersCount,
      breakdown: statusCounts,
    })
  } catch (error: unknown) {
    console.error('Error counting offers:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
