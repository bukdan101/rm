import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Helper to verify admin access
async function verifyAdmin(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) }
  }
  const profile = await db.profile.findUnique({ where: { id: userId }, select: { role: true } })
  if (!profile || profile.role !== 'admin') {
    return { authorized: false, error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) }
  }
  return { authorized: true, userId }
}

// GET - Fetch all listings for admin
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Fetch listings with count
    const [listings, count] = await Promise.all([
      db.carListing.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        include: {
          seller: {
            select: { id: true, full_name: true, email: true, phone: true, avatar_url: true },
          },
          images: {
            select: { image_url: true, is_primary: true, car_listing_id: true },
          },
        },
      }),
      db.carListing.count({ where }),
    ])

    // Get unique variant IDs
    const variantIds = [...new Set(listings.map(l => l.variant_id).filter(Boolean))] as number[]

    // Get variants with models and brands
    const variants = variantIds.length > 0
      ? await db.carVariant.findMany({
          where: { id: { in: variantIds } },
          select: { id: true, name: true, year_start: true, model_id: true },
        })
      : []

    // Get models
    const modelIds = [...new Set(variants.map(v => v.model_id).filter(Boolean))]
    const models = modelIds.length > 0
      ? await db.carModel.findMany({
          where: { id: { in: modelIds } },
          select: { id: true, name: true, brand_id: true },
        })
      : []

    // Get brands
    const brandIds = [...new Set(models.map(m => m.brand_id).filter(Boolean))]
    const brands = brandIds.length > 0
      ? await db.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, name: true },
        })
      : []

    // Create lookup maps
    const variantMap = Object.fromEntries(variants.map(v => [v.id, v]))
    const modelMap = Object.fromEntries(models.map(m => [m.id, m]))
    const brandMap = Object.fromEntries(brands.map(b => [b.id, b]))

    // Transform data
    const transformedListings = listings.map((listing) => {
      const variant = variantMap[listing.variant_id ?? 0] as { id: number; name: string; year_start: number | null; model_id: number } | undefined
      const model = variant ? modelMap[variant.model_id] as { id: number; name: string; brand_id: number } | undefined : undefined
      const brand = model ? brandMap[model.brand_id] as { id: number; name: string } | undefined : undefined
      const images = listing.images
      const primaryImage = images?.find(img => img.is_primary)?.image_url || images?.[0]?.image_url || null

      // Generate placeholder image based on title if no image exists
      const placeholderImage = `https://picsum.photos/seed/${encodeURIComponent(listing.title || 'car')}/400/300`

      return {
        id: listing.id,
        title: listing.title,
        price: listing.price_cash,
        year: listing.year,
        mileage: listing.mileage,
        status: listing.status,
        condition: listing.condition,
        transaction_type: listing.transaction_type,
        city: listing.city,
        province: listing.province,
        view_count: listing.view_count,
        featured_until: listing.featured_until,
        created_at: listing.created_at,
        published_at: listing.published_at,
        sold_at: listing.sold_at,
        deleted_at: listing.deleted_at,
        brand_name: brand?.name || 'Unknown',
        model_name: model?.name || 'Unknown',
        variant_name: variant?.name || 'Unknown',
        primary_image: primaryImage || placeholderImage,
        seller: listing.seller,
      }
    })

    // Get stats
    const [statsTotal, statsActive, statsBanned, statsSold] = await Promise.all([
      db.carListing.count(),
      db.carListing.count({ where: { status: 'active' } }),
      db.carListing.count({ where: { is_banned: true } }),
      db.carListing.count({ where: { status: 'sold' } }),
    ])

    return NextResponse.json({
      success: true,
      listings: transformedListings,
      total: count,
      limit,
      offset,
      stats: {
        total: statsTotal,
        active: statsActive,
        banned: statsBanned,
        sold: statsSold,
      },
    })
  } catch (error) {
    console.error('Error in admin listings API:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

// PUT - Update listing status (ban/unban)
export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const body = await request.json()
    const { listing_id, status, reason } = body

    if (!listing_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {
      status,
    }

    if (status === 'banned') {
      updateData.is_banned = true
      updateData.rejected_reason = reason
    } else if (status === 'active') {
      updateData.is_banned = false
      updateData.rejected_reason = null
    }

    const data = await db.carListing.update({
      where: { id: listing_id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: `Listing ${status} successfully`,
      listing: data,
    })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update listing status',
    }, { status: 500 })
  }
}

// DELETE - Delete listing permanently
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifyAdmin(request)
    if (!authResult.authorized) return authResult.error!

    const { searchParams } = new URL(request.url)
    const listing_id = searchParams.get('id')

    if (!listing_id) {
      return NextResponse.json({
        success: false,
        error: 'Listing ID required',
      }, { status: 400 })
    }

    // Soft delete
    await db.carListing.update({
      where: { id: listing_id },
      data: {
        deleted_at: new Date(),
        status: 'deleted',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete listing',
    }, { status: 500 })
  }
}
