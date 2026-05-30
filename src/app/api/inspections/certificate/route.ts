import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Get certificate info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const inspectionId = searchParams.get('inspection_id')
    const userId = searchParams.get('user_id')

    const where: any = {}
    if (inspectionId) where.inspection_id = inspectionId
    if (userId) where.user_id = userId

    const data = await db.certificatePurchase.findMany({
      where,
      include: {
        inspection: {
          select: {
            id: true,
            overall_grade: true,
            inspection_score: true,
            car_listing_id: true,
            listing: {
              select: {
                title: true,
                brand: { select: { name: true } },
                carModel: { select: { name: true } },
                year: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch certificates' },
      { status: 500 }
    )
  }
}

// POST - Purchase certificate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inspection_id, user_id, car_listing_id } = body

    // Get inspection details
    const inspection = await db.carInspection.findUnique({
      where: { id: inspection_id }
    })

    if (!inspection) {
      return NextResponse.json(
        { success: false, error: 'Inspection not found' },
        { status: 404 }
      )
    }

    if (inspection.has_certificate) {
      return NextResponse.json(
        { success: false, error: 'Inspection already has certificate' },
        { status: 400 }
      )
    }

    // Get certificate pricing
    const pricing = await db.inspectionPricing.findFirst({
      where: { type: 'certificate', is_active: true }
    })

    if (!pricing) {
      return NextResponse.json(
        { success: false, error: 'Certificate pricing not found' },
        { status: 404 }
      )
    }

    // Generate purchase and certificate numbers
    const purchaseNumber = `CERT-PURCHASE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
    const validityDays = pricing.certificate_validity_days || 90

    // Create certificate purchase record
    const purchase = await db.certificatePurchase.create({
      data: {
        purchase_number: purchaseNumber,
        inspection_id,
        user_id,
        price: pricing.price,
        car_listing_id,
        token_cost: pricing.token_cost,
        payment_status: (!pricing.token_cost || pricing.token_cost === 0) ? 'paid' : 'pending',
        paid_at: (!pricing.token_cost || pricing.token_cost === 0) ? new Date() : null,
        certificate_number,
        issued_at: (!pricing.token_cost || pricing.token_cost === 0) ? new Date() : null,
        expires_at: (!pricing.token_cost || pricing.token_cost === 0) 
          ? new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000) 
          : null
      }
    })

    // If free, update inspection immediately
    if (!pricing.token_cost || pricing.token_cost === 0) {
      await db.carInspection.update({
        where: { id: inspection_id },
        data: {
          has_certificate: true,
          certificate_issued_at: new Date(),
          certificate_number,
          certificate_url: `/certificates/${certificateNumber}`
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        purchase,
        token_required: pricing.token_cost,
        certificate_number,
        validity_days: validityDays
      }
    })
  } catch (error) {
    console.error('Error purchasing certificate:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to purchase certificate' },
      { status: 500 }
    )
  }
}

// PUT - Confirm payment (after token deduction)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { purchase_id, inspection_id } = body

    // Update purchase status
    const data = await db.certificatePurchase.update({
      where: { id: purchase_id },
      data: {
        payment_status: 'paid',
        paid_at: new Date(),
        issued_at: new Date(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    })

    // Update inspection
    await db.carInspection.update({
      where: { id: inspection_id },
      data: {
        has_certificate: true,
        certificate_issued_at: new Date(),
        certificate_number: data.certificate_number,
        certificate_url: `/certificates/${data.certificate_number}`
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error confirming certificate payment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    )
  }
}
