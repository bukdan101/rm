import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get listings for dealer marketplace
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dealerId = searchParams.get('dealer_id')
    const brandId = searchParams.get('brand_id')
    const modelId = searchParams.get('model_id')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const provinceId = searchParams.get('province_id')
    const cityId = searchParams.get('city_id')
    const yearFrom = searchParams.get('year_from')
    const yearTo = searchParams.get('year_to')
    const hasInspection = searchParams.get('has_inspection')
    const sortBy = searchParams.get('sort_by') || 'newest'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'active',
      deleted_at: null,
      visibility: { in: ['dealer_marketplace', 'both'] },
    }

    if (brandId) where.brand_id = parseInt(brandId)
    if (modelId) where.model_id = parseInt(modelId)
    if (minPrice) where.price_cash = { ...where.price_cash as object, gte: parseInt(minPrice) }
    if (maxPrice) where.price_cash = { ...where.price_cash as object, lte: parseInt(maxPrice) }
    if (provinceId) where.province_id = provinceId
    if (cityId) where.city_id = cityId
    if (yearFrom || yearTo) {
      const yearFilter: Record<string, number> = {}
      if (yearFrom) yearFilter.gte = parseInt(yearFrom)
      if (yearTo) yearFilter.lte = parseInt(yearTo)
      where.year = yearFilter
    }

    // Determine ordering
    let orderBy: Record<string, string> = { published_to_dealer_marketplace_at: 'desc' }
    switch (sortBy) {
      case 'oldest':
        orderBy = { published_to_dealer_marketplace_at: 'asc' }
        break
      case 'price_asc':
        orderBy = { price_cash: 'asc' }
        break
      case 'price_desc':
        orderBy = { price_cash: 'desc' }
        break
      case 'mileage_asc':
        orderBy = { mileage: 'asc' }
        break
      case 'mileage_desc':
        orderBy = { mileage: 'desc' }
        break
      default:
        orderBy = { published_to_dealer_marketplace_at: 'desc' }
    }

    const [listings, count] = await Promise.all([
      db.carListing.findMany({
        where,
        select: {
          id: true,
          listing_number: true,
          title: true,
          year: true,
          price_cash: true,
          mileage: true,
          city: true,
          province: true,
          fuel: true,
          transmission: true,
          body_type: true,
          condition: true,
          view_count: true,
          favorite_count: true,
          published_to_dealer_marketplace_at: true,
          created_at: true,
          brand: { select: { id: true, name: true } },
          model: { select: { id: true, name: true } },
          images: {
            select: { image_url: true, is_primary: true, display_order: true },
            orderBy: { display_order: 'asc' },
          },
        },
        orderBy,
        skip: offset,
        take: limit,
      }),
      db.carListing.count({ where }),
    ])

    // Get inspection data for listings
    const listingIds = listings.map(l => l.id)
    const inspections = await db.carInspection.findMany({
      where: {
        car_listing_id: { in: listingIds },
        status: 'completed',
      },
      select: {
        car_listing_id: true,
        overall_grade: true,
        inspection_score: true,
        status: true,
      },
    })

    // Get offer counts for each listing
    const offerCounts = await db.dealerOffer.groupBy({
      by: ['car_listing_id'],
      where: { car_listing_id: { in: listingIds } },
      _count: true,
    })

    // Get favorite status if dealer_id provided
    let favorites: string[] = []
    if (dealerId) {
      const favData = await db.dealerMarketplaceFavorite.findMany({
        where: { dealer_id: dealerId },
        select: { car_listing_id: true },
      })
      favorites = favData.map(f => f.car_listing_id)
    }

    // Transform data
    const transformedListings = listings.map(listing => {
      const inspection = inspections.find(i => i.car_listing_id === listing.id)
      const offerCount = offerCounts.find(o => o.car_listing_id === listing.id)?._count || 0
      const primaryImage = listing.images?.find(img => img.is_primary)?.image_url ||
        listing.images?.[0]?.image_url

      return {
        ...listing,
        brand_name: listing.brand?.name,
        model_name: listing.model?.name,
        primary_image_url: primaryImage,
        inspection_grade: inspection?.overall_grade,
        inspection_score: inspection?.inspection_score,
        has_inspection: !!inspection,
        offer_count: offerCount,
        is_favorite: favorites.includes(listing.id),
      }
    })

    // Filter by has_inspection if requested
    const filteredListings = hasInspection === 'true'
      ? transformedListings.filter(l => l.has_inspection)
      : transformedListings

    return NextResponse.json({
      success: true,
      listings: filteredListings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching dealer marketplace listings:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
