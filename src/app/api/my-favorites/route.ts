import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's favorites with listing details
    const favorites = await db.carFavorite.findMany({
      where: { user_id: userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            year: true,
            price_cash: true,
            mileage: true,
            city: true,
            province: true,
            status: true,
            brand: { select: { name: true } },
            model: { select: { name: true } },
            images: {
              select: { image_url: true, is_primary: true },
              orderBy: { display_order: 'asc' },
            },
            inspection: {
              select: { inspection_score: true, overall_grade: true },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    })

    // Transform data to match expected format
    const transformedFavorites = favorites.map(fav => ({
      id: fav.id,
      listing_id: fav.car_listing_id,
      created_at: fav.created_at,
      listing: fav.listing,
    }))

    return NextResponse.json({
      success: true,
      favorites: transformedFavorites,
    })
  } catch (error) {
    console.error('My favorites error:', error)
    return NextResponse.json({ success: true, favorites: [] })
  }
}
