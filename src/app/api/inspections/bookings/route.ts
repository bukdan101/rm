import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get inspection bookings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const inspectorId = searchParams.get('inspector_id')
    const status = searchParams.get('status')

    const where: any = {}
    if (userId) where.user_id = userId
    if (inspectorId) where.inspector_id = inspectorId
    if (status) where.status = status

    const data = await db.inspectionBooking.findMany({
      where,
      include: {
        carListing: {
          select: {
            id: true,
            title: true,
            brand_id: true,
            model_id: true,
            year: true,
            price_cash: true,
            brand: { select: { name: true } },
            model: { select: { name: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

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

    // Generate booking number
    const bookingNumber = `INS-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Get pricing info
    const pricing = await db.inspectionPricing.findUnique({
      where: { id: body.pricing_id }
    })

    if (!pricing) {
      return NextResponse.json(
        { success: false, error: 'Pricing not found' },
        { status: 404 }
      )
    }

    const data = await db.inspectionBooking.create({
      data: {
        booking_number: bookingNumber,
        car_listing_id: body.car_listing_id,
        user_id: body.user_id,
        pricing_id: body.pricing_id,
        inspection_type: pricing.type,
        token_cost: pricing.token_cost,
        scheduled_date: body.scheduled_date ? new Date(body.scheduled_date) : null,
        location_address: body.location_address,
        location_lat: body.location_lat,
        location_lng: body.location_lng,
        notes: body.notes || body.user_notes,
        status: pricing.type === 'professional' ? 'pending' : 'in_progress',
        payment_status: (pricing.token_cost === 0 || !pricing.token_cost) ? 'paid' : 'pending'
      }
    })

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

    const updateData: any = {}

    if (body.status) updateData.status = body.status
    if (body.inspector_id) updateData.inspector_id = body.inspector_id
    if (body.scheduled_date) updateData.scheduled_date = new Date(body.scheduled_date)
    if (body.payment_status) updateData.payment_status = body.payment_status
    if (body.paid_at) updateData.paid_at = new Date(body.paid_at)
    if (body.notes) updateData.notes = body.notes
    if (body.cancellation_reason) {
      updateData.cancellation_reason = body.cancellation_reason
      updateData.cancelled_at = new Date()
    }

    const data = await db.inspectionBooking.update({
      where: { id: body.id },
      data: updateData
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating inspection booking:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update inspection booking' },
      { status: 500 }
    )
  }
}
