import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface Activity {
  id: string
  type: 'view' | 'message' | 'favorite' | 'listing' | 'token' | 'sale'
  title: string
  description?: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const dealerId = searchParams.get('dealer_id')
    const limit = parseInt(searchParams.get('limit') || '10')

    const activities: Activity[] = []

    // 1. Get recent listing views (if we have a view tracking table)
    const { data: views } = await supabase
      .from('dealer_marketplace_views')
      .select('id, listing_id, viewer_id, created_at, car_listings(title)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (views) {
      views.forEach((view: Record<string, unknown>) => {
        activities.push({
          id: `view-${view.id}`,
          type: 'view',
          title: `${(view.car_listings as Record<string, unknown>)?.title || 'Mobil'} dilihat`,
          description: 'Mobil Anda mendapat views baru',
          timestamp: view.created_at as string,
          metadata: { listing_id: view.listing_id }
        })
      })
    }

    // 2. Get recent messages
    const { data: messages } = await supabase
      .from('messages')
      .select('id, content, sender_id, created_at, conversations!inner(listing_id, car_listings(title))')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (messages) {
      messages.forEach((msg: Record<string, unknown>) => {
        const conv = msg.conversations as Record<string, unknown>
        const listing = conv?.car_listings as Record<string, unknown>
        activities.push({
          id: `msg-${msg.id}`,
          type: 'message',
          title: 'Pesan baru masuk',
          description: listing?.title ? `Tentang ${listing.title}` : (msg.content as string)?.slice(0, 50),
          timestamp: msg.created_at as string,
          metadata: { conversation_id: conv?.id }
        })
      })
    }

    // 3. Get recent favorites
    const { data: favorites } = await supabase
      .from('dealer_marketplace_favorites')
      .select('id, listing_id, user_id, created_at, car_listings(title)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (favorites) {
      favorites.forEach((fav: Record<string, unknown>) => {
        activities.push({
          id: `fav-${fav.id}`,
          type: 'favorite',
          title: `${(fav.car_listings as Record<string, unknown>)?.title || 'Mobil'} disimpan`,
          description: 'Ditambahkan ke favorit',
          timestamp: fav.created_at as string,
          metadata: { listing_id: fav.listing_id }
        })
      })
    }

    // 4. Get recent listings
    let listingsQuery = supabase
      .from('car_listings')
      .select('id, title, created_at, status')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      listingsQuery = listingsQuery.eq('seller_id', userId)
    }

    const { data: listings } = await listingsQuery

    if (listings) {
      listings.forEach((listing: Record<string, unknown>) => {
        activities.push({
          id: `listing-${listing.id}`,
          type: 'listing',
          title: listing.status === 'active' ? 'Iklan dipublikasi' : 'Iklan baru dibuat',
          description: listing.title as string,
          timestamp: listing.created_at as string,
          metadata: { listing_id: listing.id }
        })
      })
    }

    // 5. Get recent token transactions
    const { data: tokenTransactions } = await supabase
      .from('token_transactions')
      .select('id, amount, transaction_type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (tokenTransactions) {
      tokenTransactions.forEach((tx: Record<string, unknown>) => {
        const amount = tx.amount as number
        const isPositive = amount > 0
        activities.push({
          id: `token-${tx.id}`,
          type: 'token',
          title: isPositive ? 'Token ditambahkan' : 'Token digunakan',
          description: `${isPositive ? '+' : ''}${amount} token`,
          timestamp: tx.created_at as string,
          metadata: { amount, type: tx.transaction_type }
        })
      })
    }

    // 6. Get recent sales (sold listings)
    const { data: sales } = await supabase
      .from('car_listings')
      .select('id, title, price, sold_at')
      .eq('status', 'sold')
      .not('sold_at', 'is', null)
      .order('sold_at', { ascending: false })
      .limit(limit)

    if (sales) {
      sales.forEach((sale: Record<string, unknown>) => {
        activities.push({
          id: `sale-${sale.id}`,
          type: 'sale',
          title: 'Mobil terjual!',
          description: `${sale.title} - Rp ${(sale.price as number)?.toLocaleString('id-ID')}`,
          timestamp: sale.sold_at as string,
          metadata: { listing_id: sale.id, price: sale.price }
        })
      })
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Return limited activities
    return NextResponse.json({ 
      success: true, 
      activities: activities.slice(0, limit) 
    })

  } catch (error) {
    console.error('Error fetching activities:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch activities',
      activities: [] 
    }, { status: 500 })
  }
}
