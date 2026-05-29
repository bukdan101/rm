import { NextRequest, NextResponse } from 'next/server'
import { supabase, getSupabaseAdmin } from '@/lib/supabase'

// GET - Get inspection bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const inspectorId = searchParams.get('inspector_id')
    const status = searchParams.get('status')

    let query = supabase
      .from('inspection_bookings')
      .select(`
        *,
        pricing:inspection_pricing(*),
        car_listing:car_listings(
          id,
          title,
          brand_id,
          model_id,
          year,
          price,
          brands(name),
          car_models(name)
        )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (inspectorId) {
      query = query.eq('inspector_id', inspectorId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching inspection bookings:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inspection bookings' },
      { status: 500 }
    )
  }
}

// POST - Create new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    // Generate booking number
    const bookingNumber = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Get pricing info
    const { data: pricing, error: pricingError } = await supabase
      .from('inspection_pricing')
      .select('*')
      .eq('id', body.pricing_id)
      .single()

    if (pricingError) throw pricingError

    const { data, error } = await adminClient
      .from('inspection_bookings')
      .insert({
        booking_number: bookingNumber,
        car_listing_id: body.car_listing_id,
        user_id: body.user_id,
        pricing_id: body.pricing_id,
        inspection_type: pricing.type,
        token_cost: pricing.token_cost,
        scheduled_date: body.scheduled_date,
        location_address: body.location_address,
        location_lat: body.location_lat,
        location_lng: body.location_lng,
        location_notes: body.location_notes,
        user_notes: body.user_notes,
        status: pricing.type === 'professional' ? 'pending' : 'in_progress',
        payment_status: pricing.token_cost === 0 ? 'paid' : 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating inspection booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create inspection booking' },
      { status: 500 }
    )
  }
}

// PUT - Update booking status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const adminClient = getSupabaseAdmin()

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (body.status) updateData.status = body.status
    if (body.inspector_id) updateData.inspector_id = body.inspector_id
    if (body.scheduled_date) updateData.scheduled_date = body.scheduled_date
    if (body.payment_status) updateData.payment_status = body.payment_status
    if (body.paid_at) updateData.paid_at = body.paid_at
    if (body.inspector_notes) updateData.inspector_notes = body.inspector_notes
    if (body.cancellation_reason) {
      updateData.cancellation_reason = body.cancellation_reason
      updateData.cancelled_at = new Date().toISOString()
    }

    const { data, error } = await adminClient
      .from('inspection_bookings')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating inspection booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inspection booking' },
      { status: 500 }
    )
  }
}
