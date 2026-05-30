import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { errorResponse } from '@/lib/api-utils'

// GET - Get dealer offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const userId = searchParams.get('user_id')
    const dealerId = searchParams.get('dealer_id')
    const listingId = searchParams.get('car_listing_id')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (id) {
      // Get single offer with full details
      const data = await db.dealerOffer.findUnique({
        where: { id },
        include: {
          dealer: { select: { id: true, name: true, slug: true, logo_url: true, rating: true, phone: true, email: true, address: true } },
          listing: {
            include: {
              seller: { select: { id: true, full_name: true, phone: true, email: true } }
            }
          }
        }
      })
      
      return NextResponse.json({ success: true, data })
    }
    
    // List offers
    const where: any = {}
    if (userId) where.user_id = userId
    if (dealerId) where.dealer_id = dealerId
    if (listingId) where.car_listing_id = listingId
    if (status) where.status = status

    const [data, count] = await Promise.all([
      db.dealerOffer.findMany({
        where,
        include: {
          dealer: { select: { id: true, name: true, slug: true, logo_url: true, rating: true } },
          listing: {
            include: {
              seller: { select: { id: true, full_name: true, phone: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      db.dealerOffer.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error fetching dealer offers:', error)
    return errorResponse('Failed to fetch dealer offers', 500)
  }
}

// POST - Create new dealer offer (Sell to Dealer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      car_listing_id,
      user_id,
      dealer_id,
      offer_price,
      original_price,
      message,
      financing_available,
      financing_notes,
      inspection_included,
      pickup_service,
      pickup_location
    } = body
    
    // Validate
    if (!dealer_id) {
      return errorResponse('Dealer ID is required', 400)
    }
    
    if (!car_listing_id) {
      return errorResponse('Car listing ID is required', 400)
    }

    // Check listing exists
    const listing = await db.carListing.findUnique({
      where: { id: car_listing_id }
    })

    if (!listing) {
      return errorResponse('Listing not found', 404)
    }

    // Get default offer duration from settings
    const settings = await db.dealerMarketplaceSettings.findFirst({
      where: { is_active: true }
    })
    const durationHours = settings?.default_offer_duration_hours || 72

    // Create offer
    const offer = await db.dealerOffer.create({
      data: {
        dealer_id,
        car_listing_id,
        user_id: user_id || listing.user_id,
        offer_price: offer_price || null,
        original_price: original_price || listing.price_cash || null,
        message: message || null,
        financing_available: financing_available || false,
        financing_notes: financing_notes || null,
        inspection_included: inspection_included || false,
        pickup_service: pickup_service || false,
        pickup_location: pickup_location || null,
        status: 'pending',
        expires_at: new Date(Date.now() + durationHours * 60 * 60 * 1000)
      }
    })
    
    return NextResponse.json({
      success: true,
      data: offer,
      message: 'Offer created successfully'
    })
  } catch (error) {
    console.error('Error creating dealer offers:', error)
    return errorResponse('Failed to create dealer offers', 500)
  }
}

// PATCH - Update offer (dealer response, counter offer, accept/reject)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      action, // 'counter', 'accept', 'reject', 'withdraw'
      
      // For counter offer
      counter_offer_price,
      counter_offer_message,
      counter_offer_by,
      
      // For rejection
      rejection_reason
    } = body
    
    if (!id || !action) {
      return errorResponse('Offer ID and action are required', 400)
    }
    
    // Get current offer
    const currentOffer = await db.dealerOffer.findUnique({
      where: { id }
    })
    
    if (!currentOffer) {
      return errorResponse('Offer not found', 404)
    }
    
    let updateData: any = {}
    
    switch (action) {
      case 'counter':
        // Counter offer from either party
        updateData = {
          counter_offer_price,
          counter_offer_message,
          counter_offer_by,
          counter_offer_at: new Date(),
          status: 'negotiating'
        }
        break
        
      case 'accept':
        // Accept the offer
        updateData = {
          status: 'accepted',
          accepted_at: new Date()
        }
        break
        
      case 'reject':
        updateData = {
          status: 'rejected',
          rejected_at: new Date(),
          rejection_reason
        }
        break
        
      case 'withdraw':
        updateData = {
          status: 'withdrawn',
          withdrawn_at: new Date()
        }
        break
        
      case 'view':
        updateData = {
          viewed_at: new Date(),
          status: currentOffer.status === 'pending' ? 'viewed' : currentOffer.status
        }
        break
        
      default:
        return errorResponse('Invalid action', 400)
    }
    
    const updatedOffer = await db.dealerOffer.update({
      where: { id },
      data: updateData
    })
    
    // Create history entry
    await db.dealerOfferHistory.create({
      data: {
        offer_id: id,
        action,
        previous_price: currentOffer.offer_price,
        new_price: action === 'counter' ? counter_offer_price : currentOffer.offer_price,
        message: action === 'reject' ? rejection_reason : action === 'counter' ? counter_offer_message : null,
        actor_type: counter_offer_by || 'user'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: updatedOffer
    })
  } catch (error) {
    console.error('Error updating dealer offer:', error)
    return errorResponse('Failed to update dealer offer', 500)
  }
}

// DELETE - Delete/withdraw an offer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return errorResponse('Offer ID is required', 400)
    }
    
    // Check if offer can be cancelled
    const offer = await db.dealerOffer.findUnique({
      where: { id }
    })
    
    if (!offer) {
      return errorResponse('Offer not found', 404)
    }
    
    if (offer.status === 'accepted') {
      return errorResponse('Cannot cancel an accepted offer', 400)
    }
    
    // Update status to withdrawn instead of deleting
    await db.dealerOffer.update({
      where: { id },
      data: {
        status: 'withdrawn',
        withdrawn_at: new Date(),
        rejection_reason: 'Cancelled by user'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Offer cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling dealer offer:', error)
    return errorResponse('Failed to cancel dealer offer', 500)
  }
}
