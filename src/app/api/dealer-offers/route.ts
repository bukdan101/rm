import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET - Get dealer offers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const sellerId = searchParams.get('seller_id')
    const dealerId = searchParams.get('dealer_id')
    const status = searchParams.get('status')
    const predictionId = searchParams.get('prediction_id')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    
    if (id) {
      // Get single offer with full details
      const { data, error } = await supabase
        .from('dealer_offers')
        .select(`
          *,
          seller:profiles!dealer_offers_seller_id_fkey(id, name, phone, email),
          dealer:dealers(id, name, slug, logo_url, rating, phone, email, address)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, data })
    }
    
    // List offers
    let query = supabase
      .from('dealer_offers')
      .select(`
        *,
        seller:profiles!dealer_offers_seller_id_fkey(id, name, phone),
        dealer:dealers(id, name, slug, logo_url, rating)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (sellerId) query = query.eq('seller_id', sellerId)
    if (dealerId) query = query.eq('dealer_id', dealerId)
    if (status) query = query.eq('status', status)
    if (predictionId) query = query.eq('prediction_id', predictionId)
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit,
        offset
      }
    })
  } catch (error) {
    console.error('Error fetching dealer offers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dealer offers' },
      { status: 500 }
    )
  }
}

// POST - Create new dealer offer (Sell to Dealer)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prediction_id,
      listing_id,
      seller_id,
      seller_type,
      dealer_ids, // Array of dealer IDs to send offer to
      seller_ask_price,
      seller_notes,
      
      // Vehicle summary (if no prediction)
      vehicle_title,
      vehicle_year,
      vehicle_brand,
      vehicle_model,
      vehicle_variant,
      vehicle_mileage,
      
      // AI prediction data (from prediction)
      ai_predicted_price_low,
      ai_predicted_price_high,
      ai_predicted_price_recommended,
      ai_confidence
    } = body
    
    // Validate
    if (!seller_id) {
      return NextResponse.json(
        { success: false, error: 'Seller ID is required' },
        { status: 400 }
      )
    }
    
    if (!dealer_ids || dealer_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one dealer must be selected' },
        { status: 400 }
      )
    }
    
    // Get prediction data if available
    let predictionData = null
    if (prediction_id) {
      const { data: pred } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('id', prediction_id)
        .single()
      predictionData = pred
    }
    
    // Get active fee setting
    const { data: feeSetting } = await supabase
      .from('dealer_offer_settings')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const feePercentage = feeSetting?.fee_percentage || 5
    
    // Create offers for each dealer
    const offers = []
    
    for (const dealerId of dealer_ids) {
      // Check if dealer is active and handles this brand
      const { data: dealer } = await supabase
        .from('dealers')
        .select('id, name, is_active')
        .eq('id', dealerId)
        .single()
      
      if (!dealer || !dealer.is_active) continue
      
      // Create offer
      const { data: offer, error: offerError } = await supabase
        .from('dealer_offers')
        .insert({
          prediction_id,
          listing_id,
          seller_id,
          seller_type: seller_type || 'user',
          dealer_id: dealerId,
          vehicle_title: vehicle_title || `${predictionData?.year || vehicle_year} ${predictionData?.brands?.name || vehicle_brand} ${predictionData?.models?.name || vehicle_model}`,
          vehicle_year: predictionData?.year || vehicle_year,
          vehicle_brand: predictionData?.brands?.name || vehicle_brand,
          vehicle_model: predictionData?.models?.name || vehicle_model,
          vehicle_variant: predictionData?.variants?.name || vehicle_variant,
          vehicle_mileage: predictionData?.mileage || vehicle_mileage,
          ai_predicted_price_low: predictionData?.predicted_price_low || ai_predicted_price_low,
          ai_predicted_price_high: predictionData?.predicted_price_high || ai_predicted_price_high,
          ai_predicted_price_recommended: predictionData?.predicted_price_recommended || ai_predicted_price_recommended,
          ai_confidence: predictionData?.prediction_confidence || ai_confidence,
          seller_ask_price,
          seller_notes,
          fee_setting_id: feeSetting?.id,
          fee_percentage: feePercentage,
          status: 'pending',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single()
      
      if (offerError) {
        console.error('Error creating offer:', offerError)
        continue
      }
      
      offers.push(offer)
      
      // TODO: Send notification to dealer (push notification / email / in-app)
    }
    
    return NextResponse.json({
      success: true,
      data: offers,
      message: `Offers sent to ${offers.length} dealers`
    })
  } catch (error) {
    console.error('Error creating dealer offers:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create dealer offers' },
      { status: 500 }
    )
  }
}

