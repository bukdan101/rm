import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's listings
    const listings = await db.carListing.findMany({
      where: {
        user_id: userId,
        deleted_at: null
      },
      select: {
        id: true,
        title: true,
        year: true,
        price_cash: true,
        status: true,
        view_count: true,
        favorite_count: true,
        inquiry_count: true,
        created_at: true,
        expired_at: true,
        marketplace_type: true,
        visibility: true,
        brand: { select: { name: true } },
        carModel: { select: { name: true } },
        images: { select: { image_url: true, is_primary: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({
      success: true,
      listings: listings || [],
    })
  } catch (error) {
    console.error('My listings error:', error)
    return NextResponse.json({ success: true, listings: [] })
  }
}
