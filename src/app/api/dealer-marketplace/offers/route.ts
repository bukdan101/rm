import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { autoRejectOffersForListing } from '@/lib/dealer-offer-service'

// GET - Get offers (for dealer or user)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const dealerId = searchParams.get('dealer_id')
    const userId = searchParams.get('user_id')
    const listingId = searchParams.get('listing_id')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (dealerId) where.dealer_id = dealerId
    if (userId) where.user_id = userId
    if (listingId) where.car_listing_id = listingId
    if (status) where.status = status

    const [offers, count] = await Promise.all([
      db.dealerOffer.findMany({
        where,
        include: {
          dealer: {
            select: { id: true, name: true, slug: true, logo_url: true, verified: true },
          },
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
              model: { select: { name: true } },
              images: {
                select: { image_url: true, is_primary: true },
                orderBy: { display_order: 'asc' },
              },
            },
          },
          user: {
            select: { id: true, full_name: true, phone: true, avatar_url: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      }),
      db.dealerOffer.count({ where }),
    ])

    // Transform data
    const transformedOffers = offers.map(offer => {
      const listing = offer.listing
      const primaryImage = listing?.images?.find(img => img.is_primary)?.image_url ||
        listing?.images?.[0]?.image_url

      return {
        ...offer,
        listing: {
          ...listing,
          brand_name: listing?.brand?.name,
          model_name: listing?.model?.name,
          primary_image_url: primaryImage,
        },
        user: offer.user
          ? {
              ...offer.user,
              name: offer.user.full_name || 'Unknown',
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      offers: transformedOffers,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error: unknown) {
    console.error('Error fetching offers:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST - Create new offer (from dealer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dealer_id,
      car_listing_id,
      user_id,
      offer_price,
      original_price,
      message,
      financing_available,
      financing_notes,
      inspection_included,
      pickup_service,
      pickup_location,
    } = body

    // Get settings for offer duration
    const settings = await db.dealerMarketplaceSettings.findFirst()
    const durationHours = settings?.default_offer_duration_hours || 72
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    // Create offer
    const offer = await db.dealerOffer.create({
      data: {
        dealer_id,
        car_listing_id,
        user_id,
        offer_price,
        original_price,
        message,
        financing_available: financing_available || false,
        financing_notes,
        inspection_included: inspection_included || false,
        pickup_service: pickup_service || false,
        pickup_location,
        status: 'pending',
        expires_at: expiresAt,
      },
    })

    // Create history
    await db.dealerOfferHistory.create({
      data: {
        offer_id: offer.id,
        action: 'created',
        new_price: offer_price,
        message: message,
        actor_id: dealer_id,
        actor_type: 'dealer',
      },
    })

    // Create notification for user
    if (user_id) {
      await db.notification.create({
        data: {
          user_id,
          type: 'dealer_offer',
          title: 'Penawaran Baru dari Dealer',
          message: `Anda mendapat penawaran Rp ${offer_price?.toLocaleString('id-ID')} untuk mobil Anda`,
          data: JSON.stringify({
            offer_id: offer.id,
            listing_id: car_listing_id,
            dealer_id,
            offer_price,
          }),
        },
      })
    }

    return NextResponse.json({
      success: true,
      offer,
    })
  } catch (error: unknown) {
    console.error('Error creating offer:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Update offer (respond, counter, withdraw)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { offer_id, action, ...updateData } = body

    // Get current offer
    const currentOffer = await db.dealerOffer.findUnique({
      where: { id: offer_id },
    })

    if (!currentOffer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    let updateFields: Record<string, unknown> = {}
    let historyAction = action
    let historyMessage = ''

    switch (action) {
      case 'view':
        updateFields.status = 'viewed'
        updateFields.viewed_at = new Date()
        historyMessage = 'Penawaran dilihat'
        break

      case 'accept':
        updateFields.status = 'accepted'
        updateFields.accepted_at = new Date()
        historyMessage = 'Penawaran diterima'
        // Update listing status
        await db.carListing.update({
          where: { id: currentOffer.car_listing_id },
          data: { status: 'sold', sold_at: new Date() },
        })
        break

      case 'reject':
        updateFields.status = 'rejected'
        updateFields.rejected_at = new Date()
        updateFields.rejection_reason = updateData.rejection_reason
        historyMessage = (updateData.rejection_reason as string) || 'Penawaran ditolak'
        break

      case 'counter':
        updateFields.status = 'negotiating'
        updateFields.counter_offer_price = updateData.counter_price
        updateFields.counter_offer_message = updateData.counter_message
        updateFields.counter_offer_by = updateData.counter_by || updateData.counter_offer_by
        updateFields.counter_offer_at = new Date()
        historyMessage = (updateData.counter_message as string) || 'Counter offer dari seller'
        break

      case 'dealer_counter':
        updateFields.status = 'negotiating'
        updateFields.offer_price = updateData.offer_price
        updateFields.counter_offer_price = null
        updateFields.counter_offer_message = updateData.message
        updateFields.counter_offer_by = null
        updateFields.counter_offer_at = null
        historyMessage = (updateData.message as string) || 'Counter offer dari dealer'
        break

      case 'withdraw':
        updateFields.status = 'withdrawn'
        updateFields.withdrawn_at = new Date()
        historyMessage = 'Penawaran ditarik'
        break

      default:
        throw new Error('Invalid action')
    }

    // Update offer
    const updatedOffer = await db.dealerOffer.update({
      where: { id: offer_id },
      data: updateFields,
    })

    // Create history
    let newPriceForHistory = currentOffer.offer_price
    let previousPriceForHistory = currentOffer.offer_price

    if (action === 'counter') {
      previousPriceForHistory = currentOffer.offer_price
      newPriceForHistory = (updateFields.counter_offer_price as number) || currentOffer.offer_price
    } else if (action === 'dealer_counter') {
      previousPriceForHistory = currentOffer.counter_offer_price || currentOffer.offer_price
      newPriceForHistory = (updateFields.offer_price as number) || currentOffer.offer_price
    }

    await db.dealerOfferHistory.create({
      data: {
        offer_id,
        action: historyAction === 'dealer_counter' ? 'counter_offered' : historyAction,
        previous_price: previousPriceForHistory as number | null,
        new_price: newPriceForHistory as number | null,
        message: historyMessage,
        actor_id: updateData.actor_id as string | null,
        actor_type: updateData.actor_type as string | null,
      },
    })

    // Create notification for the appropriate party
    let notifyUserId: string | null = null
    let notificationTitle = ''

    if (action === 'withdraw') {
      notifyUserId = currentOffer.user_id
      notificationTitle = 'Penawaran Ditarik'
    } else if (action === 'counter') {
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Counter Offer dari Seller'
    } else if (action === 'dealer_counter') {
      notifyUserId = currentOffer.user_id
      notificationTitle = 'Counter Offer dari Dealer'
    } else if (action === 'accept') {
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Penawaran Diterima'
    } else if (action === 'reject') {
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Penawaran Ditolak'
    }

    if (notifyUserId && action !== 'view') {
      await db.notification.create({
        data: {
          user_id: notifyUserId,
          type: 'offer_update',
          title: notificationTitle,
          message: historyMessage,
          data: JSON.stringify({
            offer_id,
            action,
            listing_id: currentOffer.car_listing_id,
            offer_price: updateFields.offer_price || currentOffer.offer_price,
            counter_price: updateFields.counter_offer_price,
          }),
        },
      })
    }

    // If offer was accepted, auto-reject all other pending offers for this listing
    let autoRejectResult = null
    if (action === 'accept') {
      autoRejectResult = await autoRejectOffersForListing(
        currentOffer.car_listing_id,
        'listing_sold',
        'Penawaran lain telah ditolak karena mobil sudah terjual'
      )
    }

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      autoRejectResult: autoRejectResult || undefined,
    })
  } catch (error: unknown) {
    console.error('Error updating offer:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