// PUT - Update offer (dealer response, counter offer, accept/reject)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      action, // 'dealer_respond', 'counter', 'accept', 'reject', 'cancel', 'request_inspection'
      
      // For dealer response
      dealer_offer_price,
      dealer_notes,
      dealer_valid_until,
      
      // For counter offer
      counter_price,
      counter_by, // 'seller' or 'dealer'
      
      // For rejection
      rejection_reason,
      
      // For inspection request
      inspection_location,
      inspection_scheduled_at
    } = body
    
    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: 'Offer ID and action are required' },
        { status: 400 }
      )
    }
    
    // Get current offer
    const { data: currentOffer, error: fetchError } = await supabase
      .from('dealer_offers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (fetchError) throw fetchError
    
    let updateData: any = { updated_at: new Date().toISOString() }
    
    switch (action) {
      case 'dealer_respond':
        // Dealer makes initial offer
        updateData = {
          ...updateData,
          dealer_offer_price,
          dealer_notes,
          dealer_valid_until,
          status: 'viewed',
          fee_amount: dealer_offer_price ? Math.round(dealer_offer_price * (currentOffer.fee_percentage / 100)) : null,
          seller_receives: dealer_offer_price ? dealer_offer_price - Math.round(dealer_offer_price * (currentOffer.fee_percentage / 100)) : null
        }
        break
        
      case 'counter':
        // Counter offer from either party
        const counterHistory = currentOffer.counter_history || []
        counterHistory.push({
          by: counter_by,
          price: counter_price,
          at: new Date().toISOString()
        })
        
        updateData = {
          ...updateData,
          has_counter_offer: true,
          counter_offer_count: (currentOffer.counter_offer_count || 0) + 1,
          last_counter_price: counter_price,
          last_counter_by: counter_by,
          counter_history: counterHistory,
          status: 'negotiating',
          // Update seller ask or dealer offer depending on who countered
          ...(counter_by === 'seller' ? { seller_ask_price: counter_price } : { dealer_offer_price: counter_price })
        }
        break
        
      case 'accept':
        // Accept the offer
        const acceptedPrice = currentOffer.dealer_offer_price || currentOffer.seller_ask_price
        updateData = {
          ...updateData,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
          accepted_price: acceptedPrice,
          fee_amount: acceptedPrice ? Math.round(acceptedPrice * (currentOffer.fee_percentage / 100)) : null,
          seller_receives: acceptedPrice ? acceptedPrice - Math.round(acceptedPrice * (currentOffer.fee_percentage / 100)) : null
        }
        break
        
      case 'reject':
        updateData = {
          ...updateData,
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason
        }
        break
        
      case 'cancel':
        updateData = {
          ...updateData,
          status: 'cancelled',
          rejected_at: new Date().toISOString(),
          rejection_reason: 'Cancelled by user'
        }
        break
        
      case 'request_inspection':
        updateData = {
          ...updateData,
          status: 'inspection_requested',
          inspection_requested: true,
          inspection_location,
          inspection_scheduled_at
        }
        break
        
      case 'schedule_inspection':
        updateData = {
          ...updateData,
          status: 'inspection_scheduled',
          inspection_scheduled_at
        }
        break
        
      case 'complete_inspection':
        updateData = {
          ...updateData,
          status: 'inspection_completed',
          inspection_completed: true,
          inspection_id_ref: body.inspection_id
        }
        break
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    const { data: updatedOffer, error: updateError } = await supabase
      .from('dealer_offers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (updateError) throw updateError
    
    return NextResponse.json({
      success: true,
      data: updatedOffer
    })
  } catch (error) {
    console.error('Error updating dealer offer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update dealer offer' },
      { status: 500 }
    )
  }
}

// DELETE - Delete/cancel an offer
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Offer ID is required' },
        { status: 400 }
      )
    }
    
    // Check if offer can be cancelled
    const { data: offer } = await supabase
      .from('dealer_offers')
      .select('status')
      .eq('id', id)
      .single()
    
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }
    
    if (offer.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel an accepted offer' },
        { status: 400 }
      )
    }
    
    // Update status to cancelled instead of deleting
    const { error } = await supabase
      .from('dealer_offers')
      .update({
        status: 'cancelled',
        rejected_at: new Date().toISOString(),
        rejection_reason: 'Cancelled by user'
      })
      .eq('id', id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: 'Offer cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling dealer offer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to cancel dealer offer' },
      { status: 500 }
    )
  }
}
