import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
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

    let query = supabaseAdmin
      .from('dealer_offers')
      .select(`
        *,
        dealers:dealer_id (id, name, slug, logo_url, verified),
        car_listings:car_listing_id (
          id, listing_number, title, year, price_cash, mileage, city, province,
          brands:brand_id (name),
          car_models:model_id (name),
          car_images!car_images_car_listing_id_fkey (image_url, is_primary)
        ),
        profiles:user_id (id, name, phone, avatar_url)
      `, { count: 'exact' })

    // Filter by dealer or user
    if (dealerId) {
      query = query.eq('dealer_id', dealerId)
    }
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (listingId) {
      query = query.eq('car_listing_id', listingId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })
    query = query.range(offset, offset + limit - 1)

    const { data: offers, error, count } = await query

    if (error) throw error

    // Transform data
    const transformedOffers = offers?.map(offer => {
      const listing = offer.car_listings as any
      const primaryImage = listing?.car_images?.find((img: any) => img.is_primary)?.image_url || 
                          listing?.car_images?.[0]?.image_url

      return {
        ...offer,
        listing: {
          ...listing,
          brand_name: listing?.brands?.name,
          model_name: listing?.car_models?.name,
          primary_image_url: primaryImage
        },
        dealer: offer.dealers,
        user: offer.profiles
      }
    })

    return NextResponse.json({
      success: true,
      offers: transformedOffers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching offers:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
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
      pickup_location
    } = body

    // Get settings for offer duration
    const { data: settings } = await supabaseAdmin
      .from('dealer_marketplace_settings')
      .select('default_offer_duration_hours')
      .single()

    const durationHours = settings?.default_offer_duration_hours || 72
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    // Create offer
    const { data: offer, error } = await supabaseAdmin
      .from('dealer_offers')
      .insert({
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
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Create history
    await supabaseAdmin
      .from('dealer_offer_histories')
      .insert({
        offer_id: offer.id,
        action: 'created',
        new_price: offer_price,
        message: message,
        actor_id: dealer_id, // For now, using dealer_id as actor
        actor_type: 'dealer'
      })

    // Create notification for user
    await supabaseAdmin
      .from('notifications')
      .insert({
        user_id,
        type: 'dealer_offer',
        title: 'Penawaran Baru dari Dealer',
        message: `Anda mendapat penawaran Rp ${offer_price?.toLocaleString('id-ID')} untuk mobil Anda`,
        data: {
          offer_id: offer.id,
          listing_id: car_listing_id,
          dealer_id,
          offer_price
        }
      })

    return NextResponse.json({
      success: true,
      offer
    })
  } catch (error: any) {
    console.error('Error creating offer:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

// PUT - Update offer (respond, counter, withdraw)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { offer_id, action, ...updateData } = body

    // Get current offer
    const { data: currentOffer, error: fetchError } = await supabaseAdmin
      .from('dealer_offers')
      .select('*')
      .eq('id', offer_id)
      .single()

    if (fetchError) throw fetchError

    let updateFields: any = { updated_at: new Date().toISOString() }
    let historyAction = action
    let historyMessage = ''

    switch (action) {
      case 'view':
        updateFields.status = 'viewed'
        updateFields.viewed_at = new Date().toISOString()
        historyMessage = 'Penawaran dilihat'
        break

      case 'accept':
        updateFields.status = 'accepted'
        updateFields.accepted_at = new Date().toISOString()
        historyMessage = 'Penawaran diterima'
        // Update listing status
        await supabaseAdmin
          .from('car_listings')
          .update({ status: 'sold', sold_at: new Date().toISOString() })
          .eq('id', currentOffer.car_listing_id)
        // Auto-reject other pending offers for this listing
        // This will be done after the current offer is updated
        break

      case 'reject':
        updateFields.status = 'rejected'
        updateFields.rejected_at = new Date().toISOString()
        updateFields.rejection_reason = updateData.rejection_reason
        historyMessage = updateData.rejection_reason || 'Penawaran ditolak'
        break

      case 'counter':
        // Seller counters dealer's offer
        updateFields.status = 'negotiating'
        updateFields.counter_offer_price = updateData.counter_price
        updateFields.counter_offer_message = updateData.counter_message
        updateFields.counter_offer_by = updateData.counter_by || updateData.counter_offer_by
        updateFields.counter_offer_at = new Date().toISOString()
        historyMessage = updateData.counter_message || 'Counter offer dari seller'
        break

      case 'dealer_counter':
        // Dealer counters seller's counter offer (unlimited negotiation)
        updateFields.status = 'negotiating'
        updateFields.offer_price = updateData.offer_price
        // Clear previous counter since dealer is making new offer
        updateFields.counter_offer_price = null
        updateFields.counter_offer_message = updateData.message
        updateFields.counter_offer_by = null
        updateFields.counter_offer_at = null
        historyMessage = updateData.message || 'Counter offer dari dealer'
        break

      case 'withdraw':
        updateFields.status = 'withdrawn'
        updateFields.withdrawn_at = new Date().toISOString()
        historyMessage = 'Penawaran ditarik'
        break

      default:
        throw new Error('Invalid action')
    }

    // Update offer
    const { data: updatedOffer, error } = await supabaseAdmin
      .from('dealer_offers')
      .update(updateFields)
      .eq('id', offer_id)
      .select()
      .single()

    if (error) throw error

    // Create history - determine prices based on action type
    let newPriceForHistory = currentOffer.offer_price
    let previousPriceForHistory = currentOffer.offer_price
    
    if (action === 'counter') {
      // Seller countered - previous is dealer's offer, new is seller's counter
      previousPriceForHistory = currentOffer.offer_price
      newPriceForHistory = updateFields.counter_offer_price || currentOffer.offer_price
    } else if (action === 'dealer_counter') {
      // Dealer countered back - previous is seller's counter (if exists), new is dealer's new offer
      previousPriceForHistory = currentOffer.counter_offer_price || currentOffer.offer_price
      newPriceForHistory = updateFields.offer_price || currentOffer.offer_price
    }
    
    await supabaseAdmin
      .from('dealer_offer_histories')
      .insert({
        offer_id,
        action: historyAction === 'dealer_counter' ? 'counter_offered' : historyAction,
        previous_price: previousPriceForHistory,
        new_price: newPriceForHistory,
        message: historyMessage,
        actor_id: updateData.actor_id,
        actor_type: updateData.actor_type
      })

    // Create notification for the appropriate party
    let notifyUserId: string | null = null
    let notificationTitle = ''
    
    if (action === 'withdraw') {
      // Notify the seller/user that offer was withdrawn
      notifyUserId = currentOffer.user_id
      notificationTitle = 'Penawaran Ditarik'
    } else if (action === 'counter') {
      // Notify dealer that seller countered
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Counter Offer dari Seller'
    } else if (action === 'dealer_counter') {
      // Notify seller that dealer countered back
      notifyUserId = currentOffer.user_id
      notificationTitle = 'Counter Offer dari Dealer'
    } else if (action === 'accept') {
      // Notify dealer that offer was accepted
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Penawaran Diterima'
    } else if (action === 'reject') {
      // Notify dealer that offer was rejected
      notifyUserId = currentOffer.dealer_id
      notificationTitle = 'Penawaran Ditolak'
    }
    
    if (notifyUserId && action !== 'view') {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: notifyUserId,
          type: 'offer_update',
          title: notificationTitle,
          message: historyMessage,
          data: {
            offer_id,
            action,
            listing_id: currentOffer.car_listing_id,
            offer_price: updateFields.offer_price || currentOffer.offer_price,
            counter_price: updateFields.counter_offer_price
          }
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
      // The accepted offer is already updated, so it won't be rejected
    }

    return NextResponse.json({
      success: true,
      offer: updatedOffer,
      autoRejectResult: autoRejectResult || undefined
    })
  } catch (error: any) {
    console.error('Error updating offer:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
