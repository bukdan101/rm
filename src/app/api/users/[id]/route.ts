import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch user profile
    const profile = await db.profile.findUnique({
      where: { id, deleted_at: null },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch user's car listings
    // Fixed: seller_id → user_id, vehicle_condition → condition, removed is_featured
    // Fixed: overall_score → inspection_score
    const listings = await db.carListing.findMany({
      where: {
        user_id: profile.id, // Fixed: seller_id → user_id
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
      take: 20,
      include: {
        brand: { select: { id: true, name: true, slug: true, logo_url: true } },
        carModel: { select: { id: true, name: true, slug: true, body_type: true } },
        variant: { select: { id: true, name: true, transmission: true, fuel_type: true } },
        images: { select: { id: true, image_url: true, is_primary: true, display_order: true } },
        inspection: {
          select: {
            id: true,
            risk_level: true,
            inspection_score: true, // Fixed: overall_score → inspection_score
            passed_points: true,
            total_points: true,
            status: true,
          },
        },
      },
    })

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
        profile,
        listings,
        stats,
      },
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}
