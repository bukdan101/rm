import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET - Get dealer's favorite listings
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dealerId = searchParams.get('dealer_id')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    if (!dealerId) {
      return NextResponse.json({
        success: false,
        error: 'dealer_id is required'
      }, { status: 400 })
    }

    const { data: favorites, error, count } = await supabaseAdmin
      .from('dealer_marketplace_favorites')
      .select(`
        *,
        car_listings!dealer_marketplace_favorites_car_listing_id_fkey (
          id, listing_number, title, year, price_cash, mileage, city, province,
          brands:brand_id (name),
          car_models:model_id (name),
          car_images!car_images_car_listing_id_fkey (image_url, is_primary)
        )
      `, { count: 'exact' })
      .eq('dealer_id', dealerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const transformedFavorites = favorites?.map(fav => {
      const listing = fav.car_listings as any
      const primaryImage = listing?.car_images?.find((img: any) => img.is_primary)?.image_url || 
                          listing?.car_images?.[0]?.image_url

      return {
        ...fav,
        listing: {
          ...listing,
          brand_name: listing?.brands?.name,
          model_name: listing?.car_models?.name,
          primary_image_url: primaryImage
        }
      }
    })

    return NextResponse.json({
      success: true,
      favorites: transformedFavorites,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching favorites:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// POST - Add to favorites
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dealer_id, car_listing_id, staff_id, notes } = body

    const { data: favorite, error } = await supabaseAdmin
      .from('dealer_marketplace_favorites')
      .insert({
        dealer_id,
        car_listing_id,
        staff_id,
        notes
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Listing already in favorites'
        }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({
      success: true,
      favorite
    })
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// DELETE - Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dealerId = searchParams.get('dealer_id')
    const listingId = searchParams.get('listing_id')

    if (!dealerId || !listingId) {
      return NextResponse.json({
        success: false,
        error: 'dealer_id and listing_id are required'
      }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('dealer_marketplace_favorites')
      .delete()
      .eq('dealer_id', dealerId)
      .eq('car_listing_id', listingId)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites'
    })
  } catch (error: any) {
    console.error('Error removing favorite:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
