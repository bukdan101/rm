import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q || q.length < 2) {
      return successResponse({ data: { brands: [], models: [], listings: [] } })
    }

    // Search brands
    const brands = await db.brand.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true },
      take: 5,
    })

    // Search models
    const models = await db.carModel.findMany({
      where: { name: { contains: q } },
      select: {
        id: true,
        name: true,
        brand: { select: { id: true, name: true } },
      },
      take: 5,
    })

    // Search listings - use price_cash and city (not location_city)
    const listings = await db.carListing.findMany({
      where: {
        status: 'active',
        OR: [
          { title: { contains: q } },
          { city: { contains: q } },
        ],
      },
      select: {
        id: true,
        year: true,
        price_cash: true,
        city: true,
        condition: true,
        brand: { select: { name: true } },
        carModel: { select: { name: true } },
        images: {
          select: { image_url: true, is_primary: true },
          orderBy: { display_order: 'asc' },
        },
      },
      take: 5,
    })

    return successResponse({
      data: {
        brands: brands || [],
        models: models || [],
        listings: listings || [],
      },
    })
  } catch (error) {
    console.error('Error searching:', error)
    return errorResponse('Failed to search', 500)
  }
}
