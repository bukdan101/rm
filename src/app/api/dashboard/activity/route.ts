import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { NextRequest } from 'next/server'

interface Activity {
  id: string
  type: 'view' | 'message' | 'favorite' | 'listing' | 'token' | 'sale'
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const _dealerId = searchParams.get('dealer_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities: Activity[] = []

    // 1. Get recent marketplace views
    const views = await db.dealerMarketplaceView.findMany({
      orderBy: { viewed_at: 'desc' },
      take: limit,
      include: {
        // No direct listing relation on this model, need to look up separately
      },
    })

    if (views.length > 0) {
      // Get listing titles for these views
      const viewListingIds = [...new Set(views.map(v => v.car_listing_id))]
      const viewListings = viewListingIds.length > 0
        ? await db.carListing.findMany({
            where: { id: { in: viewListingIds } },
            select: { id: true, title: true },
          })
        : []
      const viewListingMap = Object.fromEntries(viewListings.map(l => [l.id, l.title]))

      views.forEach((view) => {
        activities.push({
          id: `view-${view.id}`,
          type: 'view',
          title: `${viewListingMap[view.car_listing_id] || 'Mobil'} dilihat`,
          description: 'Mobil Anda mendapat views baru',
          timestamp: view.viewed_at.toISOString(),
          metadata: { listing_id: view.car_listing_id },
        })
      })
    }

    // 2. Get recent messages
    const messages = await db.message.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        conversation: {
          select: {
            id: true,
            car_listing_id: true,
            listing: {
              select: { title: true },
            },
          },
        },
      },
    })

    if (messages.length > 0) {
      messages.forEach((msg) => {
        const listingTitle = msg.conversation?.listing?.title
        activities.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: 'Pesan baru masuk',
          description: listingTitle ? `Tentang ${listingTitle}` : (msg.message?.slice(0, 50) || ''),
          timestamp: msg.created_at.toISOString(),
          metadata: { conversation_id: msg.conversation?.id },
        })
      })
    }

    // 3. Get recent favorites (from car_favorites instead of dealer_marketplace_favorites)
    const favorites = await db.carFavorite.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      include: {
        listing: {
          select: { title: true },
        },
      },
    })

    if (favorites.length > 0) {
      favorites.forEach((fav) => {
        activities.push({
          id: `fav-${fav.id}`,
          type: 'favorite',
          title: `${fav.listing?.title || 'Mobil'} disimpan`,
          description: 'Ditambahkan ke favorit',
          timestamp: fav.created_at.toISOString(),
          metadata: { listing_id: fav.car_listing_id },
        })
      })
    }

    // 4. Get recent listings
    const whereClause: Record<string, unknown> = {}
    if (userId) {
      whereClause.user_id = userId
    }

    const listings = await db.carListing.findMany({
      where: whereClause,
      select: { id: true, title: true, created_at: true, status: true },
      orderBy: { created_at: 'desc' },
      take: limit,
    })

    if (listings.length > 0) {
      listings.forEach((listing) => {
        activities.push({
          id: `listing-${listing.id}`,
          type: 'listing',
          title: listing.status === 'active' ? 'Iklan dipublikasi' : 'Iklan baru dibuat',
          description: listing.title || '',
          timestamp: listing.created_at.toISOString(),
          metadata: { listing_id: listing.id },
        })
      })
    }

    // 5. Get recent credit transactions (CreditTransaction instead of token_transactions)
    const creditTransactions = await db.creditTransaction.findMany({
      orderBy: { created_at: 'desc' },
      take: limit,
      select: { id: true, amount: true, type: true, created_at: true },
    })

    if (creditTransactions.length > 0) {
      creditTransactions.forEach((tx) => {
        const amount = tx.amount
        const isPositive = amount > 0
        activities.push({
          id: `token-${tx.id}`,
          type: 'token',
          title: isPositive ? 'Kredit ditambahkan' : 'Kredit digunakan',
          description: `${isPositive ? '+' : ''}${amount} kredit`,
          timestamp: tx.created_at.toISOString(),
          metadata: { amount, type: tx.type },
        })
      })
    }

    // 6. Get recent sales (sold listings) - use price_cash instead of price
    const sales = await db.carListing.findMany({
      where: { status: 'sold', sold_at: { not: null } },
      select: { id: true, title: true, price_cash: true, sold_at: true },
      orderBy: { sold_at: 'desc' },
      take: limit,
    })

    if (sales.length > 0) {
      sales.forEach((sale) => {
        activities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: 'Mobil terjual!',
          description: `${sale.title} - Rp ${(sale.price_cash || 0)?.toLocaleString('id-ID')}`,
          timestamp: (sale.sold_at || sale.created_at || new Date()).toISOString(),
          metadata: { listing_id: sale.id, price: sale.price_cash },
        })
      })
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return limited activities
    return NextResponse.json({
      success: true,
      activities: activities.slice(0, limit),
    })
  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch activities',
      activities: [],
    }, { status: 500 })
  }
}
