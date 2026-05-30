import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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

    const [favorites, count] = await Promise.all([
      db.dealerMarketplaceFavorite.findMany({
        where: { dealer_id: dealerId },
        include: {
          listing: {
            select: {
              id: true,
              listing_number: true,
              title: true,
              year: true,
              price_cash: true,
              mileage: true,
              city: true,
              province: true,
              brand: { select: { name: true } },
              carModel: { select: { name: true } },
              images: { select: { image_url: true, is_primary: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      db.dealerMarketplaceFavorite.count({
        where: { dealer_id: dealerId }
      })
    ])

    const transformedFavorites = favorites.map(fav => {
      const listing = fav.listing as any
      const primaryImage = listing?.images?.find((img: any) => img.is_primary)?.image_url || 
                          listing?.images?.[0]?.image_url

      return {
        ...fav,
        listing: {
          ...listing,
          brand_name: listing?.brand?.name,
          model_name: listing?.carModel?.name,
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
        total: count,
        totalPages: Math.ceil(count / limit)
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
    const { dealer_id, car_listing_id } = body

    const favorite = await db.dealerMarketplaceFavorite.create({
      data: {
        dealer_id,
        car_listing_id
      }
    })

    return NextResponse.json({
      success: true,
      favorite
    })
  } catch (error: any) {
    console.error('Error adding favorite:', error)
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        error: 'Listing already in favorites'
      }, { status: 400 })
    }
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

    await db.dealerMarketplaceFavorite.deleteMany({
      where: {
        dealer_id: dealerId,
        car_listing_id: listingId
      }
    })

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
