import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit
    const cityId = searchParams.get('city_id')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')

    // Get car listings that have rental prices
    let query = supabase
      .from('car_listings')
      .select(`*`, { count: 'exact' })
      .eq('status', 'active')
      .eq('transaction_type', 'rental')

    if (cityId) {
      query = query.eq('city_id', cityId)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    // Get rental prices for these listings
    let rentalData = data
    if (data && data.length > 0) {
      const listingIds = data.map(l => l.id)
      const { data: rentalPrices } = await supabase
        .from('car_rental_prices')
        .select('*')
        .in('car_listing_id', listingIds)
      
      rentalData = data.map(listing => ({
        ...listing,
        rental_prices: rentalPrices?.find(r => r.car_listing_id === listing.id) || null
      }))
    }

    return NextResponse.json({
      success: true,
      data: rentalData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching rentals:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rentals' },
      { status: 500 }
    )
  }
}
