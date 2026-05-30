import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get user's listings with stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Get user_id (for development, use demo user if not provided)
    const userId = searchParams.get('user_id') || '143c26ae-8ba2-4735-b12d-86a1771a2178'

    // Pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Filter by status
    const status = searchParams.get('status')

    const where: Record<string, unknown> = { user_id: userId }
    if (status) {
      where.status = status
    }

    const [listings, count] = await Promise.all([
      db.carListing.findMany({
        where,
        select: {
          id: true,
          user_id: true,
          brand_id: true,
          model_id: true,
          variant_id: true,
          year: true,
          mileage: true,
          price_cash: true,
          price_credit: true,
          status: true,
          city: true,
          province: true,
          engine_capacity: true,
          seat_count: true,
          created_at: true,
          visibility: true,
          view_count: true,
          brand: { select: { id: true, name: true } },
          carModel: { select: { id: true, name: true } },
          images: {
            select: { car_listing_id: true, image_url: true, is_primary: true },
            where: { is_primary: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.carListing.count({ where }),
    ])

    // Transform listings with details
    const listingsWithDetails = listings.map(listing => {
      const brandName = listing.brand?.name || ''
      const modelName = listing.carModel?.name || ''
      const title = `${brandName} ${modelName} ${listing.year || ''}`.trim()

      return {
        ...listing,
        title,
        price: listing.price_cash || 0,
        primary_image: listing.images?.[0]?.image_url || null,
        brand_name: brandName,
        model_name: modelName,
        location_city: listing.city,
        location_province: listing.province,
      }
    })

    // Calculate stats
    const allListings = await db.carListing.findMany({
      where: { user_id: userId },
      select: { status: true },
    })

    const stats = {
      total: allListings.length,
      active: allListings.filter(l => l.status === 'active').length,
      pending: allListings.filter(l => l.status === 'pending').length,
      sold: allListings.filter(l => l.status === 'sold').length,
      draft: allListings.filter(l => l.status === 'draft').length,
      expired: allListings.filter(l => l.status === 'expired').length,
      totalViews: 0,
    }

    return NextResponse.json({
      success: true,
      data: listingsWithDetails,
      stats,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error('Error in user listings API:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user listings' },
      { status: 500 }
    )
  }
}

// PATCH - Update listing status (activate, deactivate, delete)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { listing_id, action, user_id } = body

    const userId = user_id || '143c26ae-8ba2-4735-b12d-86a1771a2178'

    if (!listing_id || !action) {
      return NextResponse.json(
        { success: false, error: 'Listing ID and action are required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const listing = await db.carListing.findUnique({
      where: { id: listing_id },
      select: { id: true, status: true, user_id: true },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    let updateData: Record<string, unknown> = {}
    let successMessage = ''

    switch (action) {
      case 'activate':
        updateData.status = 'active'
        successMessage = 'Listing activated successfully'
        break
      case 'deactivate':
        updateData.status = 'pending'
        successMessage = 'Listing deactivated successfully'
        break
      case 'delete':
        updateData.status = 'deleted'
        successMessage = 'Listing deleted successfully'
        break
      case 'mark_sold':
        updateData.status = 'sold'
        updateData.sold_at = new Date()
        successMessage = 'Listing marked as sold'
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    await db.carListing.update({
      where: { id: listing_id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: successMessage,
    })
  } catch (error) {
    console.error('Error in update listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update listing' },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete a listing
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listing_id')
    const userId = searchParams.get('user_id') || '143c26ae-8ba2-4735-b12d-86a1771a2178'

    if (!listingId) {
      return NextResponse.json(
        { success: false, error: 'Listing ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const listing = await db.carListing.findUnique({
      where: { id: listingId },
      select: { id: true, user_id: true },
    })

    if (!listing) {
      return NextResponse.json(
        { success: false, error: 'Listing not found' },
        { status: 404 }
      )
    }

    if (listing.user_id !== userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Soft delete
    await db.carListing.update({
      where: { id: listingId },
      data: { deleted_at: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: 'Listing deleted successfully',
    })
  } catch (error) {
    console.error('Error in delete listing:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete listing' },
      { status: 500 }
    )
  }
}
