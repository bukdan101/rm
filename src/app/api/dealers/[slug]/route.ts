import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch dealer by slug or id
    const dealer = await db.dealer.findFirst({
      where: {
        is_active: true,
        OR: [{ slug }, { id: slug }],
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            full_name: true,
            phone: true,
            avatar_url: true,
            is_verified: true,
          },
        },
      },
    })

    if (!dealer) {
      return NextResponse.json(
        { success: false, error: 'Dealer not found' },
        { status: 404 }
      )
    }

    // Fetch dealer's car listings
    const listings = await db.carListing.findMany({
      where: {
        dealer_id: dealer.id,
        deleted_at: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price_cash: true,
        price_credit: true,
        price_negotiable: true,
        year: true,
        mileage: true,
        condition: true,
        transaction_type: true,
        status: true,
        city: true,
        province: true,
        view_count: true,
        favorite_count: true,
        created_at: true,
        sold_at: true,
        brand: { select: { id: true, name: true, slug: true, logo_url: true } },
        model: { select: { id: true, name: true, slug: true, body_type: true } },
        variant: { select: { id: true, name: true, transmission: true, fuel_type: true } },
        images: {
          select: { id: true, image_url: true, is_primary: true, display_order: true },
          orderBy: { display_order: 'asc' },
        },
        inspection: {
          select: { id: true, risk_level: true, inspection_score: true, passed_points: true, total_points: true, status: true },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    })

    // Fetch location details
    let locationDetails = null
    if (dealer.city_id || dealer.province_id) {
      const [city, province] = await Promise.all([
        dealer.city_id
          ? db.city.findUnique({ where: { id: dealer.city_id } })
          : null,
        dealer.province_id
          ? db.province.findUnique({ where: { id: dealer.province_id } })
          : null,
      ])

      locationDetails = { city, province }
    }

    // Calculate stats
    const stats = {
      total_listings: listings.length,
      active_listings: listings.filter(l => l.status === 'active').length,
      sold_listings: listings.filter(l => l.status === 'sold').length,
      total_views: listings.reduce((sum, l) => sum + (l.view_count || 0), 0),
      total_favorites: listings.reduce((sum, l) => sum + (l.favorite_count || 0), 0),
    }

    return NextResponse.json({
      success: true,
      data: {
        dealer,
        listings,
        locationDetails,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching dealer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealer' },
      { status: 500 }
    )
  }
}
