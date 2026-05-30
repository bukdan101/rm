import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse, successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const offset = (page - 1) * limit

    // Admin mode - show all listings regardless of status
    const isAdmin = searchParams.get('admin') === 'true'

    // Filters
    const brandId = searchParams.get('brand_id')
    const modelId = searchParams.get('model_id')
    const variantId = searchParams.get('variant_id')
    const transactionType = searchParams.get('transaction_type')
    const condition = searchParams.get('condition')
    const fuelType = searchParams.get('fuel')
    const transmission = searchParams.get('transmission')
    const bodyType = searchParams.get('body_type')
    const yearMin = searchParams.get('year_min')
    const yearMax = searchParams.get('year_max')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const mileageMin = searchParams.get('mileage_min')
    const mileageMax = searchParams.get('mileage_max')
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const dealerId = searchParams.get('dealer_id')
    const featured = searchParams.get('featured')

    // Build where clause
    const where: any = {
      deleted_at: null
    }

    // Apply status filter
    if (isAdmin) {
      if (status && status !== 'all') {
        if (status === 'banned') {
          where.status = 'banned'
        } else {
          where.status = status
        }
      }
    } else {
      where.status = status || 'active'
    }
    
    if (brandId) where.brand_id = parseInt(brandId)
    if (modelId) where.model_id = parseInt(modelId)
    if (variantId) where.variant_id = parseInt(variantId)
    if (transactionType) where.transaction_type = transactionType
    if (condition) where.condition = condition
    if (fuelType) where.fuel = fuelType
    if (transmission) where.transmission = transmission
    if (bodyType) where.body_type = bodyType
    if (yearMin) where.year = { ...where.year, gte: parseInt(yearMin) }
    if (yearMax) where.year = { ...where.year, lte: parseInt(yearMax) }
    if (priceMin) where.price_cash = { ...where.price_cash, gte: parseInt(priceMin) }
    if (priceMax) where.price_cash = { ...where.price_cash, lte: parseInt(priceMax) }
    if (mileageMin) where.mileage = { ...where.mileage, gte: parseInt(mileageMin) }
    if (mileageMax) where.mileage = { ...where.mileage, lte: parseInt(mileageMax) }
    if (dealerId) where.dealer_id = dealerId
    
    // Featured listings (featured_until is a DateTime, check if it's in the future)
    if (featured === 'true') {
      where.featured_until = { gte: new Date() }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { city: { contains: search } }
      ]
    }

    // Get listings with count
    const [listings, count] = await Promise.all([
      db.carListing.findMany({
        where,
        include: {
          brand: { select: { name: true } },
          carModel: { select: { name: true } },
          seller: { select: { id: true, full_name: true, email: true } },
          images: { select: { image_url: true, is_primary: true } }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      db.carListing.count({ where })
    ])

    // Get featured listings for banner
    let featuredListings = null
    if (page === 1 && !isAdmin) {
      featuredListings = await db.carListing.findMany({
        where: {
          status: 'active',
          deleted_at: null,
          featured_until: { gte: new Date() }
        },
        take: 5
      })
    }

    return successResponse({
      listings,
      featured: featuredListings,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return errorResponse('Failed to fetch listings', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Insert car listing
    const listing = await db.carListing.create({
      data: {
        user_id: body.user_id || null,
        variant_id: body.variant_id || null,
        exterior_color_id: body.exterior_color_id || null,
        title: body.title || null,
        description: body.description || null,
        price_cash: body.price_cash || 0,
        year: body.year || null,
        mileage: body.mileage || null,
        condition: body.condition || 'bekas',
        transaction_type: body.transaction_type || 'jual',
        status: body.status || 'draft',
        city: body.city || null,
        province: body.province || null,
        featured_until: body.featured_until ? new Date(body.featured_until) : null,
        published_at: body.status === 'active' ? new Date() : null,
      }
    })

    // Insert images if provided
    if (body.images && body.images.length > 0) {
      const imagesToInsert = body.images.map((img: { url: string; caption?: string; is_primary?: boolean }, idx: number) => ({
        car_listing_id: listing.id,
        image_url: img.url,
        is_primary: img.is_primary || idx === 0,
        display_order: idx
      }))

      await db.carImage.createMany({ data: imagesToInsert })
    }

    // Insert documents if provided
    if (body.documents) {
      await db.carDocument.create({
        data: {
          car_listing_id: listing.id,
          document_type: body.documents.document_type || 'other',
          ...body.documents
        }
      })
    }

    // Insert features if provided
    if (body.features) {
      await db.carFeature.create({
        data: {
          car_listing_id: listing.id,
          ...body.features
        }
      })
    }

    // Insert rental prices if provided
    if (body.rental_prices && body.transaction_type === 'rental') {
      await db.carRentalPrice.create({
        data: {
          car_listing_id: listing.id,
          ...body.rental_prices
        }
      })
    }

    return successResponse({ data: listing }, 201)
  } catch (error) {
    console.error('Error creating listing:', error)
    return errorResponse('Failed to create listing', 500)
  }
}
